/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/tooltip/TooltipEnablement",
	"sap/ui/core/tooltip/TooltipManager",
	"sap/ui/core/tooltip/Tooltip",
	"./FakeControls",
	"sap/ui/core/RenderManager",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/Device"
], function(TooltipEnablement, TooltipManager, Tooltip, FakeControls, RenderManager, nextUIUpdate, Device) {
	"use strict";

	const { PlainHost, MultiTargetEnablementHost } = FakeControls;

	// TooltipManager's open-tooltip registry is module-global; reset it per test.
	QUnit.testDone(function() {
		TooltipManager._getRegistry().clear();
	});

	// Renders a single call into a detached element and returns the resulting HTML.
	function renderToString(fnRender) {
		const oRm = new RenderManager().getInterface();
		const oTarget = document.createElement("div");
		fnRender(oRm);
		oRm.flush(oTarget);
		oRm.destroy();
		return oTarget.innerHTML;
	}

	// Renders the host through the normal UI5 lifecycle so listeners attach via the public onAfterRendering delegate.
	async function renderHost(oHost, oClock) {
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(oClock);
	}

	async function waitForOpen(oClock, oEnablement) {
		if (oEnablement.isOpen()) {
			return true;
		}

		const pOpen = new Promise((fnResolve) => {
			function fnAfterOpen() {
				oEnablement.detachAfterOpen(fnAfterOpen);
				fnResolve(true);
			}
			oEnablement.attachAfterOpen(fnAfterOpen);
		});

		await nextUIUpdate(oClock);
		await oClock.tickAsync(1000);

		return pOpen;
	}

	async function waitForOpenState(oClock, oEnablement) {
		const fnSpy = sinon.spy(Tooltip.prototype, "openBy");
		try {
			await oClock.tickAsync(2000);
			return fnSpy.notCalled ? "NotOpened" : "Opened";
		} finally {
			fnSpy.restore();
		}
	}

	async function waitForClose(oClock, oEnablement) {
		if (!oEnablement.isOpen()) {
			return true;
		}

		const pClose = new Promise((fnResolve) => {
			function fnAfterClose() {
				oEnablement.detachAfterClose(fnAfterClose);
				fnResolve(true);
			}
			oEnablement.attachAfterClose(fnAfterClose);
		});

		await nextUIUpdate(oClock);
		await oClock.tickAsync(1000);

		return pClose;
	}

	// Drains microtasks and pending fake timers so async paths settle.
	async function flushMicrotasks(oClock) {
		await oClock.tickAsync(0);
	}

	// Closes an open tooltip and waits for the close to settle, without asserting.
	async function closeAndWaitSilent(oClock, oEnablement) {
		if (!oEnablement.isOpen()) {
			return;
		}
		oEnablement.close();
		await waitForClose(oClock, oEnablement);
	}

	// ---- DOM event helpers -------------------------------------------------

	async function setupHostWithDevice(o) {
		o.oHost = new PlainHost({ id: "host-evt-" + Date.now() });
		o.oEnablement = new TooltipEnablement(o.oHost, {
			textProvider: () => "hi"
		});
		await renderHost(o.oHost, o.clock);
	}

	async function teardownHost(o) {
		o.oEnablement.destroy();
		o.oHost.destroy();
		o.oDeviceStub.restore();
		// Drain leftover timers before the clock is restored so no timer leaks across the boundary.
		await o.clock.tickAsync(2000);
	}

	function dispatch(oHost, oEvent) {
		oHost.getDomRef().dispatchEvent(oEvent);
	}

	QUnit.module("Construction", {
		beforeEach: function() {
			this.oHost = new PlainHost({ id: "host-btn" });
		},
		afterEach: function() {
			this.oHost.destroy();
		}
	});

	QUnit.test("default config: no tooltip text, touch enabled, not open", function(assert) {
		const oEnablement = new TooltipEnablement(this.oHost);
		assert.strictEqual(oEnablement.getEnableForTouchDevices(), true,
			"enableForTouchDevices defaults to true");
		assert.strictEqual(oEnablement.isOpen(), false, "not open");
		assert.strictEqual(oEnablement.getInvisibleTooltipId(), null,
			"no invisible anchor id when no textProvider was given");
		oEnablement.destroy();
	});

	QUnit.test("constructor honours enableForTouchDevices=false", function(assert) {
		const oEnablement = new TooltipEnablement(this.oHost, {
			textProvider: () => "x",
			enableForTouchDevices: false
		});
		assert.strictEqual(oEnablement.getEnableForTouchDevices(), false);
		oEnablement.destroy();
	});

	QUnit.test("constructor wires the textProvider (used by getInvisibleTooltipId)", function(assert) {
		const fnText = sinon.stub().returns("hello");
		const oEnablement = new TooltipEnablement(this.oHost, { textProvider: fnText });
		assert.strictEqual(oEnablement.getInvisibleTooltipId(), "host-btn-invisibleTooltip",
			"invisible id derived from host id when textProvider yields non-empty text");
		assert.ok(fnText.called, "textProvider was invoked to resolve the text");
		oEnablement.destroy();
	});

	QUnit.test("constructor wires the invisibleTextProvider (wins over textProvider)", function(assert) {
		const fnVisible = sinon.stub().returns("visible");
		const fnInvisible = sinon.stub().returns("invisible");
		const oEnablement = new TooltipEnablement(this.oHost, {
			textProvider: fnVisible,
			invisibleTextProvider: fnInvisible
		});
		const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
		assert.ok(sHtml.includes(">invisible<"),
			"invisibleTextProvider used for the anchor text");
		assert.ok(fnInvisible.called, "invisibleTextProvider was invoked");
		oEnablement.destroy();
	});

	QUnit.test("constructor throws when host is not a Control", function(assert) {
		assert.throws(function() {
			return new TooltipEnablement({});
		}, /sap\.ui\.core\.Control/);
	});

	QUnit.test("default textProvider resolves the host's tooltip via getTooltip_AsString", function(assert) {
		this.oHost.setTooltip("host tip");
		const oEnablement = new TooltipEnablement(this.oHost);
		assert.strictEqual(oEnablement.getInvisibleTooltipId(), "host-btn-invisibleTooltip",
			"non-null id when host tooltip is set and default provider is used");
		const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
		assert.ok(sHtml.includes(">host tip<"), "rendered span contains the host tooltip text");
		oEnablement.destroy();
	});

	QUnit.test("default textProvider yields empty when host has no tooltip set", function(assert) {
		const oEnablement = new TooltipEnablement(this.oHost);
		assert.strictEqual(oEnablement.getInvisibleTooltipId(), null,
			"null id when host has no tooltip and default provider returns empty string");
		const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
		assert.strictEqual(sHtml, "", "no span emitted when default provider yields empty string");
		oEnablement.destroy();
	});

	QUnit.test("explicit textProvider still wins over the host tooltip default", function(assert) {
		this.oHost.setTooltip("host tip");
		const oEnablement = new TooltipEnablement(this.oHost, { textProvider: () => "explicit" });
		const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
		assert.ok(sHtml.includes(">explicit<"), "explicit textProvider used");
		assert.notOk(sHtml.includes(">host tip<"), "host tooltip ignored when explicit provider given");
		oEnablement.destroy();
	});

	QUnit.module("Setters", {
		beforeEach: function() {
			this.oHost = new PlainHost({ id: "host-btn" });
			this.oEnablement = new TooltipEnablement(this.oHost);
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("setEnableForTouchDevices / getEnableForTouchDevices round-trip", function(assert) {
		assert.strictEqual(this.oEnablement.setEnableForTouchDevices(false), this.oEnablement, "chainable");
		assert.strictEqual(this.oEnablement.getEnableForTouchDevices(), false);
		this.oEnablement.setEnableForTouchDevices(true);
		assert.strictEqual(this.oEnablement.getEnableForTouchDevices(), true);
	});

	QUnit.module("renderInvisibleTooltip", {
		beforeEach: function() {
			this.oHost = new PlainHost({ id: "host-btn" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hello"
			});
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("emits a span with derived id, role=tooltip, and resolved text", function(assert) {
		const sHtml = renderToString((oRm) => this.oEnablement.renderInvisibleTooltip(oRm));
		assert.ok(sHtml.includes('id="host-btn-invisibleTooltip"'), "id derived from host id");
		assert.ok(sHtml.includes('role="tooltip"'), "role=tooltip");
		assert.ok(sHtml.includes("sapUiInvisibleText"), "class applied");
		assert.ok(sHtml.includes(">hello<"), "resolved text written inline");
		assert.strictEqual(this.oEnablement.getInvisibleTooltipId(), "host-btn-invisibleTooltip",
			"getInvisibleTooltipId matches the rendered id");
	});

	QUnit.test("re-resolves text from the textProvider on every render", function(assert) {
		let sText = "first";
		const oHost = new PlainHost({ id: "host-btn-rerender" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => sText
		});
		try {
			const sHtml1 = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml1.includes(">first<"), "first text rendered");
			sText = "second";
			const sHtml2 = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml2.includes(">second<"), "updated text rendered");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("invisibleTextProvider wins over textProvider", function(assert) {
		const oHost = new PlainHost({ id: "host-btn-invis" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "visible",
			invisibleTextProvider: () => "invisible"
		});
		try {
			const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml.includes(">invisible<"), "invisible provider used");
			assert.notOk(sHtml.includes(">visible<"), "visible provider ignored");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("invisibleTextProvider falls back to visible text when not set", function(assert) {
		const oHost = new PlainHost({ id: "host-btn-fallback" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "visible"
		});
		try {
			const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.ok(sHtml.includes(">visible<"),
				"falls back to textProvider when no invisibleTextProvider");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("renders nothing when there is no text", function(assert) {
		const oHost = new PlainHost({ id: "host-btn-empty" });
		const oEnablement = new TooltipEnablement(oHost);
		try {
			const sHtml = renderToString((oRm) => oEnablement.renderInvisibleTooltip(oRm));
			assert.strictEqual(sHtml, "", "no span emitted when text is empty");
			assert.strictEqual(oEnablement.getInvisibleTooltipId(), null,
				"getInvisibleTooltipId reports null when text is empty");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.module("DOM events - desktop", {
		beforeEach: async function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("mousedown closes an open tooltip", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open before mousedown");
		dispatch(this.oHost, new MouseEvent("mousedown", { button: 0, bubbles: true }));
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after mousedown");
	});

	QUnit.test("mouseover is ignored while text is selected", async function(assert) {
		const oOrig = window.getSelection;
		window.getSelection = function() {
			return { toString: function() { return "selected text"; } };
		};
		try {
			dispatch(this.oHost, new MouseEvent("mouseover", { bubbles: true }));
			const sState = await waitForOpenState(this.clock, this.oEnablement);
			assert.strictEqual(sState, "NotOpened", "afterOpen does not fire while a selection exists");
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseout closes an open tooltip", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open before mouseout");
		dispatch(this.oHost, new MouseEvent("mouseout", { bubbles: true }));

		await waitForClose(this.clock, this.oEnablement);
		assert.ok(true, "afterClose fires after mouseout");
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after mouseout");
	});

	QUnit.test("mouseover opens the tooltip", async function(assert) {
		dispatch(this.oHost, new MouseEvent("mouseover", { bubbles: true }));
		await waitForOpen(this.clock, this.oEnablement);
		assert.ok(true, "afterOpen fires after mouseover");
	});

	QUnit.test("textProvider is called by the mouseover interaction, not only by rendering", async function(assert) {
		const oHost = new PlainHost({ id: "host-tp-" + Date.now() });
		const fnText = sinon.spy(() => "hi");
		const oEnablement = new TooltipEnablement(oHost, { textProvider: fnText });
		try {
			await renderHost(oHost, this.clock);
			// Exclude the render path (renderInvisibleTooltip) from the assertion.
			fnText.resetHistory();
			assert.notOk(fnText.called, "textProvider not consulted before the interaction");
			dispatch(oHost, new MouseEvent("mouseover", { bubbles: true }));
			assert.ok(fnText.called, "textProvider consulted by the mouseover interaction");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("focusin opens when :focus-visible matches", async function(assert) {
		const oDomRef = this.oHost.getDomRef();
		const oOrig = oDomRef.matches;
		oDomRef.matches = function(s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			// Leave initial focus first; focusin is suppressed until a key is pressed.
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			dispatch(this.oHost, new FocusEvent("focusin", { bubbles: true }));
			await waitForOpen(this.clock, this.oEnablement);
			assert.ok(true, "afterOpen fires on keyboard focus");
		} finally {
			oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusin does not open without :focus-visible (e.g. mouse focus)", async function(assert) {
		const oDomRef = this.oHost.getDomRef();
		const oOrig = oDomRef.matches;
		oDomRef.matches = function(s) {
			return s === ":focus-visible" ? false : oOrig.call(this, s);
		};
		try {
			// Leave initial focus so the :focus-visible gate is what suppresses the open.
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			dispatch(this.oHost, new FocusEvent("focusin", { bubbles: true }));
			const sState = await waitForOpenState(this.clock, this.oEnablement);
			assert.strictEqual(sState, "NotOpened", "afterOpen does not fire on programmatic focus");
		} finally {
			oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusout closes an open tooltip", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		dispatch(this.oHost, new FocusEvent("focusout", { bubbles: true }));
		await waitForClose(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after focusout");
	});

	QUnit.test("Escape is a no-op when nothing is open or pending (does not swallow)", function(assert) {
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oHost, oEvent);
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open");
		assert.notOk(oEvent.defaultPrevented,
			"preventDefault not called - Escape stays available to ancestors");
	});

	QUnit.test("Escape closes an open tooltip and prevents default", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented,
			"preventDefault called - Escape consumed while a tooltip is open");
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after Escape");
	});

	QUnit.test("Escape during the open-delay window cancels the pending open and is consumed", async function(assert) {
		// open() returns synchronously and starts the Tooltip's own hover-delay
		// timer (Tooltip.prototype.openBy). isPendingOrOpen() returns true while
		// the timer runs, but the popover is not on screen yet.
		this.oEnablement.open();
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"not yet open — inside the hover-delay window");

		// Escape on the host must be consumed by the tooltip (not fall through to
		// an enclosing Dialog) and must cancel the pending open.
		const oEvent = new KeyboardEvent("keydown", {
			key: "Escape", cancelable: true, bubbles: true
		});
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented,
			"preventDefault called - Escape consumed while an open is pending");

		const sState = await waitForOpenState(this.clock, this.oEnablement);
		assert.strictEqual(sState, "NotOpened",
			"afterOpen does not fire — the pending open was cancelled");
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open");
	});

	QUnit.test("Enter closes an open tooltip (keyboard activation)", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		dispatch(this.oHost, new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed on Enter, like a mouse click");
	});

	QUnit.test("Space closes an open tooltip (keyboard activation)", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		dispatch(this.oHost, new KeyboardEvent("keydown", { key: " ", bubbles: true }));
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed on Space, like a mouse click");
	});

	QUnit.test("unrelated keydown does nothing", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		dispatch(this.oHost, new KeyboardEvent("keydown", { key: "a", bubbles: true }));
		assert.strictEqual(this.oEnablement.isOpen(), true, "still open on an unrelated key");
	});

	QUnit.module("Imperative open/close", {
		beforeEach: async function() {
			this.oHost = new PlainHost({ id: "host-btn" });
			await renderHost(this.oHost, this.clock);
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hello"
			});
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("open() opens, close() closes", async function(assert) {
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open initially");
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open after open()");
		this.oEnablement.close();
		assert.strictEqual(this.oEnablement.isOpen(), false, "closed after close()");
	});

	QUnit.test("open() with empty text is a no-op", async function(assert) {
		const oHost = new PlainHost({ id: "host-btn-empty-open" });
		await renderHost(oHost, this.clock);
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => ""
		});
		try {
			oEnablement.open();
			await flushMicrotasks(this.clock);
			assert.strictEqual(oEnablement.isOpen(), false,
				"open() does not flip isOpen when text is empty");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("close() before lazy module load aborts the open (no late open)", async function(assert) {
		// Kick off open() without waiting — module load may be in flight.
		this.oEnablement.open();
		// Cancel before the async open resolves.
		this.oEnablement.close();
		// Give any pending lazy-open scheduling a chance to fire.
		const sState = await waitForOpenState(this.clock, this.oEnablement);
		assert.strictEqual(sState, "NotOpened", "afterOpen does not fire after cancellation");
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"helper is not open after cancellation");
	});

	QUnit.test("close() after inner tooltip is created but before it opens aborts via flag", async function(assert) {
		// Prime the lazy inner tooltip by fully opening once, then close silently.
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		await closeAndWaitSilent(this.clock, this.oEnablement);
		assert.ok(this.oEnablement._oTooltip,
			"inner tooltip exists — next open() awaits nothing but a resolved promise");

		// Second open(): _ensureTooltip resolves synchronously-ish (already cached), but the
		// await still yields to microtasks. Close before those microtasks resume.
		this.oEnablement.open();
		this.oEnablement.close();

		const sState = await waitForOpenState(this.clock, this.oEnablement);
		assert.strictEqual(sState, "NotOpened",
			"afterOpen does not fire — the aborted flag short-circuited the resumed open");
		assert.strictEqual(this.oEnablement.isOpen(), false, "not open");
	});

	QUnit.test("open() during a pending open aborts the first; only the second opens", async function(assert) {
		let iOpenCount = 0;
		this.oEnablement.attachAfterOpen(() => { iOpenCount++; });

		// Two opens back-to-back. The first suspends on await _ensureTooltip().
		// The second flips the first's token to aborted, then installs its own.
		this.oEnablement.open();
		this.oEnablement.open();

		// Wait long enough for both to have resumed past the await.
		await waitForOpen(this.clock, this.oEnablement);
		await flushMicrotasks(this.clock);

		assert.strictEqual(iOpenCount, 1,
			"only the second open() proceeds — the first bails on its aborted flag");
		assert.strictEqual(this.oEnablement.isOpen(), true, "open after second open()");
	});

	QUnit.test("destroy() during a pending open aborts the open (no late open, no throw)", async function(assert) {
		this.oEnablement.open();
		// Destroy while the first open is still awaiting _ensureTooltip().
		this.oEnablement.destroy();

		// waitForOpen would try to attach on the destroyed enablement — poll isOpen() instead.
		await flushMicrotasks(this.clock);
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"destroyed helper is not open");
		assert.ok(true, "no throw from the resumed _open path after destroy");
	});

	QUnit.module("Attachment DOM ref", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
		},
		afterEach: async function() {
			// Drain leftover timers before restoring the clock so no timer leaks across the boundary.
			await this.clock.tickAsync(2000);
			this.oDeviceStub.restore();
			this.clock.restore();
		}
	});

	QUnit.test("defaults to host.getFocusDomRef()", async function(assert) {
		const oHost = new PlainHost({ id: "host-focus-default" });
		await renderHost(oHost, this.clock);

		// Inject an inner element and point getFocusDomRef at it.
		const oInner = document.createElement("span");
		oInner.id = "inner-focus-target";
		oHost.getDomRef().appendChild(oInner);
		const fnOrig = oHost.getFocusDomRef;
		oHost.getFocusDomRef = function() { return oInner; };

		const oEnablement = new TooltipEnablement(oHost, { textProvider: () => "hi" });
		try {
			// Dispatching on the inner (focus) DOM ref should open.
			oInner.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

			await waitForOpen(this.clock, oEnablement);
			assert.ok(true, "mouseover on focus DOM ref opens");

			oEnablement.close();
			await waitForClose(this.clock, oEnablement);

			// Dispatching on the outer DOM ref should NOT open.
			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseover", { bubbles: false }));

			const sState = await waitForOpenState(this.clock, oEnablement);
			assert.strictEqual(sState, "NotOpened", "mouseover on outer DOM ref does not open");
		} finally {
			oHost.getFocusDomRef = fnOrig;
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("respects custom domRefProvider", async function(assert) {
		const oHost = new PlainHost({ id: "host-custom-provider" });
		await renderHost(oHost, this.clock);

		// Inner element appended inside the host so events bubble through the host delegate.
		const oCustom = document.createElement("span");
		oCustom.id = "custom-attach-target";
		oHost.getDomRef().appendChild(oCustom);

		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "hi",
			domRefProvider: () => oCustom
		});

		try {
			oCustom.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			await waitForOpen(this.clock, oEnablement);
			assert.ok(true, "mouseover on custom element opens");

			oEnablement.close();
			await waitForClose(this.clock, oEnablement);

			// Dispatching on the host root (oCustom is a child, not the host root itself) must NOT open.
			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			const sState = await waitForOpenState(this.clock, oEnablement);
			assert.strictEqual(sState, "NotOpened", "mouseover on host root does not open");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("domRefProvider returning null is safe", async function(assert) {
		const oHost = new PlainHost({ id: "host-null-provider" });
		await renderHost(oHost, this.clock);

		let oEnablement;
		assert.ok(
			(function() {
				oEnablement = new TooltipEnablement(oHost, {
					textProvider: () => "hi",
					domRefProvider: () => null
				});
				return true;
			})(),
			"construction does not throw when provider returns null"
		);

		try {
			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			const sState = await waitForOpenState(this.clock, oEnablement);
			assert.strictEqual(sState, "NotOpened", "no listeners attached, so no open");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("gestures still work after host re-render", async function(assert) {
		const oHost = new PlainHost({ id: "host-rerender-gesture" });
		const oEnablement = new TooltipEnablement(oHost, {
			textProvider: () => "hi",
			domRefProvider: () => oHost.getDomRef()
		});
		await renderHost(oHost, this.clock);

		// Force a re-render via the public path.
		oHost.invalidate();
		await nextUIUpdate(this.clock);

		try {
			oHost.getDomRef().dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			await waitForOpen(this.clock, oEnablement);
			assert.ok(true, "mouseover on re-rendered host opens the tooltip");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.module("setEnableForTouchDevices reflects in DOM behavior", {
		beforeEach: async function() {
			// Stub touch device so the contextmenu handler is installed.
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new PlainHost({ id: "host-touch" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hi"
			});
			await renderHost(this.oHost, this.clock);
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("toggling off keeps the contextmenu listener installed but stops preventing default", function(assert) {
		// Default: enableForTouchDevices=true → contextmenu IS prevented.
		const oFirst = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		this.oHost.getDomRef().dispatchEvent(oFirst);
		assert.ok(oFirst.defaultPrevented, "contextmenu prevented while enabled");

		// Toggle off — the handler stays attached (no error, no detach), but no prevention.
		this.oEnablement.setEnableForTouchDevices(false);
		const oSecond = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		this.oHost.getDomRef().dispatchEvent(oSecond);
		assert.notOk(oSecond.defaultPrevented, "contextmenu not prevented after disabling");

		// Toggle back on — prevention is restored.
		this.oEnablement.setEnableForTouchDevices(true);
		const oThird = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		this.oHost.getDomRef().dispatchEvent(oThird);
		assert.ok(oThird.defaultPrevented, "contextmenu prevented again after re-enabling");
	});

	QUnit.module("DOM events - mobile (phone)", {
		beforeEach: async function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("contextmenu is prevented when enableForTouchDevices=true (default)", function(assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented, "contextmenu prevented");
	});

	QUnit.test("contextmenu is NOT prevented when enableForTouchDevices=false", function(assert) {
		this.oEnablement.setEnableForTouchDevices(false);
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.notOk(oEvent.defaultPrevented, "contextmenu not prevented");
	});

	QUnit.test("touchstart consults the textProvider and suppresses selection when it yields text", async function(assert) {
		const fnText = sinon.spy(() => "hi");
		const oHost = new PlainHost({ id: "host-touch-textprovider" });
		const oEnablement = new TooltipEnablement(oHost, { textProvider: fnText });
		await renderHost(oHost, this.clock);
		try {
			fnText.resetHistory();
			assert.notOk(fnText.called, "textProvider not consulted before the touch interaction");
			dispatch(oHost, new MouseEvent("mousedown", { bubbles: true }));
			assert.ok(fnText.called, "textProvider consulted once a touch starts");
			assert.ok(oHost.getDomRef().classList.contains("sapUiCoreTooltipHostSuppressSelection"),
				"selection suppressed because the textProvider yielded text");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("touchstart does not suppress selection when the textProvider yields empty", async function(assert) {
		let sText = "";
		const fnText = sinon.spy(() => sText);
		const oHost = new PlainHost({ id: "host-touch-emptytext" });
		const oEnablement = new TooltipEnablement(oHost, { textProvider: fnText });
		await renderHost(oHost, this.clock);
		try {
			fnText.resetHistory();
			assert.notOk(fnText.called, "textProvider not consulted before the touch interaction");
			dispatch(oHost, new MouseEvent("mousedown", { bubbles: true }));
			assert.ok(fnText.called, "textProvider consulted on touchstart");
			assert.notOk(oHost.getDomRef().classList.contains("sapUiCoreTooltipHostSuppressSelection"),
				"selection not suppressed while the textProvider yields empty");

			// Text resolves late; the next touch suppresses selection.
			sText = "now I have a tooltip";
			dispatch(oHost, new MouseEvent("mousedown", { bubbles: true }));
			assert.ok(oHost.getDomRef().classList.contains("sapUiCoreTooltipHostSuppressSelection"),
				"selection suppressed on the touch that happens once text exists");
		} finally {
			oEnablement.destroy();
			oHost.destroy();
		}
	});

	QUnit.module("DOM events - combi (desktop wiring, no mobile)", {
		beforeEach: async function() {
			// combi gets desktop branches but NOT the mobile/touch ones.
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: true, phone: true, tablet: true });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("combi gets desktop events (mouseover opens)", async function(assert) {
		dispatch(this.oHost, new MouseEvent("mouseover", { bubbles: true }));
		await waitForOpen(this.clock, this.oEnablement);
		assert.ok(true, "afterOpen fires on combi");
	});

	QUnit.test("combi does NOT prevent contextmenu (no mobile wiring)", function(assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.notOk(oEvent.defaultPrevented,
			"contextmenu handler is not installed on combi");
	});

	QUnit.module("DOM events - tablet (mobile wiring)", {
		beforeEach: async function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: false, tablet: true });
			await setupHostWithDevice(this);
		},
		afterEach: async function() {
			await teardownHost(this);
			this.clock.restore();
		}
	});

	QUnit.test("tablet prevents contextmenu on non-link host", function(assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oHost, oEvent);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.module("Lifecycle (host re-render)", {
		beforeEach: async function() {
			this.oHost = new PlainHost({ id: "host-btn-life" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hello"
			});
			await renderHost(this.oHost, this.clock);
		},
		afterEach: async function() {
			this.oEnablement.destroy();
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("re-rendering the host keeps DOM listeners working", async function(assert) {
		// Force a real re-render through the public path.
		this.oHost.invalidate();
		await nextUIUpdate(this.clock);

		// After re-render, dispatching a close-trigger event must still take effect:
		// open via the public API, then a mousedown on the host should close.
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true, "open after re-render");
		this.oHost.getDomRef().dispatchEvent(
			new MouseEvent("mousedown", { button: 0, bubbles: true })
		);
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"mousedown still closes after host re-render");
	});

	QUnit.module("Destroy", {
		beforeEach: async function() {
			this.oHost = new PlainHost({ id: "host-btn-destroy" });
			this.oEnablement = new TooltipEnablement(this.oHost, {
				textProvider: () => "hi"
			});
			await renderHost(this.oHost, this.clock);
		},
		afterEach: async function() {
			this.oHost.destroy();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("destroy closes the tooltip and detaches DOM listeners", async function(assert) {
		this.oEnablement.open();
		await waitForOpen(this.clock, this.oEnablement);
		assert.strictEqual(this.oEnablement.isOpen(), true);
		this.oEnablement.destroy();
		assert.strictEqual(this.oEnablement.isOpen(), false, "isOpen() false after destroy");

		// After destroy, dispatching events on the host must NOT reopen the tooltip.
		this.oHost.getDomRef().dispatchEvent(
			new MouseEvent("mouseover", { bubbles: true })
		);
		await flushMicrotasks(this.clock);
		assert.strictEqual(this.oEnablement.isOpen(), false,
			"mouseover after destroy does not reopen");
	});

	QUnit.test("double-destroy is safe", function(assert) {
		this.oEnablement.destroy();
		this.oEnablement.destroy();
		assert.ok(true, "no throw");
	});

	QUnit.module("Multiple enablements on one host", {
		beforeEach: function() {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
		},
		afterEach: async function() {
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("each enablement derives a distinct invisible anchor id", async function(assert) {
		const oHost = new MultiTargetEnablementHost({ id: "host-multi" });
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		try {
			const aIds = oHost._aEnablements.map((oE) => oE.getInvisibleTooltipId());
			// All ids must be non-null, distinct, and carry the per-index suffix.
			assert.strictEqual(aIds.length, 3, "three enablements");
			assert.strictEqual(new Set(aIds).size, 3, "all ids are distinct");
			aIds.forEach((sId, i) => {
				assert.ok(sId && sId.endsWith("-invisibleTooltip-" + i),
					"id[" + i + "] ends with expected suffix");
			});
		} finally {
			oHost.destroy();
		}
	});

	QUnit.test("invisibleTooltipIdSuffix config overrides the default id suffix", function(assert) {
		const oHost = new PlainHost({ id: "host-suffix" });
		const oEnablementCustom = new TooltipEnablement(oHost, {
			textProvider: () => "hi",
			invisibleTooltipIdSuffix: "-myAnchor"
		});
		const oEnablementDefault = new TooltipEnablement(oHost, {
			textProvider: () => "hi"
		});
		try {
			assert.strictEqual(oEnablementCustom.getInvisibleTooltipId(), "host-suffix-myAnchor",
				"custom suffix is used");
			assert.strictEqual(oEnablementDefault.getInvisibleTooltipId(), "host-suffix-invisibleTooltip",
				"default suffix is used when none is provided");
		} finally {
			oEnablementCustom.destroy();
			oEnablementDefault.destroy();
			oHost.destroy();
		}
	});

	QUnit.test("focusing one target opens only that target's tooltip", async function(assert) {
		const oHost = new MultiTargetEnablementHost({ id: "host-multi-focus" });
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		// Override matches on span[1] to report :focus-visible = true; others false.
		const aSpans = [0, 1, 2].map((i) =>
			oHost.getDomRef().querySelector("[data-target='" + i + "']")
		);
		const aOrigMatches = aSpans.map((oSpan) => oSpan.matches.bind(oSpan));
		aSpans.forEach((oSpan, i) => {
			const fnOrig = aOrigMatches[i];
			oSpan.matches = function(s) {
				return s === ":focus-visible" ? (i === 1) : fnOrig(s);
			};
		});

		try {
			// Leave initial focus so the focusin handler can proceed.
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			aSpans[1].dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
			await waitForOpen(this.clock, oHost._aEnablements[1]);

			assert.ok(oHost._aEnablements[1].isOpen(), "enablement[1] is open");
			assert.notOk(oHost._aEnablements[0].isOpen(), "enablement[0] is not open");
			assert.notOk(oHost._aEnablements[2].isOpen(), "enablement[2] is not open");
		} finally {
			aSpans.forEach((oSpan, i) => { oSpan.matches = aOrigMatches[i]; });
			oHost.destroy();
		}
	});

	QUnit.test("positioning opens relative to the target span, not the host", async function(assert) {
		const oHost = new MultiTargetEnablementHost({ id: "host-multi-pos" });
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		const oSpan2 = oHost.getDomRef().querySelector("[data-target='2']");
		const oHostDiv = oHost.getDomRef();

		const fnOpenBySpy = sinon.spy(Tooltip.prototype, "openBy");
		try {
			oSpan2.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			await waitForOpen(this.clock, oHost._aEnablements[2]);

			// Find the call that opened the enablement[2] tooltip.
			const aCalls = fnOpenBySpy.getCalls();
			const oCallWithSpan2 = aCalls.find((oCall) => oCall.args[0] === oSpan2);
			assert.ok(oCallWithSpan2, "openBy was called with span[2] as the target element");

			// Ensure no call used the host div.
			const oCallWithHost = aCalls.find((oCall) => oCall.args[0] === oHostDiv);
			assert.notOk(oCallWithHost, "openBy was NOT called with the host div");
		} finally {
			fnOpenBySpy.restore();
			oHost.destroy();
		}
	});

});

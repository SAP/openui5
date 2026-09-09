/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/tooltip/TooltipEventTrigger",
	"./FakeControls",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/Device"
], function (TooltipEventTrigger, FakeControls, nextUIUpdate, Device) {
	"use strict";

	const { FocusableHost, SelectableTextHost, TwoTargetHost } = FakeControls;

	async function renderHost(oHost, oClock) {
		oHost.placeAt("qunit-fixture");
		await nextUIUpdate(oClock);
	}

	function makeConfig(oHost, oTargetEl, oOverrides) {
		return Object.assign({
			host: oHost,
			domRefProvider: () => oTargetEl,
			onOpen: sinon.spy(),
			onClose: sinon.spy(),
			isPendingOrOpen: sinon.stub().returns(false),
			hasText: () => true
		}, oOverrides || {});
	}

	// Dispatches so the event bubbles to the host root where the delegate lives.
	function dispatch(oDomRef, oEvent) {
		oDomRef.dispatchEvent(oEvent);
	}

	QUnit.module("Construction");

	QUnit.test("getEnableForTouchDevices defaults to true", function (assert) {
		const oTrigger = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(oTrigger.getEnableForTouchDevices(), true);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("constructor honours enableForTouchDevices=false", function (assert) {
		const oTrigger = new TooltipEventTrigger(
			makeConfig(null, null, { enableForTouchDevices: false }));
		try {
			assert.strictEqual(oTrigger.getEnableForTouchDevices(), false);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.module("Setters", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("setEnableForTouchDevices round-trip is chainable", function (assert) {
		assert.strictEqual(this.oTrigger.setEnableForTouchDevices(false), this.oTrigger, "chainable");
		assert.strictEqual(this.oTrigger.getEnableForTouchDevices(), false);
		this.oTrigger.setEnableForTouchDevices(true);
		assert.strictEqual(this.oTrigger.getEnableForTouchDevices(), true);
	});

	QUnit.test("setEnableForTouchDevices reflects in contextmenu behavior", function (assert) {
		const oFirst = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oFirst);
		assert.ok(oFirst.defaultPrevented, "contextmenu prevented while enabled");

		this.oTrigger.setEnableForTouchDevices(false);
		const oSecond = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oSecond);
		assert.notOk(oSecond.defaultPrevented, "contextmenu not prevented after disabling");

		this.oTrigger.setEnableForTouchDevices(true);
		const oThird = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oThird);
		assert.ok(oThird.defaultPrevented, "contextmenu prevented again after re-enabling");
	});

	QUnit.module("Desktop events", {
		beforeEach: async function () {
			TooltipEventTrigger._resetInitialFocusForTesting();
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("left mousedown invokes onClose(false)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { button: 0, bubbles: true }));
		assert.ok(this.oConfig.onClose.calledOnce && !this.oConfig.onClose.firstCall.args[0]);
	});

	QUnit.test("right mousedown is ignored", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { button: 2, bubbles: true }));
		assert.notOk(this.oConfig.onClose.called);
	});

	QUnit.test("mousedown is ignored while text is selected within the target", function (assert) {
		const oOrig = window.getSelection;
		// Anchor inside the target element suppresses the gesture.
		window.getSelection = () => ({ toString: () => "selected", anchorNode: this.oDomRef });
		try {
			dispatch(this.oDomRef, new MouseEvent("mousedown", { button: 0, bubbles: true }));
			assert.notOk(this.oConfig.onClose.called);
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseover invokes onOpen(true)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
		assert.ok(this.oConfig.onOpen.calledOnceWith(true));
	});

	QUnit.test("mouseover is ignored while text is selected within the target", function (assert) {
		const oOrig = window.getSelection;
		// Anchor inside the target element suppresses the gesture.
		window.getSelection = () => ({ toString: () => "selected", anchorNode: this.oDomRef });
		try {
			dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called);
		} finally {
			window.getSelection = oOrig;
		}
	});

	QUnit.test("mouseover opens tooltip even when text is selected on an unrelated element (regression)", function (assert) {
		// Arrange: a sibling element outside the trigger's target that has a text selection.
		const oUnrelated = document.createElement("span");
		oUnrelated.textContent = "unrelated text";
		document.getElementById("qunit-fixture").appendChild(oUnrelated);
		const oOrig = window.getSelection;
		// Selection anchored in oUnrelated, not in this.oDomRef.
		window.getSelection = () => ({ toString: () => "selected", anchorNode: oUnrelated });
		try {
			// Act: hover over the trigger's own target.
			dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
			// Assert: onOpen IS called — the external selection must not suppress it.
			assert.ok(this.oConfig.onOpen.calledOnceWith(true),
				"tooltip opens despite text selected on a different element");
		} finally {
			window.getSelection = oOrig;
			oUnrelated.remove();
		}
	});

	QUnit.test("mouseover does not open tooltip when text is selected within the target element", function (assert) {
		// Arrange: selection anchored inside the trigger's own target.
		const oTextNode = document.createTextNode("tooltip host text");
		this.oDomRef.appendChild(oTextNode);
		const oOrig = window.getSelection;
		// Selection anchored in oTextNode, which is inside this.oDomRef.
		window.getSelection = () => ({ toString: () => "selected", anchorNode: oTextNode });
		try {
			// Act: hover over the trigger's own target.
			dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
			// Assert: onOpen is NOT called — internal selection suppresses drag-select.
			assert.notOk(this.oConfig.onOpen.called,
				"tooltip suppressed while text is being drag-selected within the target");
		} finally {
			window.getSelection = oOrig;
			this.oDomRef.removeChild(oTextNode);
		}
	});

	QUnit.test("mouseout invokes onClose(true)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseout", { bubbles: true }));
		assert.ok(this.oConfig.onClose.calledOnceWith(true));
	});

	QUnit.test("mouseover whose relatedTarget is inside the target does not invoke onOpen", function (assert) {
		const oChild = document.createElement("span");
		const oRelated = document.createElement("span");
		this.oDomRef.appendChild(oChild);
		this.oDomRef.appendChild(oRelated);
		try {
			// Inner move: both target and relatedTarget are inside the target.
			dispatch(oChild, new MouseEvent("mouseover", { bubbles: true, relatedTarget: oRelated }));
			assert.notOk(this.oConfig.onOpen.called, "onOpen not called for inner mouseover");
		} finally {
			this.oDomRef.removeChild(oChild);
			this.oDomRef.removeChild(oRelated);
		}
	});

	QUnit.test("mouseout whose relatedTarget is inside the target does not invoke onClose", function (assert) {
		const oChild = document.createElement("span");
		const oRelated = document.createElement("span");
		this.oDomRef.appendChild(oChild);
		this.oDomRef.appendChild(oRelated);
		try {
			// Inner move: both target and relatedTarget are inside the target.
			dispatch(oChild, new MouseEvent("mouseout", { bubbles: true, relatedTarget: oRelated }));
			assert.notOk(this.oConfig.onClose.called, "onClose not called for inner mouseout");
		} finally {
			this.oDomRef.removeChild(oChild);
			this.oDomRef.removeChild(oRelated);
		}
	});

	QUnit.test("focusin with :focus-visible after keyboard navigation invokes onOpen(true)", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.ok(this.oConfig.onOpen.calledOnceWith(true));
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusin without :focus-visible does not invoke onOpen", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" ? false : oOrig.call(this, s);
		};
		try {
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called);
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusin during initial focus does not invoke onOpen", function (assert) {
		const oOrig = this.oDomRef.matches;
		this.oDomRef.matches = function (s) {
			return s === ":focus-visible" || oOrig.call(this, s);
		};
		try {
			dispatch(this.oDomRef, new FocusEvent("focusin", { bubbles: true }));
			assert.notOk(this.oConfig.onOpen.called);
		} finally {
			this.oDomRef.matches = oOrig;
		}
	});

	QUnit.test("focusout invokes onClose(true)", function (assert) {
		dispatch(this.oDomRef, new FocusEvent("focusout", { bubbles: true }));
		assert.ok(this.oConfig.onClose.calledOnceWith(true));
	});

	QUnit.test("Escape consumes the event when isPendingOrOpen returns true", function (assert) {
		this.oConfig.isPendingOrOpen.returns(true);
		const oEvent = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.ok(this.oConfig.onClose.calledOnce && !this.oConfig.onClose.firstCall.args[0]);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.test("Escape is a no-op when isPendingOrOpen returns false", function (assert) {
		const oEvent = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.notOk(this.oConfig.onClose.called);
		assert.notOk(oEvent.defaultPrevented);
	});

	QUnit.module("Multiple focus targets", {
		beforeEach: async function () {
			TooltipEventTrigger._resetInitialFocusForTesting();
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: true, combi: false, phone: false, tablet: false });
			this.oHost = new TwoTargetHost("multiHost");
			await renderHost(this.oHost, this.clock);
			this.oTargetA = this.oHost.getDomRef().querySelector("#multiHost-a");
			this.oTargetB = this.oHost.getDomRef().querySelector("#multiHost-b");

			this.oConfigA = makeConfig(this.oHost, this.oTargetA);
			this.oConfigB = makeConfig(this.oHost, this.oTargetB);
			this.oTriggerA = new TooltipEventTrigger(this.oConfigA);
			this.oTriggerB = new TooltipEventTrigger(this.oConfigB);

			// Make both targets report :focus-visible.
			const oOrigA = this.oTargetA.matches;
			const oOrigB = this.oTargetB.matches;
			this.oTargetA.matches = function (s) { return s === ":focus-visible" || oOrigA.call(this, s); };
			this.oTargetB.matches = function (s) { return s === ":focus-visible" || oOrigB.call(this, s); };
			// Leave initial focus so focusin is not suppressed.
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		},
		afterEach: async function () {
			this.oTriggerA.destroy();
			this.oTriggerB.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("focusin on target A opens only A", function (assert) {
		this.oTargetA.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		assert.ok(this.oConfigA.onOpen.calledOnceWith(true), "A opened");
		assert.notOk(this.oConfigB.onOpen.called, "B not opened");
	});

	QUnit.test("focusin on target B opens only B", function (assert) {
		this.oTargetB.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		assert.ok(this.oConfigB.onOpen.calledOnceWith(true), "B opened");
		assert.notOk(this.oConfigA.onOpen.called, "A not opened");
	});

	QUnit.test("focusin on the host root (no target) opens neither", function (assert) {
		this.oHost.getDomRef().dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		assert.notOk(this.oConfigA.onOpen.called);
		assert.notOk(this.oConfigB.onOpen.called);
	});

	QUnit.test("mouseover on target A opens only A", function (assert) {
		this.oTargetA.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
		assert.ok(this.oConfigA.onOpen.calledOnceWith(true), "A opened");
		assert.notOk(this.oConfigB.onOpen.called, "B not opened");
	});

	QUnit.test("mouseout to a sibling target invokes A's onClose (real leave)", function (assert) {
		const oEvent = new MouseEvent("mouseout", { bubbles: true, relatedTarget: this.oTargetB });
		this.oTargetA.dispatchEvent(oEvent);
		assert.ok(this.oConfigA.onClose.calledOnceWith(true), "A closed on leave to sibling");
	});

	QUnit.module("Phone events", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("contextmenu is prevented when enableForTouchDevices=true (default)", function (assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.test("contextmenu is NOT prevented when enableForTouchDevices=false", function (assert) {
		this.oTrigger.setEnableForTouchDevices(false);
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.notOk(oEvent.defaultPrevented);
	});

	QUnit.test("host gets sapUiCoreTooltipHostSuppressSelection class on touchstart when touch enabled", function (assert) {
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class absent before any touch");
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"touch-suppression class added once a touch starts");
	});

	QUnit.test("host does NOT get sapUiCoreTooltipHostSuppressSelection on touchstart when touch disabled", function (assert) {
		this.oTrigger.setEnableForTouchDevices(false);
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"touch-suppression class absent when disabled");
	});

	QUnit.test("setEnableForTouchDevices(false) removes an active suppress-selection class", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class present during the touch");
		this.oTrigger.setEnableForTouchDevices(false);
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class removed after disabling");
	});

	QUnit.test("destroy removes an active suppress-selection class from the target", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class present after touchstart");
		this.oTrigger.destroy();
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"touch-suppression class removed on destroy");
		// Re-create so afterEach's destroy() has a live trigger to tear down.
		this.oTrigger = new TooltipEventTrigger(this.oConfig);
	});

	QUnit.test("long-press (500 ms) invokes onOpen(false)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.notOk(this.oConfig.onOpen.called, "not yet, timer pending");
		this.clock.tick(499);
		assert.notOk(this.oConfig.onOpen.called, "still not at 499 ms");
		this.clock.tick(1);
		assert.ok(this.oConfig.onOpen.calledOnce && !this.oConfig.onOpen.firstCall.args[0], "fired at 500 ms");
	});

	QUnit.test("touchmove cancels the long-press timer", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		dispatch(this.oDomRef, new MouseEvent("mousemove", { bubbles: true }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.test("touchend cancels the long-press timer", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		dispatch(this.oDomRef, new MouseEvent("mouseup", { bubbles: true }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.test("touchstart is ignored when enableForTouchDevices=false", function (assert) {
		this.oTrigger.setEnableForTouchDevices(false);
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called);
	});

	QUnit.module("Phone events - hasText gating", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.bHasText = false;
			this.oConfig = makeConfig(this.oHost, this.oDomRef, { hasText: () => this.bHasText });
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("touchstart does NOT add the class when there is no text", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class absent while host has no tooltip text");
	});

	QUnit.test("touchstart does NOT start the long-press timer when there is no text", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		this.clock.tick(1000);
		assert.notOk(this.oConfig.onOpen.called,
			"no open scheduled while host has no tooltip text");
	});

	QUnit.test("touchstart adds the class once text becomes available", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class absent for the touch that happened while text was empty");

		// Text is now known (e.g. resolved late) — a later touch suppresses selection.
		this.bHasText = true;
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class added on the touch that happens once text exists");
	});

	QUnit.test("contextmenu is NOT prevented when there is no text", function (assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.notOk(oEvent.defaultPrevented,
			"native context menu left available while host has no tooltip text");
	});

	QUnit.test("contextmenu is prevented once text exists", function (assert) {
		this.bHasText = true;
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.ok(oEvent.defaultPrevented,
			"native context menu blocked when host has tooltip text");
	});

	QUnit.test("hasText is consulted when a touch starts", function (assert) {
		const oHasText = sinon.spy(() => true);
		const oConfig = makeConfig(this.oHost, this.oDomRef, { hasText: oHasText });
		const oTrigger = new TooltipEventTrigger(oConfig);
		try {
			assert.notOk(oHasText.called, "hasText not consulted before any touch");
			dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
			assert.ok(oHasText.called, "hasText consulted once a touch starts");
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("hasText is re-consulted on each touchstart (late-resolved text)", function (assert) {
		const oHasText = sinon.stub();
		oHasText.onFirstCall().returns(false);
		oHasText.onSecondCall().returns(true);
		const oConfig = makeConfig(this.oHost, this.oDomRef, { hasText: oHasText });
		const oTrigger = new TooltipEventTrigger(oConfig);
		try {
			dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
			assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
				"first touch: no text yet, class not added");

			dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
			assert.strictEqual(oHasText.callCount, 2,
				"hasText consulted again on the second touch");
			assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
				"second touch: text now available, class added");
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("no suppressions applied when no hasText predicate is configured", function (assert) {
		const oConfig = makeConfig(this.oHost, this.oDomRef);
		delete oConfig.hasText;
		const oTrigger = new TooltipEventTrigger(oConfig);
		try {
			dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
			assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
				"class not added without a hasText predicate");

			const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
			dispatch(this.oDomRef, oEvent);
			assert.notOk(oEvent.defaultPrevented,
				"context menu left available without a hasText predicate");
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.module("Phone events - suppress-selection class lifecycle", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("class is kept while the long-press keeps the tooltip open", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class present while the long-press timer runs");
		this.clock.tick(500);
		assert.ok(this.oConfig.onOpen.calledOnce, "long-press opened the tooltip");
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class kept while the tooltip is open so the text stays unselected");
	});

	QUnit.test("class is removed on touchend (touch finished before long-press)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class present during the touch");
		dispatch(this.oDomRef, new MouseEvent("mouseup", { bubbles: true }));
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class removed once the touch ends");
	});

	QUnit.test("class is removed on touchmove", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		assert.ok(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class present during the touch");
		dispatch(this.oDomRef, new MouseEvent("mousemove", { bubbles: true }));
		assert.notOk(this.oDomRef.classList.contains("sapUiCoreTooltipHostSuppressSelection"),
			"class removed once the touch moves");
	});

	QUnit.module("Combi events (desktop wiring, no mobile)", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: true, phone: true, tablet: true });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("combi gets desktop events (mouseover invokes onOpen)", function (assert) {
		dispatch(this.oDomRef, new MouseEvent("mouseover", { bubbles: true }));
		assert.ok(this.oConfig.onOpen.calledOnceWith(true));
	});

	QUnit.test("combi does NOT prevent contextmenu (no mobile wiring)", function (assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.notOk(oEvent.defaultPrevented);
	});

	QUnit.module("Tablet events", {
		beforeEach: async function () {
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: false, tablet: true });
			this.oHost = new FocusableHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			await this.clock.tickAsync(2000);
			this.clock.restore();
		}
	});

	QUnit.test("tablet prevents contextmenu by default", function (assert) {
		const oEvent = new MouseEvent("contextmenu", { cancelable: true, bubbles: true });
		dispatch(this.oDomRef, oEvent);
		assert.ok(oEvent.defaultPrevented);
	});

	QUnit.module("Initial-focus document listener lifecycle", {
		beforeEach: function () {
			TooltipEventTrigger._resetInitialFocusForTesting();
			this.oAddSpy = sinon.spy(document, "addEventListener");
			this.oRemoveSpy = sinon.spy(document, "removeEventListener");
		},
		afterEach: function () {
			this.oAddSpy.restore();
			this.oRemoveSpy.restore();
			TooltipEventTrigger._resetInitialFocusForTesting();
		},
		keydownAdds: function () {
			return this.oAddSpy.getCalls().filter((oCall) => oCall.args[0] === "keydown").length;
		},
		keydownRemoves: function () {
			return this.oRemoveSpy.getCalls().filter((oCall) => oCall.args[0] === "keydown").length;
		}
	});

	QUnit.test("first trigger attaches the document keydown listener; second does not", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(this.keydownAdds(), 1);
		} finally {
			oFirst.destroy();
			oSecond.destroy();
		}
	});

	QUnit.test("listener is detached only when the last trigger is destroyed", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		oFirst.destroy();
		assert.strictEqual(this.keydownRemoves(), 0);
		oSecond.destroy();
		assert.strictEqual(this.keydownRemoves(), 1);
	});

	QUnit.test("navigation keydown ends initial focus and detaches the listener", function (assert) {
		const oTrigger = new TooltipEventTrigger(makeConfig(null, null));
		try {
			dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
			assert.strictEqual(this.keydownRemoves(), 1);
		} finally {
			oTrigger.destroy();
		}
	});

	QUnit.test("a new trigger re-attaches the listener while focus is still initial", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		oFirst.destroy();
		assert.strictEqual(this.keydownRemoves(), 1);
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(this.keydownAdds(), 2);
		} finally {
			oSecond.destroy();
		}
	});

	QUnit.test("a new trigger does not re-attach after initial focus has passed", function (assert) {
		const oFirst = new TooltipEventTrigger(makeConfig(null, null));
		dispatch(document, new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		oFirst.destroy();
		const iAddsSoFar = this.keydownAdds();
		const oSecond = new TooltipEventTrigger(makeConfig(null, null));
		try {
			assert.strictEqual(this.keydownAdds(), iAddsSoFar);
		} finally {
			oSecond.destroy();
		}
	});

	QUnit.module("Suppress-selection computed style (CSS)", {
		beforeEach: async function () {
			// sap-phone activates the phone user-select:text baseline for .sapUiSelectable.
			this.sOrigClassName = document.documentElement.className;
			document.documentElement.classList.add("sap-phone");
			this.oDeviceStub = sinon.stub(Device, "system")
				.value({ desktop: false, combi: false, phone: true, tablet: false });
			// Selectable host div + nested selectable span, mirroring sap.m.Title.
			this.oHost = new SelectableTextHost();
			await renderHost(this.oHost, this.clock);
			this.oDomRef = this.oHost.getDomRef();
			this.oInner = this.oDomRef.querySelector("span");
			this.oConfig = makeConfig(this.oHost, this.oDomRef);
			this.oTrigger = new TooltipEventTrigger(this.oConfig);
		},
		afterEach: async function () {
			this.oTrigger.destroy();
			this.oHost.destroy();
			this.oDeviceStub.restore();
			document.documentElement.className = this.sOrigClassName;
			await this.clock.tickAsync(2000);
			this.clock.restore();
		},
		// A touchstart on the host: the delegate maps it and adds the suppress class.
		startTouch: function () {
			dispatch(this.oDomRef, new MouseEvent("mousedown", { bubbles: true }));
		},
		// A touchend on the host: the delegate maps it and removes the suppress class.
		endTouch: function () {
			dispatch(this.oDomRef, new MouseEvent("mouseup", { bubbles: true }));
		}
	});

	QUnit.test("touchstart disables selection on the host in computed styles", function (assert) {
		assert.strictEqual(window.getComputedStyle(this.oDomRef).userSelect, "text",
			"before touch: host text is selectable");
		this.startTouch();
		assert.strictEqual(window.getComputedStyle(this.oDomRef).userSelect, "none",
			"after touch: host selection disabled");
		this.endTouch();
		assert.strictEqual(window.getComputedStyle(this.oDomRef).userSelect, "text",
			"after touch release: host text is selectable again");
	});

	QUnit.test("touchstart disables selection on nested .sapUiSelectable text in computed styles", function (assert) {
		assert.strictEqual(window.getComputedStyle(this.oInner).userSelect, "text",
			"before touch: nested selectable text is selectable");
		this.startTouch();
		assert.strictEqual(window.getComputedStyle(this.oInner).userSelect, "none",
			"after touch: nested selectable text selection disabled");
		this.endTouch();
		assert.strictEqual(window.getComputedStyle(this.oInner).userSelect, "text",
			"after touch release: nested selectable text is selectable again");
	});
});

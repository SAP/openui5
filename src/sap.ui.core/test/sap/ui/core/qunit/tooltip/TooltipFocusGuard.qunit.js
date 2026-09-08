/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/tooltip/TooltipFocusGuard"
], function (TooltipFocusGuard) {
	"use strict";

	function makeConfig(oOverrides) {
		return Object.assign({
			isPendingOrOpen: sinon.stub().returns(false),
			onClose: sinon.spy()
		}, oOverrides || {});
	}

	// Detached element, optionally wrapped in a dialog/popover ancestor with the
	// open-focus marker class.
	function makeTarget(sAncestorClass, bInitial) {
		const oTarget = document.createElement("button");
		if (sAncestorClass) {
			const oAncestor = document.createElement("div");
			oAncestor.classList.add(sAncestorClass);
			if (bInitial) {
				oAncestor.classList.add("sapUiPopupInitial");
			}
			oAncestor.appendChild(oTarget);
		}
		return oTarget;
	}

	function simulatePageHidden() {
		Object.defineProperty(document, "hidden", {
			configurable: true,
			get: function () { return true; }
		});
		try {
			document.dispatchEvent(new Event("visibilitychange"));
		} finally {
			Object.defineProperty(document, "hidden", {
				configurable: true,
				get: function () { return false; }
			});
		}
	}

	QUnit.module("Initial page-load focus", {
		beforeEach: function () {
			TooltipFocusGuard._resetForTesting();
			this.oGuard = new TooltipFocusGuard(makeConfig());
		},
		afterEach: function () {
			this.oGuard.destroy();
			TooltipFocusGuard._resetForTesting();
		}
	});

	QUnit.test("suppresses focus-open before any keyboard interaction", function (assert) {
		assert.ok(this.oGuard.shouldSuppressFocusOpen(makeTarget()),
			"initial page-load focus is suppressed");
	});

	QUnit.test("stops suppressing once a document keydown occurs", function (assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		assert.notOk(this.oGuard.shouldSuppressFocusOpen(makeTarget()),
			"focus-open allowed after the first navigation");
	});

	QUnit.test("the initial-focus reset is sticky across a new guard", function (assert) {
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		const oOther = new TooltipFocusGuard(makeConfig());
		try {
			assert.notOk(oOther.shouldSuppressFocusOpen(makeTarget()),
				"a guard created after the first navigation does not re-suppress");
		} finally {
			oOther.destroy();
		}
	});

	QUnit.module("Dialog open-focus", {
		beforeEach: function () {
			TooltipFocusGuard._resetForTesting();
			this.oGuard = new TooltipFocusGuard(makeConfig());
			// Leave the initial-focus phase so only the dialog check is under test.
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		},
		afterEach: function () {
			this.oGuard.destroy();
			TooltipFocusGuard._resetForTesting();
		}
	});

	QUnit.test("suppresses focus during a modal dialog's open-focus", function (assert) {
		assert.ok(this.oGuard.shouldSuppressFocusOpen(makeTarget("sapMDialog", true)),
			"dialog open-focus is suppressed");
	});

	QUnit.test("does not suppress a later focus inside an already-open dialog", function (assert) {
		assert.notOk(this.oGuard.shouldSuppressFocusOpen(makeTarget("sapMDialog", false)),
			"focus inside an open dialog is allowed");
	});

	QUnit.test("does not suppress a modal popover's open-focus (dialogs only)", function (assert) {
		assert.notOk(this.oGuard.shouldSuppressFocusOpen(makeTarget("sapMPopover", true)),
			"popover open-focus is allowed");
	});

	QUnit.test("does not suppress a plain target with no dialog ancestor", function (assert) {
		assert.notOk(this.oGuard.shouldSuppressFocusOpen(makeTarget()),
			"a target outside any dialog is allowed");
	});

	QUnit.module("Page-leave dismissal", {
		beforeEach: function () {
			TooltipFocusGuard._resetForTesting();
			this.oConfig = makeConfig({ isPendingOrOpen: sinon.stub().returns(true) });
			this.oGuard = new TooltipFocusGuard(this.oConfig);
			// Leave the initial-focus phase.
			document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		},
		afterEach: function () {
			Object.defineProperty(document, "hidden", {
				configurable: true,
				get: function () { return false; }
			});
			this.oGuard.destroy();
			TooltipFocusGuard._resetForTesting();
		}
	});

	QUnit.test("closes the tooltip when the page is hidden", function (assert) {
		simulatePageHidden();
		assert.ok(this.oConfig.onClose.calledOnce, "onClose called on page leave");
	});

	QUnit.test("does nothing when the tooltip is not pending or open", function (assert) {
		this.oConfig.isPendingOrOpen.returns(false);
		simulatePageHidden();
		assert.notOk(this.oConfig.onClose.called, "onClose not called when nothing is open");
	});

	QUnit.test("suppresses reopening on the same focus after a page-leave dismissal", function (assert) {
		simulatePageHidden();
		assert.ok(this.oGuard.shouldSuppressFocusOpen(makeTarget()),
			"focus-open suppressed until a fresh interaction");
	});

	QUnit.test("noteFreshInteraction ends the post-page-leave wait", function (assert) {
		simulatePageHidden();
		this.oGuard.noteFreshInteraction();
		assert.notOk(this.oGuard.shouldSuppressFocusOpen(makeTarget()),
			"focus-open allowed once a fresh interaction is noted");
	});

	QUnit.module("Shared listener lifecycle");

	QUnit.test("visibilitychange has no effect once the last guard is destroyed", function (assert) {
		TooltipFocusGuard._resetForTesting();
		const oConfig = makeConfig({ isPendingOrOpen: sinon.stub().returns(true) });
		const oGuard = new TooltipFocusGuard(oConfig);
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
		oGuard.destroy();

		simulatePageHidden();

		assert.notOk(oConfig.onClose.called, "destroyed guard is not called on page leave");
		TooltipFocusGuard._resetForTesting();
	});

	QUnit.test("keydown after all guards are destroyed does not affect a later guard's initial-focus state", function (assert) {
		TooltipFocusGuard._resetForTesting();
		const oFirst = new TooltipFocusGuard(makeConfig());
		oFirst.destroy();
		// Listener is detached; this keydown must not clear the sticky initial-focus flag.
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));

		const oSecond = new TooltipFocusGuard(makeConfig());
		try {
			assert.ok(oSecond.shouldSuppressFocusOpen(makeTarget()),
				"a new guard still treats the next focus as initial page-load focus");
		} finally {
			oSecond.destroy();
			TooltipFocusGuard._resetForTesting();
		}
	});
});

/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Button"
], function (Log, nextUIUpdate, Button) {
	"use strict";

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	// helper
	function getSibling(oDomRef, sDirection) {
		return (sDirection == "prev") ? oDomRef.previousElementSibling : oDomRef.nextElementSibling;
	}

	function queryAll(selector) {
		return document.querySelectorAll(selector);
	}

	QUnit.module("CSS classes", {
		beforeEach : function() {
			this.oButton = new Button({
				text: "Press"
			}).placeAt("content");

			return nextUIUpdate();
		},

		afterEach : function() {
			this.oButton.destroy();
			return nextUIUpdate();
		}
	});

	QUnit.test("Static/Relative Positioning - Reset", function (assert) {
		// set static positioning
		var $button = this.oButton.$();
		$button.css("position", "static");

		this.oButton.setBusyIndicatorDelay(0);
		this.oButton.setBusy(true);

		// check for relative position
		assert.equal($button.css("position"), "relative", "css position attribute was changed to 'relative'");

		this.oButton.setBusy(false);

		// check for resetting "position" to "static"
		assert.equal($button.css("position"), "static", "css position attribute was changed to 'static'");
	});

	QUnit.test("Static/Relative Positioning - NO Reset", function (assert) {
		// set static positioning
		var $button = this.oButton.$();
		$button.css("position", "fixed");

		this.oButton.setBusyIndicatorDelay(0);
		this.oButton.setBusy(true);

		// check for fixed position
		assert.equal($button.css("position"), "fixed", "after setBusy(true) the position is still 'fixed'");

		this.oButton.setBusy(false);

		// after setBusy(false) the position is still "fixed"
		assert.equal($button.css("position"), "fixed", "after setBusy(false) the position is still 'fixed'");
	});

	QUnit.module("Focus Handling");

	QUnit.test("Return focus to the control when Block Layer has focus before it's removed", async function (assert) {
		var oButton = new Button({
			text: "Press"
		}).placeAt("content");

		await nextUIUpdate();

		oButton.setBusyIndicatorDelay(0);
		oButton.setBusy(true);

		var oBlockLayerDOM = oButton.getDomRef("busyIndicator");
		oBlockLayerDOM.focus();

		oButton.setBusy(false);
		assert.ok(oButton.getDomRef().contains(document.activeElement));

		oButton.destroy();
	});

	QUnit.module("Toggle setBlocked and setBusy", {
		beforeEach : function(assert) {

			// assertion helpers

			this.testOneTabbableSpanExists = function(oDomRef) {
				var oSiblingDomRef;

				// check of previous tabbable span
				oSiblingDomRef = getSibling(oDomRef, "prev");
				assert.equal(oSiblingDomRef.getAttribute("tabindex"), 0, "Previous tabbable span should be available.");

				// Get previous element of previous tabbable span element
				var oPrevSiblingDomRef = getSibling(oSiblingDomRef, "prev");
				assert.ok(oPrevSiblingDomRef === null ||  oPrevSiblingDomRef.getAttribute("tabindex") === "0",  "Only one previous tabbable span should be available");

				// check of next tabbable span
				oSiblingDomRef = getSibling(oDomRef, "next");
				assert.equal(oSiblingDomRef.getAttribute("tabindex"), 0, "Next tabbable span should be available.");

				// Get the next element after the next tabbable span
				var oNextSiblingDomRef = getSibling(oSiblingDomRef, "next");
				assert.ok(oNextSiblingDomRef === null ||  oNextSiblingDomRef.getAttribute("tabindex") === "0",  "Only one next tabbable span should be available");
			};

			this.testNoneTabbableSpanExists = function(oDomRef) {
				var oSiblingDomRef;

				// check of previous tabbable span
				oSiblingDomRef = getSibling(oDomRef, "prev");
				assert.ok(oSiblingDomRef === null || (oSiblingDomRef.getAttribute("tabindex") !== "0" && oSiblingDomRef.nodeName !== "SPAN"), "Previous tabbable span shouldn't be available.");

				// check of next tabbable spanq
				oSiblingDomRef = getSibling(oDomRef, "next");
				assert.ok(oSiblingDomRef === null || (oSiblingDomRef.getAttribute("tabindex") !== "0" && oSiblingDomRef.nodeName !== "SPAN"), "Next tabbable span shouldn't be available.");
			};

			// fixture

			this.oButton = new Button({
				text: "Press"
			}).placeAt("content");
			return nextUIUpdate();
		},

		afterEach : function() {
			this.oButton.destroy();

			return nextUIUpdate();
		}
	});


	QUnit.test("setBlocked() → setBusy()", function(assert) {
		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be available.");

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");

		this.testOneTabbableSpanExists(this.oButton.getDomRef());
	});

	QUnit.test("setBlocked(true) → setBusy(true) : setBlocked(false) → setBusy(false)", function(assert) {
		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayer should be available.");

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		this.testNoneTabbableSpanExists(this.oButton.getDomRef());
	});

	QUnit.test("setBlocked(true) → setBusy(true) : setBusy(false) → setBlocked(false)", function(assert) {
		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayer should be available.");

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
		this.testNoneTabbableSpanExists(this.oButton.getDomRef());
	});

	QUnit.test("setBusy(true) → setBlocked(true) : setBusy(false) → setBlocked(false)", function(assert) {
		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be available.");

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
		this.testNoneTabbableSpanExists(this.oButton.getDomRef());
	});

	QUnit.test("setBusy(true) → setBlocked(true) : setBlock(false) → setBusy(false)", function(assert) {
		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be available.");

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		this.testNoneTabbableSpanExists(this.oButton.getDomRef());
	});

	QUnit.test("setBlocked(true) → setBusy(true) : setBlocked(false) → setBlocked(true) → setBlocked(false)", function(assert) {
		var oLogSpy = sinon.spy(Log, "info");

		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayer should be available.");

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be available.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked anymore");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be still available.");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.ok(oLogSpy.calledTwice, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be busy anymore");
		assert.ok(oLogSpy.calledThrice, "Info logged. Unblocking ignored since Busy Layer still exists.");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		oLogSpy.restore();
	});

	QUnit.test("setBlocked(true) → setBusy(true) : setBusy(false) → setBusy(true) → setBusy(false)", function(assert) {
		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayer should be available.");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be available.");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 0, "BusyIndicator Animation should be visible.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 1, "BusyIndicator Animation should be hidden.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayerOnly class should be set again");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 0, "BusyIndicator Animation should be visible again.");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 1, "BusyIndicator Animation should be invisible ");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayerOnly class should be set again");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());
	});

	QUnit.test("setBusy(true) → setBlocked(true) : setBusy(false) → setBusy(true) → setBusy(false)", function(assert) {
		var oLogSpy = sinon.spy(Log, "info");

		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be available.");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 0, "BusyIndicator Animation should be visible.");

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.ok(oLogSpy.calledOnce, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 1, "BusyIndicator Animation should be invisible.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayerOnly class should be set again");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 0, "BusyIndicator Animation should be visible.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBusy(false);
		assert.notOk(this.oButton.getBusy(), "Button shouldn't be busy anymore");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 1, "BusyIndicator Animation should be invisible.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 1, "BlockLayerOnly class should be set again");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		oLogSpy.restore();
	});

	QUnit.test("setBusy(true) → setBlocked(true) : setBlocked(false) → setBlocked(true) → setBlocked(false)", function(assert) {
		var oLogSpy = sinon.spy(Log, "info");

		this.oButton.setBusyIndicatorDelay(0);

		this.oButton.setBusy(true);
		assert.ok(this.oButton.getBusy(), "Button should be busy");
		assert.equal(queryAll('.sapUiLocalBusyIndicator').length, 1, "BusyIndicator should be available.");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 0, "BusyIndicator Animation should be visible.");

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.ok(oLogSpy.calledOnce, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked");
		assert.ok(oLogSpy.calledTwice, "Info logged. Unblocking ignored since Busy Layer still exists.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 0, "BusyIndicator Animation should be visible.");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(true);
		assert.ok(this.oButton.getBlocked(), "Button should be blocked");
		assert.ok(oLogSpy.calledThrice, "Info logged. Block Layer creation ignored since Busy Layer still exists.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		this.oButton.setBlocked(false);
		assert.notOk(this.oButton.getBlocked(), "Button shouldn't be blocked");
		assert.equal(oLogSpy.callCount, 4, "Info logged. Unblocking ignored since Busy Layer still exists.");
		assert.equal(queryAll('.sapUiBlockLayerOnly').length, 0, "BlockLayerOnly class shouldn't be set anymore");
		assert.equal(queryAll('.sapUiHiddenBusyIndicatorAnimation').length, 0, "BusyIndicator Animation should be visible.");
		this.testOneTabbableSpanExists(this.oButton.getDomRef());

		oLogSpy.restore();
	});

	QUnit.test("Don't remove afterRendering delegate when either busy or block state is still active", async function(assert) {
		var iInitialDelegateCount = this.oButton.aDelegates.length;
		assert.ok(iInitialDelegateCount >= 1, "Button should already have at least one delegate initially");
		this.oButton.setBlocked(true);
		assert.equal(this.oButton.getBlocked(), true, "setBlocked(true): Button should be blocked");
		assert.equal(this.oButton.aDelegates.length, iInitialDelegateCount + 1, "onBefore-/onAfterRendering delegate should be added");

		this.oButton.setBusyIndicatorDelay(0);
		this.oButton.setBusy(true);
		assert.equal(this.oButton.getBusy(), true, "setBusy(true): Button should be busy");
		assert.equal(this.oButton.getBlocked(), true, "Button should still be blocked");

		this.oButton.setBusy(false);
		assert.equal(this.oButton.getBusy(), false, "setBusy(false): Button shouldn't be busy anymore");
		assert.equal(this.oButton.getBlocked(), true, "Button should still be blocked");
		assert.equal(this.oButton.aDelegates.length, iInitialDelegateCount + 1 , "onBefore-/onAfterRendering delegate should still be available");

		this.oButton.invalidate();
		await nextUIUpdate();
		assert.equal(this.oButton.getBlocked(), true, "After Re-rendering: Button should still be blocked");

		var oBlockLayerDOM = document.getElementsByClassName("sapUiBlockLayer");
		assert.ok(oBlockLayerDOM, "After Re-rendering: BlockLayer should be available");

		this.oButton.setBlocked(false);
		assert.equal(this.oButton.getBlocked(), false, "setBlocked(false): Button shouldn't be blocked anymore");
		assert.equal(oBlockLayerDOM.length, 0, "BlockLayer should be removed");
		assert.equal(this.oButton.aDelegates.length, iInitialDelegateCount, "onBefore-/onAfterRendering delegate should be removed again");
	});

});

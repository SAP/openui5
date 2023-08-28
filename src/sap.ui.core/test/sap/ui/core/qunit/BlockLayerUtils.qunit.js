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
});

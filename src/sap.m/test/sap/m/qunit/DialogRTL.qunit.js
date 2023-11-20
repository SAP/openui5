/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/Popup",
	"sap/m/Dialog",
	"sap/ui/thirdparty/jquery",
	"sap/m/Text"
], function(
	createAndAppendDiv,
	Popup,
	Dialog,
	jQuery,
	Text
) {
	"use strict";

	QUnit.module("Dialog position in RTL");

	QUnit.test("Stretched dialog's position in RTL", function (assert) {
		var oDialog = new Dialog({
			stretch: true,
			content: new Text({text: "test"})
		});

		oDialog.open();
		this.clock.tick(100);

		// Assert
		var oDomRef = oDialog.getDomRef();
		assert.ok(oDomRef.style.right, "dialog's right position is set in RTL");
		assert.strictEqual(oDomRef.style.left, "", "dialog's left position is not set");

		oDialog.destroy();
	});

	QUnit.module("Within Area in RTL", {
		beforeEach: function () {
			this.oDialog = new Dialog();
			this.oWithinArea = createAndAppendDiv("withinArea");
		},
		afterEach: function () {
			this.oDialog.destroy();
			this.oWithinArea.remove();
			Popup.setWithinArea(null);
		},
		styleWithinArea: function (mStyles) {
			var _mStyles = Object.assign({
				position: "absolute",
				backgroundColor: "black"
			}, mStyles);

			for (var sProp in _mStyles) {
				this.oWithinArea.style[sProp] = _mStyles[sProp];
			}
		},
		assertIsInsideWithinArea: function (assert) {
			var oStyles = this.oDialog.getDomRef().style,
				fTop = parseFloat(oStyles.getPropertyValue("top")),
				fRight = parseFloat(oStyles.getPropertyValue("right")),
				$withinArea = jQuery(this.oWithinArea),
				oWithinAreaPos = {
					top: parseInt($withinArea.css("top")),
					right: parseInt($withinArea.css("right"))
				};

			// Assert
			assert.ok(fTop >= oWithinAreaPos.top + parseInt($withinArea.css("border-top-width")), "Dialog is inside Within Area vertically");
			assert.ok(fRight >= oWithinAreaPos.right + parseInt($withinArea.css("border-right-width")), "Dialog is inside Within Area horizontally");
			assert.ok(this.oDialog.$().outerHeight(true) <= $withinArea.innerHeight(), "Dialog isn't higher than Within Area");
			assert.ok(this.oDialog.$().outerWidth(true) <= $withinArea.innerWidth(), "Dialog isn't wider than Within Area");
		}
	});

	QUnit.test("Custom Within Area. Dialog position in RTL", function (assert) {
		// Arrange
		Popup.setWithinArea(this.oWithinArea);
		this.styleWithinArea({
			top: "5rem",
			left: "1rem",
			width: "30rem",
			height: "8rem"
		});
		this.oDialog.open();
		this.clock.tick(500);

		// Assert
		this.assertIsInsideWithinArea(assert);
	});

});

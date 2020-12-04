/*global sinon */
/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */

sap.ui.define([
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/Core",
	"sap/ui/core/IconPool"
], function(
	mLibrary,
	OverflowToolbar,
	OverflowToolbarButton,
	OverflowToolbarLayoutData,
	Core,
	IconPool
) {
	"use strict";
	var oOTBPriority = mLibrary.OverflowToolbarPriority;

	QUnit.module("Private methods", {
		beforeEach: function () {
			this.oOTB = new OverflowToolbar({
				content: [
					new OverflowToolbarButton({
						icon: "sap-icon://search",
						text: "Search button"
					})
				]
			});

			this.oOTB.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oOTB.destroy();
			this.oOTB = null;
		}
	});

	QUnit.test("_getText value", function (assert) {
		var oButton = this.oOTB.getContent()[0],
		oLayoutData = new OverflowToolbarLayoutData({
				priority: oOTBPriority.AlwaysOverflow
			});

		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getText(), "", "OverflowToolbarButton text value is correct");

		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();

		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getText(), oButton.getText(), "OverflowToolbarButton text value is correct");
	});

	QUnit.test("_getTooltip value without tooltip", function (assert) {
		var oButton = this.oOTB.getContent()[0],
			oLayoutData = new OverflowToolbarLayoutData({
				priority: oOTBPriority.AlwaysOverflow
			}),
			oIconInfo = IconPool.getIconInfo("sap-icon://search");

		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getTooltip(), oIconInfo.text, "OverflowToolbarButton tooltip value is correct");

		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();

		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getTooltip(), undefined, "OverflowToolbarButton tooltip value is correct");
	});

	QUnit.test("_getTooltip value with tooltip", function (assert) {
		var oButton = this.oOTB.getContent()[0],
			oLayoutData = new OverflowToolbarLayoutData({
				priority: oOTBPriority.AlwaysOverflow
			}),
			sTooltipText = "Simple tooltip";

		oButton.setTooltip(sTooltipText);
		Core.applyChanges();

		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getTooltip(), sTooltipText, "OverflowToolbarButton tooltip value is correct on icon only button");

		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();

		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getTooltip(), sTooltipText, "OverflowToolbarButton tooltip value is correct when the tooltip is different to text");

		oLayoutData.setPriority(oOTBPriority.NeverOverflow);
		oButton.setLayoutData(oLayoutData);
		oButton.setTooltip(oButton.getText());
		Core.applyChanges();

		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getTooltip(), oButton.getText(), "OverflowToolbarButton tooltip value is correct on icon only button");

		oLayoutData.setPriority(oOTBPriority.AlwaysOverflow);
		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();

		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getTooltip(), "", "OverflowToolbarButton tooltip value is correct when the tooltip is same to text");
	});
});

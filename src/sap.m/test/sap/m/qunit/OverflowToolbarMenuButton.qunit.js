/*global QUnit */

sap.ui.define([
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarMenuButton",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/Core",
	"sap/ui/core/IconPool"
], function(
	mLibrary,
	OverflowToolbar,
	OverflowToolbarMenuButton,
	OverflowToolbarLayoutData,
	oCore,
	IconPool
) {
	"use strict";

	function _inOverflowAndVisible(oOTB, oControl){
		if (oOTB._getOverflowButton().$().is(":visible")){
			if (oControl._bInOverflow){
				return true;
			}
		}
		return false;
	}

	function checkTooltipValue(assert, oOTB, expectedToolbarTooltip, expectedOverflowTooltip){
		var oMenuButton = oOTB.getContent()[0],
			oLayoutData = new OverflowToolbarLayoutData({
				priority: oOTBPriority.AlwaysOverflow
			});

			// Outside of overflow
			oMenuButton.setTooltip(expectedToolbarTooltip);
			oCore.applyChanges();

			assert.notOk(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is not in the overflow area");
			assert.strictEqual(oMenuButton.getTooltip(), expectedToolbarTooltip, "OverflowToolbarMenuButton tooltip value is correct");

			// In overflow
			oMenuButton.setLayoutData(oLayoutData);
			oCore.applyChanges();

			assert.ok(_inOverflowAndVisible(oOTB, oMenuButton), "Overflow button is visible and MenuButton is in the overflow area");
			assert.strictEqual(oMenuButton.getTooltip(), expectedOverflowTooltip, "OverflowToolbarMenuButton tooltip value is correct");
	}

	function checkForDefaultTooltip(assert, oOTB, sIcon){
		var oMenuButton = oOTB.getContent()[0],
			oLayoutData = new OverflowToolbarLayoutData({
				priority: oOTBPriority.AlwaysOverflow
			}),
			oIconInfo = IconPool.getIconInfo(sIcon),
			sTooltip = oIconInfo.text ? oIconInfo.text : oIconInfo.name;

		// 1. Shows icon default tooltip when not in overflow
		assert.notOk(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is not in the overflow area");
		assert.strictEqual(oMenuButton.getTooltip(), sTooltip, "OverflowToolbarMenuButton tooltip value is correct");

		oMenuButton.setLayoutData(oLayoutData);
		oCore.applyChanges();

		// 2. Doesn't show anything when in overflow
		assert.ok(_inOverflowAndVisible(oOTB, oMenuButton), "Overflow button is visible and MenuButton is in the overflow area");
		assert.notOk(oMenuButton.getTooltip(), "OverflowToolbarMenuButton has no tooltip");
	}

	var oOTBPriority = mLibrary.OverflowToolbarPriority;

	QUnit.module("Regular MenuButton Tests", {
		beforeEach: function () {
			this.sMenuButtonText = "Menu";
			this.sIcon = "sap-icon://bullet-text";
			this.oOTB = new OverflowToolbar({
				content: new OverflowToolbarMenuButton( "RegularMenuButton", {
					icon: this.sIcon,
					text: this.sMenuButtonText,
					buttonMode: "Regular",
					useDefaultActionOnly: true
				})
			});

			this.oOTB.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oOTB.destroy();
			this.oOTB = null;
		}
	});

	QUnit.test("getText value", function (assert) {
		var oMenuButton = this.oOTB.getContent()[0],
			oLayoutData = new OverflowToolbarLayoutData({
				priority: oOTBPriority.AlwaysOverflow
			});

		assert.notOk(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is not in the overflow area");
		assert.strictEqual(oMenuButton.getText(), "", "OverflowToolbarMenuButton text value is correct");

		oMenuButton.setLayoutData(oLayoutData);
		oCore.applyChanges();

		assert.ok(this.oOTB._getOverflowButton().$().is(":visible"), "OverflowMenuButton is visible");
		assert.ok(oMenuButton._bInOverflow, "OverflowToolbarMenuButton is in the overflow area");
		assert.strictEqual(oMenuButton.getText(), this.sMenuButtonText, "OverflowToolbarMenuButton text value is correct");
	});

	QUnit.test("getTooltip value without tooltip", function (assert) {
		// 1. Shows icon default tooltip when not in overflow
		// 2. Doesn't show anything when in overflow
		checkForDefaultTooltip(assert, this.oOTB, this.sIcon);
	});

	QUnit.test("getTooltip value with tooltip matching text", function (assert) {
		// 1. Text same as tooltip and ! in Overflow (doesn't show tooltip)
		// 2. Text same as tooltip and in Overflow (doesn't show tooltip)
		checkTooltipValue(assert, this.oOTB, this.sMenuButtonText, "");
	});

	QUnit.test("getTooltip value with tooltip not matching text", function (assert) {
		// 1. Text diff from tooltip and ! in Overflow (shows tooltip)
		// 2. Text diff from tooltip and in overflow (shows tooltip)
		var sTooltipText = "Simple Tooltip";
		checkTooltipValue(assert, this.oOTB, sTooltipText, sTooltipText);
	});

	QUnit.module("Split MenuButton Tests", {
		beforeEach: function () {
			this.sMenuButtonText = "Menu";
			this.sIcon = "sap-icon://bullet-text";
			this.oOTB = new OverflowToolbar({
				content: new OverflowToolbarMenuButton( "SplitMenuButton", {
					icon: this.sIcon,
					text: this.sMenuButtonText,
					buttonMode: "Split",
					useDefaultActionOnly: true
				})
			});

			this.oOTB.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oOTB.destroy();
			this.oOTB = null;
		}
	});

	QUnit.test("getTooltip value without tooltip", function (assert) {
		// 1. Shows icon default tooltip when not in overflow
		// 2. Doesn't show anything when in overflow
		checkForDefaultTooltip(assert, this.oOTB, this.sIcon);
	});

	QUnit.test("getTooltip value with tooltip matching text", function (assert) {
		// 1. Text same as tooltip and ! in Overflow (doesn't show tooltip)
		// 2. Text same as tooltip and in Overflow (doesn't show tooltip)
		checkTooltipValue(assert, this.oOTB, this.sMenuButtonText, "");
	});

	QUnit.test("getTooltip value with tooltip not matching text", function (assert) {
		// 1: Text diff from tooltip and ! in Overflow (shows tooltip)
		// 2. Text diff from tooltip and in overflow (shows tooltip)
		var sTooltipText = "Simple Tooltip";
		checkTooltipValue(assert, this.oOTB, sTooltipText, sTooltipText);
	});

});
/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickResize",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes"
], function(nextUIUpdate, QUnitUtils, Menu, QuickResize, Button, library, CoreLibrary, KeyCodes) {
	"use strict";

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oQuickResize = new QuickResize();
		},
		afterEach: function () {
			this.oQuickResize.destroy();
		}
	});

	QUnit.test("getEffectiveQuickActions", function(assert) {
		assert.deepEqual(this.oQuickResize.getEffectiveQuickActions(), [this.oQuickResize], "Returns an array that contains the QuickResize instance");
		this.oQuickResize.setVisible(false);
		assert.equal(this.oQuickResize.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 items");
	});

	QUnit.test("Content", function(assert) {
		const oBundle = CoreLibrary.getResourceBundleFor("sap.m");
		const sLabel = oBundle.getText("table.COLUMNMENU_QUICK_RESIZE_LABEL");

		assert.equal(this.oQuickResize.getLabel(), sLabel, "The label is correct");
		assert.equal(this.oQuickResize.getCategory(), library.table.columnmenu.Category.Generic, "The content size is correct");
		assert.equal(this.oQuickResize.getContentSize(),  library.InputListItemContentSize.L, "The width is correct");
		const oStepInput = this.oQuickResize.getContent()[0];
		assert.ok(oStepInput, "The quick resize has content");
		assert.ok(oStepInput.isA("sap.m.StepInput"), "The content is a StepInput");
		assert.equal(oStepInput.getMin(), 48, "The min value of the StepInput is correct");
		assert.equal(oStepInput.getMax(), 2560, "The max value of the StepInput is correct");
		assert.equal(oStepInput.getStep(), 16, "The step of the StepInput is correct");
	});

	QUnit.test("Validation", async function(assert) {
		const oBundle = CoreLibrary.getResourceBundleFor("sap.m");
		const oStepInput = this.oQuickResize.getContent()[0];

		this.oQuickResize.setWidth(100);
		assert.equal(oStepInput.getValue(), 100, "The value is set correctly");

		function testValidation(oQuickResize, iValue, sMessage) {
			return new Promise(function(resolve) {
				oStepInput.attachEventOnce("validationError", function(oEvent) {
					assert.ok(true, "Validation error event is fired");
					assert.equal(oStepInput.getValueStateText(), sMessage, "The value state text is correct");
					resolve();
				});

				oQuickResize.setWidth(iValue);
				oStepInput._verifyValue();
			});
		}

		await testValidation(this.oQuickResize, 10, oBundle.getText("table.COLUMNMENU_QUICK_RESIZE_MIN_ERROR", 48));
		await testValidation(this.oQuickResize, 3000, oBundle.getText("table.COLUMNMENU_QUICK_RESIZE_MAX_ERROR", 2560));
	});
});
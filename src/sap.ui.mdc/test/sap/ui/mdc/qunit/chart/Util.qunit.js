/* global QUnit sinon*/

sap.ui.define([
	"sap/ui/mdc/chart/Util",
	"sap/ui/mdc/enums/ChartItemRoleType",
	"sap/ui/core/Lib"
], (Util, ChartItemRoleType, Library) => {
	"use strict";

	QUnit.module("Util", {
		beforeEach: function () {
			this.stubGetResourceBundle = sinon.stub(Library, "getResourceBundleFor").returns({
				getText: sinon.stub().callsFake((key) => `Text for ${key}`)
			});
		},
		afterEach: function () {
			this.stubGetResourceBundle.restore();
		}
	});

	QUnit.test("getLayoutOptionsForType - dimension", function (assert) {
		const result = Util.getLayoutOptionsForType("dimension");
		assert.deepEqual(result, [
			{ key: ChartItemRoleType.category, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY" },
			{ key: ChartItemRoleType.category2, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY2" },
			{ key: ChartItemRoleType.series, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_SERIES" }
		], "Correct layout options returned for 'dimension'");
	});

	QUnit.test("getLayoutOptionsForType - measure", function (assert) {
		const result = Util.getLayoutOptionsForType("measure");
		assert.deepEqual(result, [
			{ key: ChartItemRoleType.axis1, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1" },
			{ key: ChartItemRoleType.axis2, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS2" },
			{ key: ChartItemRoleType.axis3, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS3" }
		], "Correct layout options returned for 'measure'");
	});

	QUnit.test("getLayoutOptionsForType - unsupported type", function (assert) {
		const result = Util.getLayoutOptionsForType("unsupported");
		assert.deepEqual(result, [], "Empty array returned for unsupported type");
	});

	QUnit.test("getLayoutOptionTextForTypeAndRole - dimension and category", function (assert) {
		const result = Util.getLayoutOptionTextForTypeAndRole("dimension", ChartItemRoleType.category);
		assert.strictEqual(result, "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY", "Correct text returned for 'dimension' and 'category'");
	});

	QUnit.test("getLayoutOptionTextForTypeAndRole - measure and axis1", function (assert) {
		const result = Util.getLayoutOptionTextForTypeAndRole("measure", ChartItemRoleType.axis1);
		assert.strictEqual(result, "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1", "Correct text returned for 'measure' and 'axis1'");
	});

	QUnit.test("getLayoutOptionTextForTypeAndRole - unsupported role", function (assert) {
		const result = Util.getLayoutOptionTextForTypeAndRole("dimension", "unsupportedRole");
		assert.strictEqual(result, undefined, "Undefined returned for unsupported role");
	});

	QUnit.test("getLayoutOptionTextForTypeAndRole - unsupported type", function (assert) {
		const result = Util.getLayoutOptionTextForTypeAndRole("unsupportedType", ChartItemRoleType.category);
		assert.strictEqual(result, undefined, "Undefined returned for unsupported type");
	});

	QUnit.test("getLayoutOptionsForType - case insensitive type", function (assert) {
		const result = Util.getLayoutOptionsForType("DIMENSION");
		assert.deepEqual(result, [
			{ key: ChartItemRoleType.category, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY" },
			{ key: ChartItemRoleType.category2, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY2" },
			{ key: ChartItemRoleType.series, text: "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_SERIES" }
		], "Correct layout options returned for case-insensitive 'dimension'");
	});

	QUnit.test("getLayoutOptionTextForTypeAndRole - case insensitive type", function (assert) {
		const result = Util.getLayoutOptionTextForTypeAndRole("MEASURE", ChartItemRoleType.axis1);
		assert.strictEqual(result, "Text for chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1", "Correct text returned for case-insensitive 'measure' and 'axis1'");
	});
});
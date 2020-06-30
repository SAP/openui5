/*!
 * ${copyright}
 */

/*global QUnit */
/*eslint no-warning-comments: 0 */

sap.ui.define([
		"sap/ui/mdc/condition/ConditionModel",
		"sap/ui/mdc/condition/Condition",
		"sap/ui/mdc/condition/FilterConverter"
		], function(ConditionModel, Condition, FilterConverter) {
	"use strict";

	var oConditionModel;

	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.condition.FilterConverter", {
		beforeEach: function() {
			oConditionModel = new ConditionModel();
		},

		afterEach: function() {
			if (oConditionModel) {
				oConditionModel.destroy();
				oConditionModel = undefined;
			}
		}
	});



	QUnit.test("FilterConverter.createFilters", function(assert) {
		var oCM = new ConditionModel();
		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter, null, "filter is null");
		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "");

		oCM.addCondition("fieldPath1/foo", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", [1, 100]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition("EQ", ["bar"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "((fieldPath1/foo EQ 'foo' or fieldPath1/foo BT '1'...'100') and fieldPath2/bar EQ 'bar')", "result filter has the correct AND and OR structure");

		oCM.removeAllConditions();
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition("BT", [1, 100]));
		oCM.addCondition("fieldPath2/foo", Condition.createCondition("EQ", ["bar"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		var filter = oFilter.aFilters[0];
		if (filter.sPath !== "fieldPath1") {
			filter = filter.aFilters[1]; // as order could be different
		}
		assert.strictEqual(filter.sOperator, "Any", "two filters must be returned on top level");
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1 Any 'undefined' and fieldPath2/foo EQ 'bar')");

		oCM.removeAllConditions();
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X')");

		oCM.removeAllConditions();
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["Y"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter.aFilters.length, 3, "3 filters must be returned on top level (multiple NE filters)");
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')");

		oCM.removeAllConditions();
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["Y"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition("EQ", ["FOO"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition("EQ", ["BAR"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.strictEqual(oFilter.aFilters[0].aFilters.length, 3, "3 filters must be returned at nested level");
		assert.ok(oFilter.aFilters[0].bAnd, "exclude filters must be connected via AND");
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "((fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y') and (fieldPath2/bar EQ 'FOO' or fieldPath2/bar EQ 'BAR'))");

		oCM.removeAllConditions();
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("EQ", ["FOO"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("EQ", ["BAR"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["Y"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		assert.notOk(oFilter.aFilters[0].bAnd, "multiple non-exclude filters on same path are unaffected by AND grouping");
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "((fieldPath1/foo EQ 'FOO' or fieldPath1/foo EQ 'BAR') and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')");

		oCM.destroy();
	});

});

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

	var oCM;

	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.condition.FilterConverter", {
		beforeEach: function() {
			oCM = new ConditionModel();
		},

		afterEach: function() {
			if (oCM) {
				oCM.destroy();
				oCM = undefined;
			}
		}
	});


	QUnit.test("FilterConverter.createFilters: testing the basic format of filter the and and or structor", function(assert) {
		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter, null, "filter is null");
		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "", "result should be an empty filter");

		oCM.addCondition("fieldPath1/foo", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", [1, 100]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition("EQ", ["bar"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "((fieldPath1/foo EQ 'foo' or fieldPath1/foo BT '1'...'100') and fieldPath2/bar EQ 'bar')", "result filter has the correct AND and OR structure");
	});


	QUnit.test("FilterConverter.createFilters: testing a single include and a single exclude for one FieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing multiple include for one FieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["Y"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 3, "3 filters must be returned on top level (multiple NE filters)");
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing multiple include and exclude conditions", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("EQ", ["FOO"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("EQ", ["BAR"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["Y"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		assert.notOk(oFilter.aFilters[0].bAnd, "multiple non-exclude filters on same path are unaffected by AND grouping");
		assert.strictEqual(result, "((fieldPath1/foo EQ 'FOO' or fieldPath1/foo EQ 'BAR') and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing multiple include and exclude conditions for different fieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("BT", ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("NE", ["Y"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition("EQ", ["FOO"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition("EQ", ["BAR"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.strictEqual(oFilter.aFilters[0].aFilters.length, 3, "3 filters must be returned at nested level");
		assert.ok(oFilter.aFilters[0].bAnd, "exclude filters must be connected via AND");
		assert.strictEqual(result, "((fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y') and (fieldPath2/bar EQ 'FOO' or fieldPath2/bar EQ 'BAR'))", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing basic Search conditions", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition("EQ", ["FOO"]));
		oCM.addCondition("$search", Condition.createCondition("EQ", ["search"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "fieldPath1/foo EQ 'FOO'", "result filter has the expected format and $search is ignored");

	});


	QUnit.test("FilterConverter.createFilters: testing conditions with multiple parts", function(assert) {
		oCM.addCondition("*fieldPath1,fieldPath2*", Condition.createCondition("EQ", ["FOO"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1 EQ 'FOO' or fieldPath2 EQ 'FOO')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing include and exclude Any support together with a normal fieldPath", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition("EQ", ["foo"]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition("BT", [1, 100]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition("NE", ["bar"]));
		oCM.addCondition("fieldPath2/foo", Condition.createCondition("EQ", ["bar"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		var filter = oFilter.aFilters[0];
		if (filter.sPath !== "fieldPath1") {
			filter = filter.aFilters[1]; // as order could be different
		}

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(filter.sOperator, "Any", "Filter with Any operator exist");
		assert.strictEqual(result, "(fieldPath1 Any ((L1/foo EQ 'foo' or L1/foo BT '1'...'100') and L1/foo NE 'bar') and fieldPath2/foo EQ 'bar')", "result contains the expected Any filter");

	});


	QUnit.test("FilterConverter.createFilters: testing wrong any condition fieldPath", function(assert) {
		oCM.addCondition("fieldPath1*/foo*/bar", Condition.createCondition("EQ", ["bar"]));
		try {
			FilterConverter.createFilters( oCM.getAllConditions(), {});
			assert.ok(false, "exception not raised");
		} catch (error) {
			assert.ok(true, "exception should be raised");
		}

	});


	QUnit.test("FilterConverter.createFilters: testing include and exclude operations for Any conditions", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition("EQ", ["foo1"]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition("EQ", ["foo2"]));
		oCM.addCondition("fieldPath2*/bar", Condition.createCondition("EQ", ["bar1"]));
		oCM.addCondition("fieldPath2*/bar", Condition.createCondition("EQ", ["bar2"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "(fieldPath1 Any (L1/foo EQ 'foo1' or L1/foo EQ 'foo2') and fieldPath2 Any (L1/bar EQ 'bar1' or L1/bar EQ 'bar2'))", "result contains the expected Any filter");

	});


	QUnit.test("FilterConverter.createFilters: testing include and exclude operations for All conditions", function(assert) {
		oCM.addCondition("fieldPath1+/foo", Condition.createCondition("EQ", ["foo1"]));
		oCM.addCondition("fieldPath1+/foo", Condition.createCondition("EQ", ["foo2"]));
		oCM.addCondition("fieldPath2+/bar", Condition.createCondition("EQ", ["bar1"]));
		oCM.addCondition("fieldPath2+/bar", Condition.createCondition("EQ", ["bar2"]));

		var oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		var result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "(fieldPath1 All (L1/foo EQ 'foo1' or L1/foo EQ 'foo2') and fieldPath2 All (L1/bar EQ 'bar1' or L1/bar EQ 'bar2'))", "result contains the expected Any filter");

	});


});

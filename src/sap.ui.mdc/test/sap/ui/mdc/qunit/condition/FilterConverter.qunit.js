/*!
 * ${copyright}
 */

/*global QUnit */
/*eslint no-warning-comments: 0 */

sap.ui.define([
		"sap/ui/mdc/condition/ConditionModel",
		"sap/ui/mdc/condition/Condition",
		"sap/ui/mdc/condition/FilterConverter",
		"sap/ui/mdc/enums/OperatorName"
		], function(ConditionModel, Condition, FilterConverter, OperatorName) {
	"use strict";

	let oCM;

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
		let oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		assert.strictEqual(oFilter, null, "filter is null");
		let result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "no filters set", "result should be an empty filter");

		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, [1, 100]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition(OperatorName.EQ, ["bar"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "((fieldPath1/foo EQ 'foo' or fieldPath1/foo BT '1'...'100') and fieldPath2/bar EQ 'bar')", "result filter has the correct AND and OR structure");
	});


	QUnit.test("FilterConverter.createFilters: testing a single include and a single exclude for one FieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing multiple include for one FieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["Y"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 3, "3 filters must be returned on top level (multiple NE filters)");
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing multiple include and exclude conditions", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["FOO"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["BAR"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["Y"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		assert.notOk(oFilter.aFilters[0].bAnd, "multiple non-exclude filters on same path are unaffected by AND grouping");
		assert.strictEqual(result, "((fieldPath1/foo EQ 'FOO' or fieldPath1/foo EQ 'BAR') and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing multiple include and exclude conditions for different fieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["Y"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition(OperatorName.EQ, ["FOO"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition(OperatorName.EQ, ["BAR"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.strictEqual(oFilter.aFilters[0].aFilters.length, 3, "3 filters must be returned at nested level");
		assert.ok(oFilter.aFilters[0].bAnd, "exclude filters must be connected via AND");
		assert.strictEqual(result, "((fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y') and (fieldPath2/bar EQ 'FOO' or fieldPath2/bar EQ 'BAR'))", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing basic Search conditions", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["FOO"]));
		oCM.addCondition("$search", Condition.createCondition(OperatorName.EQ, ["search"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "fieldPath1/foo EQ 'FOO'", "result filter has the expected format and $search is ignored");

	});


	QUnit.test("FilterConverter.createFilters: testing conditions with multiple parts", function(assert) {
		oCM.addCondition("*fieldPath1,fieldPath2*", Condition.createCondition(OperatorName.EQ, ["FOO"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1 EQ 'FOO' or fieldPath2 EQ 'FOO')", "result filter has the expected format");

	});


	QUnit.test("FilterConverter.createFilters: testing include and exclude Any support together with a normal fieldPath", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.BT, [1, 100]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.NE, ["bar"]));
		oCM.addCondition("fieldPath2/foo", Condition.createCondition(OperatorName.EQ, ["bar"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});
		let filter = oFilter.aFilters[0];
		if (filter.sPath !== "fieldPath1") {
			filter = filter.aFilters[1]; // as order could be different
		}

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(filter.sOperator, "Any", "Filter with Any operator exist");
		assert.strictEqual(result, "(fieldPath1 Any ((L1/foo EQ 'foo' or L1/foo BT '1'...'100') and L1/foo NE 'bar') and fieldPath2/foo EQ 'bar')", "result contains the expected Any filter");

	});


	QUnit.test("FilterConverter.createFilters: testing wrong any condition fieldPath", function(assert) {
		oCM.addCondition("fieldPath1*/foo*/bar", Condition.createCondition(OperatorName.EQ, ["bar"]));
		try {
			FilterConverter.createFilters( oCM.getAllConditions(), {});
			assert.ok(false, "exception not raised");
		} catch (error) {
			assert.ok(true, "exception should be raised");
		}

	});


	QUnit.test("FilterConverter.createFilters: testing include and exclude operations for Any conditions", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.EQ, ["foo1"]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.EQ, ["foo2"]));
		oCM.addCondition("fieldPath2*/bar", Condition.createCondition(OperatorName.EQ, ["bar1"]));
		oCM.addCondition("fieldPath2*/bar", Condition.createCondition(OperatorName.EQ, ["bar2"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "(fieldPath1 Any (L1/foo EQ 'foo1' or L1/foo EQ 'foo2') and fieldPath2 Any (L1/bar EQ 'bar1' or L1/bar EQ 'bar2'))", "result contains the expected Any filter");

	});


	QUnit.test("FilterConverter.createFilters: testing include and exclude operations for All conditions", function(assert) {
		oCM.addCondition("fieldPath1+/foo", Condition.createCondition(OperatorName.EQ, ["foo1"]));
		oCM.addCondition("fieldPath1+/foo", Condition.createCondition(OperatorName.EQ, ["foo2"]));
		oCM.addCondition("fieldPath2+/bar", Condition.createCondition(OperatorName.EQ, ["bar1"]));
		oCM.addCondition("fieldPath2+/bar", Condition.createCondition(OperatorName.EQ, ["bar2"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "(fieldPath1 All (L1/foo EQ 'foo1' or L1/foo EQ 'foo2') and fieldPath2 All (L1/bar EQ 'bar1' or L1/bar EQ 'bar2'))", "result contains the expected Any filter");

	});

	QUnit.test("FilterConverter.createFilters: testing caseSensitive types", function(assert) {
		oCM.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["Foo1"]));
		oCM.addCondition("fieldPath2", Condition.createCondition(OperatorName.EQ, ["Foo2"]));
		oCM.addCondition("fieldPath3", Condition.createCondition(OperatorName.EQ, ["Foo3"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {
			"fieldPath1" : {type: null, caseSensitive: false},	// the first property should be handled caseInsensitive
			"fieldPath2" : {type: null, caseSensitive: true},
			"fieldPath3" : {type: null}
		});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 3, "three filters must be returned on top level");
		assert.ok(oFilter.aFilters[0].bCaseSensitive === false, "first Filter should have caseSensitive false");
		assert.ok(oFilter.aFilters[1].bCaseSensitive === undefined, "second Filter should have caseSensitive undefined/true");
		assert.ok(oFilter.aFilters[2].bCaseSensitive === undefined, "last Filter should have caseSensitive undefined/true");
		assert.strictEqual(result, "(tolower(fieldPath1) EQ tolower('Foo1') and fieldPath2 EQ 'Foo2' and fieldPath3 EQ 'Foo3')", "result contains the filter");

	});

});

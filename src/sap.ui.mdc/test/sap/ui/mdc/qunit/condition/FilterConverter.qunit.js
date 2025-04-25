/*!
 * ${copyright}
 */

/*global QUnit, sinon */
/*eslint no-warning-comments: 0 */

sap.ui.define([
		"sap/ui/mdc/condition/ConditionModel",
		"sap/ui/mdc/condition/Condition",
		"sap/ui/mdc/condition/FilterConverter",
		"sap/ui/mdc/condition/FilterOperatorUtil",
		"sap/ui/mdc/condition/Operator",
		"sap/ui/mdc/enums/BaseType",
		"sap/ui/mdc/enums/OperatorName",
		"sap/ui/mdc/enums/OperatorOverwrite",
		"sap/ui/model/Filter",
		"sap/ui/model/type/String",
		"sap/base/Log"
		], function(ConditionModel, Condition, FilterConverter, FilterOperatorUtil, Operator, BaseType, OperatorName, OperatorOverwrite, Filter, StringType, Log) {
	"use strict";

	let oCM;
	let oConditionTypes;
	let oStringType;

	//*********************************************************************************************
	QUnit.module("sap.ui.mdc.condition.FilterConverter.createFilters", {
		beforeEach: function() {
			oCM = new ConditionModel();
			oStringType = new StringType();
			oConditionTypes = {
				"fieldPath1": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath1/foo": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath1*/foo": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath1*/foo*/bar": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath1+/foo": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath2": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath2/bar": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath2/foo": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath2*/bar": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath2+/bar": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"fieldPath3": {type: oStringType, baseType: BaseType.String, caseSensitive: true},
				"$search": {type: oStringType, baseType: BaseType.String, caseSensitive: true}
			};
		},

		afterEach: function() {
			if (oCM) {
				oCM.destroy();
				oCM = undefined;
			}
			oStringType.destroy();
			oStringType = undefined;
			oConditionTypes = undefined;
		}
	});


	QUnit.test("testing the basic format of filter the and and or structor", function(assert) {
		let oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		assert.strictEqual(oFilter, null, "filter is null");
		let result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "no filters set", "result should be an empty filter");

		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, [1, 100]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition(OperatorName.EQ, ["bar"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition("XXX", ["X"])); // unknown operatord should be ignored

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "((fieldPath1/foo EQ 'foo' or fieldPath1/foo BT '1'...'100') and fieldPath2/bar EQ 'bar')", "result filter has the correct AND and OR structure");
	});


	QUnit.test("testing a single include and a single exclude for one FieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X')", "result filter has the expected format");

	});


	QUnit.test("testing multiple include for one FieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["Y"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 3, "3 filters must be returned on top level (multiple NE filters)");
		assert.strictEqual(result, "(fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')", "result filter has the expected format");

	});


	QUnit.test("testing multiple include and exclude conditions", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["FOO"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["BAR"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["Y"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.ok(oFilter.bAnd, "exclude filters must be connected via AND");
		assert.notOk(oFilter.aFilters[0].bAnd, "multiple non-exclude filters on same path are unaffected by AND grouping");
		assert.strictEqual(result, "((fieldPath1/foo EQ 'FOO' or fieldPath1/foo EQ 'BAR') and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y')", "result filter has the expected format");

	});


	QUnit.test("testing multiple include and exclude conditions for different fieldPath", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.BT, ["A", "Z"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["X"]));
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.NE, ["Y"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition(OperatorName.EQ, ["FOO"]));
		oCM.addCondition("fieldPath2/bar", Condition.createCondition(OperatorName.EQ, ["BAR"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "2 filters must be returned on top level");
		assert.strictEqual(oFilter.aFilters[0].aFilters.length, 3, "3 filters must be returned at nested level");
		assert.ok(oFilter.aFilters[0].bAnd, "exclude filters must be connected via AND");
		assert.strictEqual(result, "((fieldPath1/foo BT 'A'...'Z' and fieldPath1/foo NE 'X' and fieldPath1/foo NE 'Y') and (fieldPath2/bar EQ 'FOO' or fieldPath2/bar EQ 'BAR'))", "result filter has the expected format");

	});


	QUnit.test("testing basic Search conditions", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["FOO"]));
		oCM.addCondition("$search", Condition.createCondition(OperatorName.EQ, ["search"]));
		oCM.addCondition("$search", Condition.createCondition(OperatorName.NE, ["search"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "fieldPath1/foo EQ 'FOO'", "result filter has the expected format and $search is ignored");

	});


	QUnit.test("testing conditions with multiple parts", function(assert) {
		oCM.addCondition("*fieldPath1,fieldPath2*", Condition.createCondition(OperatorName.EQ, ["FOO"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1 EQ 'FOO' or fieldPath2 EQ 'FOO')", "result filter has the expected format");

	});


	QUnit.test("testing include and exclude Any support together with a normal fieldPath", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.EQ, ["foo"]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.BT, [1, 100]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.NE, ["bar"]));
		oCM.addCondition("fieldPath2/foo", Condition.createCondition(OperatorName.EQ, ["bar"]));

		let oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		let filter = oFilter.aFilters[0];
		if (filter.sPath === "fieldPath2") {
			filter = filter.aFilters[1]; // as order could be different
		}

		let result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(filter.aFilters.length, 2, "two filters must be returned for FieldPath1");
		assert.strictEqual(filter.aFilters[0].sOperator, "Any", "Filter with Any operator exist");
		assert.strictEqual(filter.aFilters[1].sOperator, "All", "Filter with All operator exist");
		assert.strictEqual(result, "((L1:fieldPath1 Any (L1/foo EQ 'foo' or L1/foo BT '1'...'100') and L1:fieldPath1 All L1/foo NE 'bar') and fieldPath2/foo EQ 'bar')", "result contains the expected Any filter");

		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.NE, ["XXX"]));
		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "((L1:fieldPath1 Any (L1/foo EQ 'foo' or L1/foo BT '1'...'100') and L1:fieldPath1 All (L1/foo NE 'bar' and L1/foo NE 'XXX')) and fieldPath2/foo EQ 'bar')", "result contains the expected Any filter");

	});


	QUnit.test("testing wrong any condition fieldPath", function(assert) {
		oCM.addCondition("fieldPath1*/foo*/bar", Condition.createCondition(OperatorName.EQ, ["bar"]));
		try {
			FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
			assert.ok(false, "exception not raised");
		} catch (error) {
			assert.ok(true, "exception should be raised");
		}

	});


	QUnit.test("testing include and exclude operations for Any conditions", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.EQ, ["foo1"]));
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.EQ, ["foo2"]));
		oCM.addCondition("fieldPath2*/bar", Condition.createCondition(OperatorName.EQ, ["bar1"]));
		oCM.addCondition("fieldPath2*/bar", Condition.createCondition(OperatorName.EQ, ["bar2"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "(L1:fieldPath1 Any (L1/foo EQ 'foo1' or L1/foo EQ 'foo2') and L1:fieldPath2 Any (L1/bar EQ 'bar1' or L1/bar EQ 'bar2'))", "result contains the expected Any filter");

	});


	QUnit.test("testing include and exclude operations for All conditions", function(assert) {
		oCM.addCondition("fieldPath1+/foo", Condition.createCondition(OperatorName.EQ, ["foo1"]));
		oCM.addCondition("fieldPath1+/foo", Condition.createCondition(OperatorName.EQ, ["foo2"]));
		oCM.addCondition("fieldPath2+/bar", Condition.createCondition(OperatorName.EQ, ["bar1"]));
		oCM.addCondition("fieldPath2+/bar", Condition.createCondition(OperatorName.EQ, ["bar2"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 2, "two filters must be returned on top level");
		assert.strictEqual(result, "(L1:fieldPath1 All (L1/foo EQ 'foo1' or L1/foo EQ 'foo2') and L1:fieldPath2 All (L1/bar EQ 'bar1' or L1/bar EQ 'bar2'))", "result contains the expected Any filter");

	});

	QUnit.test("testing Empty operation for Any conditions", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.Empty, []));

		let oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		let result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "L1:fieldPath1 All (L1/foo EQ 'null' and L1/foo NE 'null')", "result contains the expected Any filter");

		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.EQ, ["foo"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(L1:fieldPath1 All (L1/foo EQ 'null' and L1/foo NE 'null') or L1:fieldPath1 Any L1/foo EQ 'foo')", "result contains the expected Any filter");

		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.NE, ["xxx"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "((L1:fieldPath1 All (L1/foo EQ 'null' and L1/foo NE 'null') or L1:fieldPath1 Any L1/foo EQ 'foo') and L1:fieldPath1 All L1/foo NE 'xxx')", "result contains the expected Any filter");
	});

	QUnit.test("testing NotEmpty operation for Any conditions", function(assert) {
		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.NotEmpty, []));

		let oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		let result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "fieldPath1 Any no filters set", "result contains the expected Any filter");

		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.NE, ["foo"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1 Any no filters set and L1:fieldPath1 All L1/foo NE 'foo')", "result contains the expected Any filter");

		oCM.addCondition("fieldPath1*/foo", Condition.createCondition(OperatorName.NE, ["xxx"]));

		oFilter = FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
		result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(result, "(fieldPath1 Any no filters set and L1:fieldPath1 All (L1/foo NE 'foo' and L1/foo NE 'xxx'))", "result contains the expected Any filter");
	});

	QUnit.test("testing caseSensitive types", function(assert) {
		oCM.addCondition("fieldPath1", Condition.createCondition(OperatorName.EQ, ["Foo1"]));
		oCM.addCondition("fieldPath2", Condition.createCondition(OperatorName.EQ, ["Foo2"]));
		oCM.addCondition("fieldPath3", Condition.createCondition(OperatorName.EQ, ["Foo3"]));

		const oFilter = FilterConverter.createFilters( oCM.getAllConditions(), {
			"fieldPath1" : {type: oStringType, baseType: BaseType.String, caseSensitive: false},	// the first property should be handled caseInsensitive
			"fieldPath2" : {type: oStringType, caseSensitive: true},
			"fieldPath3" : {type: null}
		});

		const result = FilterConverter.prettyPrintFilters(oFilter);
		assert.strictEqual(oFilter.aFilters.length, 3, "three filters must be returned on top level");
		assert.ok(oFilter.aFilters[0].bCaseSensitive === false, "first Filter should have caseSensitive false");
		assert.ok(oFilter.aFilters[1].bCaseSensitive === undefined, "second Filter should have caseSensitive undefined/true");
		assert.ok(oFilter.aFilters[2].bCaseSensitive === undefined, "last Filter should have caseSensitive undefined/true");
		assert.strictEqual(result, "(tolower(fieldPath1) EQ tolower('Foo1') and fieldPath2 EQ 'Foo2' and fieldPath3 EQ 'Foo3')", "result contains the filter");

	});

	QUnit.test("testing Error in Filter creation", function(assert) {
		oCM.addCondition("fieldPath1/foo", Condition.createCondition(OperatorName.EQ, ["foo"]));

		const oOperator = FilterOperatorUtil.getOperator(OperatorName.EQ);
		sinon.stub(Operator.prototype, "getModelFilter").throws(new Error("Test"));
		sinon.spy(Log, "error");

		try {
			FilterConverter.createFilters( oCM.getAllConditions(), oConditionTypes);
			assert.ok(Log.error.calledOnce, "Error shown in Log");
		} catch (oError) {
			assert.ok(false, "Exception must not be thrown");
		}

		oOperator.getModelFilter.restore();
		Log.error.restore();

	});

	let oFakeFilterBar;
	QUnit.module("sap.ui.mdc.condition.FilterConverter", {
		beforeEach: function() {
			oStringType = new StringType();
			oFakeFilterBar = {
				_getPropertyByName: (sFieldPath) => {
					if (sFieldPath === "fieldPath1") {
						return {
							name: "fieldPath1",
							typeConfig: {typeInstance: oStringType}
						};
					}
				},
				_getFilterField: (sFieldPath) => {
					if (sFieldPath === "fieldPath2") {
						return {
							getFormatOptions: () => {return {originalDateType: oStringType};}
						};
					} else {
						return {
							getFormatOptions: () => {return {valueType: oStringType};}
						};
					}
				}
			};
		},

		afterEach: function() {
			oStringType.destroy();
			oStringType = undefined;
			oFakeFilterBar = undefined;
		}
	});

	QUnit.test("createConditionTypesMapFromFilterBar", function(assert) {
		const oConditions = {
			"fieldPath1": [Condition.createCondition(OperatorName.EQ, ["Foo1"])],
			"fieldPath2": [Condition.createCondition(OperatorName.EQ, ["Foo2"])],
			"fieldPath3": [Condition.createCondition(OperatorName.EQ, ["Foo3"])]
		};
		const oTypes = {
			"fieldPath1": {type: oStringType},
			"fieldPath2": {type: oStringType},
			"fieldPath3": {type: oStringType}
		};

		const oResult = FilterConverter.createConditionTypesMapFromFilterBar(oConditions, oFakeFilterBar);

		assert.deepEqual(oResult, oTypes, "ConditionTypesMap returned");
	});


});

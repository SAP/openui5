/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/FilterUtil",
	"sap/ui/mdc/Control",
	"sap/ui/model/type/String" // needs to be loaded for legacyFree UI5
], function(
	FilterUtil,
	Control,
	StringType
) {
	"use strict";

	QUnit.module("FilterUtil basics", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("check getPropertyByKey method", function(assert) {
		const aPropertyMetadata = [{name: "Property0"}, {name: "Property1"}, {name: "Property2"}];
		let oProperty = FilterUtil.getPropertyByKey(aPropertyMetadata, "Property1");
		assert.ok(oProperty);

		oProperty = FilterUtil.getPropertyByKey(aPropertyMetadata, "Property2");
		assert.ok(oProperty);

		oProperty = FilterUtil.getPropertyByKey(aPropertyMetadata, "NIL");
		assert.ok(!oProperty);
	});

	QUnit.test("check getConditionsMap method", function(assert) {
		const oInnerConditions = {
			"Filter1" : [{operator: "EQ", values: ["values1"]}, {operator: "BT", values: ["0", "10"]}],
			"Filter2" : [{operator: "EQ", values: ["values2"], inParameters : "test"}],
			"Filter3" : [{operator: "EQ", values: ["values3", "Some Text"], isEmpty: true, validated: "Validated"}]
		};
		const oFilterBar = {
			getInternalConditions: function() {
				return oInnerConditions;
			},
			isA : function(s) { return true; }
		};

		const oResultingConditions = FilterUtil.getConditionsMap(oFilterBar, ["Filter1", "Filter3", "Filter4"]);
		assert.ok(oResultingConditions);
		assert.equal(Object.keys(oResultingConditions).length, 2);
		assert.ok(oResultingConditions["Filter1"]);
		assert.equal(oResultingConditions["Filter1"].length, 2);
		assert.deepEqual(oResultingConditions["Filter1"], [{operator: "EQ", values: ["values1"]}, {operator: "BT", values: ["0", "10"]}]);

		assert.ok(oResultingConditions["Filter3"]);
		assert.equal(oResultingConditions["Filter3"].length, 1);
		assert.deepEqual(oResultingConditions["Filter3"], [{operator: "EQ", values: ["values3"]}]);

		assert.ok(!oResultingConditions["Filter4"]);
	});

	QUnit.test("check getRequiredFieldNamesWithoutValues method", function(assert) {
		let aReturns = {"A": {}, "B":{}};
		const oFilterBar = {
				_getRequiredPropertyNames: function() {
					return ["A", "B"];
				},
				_getConditionModel: function() {
					return {
						getConditions: function(s) {
							return (s === "A") ? aReturns["A"] : aReturns["B"];
						}
					};
				}
		};

		let aMissingRequiredNames = FilterUtil.getRequiredFieldNamesWithoutValues(oFilterBar);
		assert.equal(aMissingRequiredNames.length, 0);

		aReturns = {"A": {}};
		aMissingRequiredNames = FilterUtil.getRequiredFieldNamesWithoutValues(oFilterBar);
		assert.equal(aMissingRequiredNames.length, 1);
		assert.equal(aMissingRequiredNames[0], "B");

		aReturns = {"B": {}};
		aMissingRequiredNames = FilterUtil.getRequiredFieldNamesWithoutValues(oFilterBar);
		assert.equal(aMissingRequiredNames.length, 1);
		assert.equal(aMissingRequiredNames[0], "A");

		aReturns = {};
		aMissingRequiredNames = FilterUtil.getRequiredFieldNamesWithoutValues(oFilterBar);
		assert.equal(aMissingRequiredNames.length, 2);
		assert.equal(aMissingRequiredNames[0], "A");
		assert.equal(aMissingRequiredNames[1], "B");
	});

	QUnit.test("check key to path mapping in #getFilterInfo (keys are valid paths already --> backwards compatibility)", function(assert) {
		const oControl = new Control({
			delegate: {
				payload: {},
				name: "sap/ui/mdc/AggregationBaseDelegate"
			}
		});

		return oControl.initControlDelegate()
		.then(function(){

			const oConditions = {
				myProperty: [{
					operator: "EQ",
					values: [
						"test"
					]
				}]
			};
			const aProperties = [
				{name: "myProperty", path: "myProperty", typeConfig: oControl.getTypeMap(oControl).getTypeConfig("String", null, null)}
			];

			const oFilterInfo = FilterUtil.getFilterInfo(oControl, oConditions, aProperties);

			assert.equal(oFilterInfo.filters.sOperator, "EQ", "Correct operator set in model filter");
			assert.equal(oFilterInfo.filters.sPath, "myProperty", "Correct path set in model filter");

			return;

		});
	});

	QUnit.test("check key to path mapping in #getFilterInfo (unique property keys are mapped to valid model paths)", function(assert) {
		const oControl = new Control({
			delegate: {
				payload: {},
				name: "sap/ui/mdc/AggregationBaseDelegate"
			}
		});

		return oControl.initControlDelegate()
		.then(function(){

			const oConditions = {
				keyMyProperty: [{
					operator: "EQ",
					values: [
						"test"
					]
				}]
			};
			const aProperties = [
				{name: "keyMyProperty", path: "path/to/property", typeConfig: oControl.getTypeMap(oControl).getTypeConfig("String", null, null)}
			];

			const oFilterInfo = FilterUtil.getFilterInfo(oControl, oConditions, aProperties);

			assert.equal(oFilterInfo.filters.sOperator, "EQ", "Correct operator set in model filter");
			assert.equal(oFilterInfo.filters.sPath, "path/to/property", "Correct path set in model filter");

			return;

		});
	});

});

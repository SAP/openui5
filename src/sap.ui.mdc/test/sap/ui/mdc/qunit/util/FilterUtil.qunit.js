/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/FilterUtil"
], function(
	FilterUtil
) {
	"use strict";

	QUnit.module("FilterUtil basics", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("check getPropertyByKey method", function(assert) {
		var aPropertyMetadata = [{name: "Property0"}, {name: "Property1"}, {name: "Property2"}];
		var oProperty = FilterUtil.getPropertyByKey(aPropertyMetadata, "Property1");
		assert.ok(oProperty);

		oProperty = FilterUtil.getPropertyByKey(aPropertyMetadata, "Property2");
		assert.ok(oProperty);

		oProperty = FilterUtil.getPropertyByKey(aPropertyMetadata, "NIL");
		assert.ok(!oProperty);
	});

	QUnit.test("check getConditionsMap method", function(assert) {
		var oInnerConditions = {
			"Filter1" : [{operator: "EQ", values: ["values1"]}, {operator: "BT", values: ["0", "10"]}],
			"Filter2" : [{operator: "EQ", values: ["values2"], inParameters : "test"}],
			"Filter3" : [{operator: "EQ", values: ["values3", "Some Text"], isEmpty: true, validated: "Validated"}]
		};
		var oFilterBar = {
			getInternalConditions: function() {
				return oInnerConditions;
			},
			isA : function(s) { return true; }
		};

		var oResultingConditions = FilterUtil.getConditionsMap(oFilterBar, ["Filter1", "Filter3", "Filter4"]);
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

});

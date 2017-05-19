/* global  QUnit */
sap.ui.define(['sap/ui/model/Filter', 'sap/ui/model/FilterOperator'],
	function(Filter, FilterOperator) {
	"use strict";

	var sVariableError = "When using the filter operators 'Any' or 'All', a string has to be given as argument 'variable'.";
	var sConditionError = "When using the filter operator 'Any' or 'All', a valid instance of sap.ui.model.Filter has to be given as argument 'condition'.";
	var sOneMissing = "When using the filter operator 'Any', a lambda variable and a condition have to be given or neither.";
	var sLegacyAnyAll = "The filter operators 'Any' and 'All' are only supported with the parameter object notation.";

	QUnit.module("Unsupported Filter Operators");

	QUnit.test("constructor - create Filter Any/All - ok", function (assert) {
		// "Any", object syntax
		new sap.ui.model.Filter({
			path: "Order_Details",
			operator: FilterOperator.Any,
			variable: "d",
			condition: new sap.ui.model.Filter(FilterOperator.EQ, 200)
		});
		assert.ok(true, "Filter 'Any' is created without an error");

		// "Any" without variable and condition (object syntax)
		new sap.ui.model.Filter({
			path: "Order_Details",
			operator: FilterOperator.Any
		});
		assert.ok(true, "Filter 'Any' is created without an error");
	});

	QUnit.test("constructor - wrong args", function (assert) {
		//"Any" and "All" with legacy syntax
		assert.throws(
			function() {
				new sap.ui.model.Filter("test", FilterOperator.Any, "notSupported", new sap.ui.model.Filter());
			},
			new Error(sLegacyAnyAll),
			"'Any' is not accepted with legacy syntax"
		);
		assert.throws(
			function() {
				new sap.ui.model.Filter("test", FilterOperator.All, "notSupported", new sap.ui.model.Filter());
			},
			new Error(sLegacyAnyAll),
			"'All' is not accepted with legacy syntax"
		);
		assert.throws(
			function() {
				new sap.ui.model.Filter("test", FilterOperator.Any);
			},
			new Error(sLegacyAnyAll),
			"'Any' is not accepted with legacy syntax and missing 3rd and 4th argument"
		);

		// "Any" with missing args, object syntax
		assert.throws(
			function() {
				new sap.ui.model.Filter({
					path: "foo",
					operator: FilterOperator.Any,
					variable: "blub"
				});
			},
			new Error(sOneMissing),
			"Error thrown if condition is Missing in 'Any'."
		);

		// "All" with missing args, object syntax
		assert.throws(
			function() {
				new sap.ui.model.Filter({
					path: "foo",
					operator: FilterOperator.All,
					variable: "blub"
				});
			},
			new Error(sConditionError),
			"Error thrown if condition is Missing in 'All'."
		);

		// "All" with no args, object syntax
		assert.throws(
			function() {
				new sap.ui.model.Filter({
					path: "foo",
					operator: FilterOperator.All
				});
			},
			new Error(sVariableError),
			"Error thrown if no args are given with 'All' operator"
		);
	});
});
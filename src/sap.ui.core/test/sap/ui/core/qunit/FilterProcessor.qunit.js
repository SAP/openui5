/* global QUnit, sinon*/
sap.ui.define([
	'sap/ui/model/FilterProcessor',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/Device'
], function(FilterProcessor, Filter, FilterOperator, Device) {
	"use strict";

	QUnit.module("sap.ui.model.FilterProcessor: Operators");

	QUnit.test("Contains", function(assert) {

		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.Contains,
			value1: "board",
			caseSensitive: true
		});

		var a = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling", "Snowboarding", "Surfing"];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Wakeboarding", "Skateboarding", "Snowboarding"], "Filter result for Contains is correct.");

	});

	QUnit.test("BT (between)", function(assert) {

		// excluding Hockey
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.BT,
			value1: "B",
			value2: "H"
		});

		var a = ["Football", "Soccer", "Basketball", "Hockey", "Baseball", "Tennis"];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Football", "Basketball", "Baseball"], "Filter result for Beween is correct, excluding 'Hockey'.");

		// including Hockey
		oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.BT,
			value1: "B",
			value2: "Hockey"
		});

		aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Football", "Basketball", "Hockey", "Baseball"], "Filter result for Between is correct, including 'Hockey'.");

	});

	QUnit.test("BT (between) - numbers", function(assert) {

		// excluding Hockey
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.BT,
			value1: 10,
			value2: 100
		});

		var a = [11, 5, 10, 16, 4, 120, 100, 101];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, [11, 10, 16, 100], "Filter result for Beween is correct, excluding 'Hockey'.");
	});

	QUnit.test("startsWith", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.StartsWith,
			value1: "Bas"
		});

		var a = ["Football", "Soccer", "Basketball", "Hockey", "Baseball", "Tennis" ];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Basketball", "Baseball"], "Filter result for startsWith is correct.");
	});

	QUnit.test("EndsWith", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.EndsWith,
			value1: "ball"
		});

		var a = ["Football", "Soccer", "Basketball", "Hockey", "Baseball", "Tennis"];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Football", "Basketball", "Baseball"], "Filter result for NotEndsWith is correct.");
	});

	QUnit.module("sap.ui.model.FilterProcessor: Negated Operators");

	QUnit.test("NotContains", function(assert) {

		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.NotContains,
			value1: "board",
			caseSensitive: true
		});

		var a = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling", "Snowboarding", "Surfing"];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Tennis", "Marathon", "Cycling", "Surfing"], "Filter result for NotContains is correct.");

	});

	QUnit.test("NB (Not between)", function(assert) {

		// including Hockey
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.NB,
			value1: "B",
			value2: "H"
		});

		var a = ["Football", "Soccer", "Basketball", "Hockey", "Baseball", "Tennis"];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Soccer", "Hockey", "Tennis"], "Filter result for NotBeween is correct, including 'Hockey'.");

		// excluding Hockey
		oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.NB,
			value1: "B",
			value2: "Hockey"
		});

		aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Soccer", "Tennis"], "Filter result for NotBetween is correct, excluding 'Hockey'.");

	});

	QUnit.test("NB (not between) - numbers", function(assert) {

		// excluding Hockey
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.NB,
			value1: 10,
			value2: 100
		});

		var a = [11, 5, 10, 16, 4, 120, 100, 101];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, [5, 4, 120, 101], "Filter result for Beween is correct, excluding 'Hockey'.");
	});

	QUnit.test("NotStartsWith", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.NotStartsWith,
			value1: "Bas"
		});

		var a = ["Football", "Soccer", "Basketball", "Hockey", "Baseball", "Tennis"];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Football", "Soccer", "Hockey", "Tennis"], "Filter result for NotStartsWith is correct.");
	});

	QUnit.test("NotEndsWith", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.NotEndsWith,
			value1: "ball"
		});

		var a = ["Football", "Soccer", "Basketball", "Hockey", "Baseball", "Tennis"];

		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Soccer", "Hockey", "Tennis"], "Filter result for NotEndsWith is correct.");
	});

	QUnit.module("sap.ui.model.FilterProcessor: Special cases");

	QUnit.test("getFilterFunction - EndsWith", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.EndsWith,
			value1: "bär",
			caseSensitive: true
		});
		var fnGetFilterFunction = FilterProcessor.getFilterFunction(oFilter);

		assert.ok(fnGetFilterFunction("hubär"), "contains 'bär'");
		assert.notOk(fnGetFilterFunction("huber"), "does not contain 'bär'");
	});

	QUnit.test("getFilterFunction EndsWith with special characters (Normalization)", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.EndsWith,
			value1: "\u0073\u0323\u0307",
			caseSensitive: true
		});

		var fnGetFilterFunction = FilterProcessor.getFilterFunction(oFilter);

		var sInput = FilterProcessor.normalizeFilterValue("dollar\u0073\u0323\u0307", oFilter.bCaseSensitive);
		assert.ok(fnGetFilterFunction(sInput), "endswith '\u0073\u0323\u0307'");
		assert.notOk(fnGetFilterFunction("dollars"), "does not endswith '\u0073\u0323\u0307'");
	});

	QUnit.module("sap.ui.model.FilterProcessor: Case-Sensitive & -Insensitive Filtering");

	QUnit.test("Contains w/ caseSensitive = undefined", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.Contains,
			value1: "board"
		});

		var oNormalizeFilterValueSpy = sinon.spy(FilterProcessor, "normalizeFilterValue"),
		 oToUpperCaseSpy = sinon.spy(String.prototype, "toUpperCase");

		var a = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling", "Snowboarding", "Surfing"];
		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Wakeboarding", "Skateboarding", "Snowboarding"], "Filter result for Contains is correct.");
		assert.equal(oNormalizeFilterValueSpy.callCount, 8, "NormalizeFilterValue function should be called for each value.");
		assert.equal(oToUpperCaseSpy.callCount, 8, "toUpperCase shouldn't be called");

		oNormalizeFilterValueSpy.restore();
		oToUpperCaseSpy.restore();
	});

	QUnit.test("Contains w/ caseSensitive = undefined & comparator", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.Contains,
			comparator: function() {},
			value1: "board"
		});

		var oNormalizeFilterValueSpy = sinon.spy(FilterProcessor, "normalizeFilterValue");
		var a = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling", "Snowboarding", "Surfing"];
		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Wakeboarding", "Skateboarding", "Snowboarding"], "Filter result for Contains is correct.");
		assert.equal(oNormalizeFilterValueSpy.callCount, 0, "NormalizeFilterValue function shouldn't be called.");

		oNormalizeFilterValueSpy.restore();
	});

	QUnit.test("Contains w/ caseSensitive = true & comparator", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.Contains,
			comparator: function() {},
			value1: "ing",
			caseSensitive: true
		});
		var oNormalizeFilterValueSpy = sinon.spy(FilterProcessor, "normalizeFilterValue"),
		 oToUpperCaseSpy = sinon.spy(String.prototype, "toUpperCase");

		var a = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling", "Snowboarding", "Surfing"];
		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Wakeboarding", "Skateboarding", "Cycling", "Snowboarding", "Surfing"], "Filter result for Contains is correct.");
		assert.equal(oNormalizeFilterValueSpy.callCount, 8, "NormalizeFilterValue function should be called for each value.");
		assert.equal(oToUpperCaseSpy.callCount, 0, "toUpperCase shouldn't be called");

		oNormalizeFilterValueSpy.restore();
		oToUpperCaseSpy.restore();
	});

	QUnit.test("Contains w/ caseSensitive = false & comparator", function(assert) {
		var oFilter = new Filter({
			path: 'to/glory',
			operator: FilterOperator.Contains,
			comparator: function() {},
			value1: "ling",
			caseSensitive: false
		});
		var oNormalizeFilterValueSpy = sinon.spy(FilterProcessor, "normalizeFilterValue"),
		 oToUpperCaseSpy = sinon.spy(String.prototype, "toUpperCase");

		var a = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling", "Snowboarding", "Surfing"];
		var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
			return s;
		});

		assert.deepEqual(aFiltered, ["Cycling"], "Filter result for Contains is correct.");
		assert.equal(oNormalizeFilterValueSpy.callCount, 8, "NormalizeFilterValue function should be called for each value.");
		assert.equal(oToUpperCaseSpy.callCount, 8, "toUpperCase shouldn't be called");

		oNormalizeFilterValueSpy.restore();
		oToUpperCaseSpy.restore();
	});

	QUnit.module("sap.ui.model.FilterProcessor: groupFilters");

	QUnit.test("groupFilters with same path", function(assert) {
		var oGroupedFilter;
		var aFilters = [
			new Filter({
				path: 'Price',
				operator: FilterOperator.EQ,
				value1: 100
			}),
			new Filter({
				path: 'Price',
				operator: FilterOperator.LT,
				value1: 150
			}),
			new Filter({
				path: 'Price',
				operator: FilterOperator.GT,
				value1: 1
			})
		];

		oGroupedFilter = FilterProcessor.groupFilters(aFilters);
		assert.ok(oGroupedFilter, "Filter object should be returned.");
		assert.ok(oGroupedFilter.isA("sap.ui.model.Filter"), "sap.ui.model.Filter object should be returned.");
		assert.equal(oGroupedFilter.aFilters.length, 3, "Correct number of filters should be returned.");
		assert.ok(oGroupedFilter._bMultiFilter, "Filter object should be a MultiFilter");
		assert.equal(oGroupedFilter.bAnd, false, "Filters should be ORed");
	});

	QUnit.test("groupFilters with different path", function(assert) {
		var oGroupedFilter;
		var aFilters = [
			new Filter({
				path: 'Price',
				operator: FilterOperator.EQ,
				value1: 100
			}),
			new Filter({
				path: 'Price',
				operator: FilterOperator.LT,
				value1: 150
			}),
			new Filter({
				path: 'Quantity',
				operator: FilterOperator.LT,
				value1: 200
			})
		];

		oGroupedFilter = FilterProcessor.groupFilters(aFilters);

		assert.ok(oGroupedFilter, "Filter object should be returned.");
		assert.ok(oGroupedFilter.isA("sap.ui.model.Filter"), "sap.ui.model.Filter object should be returned.");
		assert.equal(oGroupedFilter.aFilters.length, 2, "Correct number of filters should be returned.");
		assert.ok(oGroupedFilter._bMultiFilter, "Filter object should be a MultiFilter");
		assert.equal(oGroupedFilter.bAnd, true, "Filters should be ANDed");

		assert.ok(oGroupedFilter.aFilters[0]._bMultiFilter, "First Filter object should be a MultiFilter");
		assert.equal(oGroupedFilter.aFilters[0].bAnd, false, "First Filter object should be ORed");

		assert.notOk(oGroupedFilter.aFilters[1]._bMultiFilter, "Second Filter should not be a MultiFilter");
	});

	if (String.prototype.normalize) {

		QUnit.module("sap.ui.model.FilterProcessor: Normalizer cache");

		QUnit.test("Caching of normalized values", function(assert) {
			var oSpy = sinon.spy(String.prototype, "normalize");
			var a = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling", "Snowboarding", "Surfing"];
			var oFilter = new Filter({
				filters: [
					new Filter({
						path: ".",
						operator: FilterOperator.EQ,
						value1: "Tennis"
					}),
					new Filter({
						path: ".",
						operator: FilterOperator.EQ,
						value1: "Swimming"
					}),
					new Filter({
						path: ".",
						operator: FilterOperator.EQ,
						value1: "Snowboarding"
					}),
					new Filter({
						path: ".",
						operator: FilterOperator.EQ,
						value1: "Esports"
					})
				],
				and: false
			});

			var aFiltered = FilterProcessor.apply(a, oFilter, function (s) {
				return s;
			}, {});
			var iExpectedCalls = 9;
			// Internet Explorer has two normalize calls per unique value, due to issues with
			// toUpperCase on not normalized characters
			if (Device.browser.msie || Device.browser.edge) {
				iExpectedCalls = iExpectedCalls * 2;
			}

			assert.equal(aFiltered.length, 2, "Two results found");
			assert.equal(oSpy.callCount, iExpectedCalls, "Normalize is only called once per unique data or filter value");
		});

	}

});
/* global QUnit, sinon*/
sap.ui.define([
	'sap/ui/model/FilterProcessor',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function(FilterProcessor, Filter, FilterOperator) {
	"use strict";

	QUnit.module("sap.ui.model.FilterProcessor", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		}
	});

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

	//*********************************************************************************************
	QUnit.test("groupFilters: early exit wíthout grouping, check Filter.NONE", function (assert) {
		// code under test: early exit
		assert.strictEqual(FilterProcessor.groupFilters(), undefined);
		assert.strictEqual(FilterProcessor.groupFilters([]), undefined);

		// code under test
		assert.strictEqual(FilterProcessor.groupFilters(["~oFilter"]), "~oFilter");

		const aFilters = ["~oFilter", Filter.NONE];
		const oError = new Error("~Filter.NONE error");
		this.mock(Filter).expects("checkFilterNone").withExactArgs(sinon.match.same(aFilters)).throws(oError);

		// code under test
		assert.throws(() => {
			FilterProcessor.groupFilters(aFilters);
		}, oError);

	});

	//*********************************************************************************************
	QUnit.test("combineFilters: groupFilter throws error", function (assert) {
		const aApplicationFilters = "~ApplicationFilters";
		const oError = new Error("~Filter.NONE error");
		const aFilters = "~Filters";
		const oFilterProcessorMock = this.mock(FilterProcessor);

		oFilterProcessorMock.expects("groupFilters").withExactArgs(aFilters).throws(oError);

		// code under test
		assert.throws(() => {
			FilterProcessor.combineFilters(aFilters, aApplicationFilters);
		}, oError);

		oFilterProcessorMock.expects("groupFilters").withExactArgs(aFilters).returns("~someGroupedFilter");
		oFilterProcessorMock.expects("groupFilters").withExactArgs(aApplicationFilters).throws(oError);

		// code under test
		assert.throws(() => {
			FilterProcessor.combineFilters(aFilters, aApplicationFilters);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("combineFilters: no Error if control or application filter is Filter.NONE", function (assert) {
		const oFilterProcessorMock = this.mock(FilterProcessor);
		oFilterProcessorMock.expects("groupFilters").withExactArgs("~Filters").returns(Filter.NONE);
		oFilterProcessorMock.expects("groupFilters").withExactArgs("~ApplicationFilters").returns("~someGroupedFilter");

		// code under test
		assert.strictEqual(FilterProcessor.combineFilters("~Filters", "~ApplicationFilters"), Filter.NONE);

		oFilterProcessorMock.expects("groupFilters").withExactArgs("~Filters").returns("~someGroupedFilter");
		oFilterProcessorMock.expects("groupFilters").withExactArgs("~ApplicationFilters").returns(Filter.NONE);

		// code under test
		assert.strictEqual(FilterProcessor.combineFilters("~Filters", "~ApplicationFilters"), Filter.NONE);

		oFilterProcessorMock.expects("groupFilters").withExactArgs("~Filters").returns(Filter.NONE);
		oFilterProcessorMock.expects("groupFilters").withExactArgs("~ApplicationFilters").returns(Filter.NONE);

		// code under test
		assert.strictEqual(FilterProcessor.combineFilters("~Filters", "~ApplicationFilters"), Filter.NONE);
	});

	//*********************************************************************************************
	QUnit.test("apply: propagates error from groupFilters", function (assert) {
		const aFilters = ["~oFilter", Filter.NONE];
		const oError = new Error("~Filter.NONE error");
		this.mock(FilterProcessor).expects("groupFilters").withExactArgs(sinon.match.same(aFilters)).throws(oError);

		// code under test
		assert.throws(() => {
			FilterProcessor.apply([/*aData*/], aFilters);
		}, oError);
	});

	QUnit.test("apply: values contain 'toString' value", function (assert) {
		var aData = ["foo", "toString", "bar", "foo bar"],
			oFilter = new Filter({path: "name", operator: FilterOperator.Contains, value1: "foo"});

		// code under test
		assert.deepEqual(FilterProcessor.apply(aData, oFilter, function (sValue) {return sValue;}),
			["foo", "foo bar"]);
	});

// ***********************************************************************************************
// String.prototype.normalize is not available on all browsers
// ***********************************************************************************************
if (String.prototype.normalize) {
	QUnit.test("Caching of normalized values", function (assert) {
		var aData = ["Wakeboarding", "Skateboarding", "Tennis", "Marathon", "Cycling",
				"Snowboarding", "Surfing"],
			oFilter = new Filter({
				filters: [
					new Filter({operator : FilterOperator.EQ, path : ".", value1 : "Tennis"}),
					new Filter({operator : FilterOperator.EQ, path : ".", value1 : "Swimming"}),
					new Filter({operator : FilterOperator.EQ, path : ".", value1 : "Snowboarding"}),
					new Filter({operator : FilterOperator.EQ, path : ".", value1 : "Esports"})
				],
				and : false
			}),
			aFiltered,
			oSpy = sinon.spy(String.prototype, "normalize");

		// code under test
		aFiltered = FilterProcessor.apply(aData, oFilter, function (s) { return s; }, {});

		assert.strictEqual(aFiltered.length, 2, "Two results found");
		assert.strictEqual(oSpy.callCount, 9,
			"Normalize is only called once per unique data or filter value");
		oSpy.restore();
	});

	["foo", "toString"].forEach(function (sValue) {
		QUnit.test("normalizeFilterValue: case sensitive, value: " + sValue, function (assert) {
			FilterProcessor._normalizeCache = {"false": {}, "true" : {}};

			this.mock(String.prototype).expects("normalize")
				.on(sValue)
				.withExactArgs("NFC")
				.returns("~normalized");

			// code under test
			assert.deepEqual(FilterProcessor.normalizeFilterValue(sValue, true), "~normalized");

			assert.strictEqual(FilterProcessor._normalizeCache["true"][sValue], "~normalized",
				"noramalized value for '" + sValue + "' has been cached");

			// code under test - take it from cache
			assert.deepEqual(FilterProcessor.normalizeFilterValue(sValue, true), "~normalized");
		});
	});
}
});
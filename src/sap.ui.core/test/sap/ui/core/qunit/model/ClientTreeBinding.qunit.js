/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ClientTreeBinding",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType"
], function (Log, ClientTreeBinding, FilterProcessor, FilterType) {
	"use strict";
	/*global QUnit, sinon */

	//*********************************************************************************************
	QUnit.module("ClientTreeBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("getCount: unresolved", function (assert) {
		var oBinding = new ClientTreeBinding({/*oModel*/}, "~path");

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oBinding.getCount(), undefined);
	});

	//*********************************************************************************************
[
	{mParameters : undefined, aArrayNames : undefined},
	{mParameters : {}, aArrayNames : undefined},
	{mParameters : {arrayNames : "~arrayNames"}, aArrayNames : "~arrayNames"}
].forEach(function (oFixture, i) {
	QUnit.test("getCount: no filters set, #" + i, function (assert) {
		var oModel = {getObject : function () {}},
			oBinding = new ClientTreeBinding(oModel, "~path", /*oContext*/undefined,
				/*aApplicationFilters*/undefined, oFixture.mParameters);

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("getObject").withExactArgs("~resolvedPath").returns("~data");
		this.mock(ClientTreeBinding).expects("_getTotalNodeCount")
			.withExactArgs("~data", oFixture.aArrayNames, true)
			.returns("~count");

		// code under test
		assert.strictEqual(oBinding.getCount(), "~count");
	});
});

	//*********************************************************************************************
	QUnit.test("getCount: with filters", function (assert) {
		var oBinding = new ClientTreeBinding({/*oModel*/}, "~path");

		oBinding.oCombinedFilter = "~oCombinedFilter";
		oBinding.filterInfo.iMatches = "~iMatches";

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.getCount(), "~iMatches");
	});

	//*********************************************************************************************
[undefined, null, "", "foo", 42, false, true].forEach(function (vData, i) {
	QUnit.test("_getTotalNodeCount: no object or array, #" + i, function (assert) {
		// code under test
		assert.strictEqual(ClientTreeBinding._getTotalNodeCount(vData), 0);
	});
});

	//*********************************************************************************************
	QUnit.test("_getTotalNodeCount: array", function (assert) {
		var aData = [],
			that = this;

		this.mock(aData).expects("reduce")
			.withExactArgs(sinon.match.func, 0)
			.callsFake(function (fnCallback/*, iStart*/) {
				that.mock(ClientTreeBinding)
					.expects("_getTotalNodeCount")
					.withExactArgs("~ithValue", "~arrayNames")
					.returns(42);

				// code under test - recursive call for each element
				assert.strictEqual(fnCallback(13, "~ithValue"), /*13+42*/55);

				return "~count";
			});

		// code under test
		assert.strictEqual(ClientTreeBinding._getTotalNodeCount(aData, "~arrayNames"), "~count");
	});

	//*********************************************************************************************
[{bRoot : true, iStart : 0}, {bRoot : false, iStart : 1}].forEach(function (oFixture, i) {
	QUnit.test("_getTotalNodeCount: object, no array names, #" + i, function (assert) {
		var oData = {sKey : "~value"},
			aKeys = [],
			oObjectMock = this.mock(Object),
			that = this;

		this.mock(Array).expects("isArray").withExactArgs(sinon.match.same(oData)).returns(false);
		oObjectMock.expects("keys").atLeast(0).callThrough(); // called by test framework
		oObjectMock.expects("keys").withExactArgs(sinon.match.same(oData)).returns(aKeys);
		this.mock(aKeys).expects("reduce")
			.withExactArgs(sinon.match.func, oFixture.iStart)
			.callsFake(function (fnCallback/*, iStart*/) {
				that.mock(ClientTreeBinding)
					.expects("_getTotalNodeCount")
					.withExactArgs("~value", undefined)
					.returns(7);

				// code under test - recursive call for each object key
				assert.strictEqual(fnCallback(13, "sKey"), /*13+7*/20);

				return "~count";
			});

		// code under test
		assert.strictEqual(
			ClientTreeBinding._getTotalNodeCount(oData, undefined, oFixture.bRoot),
			"~count");
	});
});

	//*********************************************************************************************
[{bRoot : true, iStart : 0}, {bRoot : false, iStart : 1}].forEach(function (oFixture, i) {
	QUnit.test("_getTotalNodeCount: object, with array names, #" + i, function (assert) {
		var aArrayNames = [/*"sKey"*/],
			oData = {sKey : "~value"},
			that = this;

		this.mock(Array).expects("isArray").withExactArgs(sinon.match.same(oData)).returns(false);
		this.mock(aArrayNames).expects("reduce")
			.withExactArgs(sinon.match.func, oFixture.iStart)
			.callsFake(function (fnCallback/*, iStart*/) {
				that.mock(ClientTreeBinding)
					.expects("_getTotalNodeCount")
					.withExactArgs("~value", aArrayNames)
					.returns(11);

				// code under test - recursive call for each object key in aArrayNames
				assert.strictEqual(fnCallback(13, "sKey"), /*13+11*/24);

				return "~count";
			});

		// code under test
		assert.strictEqual(
			ClientTreeBinding._getTotalNodeCount(oData, aArrayNames, oFixture.bRoot),
			"~count");
	});
});

	//*********************************************************************************************
	QUnit.test("constructor: filter info and combined filter; no filter", function (assert) {
		var oBinding = new ClientTreeBinding({/*oModel*/}, "~path"); // code under test

		assert.deepEqual(oBinding.filterInfo, {
			aFilteredContexts : [],
			iMatches : 0,
			oParentContext : {}
		});
		assert.strictEqual(oBinding.oCombinedFilter, null);
	});

	//*********************************************************************************************
	QUnit.test("constructor: filter info and combined filter; with filter", function (assert) {
		var oBinding,
			aFilters = ["~anyFilter"],
			oModel = {
				_getObject : function () {},
				checkFilter : function () {}
			};

		this.mock(oModel).expects("checkFilter").withExactArgs(sinon.match.same(aFilters));
		this.mock(oModel).expects("_getObject")
			.withExactArgs("~path", "~oContext")
			.returns({/*any data*/});
		this.mock(ClientTreeBinding.prototype).expects("filter")
			.withExactArgs(sinon.match.same(aFilters), FilterType.Application);

		// code under test
		oBinding = new ClientTreeBinding(oModel, "~path", "~oContext", aFilters);

		assert.deepEqual(oBinding.filterInfo, {
			aFilteredContexts : [],
			iMatches : 0,
			oParentContext : {}
		});
		assert.strictEqual(oBinding.oCombinedFilter, null);
	});

	//*********************************************************************************************
	QUnit.test("applyFilter: resets iMatches before applying filters", function (assert) {
		var oBinding = new ClientTreeBinding({/*oModel*/}, "~path"),
			oFilterInfo = {
				aFilteredContexts : "~aFilteredContexts",
				iMatches : "~iMatches",
				oParentContext : "~oParentContext"
			};

		oBinding.filterInfo = oFilterInfo;

		this.mock(oBinding).expects("_applyFilterRecursive")
			.withExactArgs()
			.callsFake(function () {
				assert.strictEqual(oBinding.filterInfo, oFilterInfo, "instance unchanged");
				assert.deepEqual(oBinding.filterInfo, { // but values are reset
					aFilteredContexts : [],
					iMatches : 0,
					oParentContext : {}
				});
			});

		// code under test
		oBinding.applyFilter();
	});

	//*********************************************************************************************
	QUnit.test("_applyFilterRecursive: update iMatches while applying filters", function (assert) {
		var oBinding = new ClientTreeBinding({/*oModel*/}, "~path"),
			oBindingMock = this.mock(oBinding),
			oContext0 = {},
			oContext1 = {},
			aFilteredContexts = ["~oFilteredContext0", "~oFilteredContext1", "~oFilteredContext2"],
			oFilterInfo = {
				aFilteredContexts : ["foo"],
				iMatches : 17,
				oParentContext : "~oParentContext"
			},
			aUnfilteredContexts = [oContext0, oContext1];

		oBinding.oCombinedFilter = "~oCombinedFilter";
		oBinding.filterInfo = oFilterInfo;
		oBinding.bIsFiltering = "~bIsFiltering";
		oBinding.mNormalizeCache = "~mNormalizeCache";

		oBindingMock.expects("getRootContexts")
			.withExactArgs(0, Number.MAX_VALUE)
			.callsFake(function () {
				assert.strictEqual(this.bIsFiltering, true);

				// define _applyFilterRecursive here to avoid mocking the initial call
				oBindingMock.expects("_applyFilterRecursive")
					.withExactArgs(sinon.match.same(oContext0))
					.callsFake(function (oContext) {
						assert.ok(oContext.hasOwnProperty("_parentContext"));
						assert.strictEqual(oContext._parentContext, undefined);
						assert.strictEqual(this.bIsFiltering, false);
					});
				oBindingMock.expects("_applyFilterRecursive")
					.withExactArgs(sinon.match.same(oContext1))
					.callsFake(function (oContext) {
						assert.ok(oContext.hasOwnProperty("_parentContext"));
						assert.strictEqual(oContext._parentContext, undefined);
						assert.strictEqual(this.bIsFiltering, false);
					});

				return aUnfilteredContexts;
			});
		this.mock(FilterProcessor).expects("apply")
			.withExactArgs(sinon.match.same(aUnfilteredContexts), "~oCombinedFilter",
				sinon.match.func, "~mNormalizeCache")
			.returns(aFilteredContexts);

		// code under test
		oBinding._applyFilterRecursive();

		assert.deepEqual(oBinding.filterInfo, {
			aFilteredContexts : ["foo", "~oFilteredContext0", "~oFilteredContext1",
				"~oFilteredContext2", /*oParentContext*/undefined],
			iMatches : 20,
			oParentContext : /*oParentContext*/undefined
		});
	});
});
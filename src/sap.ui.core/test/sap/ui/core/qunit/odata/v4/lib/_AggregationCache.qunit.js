/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_AggregationCache",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_ConcatHelper",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_MinMaxHelper"
], function (Log, SyncPromise, _AggregationCache, _AggregationHelper, _Cache, _ConcatHelper,
		_GroupLock, _Helper, _MinMaxHelper) {
	/*eslint no-sparse-arrays: 0 */
	"use strict";

	/**
	 * Copies the given elements from a cache read into <code>this.aElements</code>.
	 *
	 * @param {object|object[]} aReadElements
	 *   The elements from a cache read, or just a single one
	 * @param {number} iOffset
	 *   The offset within aElements
	 *
	 * @private
	 */
	function addElements(aReadElements, iOffset) {
		var aElements = this.aElements;

		if (!Array.isArray(aReadElements)) {
			aReadElements = [aReadElements];
		}
		aReadElements.forEach(function (oElement, i) {
			var sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");

			// for simplicity, avoid most sanity checks of _AggregationCache#addElements
			if (iOffset + i >= aElements.length) {
				throw new Error("Array index out of bounds: " + (iOffset + i));
			}
			aElements[iOffset + i] = oElement;
			if (sPredicate) { // Note: sometimes, even $byPredicate is missing...
				aElements.$byPredicate[sPredicate] = oElement;
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationCache", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oRequestor = {
				buildQueryString : function () { return ""; },
				getServiceUrl : function () { return "/~/"; }
			};
			this.oRequestorMock = this.mock(this.oRequestor);
		}
	});
	//*********************************************************************************************
[
	{},
	{$$filterBeforeAggregate : "foo", $apply : "bar"}
].forEach(function (mQueryOptions, i) {
	QUnit.test("create: no aggregation #" + i, function (assert) {
		var mAggregate = {},
			oAggregation = i
				? {
					aggregate : mAggregate,
					group : {},
					groupLevels : []
				}
				: null; // improves code coverage

		this.mock(_AggregationHelper).expects("hasGrandTotal").exactly(i ? 1 : 0)
			.withExactArgs(sinon.match.same(mAggregate)).returns(false);
		this.mock(_AggregationHelper).expects("hasMinOrMax").exactly(i ? 1 : 0)
			.withExactArgs(sinon.match.same(mAggregate)).returns(false);
		this.mock(_MinMaxHelper).expects("createCache").never();
		this.mock(_Cache).expects("create")
			.withExactArgs("~requestor~", "resource/path", sinon.match(function (oParam) {
					if (i) {
						assert.deepEqual(mQueryOptions, {$apply : "filter(foo)/bar"});
					}
					return oParam === mQueryOptions;
				}), "~sortExpandSelect~", "deep/resource/path", "~sharedRequest~")
			.returns("~cache~");

		assert.strictEqual(
			// code under test
			_AggregationCache.create("~requestor~", "resource/path", "deep/resource/path",
				oAggregation, mQueryOptions, "~sortExpandSelect~", "~sharedRequest~"),
			"~cache~");
	});
});

	//*********************************************************************************************
	QUnit.test("create: min/max", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				// Note: ODLB#updateAnalyticalInfo called _AggregationHelper.buildApply
				groupLevels : []
			},
			mQueryOptions = {};

		this.mock(_AggregationHelper).expects("hasGrandTotal")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(false);
		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(true);
		this.mock(_MinMaxHelper).expects("createCache")
			.withExactArgs("~requestor~", "resource/path", sinon.match.same(oAggregation),
				sinon.match.same(mQueryOptions))
			.returns("~cache~");
		this.mock(_Cache).expects("create").never();

		assert.strictEqual(
			// code under test
			_AggregationCache.create("~requestor~", "resource/path", "", oAggregation,
				mQueryOptions),
			"~cache~");
	});

	//*********************************************************************************************
[{
	groupLevels : ["BillToParty"],
	hasGrandTotal : false,
	hasMinOrMax : false
}, {
	hasGrandTotal : false,
	hasMinOrMax : true
}, {
	hasGrandTotal : true,
	hasMinOrMax : false
}].forEach(function (oFixture, i) {
	["$expand", "$select"].forEach(function (sName) {
	QUnit.test("create: " + sName + " not allowed #" + i, function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : oFixture.groupLevels || []
			},
			mQueryOptions = {};

		mQueryOptions[sName] = undefined; // even falsy values are forbidden!

		this.mock(_AggregationHelper).expects("hasGrandTotal")
			.withExactArgs(sinon.match.same(oAggregation.aggregate))
			.returns(oFixture.hasGrandTotal);
		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(oFixture.hasMinOrMax);
		this.mock(_MinMaxHelper).expects("createCache").never();
		this.mock(_Cache).expects("create").never();

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: " + sName));
	});
	});
});

	//*********************************************************************************************
[{
	groupLevels : ["BillToParty"],
	hasGrandTotal : false,
	hasMinOrMax : true,
	message : "Unsupported group levels together with min/max"
}, {
	hasGrandTotal : true,
	hasMinOrMax : true,
	message : "Unsupported grand totals together with min/max"
}, {
	groupLevels : ["BillToParty"],
	hasGrandTotal : false,
	hasMinOrMax : false,
	message : "Unsupported system query option: $filter",
	queryOptions : {$filter : "answer eq 42"}
}, {
	hasGrandTotal : true,
	hasMinOrMax : false,
	message : "Unsupported system query option: $filter",
	queryOptions : {$filter : "answer eq 42"}
}, {
	hasGrandTotal : true,
	hasMinOrMax : false,
	message : "Unsupported system query option: $search",
	queryOptions : {$search : "blue OR green"}
}, {
	groupLevels : ["BillToParty"],
	hasGrandTotal : false,
	hasMinOrMax : false,
	message : "Unsupported system query option: $search",
	queryOptions : {$search : "blue OR green"}
}].forEach(function (oFixture) {
	QUnit.test("create: " + oFixture.message, function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : oFixture.groupLevels || []
			},
			mQueryOptions = oFixture.queryOptions || {};

		this.mock(_AggregationHelper).expects("hasGrandTotal")
			.withExactArgs(sinon.match.same(oAggregation.aggregate))
			.returns(oFixture.hasGrandTotal);
		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(oFixture.hasMinOrMax);
		this.mock(_MinMaxHelper).expects("createCache").never();
		this.mock(_Cache).expects("create").never();

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);
		}, new Error(oFixture.message));
	});
});

	//*********************************************************************************************
["none", "top", "bottom", "top&bottom"].forEach(function (sGrandTotalPosition) {
	[false, true].forEach(function (bGrandTotalLike184) {
		[false, true].forEach(function (bCountLeaves) {
			var sTitle = "create: (either) grandTotal or groupLevels, position = "
					+ sGrandTotalPosition + ", grandTotal like 1.84 = " + bGrandTotalLike184
					+ ", count leaves = " + bCountLeaves;

			// Note: counting of leaves only makes sense with group levels, which cannot be combined
			// with "grandTotal like 1.84"
			if (bCountLeaves && bGrandTotalLike184) {
				return;
			}

	QUnit.test(sTitle, function (assert) {
		var bHasGrandTotal = sGrandTotalPosition !== "none",
			oAggregation = { // filled before by buildApply
				aggregate : {
					x : {},
					y : {
						grandTotal : bHasGrandTotal,
						unit : "UnitY"
					}
				},
				"grandTotal like 1.84" : bGrandTotalLike184,
				group : {
					c : {}, // intentionally out of ABC order
					a : {},
					b : {}
				},
				groupLevels : bHasGrandTotal && !bCountLeaves ? [] : ["a"]
			},
			aAllProperties = [],
			oCache,
			oEnhanceCacheWithGrandTotalExpectation,
			oFirstLevelCache = {},
			oGetDownloadUrlExpectation,
			oGrandTotal = {},
			oGrandTotalCopy = {},
			oGroupLock = {
				unlock : function () {}
			},
			oHelperMock = this.mock(_Helper),
			mQueryOptions = {
				$count : bHasGrandTotal || bCountLeaves,
				//TODO get rid of bGrandTotalLike184 here (JIRA: CPOUI5ODATAV4-713)
				$filter : bHasGrandTotal && bGrandTotalLike184 ? "answer eq 42" : "",
				$orderby : "a",
				"sap-client" : "123"
			},
			oReadPromise,
			sResourcePath = "Foo",
			iTopBottomCallCount = sGrandTotalPosition === "top&bottom" ? 1 : 0;

		if (sGrandTotalPosition === "top&bottom") {
			oAggregation.grandTotalAtBottomOnly = false;
		} else if (sGrandTotalPosition === "bottom") {
			oAggregation.grandTotalAtBottomOnly = true;
		}
		this.mock(_AggregationHelper).expects("hasGrandTotal")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(bHasGrandTotal);
		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(false);
		this.mock(_MinMaxHelper).expects("createCache").never();
		this.mock(_Cache).expects("create").never();
		oGetDownloadUrlExpectation = this.mock(_Cache.prototype).expects("getDownloadUrl")
			.withExactArgs("").returns("~downloadUrl~");
		this.mock(_AggregationCache.prototype).expects("createGroupLevelCache")
			.withExactArgs(null, bHasGrandTotal || bCountLeaves).returns(oFirstLevelCache);
		if (bHasGrandTotal) {
			oEnhanceCacheWithGrandTotalExpectation = this.mock(_ConcatHelper)
				.expects("enhanceCache")
				.withExactArgs(sinon.match.same(oFirstLevelCache), sinon.match.same(oAggregation), [
					bCountLeaves ? /*fnLeaves*/sinon.match.func : null,
					/*fnGrandTotal*/sinon.match.func,
					/*fnCount*/sinon.match.func
				]);
		} else if (bCountLeaves) {
			oEnhanceCacheWithGrandTotalExpectation = this.mock(_ConcatHelper)
				.expects("enhanceCache")
				.withExactArgs(sinon.match.same(oFirstLevelCache), sinon.match.same(oAggregation),
					[/*fnLeaves*/sinon.match.func, /*fnCount*/sinon.match.func]);
		} else {
			this.mock(_ConcatHelper).expects("enhanceCache").never();
		}

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, "", oAggregation,
			mQueryOptions);

		// "super" call
		assert.ok(oCache instanceof _AggregationCache, "module value is c'tor function");
		assert.ok(oCache instanceof _Cache, "_AggregationCache is a _Cache");
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.sResourcePath, sResourcePath);
		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.bSortExpandSelect, true);
		assert.strictEqual(typeof oCache.fetchValue, "function");
		assert.strictEqual(typeof oCache.read, "function");
		// c'tor itself
		assert.strictEqual(oCache.oAggregation, oAggregation);
		assert.strictEqual(oCache.sDownloadUrl, "~downloadUrl~");
		assert.strictEqual(oCache.getDownloadUrl(""), "~downloadUrl~"); // <-- code under test
		assert.strictEqual(oCache.toString(), "~downloadUrl~"); // <-- code under test
		assert.ok(oGetDownloadUrlExpectation.alwaysCalledOn(oCache));
		assert.deepEqual(oCache.aElements, []);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.ok("$count" in oCache.aElements);
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.strictEqual(oCache.aElements.$created, 0);
		assert.strictEqual(oCache.oFirstLevel, oFirstLevelCache);
		if (bCountLeaves) {
			assert.strictEqual(oCache.mQueryOptions.$$leaves, true);
			assert.ok(oCache.oLeavesPromise instanceof SyncPromise);
			assert.strictEqual(oCache.oLeavesPromise.isPending(), true);

			// code under test (fnLeaves)
			oEnhanceCacheWithGrandTotalExpectation.args[0][2][0]({UI5__leaves : "42"});

			assert.strictEqual(oCache.oLeavesPromise.isFulfilled(), true);
			assert.strictEqual(oCache.oLeavesPromise.getResult(), 42);

			// code under test
			assert.strictEqual(oCache.fetchValue(null, "$count"), oCache.oLeavesPromise);
		} else {
			assert.notOk("$$leaves" in oCache.mQueryOptions);
			assert.ok("oLeavesPromise" in oCache, "be nice to V8");
			assert.strictEqual(oCache.oLeavesPromise, undefined);
		}
		if (bHasGrandTotal || bCountLeaves) {
			// code under test (fnCount) - nothing should happen :-)
			oEnhanceCacheWithGrandTotalExpectation.args[0][2][bHasGrandTotal ? 2 : 1]({});
		}
		if (!bHasGrandTotal) {
			assert.strictEqual(oCache.oGrandTotalPromise, undefined);
			assert.ok("oGrandTotalPromise" in oCache, "be nice to V8");
			return null; // be nice to eslint's "consistent-return" rule ---------------------------
		}
		assert.ok(oCache.oGrandTotalPromise instanceof SyncPromise);
		assert.strictEqual(oCache.oGrandTotalPromise.isPending(), true);

		if (sGrandTotalPosition !== "bottom") {
			[undefined, 1, 2, 3, 100, Infinity].forEach(function (iPrefetchLength) {
				assert.throws(function () {
					// code under test
					// (read grand total row separately, but with iPrefetchLength !== 0)
					oCache.read(0, 1, iPrefetchLength);
				}, new Error("Unsupported prefetch length: " + iPrefetchLength));
			});

			this.mock(oGroupLock).expects("unlock").withExactArgs();

			// code under test (read grand total row separately)
			oReadPromise = oCache.read(0, 1, 0, oGroupLock);

			assert.strictEqual(oReadPromise.isPending(), true);
		}

		this.mock(_AggregationHelper).expects("removeUI5grand__")
			.exactly(bGrandTotalLike184 ? 1 : 0)
			.withExactArgs(sinon.match.same(oGrandTotal));
		this.mock(_AggregationHelper).expects("getAllProperties")
			.withExactArgs(sinon.match.same(oAggregation)).returns(aAllProperties);
		this.mock(_AggregationHelper).expects("setAnnotations")
			.withExactArgs(sinon.match.same(oGrandTotal), true, true, 0,
				sinon.match.same(aAllProperties));
		this.mock(Object).expects("assign").exactly(iTopBottomCallCount)
			.withExactArgs({}, sinon.match.same(oGrandTotal), {"@$ui5.node.isExpanded" : undefined})
			.returns(oGrandTotalCopy);
		oHelperMock.expects("setPrivateAnnotation").exactly(iTopBottomCallCount)
			.withExactArgs(sinon.match.same(oGrandTotalCopy), "predicate", "($isTotal=true)");
		oHelperMock.expects("setPrivateAnnotation").exactly(iTopBottomCallCount)
			.withExactArgs(sinon.match.same(oGrandTotal), "copy",
				sinon.match.same(oGrandTotalCopy));
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oGrandTotal), "predicate", "()");

		// code under test (fnGrandTotal)
		oEnhanceCacheWithGrandTotalExpectation.args[0][2][1](oGrandTotal);

		assert.strictEqual(oCache.oGrandTotalPromise.isFulfilled(), true);
		assert.strictEqual(oCache.oGrandTotalPromise.getResult(), oGrandTotal);
		assert.deepEqual(oCache.aElements, []);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.ok("$count" in oCache.aElements);
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.strictEqual(oCache.aElements.$created, 0);

		if (sGrandTotalPosition === "bottom") {
			return null; // be nice to eslint's "consistent-return" rule ---------------------------
		}
		assert.strictEqual(oReadPromise.isPending(), true, "still async...");

		return oReadPromise.then(function (oReadResult) {
			assert.deepEqual(oReadResult, {value : [oGrandTotal]});
			assert.strictEqual(oReadResult.value[0], oGrandTotal);
			assert.notOk("$count" in oReadResult.value, "$count not available here");
		});
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("create: hierarchyQualifier", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache,
			oGetDownloadUrlExpectation,
			mQueryOptions = {
				$expand : {
					EMPLOYEE_2_TEAM : {$select : ["Team_Id", "Name"]}
				},
				$select : ["ID", "MANAGER_ID"]
			};

		this.mock(_AggregationHelper).expects("hasGrandTotal").withExactArgs(undefined)
			.returns(undefined);
		this.mock(_AggregationHelper).expects("hasMinOrMax").withExactArgs(undefined)
			.returns(undefined);
		this.mock(_MinMaxHelper).expects("createCache").never();
		this.mock(_Cache).expects("create").never();
		oGetDownloadUrlExpectation = this.mock(_Cache.prototype).expects("getDownloadUrl")
			.withExactArgs("").returns("~downloadUrl~");
		this.mock(_AggregationCache.prototype).expects("createGroupLevelCache")
			.withExactArgs(null, false).returns("~firstLevelCache~");
		this.mock(_ConcatHelper).expects("enhanceCache").never();

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, "resource/path", "n/a", oAggregation,
			mQueryOptions);

		// "super" call
		assert.ok(oCache instanceof _AggregationCache, "module value is c'tor function");
		assert.ok(oCache instanceof _Cache, "_AggregationCache is a _Cache");
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.sResourcePath, "resource/path");
		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.bSortExpandSelect, true);
		assert.strictEqual(typeof oCache.fetchValue, "function");
		assert.strictEqual(typeof oCache.read, "function");
		// c'tor itself
		assert.strictEqual(oCache.oAggregation, oAggregation);
		assert.strictEqual(oCache.sDownloadUrl, "~downloadUrl~");
		assert.strictEqual(oCache.getDownloadUrl(""), "~downloadUrl~"); // <-- code under test
		assert.strictEqual(oCache.toString(), "~downloadUrl~"); // <-- code under test
		assert.ok(oGetDownloadUrlExpectation.alwaysCalledOn(oCache));
		assert.deepEqual(oCache.aElements, []);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.ok("$count" in oCache.aElements);
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.strictEqual(oCache.aElements.$created, 0);
		assert.strictEqual(oCache.oFirstLevel, "~firstLevelCache~");
		assert.notOk("$$leaves" in oCache.mQueryOptions);
		assert.ok("oLeavesPromise" in oCache, "be nice to V8");
		assert.strictEqual(oCache.oLeavesPromise, undefined);
		assert.strictEqual(oCache.oGrandTotalPromise, undefined);
		assert.ok("oGrandTotalPromise" in oCache, "be nice to V8");
	});

	//*********************************************************************************************
	// Using PICT /r:4848
	//
	// sFilterBeforeAggregate: "", "~filterBeforeAggregate~"
	// # the following parameter is ignored below
	// sFilteredOrderBy: "", "~filteredOrderBy~"
	// bHasGrandTotal:   false, true
	// bLeaf:            false, true
	// oParentGroupNode: undefined, {}
	// bSubtotals:       false, true
	// IF [bLeaf] = "true" THEN [bSubtotals] = "false";
	// IF [oParentGroupNode] = "undefined" THEN [bLeaf] = "false";
	// IF [oParentGroupNode] = "{}" THEN [bHasGrandTotal] = "false";
[{
	sFilterBeforeAggregate : "",
	bHasGrandTotal : true,
	bLeaf : false,
	oParentGroupNode : undefined,
	bSubtotals : false
}, {
	sFilterBeforeAggregate : "",
	bHasGrandTotal : false,
	bLeaf : false,
	oParentGroupNode : {},
	bSubtotals : true
}, {
	sFilterBeforeAggregate : "",
	bHasGrandTotal : false,
	bLeaf : true,
	oParentGroupNode : {},
	bSubtotals : false
}, {
	sFilterBeforeAggregate : "~filterBeforeAggregate~",
	bHasGrandTotal : false,
	bLeaf : false,
	oParentGroupNode : undefined,
	bSubtotals : true
}, {
	sFilterBeforeAggregate : "~filterBeforeAggregate~",
	bHasGrandTotal : false,
	bLeaf : true,
	oParentGroupNode : {},
	bSubtotals : false
}, {
	sFilterBeforeAggregate : "~filterBeforeAggregate~",
	bHasGrandTotal : true,
	bLeaf : false,
	oParentGroupNode : undefined,
	bSubtotals : true
}].forEach(function (oPICT) {
	QUnit.test("createGroupLevelCache: " + JSON.stringify(oPICT), function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {
					x : {
						subtotals : oPICT.bSubtotals
					},
					y : {
						grandTotal : oPICT.bHasGrandTotal,
						unit : "UnitY"
					}
				},
				group : {
					c : {}, // intentionally out of ABC order
					a : {},
					b : {}
				},
				groupLevels : ["a", "b"]
			},
			oAggregationCache,
			aAllProperties = [],
			oCache = {},
			mCacheQueryOptions = {},
			aGroupBy = ["a"],
			iLevel = oPICT.oParentGroupNode ? 3 : 1,
			mQueryOptions = {
				$$filterBeforeAggregate : oPICT.sFilterBeforeAggregate
				// $orderby : "~orderby~"
			};

		function isOK(o) {
			if (oPICT.oParentGroupNode) {
				return o.$$filterBeforeAggregate === (oPICT.sFilterBeforeAggregate
					? "~filter~ and (~filterBeforeAggregate~)"
					: "~filter~");
			}

			return o.$$filterBeforeAggregate === oPICT.sFilterBeforeAggregate;
		}

		if (!oPICT.bHasGrandTotal) {
			mQueryOptions.$count = "n/a";
		}
		if (oPICT.oParentGroupNode) {
			aGroupBy = ["a", "b", "c"];
			oPICT.oParentGroupNode["@$ui5.node.level"] = 2;
			_Helper.setPrivateAnnotation(oPICT.oParentGroupNode, "filter", "~filter~");
		}
		if (oPICT.bLeaf) {
			// Note: duplicates do not hurt for key predicate, but order is important
			aGroupBy = [/*group levels:*/"a", "b", /*sorted:*/"a", "b", "c"];
		} else { // Note: iLevel === 3
			oAggregation.groupLevels.push("c");
		}

		oAggregationCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation,
			{/*$orderby : "~orderby~"*/});

		this.mock(_AggregationHelper).expects("getAllProperties")
			.withExactArgs(sinon.match.same(oAggregation)).returns(aAllProperties);
		this.mock(_AggregationHelper).expects("filterOrderby")
			.withExactArgs(sinon.match.same(oAggregationCache.mQueryOptions),
				sinon.match.same(oAggregation), iLevel)
			.returns(mQueryOptions);
		if (oPICT.bHasGrandTotal) {
			this.mock(_AggregationHelper).expects("buildApply").never();
		} else {
			this.mock(_AggregationHelper).expects("buildApply")
				.withExactArgs(sinon.match.same(oAggregation), sinon.match(function (o) {
						return !("$count" in o) && o === mQueryOptions && isOK(o);
					}), iLevel)
				.returns(mCacheQueryOptions);
		}
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(oAggregationCache.oRequestor), "Foo",
				sinon.match(function (o) {
					// Note: w/o grand total, buildApply determines the query options to be used!
					return o.$count
						&& (oPICT.bHasGrandTotal
							? o === mQueryOptions && isOK(o)
							: o === mCacheQueryOptions);
				}), true)
			.returns(oCache);

		// This must be done before calling createGroupLevelCache, so that bind grabs the mock
		this.mock(_AggregationCache).expects("calculateKeyPredicate").on(null)
			.withExactArgs(sinon.match.same(oPICT.oParentGroupNode), aGroupBy,
				sinon.match.same(aAllProperties), oPICT.bLeaf, oPICT.bSubtotals,
				"~oElement~", "~mTypeForMetaPath~", "~metapath~")
			.returns("~sPredicate~");
		this.mock(_AggregationCache).expects("calculateKeyPredicateRH").never();

		assert.strictEqual(
			// code under test
			oAggregationCache.createGroupLevelCache(oPICT.oParentGroupNode, oPICT.bHasGrandTotal),
			oCache
		);

		// code under test (this normally happens inside the created cache's handleResponse method)
		assert.strictEqual(
			oCache.calculateKeyPredicate("~oElement~", "~mTypeForMetaPath~", "~metapath~"),
			"~sPredicate~");
	});
});

	//*********************************************************************************************
[undefined, {}].forEach(function (oParentGroupNode) {
	QUnit.test("createGroupLevelCache: recursive hierarchy", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = {},
			mCacheQueryOptions = {},
			iLevel = oParentGroupNode ? 3 : 1,
			mQueryOptions = {
				$expand : "~expand~",
				// $orderby : "~orderby~"
				$select : "~select~"
			},
			oAggregationCache
				= _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);

		if (oParentGroupNode) {
			oParentGroupNode["@$ui5.node.level"] = 2;
			_Helper.setPrivateAnnotation(oParentGroupNode, "filter", "~filter~");
		}
		this.mock(_AggregationHelper).expects("getAllProperties").never();
		this.mock(_AggregationHelper).expects("filterOrderby").never();
		this.mock(_AggregationHelper).expects("buildApply").withExactArgs(
				sinon.match.same(oAggregation),
				sinon.match(mQueryOptions).and(sinon.match(function (o) {
					return /*!("$count" in o) &&*/ o !== mQueryOptions && (oParentGroupNode
						? o.$$filterBeforeAggregate === "~filter~"
						: !("$$filterBeforeAggregate" in o));
				})),
				iLevel) //TODO actually, we currently do not care about this level for RH...
			.returns(mCacheQueryOptions);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(oAggregationCache.oRequestor), "Foo",
				sinon.match(function (o) {
					// Note: w/o grand total, buildApply determines the query options to be used!
					return o.$count && o === mCacheQueryOptions;
				}), true)
			.returns(oCache);
		// This must be done before calling createGroupLevelCache, so that bind grabs the mock
		this.mock(_AggregationCache).expects("calculateKeyPredicate").never();
		this.mock(_AggregationCache).expects("calculateKeyPredicateRH").on(null)
			.withExactArgs(sinon.match.same(oParentGroupNode), "~oElement~",
				"~mTypeForMetaPath~", "~metapath~")
			.returns("~sPredicate~");

		assert.strictEqual(
			// code under test
			oAggregationCache.createGroupLevelCache(oParentGroupNode, false),
			oCache
		);

		// code under test (this normally happens inside the created cache's handleResponse method)
		assert.strictEqual(
			oCache.calculateKeyPredicate("~oElement~", "~mTypeForMetaPath~", "~metapath~"),
			"~sPredicate~");
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bLeaf) {
	[false, true].forEach(function (bParent) {
		[false, true].forEach(function (bHasRealKeyPredicate) {
			var sTitle = "calculateKeyPredicate: leaf=" + bLeaf
					+ ", has real key predicate: " + bHasRealKeyPredicate
					+ ", parent=" + bParent;

			if (bHasRealKeyPredicate && !bLeaf) {
				return; // ignore useless combination
			}

	QUnit.test(sTitle, function (assert) {
		var aAllProperties = ["p1", "p2", ["a", "b"], "p3", "p4", ["c", "d"]],
			oElement = {
				p2 : "v2",
				p4 : "v4"
			},
			oElementMatcher = sinon.match(function (o) {
				return o === oElement && (bParent
					? o.p1 === "v1" && o.p2 === "v2" && o.p3 === "v3" && o.p4 === "v4"
					: !("p1" in o) && o.p2 === "v2" && !("p3" in o) && o.p4 === "v4");
			}),
			aGroupBy = [/*does not matter*/],
			oGroupNode = {
				p1 : "v1",
				p2 : "n/a",
				p3 : "v3",
				"@$ui5.node.level" : 2
			},
			oHelperMock = this.mock(_Helper),
			mTypeForMetaPath = {"/meta/path" : {}};

		oHelperMock.expects("inheritPathValue").exactly(bParent ? 1 : 0)
			.withExactArgs(["a", "b"], sinon.match.same(oGroupNode), sinon.match.same(oElement));
		oHelperMock.expects("inheritPathValue").exactly(bParent ? 1 : 0)
			.withExactArgs(["c", "d"], sinon.match.same(oGroupNode), sinon.match.same(oElement));
		oHelperMock.expects("getKeyPredicate").exactly(bLeaf ? 1 : 0)
			.withExactArgs(oElementMatcher, "/meta/path", sinon.match.same(mTypeForMetaPath))
			.returns(bHasRealKeyPredicate ? "~predicate~" : undefined);
		oHelperMock.expects("getKeyPredicate").exactly(bHasRealKeyPredicate ? 0 : 1)
			.withExactArgs(oElementMatcher, "/meta/path", sinon.match.same(mTypeForMetaPath),
				sinon.match.same(aGroupBy), true).returns("~predicate~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate", "~predicate~");
		oHelperMock.expects("getKeyFilter").exactly(bLeaf ? 0 : 1)
			.withExactArgs(oElementMatcher, "/meta/path", sinon.match.same(mTypeForMetaPath),
				sinon.match.same(aGroupBy))
			.returns("~filter~");
		oHelperMock.expects("setPrivateAnnotation").exactly(bLeaf ? 0 : 1)
			.withExactArgs(sinon.match.same(oElement), "filter", "~filter~");
		this.mock(_AggregationHelper).expects("setAnnotations")
			.withExactArgs(sinon.match.same(oElement), bLeaf ? undefined : false, "~bTotal~",
				bParent ? 3 : 1, bParent ? null : aAllProperties);

		assert.strictEqual(
			// code under test
			_AggregationCache.calculateKeyPredicate(bParent ? oGroupNode : undefined, aGroupBy,
				aAllProperties, bLeaf, "~bTotal~", oElement, mTypeForMetaPath, "/meta/path"),
			"~predicate~");

		assert.deepEqual(oElement, bParent ? {
			p1 : "v1",
			p2 : "v2",
			p3 : "v3",
			p4 : "v4"
		} : {
			p2 : "v2",
			p4 : "v4"
		});
	});
		});
	});
});

	//*********************************************************************************************
[0, 7].forEach(function (iDistanceFromRoot) {
	["collapsed", "expanded", "leaf"].forEach(function (sDrillState) {
		[undefined, {"@$ui5.node.level" : 41}].forEach(function (oGroupNode) {
	var sTitle = "calculateKeyPredicateRH: DistanceFromRoot : " + iDistanceFromRoot
			+ ", DrillState : " + sDrillState + ", oGroupNode : " + JSON.stringify(oGroupNode);

	QUnit.test(sTitle, function (assert) {
		var oElement = {
				DescendantCount : "~descendants~",
				DistanceFromRoot : iDistanceFromRoot,
				DrillState : sDrillState,
				Foo : "bar",
				XYZ : 42
			},
			oHelperMock = this.mock(_Helper),
			bIsExpanded = {
				collapsed : false,
				expanded : true,
				leaf : undefined
			}[sDrillState],
			mTypeForMetaPath = {"/meta/path" : {}};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oElement), "/meta/path",
				sinon.match.same(mTypeForMetaPath))
			.returns("~predicate~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate", "~predicate~");
		oHelperMock.expects("getKeyFilter").never();
		if (sDrillState === "collapsed") {
			oHelperMock.expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oElement), "/meta/path",
					sinon.match.same(mTypeForMetaPath))
				.returns("~filter~");
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oElement), "filter", "~filter~");
		} else if (sDrillState === "expanded") {
			this.mock(_AggregationHelper).expects("getOrCreateExpandedObject")
				.withExactArgs({/*oAggregation*/}, sinon.match.same(oElement));
		}
		this.mock(_AggregationHelper).expects("setAnnotations")
			.withExactArgs(sinon.match.same(oElement), bIsExpanded, /*bIsTotal*/undefined,
				oGroupNode ? 42 : iDistanceFromRoot + 1);
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "descendants", "~descendants~");

		assert.strictEqual(
			// code under test
			_AggregationCache.calculateKeyPredicateRH(oGroupNode, oElement, mTypeForMetaPath,
				"/meta/path"),
			"~predicate~");

		assert.deepEqual(oElement, {Foo : "bar", XYZ : 42});
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("calculateKeyPredicate: nested object", function (assert) {
		var mTypeForMetaPath = {"/Artists" : {}};

		this.mock(_Helper).expects("inheritPathValue").never();
		this.mock(_Helper).expects("getKeyPredicate").never();
		this.mock(_Helper).expects("setPrivateAnnotation").never();
		this.mock(_Helper).expects("getKeyFilter").never();
		this.mock(_AggregationHelper).expects("setAnnotations").never();

		assert.strictEqual(
			// code under test
			_AggregationCache.calculateKeyPredicate(null, null, null, undefined, undefined, null,
				mTypeForMetaPath, "/Artists/BestFriend"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: not $count", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : ["BillToParty"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {});

		this.mock(oCache).expects("registerChangeListener").withExactArgs("~path~", "~oListener~");
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), "~path~", "~oGroupLock~")
			.returns("~promise~");

		assert.strictEqual(
			// code under test
			oCache.fetchValue("~oGroupLock~", "~path~", "~fnDataRequested~", "~oListener~"),
			"~promise~");
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: no leaf $count available with recursive hierarchy", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {});

		this.mock(oCache.oFirstLevel).expects("fetchValue").never();
		this.mock(oCache).expects("registerChangeListener").never();
		this.mock(oCache).expects("drillDown").never();
		this.oLogMock.expects("error")
			.withExactArgs("Failed to drill-down into $count, invalid segment: $count",
				oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(
			// code under test
			oCache.fetchValue("~oGroupLock~", "$count", "~fnDataRequested~", "~oListener~"),
			SyncPromise.resolve());
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: no leaf $count available with visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : ["BillToParty"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {});

		this.mock(oCache.oFirstLevel).expects("fetchValue").never();
		this.mock(oCache).expects("registerChangeListener").never();
		this.mock(oCache).expects("drillDown").never();
		this.oLogMock.expects("error")
			.withExactArgs("Failed to drill-down into $count, invalid segment: $count",
				oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(
			// code under test
			oCache.fetchValue("~oGroupLock~", "$count", "~fnDataRequested~", "~oListener~"),
			SyncPromise.resolve());
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: leaf $count available without visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {
					SalesNumber : {grandTotal : true}
				},
				group : {},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {
				$count : true
			});

		this.mock(oCache.oFirstLevel).expects("fetchValue")
			.withExactArgs("~oGroupLock~", "$count", "~fnDataRequested~", "~oListener~")
			.returns("~promise~");
		this.mock(oCache).expects("registerChangeListener").never();
		this.mock(oCache).expects("drillDown").never();

		assert.strictEqual(
			// code under test
			oCache.fetchValue("~oGroupLock~", "$count", "~fnDataRequested~", "~oListener~"),
			"~promise~");
	});

	//*********************************************************************************************
[{
	iIndex : 0,
	iLength : 3,
	bHasGrandTotal : false,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 3
}, {
	iIndex : 0,
	iLength : 3,
	bHasGrandTotal : true,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 2
}, {
	iIndex : 0,
	iLength : 3,
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : false,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 2
}, {
	iIndex : 0,
	iLength : 1,
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : true,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 1
}, {
	iIndex : 10,
	iLength : 3,
	bHasGrandTotal : false,
	iFirstLevelIndex : 10,
	iFirstLevelLength : 3
}, {
	iIndex : 10,
	iLength : 3,
	bHasGrandTotal : true,
	iFirstLevelIndex : 9,
	iFirstLevelLength : 3
}, {
	iIndex : 10,
	iLength : 3,
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : false,
	iFirstLevelIndex : 9,
	iFirstLevelLength : 3
}, {
	iIndex : 10,
	iLength : 3,
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : true,
	iFirstLevelIndex : 10,
	iFirstLevelLength : 3
}, {
	iIndex : 1,
	iLength : 42,
	bHasGrandTotal : true,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 42
}].forEach(function (oFixture, i) {
	QUnit.test("read: 1st time, #" + i, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {
					SalesNumber : {grandTotal : oFixture.bHasGrandTotal}
				},
				group : {},
				groupLevels : ["group"]
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCacheMock = this.mock(oCache),
			iFirstLevelIndex = oFixture.iFirstLevelIndex,
			iFirstLevelLength = oFixture.iFirstLevelLength,
			oGrandTotal = {},
			oGrandTotalCopy = {},
			oGroupLock = {
				unlock : function () {}
			},
			iIndex = oFixture.iIndex,
			iLength = oFixture.iLength,
			iOffset = oFixture.bHasGrandTotal && oFixture.grandTotalAtBottomOnly !== true ? 1 : 0,
			iPrefetchLength = 100,
			oReadResult = {
				value : []
			},
			i;

		function checkResult(oResult) {
			assert.strictEqual(oResult.value.length, iLength);
			assert.strictEqual(oResult.value.$count, oCache.aElements.$count);
			for (i = 0; i < iLength; i += 1) {
				assert.strictEqual(oResult.value[i], oCache.aElements[iIndex + i]);
			}
		}

		if ("grandTotalAtBottomOnly" in oFixture) {
			oAggregation.grandTotalAtBottomOnly = oFixture.grandTotalAtBottomOnly;
		}
		if (oFixture.bHasGrandTotal) {
			oCache.oGrandTotalPromise = SyncPromise.resolve(oGrandTotal);
			_Helper.setPrivateAnnotation(oGrandTotal, "copy", oGrandTotalCopy);
		}
		for (i = 0; i < iFirstLevelLength; i += 1) {
			oReadResult.value.push({});
		}
		oReadResult.value.$count = 42;
		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(iFirstLevelIndex, iFirstLevelLength, iPrefetchLength,
				sinon.match.same(oGroupLock), "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult)));
		if (oFixture.bHasGrandTotal) {
			switch (oFixture.grandTotalAtBottomOnly) {
				case false: // top & bottom
					oCacheMock.expects("addElements")
						.withExactArgs(sinon.match.same(oGrandTotal), 0)
						.callsFake(addElements); // so that oCache.aElements is actually filled
					oCacheMock.expects("addElements")
						.withExactArgs(sinon.match.same(oGrandTotalCopy), 43)
						.callsFake(addElements); // so that oCache.aElements is actually filled
					break;

				case true: // bottom
					oCacheMock.expects("addElements")
						.withExactArgs(sinon.match.same(oGrandTotal), 42)
						.callsFake(addElements); // so that oCache.aElements is actually filled
					break;

				default: // top
					oCacheMock.expects("addElements")
						.withExactArgs(sinon.match.same(oGrandTotal), 0)
						.callsFake(addElements); // so that oCache.aElements is actually filled
			}
		}
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult.value), iFirstLevelIndex + iOffset,
				sinon.match.same(oCache.oFirstLevel), iFirstLevelIndex)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		// expect placeholders before and after real read results
		for (i = 0; i < iFirstLevelIndex; i += 1) {
			oAggregationHelperMock.expects("createPlaceholder")
				.withExactArgs(1, i, sinon.match.same(oCache.oFirstLevel))
				.returns("~placeholder~" + i);
		}
		for (i = iFirstLevelIndex + iFirstLevelLength; i < 42; i += 1) {
			oAggregationHelperMock.expects("createPlaceholder")
				.withExactArgs(1, i, sinon.match.same(oCache.oFirstLevel))
				.returns("~placeholder~" + i);
		}

		// code under test
		return oCache.read(iIndex, iLength, iPrefetchLength, oGroupLock,
				"~fnDataRequested~")
			.then(function (oResult1) {
				var i;

				assert.strictEqual(oCache.iReadLength, iLength + iPrefetchLength);

				checkResult(oResult1);

				// check placeholders before and after real read results
				for (i = 0; i < iFirstLevelIndex; i += 1) {
					assert.strictEqual(oCache.aElements[iOffset + i], "~placeholder~" + i);
				}
				for (i = iFirstLevelIndex + iFirstLevelLength; i < 42; i += 1) {
					assert.strictEqual(oCache.aElements[iOffset + i], "~placeholder~" + i);
				}

				if (oFixture.bHasGrandTotal) {
					switch (oFixture.grandTotalAtBottomOnly) {
						case false: // top & bottom
							assert.strictEqual(oCache.aElements.length, 44);
							assert.strictEqual(oCache.aElements.$count, 44);
							break;

						case true: // bottom
						default: // top
							assert.strictEqual(oCache.aElements.length, 43);
							assert.strictEqual(oCache.aElements.$count, 43);
					}
				} else {
					assert.strictEqual(oCache.aElements.length, 42);
					assert.strictEqual(oCache.aElements.$count, 42);
				}

				// code under test
				return oCache.read(iIndex, iLength, iPrefetchLength, oGroupLock,
					"~fnDataRequested~"
				).then(function (oResult2) {
					checkResult(oResult2);
				});
			});
	});
});

	//*********************************************************************************************
	QUnit.test("read: from group level cache", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLevelCacheMock = this.mock(oGroupLevelCache),
			oGroupLock0 = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLock1 = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oCacheMock = this.mock(oCache),
			mQueryOptions = {$count : true, foo : "bar"},
			oReadResult0 = {value : [{}]},
			oReadResult1 = {value : [{}, {}]},
			that = this;

		oCache.aElements = [
			{/* expanded node */},
			{/* first leaf */},
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 3, oGroupLevelCache),
			{/* other node */}
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLevelCacheMock.expects("getQueryOptions").withExactArgs().returns(mQueryOptions);
		oGroupLevelCacheMock.expects("setQueryOptions")
			.withExactArgs(sinon.match(function (mNewQueryOptions) {
					assert.deepEqual(mNewQueryOptions, {foo : "bar"});
					return mNewQueryOptions === mQueryOptions;
				}), true);
		this.mock(oGroupLock0).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy0~");
		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 1, 0, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2,
				sinon.match.same(oGroupLevelCache), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		this.mock(oGroupLock0).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(2, 1, 0, oGroupLock0, "~fnDataRequested~").then(function (oResult1) {
			assert.strictEqual(oResult1.value.length, 1);
			assert.strictEqual(oResult1.value[0], oReadResult0.value[0]);
			assert.strictEqual(oResult1.value.$count, 42);

			oGroupLevelCacheMock.expects("getQueryOptions").withExactArgs().returns({foo : "bar"});
			that.mock(oGroupLock1).expects("getUnlockedCopy").withExactArgs()
				.returns("~oGroupLockCopy1~");
			oGroupLevelCacheMock.expects("read")
				.withExactArgs(2, 2, 0, "~oGroupLockCopy1~", "~fnDataRequested~")
				.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));
			oCacheMock.expects("addElements")
				.withExactArgs(sinon.match.same(oReadResult1.value), 3,
					sinon.match.same(oGroupLevelCache), 2)
				.callsFake(addElements); // so that oCache.aElements is actually filled
			that.mock(oGroupLock1).expects("unlock").withExactArgs();

			// code under test
			return oCache.read(3, 3, 0, oGroupLock1, "~fnDataRequested~");
		}).then(function (oResult2) {
			assert.strictEqual(oResult2.value.length, 3);
			assert.strictEqual(oResult2.value[0], oReadResult1.value[0]);
			assert.strictEqual(oResult2.value[1], oReadResult1.value[1]);
			assert.strictEqual(oResult2.value[2], oCache.aElements[5]);
			assert.strictEqual(oResult2.value.$count, 42);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: first level cache and group level cache", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oFirstLeaf = {},
			oGroupLevelCache = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oReadResult0 = {value : [{}, {}]},
			oReadResult1 = {value : [{}]},
			oCacheMock = this.mock(oCache);

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf,
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(0, 1, oCache.oFirstLevel)
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLevelCache).expects("getQueryOptions").withExactArgs().returns({});
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));
		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(1, 1, 0, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2,
				sinon.match.same(oGroupLevelCache), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 4,
				sinon.match.same(oCache.oFirstLevel), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		oGroupLockMock.expects("unlock").withExactArgs();

		// code under test
		return oCache.read(1, 4, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value.length, 4);
			assert.strictEqual(oResult.value[0], oFirstLeaf);
			assert.strictEqual(oResult.value[1], oReadResult0.value[0]);
			assert.strictEqual(oResult.value[2], oReadResult0.value[1]);
			assert.strictEqual(oResult.value[3], oReadResult1.value[0]);
			assert.strictEqual(oResult.value.$count, 42);

			assert.strictEqual(oCache.aElements[1], oFirstLeaf);
			assert.strictEqual(oCache.aElements[2], oReadResult0.value[0]);
			assert.strictEqual(oCache.aElements[3], oReadResult0.value[1]);
			assert.strictEqual(oCache.aElements[4], oReadResult1.value[0]);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: intersecting reads", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCacheMock = this.mock(oCache),
			oFirstLeaf = {},
			oGroupLevelCache = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLevelCacheMock = this.mock(oGroupLevelCache),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oReadSameNode = {},
			oReadResult0 = {value : [{}, oReadSameNode, {}]},
			oReadResult1 = {value : [oReadSameNode]};

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf,
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 3, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 4, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 5, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 6, oGroupLevelCache)
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLevelCacheMock.expects("getQueryOptions").twice().withExactArgs().returns({});
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		oGroupLockMock.expects("unlock").withExactArgs().twice();
		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 3, 0, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));
		oGroupLevelCacheMock.expects("read")
			.withExactArgs(2, 1, 0, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2,
				sinon.match.same(oGroupLevelCache), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 3,
				sinon.match.same(oGroupLevelCache), 2)
			.callsFake(addElements); // so that oCache.aElements is actually filled

		// code under test
		return Promise.all([
			oCache.read(1, 4, 0, oGroupLock, "~fnDataRequested~"),
			oCache.read(3, 1, 0, oGroupLock, "~fnDataRequested~")
		]).then(function (aResults) {
			assert.strictEqual(aResults[0].value.length, 4);
			assert.strictEqual(aResults[0].value[0], oFirstLeaf);
			assert.strictEqual(aResults[0].value[1], oReadResult0.value[0]);
			assert.strictEqual(aResults[0].value[2], oReadSameNode);
			assert.strictEqual(aResults[0].value[2], oReadResult0.value[1]);
			assert.strictEqual(aResults[0].value.$count, 42);
			assert.strictEqual(aResults[1].value.length, 1);
			assert.strictEqual(aResults[1].value[0], oReadSameNode);
			assert.strictEqual(aResults[1].value.$count, 42);

			assert.strictEqual(oCache.aElements[1], oFirstLeaf);
			assert.strictEqual(oCache.aElements[2], oReadResult0.value[0]);
			assert.strictEqual(oCache.aElements[3], oReadSameNode);
			assert.strictEqual(oCache.aElements[4], oReadResult0.value[2]);
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[5], "index"), 4);
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[6], "index"), 5);
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[7], "index"), 6);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: expand before read has finished", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oFirstLeaf = {},
			oGroupLevelCache = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oInsertedNode = {},
			oReadResult0 = {value : [{}, {}]};

		oCache.aElements = [
			{/* not expanded node */},
			{/* expanded node */},
			oFirstLeaf,
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache)
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLevelCache).expects("getQueryOptions").withExactArgs().returns({});
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy~", "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate an expand
				oCache.aElements.splice(1, 0, oInsertedNode);

				return Promise.resolve(oReadResult0);
			});
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 4,
				sinon.match.same(oGroupLevelCache), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(3, 2, 0, oGroupLock, "~fnDataRequested~").then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError) {
			assert.strictEqual(oError.message, "Collapse or expand before read has finished");
			assert.strictEqual(oError.canceled, true);

			assert.strictEqual(oCache.aElements[1], oInsertedNode);
			assert.strictEqual(oCache.aElements[3], oFirstLeaf);
			assert.strictEqual(oCache.aElements[4], oReadResult0.value[0]);
			assert.strictEqual(oCache.aElements[5], oReadResult0.value[1]);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: aElements has changed while reading", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oFirstLeaf = {},
			oGroupLevelCache = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oPlaceholder0 = _AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			oReadResultFirstNode = {},
			oReadResult0 = {value : [oReadResultFirstNode]};

		oCache.aElements = [
			{/* not expanded node */},
			{/* expanded node */},
			oFirstLeaf,
			oPlaceholder0,
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache)
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLevelCache).expects("getQueryOptions").withExactArgs().returns({});
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(2, 1, 0, "~oGroupLockCopy~", "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate an expand and a concurrent read
				oCache.aElements.splice(1, 0, {});
				oCache.aElements[5] = oReadResultFirstNode;

				return Promise.resolve(oReadResult0);
			});
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 5,
				sinon.match.same(oGroupLevelCache), 2)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(4, 1, 0, oGroupLock, "~fnDataRequested~").then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError) {
			assert.strictEqual(oError.message, "Collapse or expand before read has finished");
			assert.strictEqual(oError.canceled, true);

			assert.strictEqual(oCache.aElements[3], oFirstLeaf);
			assert.strictEqual(oCache.aElements[4], oPlaceholder0);
			assert.strictEqual(oCache.aElements[5], oReadResultFirstNode);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: collapse before read has finished", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oReadResult = {value : [{}]};

		oCache.aElements = [
			{/* not expanded node */},
			{/* expanded node */},
			{/* first leaf */},
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache),
			{/* yet another not expanded node */}
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLevelCache).expects("getQueryOptions").withExactArgs().returns({});
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy~", "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate a collapse
				oCache.aElements.splice(2, 3);

				return Promise.resolve(oReadResult);
			});
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(oCache).expects("addElements").never();

		// code under test
		return oCache.read(2, 3, 0, oGroupLock, "~fnDataRequested~").then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError) {
			assert.strictEqual(oError.message, "Collapse before read has finished");
			assert.strictEqual(oError.canceled, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: two different group level caches", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCacheMock = this.mock(oCache),
			oFirstLeaf0 = {},
			oFirstLeaf1 = {},
			oGroupLevelCache0 = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLevelCache1 = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oReadPromise,
			oReadResult0 = {value : [{}, {}]},
			oReadResult1 = {value : [{}, {}]},
			oUnlockExpectation;

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf0,
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache0),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache0),
			{/* expanded node */},
			oFirstLeaf1,
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache1),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache1)
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLevelCache0).expects("getQueryOptions").withExactArgs().returns({});
		this.mock(oGroupLevelCache1).expects("getQueryOptions").withExactArgs().returns({});
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		oUnlockExpectation = oGroupLockMock.expects("unlock").withExactArgs();
		this.mock(oGroupLevelCache0).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));
		this.mock(oGroupLevelCache1).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2,
				sinon.match.same(oGroupLevelCache0), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 6,
				sinon.match.same(oGroupLevelCache1), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled

		// code under test
		oReadPromise = oCache.read(1, 7, 0, oGroupLock, "~fnDataRequested~")
			.then(function (oResult) {
				assert.strictEqual(oResult.value.length, 7);
				assert.strictEqual(oResult.value[0], oFirstLeaf0);
				assert.strictEqual(oResult.value[1], oReadResult0.value[0]);
				assert.strictEqual(oResult.value[2], oReadResult0.value[1]);

				assert.strictEqual(oResult.value[4], oFirstLeaf1);
				assert.strictEqual(oResult.value[5], oReadResult1.value[0]);
				assert.strictEqual(oResult.value[6], oReadResult1.value[1]);
				assert.strictEqual(oResult.value.$count, 42);

				assert.strictEqual(oCache.aElements[1], oFirstLeaf0);
				assert.strictEqual(oCache.aElements[2], oReadResult0.value[0]);
				assert.strictEqual(oCache.aElements[3], oReadResult0.value[1]);

				assert.strictEqual(oCache.aElements[5], oFirstLeaf1);
				assert.strictEqual(oCache.aElements[6], oReadResult1.value[0]);
				assert.strictEqual(oCache.aElements[7], oReadResult1.value[1]);
			});

		sinon.assert.called(oUnlockExpectation);

		return oReadPromise;
	});

	//*********************************************************************************************
	QUnit.test("read: only placeholder", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oReadResult = {value : [{}, {}, {}]};

		oCache.aElements = [
			{},
			_AggregationHelper.createPlaceholder(1, 1, oCache.oFirstLevel),
			_AggregationHelper.createPlaceholder(1, 2, oCache.oFirstLevel),
			_AggregationHelper.createPlaceholder(1, 3, oCache.oFirstLevel),
			_AggregationHelper.createPlaceholder(1, 4, oCache.oFirstLevel),
			_AggregationHelper.createPlaceholder(1, 5, oCache.oFirstLevel),
			_AggregationHelper.createPlaceholder(1, 6, oCache.oFirstLevel),
			_AggregationHelper.createPlaceholder(1, 7, oCache.oFirstLevel)
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 8;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(3, 3, 0, "~oGroupLockCopy~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult)));
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult.value), 3,
				sinon.match.same(oCache.oFirstLevel), 3)
			.callsFake(addElements); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(3, 3, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value.length, 3);
			assert.strictEqual(oResult.value[0], oReadResult.value[0]);
			assert.strictEqual(oResult.value[1], oReadResult.value[1]);
			assert.strictEqual(oResult.value[2], oReadResult.value[2]);
			assert.strictEqual(oResult.value.$count, 8);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: more elements than existing", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oReadResult = {value : [{}]};

		oCache.aElements = [
			{},
			_AggregationHelper.createPlaceholder(1, 1, oCache.oFirstLevel)
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 2;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(1, 1, 0, "~oGroupLockCopy~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult)));
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult.value), 1,
				sinon.match.same(oCache.oFirstLevel), 1)
			.callsFake(addElements); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(0, 100, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value.length, 2);
			assert.strictEqual(oResult.value[0], oCache.aElements[0]);
			assert.strictEqual(oResult.value[1], oReadResult.value[0]);
			assert.strictEqual(oResult.value.$count, 2);
		});
	});

	//*********************************************************************************************
[false, true, "expanding"].forEach(function (vHasCache) {
	[undefined, false, true].forEach(function (bSubtotalsAtBottomOnly) {
		[false, true].forEach(function (bSubtotals) { // JIRA: CPOUI5ODATAV4-825
		var sTitle = "expand: read; has cache = " + vHasCache
				+ ", subtotalsAtBottomOnly = " + bSubtotalsAtBottomOnly
				+ ", subtotals = " + bSubtotals;

		if (vHasCache && bSubtotalsAtBottomOnly !== undefined) {
			return; // skip invalid combination
		}

	QUnit.test(sTitle, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCacheMock = this.mock(oCache),
			oCollapsed = {"@$ui5.node.isExpanded" : false},
			aElements = [{
				"@$ui5.node.isExpanded" : vHasCache === "expanding",
				// while 0 would be realistic, we want to test the general case here
				"@$ui5.node.level" : 23
			}, {}, {}],
			oExpanded = {"@$ui5.node.isExpanded" : true},
			oExpandResult = {
				value : [{}, {}, {}, {}, {}]
			},
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLock = {
				unlock : function () {} // needed for oCache.read() below
			},
			oGroupNode = aElements[0],
			vGroupNodeOrPath = vHasCache === "expanding" ? oGroupNode : "~path~",
			oHelperMock = this.mock(_Helper),
			oPromise,
			bSubtotalsAtBottom = bSubtotals && bSubtotalsAtBottomOnly !== undefined,
			oUpdateAllExpectation,
			that = this;

		if (bSubtotals) {
			oCollapsed.A = "10"; // placeholder for an aggregate with subtotals
		}
		oExpandResult.value.$count = 7;
		_Helper.setPrivateAnnotation(oGroupNode, "collapsed", oCollapsed);
		_Helper.setPrivateAnnotation(oGroupNode, "predicate", "(~predicate~)");
		if (vHasCache) {
			_Helper.setPrivateAnnotation(oGroupNode, "cache", oGroupLevelCache);
		}
		if (bSubtotalsAtBottomOnly !== undefined) {
			oAggregation.subtotalsAtBottomOnly = bSubtotalsAtBottomOnly;
		}

		// simulate a read
		oCache.iReadLength = 42;
		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 3;

		oCacheMock.expects("fetchValue").exactly(vHasCache === "expanding" ? 0 : 1)
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oGroupNode));
		this.mock(_AggregationHelper).expects("getOrCreateExpandedObject")
			.exactly(vHasCache === "expanding" ? 0 : 1)
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(oGroupNode))
			.returns(oExpanded);
		oUpdateAllExpectation = oHelperMock.expects("updateAll")
			.exactly(vHasCache === "expanding" ? 0 : 1)
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oGroupNode), sinon.match.same(oExpanded))
			.callThrough(); // "@$ui5.node.isExpanded" is checked once read has finished
		oCacheMock.expects("createGroupLevelCache").exactly(vHasCache ? 0 : 1)
			.withExactArgs(sinon.match.same(oGroupNode)).returns(oGroupLevelCache);
		oHelperMock.expects("setPrivateAnnotation").exactly(vHasCache ? 0 : 1)
			.withExactArgs(sinon.match.same(oGroupNode), "cache",
				sinon.match.same(oGroupLevelCache));
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oGroupNode), "groupLevelCount", 7);
		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners),
				sinon.match.same(vGroupNodeOrPath), sinon.match.same(oGroupNode),
				{"@$ui5.node.groupLevelCount" : 7});
		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oExpandResult.value), 1,
				sinon.match.same(oGroupLevelCache), 0)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(24, 5, sinon.match.same(oGroupLevelCache)).returns("~placeholder~1");
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(24, 6, sinon.match.same(oGroupLevelCache)).returns("~placeholder~2");
		if (bSubtotalsAtBottom) {
			this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(oCollapsed))
				.returns("~oSubtotals~");
			oAggregationHelperMock.expects("getAllProperties")
				.withExactArgs(sinon.match.same(oAggregation)).returns("~aAllProperties~");
			oAggregationHelperMock.expects("setAnnotations")
				.withExactArgs("~oSubtotals~", undefined, true, 23, "~aAllProperties~");
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs("~oSubtotals~", "predicate", "(~predicate~,$isTotal=true)");
			oCacheMock.expects("addElements").withExactArgs("~oSubtotals~", 8);
		} else {
			oAggregationHelperMock.expects("getAllProperties").never();
			oAggregationHelperMock.expects("setAnnotations").never();
		}

		// code under test
		oPromise = oCache.expand(oGroupLock, vGroupNodeOrPath).then(function (iResult) {
			var iExpectedCount = bSubtotalsAtBottom ? 8 : 7;

			assert.strictEqual(iResult, iExpectedCount);

			assert.strictEqual(oCache.aElements.length, 3 + iExpectedCount, ".length");
			assert.strictEqual(oCache.aElements.$count, 3 + iExpectedCount, ".$count");
			// check parent node
			assert.strictEqual(oCache.aElements[0], oGroupNode);

			// check expanded nodes
			assert.strictEqual(oCache.aElements[1], oExpandResult.value[0]);
			assert.strictEqual(oCache.aElements[2], oExpandResult.value[1]);
			assert.strictEqual(oCache.aElements[3], oExpandResult.value[2]);
			assert.strictEqual(oCache.aElements[4], oExpandResult.value[3]);
			assert.strictEqual(oCache.aElements[5], oExpandResult.value[4]);

			// check placeholders
			assert.strictEqual(oCache.aElements[6], "~placeholder~1");
			assert.strictEqual(oCache.aElements[7], "~placeholder~2");

			// check moved nodes
			if (bSubtotalsAtBottom) {
				assert.strictEqual(oCache.aElements[9], aElements[1]);
				assert.strictEqual(oCache.aElements[10], aElements[2]);
			} else {
				assert.strictEqual(oCache.aElements[8], aElements[1]);
				assert.strictEqual(oCache.aElements[9], aElements[2]);
			}

			that.mock(oCache.oFirstLevel).expects("read").never();

			return oCache.read(1, 4, 0, oGroupLock).then(function (oResult) {
				assert.strictEqual(oResult.value.length, 4);
				assert.strictEqual(oResult.value.$count, 3 + iExpectedCount);
				oResult.value.forEach(function (oElement, i) {
					assert.strictEqual(oElement, oCache.aElements[i + 1], "index " + (i + 1));
				});
			});
		});

		oUpdateAllExpectation.verify();

		return oPromise;
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("expand: at end", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			aElements = [{}, {}, {
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 0
			}],
			oExpanded = {"@$ui5.node.isExpanded" : true},
			oExpandResult = {
				value : [{}, {}, {}, {}, {}]
			},
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLock = {
				unlock : function () {} // needed for oCache.read() below
			},
			oGroupNode = aElements[2],
			oHelperMock = this.mock(_Helper),
			oPromise,
			oUpdateAllExpectation;

		oExpandResult.value.$count = 7;

		// simulate a read
		oCache.iReadLength = 42;
		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 3;

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oGroupNode));
		this.mock(_AggregationHelper).expects("getOrCreateExpandedObject")
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(oGroupNode))
			.returns(oExpanded);
		oUpdateAllExpectation = oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oGroupNode), sinon.match.same(oExpanded))
			.callThrough(); // "@$ui5.node.isExpanded" is checked once read has finished
		this.mock(oCache).expects("createGroupLevelCache")
			.withExactArgs(sinon.match.same(oGroupNode)).returns(oGroupLevelCache);
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oGroupNode), {"@$ui5.node.groupLevelCount" : 7});
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oExpandResult.value), 3,
				sinon.match.same(oGroupLevelCache), 0)
			.callsFake(addElements); // so that oCache.aElements is actually filled
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(1, 5, sinon.match.same(oGroupLevelCache)).returns("~placeholder~1");
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(1, 6, sinon.match.same(oGroupLevelCache)).returns("~placeholder~2");

		// code under test
		oPromise = oCache.expand(oGroupLock, "~path~").then(function (iResult) {
			assert.strictEqual(iResult, 7);

			assert.strictEqual(oCache.aElements.length, 3 + 7, ".length");
			assert.strictEqual(oCache.aElements.$count, 3 + 7, ".$count");
			assert.strictEqual(oCache.aElements[0], aElements[0]);
			assert.strictEqual(oCache.aElements[1], aElements[1]);

			// check parent node
			assert.strictEqual(oCache.aElements[2], oGroupNode);
			assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "cache"), oGroupLevelCache);

			// check expanded nodes
			assert.strictEqual(oCache.aElements[3], oExpandResult.value[0]);
			assert.strictEqual(oCache.aElements[4], oExpandResult.value[1]);
			assert.strictEqual(oCache.aElements[5], oExpandResult.value[2]);
			assert.strictEqual(oCache.aElements[6], oExpandResult.value[3]);
			assert.strictEqual(oCache.aElements[7], oExpandResult.value[4]);

			// check placeholders
			assert.strictEqual(oCache.aElements[8], "~placeholder~1");
			assert.strictEqual(oCache.aElements[9], "~placeholder~2");
		});

		oUpdateAllExpectation.verify();

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("expand: after collapse (w/ 'spliced')", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCacheMock = this.mock(oCache),
			aElements,
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLock = {},
			oGroupNode = {
				"@$ui5._" : {
					cache : oGroupLevelCache,
					groupLevelCount : 7,
					spliced : [{
						"@$ui5._" : {predicate : "('A')"}
					}, {
						// no predicate, e.g. placeholder
					}, {
						"@$ui5._" : {expanding : true, predicate : "('C')"}
					}]
				},
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 0
			},
			oHelperMock = this.mock(_Helper),
			oPromise,
			aSpliced,
			oUpdateAllExpectation;

		oGroupNode["@$ui5._"].spliced[200000] = {
			"@$ui5._" : {predicate : "('D')"}
		};
		aSpliced = oGroupNode["@$ui5._"].spliced.slice();
		aElements = [{}, oGroupNode, {}, {}];
		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 4;
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oGroupNode));
		oUpdateAllExpectation = oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oGroupNode), {"@$ui5.node.isExpanded" : true})
			.callThrough(); // "@$ui5.node.isExpanded" is checked once read has finished
		oHelperMock.expects("updateAll")
			.withExactArgs(oCache.mChangeListeners, "~path~", sinon.match.same(oGroupNode),
			{"@$ui5.node.groupLevelCount" : 7});
		oCacheMock.expects("createGroupLevelCache").never();
		this.mock(oGroupLevelCache).expects("read").never();
		oCacheMock.expects("addElements").never();
		this.mock(_AggregationHelper).expects("createPlaceholder").never();
		oCacheMock.expects("expand").withExactArgs(sinon.match.same(oGroupLock), "~path~")
			.callThrough(); // for code under test
		oCacheMock.expects("expand")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sinon.match.same(aSpliced[2]))
			.returns(SyncPromise.resolve(100));

		// code under test
		oPromise = oCache.expand(oGroupLock, "~path~").then(function (iResult) {
			assert.strictEqual(iResult, 100 + 200001);

			assert.strictEqual(oCache.aElements.length, 200005, ".length");
			assert.strictEqual(oCache.aElements.$count, 200005, ".$count");
			assert.strictEqual(oCache.aElements[0], aElements[0]);
			// check parent node
			assert.strictEqual(oCache.aElements[1], oGroupNode);
			assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "cache"), oGroupLevelCache);
			assert.notOk(_Helper.hasPrivateAnnotation(oGroupNode, "spliced"));

			// check expanded nodes
			assert.deepEqual(Object.keys(oCache.aElements),
				["0", "1", "2", "3", "4", "200002", "200003", "200004", "$byPredicate", "$count"]);
			assert.strictEqual(oCache.aElements[2], aSpliced[0]);
			assert.strictEqual(oCache.aElements[3], aSpliced[1]);
			assert.strictEqual(oCache.aElements[4], aSpliced[2]);
			assert.notOk(_Helper.hasPrivateAnnotation(aSpliced[2], "expanding"));
			assert.strictEqual(oCache.aElements[200002], aSpliced[200000]);

			// check moved nodes
			assert.strictEqual(oCache.aElements[200003], aElements[2]);
			assert.strictEqual(oCache.aElements[200004], aElements[3]);

			assert.deepEqual(oCache.aElements.$byPredicate, {
				"('A')" : aSpliced[0],
				"('C')" : aSpliced[2],
				"('D')" : aSpliced[200000]
			});
		});

		oUpdateAllExpectation.verify();

		return oPromise;
	});

	//*********************************************************************************************
[false, true].forEach(function (bSelf) {
	var sTitle = "expand: collapse " + (bSelf ? "self" : "parent") + " before expand has finished";

	QUnit.test(sTitle, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			aElements = [{
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 0
			}, {}, {}],
			oExpandResult = {
				value : [{}, {}, {}, {}, {}]
			},
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLock = {},
			oGroupNode = aElements[0],
			oPromise,
			oUpdateAllExpectation;

		oExpandResult.value.$count = 7;

		// simulate a read
		oCache.iReadLength = 42;
		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 3;

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oGroupNode));
		oUpdateAllExpectation = this.mock(_Helper).expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oGroupNode), {"@$ui5.node.isExpanded" : true})
			.callThrough(); // "@$ui5.node.isExpanded" is checked once read has finished
		this.mock(oCache).expects("createGroupLevelCache")
			.withExactArgs(sinon.match.same(oGroupNode)).returns(oGroupLevelCache);
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		this.mock(oCache).expects("addElements").never();
		this.mock(_AggregationHelper).expects("createPlaceholder").never();

		// code under test
		oPromise = oCache.expand(oGroupLock, "~path~").then(function (iResult) {
			assert.strictEqual(iResult, 0);
			if (bSelf) {
				assert.notOk(_Helper.hasPrivateAnnotation(oGroupNode, "spliced"));
			} else {
				assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "expanding"), true);
			}
			assert.deepEqual(oCache.aElements, aElements);
			assert.strictEqual(oCache.aElements.$count, 3);
		});

		oUpdateAllExpectation.verify();

		// collapse before expand has finished
		if (bSelf) {
			oGroupNode["@$ui5.node.isExpanded"] = false;
			_Helper.setPrivateAnnotation(oGroupNode, "spliced", []);
		} else {
			oCache.aElements.shift(); // remove group node from flat list...
			aElements.shift(); // ...and from expectations :-)
		}

		return oPromise;
	});
});

	//*********************************************************************************************
	QUnit.test("expand: read failure", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCollapsed = {"@$ui5.node.isExpanded" : false},
			oError = new Error(),
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupNode = {
				"@$ui5.node.isExpanded" : false
			},
			that = this;

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oGroupNode));
		this.mock(oCache).expects("createGroupLevelCache")
			.withExactArgs(sinon.match.same(oGroupNode)).returns(oGroupLevelCache);
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, "~oGroupLock~")
			.returns(SyncPromise.resolve(Promise.resolve().then(function () {
				that.mock(_Helper).expects("getPrivateAnnotation")
					.withExactArgs(sinon.match.same(oGroupNode), "collapsed").returns(oCollapsed);
				that.mock(_Helper).expects("updateAll")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
						sinon.match.same(oGroupNode), sinon.match.same(oCollapsed));

				throw oError;
			})));

		// code under test
		return oCache.expand("~oGroupLock~", "~path~").then(function () {
			assert.ok(false);
		}, function (oResult) {
			assert.strictEqual(oResult, oError);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bUntilEnd) { // whether the collapsed children span until the end
	[undefined, false, true].forEach(function (bSubtotalsAtBottomOnly) {
		[undefined, 5, 6].forEach(function (iExpandTo) {
			var bSubtotalsAtBottom = bSubtotalsAtBottomOnly !== undefined,
				sTitle = "collapse: until end = " + bUntilEnd
					+ ", subtotalsAtBottomOnly = " + bSubtotalsAtBottomOnly
					+ ", expandTo = " + iExpandTo;

			if (bSubtotalsAtBottom && iExpandTo) {
				return;
			}
			if (!bUntilEnd && iExpandTo > 5) {
				return; // w/ iExpandTo === 6, the collapsed children span until the end
			}

	QUnit.test(sTitle, function (assert) {
		var oAggregation = iExpandTo
			? {
				expandTo : iExpandTo,
				hierarchyQualifier : "X"
			} : { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			bCollapseBottom = bUntilEnd || bSubtotalsAtBottom, // whether bottom line is affected
			oCollapsed = {
				"@$ui5.node.isExpanded" : false,
				A : "10" // placeholder for an aggregate with subtotals
			},
			// eslint-disable-next-line no-nested-ternary
			iDescendants = iExpandTo ? (iExpandTo > 5 ? 3 : 1) : undefined,
			aElements = [{
				// "@$ui5._" : {predicate : "('0')"},
				// "@$ui5.node.level" : ignored
			}, {
				"@$ui5._" : {
					collapsed : oCollapsed,
					descendants : iDescendants,
					predicate : "('1')"
				},
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.level" : 5
			}, {
				"@$ui5._" : {predicate : "('2')"},
				"@$ui5.node.level" : 6 // child
			}, {
				"@$ui5._" : {predicate : "('3')"},
				"@$ui5.node.level" : iExpandTo ? 1 : 7 // placeholder for descendant, or grandchild
			}, {
				"@$ui5._" : {predicate : "('4')"},
				// Note: for bSubtotalsAtBottom, this represents the extra row for subtotals
				"@$ui5.node.level" : bUntilEnd ? 6 : 5 // child or sibling (or "uncle" etc.)
			}],
			aExpectedElements = [{
				// "@$ui5._" : {predicate : "('0')"},
				// "@$ui5.node.level" : ignored
			}, {
				"@$ui5._" : {
					collapsed : oCollapsed,
					descendants : iDescendants,
					predicate : "('1')",
					spliced : [aElements[2], aElements[3], aElements[4]]
				},
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 5,
				A : "10" // placeholder for an aggregate with subtotals
			}, {
				"@$ui5._" : {predicate : "('4')"},
				"@$ui5.node.level" : 5 // sibling
			}];

		if (bSubtotalsAtBottom) {
			oAggregation.subtotalsAtBottomOnly = bSubtotalsAtBottomOnly;
			if (bUntilEnd) {
				// simulate that no subtotals are actually being used (JIRA: CPOUI5ODATAV4-825)
				delete oCollapsed.A;
				delete aExpectedElements[1].A;
			}
		}
		oCache.aElements = aElements.slice(); // simulate a read
		oCache.aElements.$count = aElements.length;
		oCache.aElements.$byPredicate = {
			"('0')" : aElements[0],
			"('1')" : aElements[1],
			"('2')" : aElements[2],
			"('3')" : aElements[3],
			"('4')" : aElements[4]
		};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(aElements[1]));
		this.mock(_Helper).expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(aElements[1]), sinon.match.same(oCollapsed))
			.callThrough();

		// code under test
		assert.strictEqual(oCache.collapse("~path~"), bCollapseBottom ? 3 : 2,
			"number of removed elements");

		if (bCollapseBottom) { // last element was also a child, not a sibling
			aExpectedElements.pop();
		} else {
			aExpectedElements[1]["@$ui5._"].spliced.pop();
		}
		assert.deepEqual(oCache.aElements, aExpectedElements);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], aElements[1]);
		assert.strictEqual(oCache.aElements[2], bCollapseBottom ? undefined : aElements[4]);
		assert.strictEqual(oCache.aElements.$count, aExpectedElements.length);
		assert.deepEqual(oCache.aElements.$byPredicate, bCollapseBottom
			? {
				"('0')" : aElements[0],
				"('1')" : aElements[1]
			} : {
				"('0')" : aElements[0],
				"('1')" : aElements[1],
				"('4')" : aElements[4]
			});
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("collapse: at end", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCollapsed = {"@$ui5.node.isExpanded" : false},
			aElements = [{
				"@$ui5.node.groupLevelCount" : 42,
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.level" : 5
			}],
			oHelperMock = this.mock(_Helper);

		oCache.aElements = aElements.slice(); // simulate a read
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(aElements[0]));
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(aElements[0]), "collapsed").returns(oCollapsed);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(aElements[0]), "descendants").returns(undefined);
		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(aElements[0]), sinon.match.same(oCollapsed))
			.callThrough();

		// code under test
		assert.strictEqual(oCache.collapse("~path~"), 0, "number of removed elements");

		assert.deepEqual(oCache.aElements, [{
			"@$ui5._" : {
				spliced : []
			},
			"@$ui5.node.groupLevelCount" : 42,
			"@$ui5.node.isExpanded" : false,
			"@$ui5.node.level" : 5
		}]);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
	});

	//*********************************************************************************************
	QUnit.test("addElements", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {},
			oPlaceholder = _AggregationHelper.createPlaceholder(NaN, 42, oGroupLevelCache),
			aElements = [{}, {}, oPlaceholder,, {}, {}],
			aReadElements = [
				{"@$ui5._" : {predicate : "(1)"}},
				{"@$ui5._" : {predicate : "(2)"}},
				aElements[4]
			];

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};

		// code under test
		oCache.addElements(aReadElements, 2, oGroupLevelCache, 42);

		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], aElements[1]);
		assert.strictEqual(oCache.aElements[2], aReadElements[0]);
		assert.strictEqual(oCache.aElements[3], aReadElements[1]);
		assert.strictEqual(oCache.aElements[4], aElements[4]);
		assert.strictEqual(oCache.aElements[5], aElements[5]);
		assert.deepEqual(oCache.aElements.$byPredicate, {
			"(1)" : aReadElements[0],
			"(2)" : aReadElements[1]
		});
	});

	//*********************************************************************************************
	QUnit.test("addElements: just a single one", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {},
			oPlaceholder = _AggregationHelper.createPlaceholder(NaN, 42, oGroupLevelCache),
			aElements = [{}, oPlaceholder, {}],
			oReadElement = {"@$ui5._" : {predicate : "(1)"}};

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};

		// code under test
		oCache.addElements(oReadElement, 1, oGroupLevelCache, 42);

		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], oReadElement);
		assert.strictEqual(oCache.aElements[2], aElements[2]);
		assert.deepEqual(oCache.aElements.$byPredicate, {"(1)" : oReadElement});
	});

	//*********************************************************************************************
	QUnit.test("addElements: wrong placeholder", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {};

			// Note: no need to check for level as well, because oGroupLevelCache belongs to a
			// specific level!
			oCache.aElements = [,
				_AggregationHelper.createPlaceholder(NaN, 42, oGroupLevelCache),
				_AggregationHelper.createPlaceholder(NaN, 43, oGroupLevelCache)];
			oCache.aElements.$byPredicate = {};

			assert.throws(function () {
				// code under test
				oCache.addElements([{}, {}], 0, oGroupLevelCache, 42); // 41 would be right
			}, new Error("Wrong placeholder"));

			assert.throws(function () {
				// code under test
				oCache.addElements([{}], 2, {/*wrong cache*/}, 43);
			}, new Error("Wrong placeholder"));

			assert.throws(function () {
				// code under test
				oCache.addElements({}, 2);
			}, new Error("Wrong placeholder"));
		});

	//*********************************************************************************************
	QUnit.test("addElements: unexpected element", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {});

		oCache.aElements = [, {/*unexpected element*/}];
		oCache.aElements.$byPredicate = {};

		assert.throws(function () {
			// code under test
			oCache.addElements([{}, {}], 0); // oCache/iStart does not matter here
		}, new Error("Unexpected element"));
	});

	//*********************************************************************************************
	QUnit.test("addElements: array index out of bounds", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {};

		assert.throws(function () {
			// code under test
			oCache.addElements([], -1); // oCache/iStart does not matter here
		}, new Error("Illegal offset: -1"));

		oCache.aElements = [];

		assert.throws(function () {
			// code under test
			oCache.addElements([{}], 0); // oCache/iStart does not matter here
		}, new Error("Array index out of bounds: 0"));

		oCache.aElements = [
			{/* expanded node */},
			_AggregationHelper.createPlaceholder(NaN, 0, oGroupLevelCache)
		];
		oCache.aElements.$byPredicate = {};

		assert.throws(function () {
			// code under test
			oCache.addElements([{}, {}], 1, oGroupLevelCache, 0);
		}, new Error("Array index out of bounds: 2"));
	});

	//*********************************************************************************************
	QUnit.test("addElements: duplicate placeholder", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oElement = {};

		oCache.aElements.length = 2; // avoid "Array index out of bounds: 1"
		oCache.aElements[0] = {/*unexpected element*/};
		oCache.aElements.$byPredicate["foo"] = oCache.aElements[0];
		_Helper.setPrivateAnnotation(oElement, "predicate", "foo");

		assert.throws(function () {
			// code under test
			oCache.addElements([oElement], 1); // oCache/iStart does not matter here
		}, new Error("Duplicate predicate: foo"));
	});

	//*********************************************************************************************
	QUnit.test("refreshKeptElements", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {});

		// code under test
		assert.strictEqual(oCache.refreshKeptElements(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getDownloadQueryOptions", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			mDownloadQueryOptions = {},
			mQueryOptions = {};

		this.mock(_AggregationHelper).expects("filterOrderby")
			.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(oAggregation))
			.returns("~mFilteredQueryOptions~");
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), "~mFilteredQueryOptions~", 0, true)
			.returns(mDownloadQueryOptions);

		// code under test
		assert.strictEqual(oCache.getDownloadQueryOptions(mQueryOptions), mDownloadQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("getCreatedElements", function (assert) {
		// code under test
		assert.deepEqual(_AggregationCache.prototype.getCreatedElements(), []);
	});

	//*********************************************************************************************
	QUnit.test("getAllElements: non-empty path is forbidden", function (assert) {
		assert.throws(function () {
			// code under test
			_AggregationCache.prototype.getAllElements("some/relative/path");
		}, new Error("Unsupported path: some/relative/path"));
	});

	//*********************************************************************************************
	QUnit.test("getAllElements", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			aAllElements,
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oPlaceholder0 = _AggregationHelper.createPlaceholder(1, 0, {/*oParentCache*/}),
			oPlaceholder2 = _AggregationHelper.createPlaceholder(1, 2, {/*oParentCache*/});

		oCache.aElements = [oPlaceholder0, "~oElement1~", oPlaceholder2, "~oElement3~"];
		oCache.aElements.$count = 4;

		// code under test
		aAllElements = oCache.getAllElements();

		assert.deepEqual(aAllElements, [undefined, "~oElement1~", undefined, "~oElement3~"]);
		assert.strictEqual(aAllElements.$count, 4);
	});
});

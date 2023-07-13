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

	/**
	 * Returns a promise which resolves just when the given elements have been copied into the given
	 * aggregation cache.
	 *
	 * @param {sap.ui.model.odata.v4.lib._AggregationCache} oCache
	 *   The cache
	 * @param {object|object[]} aReadElements
	 *   The elements from a cache read, or just a single one
	 * @param {number} iOffset
	 *   The offset within aElements
	 * @returns {sap.ui.base.SyncPromise}
	 *   An async promise for timing
	 *
	 * @private
	 * @see addElements
	 */
	function addElementsLater(oCache, aReadElements, iOffset) {
		return SyncPromise.resolve(Promise.resolve()).then(function () {
			// so that oCache.aElements is actually filled
			addElements.call(oCache, aReadElements, iOffset);
		});
	}

	function mustBeMocked() { throw new Error("Must be mocked"); }

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationCache", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oRequestor = {
				buildQueryString : function () { return ""; },
				getServiceUrl : function () { return "/~/"; },
				request : mustBeMocked
			};

			// avoid trouble when creating 1st level cache, or with #getDownloadUrl's callback
			// to #getDownloadQueryOptions calling this
			this.mock(_AggregationHelper).expects("buildApply4Hierarchy").atLeast(0).returns({});
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
				mQueryOptions, oAggregation, "~sortExpandSelect~", "~sharedRequest~"),
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
			_AggregationCache.create("~requestor~", "resource/path", "", mQueryOptions,
				oAggregation),
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
			_AggregationCache.create(this.oRequestor, "Foo", "", mQueryOptions, oAggregation);
		}, new Error("Unsupported system query option: " + sName));
	});
	});
});

	//*********************************************************************************************
[{
	groupLevels : ["BillToParty"],
	hasMinOrMax : true,
	message : "Unsupported group levels together with min/max"
}, {
	hasGrandTotal : true,
	hasMinOrMax : true,
	message : "Unsupported grand totals together with min/max"
}, {
	oAggregation : {
		hierarchyQualifier : "X"
	},
	hasMinOrMax : true,
	message : "Unsupported recursive hierarchy together with min/max"
}, {
	hasMinOrMax : true,
	message : "Unsupported $$sharedRequest together with min/max",
	bSharedRequest : true
}, {
	groupLevels : ["BillToParty"],
	message : "Unsupported system query option: $filter",
	queryOptions : {$filter : "answer eq 42"}
}, {
	hasGrandTotal : true,
	message : "Unsupported system query option: $filter",
	queryOptions : {$filter : "answer eq 42"}
}, {
	hasGrandTotal : true,
	message : "Unsupported system query option: $search",
	queryOptions : {$search : "blue OR green"}
}, {
	groupLevels : ["BillToParty"],
	message : "Unsupported system query option: $search",
	queryOptions : {$search : "blue OR green"}
}, {
	oAggregation : {
		hierarchyQualifier : "X"
	},
	message : "Unsupported system query option: $search",
	queryOptions : {$search : "blue OR green"}
}, {
	oAggregation : {
		hierarchyQualifier : "X"
	},
	bIsGrouped : true,
	message : "Unsupported grouping via sorter"
}, {
	hasGrandTotal : true,
	message : "Unsupported $$sharedRequest",
	bSharedRequest : true
}, {
	groupLevels : ["BillToParty"],
	message : "Unsupported $$sharedRequest",
	bSharedRequest : true
}, {
	oAggregation : {
		hierarchyQualifier : "X"
	},
	message : "Unsupported $$sharedRequest",
	bSharedRequest : true
}].forEach(function (oFixture) {
	QUnit.test("create: " + oFixture.message, function (assert) {
		var oAggregation = oFixture.oAggregation || {
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
			_AggregationCache.create(this.oRequestor, "Foo", "", mQueryOptions, oAggregation,
				false, oFixture.bSharedRequest, oFixture.bIsGrouped);
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
			oFirstLevelCache = {
				addKeptElement : "~addKeptElement~",
				removeKeptElement : "~removeKeptElement~",
				requestSideEffects : "~requestSideEffects~"
			},
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
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, "", mQueryOptions,
			oAggregation);

		// "super" call
		assert.ok(oCache instanceof _AggregationCache, "module value is c'tor function");
		assert.ok(oCache instanceof _Cache, "_AggregationCache is a _Cache");
		assert.strictEqual(oCache._delete, null, "disinherit");
		assert.strictEqual(oCache.addTransientCollection, null, "disinherit");
		assert.strictEqual(oCache.getAndRemoveValue, null, "disinherit");
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
		assert.strictEqual(oCache.addKeptElement, oFirstLevelCache.addKeptElement, "@borrows ...");
		assert.strictEqual(oCache.removeKeptElement, oFirstLevelCache.removeKeptElement,
			"@borrows ...");
		assert.strictEqual(oCache.requestSideEffects, oFirstLevelCache.requestSideEffects,
			"@borrows ...");
		if (bCountLeaves) {
			assert.strictEqual(oCache.mQueryOptions.$$leaves, true);
			assert.ok(oCache.oCountPromise instanceof SyncPromise);
			assert.strictEqual(oCache.oCountPromise.isPending(), true);

			// code under test (fnLeaves)
			oEnhanceCacheWithGrandTotalExpectation.args[0][2][0]({UI5__leaves : "42"});

			assert.strictEqual(oCache.oCountPromise.isFulfilled(), true);
			assert.strictEqual(oCache.oCountPromise.getResult(), 42);

			// code under test
			assert.strictEqual(oCache.fetchValue(null, "$count"), oCache.oCountPromise);
		} else {
			assert.notOk("$$leaves" in oCache.mQueryOptions);
			assert.ok("oCountPromise" in oCache, "be nice to V8");
			assert.strictEqual(oCache.oCountPromise, undefined);
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
[false, true].forEach(function (bCount) {
	QUnit.test("create: hierarchyQualifier, $count=" + bCount, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache,
			oGetDownloadUrlExpectation,
			mQueryOptions = {
				$count : bCount,
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
		oCache = _AggregationCache.create(this.oRequestor, "resource/path", "~n/a~", mQueryOptions,
			oAggregation);

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
		assert.strictEqual(oCache.getDownloadUrl(""), "~downloadUrl~"); // code under test
		assert.strictEqual(oCache.toString(), "~downloadUrl~"); // <-- code under test
		assert.ok(oGetDownloadUrlExpectation.alwaysCalledOn(oCache));
		assert.deepEqual(oCache.aElements, []);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.ok("$count" in oCache.aElements);
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.strictEqual(oCache.aElements.$created, 0);
		assert.strictEqual(oCache.oFirstLevel, "~firstLevelCache~");
		assert.notOk("$$leaves" in oCache.mQueryOptions);
		assert.ok("oCountPromise" in oCache, "be nice to V8");
		assert.strictEqual(oCache.oGrandTotalPromise, undefined);
		assert.ok("oGrandTotalPromise" in oCache, "be nice to V8");
		assert.strictEqual(oCache.isDeletingInOtherGroup(), false);
		if (bCount) {
			assert.ok(oCache.oCountPromise.isPending());

			// code under test
			oCache.oCountPromise.$resolve(42);

			assert.strictEqual(oCache.oCountPromise.getResult(), 42);
		} else {
			assert.strictEqual(oCache.oCountPromise, undefined);
		}
	});
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

		oAggregationCache = _AggregationCache.create(this.oRequestor, "Foo", "",
			{/*$orderby : "~orderby~"*/}, oAggregation);

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
[undefined, {}].forEach(function (oParentGroupNode, i) {
	QUnit.test("createGroupLevelCache: recursive hierarchy, #" + i, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = {},
			mCacheQueryOptions = {},
			iLevel = oParentGroupNode ? 3 : 1,
			mQueryOptions = {
				$expand : "~expand~",
				// $orderby : "~orderby~"
				$select : ["~select~"]
			},
			oAggregationCache
				= _AggregationCache.create(this.oRequestor, "Foo", "", mQueryOptions, oAggregation);

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
			.withExactArgs(sinon.match.same(oParentGroupNode), sinon.match.same(oAggregation),
				"~oElement~", "~mTypeForMetaPath~", "~metapath~")
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
[undefined, 0, 7].forEach(function (iDistanceFromRoot) {
	// Note: null means no $LimitedDescendantCountProperty, undefined means not $select'ed
	[null, undefined, 0, 42].forEach(function (iLimitedDescendantCount) {
		["collapsed", "expanded", "leaf"].forEach(function (sDrillState) {
			[undefined, {"@$ui5.node.level" : 41}].forEach(function (oGroupNode) {
				var sTitle = "calculateKeyPredicateRH: DistanceFromRoot : " + iDistanceFromRoot
						+ ", LimitedDescendantCount : " + iLimitedDescendantCount
						+ ", DrillState : " + sDrillState
						+ ", oGroupNode : " + JSON.stringify(oGroupNode);

				if (iDistanceFromRoot === undefined && iLimitedDescendantCount
						|| iDistanceFromRoot !== undefined && oGroupNode
						|| sDrillState === "expanded" && !iLimitedDescendantCount
						|| sDrillState === "leaf" && iLimitedDescendantCount) {
					return;
				}

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {
				$DistanceFromRootProperty : "A/DistFromRoot",
				$DrillStateProperty : "B/myDrillState",
				$LimitedDescendantCountProperty : "C/LtdDescendant_Count",
				$metaPath : "/meta/path",
				$path : "n/a"
			},
			sDistanceFromRoot,
			oElement = {
				// B: {myDrillState : sDrillState},
				Foo : "bar",
				XYZ : 42
			},
			iExpectedLevel = 1,
			oHelperMock = this.mock(_Helper),
			bIsExpanded = {
				collapsed : false,
				expanded : true,
				leaf : undefined
			}[sDrillState],
			sLimitedDescendantCount,
			mTypeForMetaPath = {"/meta/path" : {}};

		if (iDistanceFromRoot !== undefined) {
			iExpectedLevel = iDistanceFromRoot + 1;
			sDistanceFromRoot = "" + iDistanceFromRoot; // Edm.Int64!
			// oElement.A = {DistFromRoot : sDistanceFromRoot};
		}
		if (iLimitedDescendantCount === null) {
			delete oAggregation.$LimitedDescendantCountProperty;
		} else {
			sLimitedDescendantCount = iLimitedDescendantCount === undefined
				? undefined
				: "" + iLimitedDescendantCount; // Edm.Int64!
			// oElement.C = {LtdDescendant_Count : sLimitedDescendantCount};
		}
		if (oGroupNode) {
			iExpectedLevel = 42;
		}

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oElement), "/meta/path",
				sinon.match.same(mTypeForMetaPath))
			.returns("~predicate~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate", "~predicate~");
		oHelperMock.expects("drillDown")
			.withExactArgs(sinon.match.same(oElement), "B/myDrillState")
			.returns(sDrillState);
		oHelperMock.expects("getKeyFilter").never();
		if (sDrillState === "collapsed") {
			oHelperMock.expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oElement), "/meta/path",
					sinon.match.same(mTypeForMetaPath))
				.returns("~filter~");
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oElement), "filter", "~filter~");
		}
		oHelperMock.expects("deleteProperty")
			.withExactArgs(sinon.match.same(oElement), "B/myDrillState");
		oHelperMock.expects("drillDown").exactly(oGroupNode ? 0 : 1)
			.withExactArgs(sinon.match.same(oElement), "A/DistFromRoot")
			.returns(sDistanceFromRoot);
		oHelperMock.expects("deleteProperty").exactly(sDistanceFromRoot ? 1 : 0)
			.withExactArgs(sinon.match.same(oElement), "A/DistFromRoot");
		this.mock(_AggregationHelper).expects("setAnnotations")
			.withExactArgs(sinon.match.same(oElement), bIsExpanded, /*bIsTotal*/undefined,
				iExpectedLevel);
		oHelperMock.expects("setPrivateAnnotation").exactly(iLimitedDescendantCount ? 1 : 0)
			.withExactArgs(sinon.match.same(oElement), "descendants",
				/*parseInt!*/iLimitedDescendantCount);
		oHelperMock.expects("drillDown").exactly(iLimitedDescendantCount === null ? 0 : 1)
			.withExactArgs(sinon.match.same(oElement), "C/LtdDescendant_Count")
			.returns(sLimitedDescendantCount);
		oHelperMock.expects("deleteProperty").exactly(sLimitedDescendantCount ? 1 : 0)
			.withExactArgs(sinon.match.same(oElement), "C/LtdDescendant_Count");

		assert.strictEqual(
			// code under test
			_AggregationCache.calculateKeyPredicateRH(oGroupNode, oAggregation, oElement,
				mTypeForMetaPath, "/meta/path"),
			"~predicate~");

		assert.deepEqual(oElement, {Foo : "bar", XYZ : 42});
	});
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
	QUnit.test("calculateKeyPredicateRH: nested object", function (assert) {
		var mTypeForMetaPath = {"/Artists" : {}};

		this.mock(_Helper).expects("drillDown").never();
		this.mock(_Helper).expects("getKeyPredicate").never();
		this.mock(_Helper).expects("setPrivateAnnotation").never();
		this.mock(_Helper).expects("getKeyFilter").never();
		this.mock(_Helper).expects("deleteProperty").never();
		this.mock(_AggregationHelper).expects("setAnnotations").never();

		assert.strictEqual(
			// code under test
			_AggregationCache.calculateKeyPredicateRH(/*oGroupNode*/null, {/*oAggregation*/},
				/*oElement*/null, mTypeForMetaPath, "/Artists/BestFriend"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("calculateKeyPredicateRH: related entity", function (assert) {
		var oAggregation = {
				$DistanceFromRootProperty : "DistFromRoot",
				$DrillStateProperty : "myDrillState",
				$LimitedDescendantCountProperty : "LtdDescendant_Count",
				$metaPath : "/Artists",
				$path : "n/a"
			},
			oElement = {
				DistFromRoot : "23",
				myDrillState : "leaf",
				LtdDescendant_Count : "42"
			},
			mTypeForMetaPath = {
				"/Artists" : {},
				"/Artists/BestFriend" : {}
			};

		this.mock(_Helper).expects("drillDown").never();
		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oElement), "/Artists/BestFriend",
				sinon.match.same(mTypeForMetaPath))
			.returns("~predicate~");
		this.mock(_Helper).expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate", "~predicate~");
		this.mock(_Helper).expects("getKeyFilter").never();
		this.mock(_Helper).expects("deleteProperty").never();
		this.mock(_AggregationHelper).expects("setAnnotations").never();

		assert.strictEqual(
			// code under test
			_AggregationCache.calculateKeyPredicateRH(/*oGroupNode*/null, oAggregation,
				oElement, mTypeForMetaPath, "/Artists/BestFriend"),
			"~predicate~");

		assert.deepEqual(oElement, {
				DistFromRoot : "23",
				myDrillState : "leaf",
				LtdDescendant_Count : "42"
			}, "unchanged");
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	QUnit.test("fetchValue: not $count; async = " + bAsync, function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : ["BillToParty"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, oAggregation),
			oCacheMock = this.mock(oCache),
			sPath = "~predicate~/~path~",
			oPromise = bAsync
				? Promise.resolve(function (resolve) {
					setTimeout(function () {
						resolve();
					}, 5);
				})
				: SyncPromise.resolve(),
			oResult;

		if (bAsync) {
			oCache.aElements.$byPredicate["~predicate~"] = oPromise;
		}
		oCacheMock.expects("registerChangeListener").never();
		oCacheMock.expects("drillDown").never();
		oPromise.then(function () { // must not be called too early!
			oCacheMock.expects("registerChangeListener").withExactArgs(sPath, "~oListener~");
			oCacheMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oCache.aElements), sPath, "~oGroupLock~")
				.returns(SyncPromise.resolve("~result~"));
		});

		// code under test
		oResult = oCache.fetchValue("~oGroupLock~", sPath, "~fnDataRequested~", "~oListener~");

		assert.strictEqual(oResult.isPending(), bAsync);

		return oResult.then(function (vResult) {
			assert.strictEqual(vResult, "~result~");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchValue: no leaf $count available with recursive hierarchy", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, oAggregation);

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
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, oAggregation);

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
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {$count : true},
				oAggregation);

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
	oPromise : SyncPromise.resolve("~result~"),
	vValue : "~result~"
}, {
	oPromise : new SyncPromise(function () {}), // not (yet) resolved
	vValue : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("getValue: " + i, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, oAggregation);

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "some/path")
			.returns(oFixture.oPromise);
		this.mock(oFixture.oPromise).expects("caught").withExactArgs().exactly(i);

		// code under test
		assert.strictEqual(oCache.getValue("some/path"), oFixture.vValue);
	});
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
	iLength : 41,
	bHasGrandTotal : true,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 41
}].forEach(function (oFixture, i) {
	QUnit.test("read: 1st time, #" + i, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {
					SalesNumber : {grandTotal : oFixture.bHasGrandTotal}
				},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			iIndex = oFixture.iIndex,
			iLength = oFixture.iLength,
			iPrefetchLength = 100,
			that = this;

		function checkResult(oResult) {
			var i;

			assert.strictEqual(oResult.value.length, iLength);
			assert.strictEqual(oResult.value.$count, 42);
			for (i = 0; i < iLength; i += 1) {
				assert.strictEqual(oResult.value[i], "element#" + (oFixture.iIndex + i));
			}
		}

		if ("grandTotalAtBottomOnly" in oFixture) {
			oAggregation.grandTotalAtBottomOnly = oFixture.grandTotalAtBottomOnly;
		}
		if (oFixture.bHasGrandTotal) {
			oCache.oGrandTotalPromise = new SyncPromise(function () {});
		}
		this.mock(oCache).expects("readCount").withExactArgs("~oGroupLock~");
		this.mock(oCache).expects("readFirst")
			.withExactArgs(oFixture.iFirstLevelIndex, oFixture.iFirstLevelLength, iPrefetchLength,
				"~oGroupLock~", "~fnDataRequested~")
			.callsFake(function () {
				return SyncPromise.resolve(Promise.resolve()).then(function () {
					oCache.aElements.$count = 42;
					for (i = 0; i < 42; i += 1) {
						oCache.aElements[i] = "element#" + i;
					}
				});
			});

		// code under test
		return oCache.read(iIndex, iLength, iPrefetchLength, "~oGroupLock~", "~fnDataRequested~")
			.then(function (oResult) {
				var oGroupLock = {
						unlock : function () {}
					};

				assert.strictEqual(oCache.iReadLength, iLength + iPrefetchLength);

				checkResult(oResult);

				that.mock(oGroupLock).expects("unlock").withExactArgs();

				// code under test
				return oCache
					.read(iIndex, iLength, iPrefetchLength, oGroupLock, "~fnDataRequested~")
					.then(checkResult);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("read: 1st time, readCount fails", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oError = new Error();

		this.mock(oCache).expects("readCount").withExactArgs("~oGroupLock~")
			.rejects(oError);
		this.mock(oCache).expects("readFirst"); // don't care about more details here

		// code under test
		return oCache.read(0, 10, 0, "~oGroupLock~").then(function () {
			assert.ok(false);
		}, function (oResult) {
			assert.strictEqual(oResult, oError);
		});
	});

	//*********************************************************************************************
[undefined, {}].forEach(function (oCountPromise, i) {
	QUnit.test("readCount: nothing to do #" + i, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oGroupLock = {
				getUnlockedCopy : function () {}
			};

		oCache.oCountPromise = oCountPromise;
		this.mock(oGroupLock).expects("getUnlockedCopy").never();
		this.mock(this.oRequestor).expects("request").never();

		// code under test
		assert.strictEqual(oCache.readCount(oGroupLock), undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("readCount: GET fails", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oError = new Error(),
			oGroupLock = {
				getUnlockedCopy : function () {}
			};

		oCache.oCountPromise = {
			$resolve : true // will not be called :-)
		};
		this.mock(this.oRequestor).expects("buildQueryString").withExactArgs(null, {})
			.returns("?~query~");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(this.oRequestor).expects("request")
			.withExactArgs("GET", "~/$count?~query~", "~oGroupLockCopy~").rejects(oError);

		// code under test
		return oCache.readCount(oGroupLock).then(function () {
			assert.ok(false);
		}, function (oResult) {
			assert.strictEqual(oResult, oError);
		});
	});

	//*********************************************************************************************
[{
	mExpectedQueryOptions : {
		foo : "bar",
		"sap-client" : "123"
	}
}, {
	$filter : "Is_Manager",
	mExpectedQueryOptions : {
		$filter : "Is_Manager",
		foo : "bar",
		"sap-client" : "123"
	}
}, {
	search : "covfefe",
	mExpectedQueryOptions : {
		$search : "covfefe",
		foo : "bar",
		"sap-client" : "123"
	}
}, {
	$filter : "Is_Manager",
	search : "covfefe",
	mExpectedQueryOptions : {
		$filter : "Is_Manager",
		$search : "covfefe",
		foo : "bar",
		"sap-client" : "123"
	}
}].forEach(function (oFixture, i) {
	QUnit.test("readCount: #" + i, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X",
				search : oFixture.search
			},
			oCache,
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			mQueryOptions = {
				$apply : "A.P.P.L.E",
				$count : true,
				$expand : {EMPLOYEE_2_TEAM : null},
				// $filter : oFixture.$filter,
				$orderby : "TEAM_ID desc",
				// Unsupported system query option: $search
				$select : ["Name"],
				foo : "bar",
				"sap-client" : "123"
			},
			fnResolve = sinon.spy(),
			oResult;

		if ("$filter" in oFixture) {
			mQueryOptions.$filter = oFixture.$filter;
		}
		oCache = _AggregationCache.create(this.oRequestor, "~", "", mQueryOptions, oAggregation);
		oCache.oCountPromise = {
			$resolve : fnResolve
		};
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs(null, oFixture.mExpectedQueryOptions).returns("?~query~");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(this.oRequestor).expects("request")
			.withExactArgs("GET", "~/$count?~query~", "~oGroupLockCopy~").resolves(42);

		// code under test
		oResult = oCache.readCount(oGroupLock);

		assert.notOk(fnResolve.called, "not yet");
		assert.notOk("$resolve" in oCache.oCountPromise, "prevent 2nd GET");

		return oResult.then(function () {
			assert.strictEqual(fnResolve.args[0][0], 42);
		});
	});
});

	//*********************************************************************************************
[{
	bHasGrandTotal : false,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 3
}, {
	bHasGrandTotal : true,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 2
}, {
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : false,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 2
}, {
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : true,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 1
}, {
	bHasGrandTotal : false,
	iFirstLevelIndex : 10,
	iFirstLevelLength : 3
}, {
	bHasGrandTotal : true,
	iFirstLevelIndex : 9,
	iFirstLevelLength : 3
}, {
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : false,
	iFirstLevelIndex : 9,
	iFirstLevelLength : 3
}, {
	bHasGrandTotal : true,
	grandTotalAtBottomOnly : true,
	iFirstLevelIndex : 10,
	iFirstLevelLength : 3
}, {
	bHasGrandTotal : true,
	iFirstLevelIndex : 0,
	iFirstLevelLength : 42
}, {
	iExpandTo : 2,
	iLevel : 0, // symbolic level for generic initial placeholders inside top pyramid
	iFirstLevelIndex : 10,
	iFirstLevelLength : 3
}].forEach(function (oFixture, i) {
	QUnit.test("readFirst: #" + i, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {
					SalesNumber : {grandTotal : oFixture.bHasGrandTotal}
				},
				group : {},
				groupLevels : ["group"]
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oCacheMock = this.mock(oCache),
			iExpectedLevel = "iLevel" in oFixture ? oFixture.iLevel : 1, // cf. createPlaceholder
			iFirstLevelIndex = oFixture.iFirstLevelIndex,
			iFirstLevelLength = oFixture.iFirstLevelLength,
			oGrandTotal = {},
			oGrandTotalCopy = {},
			iOffset = oFixture.bHasGrandTotal && oFixture.grandTotalAtBottomOnly !== true ? 1 : 0,
			iPrefetchLength = 100,
			oReadResult = {
				value : []
			},
			i;

		if (oFixture.iExpandTo) { // unrealistic combination, but never mind
			oAggregation.expandTo = oFixture.iExpandTo;
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
				"~oGroupLock~", "~fnDataRequested~")
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
				.withExactArgs(iExpectedLevel, i, sinon.match.same(oCache.oFirstLevel))
				.returns("~placeholder~" + i);
		}
		for (i = iFirstLevelIndex + iFirstLevelLength; i < 42; i += 1) {
			oAggregationHelperMock.expects("createPlaceholder")
				.withExactArgs(iExpectedLevel, i, sinon.match.same(oCache.oFirstLevel))
				.returns("~placeholder~" + i);
		}

		// code under test
		return oCache.readFirst(iFirstLevelIndex, iFirstLevelLength, iPrefetchLength,
				"~oGroupLock~", "~fnDataRequested~")
			.then(function () {
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oGroupLock0 = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLock1 = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oCacheMock = this.mock(oCache),
			aReadResult0 = [{}],
			aReadResult1 = [{}, {}],
			that = this;

		oCache.aElements = [
			{/* expanded node */},
			{/* first leaf */},
			_AggregationHelper.createPlaceholder(1, 1, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 2, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 3, "~oGroupLevelCache~"),
			{/* other node */}
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLock0).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy0~");
		oCacheMock.expects("readGap")
			.withExactArgs("~oGroupLevelCache~", 2, 3, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult0, 2));
		this.mock(oGroupLock0).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(2, 1, 0, oGroupLock0, "~fnDataRequested~").then(function (oResult1) {
			assert.strictEqual(oResult1.value.length, 1);
			assert.strictEqual(oResult1.value[0], aReadResult0[0]);
			assert.strictEqual(oResult1.value.$count, 42);

			that.mock(oGroupLock1).expects("getUnlockedCopy").withExactArgs()
				.returns("~oGroupLockCopy1~");
			oCacheMock.expects("readGap")
				.withExactArgs("~oGroupLevelCache~", 3, 5, "~oGroupLockCopy1~", "~fnDataRequested~")
				.returns(addElementsLater(oCache, aReadResult1, 3));
			that.mock(oGroupLock1).expects("unlock").withExactArgs();

			// code under test
			return oCache.read(3, 3, 0, oGroupLock1, "~fnDataRequested~");
		}).then(function (oResult2) {
			assert.strictEqual(oResult2.value.length, 3);
			assert.strictEqual(oResult2.value[0], aReadResult1[0]);
			assert.strictEqual(oResult2.value[1], aReadResult1[1]);
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oCacheMock = this.mock(oCache),
			oFirstLeaf = {},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			aReadResult0 = [{}, {}],
			aReadResult1 = [{}];

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf,
			_AggregationHelper.createPlaceholder(1, 1, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 2, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(0, 1, "~oFirstLevelCache~")
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		oCacheMock.expects("readGap")
			.withExactArgs("~oGroupLevelCache~", 2, 4, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult0, 2));
		oCacheMock.expects("readGap")
			.withExactArgs("~oFirstLevelCache~", 4, 5, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult1, 4));
		oGroupLockMock.expects("unlock").withExactArgs();

		// code under test
		return oCache.read(1, 4, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value.length, 4);
			assert.strictEqual(oResult.value[0], oFirstLeaf);
			assert.strictEqual(oResult.value[1], aReadResult0[0]);
			assert.strictEqual(oResult.value[2], aReadResult0[1]);
			assert.strictEqual(oResult.value[3], aReadResult1[0]);
			assert.strictEqual(oResult.value.$count, 42);

			assert.strictEqual(oCache.aElements[1], oFirstLeaf);
			assert.strictEqual(oCache.aElements[2], aReadResult0[0]);
			assert.strictEqual(oCache.aElements[3], aReadResult0[1]);
			assert.strictEqual(oCache.aElements[4], aReadResult1[0]);
		});
	});

	//*********************************************************************************************
[1, 2].forEach(function (iLength) {
	QUnit.test("read: gap at start, iLength = " + iLength, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oFirstLeaf = {},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			aReadResult = [{}];

		oCache.aElements = [
			_AggregationHelper.createPlaceholder(0, 0, "~oFirstLevelCache~"),
			oFirstLeaf
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oCache).expects("readGap")
			.withExactArgs("~oFirstLevelCache~", 0, 1, "~oGroupLockCopy~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult, 0));
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(0, iLength, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value.length, iLength);
			assert.strictEqual(oResult.value[0], aReadResult[0]);
			if (iLength > 1) {
				assert.strictEqual(oResult.value[1], oFirstLeaf);
			}
			assert.strictEqual(oResult.value.$count, 42);

			assert.strictEqual(oCache.aElements[0], aReadResult[0]);
			assert.strictEqual(oCache.aElements[1], oFirstLeaf);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("read: intersecting reads", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oCacheMock = this.mock(oCache),
			oFirstLeaf = {},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oReadSameNode = {},
			aReadResult0 = [{}, oReadSameNode, {}],
			aReadResult1 = [oReadSameNode];

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf,
			_AggregationHelper.createPlaceholder(1, 1, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 2, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 3, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 4, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 5, "~oGroupLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 6, "~oGroupLevelCache~")
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		oGroupLockMock.expects("unlock").withExactArgs().twice();
		oCacheMock.expects("readGap")
			.withExactArgs("~oGroupLevelCache~", 2, 5, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult0, 2));
		oCacheMock.expects("readGap")
			.withExactArgs("~oGroupLevelCache~", 3, 4, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult1, 3));

		// code under test
		return Promise.all([
			oCache.read(1, 4, 0, oGroupLock, "~fnDataRequested~"),
			oCache.read(3, 1, 0, oGroupLock, "~fnDataRequested~")
		]).then(function (aResults) {
			assert.strictEqual(aResults[0].value.length, 4);
			assert.strictEqual(aResults[0].value[0], oFirstLeaf);
			assert.strictEqual(aResults[0].value[1], aReadResult0[0]);
			assert.strictEqual(aResults[0].value[2], oReadSameNode);
			assert.strictEqual(aResults[0].value[2], aReadResult0[1]);
			assert.strictEqual(aResults[0].value.$count, 42);
			assert.strictEqual(aResults[1].value.length, 1);
			assert.strictEqual(aResults[1].value[0], oReadSameNode);
			assert.strictEqual(aResults[1].value.$count, 42);

			assert.strictEqual(oCache.aElements[1], oFirstLeaf);
			assert.strictEqual(oCache.aElements[2], aReadResult0[0]);
			assert.strictEqual(oCache.aElements[3], oReadSameNode);
			assert.strictEqual(oCache.aElements[4], aReadResult0[2]);
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[5], "index"), 4);
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[6], "index"), 5);
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[7], "index"), 6);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: two different group level caches", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oCacheMock = this.mock(oCache),
			oFirstLeaf0 = {},
			oFirstLeaf1 = {},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oReadPromise,
			aReadResult0 = [{}, {}],
			aReadResult1 = [{}, {}],
			oUnlockExpectation;

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf0,
			_AggregationHelper.createPlaceholder(1, 1, "~oGroupLevelCache0~"),
			_AggregationHelper.createPlaceholder(1, 2, "~oGroupLevelCache0~"),
			{/* expanded node */},
			oFirstLeaf1,
			_AggregationHelper.createPlaceholder(1, 1, "~oGroupLevelCache1~"),
			_AggregationHelper.createPlaceholder(1, 2, "~oGroupLevelCache1~")
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		oUnlockExpectation = oGroupLockMock.expects("unlock").withExactArgs();
		oCacheMock.expects("readGap")
			.withExactArgs("~oGroupLevelCache0~", 2, 4, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult0, 2));
		oCacheMock.expects("readGap")
			.withExactArgs("~oGroupLevelCache1~", 6, 8, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult1, 6));

		// code under test
		oReadPromise = oCache.read(1, 7, 0, oGroupLock, "~fnDataRequested~")
			.then(function (oResult) {
				assert.strictEqual(oResult.value.length, 7);
				assert.strictEqual(oResult.value[0], oFirstLeaf0);
				assert.strictEqual(oResult.value[1], aReadResult0[0]);
				assert.strictEqual(oResult.value[2], aReadResult0[1]);

				assert.strictEqual(oResult.value[4], oFirstLeaf1);
				assert.strictEqual(oResult.value[5], aReadResult1[0]);
				assert.strictEqual(oResult.value[6], aReadResult1[1]);
				assert.strictEqual(oResult.value.$count, 42);

				assert.strictEqual(oCache.aElements[1], oFirstLeaf0);
				assert.strictEqual(oCache.aElements[2], aReadResult0[0]);
				assert.strictEqual(oCache.aElements[3], aReadResult0[1]);

				assert.strictEqual(oCache.aElements[5], oFirstLeaf1);
				assert.strictEqual(oCache.aElements[6], aReadResult1[0]);
				assert.strictEqual(oCache.aElements[7], aReadResult1[1]);
			});

		assert.ok(oUnlockExpectation.called);

		return oReadPromise;
	});

	//*********************************************************************************************
	QUnit.test("read: only placeholder", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oElement = {"@$ui5._" : {parent : "~oFirstLevelCache~"}},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			aReadResult = [{}, {}]; // "short read", e.g. due to server-driven paging

		oCache.aElements = [
			{},
			_AggregationHelper.createPlaceholder(1, 1, "~oFirstLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 2, "~oFirstLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 3, "~oFirstLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 4, "~oFirstLevelCache~"),
			_AggregationHelper.createPlaceholder(1, 5, "~oFirstLevelCache~"),
			oElement, // do not confuse w/ a placeholder!
			_AggregationHelper.createPlaceholder(1, 7, "~oFirstLevelCache~")
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 8;

		_Helper.setPrivateAnnotation(oCache.aElements[3], "predicate", "('A')");
		_Helper.setPrivateAnnotation(oCache.aElements[5], "predicate", "('B')");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oCache).expects("readGap")
			.withExactArgs("~oFirstLevelCache~", 3, 6, "~oGroupLockCopy~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult, 3));

		// code under test
		return oCache.read(3, 4, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value.length, 4);
			assert.strictEqual(oResult.value[0], aReadResult[0]);
			assert.strictEqual(oResult.value[1], aReadResult[1]);
			assert.strictEqual(oResult.value[2], undefined, "placeholder is hidden");
			assert.strictEqual(oResult.value[3], oElement);
			assert.strictEqual(oResult.value.$count, 8);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: split gap", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oCacheMock = this.mock(oCache),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock);

		oCache.aElements = [
			"~Alpha~",
			_AggregationHelper.createPlaceholder(1, 1, "~oFirstLevelCache~"), // collapsed Beta
			_AggregationHelper.createPlaceholder(1, 3, "~oFirstLevelCache~") // Kappa
		];
		oCache.aElements.$count = 8;
		_Helper.setPrivateAnnotation(oCache.aElements[1], "predicate", "('1')");
		_Helper.setPrivateAnnotation(oCache.aElements[2], "predicate", "('2')");

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oCacheMock.expects("readGap")
			.withExactArgs("~oFirstLevelCache~", 1, 2, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, ["~Beta~"], 1));
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		oCacheMock.expects("readGap")
			.withExactArgs("~oFirstLevelCache~", 2, 3, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, ["~Kappa~"], 2));
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(0, 3, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.deepEqual(oResult.value, ["~Alpha~", "~Beta~", "~Kappa~"]);
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			aReadResult = [{}];

		oCache.aElements = [
			{},
			_AggregationHelper.createPlaceholder(1, 1, "~oFirstLevelCache~")
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 2;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oCache).expects("readGap")
			.withExactArgs("~oFirstLevelCache~", 1, 2, "~oGroupLockCopy~", "~fnDataRequested~")
			.returns(addElementsLater(oCache, aReadResult, 1));

		// code under test
		return oCache.read(0, 100, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value.length, 2);
			assert.strictEqual(oResult.value[0], oCache.aElements[0]);
			assert.strictEqual(oResult.value[1], aReadResult[0]);
			assert.strictEqual(oResult.value.$count, 2);
		});
	});

	//*********************************************************************************************
	QUnit.test("readGap: success", function (assert) {
		var oCache
			= _AggregationCache.create(this.oRequestor, "~", "", {}, {hierarchyQualifier : "X"}),
			oGroupLevelCache = {
				getQueryOptions : function () {},
				read : function () {},
				setQueryOptions : function () {}
			},
			mQueryOptions = {$count : true, foo : "bar"},
			aReadResult = [{}];

		oCache.aElements = [,, _AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache)];

		this.mock(oGroupLevelCache).expects("getQueryOptions").withExactArgs()
			.returns(mQueryOptions);
		this.mock(oGroupLevelCache).expects("setQueryOptions")
			.withExactArgs(sinon.match(function (mNewQueryOptions) {
					assert.deepEqual(mNewQueryOptions, {foo : "bar"});
					return mNewQueryOptions === mQueryOptions;
				}), true);
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 1, 0, "~oGroupLock~", "~fnDataRequested~")
			.returns(SyncPromise.resolve({value : aReadResult}));
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(aReadResult), 2, sinon.match.same(oGroupLevelCache), 1);

		// code under test
		return oCache.readGap(oGroupLevelCache, 2, 3, "~oGroupLock~", "~fnDataRequested~");
	});

	//*********************************************************************************************
[
	"read: expand before read has finished",
	"read: aElements has changed while reading"
].forEach(function (sTitle, i) {
	QUnit.test(sTitle, function (assert) {
		var oCache
			= _AggregationCache.create(this.oRequestor, "~", "", {}, {hierarchyQualifier : "X"}),
			oGroupLevelCache = {
				getQueryOptions : function () { return {}; },
				read : function () {}
				// setQueryOptions : function () {}
			},
			oReadResultFirstNode = {},
			aReadResult = [oReadResultFirstNode, {}];

		oCache.aElements = [,,,
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache)];

		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLock~", "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate an expand
				oCache.aElements.splice(1, 0, {/*oInsertedNode*/});
				if (i) {
					// ... and a concurrent read
					oCache.aElements[4] = oReadResultFirstNode;
				}

				return SyncPromise.resolve({value : aReadResult});
			});
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(aReadResult), 4, sinon.match.same(oGroupLevelCache), 1);

		// code under test
		return oCache.readGap(oGroupLevelCache, 3, 5, "~oGroupLock~", "~fnDataRequested~")
			.then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError.message, "Collapse or expand before read has finished");
				assert.strictEqual(oError.canceled, true);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("read: collapse before read has finished", function (assert) {
		var oCache
			= _AggregationCache.create(this.oRequestor, "~", "", {}, {hierarchyQualifier : "X"}),
			oGroupLevelCache = {
				getQueryOptions : function () { return {}; },
				read : function () {}
				// setQueryOptions : function () {}
			};

		oCache.aElements = [,,,
			_AggregationHelper.createPlaceholder(1, 1, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 2, oGroupLevelCache)];

		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLock~", "~fnDataRequested~")
			.callsFake(function () {
				return SyncPromise.resolve().then(function () {
					// while the read request is running - simulate a collapse
					oCache.aElements.splice(2, 3);
					return {value : [{}]};
				});
			});
		this.mock(oCache).expects("addElements").never();

		// code under test
		return oCache.readGap(oGroupLevelCache, 3, 5, "~oGroupLock~", "~fnDataRequested~")
			.then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError.message, "Collapse before read has finished");
				assert.strictEqual(oError.canceled, true);
			});
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsync) {
	QUnit.test("readGap: async=" + bAsync, function (assert) {
		var oCache
			= _AggregationCache.create(this.oRequestor, "~", "", {}, {hierarchyQualifier : "X"}),
			oGroupLevelCache = {
				getQueryOptions : function () { return {}; },
				read : function () {}
				// setQueryOptions : function () {}
			},
			oReadResult = {value : [{}, {}, {}]},
			oResult,
			oPromise = bAsync
				? SyncPromise.resolve(Promise.resolve(oReadResult))
				: SyncPromise.resolve(oReadResult);

		oCache.aElements = [,,,
			_AggregationHelper.createPlaceholder(1, 3, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 4, oGroupLevelCache),
			_AggregationHelper.createPlaceholder(1, 5, oGroupLevelCache)];
		oCache.aElements.$byPredicate = {};
		_Helper.setPrivateAnnotation(oCache.aElements[3], "predicate", "('A')");
		_Helper.setPrivateAnnotation(oCache.aElements[5], "predicate", "('B')");

		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(3, 3, 0, "~oGroupLock~", "~fnDataRequested~").returns(oPromise);
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult.value), 3,
				sinon.match.same(oGroupLevelCache), 3);

		// code under test
		oResult = oCache.readGap(oGroupLevelCache, 3, 6, "~oGroupLock~", "~fnDataRequested~");

		assert.deepEqual(oCache.aElements.$byPredicate, bAsync ? {
			"('A')" : oPromise,
			"('B')" : oPromise
		} : {});

		return oResult;
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
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
		_Helper.setPrivateAnnotation(oGroupNode, "predicate", "(~predicate~)");
		if (vHasCache) {
			_Helper.setPrivateAnnotation(oGroupNode, "cache", oGroupLevelCache);
			// simulate that sometimes, this value is already known
			_Helper.setPrivateAnnotation(oGroupNode, "groupLevelCount", 7);
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
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock),
				"~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		this.mock(_AggregationHelper).expects("getCollapsedObject")
			.withExactArgs(sinon.match.same(oGroupNode)).returns(oCollapsed);
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
			oCacheMock.expects("addElements").withExactArgs("~oSubtotals~", 8)
				.callsFake(addElements); // so that oCache.aElements is actually filled
		} else {
			oAggregationHelperMock.expects("getAllProperties").never();
			oAggregationHelperMock.expects("setAnnotations").never();
		}

		// code under test
		oPromise = oCache.expand(
			oGroupLock, vGroupNodeOrPath, "~fnDataRequested~"
		).then(function (iResult) {
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
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
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock),
				"~fnDataRequested~")
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
		oPromise = oCache.expand(
			oGroupLock, "~path~", "~fnDataRequested~"
		).then(function (iResult) {
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
[false, true].forEach(function (bStale) {
	QUnit.test("expand: after collapse (w/ 'spliced'); $stale : " + bStale, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
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
						"@$ui5._" : {placeholder : true, predicate : "n/a"}
					}, {
						"@$ui5._" : {expanding : true, predicate : "('C')"}
					}]
				},
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 0
			},
			oPromise,
			aSpliced,
			oUpdateAllExpectation;

		oGroupNode["@$ui5._"].spliced[200000] = {
			"@$ui5._" : {predicate : "('D')"}
		};
		aSpliced = oGroupNode["@$ui5._"].spliced.slice();
		if (bStale) {
			oGroupNode["@$ui5._"].spliced.$stale = true;
		}
		aElements = [{}, oGroupNode, {}, {}];
		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 4;
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oGroupNode));
		oUpdateAllExpectation = this.mock(_Helper).expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oGroupNode), {"@$ui5.node.isExpanded" : true})
			.callThrough(); // "@$ui5.node.isExpanded" is checked once read has finished
		oCacheMock.expects("createGroupLevelCache").never();
		this.mock(oGroupLevelCache).expects("read").never();
		oCacheMock.expects("addElements").never();
		this.mock(_AggregationHelper).expects("createPlaceholder").never();
		oCacheMock.expects("expand").withExactArgs(sinon.match.same(oGroupLock), "~path~")
			.callThrough(); // for code under test
		oCacheMock.expects("expand").exactly(bStale ? 0 : 1)
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sinon.match.same(aSpliced[2]))
			.returns(SyncPromise.resolve(100));
		if (bStale) {
			oCacheMock.expects("turnIntoPlaceholder")
				.withExactArgs(sinon.match.same(aSpliced[0]), "('A')");
			oCacheMock.expects("turnIntoPlaceholder")
				.withExactArgs(sinon.match.same(aSpliced[2]), "('C')");
			oCacheMock.expects("turnIntoPlaceholder")
				.withExactArgs(sinon.match.same(aSpliced[200000]), "('D')");
		} else {
			oCacheMock.expects("turnIntoPlaceholder").never();
		}

		// code under test
		oPromise = oCache.expand(oGroupLock, "~path~").then(function (iResult) {
			assert.strictEqual(iResult, (bStale ? 0 : 100) + 200001);

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
			assert.strictEqual(_Helper.hasPrivateAnnotation(aSpliced[2], "expanding"), bStale,
				"deleted only if not stale");
			assert.strictEqual(oCache.aElements[200002], aSpliced[200000]);

			// check moved nodes
			assert.strictEqual(oCache.aElements[200003], aElements[2]);
			assert.strictEqual(oCache.aElements[200004], aElements[3]);

			assert.deepEqual(oCache.aElements.$byPredicate, bStale ? {} : {
				"('A')" : aSpliced[0],
				"('C')" : aSpliced[2],
				"('D')" : aSpliced[200000]
			});
		});

		oUpdateAllExpectation.verify();

		return oPromise;
	});
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
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
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock),
				"~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		this.mock(oCache).expects("addElements").never();
		this.mock(_AggregationHelper).expects("createPlaceholder").never();

		// code under test
		oPromise = oCache.expand(
			oGroupLock, "~path~", "~fnDataRequested~"
		).then(function (iResult) {
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
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
			.withExactArgs(0, oCache.iReadLength, 0, "~oGroupLock~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve().then(function () {
				that.mock(_AggregationHelper).expects("getCollapsedObject")
					.withExactArgs(sinon.match.same(oGroupNode)).returns(oCollapsed);
				that.mock(_Helper).expects("updateAll")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
						sinon.match.same(oGroupNode), sinon.match.same(oCollapsed));

				throw oError;
			})));

		// code under test
		return oCache.expand("~oGroupLock~", "~path~", "~fnDataRequested~").then(function () {
			assert.ok(false);
		}, function (oResult) {
			assert.strictEqual(oResult, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("expand: Unexpected structural change: groupLevelCount", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupNode = {
				"@$ui5._" : {cache : oGroupLevelCache, groupLevelCount : 41},
				"@$ui5.node.isExpanded" : true
			};

		oCache.aElements = [oGroupNode];
		this.mock(oCache).expects("fetchValue").never();
		this.mock(_Helper).expects("updateAll").never();
		this.mock(oCache).expects("createGroupLevelCache").never();
		this.mock(_AggregationHelper).expects("getCollapsedObject")
			.withExactArgs(sinon.match.same(oGroupNode)).returns({});
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, "~oGroupLock~", "~fnDataRequested~")
			.resolves({value : {$count : 42}}); // simplified ;-)

		// code under test
		return oCache.expand("~oGroupLock~", oGroupNode, "~fnDataRequested~").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, "Unexpected structural change: groupLevelCount");
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oCollapsed = {"@$ui5.node.isExpanded" : false},
			aElements = [{
				"@$ui5.node.groupLevelCount" : 42,
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.level" : 5
			}];

		oCache.aElements = aElements.slice(); // simulate a read
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(aElements[0]));
		this.mock(_AggregationHelper).expects("getCollapsedObject")
			.withExactArgs(sinon.match.same(aElements[0])).returns(oCollapsed);
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(aElements[0]), "descendants").returns(undefined);
		this.mock(_Helper).expects("updateAll")
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
[false, true].forEach(function (bExpanded) {
	var sTitle = "collapse: skip descendants of manually collapsed node; isExpanded=" + bExpanded;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {
				expandTo : 3,
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			aElements = [{
				"@$ui5._" : {
					descendants : 41,
					predicate : "('0')"
				},
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.level" : 1
			}, {
				"@$ui5._" : {
					descendants : 40,
					predicate : "('1')"
				},
				"@$ui5.node.isExpanded" : bExpanded,
				"@$ui5.node.level" : 2
			}, {
				"@$ui5._" : {
					predicate : "('2')"
				},
				"@$ui5.node.level" : 1
			}],
			oPlaceholder,
			aSpliced = [aElements[1]],
			i;

		oCache.aElements = aElements.slice(); // simulate a read
		oCache.aElements.$byPredicate = {
			"('0')" : aElements[0],
			"('1')" : aElements[1],
			"('2')" : aElements[2]
		};
		if (bExpanded) {
			for (i = 0; i < 40; i += 1) { // add 40 placeholders for descendants of ('1')
				oPlaceholder = {"@$ui5.node.level" : 3};
				oCache.aElements.splice(2, 0, oPlaceholder);
				aSpliced.push(oPlaceholder);
			}
		}
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(aElements[0]));
		// don't care about getCollapsedObject and updateAll here

		// code under test
		assert.strictEqual(oCache.collapse("~path~"), bExpanded ? 41 : 1,
			"number of removed elements");

		assert.deepEqual(oCache.aElements, [{
			"@$ui5._" : {
				descendants : 41,
				predicate : "('0')",
				spliced : aSpliced
			},
			"@$ui5.node.isExpanded" : false,
			"@$ui5.node.level" : 1
		}, {
			"@$ui5._" : {
				predicate : "('2')"
			},
			"@$ui5.node.level" : 1
		}]);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], aElements[2]);
	});
});

	//*********************************************************************************************
	QUnit.test("collapse: no descendants at edge of top pyramid", function (assert) {
		var oAggregation = {
				expandTo : 2,
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			aElements = [{
				"@$ui5._" : {
					descendants : 2,
					predicate : "('0')"
				},
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.level" : 1
			}, {
				"@$ui5._" : {
					// no descendants at edge of top pyramid!
					predicate : "('1')"
				},
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 2
			}, {
				"@$ui5._" : {
					// no descendants at edge of top pyramid!
					predicate : "('2')"
				},
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 2
			}, {
				"@$ui5._" : {
					predicate : "('3')"
				},
				"@$ui5.node.level" : 1
			}];

		oCache.aElements = aElements.slice(); // simulate a read
		oCache.aElements.$byPredicate = {
			"('0')" : aElements[0],
			"('1')" : aElements[1],
			"('2')" : aElements[2],
			"('3')" : aElements[3]
		};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(aElements[0]));
		// don't care about getCollapsedObject and updateAll here

		// code under test
		assert.strictEqual(oCache.collapse("~path~"), 2, "number of removed elements");

		assert.deepEqual(oCache.aElements, [{
			"@$ui5._" : {
				descendants : 2,
				predicate : "('0')",
				spliced : [aElements[1], aElements[2]]
			},
			"@$ui5.node.isExpanded" : false,
			"@$ui5.node.level" : 1
		}, {
			"@$ui5._" : {
				predicate : "('3')"
			},
			"@$ui5.node.level" : 1
		}]);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], aElements[3]);
	});

	//*********************************************************************************************
	QUnit.test("addElements", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"],
				$NodeProperty : "SomeNodeID" // unrealistic mix, but never mind
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oPlaceholder = _AggregationHelper.createPlaceholder(NaN, 42, "~parent~"),
			aElements = [{}, {}, oPlaceholder,, {}, {}],
			aReadElements = [
				{"@$ui5._" : {predicate : "(1)"}},
				{"@$ui5._" : {predicate : "(2)"}},
				aElements[4]
			];

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {
			"(2)" : SyncPromise.resolve() // SyncPromise may safely be overwritten
		};
		this.mock(_AggregationHelper).expects("beforeOverwritePlaceholder")
			.withExactArgs(sinon.match.same(oPlaceholder), sinon.match.same(aReadElements[0]),
				"~parent~", 42, "SomeNodeID");
		this.mock(_Helper).expects("updateNonExisting").never();
		this.mock(oCache).expects("hasPendingChangesForPath").never();

		// code under test
		oCache.addElements(aReadElements, 2, "~parent~", 42);

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
		assert.deepEqual(oCache.aElements, [
			{},
			{},
			{"@$ui5._" : {index : 42, parent : "~parent~", predicate : "(1)"}},
			{"@$ui5._" : {index : 43, parent : "~parent~", predicate : "(2)"}},
			{},
			{}
		]);
	});

	//*********************************************************************************************
[false, true].forEach(function (bWithParentCache) {
	var sTitle = "addElements: just a single one; w/ parent cache: " + bWithParentCache;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oGroupLevelCache = bWithParentCache ? {} : undefined,
			oPlaceholder = _AggregationHelper.createPlaceholder(NaN, 42, oGroupLevelCache),
			aElements = [{}, oPlaceholder, {}],
			oReadElement = {"@$ui5._" : {predicate : "(1)"}};

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {
			"(1)" : oReadElement // already there => no problem
		};
		this.mock(_AggregationHelper).expects("beforeOverwritePlaceholder")
			.withExactArgs(sinon.match.same(oPlaceholder), sinon.match.same(oReadElement),
				sinon.match.same(oGroupLevelCache), 42, undefined);
		this.mock(_Helper).expects("setPrivateAnnotation").exactly(bWithParentCache ? 2 : 0);
		this.mock(_Helper).expects("updateNonExisting").never();
		this.mock(oCache).expects("hasPendingChangesForPath").never();

		// code under test
		oCache.addElements(oReadElement, 1, oGroupLevelCache, 42);

		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], oReadElement);
		assert.strictEqual(oCache.aElements[2], aElements[2]);
		assert.deepEqual(oCache.aElements.$byPredicate, {"(1)" : oReadElement});
	});
});

	//*********************************************************************************************
	QUnit.test("addElements: array index out of bounds", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oGroupLevelCache = {};

		this.mock(_Helper).expects("updateNonExisting").never();
		this.mock(oCache).expects("hasPendingChangesForPath").never();

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
		this.mock(_AggregationHelper).expects("beforeOverwritePlaceholder")
			.withExactArgs(sinon.match.same(oCache.aElements[1]), {},
				sinon.match.same(oGroupLevelCache), 0, undefined);

		assert.throws(function () {
			// code under test
			oCache.addElements([{}, {}], 1, oGroupLevelCache, 0);
		}, new Error("Array index out of bounds: 2"));
	});

	//*********************************************************************************************
	QUnit.test("addElements: duplicate predicate", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oElement = {};

		oCache.aElements.length = 2; // avoid "Array index out of bounds: 1"
		oCache.aElements[0] = {/*unexpected element*/};
		oCache.aElements.$byPredicate["foo"] = oCache.aElements[0];
		_Helper.setPrivateAnnotation(oElement, "predicate", "foo");
		this.mock(_Helper).expects("updateNonExisting").never();
		this.mock(oCache).expects("hasPendingChangesForPath").never();

		assert.throws(function () {
			// code under test
			oCache.addElements([oElement], 1); // oCache/iStart does not matter here
		}, new Error("Duplicate predicate: foo"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bIgnore) {
	var sTitle = "addElements: known predicate -> kept element, ignore = " + bIgnore;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, oAggregation),
			aElements = [{},, {}],
			oElement = {"@odata.etag" : "X"},
			oKeptElement = bIgnore ? {"@odata.etag" : "U"} : {};

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {"(1)" : oKeptElement};
		_Helper.setPrivateAnnotation(oElement, "predicate", "(1)");
		this.mock(_Helper).expects("updateNonExisting").exactly(bIgnore ? 0 : 1)
			.withExactArgs(sinon.match.same(oElement), sinon.match.same(oKeptElement));
		this.mock(oCache).expects("hasPendingChangesForPath").exactly(bIgnore ? 1 : 0)
			.withExactArgs("(1)").returns(false);

		// code under test
		oCache.addElements(oElement, 1, "~parent~", 42);

		assert.strictEqual(oCache.aElements.length, 3);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], oElement);
		assert.strictEqual(oCache.aElements[2], aElements[2]);
		assert.deepEqual(oCache.aElements.$byPredicate, {"(1)" : oElement}, "no others");
		assert.strictEqual(oCache.aElements.$byPredicate["(1)"], oElement, "right reference");
		assert.deepEqual(oElement, {
			"@odata.etag" : "X",
			"@$ui5._" : {index : 42, parent : "~parent~", predicate : "(1)"}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("addElements: Modified on client and on server", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, oAggregation),
			aElements = [{},, {}],
			oElement = {"@odata.etag" : "X"},
			oKeptElement = {"@odata.etag" : "U"};

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {"(1)" : oKeptElement};
		_Helper.setPrivateAnnotation(oElement, "predicate", "(1)");
		this.mock(_Helper).expects("updateNonExisting").never();
		this.mock(oCache).expects("hasPendingChangesForPath").withExactArgs("(1)").returns(true);

		assert.throws(function () {
			// code under test
			oCache.addElements(oElement, 1, "~parent~", 42);
		}, new Error("Modified on client and on server: Foo(1)"));

		assert.deepEqual(oCache.aElements, aElements);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[2], aElements[2]);
		assert.deepEqual(oCache.aElements.$byPredicate, {"(1)" : oKeptElement}, "no others");
		assert.strictEqual(oCache.aElements.$byPredicate["(1)"], oKeptElement, "right reference");
		assert.deepEqual(oElement, {
			"@odata.etag" : "X",
			"@$ui5._" : {predicate : "(1)"}
		}, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("addElements: transientPredicate", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, oAggregation),
			aElements = [{},, {}],
			oElement = {"@$ui5._" : {transientPredicate : "$uid=id-1-23"}};

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		this.mock(_AggregationHelper).expects("beforeOverwritePlaceholder").never();
		this.mock(_Helper).expects("updateNonExisting").never();
		this.mock(oCache).expects("hasPendingChangesForPath").never();

		// code under test
		oCache.addElements(oElement, 1, "~parent~", 42);

		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], oElement);
		assert.strictEqual(oCache.aElements[2], aElements[2]);
		assert.deepEqual(oCache.aElements.$byPredicate, {
			"$uid=id-1-23" : oElement
		});
		assert.deepEqual(oCache.aElements, [
			{},
			{"@$ui5._" : {index : 42, parent : "~parent~", transientPredicate : "$uid=id-1-23"}},
			{}
		]);
	});

	//*********************************************************************************************
	QUnit.test("refreshKeptElements", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation);

		this.mock(oCache.oFirstLevel).expects("refreshKeptElements").on(oCache)
			.withExactArgs("~oGroupLock~", "~fnOnRemove~", /*bDropApply*/true)
			.returns("~result~");

		assert.strictEqual(
			// code under test
			oCache.refreshKeptElements("~oGroupLock~", "~fnOnRemove~", "~bDropApply~"),
			"~result~");
	});

	//*********************************************************************************************
[false, true].forEach(function (bCount) {
	[undefined, "~group~"].forEach(function (sGroupId) {
		var sTitle = "reset: $count = " + bCount + ", sGroupId = " + sGroupId;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oFirstLevel = oCache.oFirstLevel,
			aKeptElementPredicates = ["foo", "bar"],
			mQueryOptions = {
				$count : bCount
			};

		oCache.aElements.$byPredicate = {
			bar : {
				"@$ui5._" : {a : 0, b : 1, predicate : "bar"},
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.isTotal" : "n/a",
				"@$ui5.node.level" : 1,
				name : "bar"
			},
			baz : {
				"@$ui5._" : {a : -1, b : 2, predicate : "baz"},
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.isTotal" : "n/a",
				"@$ui5.node.level" : 2,
				name : "baz"
			},
			foo : {
				"@$ui5._" : {a : -2, b : 3, predicate : "foo"},
				"@$ui5.node.isExpanded" : undefined,
				"@$ui5.node.isTotal" : "n/a",
				"@$ui5.node.level" : 3,
				name : "foo"
			}
		};
		oCache.oCountPromise = "~oCountPromise~";
		this.mock(_Cache.prototype).expects("getDownloadUrl").withExactArgs("")
			.returns("~sDownloadUrl~");
		this.mock(oCache.oFirstLevel).expects("reset").on(oCache)
			.withExactArgs(sinon.match.same(aKeptElementPredicates), sGroupId,
				sinon.match.same(mQueryOptions))
			.callsFake(function () {
				oCache.oBackup = sGroupId ? {} : null;
			});
		this.mock(oCache).expects("createGroupLevelCache").withExactArgs()
			.returns("~oFirstLevelCache~");

		// code under test
		oCache.reset(aKeptElementPredicates, sGroupId, mQueryOptions, "~oAggregation~");

		assert.strictEqual(oCache.oAggregation, "~oAggregation~");
		assert.strictEqual(oCache.sDownloadUrl, "~sDownloadUrl~");
		assert.deepEqual(oCache.aElements.$byPredicate, {
			bar : {
				"@$ui5._" : {predicate : "bar"},
				"@$ui5.node.isTotal" : "n/a",
				name : "bar"
			},
			baz : {
				"@$ui5._" : {a : -1, b : 2, predicate : "baz"},
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.isTotal" : "n/a",
				"@$ui5.node.level" : 2,
				name : "baz"
			},
			foo : {
				"@$ui5._" : {predicate : "foo"},
				"@$ui5.node.isTotal" : "n/a",
				name : "foo"
			}
		});
		if (sGroupId) {
			assert.strictEqual(oCache.oBackup.oCountPromise, "~oCountPromise~");
			assert.strictEqual(oCache.oBackup.oFirstLevel, oFirstLevel);
		}
		if (bCount) {
			assert.ok(oCache.oCountPromise.isPending());

			// code under test
			oCache.oCountPromise.$resolve(42);

			assert.strictEqual(oCache.oCountPromise.getResult(), 42);
		} else {
			assert.strictEqual(oCache.oCountPromise, undefined);
		}
		assert.strictEqual(oCache.oFirstLevel, "~oFirstLevelCache~");
	});
	});
});

	//*********************************************************************************************
	QUnit.test("reset: placeholder", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			sDownloadUrl = oCache.sDownloadUrl,
			oFirstLevel = oCache.oFirstLevel,
			aKeptElementPredicates = ["foo"];

		oCache.aElements.$byPredicate = {foo : {}};
		this.mock(_Helper).expects("hasPrivateAnnotation")
			.withExactArgs(sinon.match.same(oCache.aElements.$byPredicate.foo), "placeholder")
			.returns(true);
		this.mock(_Cache.prototype).expects("getDownloadUrl").never();
		this.mock(oCache.oFirstLevel).expects("reset").never();
		this.mock(oCache).expects("createGroupLevelCache").never();

		assert.throws(function () {
			// code under test
			oCache.reset(aKeptElementPredicates);
		}, new Error("Unexpected placeholder"));

		assert.strictEqual(oCache.oAggregation, oAggregation, "unchanged");
		assert.deepEqual(oCache.oAggregation, {hierarchyQualifier : "X"}, "unchanged");
		assert.strictEqual(oCache.sDownloadUrl, sDownloadUrl, "unchanged");
		assert.strictEqual(oCache.oFirstLevel, oFirstLevel, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("reset: Unsupported grouping via sorter", function (assert) {
		var oCache = _AggregationCache.create(this.oRequestor, "~", "", {},
				{hierarchyQualifier : "X"});

		this.mock(_Cache.prototype).expects("getDownloadUrl").never();
		this.mock(oCache.oFirstLevel).expects("reset").never();
		this.mock(oCache).expects("createGroupLevelCache").never();

		assert.throws(function () {
			// code under test
			oCache.reset([], "", {}, undefined, /*bIsGrouped*/true);
		}, new Error("Unsupported grouping via sorter"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bReally) {
	QUnit.test("restore: bReally = " + bReally, function (assert) {
		var oCache = _AggregationCache.create(this.oRequestor, "~", "", {$count : true}, {
				hierarchyQualifier : "X"
			}),
			oNewFirstLevel = {
				restore : function () {}
			},
			oOldCountPromise = oCache.oCountPromise,
			oOldFirstLevel = oCache.oFirstLevel;

		oCache.oBackup = bReally
			? {
				oCountPromise : "~oNewCountPromise~",
				oFirstLevel : oNewFirstLevel
			}
			: null;
		this.mock(bReally ? oNewFirstLevel : oOldFirstLevel).expects("restore").on(oCache)
			.withExactArgs(bReally)
			.callsFake(function () {
				oCache.oBackup = null; // must not be used anymore after this call
			});

		// code under test
		oCache.restore(bReally);

		assert.strictEqual(oCache.oCountPromise,
			bReally ? "~oNewCountPromise~" : oOldCountPromise);
		assert.strictEqual(oCache.oFirstLevel, bReally ? oNewFirstLevel : oOldFirstLevel);
	});
});

	//*********************************************************************************************
	QUnit.test("getDownloadQueryOptions", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation);

		this.mock(_AggregationHelper).expects("filterOrderby")
			.withExactArgs("~mQueryOptions~", sinon.match.same(oAggregation))
			.returns("~mFilteredQueryOptions~");
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), "~mFilteredQueryOptions~", 0, true)
			.returns("~result~");

		// code under test
		assert.strictEqual(oCache.getDownloadQueryOptions("~mQueryOptions~"), "~result~");
	});

	//*********************************************************************************************
[undefined, false, true].forEach(function (bCount) {
	QUnit.test("getDownloadQueryOptions: recursive hierarchy, bCount=" + bCount, function (assert) {
		var oAggregation = {hierarchyQualifier : "X"},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			mQueryOptions = {
				$expand : {EMPLOYEE_2_TEAM : null},
				$filter : "age gt 40",
				$orderby : "TEAM_ID desc",
				$search : "OR",
				$select : ["Name"],
				foo : "bar",
				"sap-client" : "123"
			},
			sQueryOptions;

		if (bCount !== undefined) {
			mQueryOptions.$count = bCount;
		}
		sQueryOptions = JSON.stringify(mQueryOptions);
		this.mock(_AggregationHelper).expects("filterOrderby").never();
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), {
					$expand : {EMPLOYEE_2_TEAM : null},
					$filter : "age gt 40",
					$orderby : "TEAM_ID desc",
					$search : "OR",
					$select : ["Name"],
					foo : "bar",
					"sap-client" : "123"
				}, 0, true)
			.returns("~result~");

		// code under test
		assert.strictEqual(oCache.getDownloadQueryOptions(mQueryOptions), "~result~");

		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptions, "unchanged");
	});
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
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oPlaceholder0 = {"@$ui5._" : {placeholder : true}}, // this is what counts ;-)
			oPlaceholder2 = _AggregationHelper.createPlaceholder(1, 2, {/*oParentCache*/});

		oCache.aElements = [oPlaceholder0, "~oElement1~", oPlaceholder2, "~oElement3~"];
		oCache.aElements.$count = 4;

		// code under test
		aAllElements = oCache.getAllElements();

		assert.deepEqual(aAllElements, [undefined, "~oElement1~", undefined, "~oElement3~"]);
		assert.strictEqual(aAllElements.$count, 4);
	});

	//*********************************************************************************************
	QUnit.test("beforeRequestSideEffects: Missing recursive hierarchy", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation);

		assert.throws(function () {
			// code under test
			oCache.beforeRequestSideEffects({});
		}, new Error("Missing recursive hierarchy"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bIn) {
	QUnit.test("beforeRequestSideEffects: NodeProperty already in = " + bIn, function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X",
				$NodeProperty : "SomeNodeID"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			mQueryOptions = {
				$apply : "A.P.P.L.E.", // dropped
				$count : true,
				$expand : {EMPLOYEE_2_TEAM : null},
				$filter : "age gt 40",
				$orderby : "TEAM_ID desc",
				$search : "OR",
				$select : bIn ? ["Name", "SomeNodeID", "XYZ"] : ["Name", "XYZ"],
				foo : "bar",
				"sap-client" : "123"
			};

		// code under test
		oCache.beforeRequestSideEffects(mQueryOptions);

		assert.deepEqual(mQueryOptions, {
			$count : true,
			$expand : {EMPLOYEE_2_TEAM : null},
			$filter : "age gt 40",
			$orderby : "TEAM_ID desc",
			$search : "OR",
			$select : bIn ? ["Name", "SomeNodeID", "XYZ"] : ["Name", "XYZ", "SomeNodeID"],
			foo : "bar",
			"sap-client" : "123"
		}, "only $apply is dropped");
	});
});

	//*********************************************************************************************
	QUnit.test("beforeUpdateSelected", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X",
				$NodeProperty : "Some/NodeID"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oError = new Error("Unexpected structural change: Some/NodeID from ... to ...");

		oCache.aElements.$byPredicate = {
			"('A')" : "~oPlaceholder~"
		};
		this.mock(_AggregationHelper).expects("checkNodeProperty")
			.withExactArgs("~oPlaceholder~", "~oNewValue~", "Some/NodeID", true)
			.throws(oError);

		assert.throws(function () {
			// code under test
			oCache.beforeUpdateSelected("('A')", "~oNewValue~");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("turnIntoPlaceholder", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			oHelperMock = this.mock(_Helper),
			oParentCache = {
				drop : function () {}
			};

		oCache.aElements.$byPredicate = {
			"('A')" : "~a~",
			"('B')" : "~b~",
			"('C')" : "~c~"
		};

		oHelperMock.expects("hasPrivateAnnotation")
			.withExactArgs("~oElement~", "placeholder").returns(false);
		oHelperMock.expects("setPrivateAnnotation").withExactArgs("~oElement~", "placeholder", 1);
		this.mock(_AggregationHelper).expects("markSplicedStale").withExactArgs("~oElement~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oElement~", "parent")
			.returns(oParentCache);
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oElement~", "index")
			.returns(42);
		this.mock(oParentCache).expects("drop").withExactArgs(42, "('B')");

		// code under test
		oCache.turnIntoPlaceholder("~oElement~", "('B')");

		assert.deepEqual(oCache.aElements.$byPredicate, {
			"('A')" : "~a~",
			"('C')" : "~c~"
		});

		oCache.aElements = null; // do not touch ;-)
		// no other method calls expected!
		oHelperMock.expects("hasPrivateAnnotation")
			.withExactArgs("~oElement~", "placeholder").returns(true);

		// code under test
		oCache.turnIntoPlaceholder("~oElement~", "n/a");
	});

	//*********************************************************************************************
	QUnit.test("keepOnlyGivenElements: empty", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation);

		// code under test
		assert.deepEqual(oCache.keepOnlyGivenElements([]), []);
	});

	//*********************************************************************************************
	QUnit.test("keepOnlyGivenElements", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X"
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCache = _AggregationCache.create(this.oRequestor, "~", "", {}, oAggregation),
			aElements = [{
				"@$ui5._" : {predicate : "('A')"}
			}, {
				"@$ui5._" : {predicate : "('B')"}
			}, {
				"@$ui5._" : {predicate : "('C')"}
			}],
			aResult;

		oCache.aElements = aElements.slice();
		oAggregationHelperMock.expects("markSplicedStale")
			.withExactArgs(sinon.match.same(aElements[0]));
		this.mock(oCache).expects("turnIntoPlaceholder")
			.withExactArgs(sinon.match.same(aElements[1]), "('B')");
		oAggregationHelperMock.expects("markSplicedStale")
			.withExactArgs(sinon.match.same(aElements[2]));

		// code under test
		aResult = oCache.keepOnlyGivenElements(["('A')", "('C')"]);

		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0], aElements[0]);
		assert.strictEqual(aResult[1], aElements[2]);
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasGroupLevelCache) {
	QUnit.test("create: already has group level cache: " + bHasGroupLevelCache, function (assert) {
		const oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, {
				$ParentNavigationProperty : "myParent",
				hierarchyQualifier : "X"
			});
		const oGroupLevelCache = {
				create : mustBeMocked
			};
		const oParentNode = {
				"@$ui5._" : {cache : bHasGroupLevelCache ? oGroupLevelCache : undefined},
				"@$ui5.node.level" : 23
			};
		oCache.aElements = ["0", "1", oParentNode, "3", "4"];
		oCache.aElements.$byPredicate = {"('42')" : oParentNode};
		oCache.aElements.$count = 5;
		this.mock(oCache).expects("createGroupLevelCache").exactly(bHasGroupLevelCache ? 0 : 1)
			.withExactArgs(sinon.match.same(oParentNode)).returns(oGroupLevelCache);
		this.mock(_Helper).expects("updateAll").exactly(bHasGroupLevelCache ? 0 : 1)
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "('42')",
				sinon.match.same(oParentNode), {"@$ui5.node.isExpanded" : true});
		const oEntityData = {
				"@$ui5.node.parent" : "Foo('42')",
				bar : "~bar~",
				foo : "~foo~"
			};
		const oPostBody = {};
		this.mock(oGroupLevelCache).expects("create")
			.withExactArgs("~oGroupLock~", "~oPostPathPromise~", "~sPath~", "~sTransientPredicate~",
				{bar : "~bar~", foo : "~foo~"},
				false, "~fnErrorCallback~", "~fnSubmitCallback~")
			.callsFake(() => {
				if (!bHasGroupLevelCache) {
					assert.strictEqual(_Helper.getPrivateAnnotation(oParentNode, "cache"),
						oGroupLevelCache);
				}
				_Helper.setPrivateAnnotation(oEntityData, "postBody", oPostBody);
				return new SyncPromise(function (resolve) {
					setTimeout(function () {
						_Helper.setPrivateAnnotation(oEntityData, "predicate", "('ABC')");
						resolve();
					});
				});
			});
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oEntityData), 3, sinon.match.same(oGroupLevelCache), 0)
			.callsFake(function () {
				assert.deepEqual(oCache.aElements, ["0", "1", oParentNode, null, "3", "4"]);
			});

		// code under test
		const oResult = oCache.create("~oGroupLock~", "~oPostPathPromise~", "~sPath~",
			"~sTransientPredicate~", oEntityData, /*bAtEndOfCreated*/false, "~fnErrorCallback~",
			"~fnSubmitCallback~");

		assert.deepEqual(oPostBody, {"myParent@odata.bind" : "Foo('42')"});
		assert.deepEqual(oEntityData, {
			"@$ui5._" : {postBody : oPostBody},
			"@$ui5.node.level" : 24,
			bar : "~bar~",
			foo : "~foo~"
		});
		assert.strictEqual(oCache.aElements.$count, 6);
		assert.strictEqual(oResult.isPending(), true);

		return oResult.then(function (oEntityData0) {
			assert.strictEqual(oEntityData0, oEntityData);
			assert.deepEqual(oCache.aElements.$byPredicate, {
				"('42')" : oParentNode,
				"('ABC')" : oEntityData
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("create: expandTo > 1", function (assert) {
		const oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, {
				expandTo : 2,
				hierarchyQualifier : "X"
			});
		this.mock(oCache).expects("createGroupLevelCache").never();
		this.mock(_Helper).expects("updateAll").never();
		this.mock(oCache).expects("addElements").never();

		assert.throws(function () {
			oCache.create();
		}, new Error("Unsupported expandTo: 2"));
	});

	//*********************************************************************************************
	QUnit.test("create: bAtEndOfCreated, collapsed parent", function (assert) {
		const oCache = _AggregationCache.create(this.oRequestor, "Foo", "", {}, {
				hierarchyQualifier : "X"
			});
		this.mock(oCache).expects("createGroupLevelCache").never();
		this.mock(_Helper).expects("updateAll").never();
		this.mock(oCache).expects("addElements").never();

		assert.throws(function () {
			oCache.create(null, null, "", "", null, /*bAtEndOfCreated*/true);
		}, new Error("Unsupported bAtEndOfCreated"));

		oCache.aElements.$byPredicate["('42')"] = {"@$ui5.node.isExpanded" : false};

		assert.throws(function () {
			oCache.create(null, null, "", "", {"@$ui5.node.parent" : "Foo('42')"});
		}, new Error("Unsupported collapsed parent: Foo('42')"));
	});
});

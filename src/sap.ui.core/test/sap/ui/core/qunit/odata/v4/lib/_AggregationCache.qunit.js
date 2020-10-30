/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_AggregationCache",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_GrandTotalHelper",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_MinMaxHelper"
], function (Log, SyncPromise, _AggregationCache, _AggregationHelper, _Cache, _GrandTotalHelper,
		_GroupLock, _Helper, _MinMaxHelper) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0, no-sparse-arrays: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationCache", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oRequestor = {
				buildQueryString : function () {return "";},
				getServiceUrl : function () {return "/~/";}
			};
			this.oRequestorMock = this.mock(this.oRequestor);
		}
	});
	//*********************************************************************************************
[
	{},
	{$$filterBeforeAggregate : "foo", $apply : "bar"}
].forEach(function (mQueryOptions, i) {
	QUnit.test("create: no aggregation " + i, function (assert) {
		var oAggregation = i ? {groupLevels : []} : null; // improves code coverage

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
	QUnit.test("create with min/max", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				// Note: ODLB#updateAnalyticalInfo called _AggregationHelper.buildApply
				groupLevels : []
			},
			mQueryOptions = {};

		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(true);
		this.mock(_MinMaxHelper).expects("createCache")
			.withExactArgs("~requestor~", "resource/path", sinon.match.same(oAggregation),
				sinon.match.same(mQueryOptions))
			.returns("~cache~");

		assert.strictEqual(
			// code under test
			_AggregationCache.create("~requestor~", "resource/path", "", oAggregation,
				mQueryOptions),
			"~cache~");
	});

	//*********************************************************************************************
	QUnit.test("create: $expand not allowed", function (assert) {
		var oAggregation = {groupLevels : ["foo"]},
			mQueryOptions = {$expand : undefined}; // even falsy values are forbidden!

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: $expand"));
	});

	//*********************************************************************************************
	QUnit.test("create: $select not allowed", function (assert) {
		var oAggregation = {groupLevels : ["foo"]},
			mQueryOptions = {$select : undefined}; // even falsy values are forbidden!

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: $select"));
	});

	//*********************************************************************************************
	QUnit.test("create: $count not allowed with visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {
					BillToParty : {}
				},
				groupLevels : ["BillToParty"]
			},
			mQueryOptions = {$count : true};

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: $count"));
	});

	//*********************************************************************************************
	QUnit.test("create: $filter not allowed with visual grouping", function (assert) {
		var oAggregation = {groupLevels : ["BillToParty"]},
			mQueryOptions = {$filter : "answer eq 42"};

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: $filter"));
	});
	//TODO if we allow filtering, do we need to filter $filter by current level, like $orderby?

	//*********************************************************************************************
	QUnit.test("create: grandTotal", function (assert) {
		var oAggregation = {
				aggregate : {
					// SalesNumber : {grandTotal : true}
				},
				group : {
					Region : {}
				},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			sAggregation = JSON.stringify(oAggregation),
			oCache,
			fnDataRequested = {},
			fnGetResourcePathWithQuery = function () {},
			oGroupLock = {},
			fnHandleResponse = function () {},
			oFirstLevelCache = {
				fetchValue : function () {},
				getResourcePathWithQuery : fnGetResourcePathWithQuery,
				handleResponse : fnHandleResponse,
				read : function () {}
			},
			mQueryOptions = {},
			sQueryOptions = JSON.stringify(mQueryOptions),
			sResourcePath = "BusinessPartner",
			that = this;

		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(false);
		this.mock(_AggregationHelper).expects("hasGrandTotal")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(true);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), true)
			.returns(oFirstLevelCache);
		this.mock(_GrandTotalHelper).expects("enhanceCacheWithGrandTotal")
			.withExactArgs(sinon.match.same(oFirstLevelCache), sinon.match.same(oAggregation),
				sinon.match.same(mQueryOptions));

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, "", oAggregation,
			mQueryOptions);

		assert.ok(oCache instanceof _AggregationCache, "module value is c'tor function");
		assert.ok(oCache instanceof _Cache, "_AggregationCache is a _Cache");
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.sResourcePath, sResourcePath);
		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.bSortExpandSelect, true);
		assert.strictEqual(typeof oCache.fetchValue, "function");
		assert.strictEqual(typeof oCache.read, "function");
		assert.strictEqual(oCache.oAggregation, oAggregation);
		assert.strictEqual(oCache.oMeasureRangePromise, undefined);
		assert.strictEqual(oCache.getMeasureRangePromise(), undefined);
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptions, "not modified");
		assert.strictEqual(JSON.stringify(oAggregation), sAggregation, "not modified");
		assert.strictEqual(oCache.oFirstLevel, oFirstLevelCache);

		this.mock(oFirstLevelCache).expects("read").on(oFirstLevelCache)
			.withExactArgs(0, 5, 100, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve({
				value : [{
					"@$ui5.node.isExpanded" : true,
					"@$ui5.node.isTotal" : true,
					"@$ui5.node.level" : 0
				}, {}, {}]
			}
		));

		// code under test
		return oCache.read(0, 5, 100, oGroupLock, fnDataRequested).then(function (oResult) {
			assert.deepEqual(oResult, {
				value : [{
					"@$ui5.node.isExpanded" : true,
					"@$ui5.node.isTotal" : true,
					"@$ui5.node.level" : 0
				}, {
					"@$ui5.node.isExpanded" : undefined,
					"@$ui5.node.isTotal" : false,
					"@$ui5.node.level" : 1
				}, {
					"@$ui5.node.isExpanded" : undefined,
					"@$ui5.node.isTotal" : false,
					"@$ui5.node.level" : 1
				}]
			});

			that.mock(oFirstLevelCache).expects("fetchValue")
				.withExactArgs("~groupLock~", "path", "~dataRequested", "~listener~")
				.returns("~promise~");

			assert.strictEqual(
				// code under test
				oCache.fetchValue("~groupLock~", "path", "~dataRequested", "~listener~"),
				"~promise~");
		});
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oAggregation = { // Note: properties added by _AggregationHelper.buildApply before
				aggregate : {},
				group : {},
				groupLevels : ["foo"]
			},
			mQueryOptions = {},
			mQueryOptionsWithApply = {},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation,
				mQueryOptions);

		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(mQueryOptions))
			.returns(mQueryOptionsWithApply);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Foo", sinon.match.same(mQueryOptionsWithApply), false, true)
			.returns("?foo=bar");

		assert.strictEqual(oCache.toString(), "/~/Foo?foo=bar");
	});

	//*********************************************************************************************
	// Using PICT
	//
	// hasFilteredOrderby: false, true
	// leaf: false, true
	// parent: false, true
	// total: false, true
	//
	// IF [leaf] = "true" THEN [total] = "false";
[{
	filteredOrderby : "",
	leaf : true,
	parent : true,
	total : false
}, {
	filteredOrderby : "~filteredOrderby~",
	leaf : false,
	parent : false,
	total : false
}, {
	filteredOrderby : "~filteredOrderby~",
	leaf : false,
	parent : true,
	total : true
}, {
	filteredOrderby : "",
	leaf : false,
	parent : false,
	total : true
}, {
	filteredOrderby : "~filteredOrderby~",
	leaf : true,
	parent : false,
	total : false
}].forEach(function (oFixture) {
	QUnit.test("createGroupLevelCache: " + JSON.stringify(oFixture), function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group: {},
				groupLevels : ["a"]
			},
			oCache,
			mCacheQueryOptions = {},
			oFilteredAggregation = {
				groupLevels : oFixture.leaf ? [] : ["a", "b"],
				aggregate : {},
				$groupBy : [],
				$missing : []
			},
			oGroupNode = oFixture.parent ? {
					"@$ui5.node.level" : 2,
					"@$ui5._" : {
						filter : "~filter~"
					}
				} : undefined,
			mFilteredQueryOptions = {
				$count : true,
				$orderby : "~orderby~"
			},
			oGroupLevelCache = {},
			iLevel = oFixture.parent ? 3 : 1,
			mQueryOptions = {
				$orderby : "~orderby~"
			};

		oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, mQueryOptions);

		if (oFixture.total) {
			oFilteredAggregation.aggregate.x = {subtotal : true};
		}
		this.mock(_AggregationHelper).expects("filterAggregation")
			.withExactArgs(sinon.match.same(oCache.oAggregation), iLevel)
			.returns(oFilteredAggregation);
		this.mock(_AggregationHelper).expects("filterOrderby")
			.withExactArgs("~orderby~", sinon.match.same(oFilteredAggregation))
			.returns(oFixture.filteredOrderby);
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions))
			.returns(mFilteredQueryOptions);
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match(function (o) {
					return o === oFilteredAggregation && !("$groupBy" in o || "$missing" in o);
				}), sinon.match(function (o) {
					return o === mFilteredQueryOptions
						&& !("$count" in o)
						&& (oFixture.parent
							? o.$$filterBeforeAggregate === "~filter~"
							: !("$$filterBeforeAggregate" in o))
						&& (oFixture.filteredOrderby
							? o.$orderby === oFixture.filteredOrderby
							: !("$orderby" in o));
				}))
			.returns(mCacheQueryOptions);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(oCache.oRequestor), "Foo",
				sinon.match(function (o) {
					return o === mCacheQueryOptions && o.$count === true;
				}), true)
			.returns(oGroupLevelCache);

		// This must be done before calling createGroupLevelCache, so that bind grabs the mock
		this.mock(_AggregationCache).expects("calculateKeyPredicate")
		.withExactArgs(sinon.match.same(oGroupNode),
			sinon.match.same(oFilteredAggregation.$groupBy),
			sinon.match.same(oFilteredAggregation.$missing), oFixture.leaf, oFixture.total,
			sinon.match.same(oCache.aElements.$byPredicate), "~oElement~", "~mTypeForMetaPath~",
			"~metapath~");

		assert.strictEqual(
			// code under test
			oCache.createGroupLevelCache(oGroupNode),
			oGroupLevelCache
		);

		// code under test (this normally happens inside the created cache's handleResponse method)
		oGroupLevelCache.calculateKeyPredicate("~oElement~", "~mTypeForMetaPath~", "~metapath~");
	});
});
	// TODO can there already be a $$filterBeforeAggregate when creating a group level cache?

	//*********************************************************************************************
[false, true].forEach(function (bLeaf) {
	[false, true].forEach(function (bParent) {

	QUnit.test("calculateKeyPredicate: leaf=" + bLeaf + ", parent=" + bParent, function (assert) {
		var mByPredicate = {},
			oElement = {
				p2: "v2"
			},
			oGroupNode = {
				p1 : "v1",
				"@$ui5.node.level" : 2
			},
			aGroupBy = bParent ? ["p1", "p2"] : ["p2"],
			oHelperMock = this.mock(_Helper),
			bTotal = {/*false or true*/};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match(function (o) {
					return o === oElement && (!bParent || o.p1 === "v1");
				}), "~sMetaPath~", "~mTypeForMetaPath~", sinon.match.same(aGroupBy), true)
			.returns("~predicate~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate", "~predicate~");
		oHelperMock.expects("getKeyFilter").exactly(bLeaf ? 0 : 1)
			.withExactArgs(sinon.match(function (o) {
					return o === oElement && (!bParent || o.p1 === "v1");
				}), "~sMetaPath~", "~mTypeForMetaPath~", sinon.match.same(aGroupBy))
			.returns("~filter~");
		oHelperMock.expects("setPrivateAnnotation").exactly(bLeaf ? 0 : 1)
			.withExactArgs(sinon.match.same(oElement), "filter", "~filter~");

		// code under test
		_AggregationCache.calculateKeyPredicate(bParent ? oGroupNode : undefined, aGroupBy,
			["p3", "p4"], bLeaf, bTotal, mByPredicate, oElement, "~mTypeForMetaPath~",
			"~sMetaPath~");

		assert.strictEqual(oElement["@$ui5.node.isExpanded"], bLeaf ? undefined : false);
		assert.strictEqual(oElement["@$ui5.node.isTotal"], bTotal);
		assert.strictEqual(oElement["@$ui5.node.level"], bParent ? 3 : 1);
		if (bParent) {
			assert.strictEqual(oElement.p1, "v1");
		}
		assert.strictEqual(oElement.p2, "v2");
		assert.strictEqual(oElement.p3, null);
		assert.strictEqual(oElement.p4, null);
	});

	});
});

	//*********************************************************************************************
	QUnit.test("calculateKeyPredicate: grand total element", function (assert) {
		var oElement = {
				group : null,
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.isTotal" : true,
				"@$ui5.node.level" : 0
			};

		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oElement), "~sMetaPath~", "~mTypeForMetaPath~",
				["group"], true)
			.returns("~predicate~");

		// code under test - simulate call on grandTotal
		_AggregationCache.calculateKeyPredicate(undefined, ["group"], ["foo", "bar"],
			true, false, {}, oElement, "~mTypeForMetaPath~", "~sMetaPath~");

		assert.strictEqual(oElement["@$ui5.node.isExpanded"], true);
		assert.strictEqual(oElement["@$ui5.node.isTotal"], true);
		assert.strictEqual(oElement["@$ui5.node.level"], 0);
	});

	//*********************************************************************************************
	QUnit.test("calculateKeyPredicate: multi-unit", function (assert) {
		var oConflictingElement = {dimension : "A", measure : 0, unit : "EUR"},
			oElement = {dimension : "A", measure : 0, unit : "USD"},
			mByPredicate = {
				"~predicate~" : oConflictingElement
			};

		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oElement), "~sMetaPath~", "~mTypeForMetaPath~", [],
				true)
			.returns("~predicate~");
		this.mock(_Helper).expects("setPrivateAnnotation").never();

		assert.throws(function () {
			// code under test
			_AggregationCache.calculateKeyPredicate(undefined, [], [], false, false, mByPredicate,
				oElement, "~mTypeForMetaPath~", "~sMetaPath~");
		}, new Error("Multi-unit situation detected: "
			+ '{"dimension":"A","measure":0,"unit":"USD"} vs. '
			+ '{"dimension":"A","measure":0,"unit":"EUR"}'));
	});

	//*********************************************************************************************
	QUnit.test("create with visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {
					BillToParty : {}
				},
				groupLevels : ["BillToParty"]
			},
			oCache,
			oFirstLevelCache = {
				aElements : [],
				fetchTypes : function () {},
				fetchValue : function () {},
				read : function () {}
			},
			mQueryOptions = {$count : false, $orderby : "FirstDimension", "sap-client" : "123"},
			sResourcePath = "Foo";

		oFirstLevelCache.aElements.$byPredicate = {};
		this.mock(_AggregationCache.prototype).expects("createGroupLevelCache")
			.withExactArgs()
			.returns(oFirstLevelCache);

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, "", oAggregation,
			mQueryOptions);

		assert.deepEqual(oCache.aElements, []);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.ok("$count" in oCache.aElements);
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.strictEqual(oCache.aElements.$created, 0);

		assert.ok(oCache instanceof _AggregationCache, "module value is c'tor function");
		assert.ok(oCache instanceof _Cache, "_AggregationCache is a _Cache");
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.sResourcePath, sResourcePath);
		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.bSortExpandSelect, true);
		assert.strictEqual(typeof oCache.fetchValue, "function");
		assert.strictEqual(typeof oCache.read, "function");
		assert.strictEqual(oCache.oAggregation, oAggregation);
		assert.notOk("oMeasureRangePromise" in oCache, "no min/max");
		assert.strictEqual(oCache.oFirstLevel, oFirstLevelCache);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: with visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : ["BillToParty"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {});

		this.mock(oCache).expects("registerChange").withExactArgs("~path~", "~oListener~");
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), "~path~", "~oGroupLock~")
			.returns(SyncPromise.resolve("~result~"));

		// code under test
		return oCache.fetchValue("~oGroupLock~", "~path~", "~fnDataRequested~", "~oListener~")
			.then(function (vResult) {
				assert.strictEqual(vResult, "~result~");
			});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: no leaf $count available with visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : ["BillToParty"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {}),
			fnDoNotCall = assert.ok.bind(assert, false),
			oListener = {
				update : fnDoNotCall
			};

		this.mock(oCache.oFirstLevel).expects("fetchValue").never();
		this.oLogMock.expects("error")
			.withExactArgs("Failed to drill-down into $count, invalid segment: $count",
				oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		// code under test
		return oCache.fetchValue({/*oGroupLock*/}, "$count", fnDoNotCall, oListener)
			.then(function (vResult) {
				assert.strictEqual(vResult, undefined, "no $count available");
			});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: no leaf $count available without $count", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : ["bar"] // Note: added by _AggregationHelper.buildApply before
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {}),
			fnDoNotCall = assert.ok.bind(assert, false),
			oListener = {
				update : fnDoNotCall
			};

		this.mock(oCache.oFirstLevel).expects("fetchValue").never();
		this.oLogMock.expects("error")
			.withExactArgs("Failed to drill-down into $count, invalid segment: $count",
				oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		// code under test
		return oCache.fetchValue({/*oGroupLock*/}, "$count", fnDoNotCall, oListener)
			.then(function (vResult) {
				assert.strictEqual(vResult, undefined, "no $count available");
			});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: leaf $count available without visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {
					SalesNumber : {grandTotal : true}
				},
				group : {
					Country : {},
					Region : {},
					Segment : {}
				},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", "", oAggregation, {
				$count : true
			}),
			fnDoNotCall = assert.ok.bind(assert, false),
			oGroupLock = {},
			oListener = {update : fnDoNotCall},
			fnResolve,
			oResult,
			oFirstLevelPromise = new SyncPromise(function (resolve) {
				fnResolve = resolve;
			});

		this.mock(oCache.oFirstLevel).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "$count")
			.returns(oFirstLevelPromise);

		// code under test
		oResult = oCache.fetchValue(oGroupLock, "$count", fnDoNotCall, oListener);

		assert.strictEqual(oResult.isPending(), true, "leaf $count not yet available");

		oCache.oFirstLevel.iLeafCount = 42; // @see handleResponse
		fnResolve();

		return oResult.then(function (iLeafCount) {
			assert.strictEqual(iLeafCount, 42, "leaf $count available");
		});
	});

	//*********************************************************************************************
[0, 10].forEach(function (iReadIndex) {
	QUnit.test("read: with visual grouping - read index: " + iReadIndex, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLock = {
				unlock : function () {}
			},
			iLength = 3,
			iPrefetchLength = 100,
			oReadResult = {
				value : [{}, {}, {}]
			},
			i;

		function checkResult(oResult) {
			assert.strictEqual(oResult.value.length, 3);
			assert.strictEqual(oResult.value.$count, 42);
			assert.strictEqual(oResult.value[0], oCache.aElements[iReadIndex + 0]);
			assert.strictEqual(oResult.value[1], oCache.aElements[iReadIndex + 1]);
			assert.strictEqual(oResult.value[2], oCache.aElements[iReadIndex + 2]);
		}

		oReadResult.value.$count = 42;

		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(iReadIndex, iLength, iPrefetchLength, sinon.match.same(oGroupLock),
				"~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult)));
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult.value), iReadIndex,
				sinon.match.same(oCache.oFirstLevel), iReadIndex)
			.callThrough(); // so that oCache.aElements is actually filled
		// expect placeholders before iReadIndex
		for (i = 0; i < iReadIndex; i += 1) {
			oAggregationHelperMock.expects("createPlaceholder")
				.withExactArgs(0, i, sinon.match.same(oCache.oFirstLevel))
				.returns("~placeholder~" + i);
		}
		// expect placeholders after iReadIndex + result length
		for (i = iReadIndex + 3; i < oReadResult.value.$count; i += 1) {
			oAggregationHelperMock.expects("createPlaceholder")
				.withExactArgs(0, i, sinon.match.same(oCache.oFirstLevel))
				.returns("~placeholder~" + i);
		}

		// code under test
		return oCache.read(iReadIndex, iLength, iPrefetchLength, oGroupLock,
				"~fnDataRequested~")
			.then(function (oResult1) {
				var i;

				assert.strictEqual(oCache.aElements.$count, oReadResult.value.$count);
				assert.strictEqual(oCache.iReadLength, iLength + iPrefetchLength);

				checkResult(oResult1);

				// check placeholders before iReadIndex
				for (i = 0; i < iReadIndex; i += 1) {
					assert.strictEqual(oCache.aElements[i], "~placeholder~" + i);
				}
				// check placeholders after iReadIndex + result length
				for (i = iReadIndex + 3; i < oCache.aElements.length; i += 1) {
					assert.strictEqual(oCache.aElements[i], "~placeholder~" + i);
				}

				// code under test
				return oCache.read(iReadIndex, iLength, iPrefetchLength, oGroupLock,
					"~fnDataRequested~"
				).then(function (oResult2) {
					checkResult(oResult2);
				});
			});
	});
});

	//*********************************************************************************************
	QUnit.test("read: with visual grouping - read from group level cache", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {
				read : function () {}
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

		this.mock(oGroupLock0).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy0~");

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 1, 0, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2,
				sinon.match.same(oGroupLevelCache), 1)
			.callThrough(); // so that oCache.aElements is actually filled

		this.mock(oGroupLock0).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(2, 1, 0, oGroupLock0, "~fnDataRequested~").then(function (oResult1) {
			assert.strictEqual(oResult1.value.length, 1);
			assert.strictEqual(oResult1.value[0], oReadResult0.value[0]);
			assert.strictEqual(oResult1.value.$count, 42);

			that.mock(oGroupLock1).expects("getUnlockedCopy").withExactArgs()
				.returns("~oGroupLockCopy1~");

			oGroupLevelCacheMock.expects("read")
				.withExactArgs(2, 2, 0, "~oGroupLockCopy1~", "~fnDataRequested~")
				.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));

			oCacheMock.expects("addElements")
				.withExactArgs(sinon.match.same(oReadResult1.value), 3,
					sinon.match.same(oGroupLevelCache), 2)
				.callThrough(); // so that oCache.aElements is actually filled

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
	QUnit.test("read: with visual grouping - first and group level cache", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oFirstLeaf = {},
			oGroupLevelCache = {read : function () {}},
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
			.callThrough(); // so that oCache.aElements is actually filled

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 4,
				sinon.match.same(oCache.oFirstLevel), 1)
			.callThrough(); // so that oCache.aElements is actually filled

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
	QUnit.test("read: with visual grouping - intersecting reads", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oCacheMock = this.mock(oCache),
			oFirstLeaf = {},
			oGroupLevelCache = {
				read : function () {}
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

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		oGroupLockMock.expects("unlock").withExactArgs().twice();

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 3, 0, "~oGroupLockCopy0~", "~fnDataRequested~")
			.callsFake(function () {
				return new Promise(function (resolve) {
					setTimeout(resolve(oReadResult0), 500);
				});
			});

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(2, 1, 0, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2,
				sinon.match.same(oGroupLevelCache), 1)
			.callThrough(); // so that oCache.aElements is actually filled

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 3,
				sinon.match.same(oGroupLevelCache), 2)
			.callThrough(); // so that oCache.aElements is actually filled

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
				read : function () {}
			},
			oGroupLevelCacheMock = this.mock(oGroupLevelCache),
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

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy~", "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate an expand
				oCache.aElements.splice(1, 0, oInsertedNode);

				return Promise.resolve(oReadResult0);
			});

		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 4,
				sinon.match.same(oGroupLevelCache), 1)
			.callThrough(); // so that oCache.aElements is actually filled

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
				read : function () {}
			},
			oGroupLevelCacheMock = this.mock(oGroupLevelCache),
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
		oCache.aElements.$count = 42;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		oGroupLevelCacheMock.expects("read")
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
			.callThrough(); // so that oCache.aElements is actually filled
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
				read : function () {}
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

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns("~oGroupLockCopy~");
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy~", "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate a collapse
				oCache.aElements.splice(2, 3);
				oCache.aElements.$count = 42;

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
	QUnit.test("read: with visual grouping - two different group level caches", function (assert) {
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
				read : function () {}
			},
			oGroupLevelCache1 = {
				read : function () {}
			},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oReadPromise,
			oReadResult0 = {value : [{}, {}]},
			oReadResult1 = {value : [{}, {}]};

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

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy0~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns("~oGroupLockCopy1~");
		var oUnlockCall = oGroupLockMock.expects("unlock").withExactArgs();

		this.mock(oGroupLevelCache0).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy0~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));

		this.mock(oGroupLevelCache1).expects("read")
			.withExactArgs(1, 2, 0, "~oGroupLockCopy1~", "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2,
				sinon.match.same(oGroupLevelCache0), 1)
			.callThrough(); // so that oCache.aElements is actually filled

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 6,
				sinon.match.same(oGroupLevelCache1), 1)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		oReadPromise = oCache.read(1, 7, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
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

		sinon.assert.called(oUnlockCall);

		return oReadPromise;
	});

	//*********************************************************************************************
	QUnit.test("read: with visual grouping - only placeholder", function (assert) {
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
			.callThrough(); // so that oCache.aElements is actually filled

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
	QUnit.test("read: with visual grouping - read more elements than existing", function (assert) {
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
			.callThrough(); // so that oCache.aElements is actually filled

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
	QUnit.test("expand: read; has cache = " + vHasCache, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			aElements = [{
				"@$ui5.node.isExpanded" : vHasCache === "expanding",
				"@$ui5.node.level" : 0
			}, {}, {}],
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
			oPromise,
			oUpdateAllExpectation,
			that = this;

		oExpandResult.value.$count = 7;
		if (vHasCache) {
			_Helper.setPrivateAnnotation(oGroupNode, "cache", oGroupLevelCache);
		}

		// simulate a read
		oCache.iReadLength = 42;
		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 3;

		this.mock(oCache).expects("fetchValue").exactly(vHasCache === "expanding" ? 0 : 1)
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oGroupNode));
		oUpdateAllExpectation = this.mock(_Helper).expects("updateAll")
			.exactly(vHasCache === "expanding" ? 0 : 1)
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oGroupNode), {"@$ui5.node.isExpanded" : true})
			.callThrough(); // "@$ui5.node.isExpanded" is checked once read has finished
		this.mock(oCache).expects("createGroupLevelCache").exactly(vHasCache ? 0 : 1)
			.withExactArgs(sinon.match.same(oGroupNode))
			.returns(oGroupLevelCache);
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oExpandResult.value), 1,
				sinon.match.same(oGroupLevelCache), 0)
			.callThrough(); // so that oCache.aElements is actually filled
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(1, 5, sinon.match.same(oGroupLevelCache)).returns("~placeholder~1");
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(1, 6, sinon.match.same(oGroupLevelCache)).returns("~placeholder~2");

		// code under test
		oPromise = oCache.expand(oGroupLock, vHasCache === "expanding" ? oGroupNode : "~path~")
		.then(function (iResult) {
			assert.strictEqual(iResult, oExpandResult.value.$count);

			assert.strictEqual(oCache.aElements.length, 10, ".length");
			assert.strictEqual(oCache.aElements.$count, 10, ".$count");
			// check parent node
			assert.strictEqual(oCache.aElements[0], oGroupNode);
			assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "cache"), oGroupLevelCache);

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
			assert.strictEqual(oCache.aElements[8], aElements[1]);
			assert.strictEqual(oCache.aElements[9], aElements[2]);

			that.mock(oCache.oFirstLevel).expects("read").never();

			return oCache.read(1, 4, 0, oGroupLock).then(function (oResult) {
				assert.strictEqual(oResult.value.length, 4);
				assert.strictEqual(oResult.value.$count, 10);
				oResult.value.forEach(function (oElement, i) {
					assert.strictEqual(oElement, oCache.aElements[i + 1], "index " + (i + 1));
				});
			});
		});

		oUpdateAllExpectation.verify();

		return oPromise;
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
			.withExactArgs(sinon.match.same(oGroupNode))
			.returns(oGroupLevelCache);
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oExpandResult.value), 3,
				sinon.match.same(oGroupLevelCache), 0)
			.callThrough(); // so that oCache.aElements is actually filled
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(1, 5, sinon.match.same(oGroupLevelCache)).returns("~placeholder~1");
		oAggregationHelperMock.expects("createPlaceholder")
			.withExactArgs(1, 6, sinon.match.same(oGroupLevelCache)).returns("~placeholder~2");

		// code under test
		oPromise = oCache.expand(oGroupLock, "~path~").then(function (iResult) {
			assert.strictEqual(iResult, oExpandResult.value.$count);

			assert.strictEqual(oCache.aElements.length, 10, ".length");
			assert.strictEqual(oCache.aElements.$count, 10, ".$count");
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
			oPromise,
			aSpliced = oGroupNode["@$ui5._" ].spliced.slice(),
			oUpdateAllExpectation;

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
		oCacheMock.expects("expand")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sinon.match.same(aSpliced[2]))
			.returns(SyncPromise.resolve(100));

		// code under test
		oPromise = oCache.expand(oGroupLock, "~path~").then(function (iResult) {
			assert.strictEqual(iResult, 100 + 3);

			assert.strictEqual(oCache.aElements.length, 7, ".length");
			assert.strictEqual(oCache.aElements.$count, 7, ".$count");
			assert.strictEqual(oCache.aElements[0], aElements[0]);
			// check parent node
			assert.strictEqual(oCache.aElements[1], oGroupNode);
			assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "cache"), oGroupLevelCache);
			assert.notOk(_Helper.hasPrivateAnnotation(oGroupNode, "spliced"));

			// check expanded nodes
			assert.strictEqual(oCache.aElements[2], aSpliced[0]);
			assert.strictEqual(oCache.aElements[3], aSpliced[1]);
			assert.strictEqual(oCache.aElements[4], aSpliced[2]);
			assert.notOk(_Helper.hasPrivateAnnotation(aSpliced[2], "expanding"));

			// check moved nodes
			assert.strictEqual(oCache.aElements[5], aElements[2]);
			assert.strictEqual(oCache.aElements[6], aElements[3]);

			assert.deepEqual(oCache.aElements.$byPredicate, {
				"('A')" : aSpliced[0],
				"('C')" : aSpliced[2]
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
				that.mock(_Helper).expects("updateAll")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
						sinon.match.same(oGroupNode), {"@$ui5.node.isExpanded" : false});

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
	QUnit.test("collapse: until end = " + bUntilEnd, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			aElements = [{
				// "@$ui5._" : {predicate : "('0')"},
				// "@$ui5.node.level" : ignored
			}, {
				"@$ui5._" : {predicate : "('1')"},
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.level" : 5
			}, {
				"@$ui5._" : {predicate : "('2')"},
				"@$ui5.node.level" : 6 // child
			}, {
				"@$ui5._" : {predicate : "('3')"},
				"@$ui5.node.level" : 7 // grandchild
			}, {
				"@$ui5._" : {predicate : "('4')"},
				"@$ui5.node.level" : bUntilEnd ? 6 : 5 // child or sibling (or "uncle" etc.)
			}],
			aExpectedElements = [{
				// "@$ui5._" : {predicate : "('0')"},
				// "@$ui5.node.level" : ignored
			}, {
				"@$ui5._" : {
					predicate : "('1')",
					spliced : [aElements[2], aElements[3], aElements[4]]
				},
				"@$ui5.node.isExpanded" : false,
				"@$ui5.node.level" : 5
			}, {
				"@$ui5._" : {predicate : "('4')"},
				"@$ui5.node.level" : 5 // sibling
			}];

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
				sinon.match.same(aElements[1]), {"@$ui5.node.isExpanded" : false})
			.callThrough();

		// code under test
		assert.strictEqual(oCache.collapse("~path~"), bUntilEnd ? 3 : 2,
			"number of removed elements");

		if (bUntilEnd) { // last element was also a child, not a sibling
			aExpectedElements.pop();
		} else {
			aExpectedElements[1]["@$ui5._"].spliced.pop();
		}
		assert.deepEqual(oCache.aElements, aExpectedElements);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], aElements[1]);
		assert.strictEqual(oCache.aElements[2], bUntilEnd ? undefined : aElements[4]);
		assert.strictEqual(oCache.aElements.$count, aExpectedElements.length);
		assert.deepEqual(oCache.aElements.$byPredicate, bUntilEnd
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

	//*********************************************************************************************
	QUnit.test("collapse: at end", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			aElements = [{
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.level" : 5
			}];

		oCache.aElements = aElements.slice(); // simulate a read
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(aElements[0]));
		this.mock(_Helper).expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(aElements[0]), {"@$ui5.node.isExpanded" : false})
			.callThrough();

		// code under test
		assert.strictEqual(oCache.collapse("~path~"), 0, "number of removed elements");

		assert.deepEqual(oCache.aElements, [{
			"@$ui5._" : {
				spliced : []
			},
			"@$ui5.node.isExpanded" : false,
			"@$ui5.node.level" : 5
		}]);
		assert.strictEqual(oCache.aElements[0], aElements[0]);
	});

	//*********************************************************************************************
	QUnit.test("addElements", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group: {},
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
	QUnit.test("addElements: wrong placeholder", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group: {},
				groupLevels : ["foo"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", "", oAggregation, {}),
			oGroupLevelCache = {};

			// Note: no need to check for level as well, because oGroupLevelCache belongs to a
			// specific level!
			oCache.aElements = [,
				_AggregationHelper.createPlaceholder(NaN, 42, oGroupLevelCache),
				_AggregationHelper.createPlaceholder(NaN, 43, oGroupLevelCache)
			];
			oCache.aElements.$byPredicate = {};

			assert.throws(function () {
				// code under test
				oCache.addElements([{}, {}], 0, oGroupLevelCache, 42); // 41 would be right
			}, new Error("Wrong placeholder"));

			assert.throws(function () {
				// code under test (Note: do not try to overwrite again!)
				oCache.addElements([{}], 2, {/*wrong cache*/}, 43);
			}, new Error("Wrong placeholder"));
		});

	//*********************************************************************************************
	QUnit.test("addElements: unexpected element", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group: {},
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
				group: {},
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
});
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_AggregationCache",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, _AggregationCache, _AggregationHelper, _Cache, _GroupLock, _Helper) {
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
	QUnit.test("filterAggregation - optional group entry", function (assert) {
		var oAggregation = {
				aggregate : {
					MeasureWithoutTotal : {},
					MeasureWithTotal : {subtotals : true}
				},
				group : {
					// GroupedDimension : {},
					UngroupedDimension : {}
				},
				groupLevels : ["GroupedDimension"]
			};

		assert.deepEqual(_AggregationCache.filterAggregation(oAggregation, 1), {
			aggregate : {
				MeasureWithTotal : {subtotals : true}
			},
			group : {},
			groupLevels : ["GroupedDimension"],
			$groupBy : ["GroupedDimension"],
			$missing : ["UngroupedDimension", "MeasureWithoutTotal"]
		});
	});

	//*********************************************************************************************
[{
	iLevel : 1,
	oResult : {
		aggregate : {
			MeasureWithTotal : {subtotals : true}
		},
		group : {},
		groupLevels : ["GroupedDimension1"],
		$groupBy : ["GroupedDimension1"],
		$missing : ["GroupedDimension2", "UngroupedDimension1", "UngroupedDimension2",
			"MeasureWithoutTotal"]
	}
}, {
	iLevel : 2,
	oResult : {
		aggregate : {
			MeasureWithTotal : {subtotals : true}
		},
		group : {},
		groupLevels : ["GroupedDimension2"],
		$groupBy : ["GroupedDimension1", "GroupedDimension2"],
		$missing : ["UngroupedDimension1", "UngroupedDimension2", "MeasureWithoutTotal"]
	}
}, {
	iLevel : 3,
	oResult : {
		aggregate : {
			MeasureWithoutTotal : {},
			MeasureWithTotal : {subtotals : true}
		},
		group : {
			UngroupedDimension1 : {},
			UngroupedDimension2 : {}
		},
		groupLevels : [],
		$groupBy : ["GroupedDimension1", "GroupedDimension2", "UngroupedDimension1",
			"UngroupedDimension2"],
		$missing : []
	}
}].forEach(function (oFixture) {
	QUnit.test("filterAggregation: level " + oFixture.iLevel, function (assert) {
		var oAggregation = {
				aggregate : {
					MeasureWithoutTotal : {},
					MeasureWithTotal : {subtotals : true}
				},
				group : { // intentionally in this order to test sorting
					UngroupedDimension2 : {},
					UngroupedDimension1 : {},
					GroupedDimension1 : {}
				},
				groupLevels : ["GroupedDimension1", "GroupedDimension2"]
			};

		assert.deepEqual(
			_AggregationCache.filterAggregation(oAggregation, oFixture.iLevel),
			oFixture.oResult
		);
	});
});

	//*********************************************************************************************
	QUnit.test("filterOrderby", function (assert) {
		var oAggregation = {
				aggregate : {
					Measure : {}
				},
				group : {
					Dimension : {}
				},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			oAggregationWithLevels = {
				aggregate : {},
				group : {},
				groupLevels : ["Dimension"]
			};

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("Dimension %20desc%2COtherDimension asc", oAggregation),
			"Dimension %20desc");

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("Dimension\tdesc,OtherDimension asc", oAggregation),
			"Dimension\tdesc");

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("Dimension desc", oAggregationWithLevels),
			"Dimension desc");

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("Measure desc%2cDimension", oAggregation),
			"Measure desc,Dimension");

		// code under test
		assert.strictEqual(_AggregationCache.filterOrderby(undefined, {}), undefined);

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("NavigationProperty/$count", []),
			"NavigationProperty/$count");
	});
	//TODO Also support orderbyItems that start with a type cast?
	// See "11.2.5.2 System Query Option $orderby":
	// "A special case of such an expression is a property path terminating on a primitive property.
	// A type cast using the qualified entity type name is required to order by a property defined
	// on a derived type."
	//
	// ABNF:
	// orderby     = '$orderby' EQ orderbyItem *( COMMA orderbyItem )
	// orderbyItem = commonExpr [ RWS ( 'asc' / 'desc' ) ]
	// commonExpr = (... / firstMemberExpr / ...)[...]
	// firstMemberExpr = memberExpr / inscopeVariableExpr [ "/" memberExpr ]
	// memberExpr = [ qualifiedEntityTypeName "/" ] ( propertyPathExpr / boundFunctionExpr )
	// inscopeVariableExpr : not supported
	// boundFunctionExpr : not supported
	// qualifiedEntityTypeName = odataIdentifier 1*( "." odataIdentifier )
	// propertyPathExpr : /-separated path of odataIdentifier or qualified names;
	//   otherwise not supported (e.g. $count)
	// complexProperty : probably not supported by current service implementations

	//*********************************************************************************************
	QUnit.test("create with min/max", function (assert) {
		var mAlias2MeasureAndMethod,
			oAggregation = {
				aggregate : {},
				group : {},
				// Note: ODLB#updateAnalyticalInfo called _AggregationHelper.buildApply
				groupLevels : []
			},
			sAggregation = JSON.stringify(oAggregation),
			oAggregationCacheMock = this.mock(_AggregationCache),
			sApply = "A.P.P.L.E.",
			oCache,
			iEnd = 13,
			fnGetResourcePath = function () {},
			fnHandleResponse = function () {},
			oFirstLevelCache = {
				getResourcePath : fnGetResourcePath,
				handleResponse : fnHandleResponse
			},
			mMeasureRange = {},
			bMeasureRangePromiseResolved = false,
			mQueryOptions = {
				$apply : "bar",
				$count : {/*true or false*/},
				$filter : "baz",
				$orderby : "X desc",
				"sap-client" : "123"
			},
			sQueryOptions = JSON.stringify(mQueryOptions),
			sResourcePath = "Foo",
			aResult = [],
			iStart = 0;

		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(true);
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(mQueryOptions), {})
			.callsFake(function (oAggregation, mQueryOptions, mAlias2MeasureAndMethod0) {
				mAlias2MeasureAndMethod = mAlias2MeasureAndMethod0;
				mQueryOptions = Object.assign({}, mQueryOptions);
				delete mQueryOptions.$filter;
				delete mQueryOptions.$orderby;
				mQueryOptions.$apply = sApply;
				return mQueryOptions;
			});
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oRequestor), sResourcePath, {
					$apply : sApply,
					$count : sinon.match.same(mQueryOptions.$count),
					"sap-client" : "123"
				}, true)
			.returns(oFirstLevelCache);
		// getResourcePath and handleResponse need to be mocked before an _AggregationCache
		// instance is created
		oAggregationCacheMock.expects("getResourcePath")
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(mQueryOptions), iStart,
				iEnd)
			.on(oFirstLevelCache);
		oAggregationCacheMock.expects("handleResponse")
			.withExactArgs(null, sinon.match(function (mAlias2MeasureAndMethod0) {
					assert.strictEqual(mAlias2MeasureAndMethod0, mAlias2MeasureAndMethod);
					return mAlias2MeasureAndMethod0 === mAlias2MeasureAndMethod;
				}), sinon.match.func, sinon.match.same(fnHandleResponse), iStart, iEnd,
				sinon.match.same(aResult))
			.on(oFirstLevelCache)
			.callsArgWith(2, mMeasureRange);

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, oAggregation,
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
		assert.ok(oCache.oMeasureRangePromise instanceof Promise);
		assert.strictEqual(oCache.getMeasureRangePromise(), oCache.oMeasureRangePromise);
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptions, "not modified");
		assert.strictEqual(JSON.stringify(oAggregation), sAggregation, "not modified");
		assert.strictEqual(oCache.oFirstLevel, oFirstLevelCache);
		assert.notEqual(oCache.oFirstLevel.getResourcePath, fnGetResourcePath, "replaced");
		assert.notEqual(oCache.oFirstLevel.handleResponse, fnHandleResponse, "replaced");

		oCache.oMeasureRangePromise.then(function (mMeasureRange0) {
			bMeasureRangePromiseResolved = true;
		});

		return Promise.resolve().then(function () {
			assert.notOk(bMeasureRangePromiseResolved, "measure range promise is unresolved");

			// code under test
			oCache.oFirstLevel.getResourcePath(iStart, iEnd);

			// code under test
			oCache.oFirstLevel.handleResponse(iStart, iEnd, aResult);

			return oCache.oMeasureRangePromise.then(function (mMeasureRange0) {
				assert.strictEqual(mMeasureRange0, mMeasureRange, "mMeasureRange");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("create: $expand not allowed", function (assert) {
		var oAggregation = {/*irrelevant*/},
			mQueryOptions = {$expand : undefined}; // even falsy values are forbidden!

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: $expand"));
	});

	//*********************************************************************************************
	QUnit.test("create: $select not allowed", function (assert) {
		var oAggregation = {/*irrelevant*/},
			mQueryOptions = {$select : undefined}; // even falsy values are forbidden!

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", oAggregation, mQueryOptions);
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
			_AggregationCache.create(this.oRequestor, "Foo", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: $count"));
	});

	//*********************************************************************************************
	QUnit.test("create: $filter not allowed with visual grouping", function (assert) {
		var oAggregation = {groupLevels : ["BillToParty"]},
			mQueryOptions = {$filter : "answer eq 42"};

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", oAggregation, mQueryOptions);
		}, new Error("Unsupported system query option: $filter"));
	});
	//TODO if we allow filtering, do we need to filter $filter by current level, like $orderby?

	//*********************************************************************************************
	QUnit.test("create: groupLevels not allowed with min/max", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {},
				groupLevels : ["BillToParty"]
			};

		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(true);

		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", oAggregation, {/*mQueryOptions*/});
		}, new Error("Unsupported group levels together with min/max"));
	});

	//*********************************************************************************************
	QUnit.test("create: grandTotal", function (assert) {
		var oAggregation = {
				aggregate : {
					SalesNumber : {grandTotal : true}
				},
				group : {
					Region : {}
				},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			sAggregation = JSON.stringify(oAggregation),
			oAggregationCacheMock = this.mock(_AggregationCache),
			oCache,
			fnDataRequested = {},
			iEnd = 13,
			fnGetResourcePath = function () {},
			oGroupLock = {},
			fnHandleResponse = function () {},
			oFirstLevelCache = {
				getResourcePath : fnGetResourcePath,
				handleResponse : fnHandleResponse,
				read : function () {}
			},
			mQueryOptions = {},
			sQueryOptions = JSON.stringify(mQueryOptions),
			sResourcePath = "BusinessPartner",
			aResult = [],
			iStart = 7;

		this.mock(_AggregationHelper).expects("hasMinOrMax")
			.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(false);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), true)
			.returns(oFirstLevelCache);
		// getResourcePath and handleResponse need to be mocked before an _AggregationCache
		// instance is created
		oAggregationCacheMock.expects("getResourcePath")
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(mQueryOptions), iStart,
				iEnd)
			.on(oFirstLevelCache);
		oAggregationCacheMock.expects("handleResponse")
			.withExactArgs(sinon.match.same(oAggregation), null, null,
				sinon.match.same(fnHandleResponse), iStart, iEnd, sinon.match.same(aResult))
			.on(oFirstLevelCache);

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, oAggregation,
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
		assert.notEqual(oCache.oFirstLevel.getResourcePath, fnGetResourcePath, "replaced");
		assert.notEqual(oCache.oFirstLevel.handleResponse, fnHandleResponse, "replaced");

		// code under test
		oCache.oFirstLevel.getResourcePath(iStart, iEnd);

		// code under test
		oCache.oFirstLevel.handleResponse(iStart, iEnd, aResult);

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
		});
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oAggregation = { // Note: properties added by _AggregationHelper.buildApply before
				aggregate : {},
				group : {},
				groupLevels : []
			},
			mQueryOptions = {},
			mQueryOptionsWithApply = {},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", oAggregation, mQueryOptions);

		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(mQueryOptions))
			.returns(mQueryOptionsWithApply);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Foo", sinon.match.same(mQueryOptionsWithApply), false, true)
			.returns("?foo=bar");

		assert.strictEqual(oCache.toString(), "/~/Foo?foo=bar");
	});

	//*********************************************************************************************
	QUnit.test("getResourcePath", function (assert) {
		var oAggregation = {},
			oAggregationHelperMock = this.mock(_AggregationHelper),
			bCount = "/*false,true*/", // dummy value suitable for deepEqual()
			oFirstLevelCache = {
				sMetaPath : "/meta/path",
				oRequestor : {
					buildQueryString : function () {}
				},
				sResourcePath : "SalesOrderList"
			},
			mQueryOptions = {$count : bCount, "sap-client" : "123"},
			sQueryOptionsJSON = JSON.stringify(mQueryOptions),
			mQueryOptionsWithApply = {},
			oRequestorMock = this.mock(oFirstLevelCache.oRequestor),
			sResourcePath;

		oAggregationHelperMock.expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), {
				$count : bCount, $skip : 42, $top : 57, "sap-client" : "123"
			}, null, undefined)
			.returns(mQueryOptionsWithApply);
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, sinon.match.same(mQueryOptionsWithApply),
				false, true)
			.returns("?$apply=1st");

		// code under test
		sResourcePath = _AggregationCache.getResourcePath.call(oFirstLevelCache,
			oAggregation, mQueryOptions, 42, 99);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=1st");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON,
			"unmodified");
		assert.strictEqual(oFirstLevelCache.bFollowUp, true, "next request is a follow-up");


		oAggregationHelperMock.expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregation), {
				$count : bCount, $skip : 42, $top : 57, "sap-client" : "123"
			}, null, true)
			.returns(mQueryOptionsWithApply);
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oFirstLevelCache.sMetaPath, sinon.match.same(mQueryOptionsWithApply),
				false, true)
			.returns("?$apply=2nd");

		// code under test
		sResourcePath = _AggregationCache.getResourcePath.call(oFirstLevelCache,
			oAggregation, mQueryOptions, 42, 99);

		assert.strictEqual(sResourcePath, "SalesOrderList?$apply=2nd");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON,
			"unmodified");
		assert.strictEqual(oFirstLevelCache.bFollowUp, true, "next request is still a follow-up");
	});

	//*********************************************************************************************
	QUnit.test("handleResponse: with min/max ", function (assert) {
		var mAlias2MeasureAndMethod = {
				"UI5min__MinAndMax" : {
					measure : "MinAndMax",
					method : "min"
				},
				"UI5max__MinAndMax" : {
					measure : "MinAndMax",
					method : "max"
				},
				"UI5min__OnlyMin" : {
					measure : "OnlyMin",
					method : "min"
				},
				"UI5max__OnlyMax" : {
					measure : "OnlyMax",
					method : "max"
				}
			},
			oFirstLevelCache = {
				handleResponse : function () {}
			},
			aGetDataRecords,
			fnHandleResponse = sinon.stub(),
			mMeasureRange = {
				MinAndMax : {
					min : 3,
					max : 99
				},
				OnlyMin : {
					min : 7
				},
				OnlyMax : {
					max : 10
				}
			},
			fnMeasureRangeResolve = sinon.stub(),
			oResponseRecord = {},
			oResult = { /*GET response*/
				value : [
					{
						"@odata.id": null,
						"UI5min__MinAndMax" : 3,
						"UI5max__MinAndMax" : 99,
						"UI5min__OnlyMin" : 7,
						"UI5max__OnlyMax" : 10,
						"UI5__count" : "42",
						"UI5__count@odata.type": "#Decimal"
					},
					oResponseRecord
				]
			},
			mTypeForMetaPath = {/*fetchTypes result*/},
			iStart = 0,
			iEnd = 10;

		// code under test
		_AggregationCache.handleResponse.call(
			oFirstLevelCache, null, mAlias2MeasureAndMethod, fnMeasureRangeResolve,
			fnHandleResponse, iStart, iEnd, oResult, mTypeForMetaPath);

		assert.strictEqual(oFirstLevelCache.handleResponse, fnHandleResponse, "restored");
		assert.strictEqual(fnHandleResponse.callCount, 1);
		assert.ok(fnHandleResponse.calledWith(iStart, iEnd, sinon.match.same(oResult),
			sinon.match.same(mTypeForMetaPath)));
		assert.strictEqual(oResult["@odata.count"], "42");
		assert.strictEqual(fnMeasureRangeResolve.callCount, 1);
		assert.deepEqual(fnMeasureRangeResolve.args[0][0], mMeasureRange, "mMeasureRange");
		aGetDataRecords = fnHandleResponse.args[0][2]/*oResults*/.value;
		assert.strictEqual(aGetDataRecords.length, 1);
		assert.strictEqual(aGetDataRecords[0], oResponseRecord);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCount) {
		var sTitle = "handleResponse: without min/max, without visual grouping; $count : " + bCount;

		QUnit.test(sTitle, function (assert) {
			var oAggregation = {
					aggregate : {
						SalesAmountSum : {
							grandTotal : true,
							name : "SalesAmount",
							"with" : "sap.unit_sum"
						},
						SalesNumber : {}
					},
					group : {
						Country : {},
						Region : {},
						Segment : {}
					},
					groupLevels : [] // Note: added by _AggregationHelper.buildApply before
				},
				oExpected = {},
				oFirstLevelCache = {
					handleResponse : _AggregationCache.handleResponse
				},
				fnHandleResponse = sinon.stub(),
				oResult = { /*GET response*/
					value : [{
						"@odata.id" : null,
						"UI5grand__SalesAmountSum" : 351,
						"UI5grand__SalesAmountSum@Analytics.AggregatedAmountCurrency": "EUR",
						"UI5grand__SalesAmountSum@odata.type" : "#Decimal"
					}, {
					}]
				},
				mTypeForMetaPath = {/*fetchTypes result*/},
				iStart = 0,
				iEnd = 10;

			if (bCount) {
				oResult.value[0]["UI5__count"] = "26";
				oResult.value[0]["UI5__count@odata.type"] = "#Decimal";
			}
			Object.assign(oExpected, oResult.value[0], {
				"@$ui5.node.isExpanded" : true,
				"@$ui5.node.isTotal" : true,
				"@$ui5.node.level" : 0,
				Country : null, // avoid "Failed to drill-down"
				Region : null, // avoid "Failed to drill-down"
				SalesNumber : null, // avoid "Failed to drill-down"
				SalesAmountSum : 351,
				"SalesAmountSum@Analytics.AggregatedAmountCurrency": "EUR",
				"SalesAmountSum@odata.type" : "#Decimal",
				Segment : null // avoid "Failed to drill-down"
			});

			// code under test
			_AggregationCache.handleResponse.call(oFirstLevelCache, oAggregation, null, null,
				fnHandleResponse, iStart, iEnd, oResult, mTypeForMetaPath);

			assert.strictEqual(oFirstLevelCache.handleResponse, _AggregationCache.handleResponse,
				"still replaced");
			assert.strictEqual(fnHandleResponse.callCount, 1);
			assert.ok(fnHandleResponse.calledWith(iStart, iEnd, sinon.match.same(oResult),
				sinon.match.same(mTypeForMetaPath)));
			if (bCount) {
				assert.strictEqual(oFirstLevelCache.iLeafCount, 26,
					"leaf $count w/o grand total row");
				// Note: it is OK to transform string into number here
				assert.strictEqual(oResult["@odata.count"], bCount ? 27 : undefined,
					"count includes grand total row");
			} else {
				assert.notOk("iLeafCount" in oFirstLevelCache, "iLeafCount");
				assert.notOk("@odata.count" in oResult, "@odata.count");
			}
			assert.strictEqual(oResult.value.length, 2, "data still includes grand total row");
			assert.deepEqual(oResult.value[0], oExpected);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCount) {
		var sTitle = "handleResponse: without min/max, without visual grouping; "
				+ "without grand total; $count : " + bCount;

		QUnit.test(sTitle, function (assert) {
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
				oFirstLevelCache = {
					handleResponse : _AggregationCache.handleResponse
				},
				fnHandleResponse = sinon.stub(),
				oResult = { /*GET response*/
					value : [
						bCount
							? {"UI5__count": "26", "UI5__count@odata.type": "#Decimal"}
							: {Country : "Country", Region : "Region", Segment : "Segment"}
					]
				},
				mTypeForMetaPath = {/*fetchTypes result*/},
				iStart = 1,
				iEnd = 10;

			// code under test
			_AggregationCache.handleResponse.call(oFirstLevelCache, oAggregation, null, null,
				fnHandleResponse, iStart, iEnd, oResult, mTypeForMetaPath);

			assert.strictEqual(oFirstLevelCache.handleResponse, _AggregationCache.handleResponse,
				"still replaced");
			assert.strictEqual(fnHandleResponse.callCount, 1);
			assert.ok(fnHandleResponse.calledWith(iStart, iEnd, sinon.match.same(oResult),
				sinon.match.same(mTypeForMetaPath)));
			if (bCount) {
				assert.strictEqual(oFirstLevelCache.iLeafCount, 26,
					"leaf $count w/o grand total row");
				// Note: it is OK to transform string into number here
				assert.strictEqual(oResult["@odata.count"], bCount ? 27 : undefined,
					"count includes grand total row");
				assert.strictEqual(oResult.value.length, 0, "data does not include count row");
			} else {
				assert.notOk("iLeafCount" in oFirstLevelCache, "iLeafCount");
				assert.notOk("@odata.count" in oResult, "@odata.count");
				assert.strictEqual(oResult.value.length, 1, "no data row dropped");
				assert.deepEqual(oResult.value[0],
					{Country : "Country", Region : "Region", Segment : "Segment"});
			}
		});
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

		oCache = _AggregationCache.create(this.oRequestor, "Foo", oAggregation, mQueryOptions);

		if (oFixture.total) {
			oFilteredAggregation.aggregate.x = {subtotal : true};
		}
		this.mock(_AggregationCache).expects("filterAggregation")
			.withExactArgs(sinon.match.same(oCache.oAggregation), iLevel)
			.returns(oFilteredAggregation);
		this.mock(_AggregationCache).expects("filterOrderby")
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
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, oAggregation,
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
			oCache = _AggregationCache.create(this.oRequestor, "Foo", oAggregation, {});

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
			oCache = _AggregationCache.create(this.oRequestor, "Foo", oAggregation, {}),
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
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			oCache = _AggregationCache.create(this.oRequestor, "Foo", oAggregation, {}),
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
			oCache = _AggregationCache.create(this.oRequestor, "Foo", oAggregation, {
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
	[false, true].forEach(function (bCount) {
		QUnit.test("read, fetchValue: with min/max; $count : " + bCount, function (assert) {
			var oAggregation = {
					aggregate : {},
					group : {},
					// Note: ODLB#updateAnalyticalInfo called _AggregationHelper.buildApply
					groupLevels : []
				},
				oCache,
				oElement = {},
				oGroupLock = {},
				oPromise,
				oResult = {
					value : [oElement]
				},
				oReadPromise = Promise.resolve(oResult),
				that = this;

			this.mock(_AggregationHelper).expects("hasMinOrMax")
				.withExactArgs(sinon.match.same(oAggregation.aggregate)).returns(true);
			oCache
				= _AggregationCache.create(this.oRequestor, "~", oAggregation, {$count : bCount});
			this.mock(oCache.oFirstLevel).expects("read").on(oCache.oFirstLevel)
				.withExactArgs(0, 10, 0, undefined, undefined)
				.returns(oReadPromise);

			// code under test
			oPromise = oCache.read(0, 10, 0);

			return oPromise.then(function (oResult) {
				var fnDataRequested = {},
					oListener = {},
					vResult = {};

				assert.strictEqual(oResult.value[0], oElement);
				assert.notOk("@$ui5.node.isExpanded" in oElement, "no @$ui5.node...");
				assert.notOk("@$ui5.node.isTotal" in oElement);
				assert.notOk("@$ui5.node.level" in oElement);

				if (bCount) {
					that.mock(oCache.oFirstLevel).expects("fetchValue").on(oCache.oFirstLevel)
						.withExactArgs(sinon.match.same(oGroupLock), "$count",
							sinon.match.same(fnDataRequested), sinon.match.same(oListener))
						.returns(SyncPromise.resolve(vResult));
				} else {
					that.oLogMock.expects("error")
						.withExactArgs("Failed to drill-down into $count, invalid segment: $count",
							oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");
				}

				// code under test
				return oCache.fetchValue(oGroupLock, "$count", fnDataRequested, oListener)
					.then(function (vResult0) {
						assert.strictEqual(vResult0, bCount ? vResult : undefined);
					});
			});
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
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			oGroupLock = {
				unlock : function () {}
			},
			iLength = 3,
			iPrefetchLength = 100,
			oReadResult = {
				value : [{}, {}, {}]
			};

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
			.withExactArgs(sinon.match.same(oReadResult.value), iReadIndex)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(iReadIndex, iLength, iPrefetchLength, oGroupLock,
				"~fnDataRequested~")
			.then(function (oResult1) {
				var i;

				assert.strictEqual(oCache.aElements.$count, oReadResult.value.$count);
				assert.strictEqual(oCache.iReadLength, iLength + iPrefetchLength);

				checkResult(oResult1);

				// check placeholder before iReadIndex
				for (i = 0; i < iReadIndex; i += 1) {
					assert.strictEqual(
						_Helper.getPrivateAnnotation(oCache.aElements[i], "index"), i);
					assert.strictEqual(
						_Helper.getPrivateAnnotation(oCache.aElements[i], "parent"),
						oCache.oFirstLevel
					);
				}
				// check placeholder after iReadIndex + result length
				for (i = iReadIndex + 3; i < oCache.aElements.length; i += 1) {
					assert.strictEqual(
						_Helper.getPrivateAnnotation(oCache.aElements[i], "index"), i);
					assert.strictEqual(
						_Helper.getPrivateAnnotation(oCache.aElements[i], "parent"),
						oCache.oFirstLevel
					);
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
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLevelCacheMock = this.mock(oGroupLevelCache),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockCopy0 = {},
			oGroupLockCopy1 = {},
			oGroupLockMock = this.mock(oGroupLock),
			oCacheMock = this.mock(oCache),
			oReadResult0 = {value : [{}]},
			oReadResult1 = {value : [{},{},{}]};


		oCache.aElements = [
			{/* expanded node */},
			{/* first leaf */},
			{"@$ui5._": {index : 1, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 2, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 3, parent : oGroupLevelCache}},
			{/* other node */}
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy0);

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 1, 0, sinon.match.same(oGroupLockCopy0), "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(2, 1, 0, oGroupLock, "~fnDataRequested~").then(function (oResult1) {
			assert.strictEqual(oResult1.value[0], oReadResult0.value[0]);

			oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy1);

			oGroupLevelCacheMock.expects("read")
				.withExactArgs(2, 2, 0, sinon.match.same(oGroupLockCopy1), "~fnDataRequested~")
				.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));

			oCacheMock.expects("addElements")
				.withExactArgs(sinon.match.same(oReadResult1.value), 3)
				.callThrough(); // so that oCache.aElements is actually filled

			// code under test
			return oCache.read(3, 3, 0, oGroupLock, "~fnDataRequested~");
		}).then(function (oResult2) {
			assert.strictEqual(oResult2.value[0], oReadResult1.value[0]);
			assert.strictEqual(oResult2.value[1], oReadResult1.value[1]);
			assert.strictEqual(oResult2.value[2], oReadResult1.value[2]);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: with visual grouping - first and group level cache", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			oFirstLeaf = {},
			oGroupLevelCache = {read : function () {}},
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockCopy0 = {},
			oGroupLockCopy1 = {},
			oGroupLockMock = this.mock(oGroupLock),
			oReadResult0 = {value : [{}, {}]},
			oReadResult1 = {value : [{}]},
			oCacheMock = this.mock(oCache);

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf,
			{"@$ui5._": {index : 1, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 2, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 1, parent : oCache.oFirstLevel}}
		];

		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy0);
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy1);

		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(1, 2, 0, sinon.match.same(oGroupLockCopy0),	"~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));

		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(1, 1, 0, sinon.match.same(oGroupLockCopy1),	"~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2)
			.callThrough(); // so that oCache.aElements is actually filled

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 4)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(1, 4, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value[0], oFirstLeaf);
			assert.strictEqual(oResult.value[1], oReadResult0.value[0]);
			assert.strictEqual(oResult.value[2], oReadResult0.value[1]);
			assert.strictEqual(oResult.value[3], oReadResult1.value[0]);

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
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
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
			oGroupLockCopy0 = {},
			oGroupLockCopy1 = {},
			oGroupLockMock = this.mock(oGroupLock),
			oReadSameNode = {},
			oReadResult0 = {value : [{}, oReadSameNode, {}, {}]},
			oReadResult1 = {value : [oReadSameNode]};

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf,
			{"@$ui5._": {index : 1, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 2, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 3, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 4, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 5, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 6, parent : oGroupLevelCache}}
		];

		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy0);
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy1);
		oGroupLockMock.expects("unlock").withExactArgs().twice();

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 3, 0, sinon.match.same(oGroupLockCopy0), "~fnDataRequested~")
			.callsFake(function () {
				return new Promise(function (resolve) {
					setTimeout(resolve(oReadResult0), 500);
				});
			});

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(2, 1, 0, sinon.match.same(oGroupLockCopy1), "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2)
			.callThrough(); // so that oCache.aElements is actually filled

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 3)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return Promise.all([
			oCache.read(1, 4, 0, oGroupLock, "~fnDataRequested~"),
			oCache.read(3, 1, 0, oGroupLock, "~fnDataRequested~")
		]).then(function() {
			assert.strictEqual(oCache.aElements[1], oFirstLeaf);
			assert.strictEqual(oCache.aElements[2], oReadResult0.value[0]);
			assert.strictEqual(oCache.aElements[4], oReadResult0.value[2]);
			assert.strictEqual(oCache.aElements[5], oReadResult0.value[3]);

			assert.strictEqual(oCache.aElements[3], oReadResult1.value[0]);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: expand before reading", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			oFirstLeaf = {},
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLevelCacheMock = this.mock(oGroupLevelCache),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockCopy = {},
			oInsertedNode = {},
			oReadResult0 = {value : [{}, {}]};

		oCache.aElements = [
			{/* not expanded node */},
			{/* expanded node */},
			oFirstLeaf,
			{"@$ui5._": {index : 1, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 2, parent : oGroupLevelCache}}
		];

		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(1, 2, 0, sinon.match.same(oGroupLockCopy), "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate an expand
				oCache.aElements.splice(1, 0, oInsertedNode);

				return new Promise(function (resolve) {
					resolve(oReadResult0);
				});
			});

		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 4)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(3, 2, 0, oGroupLock, "~fnDataRequested~").then(function() {
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
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			oFirstLeaf = {},
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLevelCacheMock = this.mock(oGroupLevelCache),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockCopy = {},
			oReadResultFirstNode = {},
			oReadResult0 = {value : [oReadResultFirstNode]};

		oCache.aElements = [
			{/* not expanded node */},
			{/* expanded node */},
			oFirstLeaf,
			{"@$ui5._": {index : 1, parent : oGroupLevelCache}},
			{"@$ui5._": {index : 2, parent : oGroupLevelCache}}
		];

		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);

		oGroupLevelCacheMock.expects("read")
			.withExactArgs(2, 1, 0, sinon.match.same(oGroupLockCopy), "~fnDataRequested~")
			.callsFake(function () {
				// while the read request is running - simulate an expand and a concurrent read
				oCache.aElements.splice(1, 0, {});
				oCache.aElements.splice(5, 1, oReadResultFirstNode);

				return new Promise(function (resolve) {
					resolve(oReadResult0);
				});
			});

		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 5)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(4, 1, 0, oGroupLock, "~fnDataRequested~").then(function() {
			assert.strictEqual(oCache.aElements[3], oFirstLeaf);
			assert.strictEqual(oCache.aElements[5], oReadResultFirstNode);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: with visual grouping - two different group level caches", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
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
			oGroupLockCopy0 = {},
			oGroupLockCopy1 = {},
			oGroupLockMock = this.mock(oGroupLock),
			oReadPromise,
			oReadResult0 = {value : [{}, {}]},
			oReadResult1 = {value : [{}, {}]};

		oCache.aElements = [
			{/* expanded node */},
			oFirstLeaf0,
			{"@$ui5._" : {index : 1, parent : oGroupLevelCache0}},
			{"@$ui5._" : {index : 2, parent : oGroupLevelCache0}},
			{/* expanded node */},
			oFirstLeaf1,
			{"@$ui5._" : {index : 1, parent : oGroupLevelCache1}},
			{"@$ui5._" : {index : 2, parent : oGroupLevelCache1}}
		];

		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 42;

		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy0);
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy1);
		var oUnlockCall = oGroupLockMock.expects("unlock").withExactArgs();

		this.mock(oGroupLevelCache0).expects("read")
			.withExactArgs(1, 2, 0, sinon.match.same(oGroupLockCopy0), "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult0)));

		this.mock(oGroupLevelCache1).expects("read")
			.withExactArgs(1, 2, 0, sinon.match.same(oGroupLockCopy1), "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult1)));

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult0.value), 2)
			.callThrough(); // so that oCache.aElements is actually filled

		oCacheMock.expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult1.value), 6)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		oReadPromise = oCache.read(1, 7, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
				assert.strictEqual(oResult.value[0], oFirstLeaf0);
				assert.strictEqual(oResult.value[1], oReadResult0.value[0]);
				assert.strictEqual(oResult.value[2], oReadResult0.value[1]);

				assert.strictEqual(oResult.value[4], oFirstLeaf1);
				assert.strictEqual(oResult.value[5], oReadResult1.value[0]);
				assert.strictEqual(oResult.value[6], oReadResult1.value[1]);

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
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockCopy = {},
			oReadResult = {value : [{}, {}, {}]};

		oCache.aElements = [
			{},
			{"@$ui5._" : {index : 1, parent : oCache.oFirstLevel}},
			{"@$ui5._" : {index : 2, parent : oCache.oFirstLevel}},
			{"@$ui5._" : {index : 3, parent : oCache.oFirstLevel}},
			{"@$ui5._" : {index : 4, parent : oCache.oFirstLevel}},
			{"@$ui5._" : {index : 5, parent : oCache.oFirstLevel}},
			{"@$ui5._" : {index : 6, parent : oCache.oFirstLevel}},
			{"@$ui5._" : {index : 7, parent : oCache.oFirstLevel}}
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 8;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);

		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(3, 3, 0, sinon.match.same(oGroupLockCopy),	"~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult)));

		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult.value), 3)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(3, 3, 0, oGroupLock, "~fnDataRequested~").then(function (oResult) {
			assert.strictEqual(oResult.value[0], oReadResult.value[0]);
			assert.strictEqual(oResult.value[1], oReadResult.value[1]);
			assert.strictEqual(oResult.value[2], oReadResult.value[2]);
		});
	});

	//*********************************************************************************************
	QUnit.test("read: with visual grouping - read more elements than existing", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oGroupLockCopy = {},
			oReadResult = {value : [{}]};

		oCache.aElements = [
			{},
			{"@$ui5._" : {index : 1, parent : oCache.oFirstLevel}}
		];
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 2;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);

		this.mock(oCache.oFirstLevel).expects("read")
			.withExactArgs(1, 1, 0, sinon.match.same(oGroupLockCopy), "~fnDataRequested~")
			.returns(SyncPromise.resolve(Promise.resolve(oReadResult)));

		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oReadResult.value), 1)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		return oCache.read(0, 100, 0, oGroupLock, "~fnDataRequested~");
	});

	//*********************************************************************************************
	QUnit.test("expand", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["group"]
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			aElements = [{
				"@$ui5.node.isExpanded" : false
			}, {}, {}],
			oExpandResult = {
				value : [{}, {}, {}, {}, {}]
			},
			oGroupLevelCache = {
				read : function () {}
			},
			oGroupLock = {
				unlock : function () {}
			},
			oPromise,
			that = this;

		oExpandResult.value.$count = 7;

		// simulate a read
		oCache.iReadLength = 42;
		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};
		oCache.aElements.$count = 3;

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~path~")
			.returns(SyncPromise.resolve(oCache.aElements[0]));
		this.mock(_Helper).expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "~path~",
				sinon.match.same(oCache.aElements[0]), {"@$ui5.node.isExpanded" : true})
			.callsFake(function () {
				oCache.aElements[0]["@$ui5.node.isExpanded"] = true;
			});
		this.mock(oCache).expects("createGroupLevelCache")
			.withExactArgs(sinon.match.same(oCache.aElements[0]))
			.returns(oGroupLevelCache);
		this.mock(oGroupLevelCache).expects("read")
			.withExactArgs(0, oCache.iReadLength, 0, sinon.match.same(oGroupLock))
			.returns(SyncPromise.resolve(Promise.resolve(oExpandResult)));
		this.mock(oCache).expects("addElements")
			.withExactArgs(sinon.match.same(oExpandResult.value), 1)
			.callThrough(); // so that oCache.aElements is actually filled

		// code under test
		oPromise = oCache.expand(oGroupLock, "~path~").then(function (iResult) {
			assert.strictEqual(oCache.aElements.length, 10, ".length");
			assert.strictEqual(oCache.aElements.$count, 10, ".$count");
			// check parent node
			assert.strictEqual(oCache.aElements[0], aElements[0]);

			// check expanded nodes
			assert.strictEqual(oCache.aElements[1], oExpandResult.value[0]);
			assert.strictEqual(oCache.aElements[2], oExpandResult.value[1]);
			assert.strictEqual(oCache.aElements[3], oExpandResult.value[2]);
			assert.strictEqual(oCache.aElements[4], oExpandResult.value[3]);
			assert.strictEqual(oCache.aElements[5], oExpandResult.value[4]);

			// check placeholder
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[6], "index"), 5);
			assert.strictEqual(
				_Helper.getPrivateAnnotation(oCache.aElements[6], "parent"), oGroupLevelCache);
			assert.strictEqual(_Helper.getPrivateAnnotation(oCache.aElements[7], "index"), 6);
			assert.strictEqual(
				_Helper.getPrivateAnnotation(oCache.aElements[7], "parent"), oGroupLevelCache);

			// check moved nodes
			assert.strictEqual(oCache.aElements[8], aElements[1]);
			assert.strictEqual(oCache.aElements[9], aElements[2]);

			assert.strictEqual(iResult, oExpandResult.value.$count);

			that.mock(oCache.oFirstLevel).expects("read").never();

			return oCache.read(1, 4, 0, oGroupLock).then(function (oResult) {
				assert.strictEqual(oResult.value.length, 4);
				assert.strictEqual(oResult.value.$count, 10);
				oResult.value.forEach(function (oElement, i) {
					assert.strictEqual(oElement, oCache.aElements[i + 1], "index " + (i + 1));
				});
			});
		});

		assert.strictEqual(oCache.aElements[0]["@$ui5.node.isExpanded"], true);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("expand: read failure", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : []
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
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
	QUnit.test("addElements", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group: {},
				groupLevels : []
			},
			oCache = _AggregationCache.create(this.oRequestor, "~", oAggregation, {}),
			aElements = [{}, {}, , , {}],
			aReadElements = [{
				"@$ui5._" : {predicate : "(1)"}
			}, {
				"@$ui5._" : {predicate : "(2)"}
			}];

		oCache.aElements = aElements.slice();
		oCache.aElements.$byPredicate = {};

		oCache.addElements(aReadElements, 2);

		assert.strictEqual(oCache.aElements[0], aElements[0]);
		assert.strictEqual(oCache.aElements[1], aElements[1]);
		assert.strictEqual(oCache.aElements[2], aReadElements[0]);
		assert.strictEqual(oCache.aElements[3], aReadElements[1]);
		assert.strictEqual(oCache.aElements[4], aElements[4]);
		assert.strictEqual(oCache.aElements.$byPredicate["(1)"], aReadElements[0]);
		assert.strictEqual(oCache.aElements.$byPredicate["(2)"], aReadElements[1]);
	});
});
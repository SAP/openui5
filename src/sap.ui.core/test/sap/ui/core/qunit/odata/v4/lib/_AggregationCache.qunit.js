/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_AggregationCache",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, _AggregationCache, _AggregationHelper, _Cache, _Helper) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
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
	QUnit.test("filterAggregationForFirstLevel - optional group entry", function (assert) {
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

		assert.deepEqual(_AggregationCache.filterAggregationForFirstLevel(oAggregation), {
			aggregate : {
				MeasureWithTotal : {subtotals : true}
			},
			group : {},
			groupLevels : ["GroupedDimension"]
		});
	});

	//*********************************************************************************************
	QUnit.test("filterAggregationForFirstLevel", function (assert) {
		var oAggregation = {
				aggregate : {
					MeasureWithoutTotal : {},
					MeasureWithTotal : {subtotals : true}
				},
				group : {
					GroupedDimension : {},
					UngroupedDimension : {}
				},
				groupLevels : ["GroupedDimension"]
			};

		assert.deepEqual(_AggregationCache.filterAggregationForFirstLevel(oAggregation), {
			aggregate : {
				MeasureWithTotal : {subtotals : true}
			},
			group : {
				GroupedDimension : {}
			},
			groupLevels : ["GroupedDimension"]
		});
	});
	//TODO filterAggregationForFirstLevel has to return only the first grouped dimension

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
			mMeasureRange,
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
			iEnd = 13,
			fnGetResourcePath = function () {},
			fnHandleResponse = function () {},
			oFirstLevelCache = {
				getResourcePath : fnGetResourcePath,
				handleResponse : fnHandleResponse
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
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oAggregation = {
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
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
	QUnit.test("calculateKeyPredicate", function (assert) {
		var oAggregation = {
				groupLevels : ["First=Dimension"] // Note: unrealistic example to test encoding
			},
			mByPredicate = {},
			oConflictingGroupNode = {"First=Dimension" : "A/B&C", Measure : 0, Unit : "USD"},
			oGroupNode = {"First=Dimension" : "A/B&C", Measure : 0, Unit : "EUR"},
			sMetaPath = "/Set",
			sPredicate = "(First%3DDimension='A%2FB%26C')",
			mTypeForMetaPath = {
				"/Set" : {
					$kind : "EntityType",
					// Note: $Key does not play a role here!
					"First=Dimension" : {
						$kind : "Property",
						$Type : "Edm.String"
					}
				}
			};

		this.mock(_Helper).expects("formatLiteral").twice().withExactArgs("A/B&C", "Edm.String")
			.returns("'A/B&C'");

		// code under test
		_AggregationCache.calculateKeyPredicate(oAggregation, mByPredicate, oGroupNode,
			mTypeForMetaPath, sMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "predicate"),
			"(First%3DDimension='A%2FB%26C')");

		mByPredicate[sPredicate] = oGroupNode; // happens inside CollectionCache#requestElements

		assert.throws(function () {
			// code under test
			_AggregationCache.calculateKeyPredicate(oAggregation, mByPredicate,
				oConflictingGroupNode, mTypeForMetaPath, sMetaPath);
		}, new Error("Multi-unit situation detected: "
			+ '{"First=Dimension":"A/B&C","Measure":0,"Unit":"USD"} vs. '
			+ '{"First=Dimension":"A/B&C","Measure":0,"Unit":"EUR"}'));

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "predicate"), sPredicate,
			"unchanged");
		assert.strictEqual(_Helper.getPrivateAnnotation(oConflictingGroupNode, "predicate"),
			undefined, "not yet set");
	});

	//*********************************************************************************************
	QUnit.test("create, fetchValue, read with visual grouping", function (assert) {
		var oAggregation = {
				aggregate : {},
				group : {
					BillToParty : {}
				},
				groupLevels : ["BillToParty"]
			},
			oAggregationForFirstLevel = {},
			mByPredicate = {},
			oCache,
			fnDataRequested = {},
			oFirstLevelCache = {
				aElements : [],
				fetchTypes : function () {},
				fetchValue : function () {},
				read : function () {}
			},
			oGroupLock = {},
			iIndex = 17,
			iLength = 4,
			sMetaPath = "/meta/path",
			sOrderby = "~orderby~",
			iPrefetchLength = 42,
			mQueryOptions = {$count : false, $orderby : "FirstDimension", "sap-client" : "123"},
			mQueryOptionsWithApply = {$apply : "A.P.P.L.E."},
			sResourcePath = "Foo",
			oResult = {
				value : [{}, {}]
			},
			mTypeForMetaPath = {},
			that = this;

		oFirstLevelCache.aElements.$byPredicate = mByPredicate;
		this.mock(_AggregationCache).expects("filterAggregationForFirstLevel")
			.withExactArgs(sinon.match.same(oAggregation))
			.returns(oAggregationForFirstLevel);
		this.mock(_AggregationCache).expects("filterOrderby")
			.withExactArgs(mQueryOptions.$orderby, sinon.match.same(oAggregationForFirstLevel))
			.returns(sOrderby);
		this.mock(_AggregationHelper).expects("buildApply")
			.withExactArgs(sinon.match.same(oAggregationForFirstLevel),
				{$orderby : sOrderby, "sap-client" : "123"})
			.returns(mQueryOptionsWithApply);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oRequestor), sResourcePath,
				{$apply : "A.P.P.L.E.", $count : true}, true)
			.returns(oFirstLevelCache);
		this.mock(_AggregationCache).expects("calculateKeyPredicate").on(null)
			.withExactArgs(sinon.match.same(oAggregationForFirstLevel),
				sinon.match.same(mByPredicate), sinon.match.same(oResult.value[0]),
				sinon.match.same(mTypeForMetaPath), sMetaPath)
			.callsFake(function (oAggregation, mByPredicate, oGroupNode, mTypeForMetaPath,
					sMetaPath) {
				_Helper.setPrivateAnnotation(oGroupNode, "predicate", "(FirstDimension='A')");
			});

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
		assert.notOk("oMeasureRangePromise" in oCache, "no min/max");
		assert.strictEqual(oCache.oFirstLevel, oFirstLevelCache);

		// code under test (this normally happens inside read's handleResponse method)
		oFirstLevelCache.calculateKeyPredicate(oResult.value[0], mTypeForMetaPath, sMetaPath);

		this.mock(oFirstLevelCache).expects("read").on(oFirstLevelCache)
			.withExactArgs(iIndex, iLength, iPrefetchLength, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(oResult));

		// code under test
		return oCache.read(iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested)
			.then(function (oResult0) {
				var oListener = {},
					sPath = "some/relative/path",
					vResult = {};

				assert.strictEqual(oResult0, oResult);
				assert.notOk("$apply" in mQueryOptions, "not modified");
				assert.strictEqual(oResult.value[0]["@$ui5.node.isExpanded"], false);
				assert.strictEqual(oResult.value[1]["@$ui5.node.isExpanded"], false);
				assert.strictEqual(oResult.value[0]["@$ui5.node.isTotal"], true);
				assert.strictEqual(oResult.value[1]["@$ui5.node.isTotal"], true);
				assert.strictEqual(oResult.value[0]["@$ui5.node.level"], 1);
				assert.strictEqual(oResult.value[1]["@$ui5.node.level"], 1);
				// Note: called above for index 0 only
				assert.strictEqual(_Helper.getPrivateAnnotation(oResult.value[0], "predicate"),
					"(FirstDimension='A')");

				that.mock(oFirstLevelCache).expects("fetchValue").on(oFirstLevelCache)
					.withExactArgs(sinon.match.same(oGroupLock), sPath,
						sinon.match.same(fnDataRequested), sinon.match.same(oListener))
					.returns(SyncPromise.resolve(vResult));

				// code under test
				return oCache.fetchValue(oGroupLock, sPath, fnDataRequested, oListener)
					.then(function (vResult0) {
						assert.strictEqual(vResult0, vResult);
					});
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

			assert.strictEqual(oPromise, oReadPromise);
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
});
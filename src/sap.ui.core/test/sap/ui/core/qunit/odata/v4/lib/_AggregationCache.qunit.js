/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_AggregationCache",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (jQuery, SyncPromise, _AggregationCache, _Cache, _Helper) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationCache", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oRequestor = {
				buildQueryString : function () {return "";}//,
//				fetchTypeForPath : function () {return SyncPromise.resolve({}); },
//				getGroupSubmitMode : function (sGroupId) {
//					return defaultGetGroupProperty(sGroupId);
//				},
//				getServiceUrl : function () {return "/~/";},
//				isActionBodyOptional : function () {},
//				relocate : function () {},
//				removePatch : function () {},
//				removePost : function () {},
//				request : function () {}
			};
			this.oRequestorMock = this.mock(this.oRequestor);
		}
	});

	//*********************************************************************************************
	QUnit.test("filterAggregationForFirstLevel", function (assert) {
		var aAggregation = [{
				grouped : true,
				name : "GroupedDimension"
			}, {
				grouped : false,
				name : "UngroupedDimension"
			}, {
				name : "MeasureWithoutTotal",
				total : false
			}, {
				name : "MeasureWithTotal",
				total : true
			}];

		assert.deepEqual(_AggregationCache.filterAggregationForFirstLevel(aAggregation), [{
			grouped : true,
			name : "GroupedDimension"
		}, {
			name : "MeasureWithTotal",
			total : true
		}]);
	});
	//TODO filterAggregationForFirstLevel has to return only the first grouped dimension

	//*********************************************************************************************
	QUnit.test("filterOrderby", function (assert) {
		var aAggregation = [{
				grouped : true,
				name : "Dimension"
			}, {
				name : "Measure",
				total : true
			}];

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("Dimension %20desc%2COtherDimension asc", aAggregation),
			"Dimension %20desc");

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("Dimension\tdesc,OtherDimension asc", aAggregation),
			"Dimension\tdesc");

		// code under test
		assert.strictEqual(
			_AggregationCache.filterOrderby("Measure desc%2cDimension", aAggregation),
			"Measure desc,Dimension");

		// code under test
		assert.strictEqual(_AggregationCache.filterOrderby(undefined, []), undefined);

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
	QUnit.test("create", function (assert) {
		var aAggregation = [],
			oCache,
			mQueryOptions = {},
			sResourcePath = "Foo",
			bSortExpandSelect = {/*false, true*/};

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, aAggregation,
			mQueryOptions, bSortExpandSelect);

		assert.ok(oCache instanceof _AggregationCache, "module value is c'tor function");
		assert.ok(oCache instanceof _Cache, "_AggregationCache is a _Cache");
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.sResourcePath, sResourcePath);
		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.bSortExpandSelect, bSortExpandSelect);
		assert.strictEqual(typeof oCache.fetchValue, "function");
		assert.strictEqual(typeof oCache.read, "function");
		assert.notOk("oMeasureRangePromise" in oCache, "no min/max");
	});

	//*********************************************************************************************
	[[{
		min : true,
		name : "Measure"
	}], [{
		max : true,
		name : "Measure"
	}]].forEach(function (aAggregation, i) {
		QUnit.test("create with min/max: " + i, function (assert) {
			var mAlias2MeasureAndMethod,
				sAggregation = JSON.stringify(aAggregation),
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
				mQueryOptions = {$apply : "bar", "sap-client" : "123"},
				sQueryOptions = JSON.stringify(mQueryOptions),
				sResourcePath = "Foo",
				aResult = [],
				bSortExpandSelect = {/*true or false*/},
				iStart = 0;

			this.mock(_Helper).expects("buildApply")
				.withExactArgs(sinon.match.same(aAggregation),
					sinon.match(function (mAlias2MeasureAndMethod0) {
						mAlias2MeasureAndMethod = mAlias2MeasureAndMethod0;
						assert.deepEqual(mAlias2MeasureAndMethod0, {});
						return true;
					}))
				.returns(sApply);
			this.mock(_Cache).expects("create")
				.withExactArgs(sinon.match.same(this.oRequestor), sResourcePath,
					{$apply : sApply, "sap-client" : "123"},
					sinon.match.same(bSortExpandSelect))
				.returns(oFirstLevelCache);
			// getResourcePath and handleResponse need to be mocked before an _AggregationCache
			// instance is created
			oAggregationCacheMock.expects("getResourcePath")
				.withExactArgs(sinon.match.same(aAggregation), sinon.match.same(fnGetResourcePath),
					iStart, iEnd)
				.on(oFirstLevelCache);
			oAggregationCacheMock.expects("handleResponse")
				.withExactArgs(sinon.match(function (mAlias2MeasureAndMethod0) {
						assert.strictEqual(mAlias2MeasureAndMethod0, mAlias2MeasureAndMethod);
						return mAlias2MeasureAndMethod0 === mAlias2MeasureAndMethod;
					}), sinon.match.func, sinon.match.same(fnHandleResponse), iStart, iEnd,
					sinon.match.same(aResult))
				.on(oFirstLevelCache)
				.callsArgWith(1, mMeasureRange);

			// code under test
			oCache = _AggregationCache.create(this.oRequestor, sResourcePath, aAggregation,
				mQueryOptions, bSortExpandSelect);

			assert.ok(oCache.oMeasureRangePromise instanceof Promise);
			assert.strictEqual(oCache.getMeasureRangePromise(), oCache.oMeasureRangePromise);
			assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptions, "not modified");
			assert.strictEqual(JSON.stringify(aAggregation), sAggregation, "not modified");
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
	});

	//*********************************************************************************************
	QUnit.test("create: Error", function (assert) {
		var aAggregation = [{
				min : true,
				name : "Measure",
				total : true
			}],
			mQueryOptions = {"$orderby" : "foo desc"};


		assert.throws(function () {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", aAggregation, mQueryOptions);
		}, new Error("Cannot use $orderby together with min or max on measures"));
	});

	//*********************************************************************************************
	QUnit.test("getResourcePath", function (assert) {
		var aAggregation = [],
			aAggregationCloned = [{
				min : true,
				name : "Measure0"
			}, {
				max : true,
				name : "Measure1"
			}, {
				max : true,
				min : true,
				name : "Measure2"
			}],
			aAggregationExpected = [{
				name : "Measure0"
			}, {
				name : "Measure1"
			}, {
				name : "Measure2"
			}],
			sApply = {/*new value for $apply*/},
			iEnd = 13,
			oFirstLevelCache = {
				sMetaPath : {/*a meta path string*/},
				mQueryOptions : {
					$apply : {/*any $apply string*/}
				},
				sQueryString : {/*sQueryString before*/},
				oRequestor : {
					buildQueryString : function () {}
				},
				bSortExpandSelect : {/*true or false*/}
			},
			fnGetResourcePath = sinon.stub(),
			oHelperMock = this.mock(_Helper),
			sQueryStringAfter = {/*sQueryString after*/},
			sResourcePath = "Foo",
			iStart = 0;

		fnGetResourcePath.returns(sResourcePath);
		oHelperMock.expects("clone")
			.withExactArgs(sinon.match.same(aAggregation))
			.returns(aAggregationCloned);
		oHelperMock.expects("buildApply").withExactArgs(sinon.match(function (aAggregationCloned0) {
				assert.deepEqual(aAggregationCloned0, aAggregationExpected);
				return aAggregationCloned0 === aAggregationCloned;
			}))
			.returns(sApply);
		this.mock(oFirstLevelCache.oRequestor).expects("buildQueryString")
			.withExactArgs(sinon.match.same(oFirstLevelCache.sMetaPath),
				sinon.match(function (mQueryOptions0) {
					assert.strictEqual(mQueryOptions0.$apply, sApply);
					return mQueryOptions0 === oFirstLevelCache.mQueryOptions;
				}), false, sinon.match.same(oFirstLevelCache.bSortExpandSelect))
			.returns(sQueryStringAfter);

		// code under test
		assert.strictEqual(_AggregationCache.getResourcePath.call(oFirstLevelCache, aAggregation,
			fnGetResourcePath, iStart, iEnd), sResourcePath);

		assert.strictEqual(fnGetResourcePath.callCount, 1);
		assert.ok(fnGetResourcePath.calledWith(iStart, iEnd + 1), "fnGetResourcePath parameters");
		assert.ok(fnGetResourcePath.calledOn(oFirstLevelCache), "called on oFirstLevelCache");
		assert.strictEqual(oFirstLevelCache.sQueryString, sQueryStringAfter);
		assert.strictEqual(oFirstLevelCache.getResourcePath, fnGetResourcePath);
	});

	//*********************************************************************************************
	QUnit.test("getResourcePath: Error", function (assert) {

		assert.throws(function () {
			// code under test
			_AggregationCache.getResourcePath([], {}, 42, 50);
		}, new Error("First request needs to start at index 0"));
	});

	//*********************************************************************************************
	[true, false].forEach(function (bODataCount) {
		QUnit.test("handleResponse", function (assert) {
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
							"UI5max__OnlyMax" : 10
						},
						oResponseRecord
					]
				},
				mTypeForMetaPath = {/*fetchTypes result*/},
				iStart = 0,
				iEnd = 10;

			if (bODataCount) {
				oResult["@odata.count"] = 42;
			}

			// code under test
			_AggregationCache.handleResponse.call(
				oFirstLevelCache, mAlias2MeasureAndMethod, fnMeasureRangeResolve,
				fnHandleResponse, iStart, iEnd, oResult, mTypeForMetaPath);

			assert.strictEqual(oFirstLevelCache.handleResponse, fnHandleResponse, "restored");
			assert.strictEqual(fnHandleResponse.callCount, 1);
			assert.ok(fnHandleResponse.calledWith(iStart, iEnd, sinon.match.same(oResult),
				sinon.match.same(mTypeForMetaPath)));
			assert.strictEqual(oResult["@odata.count"], bODataCount ? 41 : undefined);
			assert.strictEqual(fnMeasureRangeResolve.callCount, 1);
			assert.deepEqual(fnMeasureRangeResolve.args[0][0], mMeasureRange, "mMeasureRange");
			aGetDataRecords = fnHandleResponse.args[0][2]/*oResults*/.value;
			assert.strictEqual(aGetDataRecords.length, 1);
			assert.strictEqual(aGetDataRecords[0], oResponseRecord);
		});
	});

	//*********************************************************************************************
	QUnit.test("create: $filter not allowed", function (assert) {
		assert.throws(function() {
			// code under test
			_AggregationCache.create(this.oRequestor, "Foo", [], {$filter : "answer eq 42"});
		}, new Error("Unsupported system query option: $filter"));
	});

	//*********************************************************************************************
	QUnit.test("calculateKeyPredicate", function (assert) {
		var aAggregation = [{
				grouped : true,
				name : "First=Dimension" // Note: unrealistic example to test encoding
			}],
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
		_AggregationCache.calculateKeyPredicate(aAggregation, sMetaPath, mByPredicate, oGroupNode,
			mTypeForMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "predicate"),
			"(First%3DDimension='A%2FB%26C')");

		mByPredicate[sPredicate] = oGroupNode; // happens inside CollectionCache#requestElements

		assert.throws(function () {
			// code under test
			_AggregationCache.calculateKeyPredicate(aAggregation, sMetaPath, mByPredicate,
				oConflictingGroupNode, mTypeForMetaPath);
		}, new Error("Multi-unit situation detected: "
			+ '{"First=Dimension":"A/B&C","Measure":0,"Unit":"USD"} vs. '
			+ '{"First=Dimension":"A/B&C","Measure":0,"Unit":"EUR"}'));

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "predicate"), sPredicate,
			"unchanged");
		assert.strictEqual(_Helper.getPrivateAnnotation(oConflictingGroupNode, "predicate"),
			undefined, "not yet set");
	});

	//*********************************************************************************************
	QUnit.test("fetchValue, read", function (assert) {
		var aAggregation = [],
			aAggregationForFirstLevel = [],
			sApply = "A.P.P.L.E.",
			mByPredicate = {},
			oCache,
			fnDataRequested = {}, //TODO
			oFirstLevelCache = {
				aElements : [],
				fetchTypes : function () {},
				fetchValue : function () {},
				sMetaPath : {/*placeholder for string*/},
				read : function () {}
			},
			sGroupId = "group",
			iIndex = 17,
			iLength = 4,
			sOrderby = "~orderby~",
			iPrefetchLength = 42,
			mQueryOptions = {$count : false, $orderby : "FirstDimension", "sap-client" : "123"},
			sResourcePath = "Foo",
			oResult = {
				value : [{}, {}]
			},
			bSortExpandSelect = {/*false, true*/},
			mTypeForMetaPath = {},
			that = this;

		oFirstLevelCache.aElements.$byPredicate = mByPredicate;
		this.mock(_AggregationCache).expects("filterAggregationForFirstLevel")
			.withExactArgs(sinon.match.same(aAggregation))
			.returns(aAggregationForFirstLevel);
		this.mock(_Helper).expects("buildApply")
			.withExactArgs(sinon.match.same(aAggregationForFirstLevel))
			.returns(sApply);
		this.mock(_AggregationCache).expects("filterOrderby")
			.withExactArgs(mQueryOptions.$orderby, sinon.match.same(aAggregationForFirstLevel))
			.returns(sOrderby);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oRequestor), sResourcePath,
				{$apply : sApply, $count : true, $orderby : sOrderby, "sap-client" : "123"},
				sinon.match.same(bSortExpandSelect))
			.returns(oFirstLevelCache);
		this.mock(_AggregationCache).expects("calculateKeyPredicate").on(null)
			.withExactArgs(sinon.match.same(aAggregationForFirstLevel),
				sinon.match.same(oFirstLevelCache.sMetaPath), sinon.match.same(mByPredicate),
				sinon.match.same(oResult.value[0]), sinon.match.same(mTypeForMetaPath))
			.callsFake(function (aAggregation, sMetaPath, mByPredicate, oGroupNode,
					mTypeForMetaPath) {
				_Helper.setPrivateAnnotation(oGroupNode, "predicate", "(FirstDimension='A')");
			});

		// code under test
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, aAggregation,
			mQueryOptions, bSortExpandSelect);

		// code under test (this normally happens inside read's handleResponse method)
		oFirstLevelCache.calculateKeyPredicates(oResult.value[0], mTypeForMetaPath);

		this.mock(oFirstLevelCache).expects("read").on(oFirstLevelCache)
			.withExactArgs(iIndex, iLength, iPrefetchLength, sGroupId,
				sinon.match.same(fnDataRequested))
			.returns(SyncPromise.resolve(oResult));

		// code under test
		return oCache.read(iIndex, iLength, iPrefetchLength, sGroupId, fnDataRequested)
			.then(function (oResult0) {
				var oListener = {},
					sPath = "some/relative/path",
					aResult = [];

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
					.withExactArgs(sGroupId, sPath, sinon.match.same(fnDataRequested),
						sinon.match.same(oListener))
					.returns(SyncPromise.resolve(aResult));

				// code under test
				return oCache.fetchValue(sGroupId, sPath, fnDataRequested, oListener)
					.then(function (aResult0) {
						assert.strictEqual(aResult0, aResult);
					});
			});
	});

	//*********************************************************************************************
	QUnit.test("read: with min/max", function (assert) {
		var aAggregation = [{
				min : true,
				name : "Measure",
				total : true
			}],
			oCache = _AggregationCache.create(this.oRequestor, "Foo", aAggregation,
				{/*mQueryOptions*/}),
			oElement = {},
			oPromise,
			oResult = {
				value : [oElement]
			},
			oReadPromise = Promise.resolve(oResult);

		this.mock(oCache.oFirstLevel).expects("read")
			// withExactArgs is tested above
			.returns(oReadPromise);

		// code under test
		oPromise = oCache.read(0, 10, 0);

		assert.strictEqual(oPromise, oReadPromise);
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult.value[0], oElement);
			assert.notOk("@$ui5.node.isExpanded" in oElement, "no @$ui5.node...");
			assert.notOk("@$ui5.node.isTotal" in oElement);
			assert.notOk("@$ui5.node.level" in oElement);
		});
	});
});

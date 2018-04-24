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
});

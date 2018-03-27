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
	QUnit.test("fetchValue, read", function (assert) {
		var aAggregation = [],
			aAggregationForFirstLevel = [],
			sApply = "A.P.P.L.E.",
			oCache,
			fnDataRequested = {}, //TODO
			oFirstLevelCache = {
				fetchValue : function () {},
				read : function () {}
			},
			sGroupId = "group",
			iIndex = 17,
			iLength = 4,
			iPrefetchLength = 42,
			mQueryOptions = {$count : false, $orderby : "FirstDimension", "sap-client" : "123"},
			sResourcePath = "Foo",
			oResult = {
				value : [{}, {}]
			},
			bSortExpandSelect = {/*false, true*/},
			that = this;

		this.mock(_AggregationCache).expects("filterAggregationForFirstLevel")
			.withExactArgs(sinon.match.same(aAggregation))
			.returns(aAggregationForFirstLevel);
		this.mock(_Helper).expects("buildApply")
			.withExactArgs(sinon.match.same(aAggregationForFirstLevel))
			.returns(sApply);
		this.mock(_Cache).expects("create")
			.withExactArgs(sinon.match.same(this.oRequestor), sResourcePath,
				{$apply : sApply, $count : true, $orderby : "FirstDimension", "sap-client" : "123"},
				sinon.match.same(bSortExpandSelect))
			.returns(oFirstLevelCache);
		oCache = _AggregationCache.create(this.oRequestor, sResourcePath, aAggregation,
			mQueryOptions, bSortExpandSelect);
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
	//TODO drop unused dimensions from $orderby
});

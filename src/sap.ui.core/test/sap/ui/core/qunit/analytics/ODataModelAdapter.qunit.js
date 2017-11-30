/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/analytics/AnalyticalVersionInfo",
	"sap/ui/model/analytics/ODataModelAdapter",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (AnalyticalVersionInfo, ODataModelAdapter, OperationMode, ODataListBinding,
		ODataModel) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.ODataModelAdapter");

	//*********************************************************************************************
	QUnit.test("V4", function (assert) {
		var oModel = new ODataModel({
				serviceUrl : "/.../",
				synchronizationMode : "None"
			});

		assert.strictEqual(AnalyticalVersionInfo.getVersion(oModel), AnalyticalVersionInfo.V4);
	});

	//*********************************************************************************************
	[undefined, {/* w/o analyticalInfo */}].forEach(function (mParameters) {
		QUnit.test("w/o analyticalInfo: " + mParameters, function (assert) {
			var oContext = {},
				vFilters = {},
				oListBinding,
				oModel = new ODataModel({
					operationMode : OperationMode.Server,
					serviceUrl : "/.../",
					synchronizationMode : "None"
				}),
				sPath = "/TEAMS",
				vSorters = {};

			oListBinding = oModel.bindList(sPath);
			this.mock(ODataModel.prototype).expects("bindList")
				.withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(vSorters),
					sinon.match.same(vFilters), sinon.match.same(mParameters))
				.returns(oListBinding);

			// code under test
			ODataModelAdapter.apply(oModel);

			assert.strictEqual(oModel.bindTree, ODataModel.prototype.bindTree);

			// code under test
			assert.strictEqual(
				oModel.bindList(sPath, oContext, vSorters, vFilters, mParameters),
				oListBinding);

			assert.strictEqual(oListBinding.getContexts, ODataListBinding.prototype.getContexts);
		});
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bProvideTotalResultSize) {
		QUnit.test("provideTotalResultSize : " + bProvideTotalResultSize, function (assert) {
			var oContext = {},
				vFilters = {},
				oListBinding,
				oModel = new ODataModel({
					operationMode : OperationMode.Server,
					serviceUrl : "/.../",
					synchronizationMode : "None"
				}),
				mParameters = {},
				sPath = "/TEAMS",
				vSorters = {};

			oListBinding = oModel.bindList(sPath);
			if (bProvideTotalResultSize !== false) { // default is true
				mParameters.$count = true;
			}
			this.mock(ODataModel.prototype).expects("bindList")
				.withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(vSorters),
					sinon.match.same(vFilters), mParameters)
				.returns(oListBinding);

			// code under test
			ODataModelAdapter.apply(oModel);

			assert.strictEqual(oModel.bindTree, ODataModel.prototype.bindTree);

			// code under test
			assert.strictEqual(
				oModel.bindList(sPath, oContext, vSorters, vFilters, {
					analyticalInfo : [],
					provideTotalResultSize : bProvideTotalResultSize
				}),
				oListBinding);

			assert.strictEqual(oListBinding.getContexts, ODataListBinding.prototype.getContexts);
		});
	});
	//TODO avoid $count in case of infinite prefetch?!

	//*********************************************************************************************
	QUnit.test("noPaging : false", function (assert) {
		var oContext = {},
			vFilters = {},
			oListBinding,
			oModel = new ODataModel({
				operationMode : OperationMode.Server,
				serviceUrl : "/.../",
				synchronizationMode : "None"
			}),
			sPath = "/TEAMS",
			vSorters = {};

		oListBinding = oModel.bindList(sPath);
		this.mock(ODataModel.prototype).expects("bindList")
			.withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(vSorters),
				sinon.match.same(vFilters), {$count : true})
			.returns(oListBinding);

		// code under test
		ODataModelAdapter.apply(oModel);

		assert.strictEqual(oModel.bindTree, ODataModel.prototype.bindTree);

		// code under test
		assert.strictEqual(
			oModel.bindList(sPath, oContext, vSorters, vFilters, {
				analyticalInfo : []
//				nopaging : false
			}),
			oListBinding);

		assert.strictEqual(oListBinding.getContexts, ODataListBinding.prototype.getContexts);
	});

	//*********************************************************************************************
	QUnit.test("noPaging : true", function (assert) {
		var oContext = {},
			vFilters = {},
			oListBinding,
			oMock = this.mock(ODataListBinding.prototype),
			oModel = new ODataModel({
				operationMode : OperationMode.Server,
				serviceUrl : "/.../",
				synchronizationMode : "None"
			}),
			sPath = "/TEAMS",
			vSorters = {};

		oListBinding = oModel.bindList(sPath);
		this.mock(ODataModel.prototype).expects("bindList")
			.withExactArgs(sPath, sinon.match.same(oContext), sinon.match.same(vSorters),
				sinon.match.same(vFilters), {})
			.returns(oListBinding);

		// code under test
		ODataModelAdapter.apply(oModel);

		assert.strictEqual(oModel.bindTree, ODataModel.prototype.bindTree);

		oMock.expects("getContexts").withExactArgs(0, 10, 0);
		oMock.expects("getContexts").withExactArgs(0, 10, Infinity);

		// code under test
		assert.strictEqual(
			oModel.bindList(sPath, oContext, vSorters, vFilters, {
				analyticalInfo : [],
				noPaging : true,
				provideTotalResultSize : false
			}),
			oListBinding);

		// code under test
		oListBinding.getContexts(0, 10, 0);

		// code under test
		oListBinding.getContexts(0, 10);
	});

// sap.chart.Chart passes the following binding parameters:
//	mParameters === {
//		"analyticalInfo" : [{ //TODO call updateAnalyticalInfo?
//			"name" : "" //TODO discuss with Chart to remove this
//		}],
//		"useBatchRequests" : true, //TODO turn into $$groupId direct/auto?
//		"provideGrandTotals" : false, //TODO not yet supported
//		"reloadSingleUnitMeasures" : true, //TODO not yet supported (multi-unit cases...)
//		"noPaging" : false/true
//	}
});

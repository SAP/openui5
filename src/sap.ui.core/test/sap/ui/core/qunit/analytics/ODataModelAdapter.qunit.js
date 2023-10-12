/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/analytics/AnalyticalBinding",
	"sap/ui/model/analytics/odata4analytics",
	"sap/ui/model/analytics/ODataModelAdapter"
], function (Log, AnalyticalBinding, odata4analytics, ODataModelAdapter) {
	/*global QUnit, sinon */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.ODataModelAdapter", {
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
	QUnit.test("getAnalyticalExtensions: V2, throws error if metadata not loaded", function (assert) {
		const oModel = {};
		this.mock(AnalyticalBinding).expects("_getModelVersion").withExactArgs(sinon.match.same(oModel)).returns(2);
		const oError = new Error("Failed to get the analytical extensions. The metadata have not been loaded by the"
			+ " model yet. Register for the 'metadataLoaded' event of the ODataModel(v2) to know when the analytical"
			+ " extensions can be retrieved.");

		// code under test
		assert.throws(() => ODataModelAdapter.prototype.getAnalyticalExtensions.apply(oModel), oError);
	});

	//*********************************************************************************************
[
	"My exception",
	{message : "My exception"}
].forEach(function (vException) {
	var sTitle = "getAnalyticalExtensions: throw error for given model: " + JSON.stringify(vException);

	QUnit.test(sTitle, function (assert) {
		const oModel = {};
		this.mock(AnalyticalBinding).expects("_getModelVersion").withExactArgs(sinon.match.same(oModel)).returns(null);
		this.mock(odata4analytics).expects("Model").throws(vException);

		// code under test
		assert.throws(() => ODataModelAdapter.prototype.getAnalyticalExtensions.apply(oModel),
			new Error("Failed to instantiate analytical extensions for given OData model: My exception"));
	});
});

	//*********************************************************************************************
[
	{oModel: {}, iVersion: null},
	{oModel: {getAnalyticalExtensions: "~getAnalyticalExtensions"}, iVersion: 2}
].forEach((oFixture) => {
	QUnit.test("ODataModelAdapter: calls _getModelVersion", function (assert) {
		this.mock(AnalyticalBinding).expects("_getModelVersion")
			.withExactArgs(sinon.match.same(oFixture.oModel))
			.returns(oFixture.iVersion);

		// code under test
		ODataModelAdapter.apply(oFixture.oModel);

		assert.strictEqual(oFixture.oModel._mPreadapterFunctions, undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("ODataModelAdapter: for V2 model", function (assert) {
		const oModel = {
			bindList: "~bindList",
			bindTree: "~bindTree"
		};
		this.mock(AnalyticalBinding).expects("_getModelVersion").withExactArgs(sinon.match.same(oModel)).returns(2);

		// code under test
		ODataModelAdapter.apply(oModel);

		assert.deepEqual(oModel._mPreadapterFunctions, {bindList: "~bindList", bindTree: "~bindTree"});
		assert.strictEqual(oModel.bindList, ODataModelAdapter.prototype.bindList);
		assert.strictEqual(oModel.bindTree, ODataModelAdapter.prototype.bindTree);
		assert.strictEqual(oModel.getAnalyticalExtensions, ODataModelAdapter.prototype.getAnalyticalExtensions);
		assert.strictEqual(oModel.setAnalyticalExtensions, ODataModelAdapter.prototype.setAnalyticalExtensions);
	});

	/** @deprecated As of version 1.48.0 */
	QUnit.test("ODataModelAdapter: for V1 model", function (assert) {
		const oModel = {
			bindList: "~bindList",
			bindTree: "~bindTree",
			isCountSupported() {},
			setCountSupported() {}
		};
		this.mock(AnalyticalBinding).expects("_getModelVersion").withExactArgs(sinon.match.same(oModel)).returns(1);
		this.mock(oModel).expects("isCountSupported").withExactArgs().returns(true);
		this.oLogMock.expects("info")
			.withExactArgs("ODataModelAdapter: switched ODataModel to use inlinecount (mandatory for the"
				+ " AnalyticalBinding)");
		this.mock(oModel).expects("setCountSupported").withExactArgs(false);

		// code under test
		ODataModelAdapter.apply(oModel);

		assert.deepEqual(oModel._mPreadapterFunctions, {bindList: "~bindList", bindTree: "~bindTree"});
		assert.strictEqual(oModel.bindList, ODataModelAdapter.prototype.bindList);
		assert.strictEqual(oModel.bindTree, ODataModelAdapter.prototype.bindTree);
		assert.strictEqual(oModel.getAnalyticalExtensions, ODataModelAdapter.prototype.getAnalyticalExtensions);
		assert.strictEqual(oModel.setAnalyticalExtensions, ODataModelAdapter.prototype.setAnalyticalExtensions);
	});
});
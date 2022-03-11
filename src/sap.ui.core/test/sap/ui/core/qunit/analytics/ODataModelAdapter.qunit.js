/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/analytics/odata4analytics",
	"sap/ui/model/analytics/ODataModelAdapter",
	"sap/ui/test/TestUtils"
], function (Log, odata4analytics, ODataModelAdapter, TestUtils) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.ODataModelAdapter", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
[
	"My exception",
	{message : "My exception"}
].forEach(function (vException) {
	var sTitle = "getAnalyticalExtensions: throw error for given model: "
			+ JSON.stringify(vException);

	QUnit.test(sTitle, function (assert) {
		this.mock(odata4analytics).expects("Model").throws(vException);

		// code under test
		assert.throws(function () {
			ODataModelAdapter.prototype.getAnalyticalExtensions();
		}, function (sError) {
			return sError === "Failed to instantiate analytical extensions for given OData model: "
				+ "My exception";
		});
	});
});
});
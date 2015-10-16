/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/_OlingoDocument",
	"sap/ui/model/odata/v4/ODataDocumentModel",
	"sap/ui/test/TestUtils"
], function (OlingoDocument, ODataDocumentModel, TestUtils) {
	"use strict";
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */

	/*
	 * You can run various tests in this module against a real OData v4 service using the request
	 * property "realOData". See src/sap/ui/test/TestUtils.js for details.
	 */

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata": {source: "metadata.xml"},
			"/foo/$metadata": {code: 404}
		},
		sDocumentUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataDocumentModel", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, mFixture);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oDocumentModel = new ODataDocumentModel(TestUtils.proxy(sDocumentUrl));
		},

		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(this.sDefaultLanguage);
			this.oSandbox.verifyAndRestore();
		},

		sDefaultLanguage : sap.ui.getCore().getConfiguration().getLanguage()
	});

	//*********************************************************************************************
	QUnit.test("requestEntityContainer", function (assert) {
		var oDocument = {},
			oEntityContainer = {};

		this.oSandbox.mock(OlingoDocument).expects("requestDocument")
			.withExactArgs(this.oDocumentModel)
			.returns(Promise.resolve(oDocument));
		this.oSandbox.mock(OlingoDocument).expects("transformEntityContainer")
			.withExactArgs(oDocument).returns(Promise.resolve(oEntityContainer));

		return this.oDocumentModel.requestEntityContainer().then(function (oResult) {
			assert.strictEqual(oResult, oEntityContainer);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestEntityType", function (assert) {
		var oDocument = {},
			sEntityTypeName = "com.sap.gateway.iwbep.tea_busi.v0001.Worker",
			oEntityType = {};

		this.oSandbox.mock(OlingoDocument).expects("requestDocument")
			.withExactArgs(this.oDocumentModel)
			.returns(Promise.resolve(oDocument));
		this.oSandbox.mock(OlingoDocument).expects("transformEntityType")
			.withExactArgs(oDocument, sEntityTypeName)
			.returns(Promise.resolve(oEntityType));

		return this.oDocumentModel.requestEntityType(sEntityTypeName).then(function (oResult) {
			assert.strictEqual(oResult, oEntityType);
		});
	});
});

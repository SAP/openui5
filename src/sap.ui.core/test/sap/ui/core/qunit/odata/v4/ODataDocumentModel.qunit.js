/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/_OlingoDocument",
	"sap/ui/model/odata/v4/_SyncPromise",
	"sap/ui/model/odata/v4/ODataDocumentModel",
	"sap/ui/test/TestUtils"
], function (OlingoDocument, SyncPromise, ODataDocumentModel, TestUtils) {
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
	QUnit.test("getOrRequestEntityContainer", function (assert) {
		var oDocument = {},
			oEntityContainer = {};

		this.oSandbox.mock(OlingoDocument).expects("getOrRequestDocument")
			.withExactArgs(this.oDocumentModel)
			.returns(SyncPromise.resolve(oDocument));
		this.oSandbox.mock(OlingoDocument).expects("transformEntityContainer")
			.withExactArgs(oDocument).returns(oEntityContainer);

		assert.strictEqual(this.oDocumentModel.getOrRequestEntityContainer().getResult(),
			oEntityContainer, "sync promise fulfilled");
	});

	//*********************************************************************************************
	QUnit.test("getOrRequestEntityType", function (assert) {
		var oDocument = {},
			sEntityTypeName = "com.sap.gateway.iwbep.tea_busi.v0001.Worker",
			oEntityType = {};

		this.oSandbox.mock(OlingoDocument).expects("getOrRequestDocument")
			.withExactArgs(this.oDocumentModel)
			.returns(SyncPromise.resolve(oDocument));
		this.oSandbox.mock(OlingoDocument).expects("transformEntityType")
			.withExactArgs(oDocument, sEntityTypeName)
			.returns(oEntityType);

		assert.strictEqual(this.oDocumentModel.getOrRequestEntityType(sEntityTypeName).getResult(),
			oEntityType, "sync promise fulfilled");
	});
});

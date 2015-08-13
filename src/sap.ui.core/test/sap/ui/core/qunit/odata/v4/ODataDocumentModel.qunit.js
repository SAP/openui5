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
	 * You can run various tests in this module against a real OData v4 service. Set the system
	 * property "com.sap.ui5.proxy.REMOTE_LOCATION" to a server containing the Gateway test
	 * service "/sap/opu/local_v4/IWBEP/TEA_BUSI" and load the page with the request property
	 * "realOData=true".
	 */

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata": {source: "metadata.xml"},
			"/foo/$metadata": {code: 404}
		},
		bRealOData = jQuery.sap.getUriParameters().get("realOData") === "true",
		sDocumentUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/$metadata";

	/**
	 * Gets the correct service URL. Adjusts it in case of <code>bRealOData</code>, so that it is
	 * passed through the proxy.
	 *
	 * @param {string} sUrl the URL
	 * @returns {string} the adjusted URL
	 */
	function getServiceUrl(sUrl) {
		if (bRealOData) {
			sUrl = "../../../../../../../proxy" + sUrl;
		}
		return sUrl;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataDocumentModel", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			if (!bRealOData) {
				TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data",
					mFixture);
			}
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oDocumentModel = new ODataDocumentModel(getServiceUrl(sDocumentUrl));
		},

		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(this.sDefaultLanguage);
			this.oSandbox.verifyAndRestore();
		},

		sDefaultLanguage : sap.ui.getCore().getConfiguration().getLanguage()
	});

	//*********************************************************************************************
	QUnit.test("read: /EntityContainer", function (assert) {
		var sPath = "/EntityContainer?$expand=EntitySets,Singletons",
			oEntityContainer = {
				"QualifiedName" : "com.sap.gateway.iwbep.tea_busi.v0001.Container"
			};

		this.oSandbox.mock(OlingoDocument).expects("transformEntityContainer")
			.withExactArgs(sinon.match.object).returns(Promise.resolve(oEntityContainer));

		return this.oDocumentModel.read(sPath).then(function (oResult) {
			assert.deepEqual(oResult, oEntityContainer);
		});
	});

	//*********************************************************************************************
	[
		"/EntityContainer/EntitySets(Fullname='"
			+ "com.sap.gateway.iwbep.tea_busi.v0001.Container%2FEMPLOYEES')/EntityType",
		"/EntityContainer/Singletons(Fullname='"
			+ "com.sap.gateway.iwbep.tea_busi.v0001.Container%2FMe')/Type"
	].forEach(function (sPath) {
		QUnit.test("read: " + sPath, function (assert) {
			var sEntityTypeName = "com.sap.gateway.iwbep.tea_busi.v0001.Worker",
				oEntityType = {
					"QualifiedName" : sEntityTypeName
				};

			this.oSandbox.mock(OlingoDocument).expects("transformEntityType")
				.withExactArgs(sinon.match.object, sEntityTypeName)
				.returns(Promise.resolve(oEntityType));

			return this.oDocumentModel.read(sPath).then(function (oResult) {
				assert.deepEqual(oResult, oEntityType);
			});
		});
	});

	//*********************************************************************************************
	[
		"/EntityTypes",
		"/EntityContainer/Unknown",
		"/EntityContainer/EntitySets",
		"/EntityContainer/EntitySets(Name='EMPLOYEES')",
		"/EntityContainer/EntitySets(Fullname='"
			+ "com.sap.gateway.iwbep.tea_busi.v0001.Container%2FEMPLOYEES')",
		"/EntityContainer/EntitySets(Fullname='"
			+ "com.sap.gateway.iwbep.tea_busi.v0001.Container%2FEMPLOYEES')/EntityType/Name",
		"/EntityContainer/Singletons(Name='Me')",
		"/EntityContainer/Singletons(Fullname='"
			+ "com.sap.gateway.iwbep.tea_busi.v0001.Container%2FMe')",
		"/EntityContainer/Singletons(Fullname='"
			+ "com.sap.gateway.iwbep.tea_busi.v0001.Container%2FMe')/Type/Name",
		"/EntityContainer/Foo(Fullname='com.sap.gateway.iwbep.tea_busi.v0001.Container%2FMe')"
	].forEach(function (sPath) {
		QUnit.test("read:" + sPath, function (assert) {
			return this.oDocumentModel.read(sPath).then(function () {
				assert.ok(false, "unexpected success");
			})["catch"](function (oError) {
				assert.strictEqual(oError.message, "Unsupported: " + sPath);
			});
		});
	});
	// TODO Singleton:
	// 	<NavigationProperty Name="NavigationPropertyBindings" Type="Collection(Edm.Metadata.NavigationPropertyBinding)" Partner="Source" />
	// 	<NavigationProperty Name="EntityContainer" Type="Edm.Metadata.EntityContainer" Nullable="false" Partner="Singletons" />
	// 	<NavigationProperty Name="Annotations" Type="Collection(Edm.Metadata.Annotation)" Partner="Target" />
});

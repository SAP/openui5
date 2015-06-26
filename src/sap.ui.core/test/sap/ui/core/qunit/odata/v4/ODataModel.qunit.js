/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Model", "sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataPropertyBinding", "sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v2/ODataModel"
], function(Model, ODataContextBinding, ODataListBinding, ODataPropertyBinding, ODataModel,
		V2ODataModel) {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, sinon, start, strictEqual, stop, test, throws,
	odatajs
	*/
	"use strict";

	/*
	 * You can run various tests in this module against a real OData v4 service. Set the system
	 * property "com.sap.ui5.proxy.REMOTE_LOCATION" to a server containing the Gateway test
	 * service "/sap/opu/local_v4/IWBEP/TEA_BUSI" and load the page with the request property
	 * "realOData=true".
	 */

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS('TEAM_01')/Name": "Name.json",
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS('UNKNOWN')": [404, "TEAMS('UNKNOWN').json"]
		},
		oGlobalSandbox,
		oLogMock,
		bRealOData = jQuery.sap.getUriParameters().get("realOData") === "true",
		TestControl = sap.ui.core.Element.extend("TestControl", {
			metadata: {
				properties: {
					text: "string"
				}
			}
		});

	/**
	 * Prepare Sinon fake server for the given fixture.
	 *
	 * @param {string} sBase
	 *   The base URI for the response files.
	 * @param {object} mFixture
	 *   The fixture with the URLs to fake as keys and the URIs of the fake responses (relative to
	 *   sBase) as values. The content type is determined from the response file's extension.
	 */
	function setupFakeServer(sBase, mFixture) {
		var iCode,
			mHeaders,
			sMessage,
			vResponse,
			oServer,
			sSource,
			sUrl,
			mUrls = {};

		function contentType(sName) {
			if (/\.xml$/.test(sName)) {
				return "application/xml";
			}
			if (/\.json$/.test(sName)) {
				return "application/json";
			}
			return "application/x-octet-stream";
		}

		for (sUrl in mFixture) {
			vResponse = mFixture[sUrl];
			if (typeof vResponse === "number") {
				iCode = vResponse;
				sMessage = "";
				mHeaders = {};
			} else {
				if (typeof vResponse === "string") {
					iCode = 200;
					sSource = vResponse;
				} else {
					iCode = vResponse[0];
					sSource = vResponse[1];
				}
				sSource = sBase + '/' + sSource;
				sMessage = jQuery.sap.syncGetText(sSource, "", null);
				mHeaders = {"Content-Type": contentType(sSource)};
			}
			mUrls[sUrl] = [iCode, mHeaders, sMessage];
		}

		//TODO remove this workaround in IE9 for
		// https://github.com/cjohansen/Sinon.JS/commit/e8de34b5ec92b622ef76267a6dce12674fee6a73
		sinon.xhr.supportsCORS = true;

		oServer = sinon.fakeServer.create();
		sinon.FakeXMLHttpRequest.useFilters = true;
		sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl, bAsync) {
			return !(sUrl in mFixture); // do not fake if URL is unknown
		});

		for (sUrl in mUrls) {
			oServer.respondWith(sUrl, mUrls[sUrl]);
		}
		oServer.autoRespond = true;
	}

	if (!bRealOData) {
		setupFakeServer("data", mFixture);
	}

	function getServiceUrl(sUrl) {
		if (bRealOData) {
			sUrl = "../../../../../../../proxy" + sUrl;
		}
		return sUrl;
	}

	function createModel() {
		return new ODataModel(getServiceUrl("/sap/opu/local_v4/IWBEP/TEA_BUSI"));
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.v4.ODataModel", {
		beforeEach : function () {
			oGlobalSandbox = sinon.sandbox.create();
			oLogMock = oGlobalSandbox.mock(jQuery.sap.log);
			oLogMock.expects("warning").never();
			oLogMock.expects("error").never();
		},
		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			oGlobalSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		ok(new ODataModel("/foo") instanceof Model);
		throws(function () {
			new ODataModel();
		}, /Missing service URL/);
		strictEqual(new ODataModel("/foo/").sServiceUrl, "/foo", "remove trailing /");
	});

	//*********************************************************************************************
	test("Property access from ManagedObject w/o context binding", function (oAssert) {
		var oModel = createModel(),
			oControl = new TestControl({models: oModel}),
			fnDone = oAssert.async();

		oControl.bindProperty("text", "/TEAMS('TEAM_01')/Name");
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			strictEqual(oControl.getText(), "Business Suite", "property value");
			fnDone();
		});
	});

	//*********************************************************************************************
	test("Property access from ManagedObject w/ context binding", function (oAssert) {
		var oModel = createModel(),
			oControl = new TestControl({models: oModel}),
			fnDone = oAssert.async();

		oControl.bindObject("/TEAMS('TEAM_01')");
		oControl.bindProperty("text", "Name");
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			strictEqual(oControl.getText(), "Business Suite", "property value");
			fnDone();
		});
	});

	//*********************************************************************************************
	test("ODataModel.read: failure", function () {
		var oModel = createModel();

		sap.ui.getCore().getConfiguration().setLanguage("en-US");
		oLogMock.expects("error")
			.withExactArgs(
				"The requested entity of type 'TEAM' cannot be accessed. It does not exist.",
				"read(" + getServiceUrl("/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS('UNKNOWN')") + ")",
				"sap.ui.model.odata.v4.ODataModel");
		oGlobalSandbox.spy(odatajs.oData, "read");

		return oModel.read("/TEAMS('UNKNOWN')").then(function (oData) {
			ok(false, "Unexpected success");
		}, function (oError) {
			ok(oError instanceof Error);
			strictEqual(odatajs.oData.read.args[0][0].headers["accept-language"], "en-US");
			strictEqual(oError.error.code, "/IWBEP/CM_V4_APPS/002");
			strictEqual(oError.message,
				"The requested entity of type 'TEAM' cannot be accessed. It does not exist.");
		});
	});

	//*********************************************************************************************
	test("bindList", function () {
		var oModel = new ODataModel("foo"),
			oContext = {},
			oBinding = oModel.bindList("/path", oContext);

		ok(oBinding instanceof ODataListBinding);
		strictEqual(oBinding.getModel(), oModel);
		strictEqual(oBinding.getContext(), oContext);
		strictEqual(oBinding.getPath(), "/path");
		strictEqual(oBinding.iIndex, 0, "list binding unique index");
		strictEqual(oModel.bindList("/path", oContext).iIndex, 1);
		strictEqual(oModel.aLists[0], oBinding, "model stores list bindings");
		//TODO add further tests once exact behavior of bindList is clear
	});

	//*********************************************************************************************
	test("read with list binding specific path reads from list binding cache", function () {
		var iIndex = Math.floor(Math.random() * 50), // some index
			oModel = createModel(),
			oListBinding = oModel.bindList("/TEAMS"),
			oResult = {value : [{"Name" : "Business Suite"}]};

		oListBinding.oCache = {readRange : function () {}};
		oGlobalSandbox.mock(oListBinding.oCache).expects("readRange").withExactArgs(iIndex, 1)
			.once().returns(Promise.resolve(oResult));
		oGlobalSandbox.mock(odatajs.oData).expects("read").never();

		return oModel.read("/TEAMS[" + iIndex + "];list=0/Name").then(function (oData) {
			deepEqual(oData, {value : oResult.value[0]["Name"]});
		});
		//TODO support complex type properties, e.g. EMPLOYEE/Location/COUNTRY ../City/POSTALCODE
	});

	// TODO constructor: sDefaultBindingMode, mSupportedBindingModes
	// TODO constructor: test that the service URL is absolute?
	// TODO read: support the mParameters context, urlParameters, filters, sorters, batchGroupId
	// TODO read: abort
});

/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Model",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/_SyncPromise",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (Model, TypeString, ODataUtils, SyncPromise, Requestor, ODataContextBinding,
		ODataListBinding, ODataMetaModel, ODataModel, ODataPropertyBinding, TestUtils) {
	/*global odatajs, QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	/*
	 * You can run various tests in this module against a real OData v4 service using the request
	 * property "realOData". See src/sap/ui/test/TestUtils.js for details.
	 */

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS('TEAM_01')/Name": {source: "Name.json"},
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS('UNKNOWN')":
				{code: 404, source: "TEAMS('UNKNOWN').json"}
		},
		TestControl = sap.ui.core.Element.extend("test.sap.ui.model.odata.v4.ODataModel", {
			metadata: {
				properties: {
					text: "string"
				}
			}
		});

	/**
	 * Creates a v4 OData service for <code>TEA_BUSI</code>.
	 *
	 * @param {object} [mParameters] the model properties
	 * @returns {sap.ui.model.odata.v4.oDataModel} the model
	 */
	function createModel(mParameters) {
		return new ODataModel(getServiceUrl(), mParameters);
	}

	/**
	 * Returns a URL within the service that (in case of <code>bRealOData</code>), is passed
	 * through a proxy.
	 *
	 * @param {string} [sPath]
	 *   relative path (with initial /) within service
	 * @returns {string}
	 *   a URL within the service
	 */
	function getServiceUrl(sPath) {
		var sAbsolutePath = "/sap/opu/local_v4/IWBEP/TEA_BUSI/" + (sPath && sPath.slice(1) || "");

		return TestUtils.proxy(sAbsolutePath);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel", {
		beforeEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage("ab-CD");
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, mFixture);
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
			sap.ui.getCore().getConfiguration().setLanguage(this.sDefaultLanguage);
		},

		sDefaultLanguage : sap.ui.getCore().getConfiguration().getLanguage()
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		assert.throws(function () {
			return new ODataModel();
		}, new Error("Missing service root URL"));
		assert.throws(function () {
			return new ODataModel("/foo");
		}, new Error("Service root URL must end with '/'"));

		assert.strictEqual(new ODataModel("/foo/").sServiceUrl, "/foo/");
		assert.strictEqual(new ODataModel({"serviceUrl" : "/foo/"}).sServiceUrl, "/foo/",
			"serviceUrl in mParameters");
	});

	//*********************************************************************************************
	QUnit.test("Model creates Requestor", function (assert) {
		var oModel,
			oRequestor = {};

		this.mock(Requestor).expects("create").withExactArgs("/foo/", {
			"Accept-Language" : "ab-CD"
		}).returns(oRequestor);

		oModel = new ODataModel("/foo/");

		assert.ok(oModel instanceof Model);
		assert.strictEqual(oModel.oRequestor, oRequestor);
	});

	//*********************************************************************************************
	QUnit.skip("Property access from ManagedObject w/o context binding", function (assert) {
		var oModel = createModel(),
			oControl = new TestControl({models: oModel}),
			done = assert.async();

		oControl.bindProperty("text", {
			path : "/TEAMS('TEAM_01')/Name",
			type : new TypeString()
		});
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "Business Suite", "property value");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.skip("Property access from ManagedObject w/ context binding", function (assert) {
		var oModel = createModel(),
			oControl = new TestControl({models: oModel}),
			done = assert.async();

		oControl.bindObject("/TEAMS('TEAM_01')");
		oControl.bindProperty("text", {
			path : "Name",
			type : new TypeString()
		});
		// bindProperty creates an ODataPropertyBinding and calls its initialize which results in
		// checkUpdate and a request. The value is updated asynchronously via a change event later
		oControl.getBinding("text").attachChange(function () {
			assert.strictEqual(oControl.getText(), "Business Suite", "property value");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.test("ODataModel.read: missing /", function (assert) {
		var oModel = createModel();

		assert.throws(function () {
			oModel.read("TEAMS('TEAM_01')/Name");
		}, new Error("Not an absolute data binding path: TEAMS('TEAM_01')/Name"));
	});

	//*********************************************************************************************
	QUnit.skip("ODataModel.read: failure", function (assert) {
		var sMessage = "The requested entity of type 'TEAM' cannot be accessed. It does not exist."
				+ " (HTTP request failed - 404 Not Found)",
			oModel = createModel();

		this.oLogMock.expects("error").withExactArgs(sMessage,
			"GET " + getServiceUrl("/TEAMS('UNKNOWN')"),
			"sap.ui.model.odata.v4.ODataModel");
		this.oSandbox.spy(odatajs.oData, "read");
		//TODO really implement v4 OData failure handling based on Sinon fake server's response?

		return oModel.read("/TEAMS('UNKNOWN')").then(function (oData) {
			assert.ok(false, "Unexpected success");
		}, function (oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(odatajs.oData.read.args[0][0].headers["Accept-Language"], "ab-CD");
			assert.strictEqual(odatajs.oData.read.args[0][0].headers["X-CSRF-Token"], "Fetch");
			assert.strictEqual(oError.error.code, "/IWBEP/CM_V4_APPS/002");
			assert.strictEqual(oError.message, sMessage);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindList", function (assert) {
		var oModel = createModel(),
			oContext = {},
			mParameters = {"$expand" : "foo"},
			oBinding = oModel.bindList("/path", oContext, undefined, undefined, mParameters);

		assert.ok(oBinding instanceof ODataListBinding);
		assert.strictEqual(oBinding.getModel(), oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), "/path");
		assert.strictEqual(oBinding.iIndex, 0, "list binding unique index");
		assert.deepEqual(oBinding.mParameters, mParameters, "list binding parameters");
		assert.strictEqual(oBinding.sExpand, mParameters["$expand"],
			"list binding stores copy of expand param.");

		assert.strictEqual(oModel.bindList("/path", oContext).iIndex, 1);
		assert.strictEqual(oModel.aLists[0], oBinding, "model stores list bindings");
		//TODO add further tests once exact behavior of bindList is clear
		//TODO parameter aSorters and aFilters
	});

	//*********************************************************************************************
	QUnit.test("read /TEAMS[*];list=0", function (assert) {
		var i = Math.floor(Math.random() * 50), // some index
			oModel = createModel(),
			oListBinding = oModel.bindList("/TEAMS"),
			oResult = {};

		this.oSandbox.mock(oListBinding).expects("readValue")
			.withExactArgs(i, undefined, true)
			.returns(Promise.resolve(oResult));
		this.oSandbox.mock(odatajs.oData).expects("read").never();

		return oModel.read("/TEAMS[" + i + "];list=0", true)
			.then(function (oData) {
				assert.strictEqual(oData, oResult, "mimic Olingo data format");
			});
	});

	//*********************************************************************************************
	QUnit.test("read /TEAMS[*];list=0/Name", function (assert) {
		var i = Math.floor(Math.random() * 50), // some index
			oModel = createModel(),
			oListBinding = oModel.bindList("/TEAMS");

		this.oSandbox.mock(oListBinding).expects("readValue")
			.withExactArgs(i, "Name", undefined)
			.returns(Promise.resolve("Business Suite"));
		this.oSandbox.mock(odatajs.oData).expects("read").never();

		return oModel.read("/TEAMS[" + i + "];list=0/Name")
			.then(function (oData) {
				assert.deepEqual(oData, {value : "Business Suite"}, "mimic Olingo data format");
			});
	});

	//*********************************************************************************************
	QUnit.test("read /TEAMS[*];list=0/TEAM_2_EMPLOYEES", function (assert) {
		var i = Math.floor(Math.random() * 50), // some index
			oModel = createModel(),
			oListBinding = oModel.bindList("/TEAMS");

		this.oSandbox.mock(oListBinding).expects("readValue")
			.withExactArgs(i, "TEAM_2_EMPLOYEES", true)
			.returns(Promise.resolve([]));
		this.oSandbox.mock(odatajs.oData).expects("read").never();

		return oModel.read("/TEAMS[" + i + "];list=0/TEAM_2_EMPLOYEES", true)
			.then(function (oData) {
				assert.deepEqual(oData, {value : []}, "mimic Olingo data format");
			});
	});

	//*********************************************************************************************
	QUnit.test("read for list binding path propagates ODataListBinding#readValue failure",
		function (assert) {
			var oModel = createModel(),
				oListBinding = oModel.bindList("/TEAMS"),
				oError = new Error("Intentionally failed");

			this.oSandbox.mock(oListBinding).expects("readValue").returns(Promise.reject(oError));
			this.oSandbox.mock(odatajs.oData).expects("read").never();

			return oModel.read("/TEAMS[0];list=0/foo/bar").then(
				function () { assert.ok(false, "Unexpected success"); },
				function (oError0) { assert.strictEqual(oError0, oError); }
			);
		}
	);

	//*********************************************************************************************
	QUnit.test("getMetaModel", function (assert) {
		var oMetaModel = createModel().getMetaModel();

		assert.ok(oMetaModel instanceof ODataMetaModel);
	});

	//*********************************************************************************************
	QUnit.test("requestObject to metamodel", function (assert) {
		var oModel = createModel(),
			oMetaModel = oModel.getMetaModel(),
			oMetaModelMock = this.oSandbox.mock(oMetaModel),
			oMetaContext = oMetaModel.getContext("/path/into/metamodel");

		oMetaModelMock.expects("fetchMetaContext")
			.withExactArgs("/EMPLOYEES(ID='1')/ENTRYDATE")
			.returns(Promise.resolve(oMetaContext));
		oMetaModelMock.expects("fetchObject")
			.withExactArgs("Type/QualifiedName", oMetaContext)
			.returns(SyncPromise.resolve("Edm.Date"));
		return oModel.requestObject(
			"ENTRYDATE/#Type/QualifiedName", oModel.getContext("/EMPLOYEES(ID='1')")
		).then(function (sResult) {
			assert.strictEqual(sResult, "Edm.Date");
		});
	});

	//*********************************************************************************************
	QUnit.test("create", function (assert) {
		var oEmployeeData = {},
			oModel = createModel(),
			oPromise = {};

		this.mock(oModel.oRequestor).expects("request")
			.withExactArgs("POST", getServiceUrl("/EMPLOYEES"), null, oEmployeeData)
			.returns(oPromise);

		assert.strictEqual(oModel.create("/EMPLOYEES", oEmployeeData), oPromise);
	});

	//*********************************************************************************************
	QUnit.test("remove", function (assert) {
		var sCanonicalUrl = getServiceUrl("/EMPLOYEES(ID='1')"),
			sEtag = 'W/"19770724000000.0000000"',
			oModel = createModel(),
			sPath = "/EMPLOYEES[0];list=0";

		this.oSandbox.mock(oModel.oRequestor).expects("request")
			.withExactArgs("DELETE", sCanonicalUrl, {"If-Match" : sEtag})
			.returns(Promise.resolve(undefined));
		//TODO make such basic APIs like sap.ui.model.Context#getProperty work?!
		//     they could be used instead of async read()...
		//TODO use requestObject() instead of read()?
		this.oSandbox.stub(oModel, "read", function (sPath0, bAllowObjectAccess) {
			if (bAllowObjectAccess) {
				// ignore "probe call" by requestCanonicalUrl's stub
			} else {
				assert.strictEqual(sPath0, sPath + "/@odata.etag");
				assert.strictEqual(bAllowObjectAccess, undefined);
			}
			return Promise.resolve({value : sEtag});
		});
		this.oSandbox.stub(oModel.getMetaModel(), "requestCanonicalUrl",
			function (sServiceUrl, sPath0, fnRead) {
				assert.strictEqual(sServiceUrl, getServiceUrl());
				assert.strictEqual(sPath0, sPath);
				// make sure that fnRead === oModel.read.bind(oModel)
				oModel.read.reset();
				fnRead(sPath, true);
				assert.ok(oModel.read.calledOnce);
				assert.ok(oModel.read.calledWithExactly(sPath, true), "fnRead passes arguments");
				assert.ok(oModel.read.calledOn(oModel), "fnRead bound to 'this'");
				return Promise.resolve(sCanonicalUrl);
			});

		return oModel.remove(oModel.getContext(sPath)).then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		}, function (oError) {
			assert.ok(false);
		});
	});
	//TODO trigger update in case of isConcurrentModification?!
	//TODO do it anyway? what and when to return, result of remove vs. re-read?
	//TODO make sure Context objects are deleted from this.mContexts

	//*********************************************************************************************
	[
		{"response" : {"statusCode" : 404}},
		{"response" : {"statusCode" : 500}},
		undefined
	].forEach(function (oCause) {
		QUnit.test("remove: map 404 to 200, cause: " + JSON.stringify(oCause), function (assert) {
			var oError = new Error(""),
				oModel = createModel();

			oError.cause = oCause; //FIX4MASTER: _Requestor.request() does not deliver this!
			this.oSandbox.stub(oModel, "read")
				.returns(Promise.resolve({value : 'W/""'}));
			this.oSandbox.stub(oModel.getMetaModel(), "requestCanonicalUrl")
				.returns(Promise.resolve(getServiceUrl("/EMPLOYEES(ID='1')")));
			this.oSandbox.stub(oModel.oRequestor, "request")
				.returns(Promise.reject(oError));

			return oModel.remove(oModel.getContext("/EMPLOYEES[0];list=0"))
				.then(function (oResult) {
					assert.strictEqual(oResult, undefined);
					assert.ok(oCause && oCause.response.statusCode === 404, "unexpected success");
				}, function (oError0) {
					assert.strictEqual(oError0, oError);
					assert.ok(!oCause || oCause.response.statusCode !== 404,
						JSON.stringify(oError0));
				});
		});
	});
});
// TODO constructor: sDefaultBindingMode, mSupportedBindingModes
// TODO constructor: test that the service root URL is absolute?
// TODO read: support the mParameters context, urlParameters, filters, sorters, batchGroupId
// TODO read etc.: provide access to "abort" functionality

// oResponse.headers look like this:
//Content-Type:application/json; odata.metadata=minimal;charset=utf-8
//etag:W/"20150915102433.7994750"
//location:.../sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('7')
//TODO can we make use of "location" header? relation to canonical URL?
// oData looks like this:
//{
//	"@odata.context" : "$metadata#EMPLOYEES",
//	"@odata.etag" : "W/\"20150915102433.7994750\"",
//}
//TODO can we make use of @odata.context in response data?
//TODO etag handling
//TODO use 'sap/ui/thirdparty/URI' for URL handling?


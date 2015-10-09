/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Model",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (Model, TypeString, ODataUtils, Helper, ODataContextBinding, ODataListBinding,
		ODataMetaModel, ODataModel, ODataPropertyBinding, TestUtils) {
	/*global odatajs, QUnit, sinon */
	/*eslint max-nested-callbacks: 4, no-warning-comments: 0 */
	"use strict";

	/*
	 * You can run various tests in this module against a real OData v4 service. Set the system
	 * property "com.sap.ui5.proxy.REMOTE_LOCATION" to a server containing the Gateway test
	 * service "/sap/opu/local_v4/IWBEP/TEA_BUSI" and load the page with the request property
	 * "realOData=true".
	 */

	var mFixture = {
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS('TEAM_01')/Name": {source: "Name.json"},
			"/sap/opu/local_v4/IWBEP/TEA_BUSI/TEAMS('UNKNOWN')":
				{code: 404, source: "TEAMS('UNKNOWN').json"}
		},
		bRealOData = jQuery.sap.getUriParameters().get("realOData") === "true",
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

		return bRealOData
			? "/" + window.location.pathname.split("/")[1] + "/proxy" + sAbsolutePath
			: sAbsolutePath;
	}

	/**
	 * Tests that the function with the given name properly delegates to "_ODataHelper.request()".
	 *
	 * @param {string} sFunctionName
	 *   name of function to test
	 * @param {any[]} aArguments
	 *   the function's arguments
	 * @param {object} oExpectedRequest
	 *   the request expected by "_ODataHelper.request()", missing headers default to the model's
	 *   ones
	 */
	function testRequest(sFunctionName, aArguments, oExpectedRequest) {
		QUnit.test(sFunctionName, function (assert) {
			var oModel = createModel(),
				oPromise = {};

			oExpectedRequest.headers = oExpectedRequest.headers || oModel.mHeaders;

			this.oSandbox.stub(Helper, "request",
				function (oModel0, oRequest, bDoNotRefreshToken) {
					assert.strictEqual(oModel0, oModel);
					assert.deepEqual(oRequest, oExpectedRequest);
					assert.strictEqual(bDoNotRefreshToken, undefined);

					return oPromise;
				});

			assert.strictEqual(oModel[sFunctionName].apply(oModel, aArguments), oPromise);
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel", {
		beforeEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage("ab-CD");
			this.oSandbox = sinon.sandbox.create();
			if (!bRealOData) {
				TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data",
					mFixture);
			}
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

		assert.ok(new ODataModel("/foo/") instanceof Model);
		assert.strictEqual(new ODataModel("/foo/").sServiceUrl, "/foo/");
		assert.strictEqual(new ODataModel({"serviceUrl" : "/foo/"}).sServiceUrl, "/foo/",
			"serviceUrl in mParameters");
	});

	//*********************************************************************************************
	QUnit.test("Property access from ManagedObject w/o context binding", function (assert) {
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
	QUnit.test("Property access from ManagedObject w/ context binding", function (assert) {
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
	["X-CSRF-Token", "x-csrf-token", ""].forEach(function (sHeaderName) {
		QUnit.test("ODataModel.read: success with " + sHeaderName, function (assert) {
			var oModel = createModel(),
				sOldCsrfToken = oModel.mHeaders["X-CSRF-Token"];

			this.oSandbox.stub(odatajs.oData, "read", function (oRequest, fnSuccess) {
				var oResponse = {headers : {}};

				oResponse.headers[sHeaderName] = "abc123";
				assert.strictEqual(oRequest.headers["Accept-Language"], "ab-CD");
				assert.strictEqual(oRequest.headers["X-CSRF-Token"], "Fetch");
				assert.strictEqual(oRequest.requestUri, getServiceUrl("/TEAMS('TEAM_01')/Name"));
				setTimeout(fnSuccess.bind(null, {/*oData*/}, oResponse), 0);
			});

			return oModel.read("/TEAMS('TEAM_01')/Name").then(function (oData) {
				if (!sHeaderName) {
					assert.strictEqual(oModel.mHeaders["X-CSRF-Token"], sOldCsrfToken,
						"keep old CSRF token in case no one is sent");
				} else {
					assert.strictEqual(oModel.mHeaders["X-CSRF-Token"], "abc123");
				}
			}, function (oError) {
				assert.ok(false, "Unexpected failure");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("ODataModel.read: failure", function (assert) {
		var oModel = createModel();

		this.oLogMock.expects("error")
			.withExactArgs(
				"The requested entity of type 'TEAM' cannot be accessed. It does not exist.",
				"read(" + getServiceUrl("/TEAMS('UNKNOWN')") + ")",
				"sap.ui.model.odata.v4.ODataModel");
		this.oSandbox.spy(odatajs.oData, "read");
		//TODO how can we implement v4 failure handling based on the v2 mock server's response?

		return oModel.read("/TEAMS('UNKNOWN')").then(function (oData) {
			assert.ok(false, "Unexpected success");
		}, function (oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(odatajs.oData.read.args[0][0].headers["Accept-Language"], "ab-CD");
			assert.strictEqual(odatajs.oData.read.args[0][0].headers["X-CSRF-Token"], "Fetch");
			assert.strictEqual(oError.error.code, "/IWBEP/CM_V4_APPS/002");
			assert.strictEqual(oError.message,
			"The requested entity of type 'TEAM' cannot be accessed. It does not exist.");
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

		oMetaModelMock.expects("requestMetaContext")
			.withExactArgs("/EMPLOYEES(ID='1')/ENTRYDATE")
			.returns(Promise.resolve(oMetaContext));
		oMetaModelMock.expects("requestObject")
			.withExactArgs("Type/QualifiedName", oMetaContext)
			.returns(Promise.resolve("Edm.Date"));
		return oModel.requestObject(
			"ENTRYDATE/#Type/QualifiedName", oModel.getContext("/EMPLOYEES(ID='1')")
		).then(function (sResult) {
			assert.strictEqual(sResult, "Edm.Date");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuccess) {
		QUnit.test("refreshSecurityToken: success = " + bSuccess, function (assert) {
			var fnAbort = function () {},
				sErrorMessage = "HTTP request failed - 400 Bad Request: ",
				oModel = createModel(),
				oPromise;

			assert.deepEqual(oModel.mHeaders, {
				"Accept-Language" : "ab-CD",
				"X-CSRF-Token" : "Fetch"
			});

			this.oSandbox.stub(odatajs.oData, "read", function (oRequest, fnSuccess, fnFailure) {
				assert.strictEqual(oRequest.headers["X-CSRF-Token"], "Fetch");
				assert.strictEqual(oRequest.method, "HEAD");
				assert.strictEqual(oRequest.requestUri, getServiceUrl());

				if (bSuccess) {
					setTimeout(fnSuccess.bind(null, undefined, {
						"headers" : {
							"x-csrf-token" : "abc123"
						}
					}), 0);
				} else {
					setTimeout(fnFailure.bind(null, {
						"message" : "HTTP request failed",
						"response" : {
							"body" : "",
							"requestUri" : "/sap/opu/local_v4/IWBEP/TEA_BUSI/",
							"statusCode" : 400,
							"statusText" : "Bad Request"
						}
					}), 0);
				}

				return {abort: fnAbort};
			});

			oPromise = oModel.refreshSecurityToken();

			assert.strictEqual(oPromise.abort, fnAbort, "access to abort provided");
			assert.strictEqual(oModel.refreshSecurityToken(), oPromise, "promise reused");
			assert.ok(odatajs.oData.read.calledOnce, "only one HEAD request underway at any time");

			return oPromise.then(function () {
				assert.ok(bSuccess, "success possible");
				assert.strictEqual(oModel.mHeaders["X-CSRF-Token"], "abc123");
			}, function (oError) {
				assert.ok(!bSuccess, "certain failure");
				assert.ok(oError instanceof Error);
				assert.strictEqual(oError.message, sErrorMessage);
				assert.strictEqual(oModel.mHeaders["X-CSRF-Token"], "Fetch");
			}).then(function () {
				var oNewPromise = oModel.refreshSecurityToken();

				assert.notStrictEqual(oNewPromise, oPromise, "new promise");
				// avoid "Uncaught (in promise)"
				oNewPromise["catch"](function (oError0) {
					assert.strictEqual(oError0.message, sErrorMessage);
				});
			});
		});
	});

	//*********************************************************************************************
	(function () {
		var oEmployeeData = {};

		testRequest("create", ["/EMPLOYEES", oEmployeeData], {
			data : oEmployeeData,
//			headers : oModel.mHeaders,
			method : "POST",
			requestUri : getServiceUrl("/EMPLOYEES")
		});
	}());

	//*********************************************************************************************
	QUnit.test("remove", function (assert) {
		var oModel = createModel(),
			sPath = "/EMPLOYEES[0];list=0",
			oResult = {};

		this.oSandbox.stub(Helper, "request", function (oModel0, oRequest, bDoNotRefreshToken) {
			assert.strictEqual(oModel0, oModel);
			assert.deepEqual(oRequest, {
				headers : {
					"If-Match" : "*" //TODO etag support!
				},
				method : "DELETE",
				requestUri : getServiceUrl("/EMPLOYEES(ID='1')")
			});
			assert.strictEqual(bDoNotRefreshToken, undefined);
			return Promise.resolve(oResult);
		});
		this.oSandbox.stub(oModel, "read");
		this.oSandbox.stub(oModel.getMetaModel(), "requestCanonicalUrl",
			function (sServiceUrl, sPath0, fnRead) {
				assert.strictEqual(sServiceUrl, getServiceUrl());
				assert.strictEqual(sPath0, sPath);
				// make sure that fnRead === oModel.read.bind(oModel)
				assert.ok(!oModel.read.called);
				fnRead(sPath, true);
				assert.ok(oModel.read.calledOnce);
				assert.ok(oModel.read.calledWithExactly(sPath, true), "fnRead passes arguments");
				assert.ok(oModel.read.calledOn(oModel), "fnRead bound to 'this'");

				return Promise.resolve(getServiceUrl("/EMPLOYEES(ID='1')"));
			});

		return oModel.remove(oModel.getContext(sPath)).then(function (oResult0) {
			assert.strictEqual(oResult0, oResult);
		}, function (oError) {
			assert.ok(false);
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
//location:https://ldai1ui3.wdf.sap.corp:44332/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('7')
//TODO can we make use of "location" header? relation to canonical URL?
// oData looks like this:
//{
//	"@odata.context" : "$metadata#EMPLOYEES",
//	"@odata.etag" : "W/\"20150915102433.7994750\"",
//}
//TODO can we make use of @odata.context in response data?
//TODO etag handling
//TODO use 'sap/ui/thirdparty/URI' for URL handling?
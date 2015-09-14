/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Model",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataMetaModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataPropertyBinding",
	"sap/ui/test/TestUtils"
], function (Model, TypeString, ODataContextBinding, ODataListBinding, ODataMetaModel, ODataModel,
		ODataPropertyBinding, TestUtils) {
	/*global odatajs, QUnit, sinon */
	/*eslint no-warning-comments: 0 */
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
	 * Returns a URL within the service.
	 *
	 * @param {string} [sPath]
	 *   relative path (with initial /) within service
	 * @returns {string}
	 *   a URL within the service
	 */
	function getServiceUrl(sPath) {
		return proxy("/sap/opu/local_v4/IWBEP/TEA_BUSI/" + (sPath && sPath.slice(1) || ""));
	}

	/**
	 * Adjusts the given absolute path so that (in case of <code>bRealOData</code>), is passed
	 * through a proxy.
	 *
	 * @param {string} sAbsolutePath
	 *   some absolute path
	 * @returns {string}
	 *   the absolute path transformed in a way that invokes a proxy
	 */
	function proxy(sAbsolutePath) {
		return bRealOData
			? "/" + window.location.pathname.split("/")[1] + "/proxy" + sAbsolutePath
			: sAbsolutePath;
	}

	/**
	 * Sets up stubs for "odatajs.oData.request" and "ODataModel#refreshSecurityToken" in the given
	 * sandbox, suitable for entity creation.
	 *
	 * With <code>bRequestSucceeds === false</code>, "request" always fails,
	 * with <code>bRequestSucceeds === true</code>, "request" always succeeds,
	 * else "request" first fails due to missing CSRF token which can be fetched via
	 * "ODataModel#refreshSecurityToken".
	 *
	 * Assertions are put in place based on the given model's headers and the given employee data.
	 *
	 * @param {object} oSandbox
	 *   Sinon's global sandbox
	 * @param {object} assert
	 *   Sinon's "assert" object
	 * @param {object} oEmployeeData
	 *   the employee data expected by "request"
	 * @param {sap.ui.model.odata.v4.Model} oModel
	 *   the OData model
	 * @param {boolean} bRequestSucceeds
	 *   see above
	 * @param {boolean} [bReadFails=false]
	 *   whether reading of CSRF token fails
	 * @param {string} [sRequired="Required"]
	 *   some variation of "Required"
	 * @param {boolean} [bDoNotDeliverToken=false]
	 *   whether read of CSRF token will succeed, but not deliver a valid CSRF token
	 * @return {object|string}
	 *   the data returned by a successful "request" or the error message in case of certain
	 *   failure
	 */
	function setupForCreate(oSandbox, assert, oEmployeeData, oModel, bRequestSucceeds,
			bReadFails, sRequired, bDoNotDeliverToken) {
		var oData = {},
			sReadError = "HTTP request failed - 400 Bad Request: ",
			oRequestError = {
				"message" : "HTTP request failed",
				"request" : {/*...*/},
				"response" : {
					"body" : "CSRF token validation failed",
					"headers" : {
						"x-csrf-token" : sRequired || "Required",
						"Content-Length" : "28",
						"Content-Type" : "text/plain;charset=utf-8"
					},
					"requestUri" : getServiceUrl("/EMPLOYEES"),
					"statusCode" : 403,
					"statusText" : "Forbidden"
				}
			};

		if (bRequestSucceeds === false) {
			// simulate a server which does not require a CSRF token, but fails otherwise
			delete oRequestError.response.headers["x-csrf-token"];
		}

		oSandbox.stub(odatajs.oData, "request", function (oRequest, fnSuccess, fnFailure) {
			assert.strictEqual(oRequest.data, oEmployeeData);
			assert.deepEqual(oRequest.headers, oModel.mHeaders);
			assert.strictEqual(oRequest.method, "POST");
			assert.strictEqual(oRequest.requestUri, getServiceUrl("/EMPLOYEES"));

			if (bRequestSucceeds === true
				|| bRequestSucceeds === undefined
				&& oRequest.headers["X-CSRF-Token"] === "abc123") {
				setTimeout(fnSuccess.bind(null, oData), 0);
			} else {
				setTimeout(fnFailure.bind(null, oRequestError), 0);
			}
		});

		if (bRequestSucceeds !== undefined) {
			oSandbox.mock(oModel).expects("refreshSecurityToken").never();
		} else {
			oSandbox.stub(oModel, "refreshSecurityToken", function () {
				return new Promise(function (fnResolve, fnReject) {
					setTimeout(function () {
						if (bReadFails) {
							fnReject(new Error(sReadError));
						} else {
							oModel.mHeaders["X-CSRF-Token"]
								= bDoNotDeliverToken ? undefined : "abc123";
							fnResolve();
						}
					}, 0);
				});
			});
		}

		if (bRequestSucceeds === false || bDoNotDeliverToken) {
			// expect failure
			return "HTTP request failed - 403 Forbidden: CSRF token validation failed";
		}
		if (bReadFails) {
			// expect failure
			return sReadError;
		}
		return oData; // expect success
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
	QUnit.test("read for list binding path uses ODataListBinding#readValue", function (assert) {
		var iIndex = Math.floor(Math.random() * 50), // some index
			oModel = createModel(),
			oListBinding = oModel.bindList("/TEAMS"),
			oResult = {};

		this.oSandbox.mock(oListBinding).expects("readValue").withExactArgs(iIndex, "foo/bar", true)
			.returns(Promise.resolve(oResult));
		this.oSandbox.mock(odatajs.oData).expects("read").never();

		return oModel.read("/TEAMS[" + iIndex + "];list=0/foo/bar", true).then(function (oData) {
			assert.deepEqual(oData, {value : oResult});
			assert.strictEqual(oData.value, oResult);
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
	[{
		bRequestSucceeds : true, sTitle : "success"
	}, {
		bRequestSucceeds : false, sTitle : "failure"
	}, {
		sRequired : "Required", sTitle : "CSRF token Required"
	}, {
		sRequired : "required", sTitle : "CSRF token required"
	}, {
		bReadFails : true, sTitle : "fetch CSRF token fails"
	}, {
		bDoNotDeliverToken : true, sTitle : "no CSRF token can be fetched"
	}].forEach(function (o) {
		QUnit.test("create: " + o.sTitle, function (assert) {
			var oEmployeeData = {},
				oModel = createModel(),
				vExpectedResult = setupForCreate(this.oSandbox, assert, oEmployeeData, oModel,
					o.bRequestSucceeds, o.bReadFails, o.sRequired, o.bDoNotDeliverToken),
				bSuccess = o.bRequestSucceeds !== false && !o.bReadFails && !o.bDoNotDeliverToken;

			assert.deepEqual(oModel.mHeaders, {
				"Accept-Language" : "ab-CD",
				"X-CSRF-Token" : "Fetch"
			});

			return oModel.create("/EMPLOYEES", oEmployeeData).then(function (oData) {
				assert.ok(bSuccess, "success possible");
				assert.strictEqual(oData, vExpectedResult);
			}, function (oError) {
				assert.ok(!bSuccess, "certain failure");
				assert.ok(oError instanceof Error);
				assert.strictEqual(oError.message, vExpectedResult);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("ODataModel.create: missing /", function (assert) {
		var oModel = createModel();

		assert.throws(function () {
			oModel.create("EMPLOYEES");
		}, new Error("Not an absolute data binding path: EMPLOYEES"));
	});

	//*********************************************************************************************
	QUnit.test("refreshSecurityToken: success", function (assert) {
		var fnAbort = function () {},
			oModel = createModel(),
			oPromise;

		this.oSandbox.stub(odatajs.oData, "read", function (oRequest, fnSuccess, fnFailure) {
			assert.strictEqual(oRequest.headers["X-CSRF-Token"], "Fetch");
			assert.strictEqual(oRequest.method, "HEAD");
			assert.strictEqual(oRequest.requestUri, getServiceUrl());

			setTimeout(fnSuccess.bind(null, undefined, {
				"body" : "",
				"headers" : {
					"x-csrf-token" : "abc123",
					"Content-Length" : "0"
				},
				"requestUri" : getServiceUrl(),
				"statusCode" : 200,
				"statusText" : "OK"
			}), 0);

			return {abort: fnAbort};
		});

		oPromise = oModel.refreshSecurityToken();

		assert.strictEqual(oPromise.abort, fnAbort, "access to abort provided");
		assert.strictEqual(oModel.refreshSecurityToken(), oPromise, "promise reused");
		assert.ok(odatajs.oData.read.calledOnce, "only one HEAD request underway at any time");

		return oPromise.then(function () {
			assert.strictEqual(oModel.mHeaders["X-CSRF-Token"], "abc123");

			assert.notStrictEqual(oModel.refreshSecurityToken(), oPromise, "new promise");
		}, function (oError) {
			assert.ok(false, oError.message + "@" + oError.stack);
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshSecurityToken: failure", function (assert) {
		var fnAbort = function () {},
			oModel = createModel(),
			oPromise;

		this.oSandbox.stub(odatajs.oData, "read", function (oRequest, fnSuccess, fnFailure) {
			assert.strictEqual(oRequest.headers["X-CSRF-Token"], "Fetch");
			assert.strictEqual(oRequest.method, "HEAD");
			assert.strictEqual(oRequest.requestUri, getServiceUrl());

			setTimeout(fnFailure.bind(null, {
				"message" : "HTTP request failed",
				"request" : {/*...*/},
				"response" : {
					"body" : "",
					"headers" : {
						"Content-Length" : "0"
					},
					"requestUri" : getServiceUrl(),
					"statusCode" : 400,
					"statusText" : "Bad Request"
				}
			}), 0);

			return {abort: fnAbort};
		});

		oPromise = oModel.refreshSecurityToken();

		assert.strictEqual(oPromise.abort, fnAbort, "access to abort provided");
		assert.strictEqual(oModel.refreshSecurityToken(), oPromise, "promise reused");
		assert.ok(odatajs.oData.read.calledOnce, "only one HEAD request underway at any time");

		return oPromise.then(function () {
			assert.ok(false);
		}, function (oError) {
			var oNewPromise;

			assert.ok(oError instanceof Error);
			assert.strictEqual(oError.message, "HTTP request failed - 400 Bad Request: ");
			assert.strictEqual(oModel.mHeaders["X-CSRF-Token"], "Fetch");

			oNewPromise = oModel.refreshSecurityToken();

			assert.notStrictEqual(oNewPromise, oPromise, "new promise");
			// avoid "Uncaught (in promise)"
			oNewPromise["catch"](function (oError0) {
				assert.strictEqual(oError0.message, "HTTP request failed - 400 Bad Request: ");
			});
		});
	});
});
// TODO constructor: sDefaultBindingMode, mSupportedBindingModes
// TODO constructor: test that the service root URL is absolute?
// TODO read: support the mParameters context, urlParameters, filters, sorters, batchGroupId
// TODO read, create etc.: provide access to "abort" functionality

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

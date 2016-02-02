/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils"
], function (Requestor, Helper, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	/**
	 * Creates a mock for jQuery's XHR wrapper.
	 *
	 * @param {object} assert
	 *   QUnit assert
	 * @param {object} oPayload
	 *   the response payload
	 * @param {string} sTextStatus
	 *   the XHR's status as text
	 * @param {string} [sToken=null]
	 *   optional CSRF token returned by server
	 * @returns {object}
	 *   a mock for jQuery's XHR wrapper
	 */
	function createMock(assert, oPayload, sTextStatus, sToken) {
		var jqXHR = new jQuery.Deferred();

		setTimeout(function () {
			jqXHR.resolve(oPayload, sTextStatus, { // mock jqXHR for success handler
				getResponseHeader : function (sName) {
					// Note: getResponseHeader treats sName case insensitive!
					assert.strictEqual(sName, "X-CSRF-Token");
					return sToken || null;
				}
			});
		}, 0);

		return jqXHR;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Requestor", {
		beforeEach : function () {
			// workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			// resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			sap.ui.getVersionInfo();

			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("Requestor is an object, not a constructor function", function (assert) {
		assert.strictEqual(typeof Requestor, "object");
	});

	//*********************************************************************************************
	QUnit.test("getServiceUrl", function (assert) {
		var sServiceUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/",
			oRequestor = Requestor.create(sServiceUrl, undefined, {"foo" : "bar"});

		// code under test
		assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl);
	});

	//*********************************************************************************************
	QUnit.test("request", function (assert) {
		var oPayload = {"foo" : 42},
			oPromise,
			sServiceUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/",
			oRequestor = Requestor.create(sServiceUrl, undefined, {
				"foo" : "URL params are ignored for normal requests"
			}),
			oResult = {};

		this.oSandbox.mock(jQuery).expects("ajax")
			.withExactArgs(sServiceUrl + "Employees?foo=bar", {
				data : JSON.stringify(oPayload),
				headers : sinon.match({"Content-Type" : "application/json;charset=UTF-8"}),
				method : "FOO"
			}).returns(createMock(assert, oResult, "OK"));

		// code under test
		oPromise = oRequestor.request("FOO", "Employees?foo=bar", {"Content-Type" : "wrong"},
			oPayload);

		return oPromise.then(function (result){
				assert.strictEqual(result, oResult);
			});
	});

	//*********************************************************************************************
	[{ // predefined headers can be overridden, but are not modified for later
		defaultHeaders : {"Accept" : "application/json;odata.metadata=full"},
		requestHeaders : {"OData-MaxVersion" : "5.0", "OData-Version" : "4.1"},
		result : {
			"Accept" : "application/json;odata.metadata=full",
			"OData-MaxVersion" : "5.0",
			"OData-Version" : "4.1"
		}
	}, {
		defaultHeaders : undefined,
		requestHeaders : undefined,
		result : {}
	}, {
		defaultHeaders : {"Accept-Language" : "ab-CD"},
		requestHeaders : undefined,
		result : {"Accept-Language" : "ab-CD"}
	}, {
		defaultHeaders : undefined,
		requestHeaders : {"Accept-Language" : "ab-CD"},
		result : {"Accept-Language" : "ab-CD"}
	}, {
		defaultHeaders : {"Accept-Language" : "ab-CD"},
		requestHeaders : {"foo" : "bar"},
		result : {"Accept-Language" : "ab-CD", "foo" : "bar"}
	}].forEach(function (mHeaders) {
		QUnit.test("request, headers: " + JSON.stringify(mHeaders), function (assert) {
			var mDefaultHeaders = clone(mHeaders.defaultHeaders),
				oPromise,
				mRequestHeaders = clone(mHeaders.requestHeaders),
				oRequestor = Requestor.create("/sap/opu/local_v4/IWBEP/TEA_BUSI/", mDefaultHeaders),
				oResult = {},
				// add predefined request headers for OData v4
				mResultHeaders = jQuery.extend({}, {
					"Accept" : "application/json;odata.metadata=minimal",
					"Content-Type" : "application/json;charset=UTF-8",
					"OData-MaxVersion" : "4.0",
					"OData-Version" : "4.0",
					"X-CSRF-Token" : "Fetch"
				}, mHeaders.result);

			function clone(o) {
				return o && JSON.parse(JSON.stringify(o));
			}

			this.oSandbox.mock(jQuery).expects("ajax")
				.withExactArgs("/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees", {
					data : undefined,
					headers : mResultHeaders,
					method : "GET"
				}).returns(createMock(assert, oResult, "OK"));

			// code under test
			oPromise = oRequestor.request("GET", "Employees", mRequestHeaders);

			assert.deepEqual(mDefaultHeaders, mHeaders.defaultHeaders,
				"caller's map is unchanged");
			assert.deepEqual(mRequestHeaders, mHeaders.requestHeaders,
				"caller's map is unchanged");
			assert.ok(oPromise instanceof Promise);
			return oPromise.then(function (result){
					assert.strictEqual(result, oResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), store CSRF token from server", function (assert) {
		var oRequestor = Requestor.create("/");

		this.oSandbox.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK", "abc123"));

		return oRequestor.request("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), keep old CSRF token in case no one is sent", function (assert) {
		var oRequestor = Requestor.create("/", {"X-CSRF-Token" : "abc123"});

		this.oSandbox.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "abc123"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK", /*sToken*/null));

		return oRequestor.request("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), keep fetching CSRF token in case no one is sent", function (assert) {
		var oMock = this.oSandbox.mock(jQuery),
			oRequestor = Requestor.create("/");

		oMock.expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK", /*sToken*/null));

		return oRequestor.request("GET", "").then(function () {
			oMock.expects("ajax")
				.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
				.returns(createMock(assert, {/*oPayload*/}, "OK", /*sToken*/null));

			return oRequestor.request("GET", "");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuccess) {
		QUnit.test("refreshSecurityToken: success = " + bSuccess, function (assert) {
			var oError = {},
				oPromise,
				oRequestor = Requestor.create("/~/", undefined, {"sap-client" : "123"}),
				oTokenRequiredResponse = {};

			this.oSandbox.mock(Helper).expects("createError")
				.exactly(bSuccess ? 0 : 2)
				.withExactArgs(oTokenRequiredResponse)
				.returns(oError);

			this.oSandbox.stub(jQuery, "ajax", function (sUrl, oSettings) {
				var jqXHR;

				assert.strictEqual(sUrl, "/~/?sap-client=123");
				assert.strictEqual(oSettings.headers["X-CSRF-Token"], "Fetch");
				assert.strictEqual(oSettings.method, "HEAD");

				if (bSuccess) {
					jqXHR = createMock(assert, undefined, "nocontent", "abc123");
				} else {
					jqXHR = new jQuery.Deferred();
					setTimeout(function () {
						jqXHR.reject(oTokenRequiredResponse);
					}, 0);
				}

				return jqXHR;
			});
			assert.strictEqual("X-CSRF-Token" in oRequestor.mHeaders, false);

			// code under test
			oPromise = oRequestor.refreshSecurityToken();

			assert.strictEqual(oRequestor.refreshSecurityToken(), oPromise, "promise reused");
			assert.ok(jQuery.ajax.calledOnce, "only one HEAD request underway at any time");

			return oPromise.then(function () {
				assert.ok(bSuccess, "success possible");
				assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
			}, function (oError0) {
				assert.ok(!bSuccess, "certain failure");
				assert.strictEqual(oError0, oError);
				assert.strictEqual("X-CSRF-Token" in oRequestor.mHeaders, false);
			}).then(function () {
				var oNewPromise = oRequestor.refreshSecurityToken();

				assert.notStrictEqual(oNewPromise, oPromise, "new promise");
				// avoid "Uncaught (in promise)"
				oNewPromise["catch"](function (oError1) {
					assert.strictEqual(oError1, oError);
				});
			});
		});
	});

	//*********************************************************************************************
	[{
		sRequired : null, bRequestSucceeds : true, sTitle : "success"
	}, {
		// simulate a server which does not require a CSRF token, but fails with 403
		sRequired : null, bRequestSucceeds : false, sTitle : "failure with 403"
	}, {
		// simulate a server which does not require a CSRF token, but fails otherwise
		sRequired : "Required", bRequestSucceeds : false, iStatus : 500, sTitle : "failure with 500"
	}, {
		sRequired : "Required", sTitle : "CSRF token Required"
	}, {
		sRequired : "required", sTitle : "CSRF token required"
	}, {
		sRequired : "Required", bReadFails : true, sTitle : "fetch CSRF token fails"
	}, {
		sRequired : "Required", bDoNotDeliverToken : true, sTitle : "no CSRF token can be fetched"
	}].forEach(function (o) {
		QUnit.test("request: " + o.sTitle, function (assert) {
			var oError = {},
				oReadFailure = {},
				oRequestor = Requestor.create("/~/"),
				oRequestPayload = {},
				oResponsePayload = {},
				bSuccess = o.bRequestSucceeds !== false && !o.bReadFails && !o.bDoNotDeliverToken,
				oTokenRequiredResponse = {
					getResponseHeader : function (sName) {
						// Note: getResponseHeader treats sName case insensitive!
						assert.strictEqual(sName, "X-CSRF-Token");
						return o.sRequired;
					},
					"status" : o.iStatus || 403
				};

			this.oSandbox.mock(Helper).expects("createError")
				.exactly(bSuccess || o.bReadFails ? 0 : 1)
				.withExactArgs(oTokenRequiredResponse)
				.returns(oError);

			// With <code>bRequestSucceeds === false</code>, "request" always fails,
			// with <code>bRequestSucceeds === true</code>, "request" always succeeds,
			// else "request" first fails due to missing CSRF token which can be fetched via
			// "ODataModel#refreshSecurityToken".
			this.oSandbox.stub(jQuery, "ajax", function (sUrl0, oSettings) {
				var jqXHR;

				assert.strictEqual(sUrl0, "/~/foo");
				assert.strictEqual(oSettings.data, JSON.stringify(oRequestPayload));
				assert.strictEqual(oSettings.method, "FOO");
				assert.strictEqual(oSettings.headers.foo, "bar");

				if (o.bRequestSucceeds === true
					|| o.bRequestSucceeds === undefined
					&& oSettings.headers["X-CSRF-Token"] === "abc123") {
					jqXHR = createMock(assert, oResponsePayload, "OK");
				} else {
					jqXHR = new jQuery.Deferred();
					setTimeout(function () {
						jqXHR.reject(oTokenRequiredResponse);
					}, 0);
				}

				return jqXHR;
			});

			if (o.bRequestSucceeds !== undefined) {
				this.oSandbox.mock(oRequestor).expects("refreshSecurityToken").never();
			} else {
				this.oSandbox.stub(oRequestor, "refreshSecurityToken", function () {
					return new Promise(function (fnResolve, fnReject) {
						setTimeout(function () {
							if (o.bReadFails) { // reading of CSRF token fails
								fnReject(oReadFailure);
							} else {
								// HEAD might succeed, but not deliver a valid CSRF token
								oRequestor.mHeaders["X-CSRF-Token"]
									= o.bDoNotDeliverToken ? undefined : "abc123";
								fnResolve();
							}
						}, 0);
					});
				});
			}

			return oRequestor.request("FOO", "foo", {"foo" : "bar"}, oRequestPayload)
				.then(function (oPayload) {
					assert.ok(bSuccess, "success possible");
					assert.strictEqual(oPayload, oResponsePayload);
				}, function (oError0) {
					assert.ok(!bSuccess, "certain failure");
					assert.strictEqual(oError0, o.bReadFails ? oReadFailure : oError);
				});
		});
	});
});

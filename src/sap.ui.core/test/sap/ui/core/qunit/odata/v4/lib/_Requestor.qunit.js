/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Batch",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (Batch, Helper, Requestor,TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/";

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
	 * @param {string} [sContentType=null]
	 *   optional Content-Type returned by server
	 * @returns {object}
	 *   a mock for jQuery's XHR wrapper
	 */
	function createMock(assert, oPayload, sTextStatus, sToken, sContentType) {
		var jqXHR = new jQuery.Deferred();

		setTimeout(function () {
			jqXHR.resolve(oPayload, sTextStatus, { // mock jqXHR for success handler
				getResponseHeader : function (sName) {
					// Note: getResponseHeader treats sName case insensitive!
					switch (sName) {
					case "X-CSRF-Token":
						return sToken || null;
					case "Content-Type":
						return sContentType || null;
					default:
						assert.ok(false, "unexpected getResponseHeader(" + sName + ")");
					}
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
		var oRequestor = Requestor.create(sServiceUrl, undefined, {"foo" : "bar"});

		// code under test
		assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl);
	});

	//*********************************************************************************************
	QUnit.test("request", function (assert) {
		var oPayload = {"foo" : 42},
			oPromise,
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
		oPromise = oRequestor.request("FOO", "Employees?foo=bar", undefined,
			{"Content-Type" : "wrong"}, oPayload);

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
				oRequestor = Requestor.create(sServiceUrl, mDefaultHeaders),
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
				.withExactArgs(sServiceUrl + "Employees", {
					data : undefined,
					headers : mResultHeaders,
					method : "GET"
				}).returns(createMock(assert, oResult, "OK"));

			// code under test
			oPromise = oRequestor.request("GET", "Employees", undefined, mRequestHeaders);

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
				oRequestor = Requestor.create("/Service/", undefined, {"sap-client" : "123"}),
				oTokenRequiredResponse = {};

			this.oSandbox.mock(Helper).expects("createError")
				.exactly(bSuccess ? 0 : 2)
				.withExactArgs(oTokenRequiredResponse)
				.returns(oError);

			this.oSandbox.stub(jQuery, "ajax", function (sUrl, oSettings) {
				var jqXHR;

				assert.strictEqual(sUrl, "/Service/?sap-client=123");
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
				oRequestor = Requestor.create("/Service/"),
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

				assert.strictEqual(sUrl0, "/Service/foo");
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

			return oRequestor.request("FOO", "foo", undefined, {"foo" : "bar"}, oRequestPayload)
				.then(function (oPayload) {
					assert.ok(bSuccess, "success possible");
					assert.strictEqual(oPayload, oResponsePayload);
				}, function (oError0) {
					assert.ok(!bSuccess, "certain failure");
					assert.strictEqual(oError0, o.bReadFails ? oReadFailure : oError);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): with empty group", function (assert) {
		var oRequestor = Requestor.create("/Service/");

		this.oSandbox.mock(oRequestor).expects("request").never();

		return oRequestor.submitBatch("testGroupId").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bAsynchronous) {
		QUnit.test("submitBatch(bAsynchronous=" + bAsynchronous + "): success", function (assert) {
			var aExpectedRequests = [{
					method: "GET",
					url: "Products",
					headers: {
						"Accept" : "application/json;odata.metadata=full",
						"Foo" : "bar"
					},
					body: undefined,
					$reject: sinon.match.typeOf("function"),
					$resolve: sinon.match.typeOf("function")
				}, {
					method: "POST",
					url: "Customers",
					headers: {
						"Accept" : "application/json;odata.metadata=minimal",
						"Foo" : "baz"
					},
					body: '{"ID":1}',
					$reject: sinon.match.typeOf("function"),
					$resolve: sinon.match.typeOf("function")
				}],
				oFirst,
				aResults = [{"foo1" : "bar1"}, {"foo2" : "bar2"}],
				oSecond,
				aBatchResults = [
					{responseText: JSON.stringify(aResults[0])},
					{responseText: JSON.stringify(aResults[1])}
				],
				oRequestor = Requestor.create("/Service/", {"sap-client" : "123"});

			oRequestor.request("GET", "Products", "group1", {
				Foo : "bar",
				Accept : "application/json;odata.metadata=full"
			}).then(function (oResult) {
				assert.deepEqual(oResult, aResults[0]);
				aResults[0] = null;
			});

			if (bAsynchronous) {
				// This must not trigger a $batch only for Products
				oFirst = oRequestor.submitBatch("group1", true);
			}

			oRequestor.request("POST", "Customers", "group1", {
				Foo : "baz"
			}, {
				"ID" : 1
			}).then(function (oResult) {
				assert.deepEqual(oResult, aResults[1]);
				aResults[1] = null;
			});
			oRequestor.request("GET", "SalesOrders", "group2");

			this.oSandbox.mock(oRequestor).expects("request")
				.withExactArgs("POST", "$batch", undefined, undefined, aExpectedRequests)
				.returns(Promise.resolve(aBatchResults));

			oSecond = oRequestor.submitBatch("group1", bAsynchronous);

			if (bAsynchronous) {
				assert.ok(oFirst === oSecond, "promise re-used");
			} else {
				oRequestor.submitBatch("group1"); // must not call request again
				assert.strictEqual(oRequestor.mBatchQueue.group1, undefined);
			}

			TestUtils.deepContains(oRequestor.mBatchQueue.group2, [{
				method: "GET",
				url: "SalesOrders"
			}]);

			return oSecond.then(function (oResult) {
				assert.strictEqual(oResult, undefined);
				assert.deepEqual(aResults, [null, null], "all batch requests already resolved");
			});
		});
	});
	// TODO Is that.mHeaders relevant for requests in the body of a $batch?

	//*********************************************************************************************
	QUnit.test("submitBatch: asynchronous queue management", function (assert) {
		var oRequestor = Requestor.create("/Service/"),
			fnRequest = oRequestor.request;

		this.oSandbox.stub(oRequestor, "request", function (sMethod, sResourcePath) {
			if (sResourcePath === "$batch") {
				return Promise.resolve([{responseText : "{}"}]);
			}
			return fnRequest.apply(this, arguments);
		});

		// requests two queues asynchronously at the same time
		return Promise.all([
			oRequestor.request("GET", "Products", "group1"),
			oRequestor.request("GET", "Customers", "group2"),
			oRequestor.submitBatch("group1", true),
			oRequestor.submitBatch("group2", true)
		]).then(function () {
			// ensure that a subsequent asynchronous request is processed correctly
			return Promise.all([
				oRequestor.request("GET", "Products", "group1"),
				oRequestor.submitBatch("group1", true)
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): $batch failure", function (assert) {
		var oBatchError = new Error("$batch request failed"),
			oRequestError = new Error("HTTP request was not processed because $batch failed"),
			aPromises = [],
			oRequestor = Requestor.create("/Service/");

		function unexpectedSuccess() {
			assert.ok(false, "unexpected success");
		}

		function assertError(oError) {
			assert.deepEqual(oError, oRequestError);
		}

		oRequestError.cause = oBatchError;
		aPromises.push(oRequestor.request("GET", "Products", "group")
			.then(unexpectedSuccess, assertError));
		aPromises.push(oRequestor.request("GET", "Customers", "group")
			.then(unexpectedSuccess, assertError));

		this.oSandbox.mock(oRequestor).expects("request")
			.returns(Promise.reject(oBatchError));

		aPromises.push(oRequestor.submitBatch("group").then(unexpectedSuccess, function(oError) {
			assert.strictEqual(oError, oBatchError);
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): failure followed by another request", function (assert) {
		var oError = {error: {message: "404 Not found"}},
			aBatchResult = [{
				headers : {},
				responseText : "{}",
				status : 200,
				statusText : "ok"
			}, {
				getResponseHeader: function () {
					return "application/json";
				},
				headers : {"Content-Type":"application/json"},
				responseText : JSON.stringify(oError),
				status : 404,
				statusText : "Not found"
			}],
			oRequestor = Requestor.create("/Service/"),
			aPromises = [];

		function unexpected () {
			assert.ok(false);
		}

		function assertError(oResultError, sMessage) {
			assert.ok(oResultError instanceof Error);
			assert.deepEqual(oResultError.error, oError.error);
			assert.strictEqual(oResultError.message, oError.error.message);
			assert.strictEqual(oResultError.status, 404);
			assert.strictEqual(oResultError.statusText, "Not found");
		}

		aPromises.push(oRequestor.request("GET", "ok", "testGroupId")
			.then(function (oResult) {
				assert.deepEqual(oResult, {});
			})["catch"](unexpected));

		aPromises.push(oRequestor.request("GET", "fail", "testGroupId")
			.then(unexpected, function (oResultError) {
				assertError(oResultError, oError.error.message);
			}));

		aPromises.push(oRequestor.request("GET", "ok", "testGroupId")
			.then(unexpected, function (oResultError) {
				assert.ok(oResultError instanceof Error);
				assert.strictEqual(oResultError.message,
					"HTTP request was not processed because the previous request failed");
				assertError(oResultError.cause);
			}));

		this.oSandbox.mock(oRequestor).expects("request")
			.returns(Promise.resolve(aBatchResult));

		aPromises.push(oRequestor.submitBatch("testGroupId").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("request(...): batch group id", function (assert) {
		var oRequestor = Requestor.create("/Service/");

		oRequestor.request("PATCH", "EntitySet", "group", {"foo": "bar"}, {"a": "b"});
		oRequestor.request("PATCH", "EntitySet", "group", {"bar": "baz"}, {"c": "d"});
		oRequestor.request("PATCH", "EntitySet", "", {"header": "value"}, {"e": "f"});

		TestUtils.deepContains(oRequestor.mBatchQueue, {
			"group" : [{
				method: "PATCH",
				url: "EntitySet",
				headers: {
					"foo": "bar"
				},
				body: JSON.stringify({"a": "b"})
			}, {
				method: "PATCH",
				url: "EntitySet",
				headers: {
					"bar": "baz"
				},
				body: JSON.stringify({"c": "d"})
			}],
			"": [{
				method: "PATCH",
				url: "EntitySet",
				headers: {
					"header": "value"
				},
				body: JSON.stringify({"e": "f"})
			}]
		});
	});

	//*********************************************************************************************
	QUnit.test("request(...): call with $batch url", function (assert) {
		var oBatchRequest = {
				body: "abcd",
				headers: {
					"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
					"MIME-Version" : "1.0"
				}
			},
			aBatchRequests = [1],
			aExpectedResponses = [],
			oRequestor = Requestor.create("/Service/", undefined, {"sap-client" : "123"}),
			oResult = "abc",
			sResponseContentType = "multipart/mixed; boundary=foo",
			oJqXHRMock = createMock(assert, oResult, "OK", "abc123", sResponseContentType);

		this.oSandbox.mock(Batch).expects("serializeBatchRequest")
			.withExactArgs(aBatchRequests)
			.returns(oBatchRequest);

		this.oSandbox.mock(jQuery).expects("ajax")
			.withExactArgs("/Service/$batch?sap-client=123", {
				data : oBatchRequest.body,
				headers : sinon.match({
					"Content-Type" : oBatchRequest.headers["Content-Type"],
					"MIME-Version" : oBatchRequest.headers["MIME-Version"]
				}),
				method : "POST"
			}).returns(oJqXHRMock);

		this.oSandbox.mock(Batch).expects("deserializeBatchResponse")
			.withExactArgs(sResponseContentType, oResult)
			.returns(aExpectedResponses);

		return oRequestor.request("POST", "$batch", undefined, undefined, aBatchRequests, true)
			.then(function (oPayload) {
				assert.strictEqual(aExpectedResponses, oPayload);
			});
	});

	//*********************************************************************************************
	if (TestUtils.isRealOData()) {
		QUnit.test("request(...)/submitBatch (realOData) success", function (assert) {
			var oRequestor = Requestor.create(TestUtils.proxy(sServiceUrl)),
				sResourcePath = "TEAMS('TEAM_01')";

			function assertResult(oPayload){
				assert.deepEqual(oPayload, {
					"@odata.context": "$metadata#TEAMS/$entity",
					"Team_Id": "TEAM_01",
					Name: "Business Suite",
					MEMBER_COUNT: 2,
					MANAGER_ID: "3",
					BudgetCurrency: "USD",
					Budget: 555.55
				});
			}

			return oRequestor.request("GET", sResourcePath).then(assertResult)
				.then(function () {
					return Promise.all([
						oRequestor.request("GET", sResourcePath, "group").then(assertResult),
						oRequestor.request("GET", sResourcePath, "group").then(assertResult),
						oRequestor.submitBatch("group")
					]);
				});
		});

		//*****************************************************************************************
		QUnit.test("request(...)/submitBatch (realOData) fail", function (assert) {
			var oRequestor = Requestor.create(TestUtils.proxy(sServiceUrl));

			oRequestor.request("GET", "TEAMS('TEAM_01')", "group").then(function (oResult) {
				assert.deepEqual(oResult, {
					"@odata.context": "$metadata#TEAMS/$entity",
					"Team_Id": "TEAM_01",
					Name: "Business Suite",
					MEMBER_COUNT: 2,
					MANAGER_ID: "3",
					BudgetCurrency: "USD",
					Budget: 555.55
				});
			}, function (oError) {
				assert.ok(false, oError);
			});

			oRequestor.request("GET", "fail", "group").then(function (oResult) {
				assert.ok(false, oResult);
			}, function (oError) {
				assert.ok(oError instanceof Error);
				assert.strictEqual(typeof oError.error, "object");
				assert.strictEqual(typeof oError.message, "string");
				assert.strictEqual(oError.status, 404);
				assert.strictEqual(oError.statusText, "Not Found");
			});

			return oRequestor.submitBatch("group").then(function (oResult) {
				assert.strictEqual(oResult, undefined);
			});
		});
	}
});
// TODO: continue-on-error? -> flag on model
// TODO: provide test that checks that .request() does not serialize twice in case of
// 		 refreshSecurityToken and repeated request
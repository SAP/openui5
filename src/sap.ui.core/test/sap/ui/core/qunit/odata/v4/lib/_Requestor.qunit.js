/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Batch",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (jQuery, _Batch, _Helper, _Requestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
		sSampleServiceUrl
			= "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/";

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

			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	QUnit.test("_Requestor is an object, not a constructor function", function (assert) {
		assert.strictEqual(typeof _Requestor, "object");
	});

	//*********************************************************************************************
	QUnit.test("getServiceUrl", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, undefined, {"foo" : "must be ignored"});

		// code under test
		assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl);
	});

	//*********************************************************************************************
	QUnit.test("request", function (assert) {
		var oPayload = {"foo" : 42},
			oPromise,
			oRequestor = _Requestor.create(sServiceUrl, undefined, {
				"foo" : "URL params are ignored for normal requests"
			}),
			oResult = {};

		this.mock(jQuery).expects("ajax")
			.withExactArgs(sServiceUrl + "Employees?foo=bar", {
				data : JSON.stringify(oPayload),
				headers : sinon.match({
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
				}),
				method : "FOO"
			}).returns(createMock(assert, oResult, "OK"));

		// code under test
		oPromise = oRequestor.request("FOO", "Employees?foo=bar", "$direct",
			{"Content-Type" : "wrong"}, oPayload);

		return oPromise.then(function (result){
				assert.strictEqual(result, oResult);
			});
	});

	//*********************************************************************************************
	[{ // predefined headers can be overridden, but are not modified for later
		defaultHeaders : {"Accept" : "application/json;odata.metadata=full;IEEE754Compatible=true"},
		requestHeaders : {"OData-MaxVersion" : "5.0", "OData-Version" : "4.1"},
		result : {
			"Accept" : "application/json;odata.metadata=full;IEEE754Compatible=true",
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
				oRequestor = _Requestor.create(sServiceUrl, mDefaultHeaders),
				oResult = {},
				// add predefined request headers for OData V4
				mResultHeaders = jQuery.extend({}, {
					"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					"OData-MaxVersion" : "4.0",
					"OData-Version" : "4.0",
					"X-CSRF-Token" : "Fetch"
				}, mHeaders.result);

			function clone(o) {
				return o && JSON.parse(JSON.stringify(o));
			}

			this.mock(jQuery).expects("ajax")
				.withExactArgs(sServiceUrl + "Employees", {
					data : undefined,
					headers : mResultHeaders,
					method : "GET"
				}).returns(createMock(assert, oResult, "OK"));

			// code under test
			oPromise = oRequestor.request("GET", "Employees", "$direct", mRequestHeaders);

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
		var oRequestor = _Requestor.create("/");

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK", "abc123"));

		return oRequestor.request("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), keep old CSRF token in case no one is sent", function (assert) {
		var oRequestor = _Requestor.create("/", {"X-CSRF-Token" : "abc123"});

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "abc123"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK", /*sToken*/null));

		return oRequestor.request("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), keep fetching CSRF token in case no one is sent", function (assert) {
		var oMock = this.mock(jQuery),
			oRequestor = _Requestor.create("/");

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
				oRequestor = _Requestor.create("/Service/", undefined, {"sap-client" : "123"}),
				oTokenRequiredResponse = {};

			this.mock(_Helper).expects("createError")
				.exactly(bSuccess ? 0 : 2)
				.withExactArgs(oTokenRequiredResponse)
				.returns(oError);

			this.stub(jQuery, "ajax", function (sUrl, oSettings) {
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
				return oNewPromise.catch(function (oError1) {
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
				oRequestor = _Requestor.create("/Service/"),
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

			this.mock(_Helper).expects("createError")
				.exactly(bSuccess || o.bReadFails ? 0 : 1)
				.withExactArgs(oTokenRequiredResponse)
				.returns(oError);

			// With <code>bRequestSucceeds === false</code>, "request" always fails,
			// with <code>bRequestSucceeds === true</code>, "request" always succeeds,
			// else "request" first fails due to missing CSRF token which can be fetched via
			// "ODataModel#refreshSecurityToken".
			this.stub(jQuery, "ajax", function (sUrl0, oSettings) {
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
				this.mock(oRequestor).expects("refreshSecurityToken").never();
			} else {
				this.stub(oRequestor, "refreshSecurityToken", function () {
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

			return oRequestor.request("FOO", "foo", "$direct", {"foo" : "bar"}, oRequestPayload)
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
		var oRequestor = _Requestor.create();

		this.mock(oRequestor).expects("request").never();

		return oRequestor.submitBatch("testGroupId").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): success", function (assert) {
		var aExpectedRequests = [{
				method: "POST",
				url: "Customers",
				headers: {
					"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					"Foo" : "baz"
				},
				body: '{"ID":1}',
				$promise: sinon.match.defined,
				$reject: sinon.match.func,
				$resolve: sinon.match.func
			}, {
				method: "GET",
				url: "Products",
				headers: {
					"Accept" : "application/json;odata.metadata=full",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					"Foo" : "bar"
				},
				body: undefined,
				$promise: sinon.match.defined,
				$reject: sinon.match.func,
				$resolve: sinon.match.func
			}],
			aPromises = [],
			aResults = [{"foo1" : "bar1"}, {"foo2" : "bar2"}],
			aBatchResults = [
				{responseText: JSON.stringify(aResults[1])},
				{responseText: JSON.stringify(aResults[0])}
			],
			oRequestor = _Requestor.create("/Service/", {"Accept-Language" : "ab-CD"});

		aPromises.push(oRequestor.request("GET", "Products", "group1", {
			Foo : "bar",
			Accept : "application/json;odata.metadata=full"
		}).then(function (oResult) {
			assert.deepEqual(oResult, aResults[0]);
			aResults[0] = null;
		}));
		aPromises.push(oRequestor.request("POST", "Customers", "group1", {
			Foo : "baz"
		}, {
			"ID" : 1
		}).then(function (oResult) {
			assert.deepEqual(oResult, aResults[1]);
			aResults[1] = null;
		}));
		oRequestor.request("GET", "SalesOrders", "group2");

		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, undefined, aExpectedRequests)
			.returns(Promise.resolve(aBatchResults));

		aPromises.push(oRequestor.submitBatch("group1").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.deepEqual(aResults, [null, null], "all batch requests already resolved");
		}));
		aPromises.push(oRequestor.submitBatch("group1")); // must not call request again

		assert.strictEqual(oRequestor.mBatchQueue.group1, undefined);
		TestUtils.deepContains(oRequestor.mBatchQueue.group2, [[/*change set*/], {
			method: "GET",
			url: "SalesOrders"
		}]);

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): single GET", function (assert) {
		var oRequestor = _Requestor.create("/");

		oRequestor.request("GET", "Products", "groupId");
		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, undefined, [
				// Note: no empty change set!
				sinon.match({method: "GET", url: "Products"})
			]).returns(Promise.resolve([
				{responseText: "{}"}
			]));

		// code under test
		return oRequestor.submitBatch("groupId");
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): merge PATCH requests", function (assert) {
		var aPromises = [],
			oRequestor = _Requestor.create("/");

		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {}, {Name : "foo"}));
		oRequestor.request("PATCH", "Products", "anotherGroupId", {}, {Name : "foo"});
		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {}, {Name : "bar"}));
		aPromises.push(oRequestor
			.request("GET", "Products", "groupId"));
		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {}, {Note : "hello, world"}));
		// just different headers
		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {"If-Match" : ""}, {Note : "no merge!"}));
		// just a different verb
		aPromises.push(oRequestor
			.request("POST", "Products", "groupId", {"If-Match" : ""}, {Name : "baz"}));
		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, undefined, [
				[
					sinon.match({
						body : JSON.stringify({Name : "bar", Note : "hello, world"}),
						method : "PATCH",
						url : "Products('0')"
					}),
					sinon.match({
						body : JSON.stringify({Note : "no merge!"}),
						method : "PATCH",
						url : "Products('0')"
					}),
					sinon.match({
						body : JSON.stringify({Name : "baz"}),
						method : "POST",
						url : "Products"
					})
				],
				sinon.match({
					method : "GET",
					url : "Products"
				})
			]).returns(Promise.resolve([
				[
					{responseText : JSON.stringify({Name : "bar", Note : "hello, world"})},
					{responseText : JSON.stringify({Note : "no merge!"})},
					{responseText : JSON.stringify({Name : "baz"})}
				],
				{responseText : JSON.stringify({Name : "Name", Note : "Note"})}
			]));

		// code under test
		aPromises.push(oRequestor.submitBatch("groupId"));

		return Promise.all(aPromises).then(function (aResults) {
			assert.deepEqual(aResults, [
				{Name : "bar", Note : "hello, world"}, // 1st PATCH
				{Name : "bar", Note : "hello, world"}, // 2nd PATCH, merged with 1st
				{Name : "Name", Note : "Note"}, // GET
				{Name : "bar", Note : "hello, world"}, // 3rd PATCH, merged with 1st and 2nd
				{Note : "no merge!"}, // PATCH with different headers
				{Name : "baz"}, // POST
				undefined // submitBatch()
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): $batch failure", function (assert) {
		var oBatchError = new Error("$batch request failed"),
			aPromises = [],
			oRequestor = _Requestor.create();

		function unexpectedSuccess() {
			assert.ok(false, "unexpected success");
		}

		function assertError(oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(oError.message,
				"HTTP request was not processed because $batch failed");
			assert.strictEqual(oError.cause, oBatchError);
		}

		aPromises.push(oRequestor.request("GET", "Products", "group")
			.then(unexpectedSuccess, assertError));
		aPromises.push(oRequestor.request("GET", "Customers", "group")
			.then(unexpectedSuccess, assertError));

		this.mock(oRequestor).expects("request")
			.returns(Promise.reject(oBatchError));

		aPromises.push(oRequestor.submitBatch("group").then(unexpectedSuccess, function (oError) {
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
			oRequestor = _Requestor.create(),
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
			}).catch(unexpected));

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

		this.mock(oRequestor).expects("request")
			.returns(Promise.resolve(aBatchResult));

		aPromises.push(oRequestor.submitBatch("testGroupId").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("request(...): batch group id", function (assert) {
		var oRequestor = _Requestor.create();

		oRequestor.request("PATCH", "EntitySet1", "group", {"foo": "bar"}, {"a": "b"});
		oRequestor.request("PATCH", "EntitySet2", "group", {"bar": "baz"}, {"c": "d"});
		oRequestor.request("PATCH", "EntitySet3", "$auto", {"header": "value"}, {"e": "f"});

		TestUtils.deepContains(oRequestor.mBatchQueue, {
			"group" : [
				[/*change set!*/{
					method: "PATCH",
					url: "EntitySet1",
					headers: {
						"foo": "bar"
					},
					body: JSON.stringify({"a": "b"})
				}, {
					method: "PATCH",
					url: "EntitySet2",
					headers: {
						"bar": "baz"
					},
					body: JSON.stringify({"c": "d"})
				}]
			],
			"$auto": [
				[/*change set!*/{
					method: "PATCH",
					url: "EntitySet3",
					headers: {
						"header": "value"
					},
					body: JSON.stringify({"e": "f"})
				}]
			]
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
			oRequestor = _Requestor.create("/Service/", undefined, {"sap-client" : "123"}),
			oResult = "abc",
			sResponseContentType = "multipart/mixed; boundary=foo",
			oJqXHRMock = createMock(assert, oResult, "OK", "abc123", sResponseContentType);

		this.mock(_Batch).expects("serializeBatchRequest")
			.withExactArgs(aBatchRequests)
			.returns(oBatchRequest);

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/Service/$batch?sap-client=123", {
				data : oBatchRequest.body,
				headers : sinon.match({
					"Content-Type" : oBatchRequest.headers["Content-Type"],
					"MIME-Version" : oBatchRequest.headers["MIME-Version"]
				}),
				method : "POST"
			}).returns(oJqXHRMock);

		this.mock(_Batch).expects("deserializeBatchResponse")
			.withExactArgs(sResponseContentType, oResult)
			.returns(aExpectedResponses);

		return oRequestor.request("POST", "$batch", "$direct", undefined, aBatchRequests, true)
			.then(function (oPayload) {
				assert.strictEqual(aExpectedResponses, oPayload);
			});
	});

	//*********************************************************************************************
	if (TestUtils.isRealOData()) {
		QUnit.test("request(...)/submitBatch (realOData) success", function (assert) {
			var oRequestor = _Requestor.create(TestUtils.proxy(sServiceUrl)),
				sResourcePath = "TEAMS('TEAM_01')";

			function assertResult(oPayload){
				assert.deepEqual(oPayload, {
					"@odata.context": "$metadata#TEAMS/$entity",
					"Team_Id": "TEAM_01",
					Name: "Business Suite",
					MEMBER_COUNT: 2,
					MANAGER_ID: "3",
					BudgetCurrency: "USD",
					Budget: "555.55"
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
			var oRequestor = _Requestor.create(TestUtils.proxy(sServiceUrl));

			oRequestor.request("GET", "TEAMS('TEAM_01')", "group").then(function (oResult) {
				assert.deepEqual(oResult, {
					"@odata.context": "$metadata#TEAMS/$entity",
					"Team_Id": "TEAM_01",
					Name: "Business Suite",
					MEMBER_COUNT: 2,
					MANAGER_ID: "3",
					BudgetCurrency: "USD",
					Budget: "555.55"
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

		//*****************************************************************************************
		QUnit.test("request(ProductList)/submitBatch (realOData) patch", function (assert) {
			var oBody = {Name : "modified by QUnit test"},
				oRequestor = _Requestor.create(TestUtils.proxy(sSampleServiceUrl)),
				sResourcePath = "ProductList('HT-1001')";

			return Promise.all([
					oRequestor.request("PATCH", sResourcePath, "group", {"If-Match" : "*"}, oBody)
						.then(function (oResult) {
							TestUtils.deepContains(oResult, oBody);
						}),
					oRequestor.submitBatch("group")
				]);
			}
		);
	}
});
// TODO: continue-on-error? -> flag on model
// TODO: provide test that checks that .request() does not serialize twice in case of
// 		 refreshSecurityToken and repeated request
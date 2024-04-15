/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/cache/CacheManager",
	"sap/ui/model/odata/v4/lib/_Batch",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/security/Security",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/jquery"
], function (Log, SyncPromise, CacheManager, _Batch, _GroupLock, _Helper, _Requestor, Security,
	TestUtils, jQuery) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.lib._Requestor",
		oModelInterface = {
			fetchMetadata : function () {
				throw new Error("Must be mocked");
			},
			fireSessionTimeout : function () {},
			getGroupProperty : defaultGetGroupProperty,
			getOptimisticBatchEnabler : function () {},
			getReporter : function () {},
			isIgnoreETag : function () {},
			onCreateGroup : function () {},
			reportStateMessages : function () {},
			reportTransitionMessages : function () {}
		},
		sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/";

	/**
	 * Creates a mock for jQuery's XHR wrapper.
	 *
	 * @param {object} assert
	 *   QUnit assert
	 * @param {object} oPayload
	 *   the response payload
	 * @param {string} sTextStatus
	 *   the XHR's status as text
	 * @param {object} mResponseHeaders
	 *   the header attributes of the response; supported header attributes are "Content-Type",
	 *   "DataServiceVersion", "ETag", "OData-Version", "SAP-ContextId", "sap-messages" and
	 *   "X-CSRF-Token" all with default value <code>null</code>; if no response headers are given
	 *   at all the default value for "OData-Version" is "4.0";
	 * @returns {object}
	 *   a mock for jQuery's XHR wrapper
	 */
	function createMock(assert, oPayload, sTextStatus, mResponseHeaders) {
		var jqXHR = new jQuery.Deferred();

		Promise.resolve().then(function () {
			jqXHR.resolve(oPayload, sTextStatus, { // mock jqXHR for success handler
				getResponseHeader : function (sName) {
					mResponseHeaders ??= {"OData-Version" : "4.0"};
					// Note: getResponseHeader treats sName case insensitive!
					switch (sName) {
						case "Content-Type":
							return mResponseHeaders["Content-Type"] || null;
						case "DataServiceVersion":
							return mResponseHeaders["DataServiceVersion"] || null;
						case "ETag":
							return mResponseHeaders["ETag"] || null;
						case "OData-Version":
							return mResponseHeaders["OData-Version"] || null;
						case "SAP-ContextId":
							return mResponseHeaders["SAP-ContextId"] || null;
						case "SAP-Http-Session-Timeout":
							return mResponseHeaders["SAP-Http-Session-Timeout"] || null;
						case "sap-messages":
							return mResponseHeaders["sap-messages"] || null;
						case "X-CSRF-Token":
							return mResponseHeaders["X-CSRF-Token"] || null;
						default:
							assert.ok(false, "unexpected getResponseHeader(" + sName + ")");
					}
				}
			});
		});

		return jqXHR;
	}

	/**
	 * Creates a response object as contained in the array returned by
	 * <code>_Batch.deserializeBatchResponse</code> without <code>status</code> and
	 * <code>statusText</code> from the given response body and response headers.
	 *
	 * @param {object} [oBody] the response body
	 * @param {object} [mHeaders={}] the map of response header name to response header value
	 * @returns {object} the response object
	 */
	function createResponse(oBody, mHeaders) {
		return {
			headers : mHeaders || {},
			responseText : oBody ? JSON.stringify(oBody) : ""
		};
	}

	/*
	 * Simulation of {@link sap.ui.model.odata.v4.ODataModel#getGroupProperty}
	 */
	function defaultGetGroupProperty(sGroupId, sPropertyName) {
		if (sPropertyName !== "submit") {
			throw new Error("Unsupported property name: " + sPropertyName);
		}
		if (sGroupId === "$direct") {
			return "Direct";
		}
		if (sGroupId === "$auto") {
			return "Auto";
		}
		return "API";
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Requestor", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			/**
			 * workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			 * resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			 * @deprecated since 1.56, together with sap.ui.getVersioninfo
			 */
			this.mock(sap.ui).expects("getVersionInfo").atLeast(0);
		},

		/**
		 *  Returns a fake group lock.
		 *
		 *  Expects that <code>getGroupId</code>, <code>getSerialNumber</code> and
		 *  <code>unlock</code> are called once.
		 *
		 * @param {string} [sGroupId="groupId"]
		 *   The group lock's group ID
		 * @returns {object}
		 *   A group lock mock
		 */
		createGroupLock : function (sGroupId) {
			var oGroupLock = {
					getGroupId : function () {},
					getSerialNumber : function () {},
					isCanceled : function () {},
					unlock : function () {}
				};

			this.mock(oGroupLock).expects("getGroupId").withExactArgs()
				.returns(sGroupId || "groupId");
			this.mock(oGroupLock).expects("isCanceled").withExactArgs().returns(false);
			this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(Infinity);
			this.mock(oGroupLock).expects("unlock").withExactArgs();

			return oGroupLock;
		}
	});

	//*********************************************************************************************
	QUnit.test("matchesOptimisticBatch", function (assert) {
		var aActual = [],
			aOptimistic = [],
			oHelperMock = this.mock(_Helper);

		// code under test
		assert.ok(_Requestor.matchesOptimisticBatch(aActual, "", aOptimistic, ""));

		// code under test
		assert.notOk(_Requestor.matchesOptimisticBatch(aActual, "foo", aOptimistic, "bar"));

		aActual = [{}];

		// code under test
		assert.notOk(_Requestor.matchesOptimisticBatch(aActual, "", aOptimistic, ""));

		aActual = [{url : "foo"}];
		aOptimistic = [{headers : {}, url : "foo"}];

		// code under test
		assert.ok(_Requestor.matchesOptimisticBatch(aActual, "", aOptimistic, ""));

		aActual = [{url : "foo"}];
		aOptimistic = [{headers : {}, url : "bar"}];

		// code under test
		assert.notOk(_Requestor.matchesOptimisticBatch(aActual, "", aOptimistic, ""));

		aActual = [{url : "foo"}, {url : "bar"}];
		aOptimistic = [
			{headers : {}, url : "foo"},
			{headers : {}, url : "bar"}
		];

		// code under test
		assert.ok(_Requestor.matchesOptimisticBatch(aActual, "", aOptimistic, ""));

		aActual = [{
			headers : {foo : "actual0", "X-CSRF-Token" : "abc"}, url : "foo"
		}, {
			headers : {foo : "actual1", "X-CSRF-Token" : "xyz"}, url : "bar"
		}];
		aOptimistic = [{
			headers : {foo : "optimistic0"}, url : "foo"
		}, {
			headers : {foo : "optimistic1"}, url : "bar"
		}];

		oHelperMock.expects("deepEqual")
			.withExactArgs({foo : "actual0"}, aOptimistic[0].headers)
			.returns(true);
		oHelperMock.expects("deepEqual")
			.withExactArgs({foo : "actual1"}, aOptimistic[1].headers)
			.returns(true);

		// code under test
		assert.ok(_Requestor.matchesOptimisticBatch(aActual, "", aOptimistic, ""));

		oHelperMock.expects("deepEqual")
			.withExactArgs({foo : "actual0"}, aOptimistic[0].headers)
			.returns(true);
		oHelperMock.expects("deepEqual")
			.withExactArgs({foo : "actual1"}, aOptimistic[1].headers)
			.returns(false);

		// code under test
		assert.notOk(_Requestor.matchesOptimisticBatch(aActual, "", aOptimistic, ""));
	});

	//*********************************************************************************************
[false, true].forEach(function (bStatistics) {
	QUnit.test("constructor, 'sap-statistics' present: " + bStatistics, function (assert) {
		var mHeaders = {},
			oHelperMock = this.mock(_Helper),
			mQueryParams = {},
			oRequestor,
			vStatistics = {},
			bWithCredentials = bStatistics; //do not increase the number of tests unnecessarily

		if (bStatistics) {
			mQueryParams["sap-statistics"] = vStatistics;
		}
		oHelperMock.expects("buildQuery")
			.withExactArgs(sinon.match.same(mQueryParams)).returns("?~");

		// code under test
		oRequestor = _Requestor.create(sServiceUrl, oModelInterface, mHeaders, mQueryParams,
			/*sODataVersion*/undefined, bWithCredentials);

		assert.deepEqual(oRequestor.mBatchQueue, {});
		assert.strictEqual(oRequestor.mHeaders, mHeaders);
		assert.deepEqual(oRequestor.aLockedGroupLocks, []);
		assert.strictEqual(oRequestor.oModelInterface, oModelInterface);
		assert.strictEqual(oRequestor.sQueryParams, "?~");
		assert.deepEqual(oRequestor.mRunningChangeRequests, {});
		assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
		assert.strictEqual(oRequestor.iSessionTimer, 0);
		assert.strictEqual(oRequestor.iSerialNumber, 0);
		assert.strictEqual(oRequestor.sServiceUrl, sServiceUrl);
		assert.strictEqual(oRequestor.vStatistics, bStatistics ? vStatistics : undefined);
		assert.strictEqual(oRequestor.oOptimisticBatch, null);
		assert.strictEqual(oRequestor.isBatchSent(), false);
		assert.ok("vStatistics" in oRequestor);
		assert.strictEqual(oRequestor.bWithCredentials, bWithCredentials);

		oHelperMock.expects("buildQuery").withExactArgs(undefined).returns("");

		// code under test
		oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		assert.deepEqual(oRequestor.mHeaders, {});
		assert.strictEqual(oRequestor.vStatistics, undefined);
		assert.ok("vStatistics" in oRequestor);
	});
});

	//*********************************************************************************************
	QUnit.test("destroy", function () {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(oRequestor).expects("clearSessionContext").withExactArgs();

		// code under test
		oRequestor.destroy();
	});

	//*********************************************************************************************
	QUnit.test("getServiceUrl", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface,
				{foo : "must be ignored"});

		// code under test
		assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl);
	});

	//*********************************************************************************************
["API", "Auto", "Direct"].forEach(function (sSubmitMode) {
	QUnit.test("getUnlockedAutoCopy: sSubmitMode=" + sSubmitMode, function (assert) {
		var iCount = sSubmitMode === "API" ? 1 : 0, // call count in case new lock needed
			oGroupLock = {
				getGroupId : function () {},
				getOwner : function () {},
				getUnlockedCopy : function () {}
			},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("myGroup");
		this.mock(oRequestor).expects("getGroupSubmitMode").withExactArgs("myGroup")
			.returns(sSubmitMode);
		this.mock(oGroupLock).expects("getUnlockedCopy").exactly(1 - iCount).withExactArgs()
			.returns("~result~");
		this.mock(oGroupLock).expects("getOwner").exactly(iCount).withExactArgs()
			.returns("~owner~");
		this.mock(oRequestor).expects("lockGroup").exactly(iCount)
			.withExactArgs("$auto", "~owner~").returns("~result~");

		// code under test
		assert.strictEqual(oRequestor.getUnlockedAutoCopy(oGroupLock), "~result~");
	});
});

	//*********************************************************************************************
	[{
		groupId : "$direct", submitMode : "Direct"
	}, {
		groupId : "$auto", submitMode : "Auto"
	}, {
		groupId : "unknown", submitMode : "API"
	}].forEach(function (oFixture) {
		QUnit.test("getGroupSubmitMode, success" + oFixture.groupId, function (assert) {
			var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

			this.mock(oModelInterface).expects("getGroupProperty")
				.withExactArgs(oFixture.groupId, "submit")
				.returns(oFixture.submitMode);

			// code under test
			assert.strictEqual(oRequestor.getGroupSubmitMode(oFixture.groupId),
				oFixture.submitMode);
		});
	});

	//*********************************************************************************************
	[{
		sODataVersion : "4.0",
		mFinalHeaders : {
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		mPredefinedPartHeaders : {
			Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true"
		},
		mPredefinedRequestHeaders : {
			Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"OData-MaxVersion" : "4.0",
			"OData-Version" : "4.0",
			"X-CSRF-Token" : "Fetch"
		}
	}, {
		sODataVersion : "2.0",
		mFinalHeaders : {
			"Content-Type" : "application/json;charset=UTF-8"
		},
		mPredefinedPartHeaders : {
			Accept : "application/json"
		},
		mPredefinedRequestHeaders : {
			Accept : "application/json",
			MaxDataServiceVersion : "2.0",
			DataServiceVersion : "2.0",
			"X-CSRF-Token" : "Fetch"
		}
	}].forEach(function (oFixture) {
		var sTest = "factory function: check members for OData version = " + oFixture.sODataVersion;

		QUnit.test(sTest, function (assert) {
			var sBuildQueryResult = "foo",
				mHeaders = {},
				mQueryParams = {},
				oRequestor;

			this.mock(_Helper).expects("buildQuery")
				.withExactArgs(mQueryParams)
				.returns(sBuildQueryResult);

			// code under test
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface, mHeaders, mQueryParams,
				oFixture.sODataVersion);

			assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl, "parameter sServiceUrl");
			assert.strictEqual(oRequestor.mHeaders, mHeaders, "parameter mHeaders");
			assert.strictEqual(oRequestor.sQueryParams, sBuildQueryResult,
				"parameter mQueryParams");
			assert.strictEqual(oRequestor.oModelInterface, oModelInterface);
			// OData version specific header maps
			assert.deepEqual(oRequestor.mFinalHeaders, oFixture.mFinalHeaders, "mFinalHeaders");
			assert.deepEqual(oRequestor.mPredefinedPartHeaders, oFixture.mPredefinedPartHeaders,
				"mPredefinedPartHeaders");
			assert.deepEqual(oRequestor.mPredefinedRequestHeaders,
				oFixture.mPredefinedRequestHeaders, "mPredefinedRequestHeaders");
		});
	});

	//*********************************************************************************************
	QUnit.test("factory function: check members; default values", function (assert) {
		var mFinalHeaders = {
				"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
			},
			mPredefinedPartHeaders = {
				Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true"
			},
			mPredefinedRequestHeaders = {
				Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
				"OData-MaxVersion" : "4.0",
				"OData-Version" : "4.0",
				"X-CSRF-Token" : "Fetch"
			},
			oRequestor;

		// code under test
		oRequestor = _Requestor.create(sServiceUrl);

		assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl, "parameter sServiceUrl");
		assert.deepEqual(oRequestor.mHeaders, {}, "parameter mHeaders");
		assert.strictEqual(oRequestor.sQueryParams, "", "parameter mQueryParams");
		// OData version specific header maps
		assert.deepEqual(oRequestor.mFinalHeaders, mFinalHeaders, "mFinalHeaders");
		assert.deepEqual(oRequestor.mPredefinedPartHeaders, mPredefinedPartHeaders,
			"mPredefinedPartHeaders");
		assert.deepEqual(oRequestor.mPredefinedRequestHeaders, mPredefinedRequestHeaders,
			"mPredefinedRequestHeaders");
	});

	//*********************************************************************************************
	[{
		iRequests : 1, sRequired : null, bRequestSucceeds : true, sTitle : "success"
	}, {
		// simulate a server which does not require a CSRF token, but fails with 403
		iRequests : 1, sRequired : null, bRequestSucceeds : false, sTitle : "failure with 403"
	}, {
		// simulate a server which does not require a CSRF token, but fails otherwise
		iRequests : 1,
		sRequired : "Required",
		bRequestSucceeds : false,
		iStatus : 500,
		sTitle : "failure with 500"
	}, {
		iRequests : 2, sRequired : "Required", sTitle : "CSRF token Required"
	}, {
		iRequests : 2, sRequired : "required", sTitle : "CSRF token required"
	}, {
		iRequests : 1, sRequired : "Required", bReadFails : true, sTitle : "fetch CSRF token fails"
	}, {
		iRequests : 2,
		sRequired : "Required",
		bDoNotDeliverToken : true,
		sTitle : "no CSRF token can be fetched"
	}].forEach(function (o) {
		QUnit.test("sendRequest: " + o.sTitle, function (assert) {
			var oError = {},
				oExpectation,
				mHeaders = {},
				oHelperMock = this.mock(_Helper),
				oReadFailure = {},
				oRequestor = _Requestor.create("/Service/", oModelInterface,
					{"X-CSRF-Token" : "Fetch"}),
				mResolvedHeaders = {foo : "bar"},
				oResponsePayload = {},
				bSuccess = o.bRequestSucceeds !== false && !o.bReadFails && !o.bDoNotDeliverToken,
				oTokenRequiredResponse = {
					getResponseHeader : function (sName) {
						// Note: getResponseHeader treats sName case insensitive!
						switch (sName) {
							case "SAP-ContextId": return null;
							case "SAP-Err-Id": return null;
							case "SAP-Http-Session-Timeout": return null;
							case "X-CSRF-Token": return o.sRequired;
							default: assert.ok(false, "unexpected header " + sName);
						}
					},
					status : o.iStatus || 403
				};

			this.mock(oModelInterface).expects("isIgnoreETag").exactly(o.iRequests)
				.withExactArgs().returns("~bIgnoreETag~");
			oHelperMock.expects("resolveIfMatchHeader").exactly(o.iRequests)
				.withExactArgs(sinon.match.same(mHeaders), "~bIgnoreETag~")
				.returns(mResolvedHeaders);
			oHelperMock.expects("createError")
				.exactly(bSuccess || o.bReadFails ? 0 : 1)
				.withExactArgs(sinon.match.same(oTokenRequiredResponse), "Communication error",
					"/Service/foo", "original/path")
				.returns(oError);

			// With <code>bRequestSucceeds === false</code>, "request" always fails,
			// with <code>bRequestSucceeds === true</code>, "request" always succeeds,
			// else "request" first fails due to missing CSRF token which can be fetched via
			// "ODataModel#refreshSecurityToken".
			this.mock(jQuery).expects("ajax").exactly(o.iRequests)
				.withExactArgs("/Service/foo", sinon.match({
					data : "payload",
					headers : mResolvedHeaders,
					method : "FOO"
				}))
				.callsFake(function (_sUrl, oSettings) {
					var jqXHR;

					if (o.bRequestSucceeds === true
						|| o.bRequestSucceeds === undefined
						&& oSettings.headers["X-CSRF-Token"] === "abc123") {
						jqXHR = createMock(assert, oResponsePayload, "OK", {
							"Content-Type" : "application/json",
							ETag : "Bill",
							"OData-Version" : "4.0",
							"sap-messages" : "[{code : 42}]"
						});
					} else {
						jqXHR = new jQuery.Deferred();
						setTimeout(function () {
							jqXHR.reject(oTokenRequiredResponse);
						}, 0);
					}

					return jqXHR;
				});

			oExpectation = this.mock(oRequestor).expects("refreshSecurityToken")
				.withExactArgs("Fetch");
			if (o.bRequestSucceeds !== undefined) {
				oExpectation.never();
			} else {
				oExpectation.callsFake(function () {
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

			// code under test
			return oRequestor.sendRequest("FOO", "foo", mHeaders, "payload", "original/path")
				.then(function (oPayload) {
					assert.ok(bSuccess, "success possible");
					assert.strictEqual(oPayload.contentType, "application/json");
					assert.strictEqual(oPayload.body, oResponsePayload);
					assert.deepEqual(oPayload.body, {"@odata.etag" : "Bill"});
					assert.strictEqual(oPayload.messages, "[{code : 42}]");
					assert.strictEqual(oPayload.resourcePath, "foo");
				}, function (oError0) {
					assert.ok(!bSuccess, "certain failure");
					assert.strictEqual(oError0, o.bReadFails ? oReadFailure : oError);
				});
		});
	});

	//*********************************************************************************************
	["NOTGET", "GET"].forEach(function (sMethod, i) {
		var sTitle = "sendRequest: wait for CSRF token if method is not GET, " + i;

		QUnit.test(sTitle, function (assert) {
			var oPromise,
				oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
				oResult = {},
				oSecurityTokenPromise = new Promise(function (resolve) {
					setTimeout(function () {
						oRequestor.mHeaders["X-CSRF-Token"] = "abc123";
						resolve();
					}, 0);
				});

			// security token already requested by #refreshSecurityToken
			oRequestor.oSecurityTokenPromise = oSecurityTokenPromise;

			this.mock(jQuery).expects("ajax")
				.withExactArgs(sServiceUrl + "Employees?foo=bar", {
					contentType : undefined,
					data : "payload",
					headers : sinon.match({
						"X-CSRF-Token" : sMethod === "GET" ? "Fetch" : "abc123"
					}),
					method : sMethod
				}).returns(createMock(assert, oResult, "OK"));

			// code under test
			oPromise = oRequestor.sendRequest(sMethod, "Employees?foo=bar", {}, "payload");

			return Promise.all([oPromise, oSecurityTokenPromise]);
		});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest: fail, unsupported OData service version", function (assert) {
		var oError = {},
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(jQuery).expects("ajax")
			.withArgs("/Employees")
			.returns(createMock(assert, {}, "OK"));
		this.mock(oRequestor).expects("doCheckVersionHeader")
			.withExactArgs(sinon.match.func, "Employees", false)
			.throws(oError);
		this.mock(oRequestor).expects("doConvertResponse").never();

		// code under test
		return oRequestor.sendRequest("GET", "Employees")
			.then(function () {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest(), store CSRF token from server", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK", {
				"OData-Version" : "4.0",
				"X-CSRF-Token" : "abc123"
			}));

		return oRequestor.sendRequest("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	// BCP:2180370654
	QUnit.test("sendRequest: ignore unexpected ETag response header in $batch", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/$batch", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, "--batch-id...", "OK", {
				"OData-Version" : "4.0",
				ETag : "unexpected"
			}));

		return oRequestor.sendRequest("POST", "$batch").then(function (oResult) {
			assert.strictEqual(oResult.body, "--batch-id...");
		});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest(): setSessionContext", function (assert) {
		var oJQueryMock = this.mock(jQuery),
			oRequestor = _Requestor.create("/", oModelInterface);

		oJQueryMock.expects("ajax")
			.withExactArgs("/", sinon.match.object)
			.returns(createMock(assert, {/*oPayload*/}, "OK", {
				"OData-Version" : "4.0",
				"SAP-ContextId" : "abc123",
				"SAP-Http-Session-Timeout" : "120"
			}));
		this.mock(oRequestor).expects("setSessionContext").withExactArgs("abc123", "120");

		// code under test
		return oRequestor.sendRequest("GET", "");
	});

	//*********************************************************************************************
	QUnit.test("sendRequest(): error & session", function (assert) {
		var oJQueryMock = this.mock(jQuery),
			oRequestor = _Requestor.create("/", oModelInterface),
			that = this;

		oJQueryMock.expects("ajax")
			.withExactArgs("/", sinon.match.object)
			.returns(createMock(assert, {/*oPayload*/}, "OK", {
				"OData-Version" : "4.0",
				"SAP-ContextId" : "abc123"
			}));

		// code under test
		return oRequestor.sendRequest("GET", "").then(function () {
			var oExpectedError = new Error(),
				jqXHRMock;

			assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "abc123");

			jqXHRMock = new jQuery.Deferred();
			setTimeout(function () {
				jqXHRMock.reject({
					getResponseHeader : function (sName) {
						switch (sName) {
							case "SAP-ContextId": return null;
							case "X-CSRF-Token": return null;
							default: assert.ok(false, "unexpected header " + sName);
						}
					},
					status : 500
				});
			}, 0);
			oJQueryMock.expects("ajax")
				.withExactArgs("/", sinon.match({headers : {"SAP-ContextId" : "abc123"}}))
				.returns(jqXHRMock);
			that.oLogMock.expects("error")
				.withExactArgs("Session not found on server", undefined, sClassName);
			that.mock(oRequestor).expects("clearSessionContext").withExactArgs(true);
			that.mock(_Helper).expects("createError")
				.withExactArgs(sinon.match.object, "Session not found on server", "/", undefined)
				.returns(oExpectedError);

			// code under test
			return oRequestor.sendRequest("GET", "").then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError, oExpectedError);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest(): error in session", function (assert) {
		var oJQueryMock = this.mock(jQuery),
			oRequestor = _Requestor.create("/", oModelInterface),
			that = this;

		oJQueryMock.expects("ajax")
			.withExactArgs("/", sinon.match.object)
			.returns(createMock(assert, {/*oPayload*/}, "OK", {
				"OData-Version" : "4.0",
				"SAP-ContextId" : "abc123"
			}));

		// code under test
		return oRequestor.sendRequest("GET", "").then(function () {
			var oExpectedError = new Error(),
				jqXHRMock = new jQuery.Deferred();

			setTimeout(function () {
				jqXHRMock.reject({
					getResponseHeader : function (sName) {
						switch (sName) {
							case "SAP-ContextId": return "abc123";
							case "SAP-Http-Session-Timeout": return "42";
							case "X-CSRF-Token": return null;
							default: assert.ok(false, "unexpected header " + sName);
						}
					},
					status : 500
				});
			}, 0);
			oJQueryMock.expects("ajax")
				.withExactArgs("/", sinon.match({headers : {"SAP-ContextId" : "abc123"}}))
				.returns(jqXHRMock);
			that.mock(oRequestor).expects("setSessionContext")
				.withExactArgs("abc123", "42");
			that.mock(_Helper).expects("createError").returns(oExpectedError);

			// code under test
			return oRequestor.sendRequest("GET", "").then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError, oExpectedError);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest(), keep old CSRF token in case none is sent", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface, {"X-CSRF-Token" : "abc123"});

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "abc123"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK"));

		return oRequestor.sendRequest("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest(), keep fetching CSRF token in case none is sent", function (assert) {
		var oMock = this.mock(jQuery),
			oRequestor = _Requestor.create("/", oModelInterface);

		oMock.expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK"));

		return oRequestor.sendRequest("GET", "").then(function () {
			oMock.expects("ajax")
				.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
				.returns(createMock(assert, {/*oPayload*/}, "OK"));

			return oRequestor.sendRequest("GET", "");
		});
	});

	//*********************************************************************************************
	// Integrative test simulating parallel POST requests: Both got a 403 token "required",
	// but the second not until the first already has completed fetching a new token,
	// here the second can simply reuse the already fetched token
	QUnit.test("sendRequest(): parallel POST requests, fetch HEAD only once", function (assert) {
		var bFirstRequest = true,
			jqFirstTokenXHR = createMock(assert, {}, "OK", {
				"OData-Version" : "4.0",
				"X-CSRF-Token" : "abc123"
			}),
			iHeadRequestCount = 0,
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		this.mock(jQuery).expects("ajax").atLeast(1).callsFake(function (_sUrl, oSettings) {
			var jqXHR,
				oTokenRequiredResponse = {
					getResponseHeader : function () {
						return "required";
					},
					status : 403
				};

			if (oSettings.method === "HEAD") {
				jqXHR = jqFirstTokenXHR;
				iHeadRequestCount += 1;
			} else if (oSettings.headers["X-CSRF-Token"] === "abc123") {
				jqXHR = createMock(assert, {}, "OK");
			} else {
				jqXHR = new jQuery.Deferred();
				if (bFirstRequest) {
					jqXHR.reject(oTokenRequiredResponse);
					bFirstRequest = false;
				} else {
					// Ensure that the second POST request is rejected after the first one already
					// has requested and received a token
					jqFirstTokenXHR.then(setTimeout(function () {
						// setTimeout needed here because .then comes first
						jqXHR.reject(oTokenRequiredResponse);
					}, 0));
				}
			}
			return jqXHR;
		});

		// code under test
		return Promise.all([
			oRequestor.sendRequest("POST"),
			oRequestor.sendRequest("POST")
		]).then(function () {
			assert.strictEqual(iHeadRequestCount, 1, "fetch HEAD only once");
		});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest(), withCredentials for CORS", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface, /*mHeaders*/undefined,
				/*mQueryParams*/undefined, /*sODataVersion*/undefined,
				/*bWithCredentials*/true);

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({
				xhrFields : {withCredentials : true}
			})).returns(createMock(assert, {/*oPayload*/}, "OK"));

		return oRequestor.sendRequest("GET", "");
	});

	//*********************************************************************************************
[undefined, "false"].forEach(function (vStatistics) {
	[undefined, "$direct"].forEach(function (sGroupId) {
		var sTitle = "request: sGroupId=" + sGroupId + ", sap-statistics=" + vStatistics;

		QUnit.test(sTitle, function (assert) {
			var fnCancel = this.spy(),
				oConvertedResponse = {},
				oGroupLock,
				oPayload = {foo : 42},
				oPromise,
				oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, {
					foo : "URL params are ignored for normal requests"
				}),
				oResponse = {body : {}, messages : {}, resourcePath : "Employees?custom=value"},
				fnSubmit = this.spy();

			oRequestor.vStatistics = vStatistics;
			if (sGroupId) {
				oGroupLock = this.createGroupLock(sGroupId);
			}
			this.mock(oRequestor).expects("convertResourcePath")
				.withExactArgs("Employees?custom=value")
				.returns("~Employees~?custom=value");
			this.mock(oRequestor).expects("sendRequest")
				.withExactArgs("METHOD",
					vStatistics
						? "~Employees~?custom=value&sap-statistics=false"
						: "~Employees~?custom=value",
					{
						header : "value",
						"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
					}, JSON.stringify(oPayload), "~Employees~?custom=value")
				.resolves(oResponse);
			this.mock(oRequestor).expects("reportHeaderMessages")
				.withExactArgs(oResponse.resourcePath, sinon.match.same(oResponse.messages));
			this.mock(oRequestor).expects("doConvertResponse")
				.withExactArgs(sinon.match.same(oResponse.body), "meta/path")
				.returns(oConvertedResponse);
			this.mock(oRequestor).expects("submitBatch").never();

			// code under test
			oPromise = oRequestor.request("METHOD", "Employees?custom=value", oGroupLock, {
				header : "value",
				"Content-Type" : "wrong"
			}, oPayload, fnSubmit, fnCancel, "meta/path");

			return oPromise.then(function (oResult) {
				assert.strictEqual(oResult, oConvertedResponse);

				sinon.assert.calledOnceWithExactly(fnSubmit);
				assert.notOk(fnCancel.called);
			});
		});
	});
});

	//*********************************************************************************************
	[{ // predefined headers can be overridden, but are not modified for later
		defaultHeaders : {Accept : "application/json;odata.metadata=full;IEEE754Compatible=true"},
		requestHeaders : {"OData-MaxVersion" : "5.0", "OData-Version" : "4.1"},
		result : {
			Accept : "application/json;odata.metadata=full;IEEE754Compatible=true",
			"OData-MaxVersion" : "5.0",
			"OData-Version" : "4.1",
			"sap-cancel-on-close" : "true"
		}
	}, {
		defaultHeaders : undefined,
		requestHeaders : undefined,
		result : {"sap-cancel-on-close" : "true"}
	}, {
		defaultHeaders : {"Accept-Language" : "ab-CD"},
		requestHeaders : undefined,
		result : {"Accept-Language" : "ab-CD", "sap-cancel-on-close" : "true"}
	}, {
		defaultHeaders : undefined,
		requestHeaders : {"Accept-Language" : "ab-CD"},
		result : {"Accept-Language" : "ab-CD", "sap-cancel-on-close" : "true"}
	}, {
		defaultHeaders : {"Accept-Language" : "ab-CD"},
		requestHeaders : {foo : "bar"},
		result : {"Accept-Language" : "ab-CD", foo : "bar", "sap-cancel-on-close" : "true"}
	}].forEach(function (mHeaders) {
		QUnit.test("request, headers: " + JSON.stringify(mHeaders), function (assert) {
			var mDefaultHeaders = clone(mHeaders.defaultHeaders),
				oPromise,
				mRequestHeaders = clone(mHeaders.requestHeaders),
				oRequestor = _Requestor.create(sServiceUrl, oModelInterface, mDefaultHeaders),
				oResult = {},
				// add predefined request headers for OData V4
				mResultHeaders = Object.assign({}, {
					Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
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
					// contentType via oRequestor.mFinalHeaders
					contentType : "application/json;charset=UTF-8;IEEE754Compatible=true",
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
			return oPromise.then(function (result) {
				assert.strictEqual(result, oResult);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("request, onCreateGroup", function () {
		var oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oModelInterface).expects("onCreateGroup").withExactArgs("groupId");

		// code under test
		oRequestor.request("GET", "SalesOrders", this.createGroupLock());
		oRequestor.request("GET", "SalesOrders", this.createGroupLock());
	});

	//*********************************************************************************************
	QUnit.test("request, getGroupProperty", function () {
		var oGroupLock = this.createGroupLock(),
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oModelInterface).expects("getGroupProperty")
			.withExactArgs("groupId", "submit")
			.returns("API");
		this.mock(oModelInterface).expects("onCreateGroup").withExactArgs("groupId");

		// code under test
		oRequestor.request("GET", "SalesOrders", oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("request, getOrCreateBatchQueue", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface),
			aRequests = [];

		this.mock(oRequestor).expects("getOrCreateBatchQueue")
			.withExactArgs("groupId")
			.returns(aRequests);

		// code under test
		oRequestor.request("GET", "SalesOrders", this.createGroupLock());

		assert.strictEqual(aRequests.length, 1);
		assert.strictEqual(aRequests[0].method, "GET");
	});

	//*********************************************************************************************
	[{
		sODataVersion : "2.0",
		mExpectedRequestHeaders : {
			Accept : "application/json",
			"Content-Type" : "application/json;charset=UTF-8",
			DataServiceVersion : "2.0",
			MaxDataServiceVersion : "2.0",
			"X-CSRF-Token" : "Fetch"
		}
	}, {
		sODataVersion : "4.0",
		mExpectedRequestHeaders : {
			Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
			"OData-MaxVersion" : "4.0",
			"OData-Version" : "4.0",
			"X-CSRF-Token" : "Fetch"
		}
	}].forEach(function (oFixture) {
		var sTitle = "request: OData version specific headers for $direct; sODataVersion = "
				+ oFixture.sODataVersion;

		QUnit.test(sTitle, function (assert) {
			var oConvertedResponse = {},
				sMetaPath = "~",
				oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, undefined,
					oFixture.sODataVersion),
				oResponsePayload = {};

			this.mock(jQuery).expects("ajax")
				.withExactArgs(sServiceUrl + "Employees", {
					contentType : oFixture.mExpectedRequestHeaders["Content-Type"],
					data : undefined,
					headers : sinon.match(oFixture.mExpectedRequestHeaders),
					method : "GET"
				}).returns(createMock(assert, oResponsePayload, "OK"));
			this.mock(oRequestor).expects("doCheckVersionHeader")
				.withExactArgs(sinon.match.func, "Employees", false);
			this.mock(oRequestor).expects("doConvertResponse")
				.withExactArgs(oResponsePayload, sMetaPath)
				.returns(oConvertedResponse);

			// code under test
			// we do not test sendRequest() because "Content-Type" is added by request()
			return oRequestor.request("GET", "Employees", undefined, undefined, undefined,
					undefined, undefined, sMetaPath)
				.then(function (result) {
					assert.strictEqual(result, oConvertedResponse);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest: optional OData-Version header for empty response", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(jQuery).expects("ajax")
			.withExactArgs(sServiceUrl + "SalesOrderList('0500000676')", sinon.match.object)
			.returns(createMock(assert, undefined, "No Content", {}));
		this.mock(oRequestor).expects("doCheckVersionHeader")
			.withExactArgs(sinon.match.func, "SalesOrderList('0500000676')", true);

		// code under test
		return oRequestor.request("DELETE", "SalesOrderList('0500000676')")
			.then(function (oResult) {
				assert.deepEqual(oResult, {});
			});
	});

	//*********************************************************************************************
	QUnit.test("sendRequest: GET returns '204 No Content'", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(jQuery).expects("ajax")
			.withExactArgs(sServiceUrl + "SalesOrderList('0500000676')", sinon.match.object)
			.returns(createMock(assert, undefined, "No Content", {}));
		this.mock(oRequestor).expects("doCheckVersionHeader")
			.withExactArgs(sinon.match.func, "SalesOrderList('0500000676')", true);

		// code under test
		return oRequestor.request("GET", "SalesOrderList('0500000676')")
			.then(function (oResult) {
				assert.deepEqual(oResult, null);
		});
	});

	//*********************************************************************************************
	QUnit.test("request: fail to convert payload, $direct", function (assert) {
		var oError = {},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, undefined,
				"2.0"),
			oResponsePayload = {};

		this.mock(jQuery).expects("ajax")
			.withArgs(sServiceUrl + "Employees")
			.returns(createMock(assert, oResponsePayload, "OK", {DataServiceVersion : "2.0"}));
		this.mock(oRequestor).expects("doConvertResponse")
			.withExactArgs(oResponsePayload, undefined)
			.throws(oError);

		// code under test
		return oRequestor.request("GET", "Employees")
			.then(function () {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
["42", "1a"].forEach(function (sCount) {
	QUnit.test("request: text/plain, $direct; $count=" + sCount, function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			oResponse = {
				body : sCount,
				messages : "~messages~",
				resourcePath : "~resourcePath~"
			};

		this.mock(oRequestor).expects("convertResourcePath").withExactArgs("Employees")
			.returns("~sResourcePath~");
		this.mock(oRequestor).expects("sendRequest")
			.withExactArgs("GET", "~sResourcePath~", {
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					"sap-cancel-on-close" : "true"
				}, undefined, "~sResourcePath~")
			.resolves(oResponse);
		this.mock(oRequestor).expects("reportHeaderMessages")
			.withExactArgs("~resourcePath~", "~messages~");
		this.mock(oRequestor).expects("doConvertResponse").exactly(sCount === "42" ? 1 : 0)
			.withExactArgs(42, undefined).returns("~result~");

		// code under test
		return oRequestor.request("GET", "Employees").then(function (oResult) {
			assert.strictEqual(oResult, "~result~");
			assert.strictEqual(sCount, "42");
		}, function (_oError) {
			// e.g. SyntaxError: Unexpected non-whitespace character after JSON at position 1
			assert.strictEqual(sCount, "1a");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("request: sOriginalPath, $direct", function () {
		var sOriginalPath = "TEAM('0')/TEAM_2_EMPLOYEES",
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oRequestor).expects("sendRequest")
			.withExactArgs("POST", "EMPLOYEES", sinon.match.object, sinon.match.string,
				sOriginalPath)
			.returns(Promise.resolve({}));

		// code under test
		return oRequestor.request("POST", "EMPLOYEES", this.createGroupLock("$direct"), {}, {},
			undefined, undefined, undefined, sOriginalPath);
	});

	//*********************************************************************************************
	QUnit.test("request: sOriginalPath, $batch", function () {
		var sOriginalPath = "TEAM('0')/TEAM_2_EMPLOYEES",
			oRequestor = _Requestor.create("/", oModelInterface),
			oResponse = {
				status : 500
			};

		this.mock(oRequestor).expects("sendBatch")
			// do not check parameters
			.returns(Promise.resolve([oResponse]));
		this.mock(_Helper).expects("createError")
			.withExactArgs(sinon.match.same(oResponse), "Communication error", "/EMPLOYEES",
				sOriginalPath)
			.returns(new Error());

		// code under test
		return Promise.all([
			oRequestor.request("POST", "EMPLOYEES", this.createGroupLock(), {}, {}, undefined,
				undefined, undefined, sOriginalPath).catch(function () {}),
			oRequestor.processBatch("groupId")
		]);
	});

	//*********************************************************************************************
	QUnit.test("request(...): batch group id and change sets", function () {
		var oGroupLock,
			oRequestor = _Requestor.create("/", oModelInterface);

		// Integrative test: use a real group lock because it depends on oRequestor.iSerialNumber
		oRequestor.request("PATCH", "EntitySet1", oRequestor.lockGroup("groupId", {}),
			{foo : "bar"}, {a : "b"});
		oRequestor.request("PATCH", "EntitySet2", oRequestor.lockGroup("groupId", {}),
			{bar : "baz"}, {c : "d"});
		oRequestor.request("PATCH", "EntitySet3", oRequestor.lockGroup("$auto", {}),
			{header : "value"}, {e : "f"});
		oRequestor.request("PATCH", "EntitySet4", oRequestor.lockGroup("$auto", {}),
			{header : "beAtFront"}, {g : "h"}, undefined, undefined, undefined, undefined,
			/*bAtFront*/true);
		oRequestor.request("GET", "EntitySet5", oRequestor.lockGroup("$auto", {}));
		oRequestor.request("GET", "EntitySet6", oRequestor.lockGroup("$auto", {}), undefined,
			undefined, undefined, undefined, undefined, undefined, /*bAtFront*/true);
		oGroupLock = oRequestor.lockGroup("groupId", {});
		oRequestor.addChangeSet("groupId");
		oRequestor.request("PATCH", "EntitySet7", oRequestor.lockGroup("groupId", {}),
			{serialNumber : "after change set 1"}, {i : "j"});
		oRequestor.request("PATCH", "EntitySet8", oGroupLock,
			{serialNumber : "before change set 1"}, {k : "l"});
		oRequestor.request("PATCH", "EntitySet9", oRequestor.lockGroup("groupId", {}),
			{serialNumber : "not set -> last change set"}, {m : "n"});

		TestUtils.deepContains(oRequestor.mBatchQueue, {
			groupId : [
				[/*change set 0*/{
					method : "PATCH",
					url : "EntitySet1",
					headers : {
						foo : "bar"
					},
					body : {a : "b"}
				}, {
					method : "PATCH",
					url : "EntitySet2",
					headers : {
						bar : "baz"
					},
					body : {c : "d"}
				}, {
					method : "PATCH",
					url : "EntitySet8",
					headers : {
						serialNumber : "before change set 1"
					},
					body : {k : "l"}
				}],
				[/*change set 1*/{
					method : "PATCH",
					url : "EntitySet7",
					headers : {
						serialNumber : "after change set 1"
					},
					body : {i : "j"}
				}, {
					method : "PATCH",
					url : "EntitySet9",
					headers : {
						serialNumber : "not set -> last change set"
					},
					body : {m : "n"}
				}]
			],
			$auto : [
				[/*change set!*/{
					method : "PATCH",
					url : "EntitySet4",
					headers : {
						header : "beAtFront"
					},
					body : {g : "h"}
				}, {
					method : "PATCH",
					url : "EntitySet3",
					headers : {
						header : "value"
					},
					body : {e : "f"}
				}], {
					method : "GET",
					url : "EntitySet5"
				}, { // bAtFront is ignored for GET
					method : "GET",
					url : "EntitySet6"
				}
			]
		});
	});

	//*********************************************************************************************
	QUnit.test("request(...): mQueryOptions, $batch", function () {
		var mQueryOptions = {$select : ["foo"]},
			oRequestor = _Requestor.create("/", oModelInterface);

		oRequestor.request("GET", "EntitySet", this.createGroupLock("groupId"),
			undefined, undefined, undefined, undefined, undefined, undefined, false, mQueryOptions);

		TestUtils.deepContains(oRequestor.mBatchQueue, {
			groupId : [
				[],
				{
					method : "GET",
					url : "EntitySet",
					$queryOptions : mQueryOptions
				}
			]
		});
	});

	//*********************************************************************************************
	QUnit.test("request(...): mQueryOptions, $direct", function () {
		var mQueryOptions = {},
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oRequestor).expects("addQueryString")
			.withExactArgs("EntitySet('42')?foo=bar", "/EntitySet", sinon.match.same(mQueryOptions))
			.returns("EntitySet('42')?foo=bar&~");
		this.mock(oRequestor).expects("sendRequest").withArgs("GET", "EntitySet('42')?foo=bar&~")
			.resolves({});

		// code under test
		return oRequestor.request("GET", "EntitySet('42')?foo=bar", this.createGroupLock("$direct"),
			undefined, undefined, undefined, undefined, "/EntitySet", undefined, false,
			mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("request(...): $single", function () {
		var mQueryOptions = {$select : ["foo"]},
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oRequestor).expects("submitBatch").withExactArgs("$single").callsFake(() => {
			TestUtils.deepContains(oRequestor.mBatchQueue, {
				$single : [
					[],
					{
						method : "GET",
						url : "EntitySet",
						$queryOptions : mQueryOptions
					}
				]
			});
		});

		oRequestor.request("GET", "EntitySet", this.createGroupLock("$single"),
			undefined, undefined, undefined, undefined, undefined, undefined, false, mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("request(...): throw error if $single queue not empty", function (assert) {
		var mQueryOptions = {$select : ["foo"]},
			oRequestor = _Requestor.create("/", oModelInterface);

		oRequestor.mBatchQueue["$single"] = [];

		this.mock(oRequestor).expects("getOrCreateBatchQueue").never();
		this.mock(oRequestor).expects("submitBatch").never();

		assert.throws(function () {
			// code under test
			oRequestor.request("GET", "EntitySet", this.createGroupLock("$single"),
				undefined, undefined, undefined, undefined, undefined, undefined, false,
				mQueryOptions);
		}, new Error("Cannot add new request to already existing $single queue"));
	});

	//*********************************************************************************************
	QUnit.test("processBatch: fail, unsupported OData service version", function (assert) {
		var oError = {},
			oGetProductsPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oResponse = {
				headers : {
					"Content-Length" : "42",
					"OData-Version" : "foo"
				},
				responseText : JSON.stringify({d : {foo : "bar"}})
			};

		this.mock(oRequestor).expects("doConvertResponse").never();
		this.mock(oRequestor).expects("reportHeaderMessages").never();
		oGetProductsPromise = oRequestor.request("GET", "Products", this.createGroupLock())
			.then(function () {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
		this.mock(oRequestor).expects("sendBatch").resolves([oResponse]); // arguments don't matter
		this.mock(oRequestor).expects("doCheckVersionHeader")
			.withExactArgs(sinon.match(function (fnGetResponseHeader) {
				assert.strictEqual(typeof fnGetResponseHeader, "function");
				assert.strictEqual(fnGetResponseHeader("OData-Version"), "foo",
					"getResponseHeader has to be called on mResponse");
				return true;
			}), "Products", true)
			.throws(oError);

		return Promise.all([
			oGetProductsPromise,
			// code under test
			oRequestor.processBatch("groupId")
		]);
	});

	//*********************************************************************************************
[false, true].forEach(function (bWithCredentials) {
	[false, true].forEach(function (bSuccess) {
		const sTitle = "refreshSecurityToken, success=" + bSuccess + ", withCredentials="
			+ bWithCredentials;
		QUnit.test(sTitle, function (assert) {
			var oError = {},
				oPromise,
				mHeaders = {},
				oAjaxSettings = {
					headers : "~requestHeaders~",
					method : "HEAD"
				},
				oRequestor = _Requestor.create("/Service/", oModelInterface, mHeaders,
					{"sap-client" : "123"}, /*sODataVersion*/undefined, bWithCredentials),
				oTokenRequiredResponse = {};

			if (bWithCredentials) {
				oAjaxSettings.xhrFields = {withCredentials : true};
			}

			this.mock(Object).expects("assign").twice()
				.withExactArgs({}, sinon.match.same(mHeaders), {"X-CSRF-Token" : "Fetch"})
				.returns("~requestHeaders~");
			this.mock(_Helper).expects("createError")
				.exactly(bSuccess ? 0 : 2)
				.withExactArgs(sinon.match.same(oTokenRequiredResponse),
					"Could not refresh security token")
				.returns(oError);

			this.mock(jQuery).expects("ajax").twice()
				.withExactArgs("/Service/?sap-client=123", oAjaxSettings)
				.callsFake(function () {
					var jqXHR;

					if (bSuccess) {
						jqXHR = createMock(assert, undefined, "nocontent", {
							"OData-Version" : "4.0",
							"X-CSRF-Token" : "abc123"
						});
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
			oPromise = oRequestor.refreshSecurityToken(undefined);

			assert.strictEqual(oRequestor.refreshSecurityToken(undefined), oPromise,
				"promise reused");
			assert.strictEqual(oRequestor.oSecurityTokenPromise, oPromise,
				"promise stored at requestor instance so that request method can use it");

			return oPromise.then(function () {
				assert.ok(bSuccess, "success possible");
				assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
			}, function (oError0) {
				assert.ok(!bSuccess, "certain failure");
				assert.strictEqual(oError0, oError);
				assert.strictEqual("X-CSRF-Token" in oRequestor.mHeaders, false);
			}).then(function () {
				// code under test
				return oRequestor.refreshSecurityToken("some_old_token").then(function () {
					var oNewPromise;

					// code under test
					oNewPromise = oRequestor.refreshSecurityToken(
						oRequestor.mHeaders["X-CSRF-Token"]);

					assert.notStrictEqual(oNewPromise, oPromise, "new promise");
					// avoid "Uncaught (in promise)"
					return oNewPromise.catch(function () {
						assert.ok(!bSuccess, "certain failure");
					});
				});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshSecurityToken: keep fetching even if none is sent", function (assert) {
		var mHeaders = {"X-CSRF-Token" : "old"},
			mRequestHeaders = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface, mHeaders,
				{"sap-client" : "123"});

		this.mock(Object).expects("assign").twice()
			.withExactArgs({}, sinon.match.same(mHeaders), {"X-CSRF-Token" : "Fetch"})
			.returns(mRequestHeaders);
		this.mock(jQuery).expects("ajax").twice()
			.withExactArgs("/Service/?sap-client=123", sinon.match({
				headers : sinon.match.same(mRequestHeaders),
				method : "HEAD"
			}))
			.returns(createMock(assert, undefined, "nocontent", {"OData-Version" : "4.0"}));

		// code under test
		return oRequestor.refreshSecurityToken("old").then(function () {
			// Note: "old" must not be current anymore!
			return oRequestor.refreshSecurityToken();
		});
	});

	//*********************************************************************************************
[{
	headers : {
		securityToken0 : "foo",
		securityToken1 : "bar"
	},
	expectedHeaders : {
		"Accept-Language" : "en",
		"X-CSRF-Token" : undefined, // Note: this is not sent by jQuery.ajax()
		securityToken0 : "foo",
		securityToken1 : "bar"
	}
}, {
	headers : undefined,
	expectedHeaders : {
		"Accept-Language" : "en",
		"X-CSRF-Token" : undefined // Note: this is not sent by jQuery.ajax()
	}
}, {
	headers : {
		"X-CSRF-Token" : "X-CSRF-Token from handler"
	},
	expectedHeaders : {
		"Accept-Language" : "en",
		"X-CSRF-Token" : "X-CSRF-Token from handler"
	}
}, {
	headers : {
		"x-csRf-toKen" : "x-csRf-toKen from handler"
	},
	expectedHeaders : {
		"Accept-Language" : "en",
		"X-CSRF-Token" : undefined, // Note: this is not sent by jQuery.ajax()
		"x-csRf-toKen" : "x-csRf-toKen from handler"
	}
}].forEach(function (oFixture) {
	QUnit.test("processSecurityTokenHandlers: ", function (assert) {
		var oRequestor;

		function securityTokenHandler0() {
			return undefined;
		}

		function securityTokenHandler1() {
			return Promise.resolve(oFixture.headers);
		}

		function securityTokenHandler2() {
			return Promise.resolve({"This should change" : "nothing!"});
		}

		this.mock(Security).expects("getSecurityTokenHandlers")
			.withExactArgs()
			.returns([securityTokenHandler0, securityTokenHandler1, securityTokenHandler2]);
		this.mock(_Requestor.prototype).expects("checkHeaderNames")
			.withExactArgs(sinon.match.same(oFixture.headers));

		// code under test
		oRequestor = _Requestor.create("/Service/", oModelInterface, {"Accept-Language" : "en"});

		assert.notStrictEqual(oRequestor.oSecurityTokenPromise, null);

		return oRequestor.oSecurityTokenPromise.then(function (oResult) {
			assert.deepEqual(oRequestor.mHeaders, oFixture.expectedHeaders);
			assert.strictEqual(oResult, undefined);
			assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("processSecurityTokenHandler: handler rejects", function (assert) {
		var oRequestor;

		function securityTokenHandler() {
			return Promise.reject("foo");
		}

		this.mock(Security).expects("getSecurityTokenHandlers")
			.withExactArgs()
			.returns([securityTokenHandler]);
		this.oLogMock.expects("error")
			.withExactArgs("An error occurred within security token handler: "
				+ securityTokenHandler, "foo", sClassName);

		// code under test
		oRequestor = _Requestor.create();

		return oRequestor.oSecurityTokenPromise.then(function () {
			assert.notOk(true);
			assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
		}, function (oError0) {
			assert.strictEqual(oError0, "foo");
		});
	});

	//*********************************************************************************************
	QUnit.test("processSecurityTokenHandler: checkHeaderNames throws", function (assert) {
		var oError = new Error("checkHeaderNames fails"),
			oRequestor,
			mNotAllowedHeaders = {};

		function securityTokenHandler() {
			return Promise.resolve(mNotAllowedHeaders);
		}

		this.mock(Security).expects("getSecurityTokenHandlers")
			.withExactArgs()
			.returns([securityTokenHandler]);

		this.mock(_Requestor.prototype).expects("checkHeaderNames")
			.withExactArgs(sinon.match.same(mNotAllowedHeaders)).throws(oError);

		this.oLogMock.expects("error")
			.withExactArgs("An error occurred within security token handler: "
				+ securityTokenHandler, oError, sClassName);

		// code under test
		oRequestor = _Requestor.create();

		return oRequestor.oSecurityTokenPromise.then(function () {
			assert.notOk(true);
			assert.strictEqual(oRequestor.oSecurityTokenPromise, null);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): with empty group", function (assert) {
		var oRequestor = _Requestor.create("/Service/", oModelInterface),
			that = this;

		this.mock(oRequestor).expects("mergeGetRequests").never();
		this.mock(oRequestor).expects("sendBatch").never();
		this.mock(oRequestor).expects("batchRequestSent").never();
		this.mock(oRequestor).expects("batchResponseReceived").never();

		// code under test
		return oRequestor.processBatch("groupId").then(function (oResult) {
			var oBody = {},
				oEntity = {},
				oPromise;

			assert.deepEqual(oResult, undefined);

			_Helper.setPrivateAnnotation(oEntity, "postBody", oBody);
			oPromise = oRequestor.request("POST", "Customers", that.createGroupLock(), {},
				oBody, /*fnSubmit*/undefined, function () {});

			oRequestor.removePost("groupId", oEntity);
			oRequestor.addChangeSet("groupId");

			return Promise.all([
				oPromise.catch(function (oError) {
					assert.ok(oError.canceled);
				}),
				// code under test
				oRequestor.processBatch("groupId")
			]).then(function () {
				assert.strictEqual(oRequestor.mBatchQueue["groupId"], undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): success", function (assert) {
		var oBatchRequestSentExpectation,
			oBatchResponseReceivedExpectation,
			oCleanUpChangeSetsExpectation,
			fnSubmit = function () {},
			aExpectedRequests = [[{
				method : "POST",
				url : "~Customers",
				headers : {
					Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					Foo : "baz"
				},
				body : {ID : 1},
				$cancel : undefined,
				$mergeRequests : undefined,
				$metaPath : undefined,
				$owner : undefined,
				$promise : sinon.match.defined,
				$queryOptions : undefined,
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$resourcePath : "~Customers",
				$submit : undefined
			}, {
				method : "DELETE",
				url : "~SalesOrders('42')",
				headers : {
					Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
				},
				body : undefined,
				$cancel : undefined,
				$mergeRequests : undefined,
				$metaPath : undefined,
				$owner : undefined,
				$promise : sinon.match.defined,
				$queryOptions : undefined,
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$resourcePath : "~SalesOrders('42')",
				$submit : undefined
			}], {
				method : "GET",
				url : "~Products('23')",
				headers : {
					Accept : "application/json;odata.metadata=full",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					Foo : "bar"
				},
				body : "~payload~",
				$cancel : "~cancel~",
				$mergeRequests : "~mergeRequests~",
				$metaPath : "~metaPath~",
				$owner : "~owner~",
				$promise : sinon.match.defined,
				$queryOptions : "~queryOptions~",
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$resourcePath : "~sOriginalResourcePath~",
				$submit : sinon.match.same(fnSubmit)
			}, {
				method : "GET",
				url : "~Products('4711')",
				headers : {
					Accept : "application/json;odata.metadata=full",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
				},
				body : undefined,
				$cancel : undefined,
				$mergeRequests : undefined,
				$metaPath : undefined,
				$owner : undefined,
				$promise : sinon.match.defined,
				$queryOptions : undefined,
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$resourcePath : "~Products('4711')",
				$submit : undefined
			}],
			sGroupId = "group1",
			aMergedRequests,
			aPromises = [],
			aResults = [{foo1 : "bar1"}, {foo2 : "bar2"}, {}],
			aBatchResults = [
				[createResponse(aResults[1]), createResponse()],
				createResponse(aResults[0], {etAG : "ETag value"}), createResponse()
			],
			oRequestor = _Requestor.create("/Service/", oModelInterface,
				{"Accept-Language" : "ab-CD"}),
			oRequestorMock = this.mock(oRequestor),
			oSendBatchExpectation,
			bWaitingIsOver;

		oRequestorMock.expects("convertResourcePath").withExactArgs("Products('23')")
			.returns("~Products('23')");
		aPromises.push(oRequestor.request("GET", "Products('23')", this.createGroupLock(sGroupId),
				{Foo : "bar", Accept : "application/json;odata.metadata=full"}, "~payload~",
				fnSubmit, "~cancel~", "~metaPath~", "~sOriginalResourcePath~", undefined,
				"~queryOptions~", "~owner~", "~mergeRequests~")
			.then(function (oResult) {
				assert.deepEqual(oResult, {
					"@odata.etag" : "ETag value",
					foo1 : "bar1"
				});
				aResults[0] = null;
				assert.notOk(bWaitingIsOver);
			}));
		oRequestorMock.expects("convertResourcePath").withExactArgs("Products('4711')")
			.returns("~Products('4711')");
		aPromises.push(oRequestor.request("GET", "Products('4711')", this.createGroupLock(sGroupId),
				{Accept : "application/json;odata.metadata=full"})
			.then(function (oResult) {
				assert.deepEqual(oResult, null);
				aResults[0] = null;
				assert.notOk(bWaitingIsOver);
			}));
		oRequestorMock.expects("convertResourcePath").withExactArgs("Customers")
			.returns("~Customers");
		aPromises.push(oRequestor.request("POST", "Customers", this.createGroupLock(sGroupId), {
			Foo : "baz"
		}, {
			ID : 1
		}).then(function (oResult) {
			assert.deepEqual(oResult, aResults[1]);
			aResults[1] = null;
				assert.notOk(bWaitingIsOver);
		}));
		oRequestorMock.expects("convertResourcePath").withExactArgs("SalesOrders('42')")
			.returns("~SalesOrders('42')");
		aPromises.push(
			oRequestor.request("DELETE", "SalesOrders('42')", this.createGroupLock(sGroupId))
			.then(function (oResult) {
				assert.deepEqual(oResult, aResults[2]);
				aResults[2] = null;
				assert.notOk(bWaitingIsOver);
			}));
		oRequestorMock.expects("convertResourcePath").withExactArgs("SalesOrders")
			.returns("~SalesOrders");
		oRequestor.request("GET", "SalesOrders", this.createGroupLock("group2"));
		aExpectedRequests.iChangeSet = 0;
		aExpectedRequests[0].iSerialNumber = 0; // Note: #cleanUpChangeSets would remove this

		oCleanUpChangeSetsExpectation = oRequestorMock.expects("cleanUpChangeSets")
			.withExactArgs(aExpectedRequests).returns("~bHasChanges~");
		oRequestorMock.expects("mergeGetRequests").withExactArgs(aExpectedRequests)
			.callsFake(function (aRequests) {
				aMergedRequests = aRequests.slice();
				return aMergedRequests;
			});
		oBatchRequestSentExpectation = oRequestorMock.expects("batchRequestSent")
			.withExactArgs(sGroupId, sinon.match(function (aRequests) {
				return aRequests === aMergedRequests;
			}), "~bHasChanges~")
			.callThrough(); // enable #waitForRunningChangeRequests
		oSendBatchExpectation = oRequestorMock.expects("sendBatch")
			.withExactArgs(sinon.match(function (aRequests) {
				return aRequests === aMergedRequests;
			}), sGroupId, "~bHasChanges~")
			.resolves(aBatchResults);
		oBatchResponseReceivedExpectation = oRequestorMock.expects("batchResponseReceived")
			.withExactArgs(sGroupId, sinon.match(function (aRequests) {
				return aRequests === aMergedRequests;
			}), "~bHasChanges~")
			.callThrough(); // enable #waitForRunningChangeRequests

		// code under test
		aPromises.push(oRequestor.processBatch("group1").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.deepEqual(aResults, [null, null, null], "all batch requests already resolved");
			assert.ok(oBatchResponseReceivedExpectation.calledAfter(oSendBatchExpectation));
		}));

		assert.ok(oBatchRequestSentExpectation.calledImmediatelyBefore(oSendBatchExpectation));
		assert.ok(oBatchResponseReceivedExpectation.notCalled);
		oCleanUpChangeSetsExpectation.verify();
		oRequestorMock.expects("cleanUpChangeSets").withExactArgs([]).returns(false);

		// code under test
		aPromises.push(oRequestor.processBatch("group1")); // must not call sendBatch etc. again

		assert.strictEqual(oRequestor.mBatchQueue.group1, undefined);
		TestUtils.deepContains(oRequestor.mBatchQueue.group2, [[/*change set*/], {
			method : "GET",
			url : "~SalesOrders"
		}]);

		// code under test
		aPromises.push(oRequestor.waitForRunningChangeRequests("group1").then(function () {
			bWaitingIsOver = true;
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): single GET", function (assert) {
		var aExpectedRequests = [
				// Note: no empty change set!
				sinon.match({method : "GET", url : "Products"})
			],
			oPromise,
			oRequestor = _Requestor.create("/", oModelInterface);

		oRequestor.request("GET", "Products", this.createGroupLock());
		aExpectedRequests.iChangeSet = 0;
		this.mock(oRequestor).expects("sendBatch")
			.withExactArgs(aExpectedRequests, "groupId", false).resolves([
				createResponse({})
			]);

		assert.notOk(oRequestor.isBatchSent());

		// code under test
		oPromise = oRequestor.processBatch("groupId");

		assert.ok(oRequestor.isBatchSent());

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): merge PATCH requests", function (assert) {
		var oBusinessPartners42 = {},
			oEntityProduct0 = {},
			oEntityProduct0OtherCache = {},
			oEntityProduct1 = {},
			aExpectedRequests = [
				[
					sinon.match({
						body : {Name : "bar2", Note : "hello, world"},
						method : "PATCH",
						url : "Products('0')"
					}),
					sinon.match({
						body : {Name : "p1"},
						method : "PATCH",
						url : "Products('1')"
					}),
					sinon.match({
						body : {Note : "no merge!"},
						method : "PATCH",
						url : "Products('0')"
					}),
					sinon.match({
						body : {Name : "baz"},
						method : "POST",
						url : "Products"
					}),
					sinon.match({
						body : {},
						method : "POST",
						url : "Products('0')/GetCurrentStock"
					}),
					sinon.match({
						body : {Address : {City : "Walldorf", PostalCode : "69190"}},
						method : "PATCH",
						url : "BusinessPartners('42')"
					})
				],
				sinon.match({
					method : "GET",
					url : "Products"
				})
			],
			fnMergePatch0 = this.spy(),
			fnMergePatch1 = "~mergePatchRequests~",
			fnMergePatch2 = this.stub(),
			fnMergePatch3 = this.stub(),
			fnMergePatch4 = this.spy(),
			fnMergePatch5 = this.stub(),
			fnMergePatch6 = this.spy(),
			fnMergePatch7 = this.stub(),
			fnMergePatch8 = this.stub(),
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface),
			fnSubmit0 = this.spy(),
			fnSubmit1 = this.spy(),
			fnSubmit2 = this.spy(),
			fnSubmit3 = this.spy(),
			fnSubmit4 = this.spy();

		fnMergePatch2.returns("~oOldValue02~");
		fnMergePatch3.returns("~oOldValue03~");
		fnMergePatch5.returns("~oOldValue05~");
		fnMergePatch7.returns("~oOldValue07~");
		fnMergePatch8.returns("~oOldValue08~");

		aPromises.push(oRequestor.request("PATCH", "Products('0')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oEntityProduct0}, {Name : null},
			undefined, undefined, undefined, undefined, undefined, undefined, undefined,
			fnMergePatch0));
		oRequestor.request("PATCH", "Products('0')", oRequestor.lockGroup("otherGroupId", {}),
			{"If-Match" : oEntityProduct0OtherCache}, {Price : "5.0"}, undefined, undefined,
			undefined, undefined, undefined, undefined, undefined, fnMergePatch1);
		aPromises.push(oRequestor.request("PATCH", "Products('0')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oEntityProduct0}, {Name : "bar"},
			undefined, undefined, undefined, undefined, undefined, undefined, undefined,
			fnMergePatch2));
		aPromises.push(oRequestor.request("GET", "Products", oRequestor.lockGroup("groupId", {}),
			undefined, undefined, fnSubmit0));
		aPromises.push(oRequestor.request("PATCH", "Products('0')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oEntityProduct0},
			{Note : "hello, world"}, undefined, undefined, undefined, undefined, undefined,
			undefined, undefined, fnMergePatch3));
		// different entity in between
		aPromises.push(oRequestor.request("PATCH", "Products('1')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oEntityProduct1}, {Name : "p1"},
			undefined, undefined, undefined, undefined, undefined, undefined, undefined,
			fnMergePatch4));
		aPromises.push(oRequestor.request("PATCH", "Products('0')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oEntityProduct0}, {Name : "bar2"},
			undefined, undefined, undefined, undefined, undefined, undefined, undefined,
			fnMergePatch5));
		// same group but different cache
		aPromises.push(oRequestor.request("PATCH", "Products('0')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oEntityProduct0OtherCache},
			{Note : "no merge!"}));
		// a create
		aPromises.push(oRequestor.request("POST", "Products", oRequestor.lockGroup("groupId", {}),
			null, {Name : "baz"}, fnSubmit1));
		// a bound action
		aPromises.push(oRequestor.request("POST", "Products('0')/GetCurrentStock",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oEntityProduct0}, {}, fnSubmit2));
		// structured property
		// first set to null: may be merged with each other, but not with PATCHES to properties
		aPromises.push(oRequestor.request("PATCH", "BusinessPartners('42')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oBusinessPartners42},
			{Address : null}, undefined, undefined, undefined, undefined, undefined, undefined,
			undefined, fnMergePatch6));
		// then two different properties therein: must be merged
		aPromises.push(oRequestor.request("PATCH", "BusinessPartners('42')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oBusinessPartners42},
			{Address : {City : "Walldorf"}}, fnSubmit3, undefined, undefined, undefined, undefined,
			undefined, undefined, fnMergePatch7));
		aPromises.push(oRequestor.request("PATCH", "BusinessPartners('42')",
			oRequestor.lockGroup("groupId", {}), {"If-Match" : oBusinessPartners42},
			{Address : {PostalCode : "69190"}}, fnSubmit4, undefined, undefined, undefined,
			undefined, undefined, undefined, fnMergePatch8));
		aExpectedRequests.iChangeSet = 0;
		this.mock(oRequestor).expects("sendBatch")
			.withExactArgs(aExpectedRequests, "groupId", true).resolves([
				[
					createResponse({Name : "bar2", Note : "hello, world"}),
					createResponse({Name : "p1"}),
					createResponse({Note : "no merge!"}),
					createResponse({Name : "baz"}),
					createResponse({value : "123 EA"}),
					createResponse({Address : {City : "Walldorf", PostalCode : "69190"}})
				],
				createResponse({Name : "Name", Note : "Note"})
			]);

		// code under test
		aPromises.push(oRequestor.processBatch("groupId"));

		sinon.assert.calledOnceWithExactly(fnSubmit0);
		sinon.assert.calledOnceWithExactly(fnSubmit1);
		sinon.assert.calledOnceWithExactly(fnSubmit2);
		sinon.assert.calledOnceWithExactly(fnSubmit3);
		sinon.assert.calledOnceWithExactly(fnSubmit4);

		sinon.assert.calledThrice(fnMergePatch0);
		sinon.assert.calledWithExactly(fnMergePatch0, "~oOldValue02~");
		sinon.assert.calledWithExactly(fnMergePatch0, "~oOldValue03~");
		sinon.assert.calledWithExactly(fnMergePatch0, "~oOldValue05~");
		sinon.assert.calledOnceWithExactly(fnMergePatch2);
		sinon.assert.calledOnceWithExactly(fnMergePatch3);
		assert.notOk(fnMergePatch4.called);
		sinon.assert.calledOnceWithExactly(fnMergePatch5);
		sinon.assert.calledTwice(fnMergePatch6);
		sinon.assert.calledWithExactly(fnMergePatch6, "~oOldValue07~");
		sinon.assert.calledWithExactly(fnMergePatch6, "~oOldValue08~");
		sinon.assert.calledOnceWithExactly(fnMergePatch7);
		sinon.assert.calledOnceWithExactly(fnMergePatch8);
		return Promise.all(aPromises).then(function (aResults) {
			assert.deepEqual(aResults, [
				{Name : "bar2", Note : "hello, world"}, // 1st PATCH
				{Name : "bar2", Note : "hello, world"}, // 2nd PATCH, merged with 1st
				{Name : "Name", Note : "Note"}, // GET
				{Name : "bar2", Note : "hello, world"}, // 3rd PATCH, merged with 1st and 2nd
				{Name : "p1"}, // 1st PATCH for another entity
				{Name : "bar2", Note : "hello, world"}, // 4th PATCH, merged with previous PATCHes
				{Note : "no merge!"}, // PATCH with different headers
				{Name : "baz"}, // POST (create)
				{value : "123 EA"}, // POST (bound action)
				{Address : {City : "Walldorf", PostalCode : "69190"}},
				{Address : {City : "Walldorf", PostalCode : "69190"}},
				{Address : {City : "Walldorf", PostalCode : "69190"}},
				undefined // processBatch()
			]);
		});
	});

	//*********************************************************************************************
	[{
		sODataVersion : "2.0",
		mExpectedRequestHeaders : {
			Accept : "application/json",
			"Content-Type" : "application/json;charset=UTF-8"
		},
		mProductsResponse : {d : {results : [{foo : "bar"}]}}
	}, {
		sODataVersion : "4.0",
		mExpectedRequestHeaders : {
			Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		mProductsResponse : {value : [{foo : "bar"}]}
	}].forEach(function (oFixture) {
		var sTitle = "processBatch(...): OData version specific headers; sODataVersion="
			+ oFixture.sODataVersion;

		QUnit.test(sTitle, function (assert) {
			var oConvertedPayload = {},
				sMetaPath = "~",
				aExpectedRequests = [{
					method : "GET",
					url : "Products",
					headers : oFixture.mExpectedRequestHeaders,
					body : undefined,
					$cancel : undefined,
					$mergeRequests : undefined,
					$metaPath : sMetaPath,
					$owner : undefined,
					$promise : sinon.match.defined,
					$queryOptions : undefined,
					$reject : sinon.match.func,
					$resolve : sinon.match.func,
					$resourcePath : "Products",
					$submit : undefined
				}],
				oGetProductsPromise,
				oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, undefined,
					oFixture.sODataVersion);

			this.mock(oRequestor).expects("doConvertResponse")
			// not same; it is stringified and parsed
				.withExactArgs(oFixture.mProductsResponse, sMetaPath)
				.returns(oConvertedPayload);
			oGetProductsPromise = oRequestor.request("GET", "Products", this.createGroupLock(),
				undefined, undefined, undefined, undefined, sMetaPath)
				.then(function (oResponse) {
					assert.strictEqual(oResponse, oConvertedPayload);
				});

			aExpectedRequests.iChangeSet = 0;
			this.mock(oRequestor).expects("sendBatch")
				.withExactArgs(aExpectedRequests, "groupId", false)
				.resolves([createResponse(oFixture.mProductsResponse)]);

			return Promise.all([
				oGetProductsPromise,
				// code under test
				oRequestor.processBatch("groupId")
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("processBatch: fail to convert payload", function (assert) {
		var oError = {},
			oGetProductsPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, undefined,
				"2.0"),
			oResponse = {d : {foo : "bar"}};

		this.mock(oRequestor).expects("doConvertResponse")
			.withExactArgs(oResponse, undefined)
			.throws(oError);
		oGetProductsPromise = oRequestor.request("GET", "Products", this.createGroupLock())
			.then(function () {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
		this.mock(oRequestor).expects("sendBatch") // arguments don't matter
			.resolves([createResponse(oResponse)]);

		return Promise.all([
			oGetProductsPromise,
			// code under test
			oRequestor.processBatch("groupId")
		]);
	});

	//*********************************************************************************************
	QUnit.test("processBatch: report unbound messages", function () {
		var mHeaders = {"SAP-Messages" : {}},
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestPromise = oRequestor.request("GET", "Products(42)", this.createGroupLock());

		this.mock(oRequestor).expects("sendBatch") // arguments don't matter
			.resolves([createResponse({id : 42}, mHeaders)]);
		this.mock(oRequestor).expects("reportHeaderMessages")
			.withExactArgs("Products(42)", sinon.match.same(mHeaders["SAP-Messages"]));

		return Promise.all([
			oRequestPromise,
			// code under test
			oRequestor.processBatch("groupId")
		]);
	});

	//*********************************************************************************************
	QUnit.test("processBatch: support ETag header", function (assert) {
		var mHeaders = {"SAP-Messages" : {}, ETag : "ETag"},
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestPromise = oRequestor.request("PATCH", "Products(42)", this.createGroupLock());

		this.mock(oRequestor).expects("sendBatch") // arguments don't matter
			.resolves([createResponse(undefined, mHeaders)]);
		this.mock(oRequestor).expects("reportHeaderMessages")
			.withExactArgs("Products(42)", sinon.match.same(mHeaders["SAP-Messages"]));

		return Promise.all([
			oRequestPromise,
			// code under test
			oRequestor.processBatch("groupId")
		]).then(function (aResults) {
				assert.deepEqual(aResults[0], {"@odata.etag" : "ETag"});
			});
	});

	//*********************************************************************************************
	QUnit.test("processBatch: missing ETag header", function (assert) {
		var mHeaders = {"SAP-Messages" : {}},
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestPromise = oRequestor.request("DELETE", "Products(42)", this.createGroupLock());

		this.mock(oRequestor).expects("sendBatch") // arguments don't matter
			.resolves([createResponse(undefined, mHeaders)]);
		this.mock(oRequestor).expects("reportHeaderMessages")
			.withExactArgs("Products(42)", sinon.match.same(mHeaders["SAP-Messages"]));

		return Promise.all([
			oRequestPromise,
			// code under test
			oRequestor.processBatch("groupId")
		]).then(function (aResults) {
				assert.deepEqual(aResults[0], {});
			});
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): $batch failure", function (assert) {
		var oBatchError = new Error("$batch request failed"),
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface),
			aRequests,
			bWaitingIsOver;

		function unexpected() {
			assert.ok(false);
		}

		function assertError(oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(oError.message,
				"HTTP request was not processed because $batch failed");
			assert.strictEqual(oError.cause, oBatchError);
			assert.notOk(bWaitingIsOver);
		}

		function isRequests(aRequests0) {
			return aRequests0 === aRequests;
		}

		aPromises.push(oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
				{"If-Match" : {/* product 0*/}}, {Name : "foo"})
			.then(unexpected, assertError));
		aPromises.push(oRequestor.request("PATCH", "Products('1')", this.createGroupLock(),
				{"If-Match" : {/* product 1*/}}, {Name : "foo"})
			.then(unexpected, assertError));
		aPromises.push(oRequestor.request("GET", "Products", this.createGroupLock())
			.then(unexpected, assertError));
		aPromises.push(oRequestor.request("GET", "Customers", this.createGroupLock())
			.then(unexpected, assertError));

		this.mock(oRequestor).expects("cleanUpChangeSets").withExactArgs(sinon.match.array)
			.callsFake(function (aRequests0) {
				aRequests = aRequests0;
				return "~bHasChanges~";
			});
		this.mock(oRequestor).expects("mergeGetRequests").withExactArgs(sinon.match(isRequests))
			.callsFake(function () {
				aRequests = aRequests.slice();
				return aRequests;
			});
		this.mock(oRequestor).expects("batchRequestSent")
			.withExactArgs("groupId", sinon.match(isRequests), "~bHasChanges~")
			.callThrough(); // enable #waitForRunningChangeRequests
		this.mock(oRequestor).expects("sendBatch").rejects(oBatchError); // arguments don't matter
		this.mock(_Helper).expects("decomposeError").never();
		this.mock(oRequestor).expects("batchResponseReceived")
			.withExactArgs("groupId", sinon.match(isRequests), "~bHasChanges~")
			.callThrough(); // enable #waitForRunningChangeRequests

		// code under test
		aPromises.push(oRequestor.processBatch("groupId").then(unexpected, function (oError) {
			assert.strictEqual(oError, oBatchError);
		}));

		// code under test
		aPromises.push(oRequestor.waitForRunningChangeRequests("groupId").then(function () {
			bWaitingIsOver = true;
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): failure followed by another request", function (assert) {
		var oError = {error : {message : "404 Not found"}},
			aBatchResult = [{
				headers : {},
				responseText : "{}",
				status : 200
			}, {
				getResponseHeader : function () {
					return "application/json";
				},
				headers : {"Content-Type" : "application/json"},
				responseText : JSON.stringify(oError),
				status : 404,
				statusText : "Not found"
			}],
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface);

		function unexpected() {
			assert.ok(false);
		}

		function assertError(oResultError) {
			assert.ok(oResultError instanceof Error);
			assert.deepEqual(oResultError.error, oError.error);
			assert.strictEqual(oResultError.message, oError.error.message);
			assert.strictEqual(oResultError.status, 404);
			assert.strictEqual(oResultError.statusText, "Not found");
		}

		aPromises.push(
			oRequestor.request("GET", "ok", this.createGroupLock()).then(function (oResult) {
				assert.deepEqual(oResult, {});
			}).catch(unexpected));

		aPromises.push(oRequestor.request("GET", "fail", this.createGroupLock())
			.then(unexpected, function (oResultError) {
				assertError(oResultError);
			}));

		aPromises.push(oRequestor.request("GET", "ok", this.createGroupLock())
			.then(unexpected, function (oResultError) {
				assert.ok(oResultError instanceof Error);
				assert.strictEqual(oResultError.message,
					"HTTP request was not processed because the previous request failed");
				assert.strictEqual(oResultError.$reported, true);
				assertError(oResultError.cause);
			}));

		this.mock(oRequestor).expects("sendBatch").resolves(aBatchResult); // arguments don't matter

		// code under test
		aPromises.push(oRequestor.processBatch("groupId").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): failure followed by another change set", function (assert) {
		var oError = {error : {message : "404 Not found"}},
			aBatchResult = [{
				getResponseHeader : function () {
					return "application/json";
				},
				headers : {"Content-Type" : "application/json"},
				responseText : JSON.stringify(oError),
				status : 404,
				statusText : "Not found"
			}],
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface);

		function unexpected() {
			assert.ok(false);
		}

		function assertError(oResultError) {
			assert.ok(oResultError instanceof Error);
			assert.deepEqual(oResultError.error, oError.error);
			assert.strictEqual(oResultError.message, oError.error.message);
			assert.strictEqual(oResultError.status, 404);
			assert.strictEqual(oResultError.statusText, "Not found");
		}

		aPromises.push(oRequestor.request("PATCH", "fail", this.createGroupLock())
			.then(unexpected, function (oResultError) {
				assertError(oResultError);
			}));

		oRequestor.addChangeSet("groupId");

		// Note: "If-Match" : {} prevents merging of PATCH requests
		aPromises.push(oRequestor.request("PATCH", "n/a", this.createGroupLock(), {"If-Match" : {}})
			.then(unexpected, function (oResultError) {
				assert.ok(oResultError instanceof Error);
				assert.strictEqual(oResultError.message,
					"HTTP request was not processed because the previous request failed");
				assert.strictEqual(oResultError.$reported, true);
				assertError(oResultError.cause);
			}));

		aPromises.push(oRequestor.request("PATCH", "n/a", this.createGroupLock(), {"If-Match" : {}})
			.then(unexpected, function (oResultError) {
				assert.ok(oResultError instanceof Error);
				assert.strictEqual(oResultError.message,
					"HTTP request was not processed because the previous request failed");
				assert.strictEqual(oResultError.$reported, true);
				assertError(oResultError.cause);
			}));

		this.mock(oRequestor).expects("sendBatch").resolves(aBatchResult); // arguments don't matter

		// code under test
		aPromises.push(oRequestor.processBatch("groupId").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("processBatch(...): error in change set", function (assert) {
		var oCause = new Error(),
			aBatchResult = [{
				getResponseHeader : function () {
					return "application/json";
				},
				headers : {"Content-Type" : "application/json"},
				responseText : JSON.stringify({error : {message : "400 Bad Request"}}),
				status : 400,
				statusText : "Bad Request"
			}],
			oError0 = new Error("0"),
			oError1 = new Error("1"),
			fnMergePatch0 = this.spy(),
			fnMergePatch1 = this.stub(),
			oProduct = {},
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface),
			aRequests;

		fnMergePatch1.returns("~oOldData~");
		aPromises.push(oRequestor.request("PATCH", "ProductList('HT-1001')",
				this.createGroupLock(), {"If-Match" : oProduct}, {Name : "foo"}, undefined,
				undefined, undefined, undefined, undefined, undefined, undefined, fnMergePatch0)
			.catch(function (oError) {
				assert.strictEqual(oError, oError0);
			}));

		aPromises.push(oRequestor.request("POST", "Unknown", this.createGroupLock(), undefined, {})
			.catch(function (oError) {
				assert.strictEqual(oError, oError1);
			}));

		aPromises.push(oRequestor.request("PATCH", "ProductList('HT-1001')",
				this.createGroupLock(), {"If-Match" : oProduct}, {Name : "bar"}, undefined,
				undefined, undefined, undefined, undefined, undefined, undefined, fnMergePatch1)
			.catch(function (oError) {
				// PATCHes are merged and thus rejected with the same error
				assert.strictEqual(oError, oError0);
			}));

		aPromises.push(oRequestor.request("GET", "ok", this.createGroupLock())
			.catch(function (oResultError) {
				assert.ok(oResultError instanceof Error);
				assert.strictEqual(oResultError.message,
					"HTTP request was not processed because the previous request failed");
				assert.strictEqual(oResultError.$reported, true);
				assert.strictEqual(oResultError.cause, oCause);
			}));

		this.mock(oRequestor).expects("mergeGetRequests").withExactArgs(sinon.match.array)
			.callsFake(function (aRequests0) {
				aRequests = aRequests0;
				return aRequests;
			});
		this.mock(oRequestor).expects("batchRequestSent")
			.withExactArgs("groupId", sinon.match(function (aRequests0) {
				return aRequests0 === aRequests;
			}), true);
		this.mock(oRequestor).expects("sendBatch").resolves(aBatchResult); // arguments don't matter
		this.mock(_Helper).expects("createError")
			.withExactArgs(aBatchResult[0], "Communication error", undefined, undefined)
			.returns(oCause);
		this.mock(_Helper).expects("decomposeError")
			.withExactArgs(sinon.match.same(oCause), sinon.match(function (aChangeSetRequests) {
					return aChangeSetRequests === aRequests[0];
				}), oRequestor.sServiceUrl)
			.returns([oError0, oError1]);
		this.mock(oRequestor).expects("batchResponseReceived")
			.withExactArgs("groupId", sinon.match(function (aRequests0) {
				return aRequests0 === aRequests;
			}), true);

		// code under test
		aPromises.push(oRequestor.processBatch("groupId").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		}));

		sinon.assert.calledOnceWithExactly(fnMergePatch0, "~oOldData~");
		sinon.assert.calledOnceWithExactly(fnMergePatch1);

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
[true, false].forEach(function (bSubmitModeIsAuto) {
	[null, "[{code : 42}]"].forEach(function (sMessage) {
		[false, true].forEach(function (bHasChanges) {
	const sTitle = "sendBatch(...), message=" + sMessage + ", bHasChanges=" + bHasChanges;
	QUnit.test(sTitle, function (assert) {
		var oBatchRequest = {
				body : "~body~",
				headers : {
					"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
					"MIME-Version" : "1.0"
				}
			},
			aBatchRequests = [{}],
			sEpilogue = bSubmitModeIsAuto ? "Group ID: groupId" : "Group ID (API): groupId",
			mExpectedBatchHeaders = {
				"Content-Type" : oBatchRequest.headers["Content-Type"],
				"MIME-Version" : oBatchRequest.headers["MIME-Version"],
				Accept : "multipart/mixed"
			},
			aExpectedResponses = [],
			sGroupId = "groupId",
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined,
				{"sap-client" : "123"}),
			oResult = "abc",
			sResponseContentType = "multipart/mixed; boundary=foo";

		if (!bHasChanges) {
			mExpectedBatchHeaders["sap-cancel-on-close"] = "true";
		}

		this.mock(oRequestor).expects("getGroupSubmitMode")
			.withExactArgs(sGroupId)
			.returns(bSubmitModeIsAuto ? "Auto" : "API");
		this.mock(oModelInterface).expects("isIgnoreETag").withExactArgs()
			.returns("~bIgnoreETag~");
		this.mock(_Batch).expects("serializeBatchRequest")
			.withExactArgs(sinon.match.same(aBatchRequests), sEpilogue, "~bIgnoreETag~")
			.returns(oBatchRequest);

		this.mock(oRequestor).expects("processOptimisticBatch")
			.withExactArgs(sinon.match.same(aBatchRequests), sGroupId);
		this.mock(oRequestor).expects("sendRequest")
			.withExactArgs("POST", "$batch?sap-client=123", mExpectedBatchHeaders, "~body~")
			.resolves({contentType : sResponseContentType, body : oResult,
				messages : sMessage});

		this.mock(_Batch).expects("deserializeBatchResponse").exactly(sMessage === null ? 1 : 0)
			.withExactArgs(sResponseContentType, oResult)
			.returns(aExpectedResponses);

		return oRequestor.sendBatch(aBatchRequests, sGroupId, bHasChanges)
			.then(function (oPayload) {
				assert.ok(sMessage === null, "unexpected success");
				assert.strictEqual(oPayload, aExpectedResponses);
			}, function (oError) {
				assert.ok(sMessage !== null, "unexpected error");
				assert.ok(oError instanceof Error);
				assert.strictEqual(oError.message,
					"Unexpected 'sap-messages' response header for batch request");
			});
	});
		});
	});
});

	//*****************************************************************************************
	QUnit.test("sendBatch(...), consume optimisticBatch result", function (assert) {
		var aBatchRequests = [],
			sGroupId = "foo",
			oOptimisticBatchResult = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		this.mock(oRequestor).expects("getGroupSubmitMode")
			.withExactArgs(sGroupId)
			.returns("Auto");
		this.mock(oModelInterface).expects("isIgnoreETag").withExactArgs().returns(false);
		this.mock(_Batch).expects("serializeBatchRequest")
			.withExactArgs(sinon.match.same(aBatchRequests), "Group ID: foo", false)
			.returns("~oBatchRequest~");

		this.mock(oRequestor).expects("processOptimisticBatch")
			.withExactArgs(sinon.match.same(aBatchRequests), sGroupId)
			.resolves(oOptimisticBatchResult);
		this.mock(oRequestor).expects("sendRequest").never();
		this.mock(_Batch).expects("deserializeBatchResponse").never();

		return oRequestor.sendBatch(aBatchRequests, sGroupId).then(function (oPayload) {
			assert.strictEqual(oPayload, oOptimisticBatchResult);
		});
	});

	//*****************************************************************************************
	QUnit.test("hasPendingChanges, cancelChanges, waitForRunningChangeRequests", function (assert) {
		var oBatchMock = this.mock(_Batch),
			oBatchRequest1,
			oBatchRequest2,
			oBatchRequest3,
			oJQueryMock = this.mock(jQuery),
			aPromises = [],
			sServiceUrl = "/Service/",
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			bWaitingIsOver;

		// expects a jQuery.ajax for a batch request and returns a mock for it to be resolved later
		function expectBatch() {
			var jqXHR = new jQuery.Deferred();

			oJQueryMock.expects("ajax")
				.withArgs(sServiceUrl + "$batch")
				.returns(jqXHR);
			return jqXHR;
		}

		// resolves the mock for the jQuery.ajax for the batch
		function resolveBatch(jqXHR) {
			Promise.resolve().then(function () {
				oBatchMock.expects("deserializeBatchResponse")
					.withExactArgs(null, "body")
					.returns([createResponse()]);

				jqXHR.resolve("body", "OK", { // mock jqXHR for success handler
					getResponseHeader : function (sHeader) {
						if (sHeader === "OData-Version") {
							return "4.0";
						}
						return null;
					}
				});
			});
		}

		// code under test
		assert.notOk(oRequestor.hasPendingChanges());
		assert.notOk(oRequestor.hasPendingChanges("groupId"));
		assert.notOk(oRequestor.hasPendingChanges("anotherGroupId"));
		oRequestor.checkForOpenRequests();

		// add a GET request and submit the queue
		oRequestor.request("GET", "Products", this.createGroupLock());
		oBatchRequest1 = expectBatch();
		aPromises.push(oRequestor.processBatch("groupId"));

		// code under test
		assert.notOk(oRequestor.hasPendingChanges(), "running GET request is not a pending change");
		oRequestor.checkForOpenRequests();

		// add a PATCH request and submit the queue
		oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
				{"If-Match" : {/* product 0 */}}, {Name : "foo"})
			.then(function () {
				assert.notOk(bWaitingIsOver);
			});
		oBatchRequest2 = expectBatch();
		aPromises.push(oRequestor.processBatch("groupId"));

		// code under test
		assert.ok(oRequestor.hasPendingChanges());
		assert.ok(oRequestor.hasPendingChanges("groupId"), "one for groupId");
		assert.notOk(oRequestor.hasPendingChanges("anotherGroupId"), "nothing in anotherGroupId");
		assert.throws(function () {
			// code under test
			oRequestor.checkForOpenRequests();
		}, new Error("Unexpected open requests"));

		assert.throws(function () {
			// code under test
			oRequestor.cancelChanges("groupId");
		}, new Error("Cannot cancel the changes for group 'groupId', "
			+ "the batch request is running"));

		this.mock(oRequestor).expects("cancelGroupLocks").withExactArgs("anotherGroupId");

		// code under test - the other groups are not affected
		oRequestor.cancelChanges("anotherGroupId");

		// while the batch with the first PATCH is still running, add another PATCH and submit
		oRequestor.request("PATCH", "Products('1')", this.createGroupLock(),
				{"If-Match" : {/* product 0 */}}, {Name : "bar"})
			.then(function () {
				assert.notOk(bWaitingIsOver);
			});
		oBatchRequest3 = expectBatch();
		aPromises.push(oRequestor.processBatch("groupId"));

		// code under test
		aPromises.push(oRequestor.waitForRunningChangeRequests("groupId").then(function () {
			bWaitingIsOver = true;

			// code under test
			assert.notOk(oRequestor.hasPendingChanges());
			assert.notOk(oRequestor.hasPendingChanges("groupId"));
			oRequestor.checkForOpenRequests();
		}));

		resolveBatch(oBatchRequest1);
		resolveBatch(oBatchRequest2);
		resolveBatch(oBatchRequest3);
		return Promise.all(aPromises);
	});

	//*****************************************************************************************
	QUnit.test("batchRequestSent/-ResponseReceived, waitFor... #1", function (assert) {
		//********** Part 1: no running change requests
		var oRequestor = _Requestor.create("/Service/");

		assert.deepEqual(oRequestor.mRunningChangeRequests, {});

		// code under test
		oRequestor.batchRequestSent("group", [], false);

		assert.deepEqual(oRequestor.mRunningChangeRequests, {});

		// code under test
		oRequestor.batchResponseReceived("group", [], false);

		assert.deepEqual(oRequestor.mRunningChangeRequests, {});

		// code under test
		assert.strictEqual(oRequestor.waitForRunningChangeRequests("group"), SyncPromise.resolve());
	});

	//*****************************************************************************************
	QUnit.test("batchRequestSent/-ResponseReceived, waitFor... #2", function (assert) {
		//********** Part 2: one running change request
		var oRequestor = _Requestor.create("/Service/"),
			aRequests = [],
			oSyncPromise,
			bWaitingIsOver;

		// code under test
		oRequestor.batchRequestSent("group", aRequests, true);

		assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
		assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 1);
		oSyncPromise = oRequestor.mRunningChangeRequests["group"][0];
		assert.strictEqual(oSyncPromise.isPending(), true);
		oSyncPromise.then(function () {
			bWaitingIsOver = true;
		});

		// code under test
		assert.strictEqual(oRequestor.waitForRunningChangeRequests("group"), oSyncPromise);

		// code under test
		oRequestor.batchResponseReceived("group", aRequests, true);

		assert.deepEqual(oRequestor.mRunningChangeRequests, {});
		assert.strictEqual(oSyncPromise.isPending(), false);
		assert.strictEqual(oSyncPromise.getResult(), undefined);
		assert.notOk(bWaitingIsOver, "no handler can run synchronously");
	});

	//*****************************************************************************************
	QUnit.test("batchRequestSent/-ResponseReceived, waitFor... #3", function (assert) {
		//********** Part 3: two running change requests for the same group
		var oFinalPromise,
			oRequestor = _Requestor.create("/Service/"),
			aRequests0 = [],
			aRequests1 = [],
			oSyncPromise0,
			oSyncPromise1,
			bWaitingIsOver;

		// code under test
		oRequestor.batchRequestSent("group", aRequests0, true);

		assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
		assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 1);
		oSyncPromise0 = oRequestor.mRunningChangeRequests["group"][0];
		assert.strictEqual(oSyncPromise0.isPending(), true);
		oSyncPromise0.then(function () {
			assert.notOk(bWaitingIsOver);
		});

		// code under test
		assert.strictEqual(oRequestor.waitForRunningChangeRequests("group"), oSyncPromise0);

		// code under test
		oRequestor.batchRequestSent("group", aRequests1, true);

		assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
		assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 2);
		assert.strictEqual(oRequestor.mRunningChangeRequests["group"][0], oSyncPromise0);
		oSyncPromise1 = oRequestor.mRunningChangeRequests["group"][1];
		assert.strictEqual(oSyncPromise1.isPending(), true);
		oSyncPromise1.then(function () {
			assert.notOk(bWaitingIsOver);
		});

		// code under test
		oFinalPromise = oRequestor.waitForRunningChangeRequests("group").then(function () {
			bWaitingIsOver = true;
		});

		// code under test
		oRequestor.batchResponseReceived("group", aRequests0, true);

		assert.deepEqual(Object.keys(oRequestor.mRunningChangeRequests), ["group"]);
		assert.strictEqual(oRequestor.mRunningChangeRequests["group"].length, 1);
		assert.strictEqual(oRequestor.mRunningChangeRequests["group"][0], oSyncPromise1);
		assert.strictEqual(oSyncPromise0.isPending(), false);
		assert.strictEqual(oSyncPromise0.getResult(), undefined);
		assert.strictEqual(oSyncPromise1.isPending(), true);

		// code under test
		oRequestor.batchResponseReceived("group", aRequests1, true);

		assert.deepEqual(oRequestor.mRunningChangeRequests, {});
		assert.strictEqual(oSyncPromise1.isPending(), false);
		assert.strictEqual(oSyncPromise1.getResult(), undefined);

		return oFinalPromise;
	});
	//TODO ? //********** Part 4: two running change requests for different groups

	//*****************************************************************************************
[
	{bLocked : false, sGroupId : "simpleRead", bModifying : false, bPendingChanges : false},
	{bLocked : false, sGroupId : "modifyingUnlocked", bModifying : true, bPendingChanges : false},
	{bLocked : true, sGroupId : "lockedRead", bModifying : false, bPendingChanges : false},
	{bLocked : true, sGroupId : "modifyingLocked", bModifying : true, bPendingChanges : true},
	{bLocked : true, sGroupId : "$inactive.$auto", bModifying : true, bPendingChanges : false}
].forEach(function (oFixture, i) {
	QUnit.test("hasPendingChanges: locked modifying group:" + oFixture.sGroupId, function (assert) {
		var j,
			oGroupLockForFixture = {
				getGroupId : function () {},
				isLocked : function () {},
				isModifying : function () {}
			},
			oRequestor = _Requestor.create("/Service/"),
			that = this;

		// Adds a group lock with corresponding mocks to oRequestor.aLockedGroupLocks. With these
		// group locks it is checked that the position of the modifying locked group lock is not
		// relevant and that the group ID is only checked if it has been passed to
		// hasPendingChanges, and that isModifying is checked before isLocked.
		// @param {boolean} bIsModifying - Whether the group lock is modifying
		function addDummyGroupLock(bIsModifying) {
			var oGroupLock = {
					getGroupId : function () {},
					isLocked : function () {},
					isModifying : function () {}
				};

			that.mock(oGroupLock).expects("getGroupId").withExactArgs()
				.thrice() // once for oFixture.sGroupId and once for "otherGroup"
				.returns("foo");
			that.mock(oGroupLock).expects("isModifying").withExactArgs() // without group ID
				.returns(bIsModifying);
			that.mock(oGroupLock).expects("isLocked").withExactArgs()
				.exactly(bIsModifying ? 1 : 0) // without group ID and modifying
				.returns(false);

			oRequestor.aLockedGroupLocks.push(oGroupLock);
		}

		oRequestor.aLockedGroupLocks = [];
		for (j = 0; j < i + 2; j += 1) {
			addDummyGroupLock(j % 2 === 0); // some are modifying but all are unlocked
		}
		this.mock(oGroupLockForFixture).expects("getGroupId").withExactArgs()
			.thrice() // once for oFixture.sGroupId and once for "otherGroup"
			.returns(oFixture.sGroupId);
		this.mock(oGroupLockForFixture).expects("isModifying").withExactArgs()
			.twice() // once without group ID and once for oFixture.sGroupId
			.returns(oFixture.bModifying);
		this.mock(oGroupLockForFixture).expects("isLocked").withExactArgs()
			// if bModifying then once without group ID and once for oFixture.sGroupId
			.exactly(oFixture.bModifying ? 2 : 0)
			.returns(oFixture.bLocked);
		oRequestor.aLockedGroupLocks.push(oGroupLockForFixture);

		// code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), oFixture.bPendingChanges);
		assert.strictEqual(oRequestor.hasPendingChanges(oFixture.sGroupId),
			oFixture.bPendingChanges);
		assert.strictEqual(oRequestor.hasPendingChanges("otherGroup"), false);
	});
});

	//*****************************************************************************************
	QUnit.test("cancelChanges: various requests", function (assert) {
		var fnCancel1 = this.spy(),
			fnCancel2 = this.spy(),
			fnCancel3 = this.spy(),
			fnCancelPost1 = this.stub().returns(false),
			fnCancelPost2 = this.stub().returns(true),
			iCount = 1,
			aExpectedRequests = [
				sinon.match({
					method : "POST",
					url : "ActionImport('42')"
				}),
				sinon.match({
					method : "POST",
					url : "Employees"
				}),
				sinon.match({
					method : "GET",
					url : "Employees"
				})
			],
			oPostData = {},
			oProduct0 = {},
			oPromise,
			bResetInactive = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined,
				{"sap-client" : "123"}),
			oRequestorMock = this.mock(oRequestor);

		function unexpected() {
			assert.ok(false);
		}

		function rejected(iOrder, oError) {
			assert.strictEqual(oError.canceled, true);
			assert.strictEqual(iCount, iOrder);
			iCount += 1;
		}

		assert.strictEqual(oRequestor.hasPendingChanges(), false);

		oPromise = Promise.all([
			oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
					{"If-Match" : oProduct0}, {Name : "foo"}, undefined, fnCancel1)
				.then(unexpected, rejected.bind(null, 3)),
			oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
					{"If-Match" : oProduct0}, {Name : "bar"}, undefined, fnCancel2)
				.then(unexpected, rejected.bind(null, 2)),
			oRequestor.request("GET", "Employees", this.createGroupLock()),
			oRequestor.request("POST", "ActionImport('42')", this.createGroupLock(), undefined,
					{foo : "bar"}),
			oRequestor.addChangeSet("groupId"),
			oRequestor.request("POST", "LeaveRequests('42')/name.space.Submit",
					this.createGroupLock(), {"If-Match" : {/* leave requests 42 */}}, oPostData,
					undefined, fnCancelPost1)
				.then(unexpected, function (oError) {
					assert.strictEqual(oError.canceled, true);
					assert.strictEqual(oError.message, "Request canceled: "
						+ "POST LeaveRequests('42')/name.space.Submit; group: groupId");
				}),
			oRequestor.request("PATCH", "Products('1')", this.createGroupLock(),
					{"If-Match" : {/* product 0 */}}, {Name : "baz"}, undefined, fnCancel3)
				.then(unexpected, rejected.bind(null, 1))
		]);

		// code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), true);

		oRequestorMock.expects("cancelChangesByFilter")
			.withExactArgs(sinon.match.func, "groupId", sinon.match.same(bResetInactive))
			.callThrough();

		// code under test
		oRequestor.cancelChanges("groupId", bResetInactive);

		sinon.assert.calledOnceWithExactly(fnCancel1, sinon.match.same(bResetInactive));
		sinon.assert.calledOnceWithExactly(fnCancel2, {});
		sinon.assert.calledOnceWithExactly(fnCancel3, {});
		sinon.assert.calledOnceWithExactly(fnCancelPost1, {});

		// code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), false);

		oRequestor.request("POST", "Employees",
			this.createGroupLock(), {"If-Match" : {/* leave requests 42 */}}, oPostData,
			undefined, fnCancelPost2).then(function () {
				assert.ok(true);
		});

		assert.strictEqual(oRequestor.mBatchQueue.groupId.length, 3);

		oRequestorMock.expects("cancelChangesByFilter")
			.withExactArgs(sinon.match.func, "groupId", sinon.match.same(bResetInactive))
			.callThrough();

		// code under test
		oRequestor.cancelChanges("groupId", bResetInactive);

		assert.strictEqual(oRequestor.mBatchQueue.groupId.length, 3);
		sinon.assert.calledOnceWithExactly(fnCancelPost2, sinon.match.same(bResetInactive));

		aExpectedRequests.iChangeSet = 1;
		this.mock(oRequestor).expects("sendBatch")
			.withExactArgs(aExpectedRequests, "groupId", true)
			.resolves([createResponse(), createResponse(), createResponse()]);

		oRequestor.processBatch("groupId");

		return oPromise;
	});

	//*****************************************************************************************
	QUnit.test("cancelChanges: only PATCH", function (assert) {
		var fnCancel = function () {},
			oProduct0 = {},
			oPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined,
				{"sap-client" : "123"});

		function unexpected() {
			assert.ok(false);
		}

		function rejected(oError) {
			assert.strictEqual(oError.canceled, true);
		}

		oPromise = Promise.all([
			oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
					{"If-Match" : oProduct0}, {Name : "foo"}, undefined, fnCancel)
				.then(unexpected, rejected),
			oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
					{"If-Match" : oProduct0}, {Name : "bar"}, undefined, fnCancel)
				.then(unexpected, rejected),
			oRequestor.request("PATCH", "Products('1')", this.createGroupLock(),
					{"If-Match" : {/* product 1*/}}, {Name : "baz"}, undefined, fnCancel)
				.then(unexpected, rejected)
		]);

		this.mock(oRequestor).expects("request").never();

		// code under test
		oRequestor.cancelChanges("groupId");
		oRequestor.processBatch("groupId");

		return oPromise;
	});

	//*****************************************************************************************
	QUnit.test("cancelChanges: unused group", function () {
		_Requestor.create("/Service/", oModelInterface).cancelChanges("unusedGroupId");
	});

	//*****************************************************************************************
	QUnit.test("cancelGroupLocks", function () {
		var oRequestor = _Requestor.create("/Service/", oModelInterface),
			oGroupLock0 = oRequestor.lockGroup("group0", {/*oOwner*/}, true), // not modifying
			oGroupLock1 = oRequestor.lockGroup("group1", {/*oOwner*/}, true, true),
			oGroupLock2 = oRequestor.lockGroup("group2", {/*oOwner*/}, true, true);

		oGroupLock2.unlock(); // oGroupLock2 is unlocked but in our locked group locks list

		this.mock(oGroupLock0).expects("cancel").never();
		this.mock(oGroupLock1).expects("cancel").withExactArgs();
		this.mock(oGroupLock2).expects("cancel").never();

		// code under test
		oRequestor.cancelGroupLocks();
	});

	//*****************************************************************************************
	QUnit.test("cancelGroupLocks with group ID", function () {
		var oRequestor = _Requestor.create("/Service/", oModelInterface),
			oGroupLock0 = oRequestor.lockGroup("group0", {/*oOwner*/}, true, true),
			oGroupLock1 = oRequestor.lockGroup("group1", {/*oOwner*/}, true, true),
			oGroupLock2 = oRequestor.lockGroup("group1", {/*oOwner*/}, true), // not modifying
			oGroupLock3 = oRequestor.lockGroup("group1", {/*oOwner*/}, true, true);

		oGroupLock3.unlock(); // oGroupLock3 is unlocked but in our locked group locks list
		this.mock(oGroupLock0).expects("cancel").never();
		this.mock(oGroupLock1).expects("cancel").withExactArgs();
		this.mock(oGroupLock2).expects("cancel").never();
		this.mock(oGroupLock3).expects("cancel").never();

		// code under test
		oRequestor.cancelGroupLocks("group1");
	});

	//*****************************************************************************************
	QUnit.test("hasChanges: correct for multiple change sets in one group", function (assert) {
		var oEntity = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : {}}, {Name : "foo"});
		oRequestor.addChangeSet("groupId");
		oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : oEntity}, {Name : "bar"});

		//code under test
		assert.strictEqual(oRequestor.hasChanges("groupId", oEntity), true);
	});

	//*****************************************************************************************
	QUnit.test("hasChanges: correct for multiple change sets in one group w/o a match",
			function (assert) {
		var oEntity = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : {}}, {Name : "foo"});
		oRequestor.addChangeSet("groupId");
		oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : {}}, {Name : "bar"});
		oRequestor.request("GET", "Employees", this.createGroupLock());

		//code under test
		assert.strictEqual(oRequestor.hasChanges("groupId", oEntity), false);
	});

	//*****************************************************************************************
	QUnit.test("hasPendingChanges: '$inactive.*' groups are no pending changes", function (assert) {
		var fnCancel = function () { throw new Error(); },
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		// must not count as pending change
		oRequestor.request("POST", "ActionImport('42')", this.createGroupLock("$inactive.foo"),
			undefined, {}, undefined, fnCancel);

		// code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), false);
		// we don't care about #hasPendingChanges("$inactive.*") because it cannot be used that way
	});

	//*****************************************************************************************
	QUnit.test("hasPendingChanges: correct for multiple change sets in one group",
			function (assert) {
		var fnCancel = function () { throw new Error(); },
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oRequestor.request("DELETE", "Products('42')", this.createGroupLock());
		oRequestor.addChangeSet("groupId");
		oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : {}}, {Name : "foo"}, undefined, fnCancel);
		oRequestor.addChangeSet("groupId");
		oRequestor.request("DELETE", "Products('4711')", this.createGroupLock());

		//code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), true);
	});

	//*****************************************************************************************
	QUnit.test("removeChangeRequest", function (assert) {
		var fnCancel = this.spy(),
			oPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oTestPromise;

		oPromise = oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : {/* product 0 */}}, {Name : "foo"}, undefined, fnCancel);
		oTestPromise = oPromise.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.canceled, true);
			});

		// code under test
		oRequestor.removeChangeRequest(oPromise);

		sinon.assert.calledOnceWithExactly(fnCancel, undefined);
		this.mock(oRequestor).expects("request").never();
		oRequestor.processBatch("groupId");
		return oTestPromise;
	});

	//*****************************************************************************************
	QUnit.test("removeChangeRequest: various requests", function (assert) {
		var fnCancel = this.spy(),
			aExpectedRequests = [
				sinon.match({
					method : "PATCH",
					url : "Products('0')",
					body : {Name : "bar"}
				}),
				sinon.match({
					method : "GET",
					url : "Employees"
				})
			],
			oProduct0 = {},
			oPromise,
			aPromises,
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		function unexpected() {
			assert.ok(false);
		}

		function rejected(oError) {
			assert.strictEqual(oError.canceled, true);
			assert.strictEqual(oError.message,
				"Request canceled: PATCH Products('0'); group: groupId");
		}

		oPromise = oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : oProduct0}, {Name : "foo"}, undefined, fnCancel);

		aPromises = [
			oPromise.then(unexpected, rejected),
			oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
				{"If-Match" : oProduct0}, {Name : "bar"}),
			oRequestor.request("GET", "Employees", this.createGroupLock())
		];

		aExpectedRequests.iChangeSet = 0;
		this.mock(oRequestor).expects("sendBatch")
			.withExactArgs(aExpectedRequests, "groupId", true)
			.resolves([createResponse({}), createResponse({})]);

		// code under test
		oRequestor.removeChangeRequest(oPromise);
		oRequestor.processBatch("groupId");

		sinon.assert.calledOnceWithExactly(fnCancel, undefined);

		return Promise.all(aPromises);
	});

	//*****************************************************************************************
	QUnit.test("removeChangeRequest after processBatch", function (assert) {
		var oPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oPromise = oRequestor.request("PATCH", "Products('0')", this.createGroupLock(),
			{"If-Match" : {/* oEntity */}}, {Name : "bar"});

		this.mock(oRequestor).expects("sendBatch") // arguments don't matter
			.resolves([createResponse({})]);

		oRequestor.processBatch("groupId");

		// code under test
		assert.throws(function () {
			oRequestor.removeChangeRequest(oPromise);
		}, new Error("Cannot reset the changes, the batch request is running"));
	});

	//*****************************************************************************************
	QUnit.test("removePost", function (assert) {
		var oBody = {},
			fnCancel1 = this.spy(),
			fnCancel2 = this.spy(),
			oEntity = {},
			aExpectedRequests = [
				sinon.match({
					method : "POST",
					url : "Products",
					body : {Name : "bar"}
				})
			],
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oTestPromise;

		this.spy(oRequestor, "cancelChangesByFilter");
		oTestPromise = Promise.all([
			oRequestor.request("POST", "Products", this.createGroupLock(), {}, oBody, undefined,
					fnCancel1)
				.then(function () {
					assert.ok(false);
				}, function (oError) {
					assert.strictEqual(oError.canceled, true);
				}),
			oRequestor.request("POST", "Products", this.createGroupLock(), {}, {Name : "bar"},
					undefined, fnCancel2)
		]);
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntity), "postBody")
			.returns(oBody);

		// code under test
		oRequestor.removePost("groupId", oEntity);

		assert.ok(oRequestor.cancelChangesByFilter.calledWithExactly(sinon.match.func, "groupId"));

		aExpectedRequests.iChangeSet = 0;
		this.mock(oRequestor).expects("sendBatch")
			.withExactArgs(aExpectedRequests, "groupId", true).resolves([createResponse()]);

		// code under test
		oRequestor.processBatch("groupId");

		sinon.assert.calledOnceWithExactly(fnCancel1, undefined);
		assert.notOk(fnCancel2.called);
		return oTestPromise;
	});

	//*****************************************************************************************
	QUnit.test("removePost with only one POST", function (assert) {
		var oBody = {},
			fnCancel = this.spy(),
			oEntity = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oTestPromise;

		oTestPromise = oRequestor.request("POST", "Products", this.createGroupLock(), {}, oBody,
				undefined, fnCancel)
			.then(function () {
					assert.ok(false);
				}, function (oError) {
					assert.strictEqual(oError.canceled, true);
				}
		);
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntity), "postBody")
			.returns(oBody);

		// code under test
		oRequestor.removePost("groupId", oEntity);
		sinon.assert.calledOnceWithExactly(fnCancel, undefined);

		this.mock(oRequestor).expects("request").never();
		oRequestor.processBatch("groupId");
		return oTestPromise;
	});

	//*****************************************************************************************
	QUnit.test("removePost after processBatch", function (assert) {
		var oPayload = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oRequestor.request("POST", "Products", this.createGroupLock(), {}, oPayload);

		this.mock(oRequestor).expects("sendBatch") // arguments don't matter
			.resolves([createResponse({})]);

		oRequestor.processBatch("groupId");

		// code under test
		assert.throws(function () {
			oRequestor.removePost("groupId", oPayload);
		}, new Error("Cannot reset the changes, the batch request is running"));
	});

	//*****************************************************************************************
	QUnit.test("isChangeSetOptional", function (assert) {
		var oRequestor = _Requestor.create("/");

		assert.strictEqual(oRequestor.isChangeSetOptional(), true);
	});

	//*****************************************************************************************
	QUnit.test("processBatch: unwrap single change", function () {
		var aExpectedRequests = [
				sinon.match({
					method : "POST",
					url : "Products",
					body : {Name : "bar"}
				})
			],
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oRequestor.request("POST", "Products", this.createGroupLock(), {}, {Name : "bar"});
		this.mock(oRequestor).expects("isChangeSetOptional").withExactArgs().returns(true);
		aExpectedRequests.iChangeSet = 0;
		this.mock(oRequestor).expects("sendBatch")
			.withExactArgs(aExpectedRequests, "groupId", true).resolves([createResponse()]);

		// code under test
		return oRequestor.processBatch("groupId");
	});

	//*****************************************************************************************
	QUnit.test("relocate", function (assert) {
		var oBody1 = {},
			oBody2 = {},
			mHeaders = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestorMock = this.mock(oRequestor);

		oRequestor.request("POST", "Employees", this.createGroupLock("$parked.$auto"),
			mHeaders, oBody1);
		oRequestor.request("POST", "Employees", this.createGroupLock("$parked.$auto"),
			mHeaders, oBody2);

		assert.throws(function () {
			// code under test
			oRequestor.relocate("$foo", oBody1, "$auto");
		}, new Error("Request not found in group '$foo'"));

		assert.throws(function () {
			// code under test
			oRequestor.relocate("$parked.$auto", {foo : "bar"}, "$auto");
		}, new Error("Request not found in group '$parked.$auto'"));

		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "POST",
				url : "Employees",
				body : sinon.match.same(oBody2)
			}), "$auto");

		// code under test
		oRequestor.relocate("$parked.$auto", oBody2, "$auto");

		assert.strictEqual(oRequestor.mBatchQueue["$parked.$auto"][0].length, 1, "one left");
		assert.strictEqual(oRequestor.mBatchQueue["$parked.$auto"][0][0].body, oBody1);

		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "POST",
				url : "Employees",
				body : sinon.match.same(oBody1)
			}), "$auto");

		// code under test
		oRequestor.relocate("$parked.$auto", oBody1, "$auto");

		assert.deepEqual(oRequestor.mBatchQueue["$parked.$auto"], [[]]);
	});

	//*****************************************************************************************
	QUnit.test("relocateAll: with entity", function (assert) {
		var oBody1 = {key : "value 1"},
			oBody2 = {key : "value 2"},
			oEntity = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			oYetAnotherEntity = {};

		oRequestor.request("PATCH", "Employees('1')",
			this.createGroupLock("$parked.$auto"), {"If-Match" : oEntity}, oBody1);
		oRequestor.request("DELETE", "Employees('2')",
			this.createGroupLock("$parked.$auto"), {"If-Match" : oYetAnotherEntity});
		oRequestor.request("PATCH", "Employees('1')",
			this.createGroupLock("$parked.$auto"), {"If-Match" : oEntity}, oBody2);

		oRequestorMock.expects("addChangeToGroup").never();

		// code under test
		oRequestor.relocateAll("$parked.unused", "$auto", oEntity);

		// code under test
		oRequestor.relocateAll("$parked.$auto", "unexpected", {/* some other entity */});

		// code under test
		assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oEntity), true);

		// code under test
		assert.strictEqual(oRequestor.hasChanges("$parked.unused", oEntity), false);

		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "PATCH",
				url : "Employees('1')",
				body : sinon.match.same(oBody1)
			}), "$auto");
		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "PATCH",
				url : "Employees('1')",
				body : sinon.match.same(oBody2)
			}), "$auto");

		// code under test
		oRequestor.relocateAll("$parked.$auto", "$auto", oEntity);

		// code under test
		assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oEntity), false);

		// code under test: must not unpark anything again
		oRequestor.relocateAll("$parked.$auto", "unexpected", oEntity);

		// code under test
		assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oYetAnotherEntity), true);

		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "DELETE",
				url : "Employees('2')"
			}), "$auto");

		// code under test
		oRequestor.relocateAll("$parked.$auto", "$auto", oYetAnotherEntity);

		// code under test
		assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oYetAnotherEntity), false);
	});

	//*****************************************************************************************
	QUnit.test("relocateAll: without entity", function (assert) {
		var oBody1 = {key : "value 1"},
			oBody2 = {key : "value 2"},
			oEntity = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			oYetAnotherEntity = {};

		oRequestor.request("PATCH", "Employees('1')",
			this.createGroupLock("$parked.$auto"), {"If-Match" : oEntity}, oBody1);
		oRequestor.request("DELETE", "Employees('2')",
			this.createGroupLock("$parked.$auto"), {"If-Match" : oYetAnotherEntity});
		oRequestor.request("PATCH", "Employees('1')",
			this.createGroupLock("$parked.$auto"), {"If-Match" : oEntity}, oBody2);

		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "PATCH",
				url : "Employees('1')",
				body : sinon.match.same(oBody1)
			}), "$auto");
		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "PATCH",
				url : "Employees('1')",
				body : sinon.match.same(oBody2)
			}), "$auto");
		oRequestorMock.expects("addChangeToGroup")
			.withExactArgs(sinon.match({
				method : "DELETE",
				url : "Employees('2')"
			}), "$auto");

		// code under test
		oRequestor.relocateAll("$parked.$auto", "$auto");

		assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oEntity), false);
		assert.strictEqual(oRequestor.hasChanges("$parked.$auto", oYetAnotherEntity), false);
	});

	//*********************************************************************************************
	QUnit.test("request: $cached as groupId fails synchronously", function (assert) {
		var oGroupLock = {getGroupId : function () {}},
			oRequestor = _Requestor.create("/");

		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("$cached");
		assert.throws(function () {
			//code under test
			oRequestor.request("GET", "/FOO", oGroupLock);
		}, function (oError) {
			assert.strictEqual(oError.message, "Unexpected request: GET /FOO");
			assert.strictEqual(oError.$cached, true);
			return oError instanceof Error;
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasCancelFunction) {
	QUnit.test("request: GroupLock is canceled, " + bHasCancelFunction, function (assert) {
		var fnCancel = sinon.spy(),
			oGroupLock = {
				getGroupId : function () {},
				isCanceled : function () {}
			},
			oRequestor = _Requestor.create("/");

		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("$auto");
		this.mock(oGroupLock).expects("isCanceled").withExactArgs().returns(true);

		//code under test
		return oRequestor.request("GET", "/FOO", oGroupLock, undefined, undefined, undefined,
			bHasCancelFunction ? fnCancel : undefined
		).then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(fnCancel.callCount, bHasCancelFunction ? 1 : 0);
			assert.strictEqual(oError.message, "Request already canceled");
			assert.strictEqual(oError.canceled, true);
			assert.ok(oError instanceof Error);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("doConvertResponse (V4)", function (assert) {
		var oPayload = {},
			oRequestor = _Requestor.create("/");

		// code under test
		assert.strictEqual(oRequestor.doConvertResponse(oPayload), oPayload);
	});

	//*********************************************************************************************
	QUnit.test("convertResourcePath (V4)", function (assert) {
		var sResourcePath = {},
			oRequestor = _Requestor.create("/");

		// code under test
		assert.strictEqual(oRequestor.convertResourcePath(sResourcePath), sResourcePath);
	});

	//*********************************************************************************************
	QUnit.test("convertQueryOptions", function (assert) {
		var oExpand = {},
			oRequestor = _Requestor.create("/");

		this.mock(oRequestor).expects("convertExpand")
			.withExactArgs(sinon.match.same(oExpand), undefined).returns("expand");

		assert.deepEqual(oRequestor.convertQueryOptions("/Foo", {
			foo : "bar",
			$apply : "filter(Price gt 100)",
			$count : "true",
			$expand : oExpand,
			$filter : "SO_2_BP/CompanyName eq 'SAP'",
			$foo : "bar", // to show that any system query option is accepted
			$levels : "5",
			$orderby : "GrossAmount asc",
			$search : "EUR",
			$select : ["select1", "select2"]
		}), {
			foo : "bar",
			$apply : "filter(Price gt 100)",
			$count : "true",
			$expand : "expand",
			$filter : "SO_2_BP/CompanyName eq 'SAP'",
			$foo : "bar",
			$levels : "5",
			$orderby : "GrossAmount asc",
			$search : "EUR",
			$select : "select1,select2"
		});

		assert.deepEqual(oRequestor.convertQueryOptions("/Foo", {
			foo : "bar",
			"sap-client" : "111",
			$apply : "filter(Price gt 100)",
			$count : true,
			$expand : oExpand,
			$filter : "SO_2_BP/CompanyName eq 'SAP'",
			$orderby : "GrossAmount asc",
			$search : "EUR",
			$select : ["select1", "select2"]
		}, /*bDropSystemQueryOptions*/true), {
			foo : "bar",
			"sap-client" : "111"
		});

		assert.deepEqual(oRequestor.convertQueryOptions("/Foo", {
			$select : "singleSelect"
		}), {
			$select : "singleSelect"
		});

		assert.strictEqual(oRequestor.convertQueryOptions("/Foo", undefined), undefined);

		assert.deepEqual(
			oRequestor.convertQueryOptions("/Foo", {$expand : "~"}),
			{$expand : "~"});
	});

	//*********************************************************************************************
	QUnit.test("convertExpandOptions", function (assert) {
		var oExpand = {},
			oRequestor = _Requestor.create("/~/");

		this.mock(oRequestor).expects("convertExpand")
			.withExactArgs(sinon.match.same(oExpand), undefined).returns("expand");

		assert.strictEqual(oRequestor.convertExpandOptions("foo", {
			$expand : oExpand,
			$select : ["select1", "select2"]
		}), "foo($expand=expand;$select=select1,select2)");

		assert.strictEqual(oRequestor.convertExpandOptions("foo", {}), "foo");
	});

	//*********************************************************************************************
	QUnit.test("convertExpand", function (assert) {
		var oOptions = {},
			oRequestor = _Requestor.create("/~/");

		["Address", null].forEach(function (vValue) {
			assert.throws(function () {
				oRequestor.convertExpand(vValue);
			}, new Error("$expand must be a valid object"));
		});

		this.mock(oRequestor).expects("convertExpandOptions")
			.withExactArgs("baz", sinon.match.same(oOptions), false).returns("baz(options)");

		assert.strictEqual(oRequestor.convertExpand({
			foo : true,
			bar : null,
			baz : oOptions
		}, false), "foo,bar,baz(options)");
	});

	//*********************************************************************************************
	[true, false].forEach(function (bSortExpandSelect, i) {
		QUnit.test("buildQueryString, " + i, function (assert) {
			var oConvertedQueryParams = {},
				sMetaPath = "/Foo",
				oQueryParams = {},
				oRequestor = _Requestor.create("/~/"),
				oRequestorMock = this.mock(oRequestor);

			oRequestorMock.expects("convertQueryOptions")
				.withExactArgs(sMetaPath, undefined, undefined, undefined).returns(undefined);

			// code under test
			assert.strictEqual(oRequestor.buildQueryString(sMetaPath), "");

			oRequestorMock.expects("convertQueryOptions")
				.withExactArgs(sMetaPath, sinon.match.same(oQueryParams), true, bSortExpandSelect)
				.returns(oConvertedQueryParams);
			this.mock(_Helper).expects("buildQuery")
				.withExactArgs(sinon.match.same(oConvertedQueryParams)).returns("?query");

			// code under test
			assert.strictEqual(
				oRequestor.buildQueryString(sMetaPath, oQueryParams, true, bSortExpandSelect),
				"?query");
		});
	});

	//*********************************************************************************************
	QUnit.test("buildQueryString examples", function (assert) {
		[{
			o : {foo : ["bar", "€"], $select : "IDÖ"},
			s : "foo=bar&foo=%E2%82%AC&$select=ID%C3%96"
		}, {
			o : {$select : ["ID"]},
			s : "$select=ID"
		}, {
			o : {$select : ["Name", "ID"]},
			s : "$select=ID,Name"
		}, {
			o : {$expand : {SO_2_SOITEM : true, SO_2_BP : true}},
			s : "$expand=SO_2_BP,SO_2_SOITEM"
		}, {
			o : {$expand : {SO_2_BP : true, SO_2_SOITEM : {$select : "CurrencyCode"}}},
			s : "$expand=SO_2_BP,SO_2_SOITEM($select=CurrencyCode)"
		}, {
			o : {
				$expand : {
					SO_2_BP : true,
					SO_2_SOITEM : {
						$select : ["Note", "ItemPosition"]
					}
				}
			},
			s : "$expand=SO_2_BP,SO_2_SOITEM($select=ItemPosition,Note)"
		}, {
			o : {
				$expand : {
					SO_2_SOITEM : {
						$expand : {
							SOITEM_2_SO : true,
							SOITEM_2_PRODUCT : {
								$expand : {
									PRODUCT_2_BP : true
								},
								$filter : "CurrencyCode eq 'EUR'",
								$select : "CurrencyCode"
							}
						}
					},
					SO_2_BP : true
				},
				"sap-client" : "003"
			},
			s : "$expand=SO_2_BP,SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;"
			+ "$filter=CurrencyCode%20eq%20'EUR';$select=CurrencyCode),SOITEM_2_SO)"
			+ "&sap-client=003"
		}].forEach(function (oFixture) {
			var sJSON = JSON.stringify(oFixture.o),
				oRequestor = _Requestor.create("/~/");

			assert.strictEqual(
				oRequestor.buildQueryString("/Foo", oFixture.o, undefined, true), "?" + oFixture.s,
				oFixture.s);
			assert.strictEqual(JSON.stringify(oFixture.o), sJSON, "unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("formatPropertyAsLiteral", function (assert) {
		var sKeyPredicate = "(~)",
			oProperty = {
				$Type : "Edm.Foo"
			},
			oRequestor = _Requestor.create("/"),
			sResult,
			vValue = {};

		this.mock(_Helper).expects("formatLiteral")
			.withExactArgs(sinon.match.same(vValue), oProperty.$Type)
			.returns(sKeyPredicate);

		// code under test
		sResult = oRequestor.formatPropertyAsLiteral(vValue, oProperty);

		assert.strictEqual(sResult, sKeyPredicate);
	});

	//*********************************************************************************************
	QUnit.test("ready()", function (assert) {
		var oRequestor = _Requestor.create("/");

		assert.strictEqual(oRequestor.ready().getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchType", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			mTypeForMetaPath = {},
			oType = {};

		oRequestorMock.expects("fetchTypeForPath")
			.withExactArgs("/TEAMS").returns(SyncPromise.resolve(Promise.resolve(oType)));
		this.mock(oRequestor.getModelInterface()).expects("fetchMetadata")
			.withExactArgs("/TEAMS/@com.sap.vocabularies.Common.v1.Messages")
			.returns(SyncPromise.resolve(undefined));

		// code under test
		return oRequestor.fetchType(mTypeForMetaPath, "/TEAMS").then(function (oResult) {
			assert.strictEqual(oResult, oType);
			assert.strictEqual(mTypeForMetaPath["/TEAMS"], oType);

			// code under test (already there)
			assert.strictEqual(oRequestor.fetchType(mTypeForMetaPath, "/TEAMS").getResult(), oType);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchType: no type", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface),
			mTypeForMetaPath = {};

		this.mock(oRequestor).expects("fetchTypeForPath")
			.withExactArgs("/TEAMS/Unknown").returns(SyncPromise.resolve(undefined));
		this.mock(oRequestor.getModelInterface()).expects("fetchMetadata").never();

		// code under test
		return oRequestor.fetchType(mTypeForMetaPath, "/TEAMS/Unknown").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.notOk("/TEAMS/Unknown" in mTypeForMetaPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchType: message annotation", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface),
			oMessageAnnotation = {},
			mTypeForMetaPath = {},
			oType = {};

		this.mock(oRequestor).expects("fetchTypeForPath")
			.withExactArgs("/TEAMS").returns(SyncPromise.resolve(Promise.resolve(oType)));
		this.mock(oRequestor.getModelInterface()).expects("fetchMetadata")
			.withExactArgs("/TEAMS/@com.sap.vocabularies.Common.v1.Messages")
			.returns(SyncPromise.resolve(oMessageAnnotation));

		// code under test
		return oRequestor.fetchType(mTypeForMetaPath, "/TEAMS").then(function (oResult) {
			assert.strictEqual(mTypeForMetaPath["/TEAMS"], oResult);
			assert.ok(oType.isPrototypeOf(oResult));
			assert.strictEqual(oResult["@com.sap.vocabularies.Common.v1.Messages"],
				oMessageAnnotation);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchType: complex key", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			bKey1Done = false,
			bKey2Done = false,
			mTypeForMetaPath = {},
			oType = {$Key : [{key1 : "a/b/id"}, "key2", {key3 : "c/id"}]},
			oTypeKey1Promise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bKey1Done = true;
					resolve({});
				});
			}),
			oTypeKey2Promise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bKey2Done = true;
					resolve({});
				});
			});

		oRequestorMock.expects("fetchType")
			.withExactArgs(sinon.match.same(mTypeForMetaPath), "/TEAMS")
			.callThrough(); // start the recursion
		oRequestorMock.expects("fetchTypeForPath")
			.withExactArgs("/TEAMS").returns(SyncPromise.resolve(Promise.resolve(oType)));
		this.mock(oRequestor.getModelInterface()).expects("fetchMetadata")
			.withExactArgs("/TEAMS/@com.sap.vocabularies.Common.v1.Messages")
			.returns(SyncPromise.resolve(undefined));
		oRequestorMock.expects("fetchType")
			.withExactArgs(sinon.match.same(mTypeForMetaPath), "/TEAMS/a/b")
			.returns(oTypeKey1Promise);
		oRequestorMock.expects("fetchType")
			.withExactArgs(sinon.match.same(mTypeForMetaPath), "/TEAMS/c")
			.returns(oTypeKey2Promise);

		// code under test
		return oRequestor.fetchType(mTypeForMetaPath, "/TEAMS").then(function (oResult) {
			assert.strictEqual(oResult, oType);
			assert.strictEqual(mTypeForMetaPath["/TEAMS"], oType);
			assert.ok(bKey1Done);
			assert.ok(bKey2Done);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchTypeForPath", function (assert) {
		var oPromise = {},
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oRequestor.oModelInterface).expects("fetchMetadata")
			.withExactArgs("/EMPLOYEES/EMPLOYEE_2_TEAM/").returns(oPromise);

		// code under test
		assert.strictEqual(oRequestor.fetchTypeForPath("/EMPLOYEES/EMPLOYEE_2_TEAM"), oPromise);
	});

	//*********************************************************************************************
	[{
		iCallCount : 1,
		mHeaders : {"OData-Version" : "4.0"}
	}, {
		iCallCount : 2,
		mHeaders : {}
	}].forEach(function (oFixture, i) {
		QUnit.test("doCheckVersionHeader, success cases - " + i, function (assert) {
			var oRequestor = _Requestor.create("/"),
				fnGetHeader = this.spy(function (sHeaderKey) {
					return oFixture.mHeaders[sHeaderKey];
				});

			// code under test
			oRequestor.doCheckVersionHeader(fnGetHeader, "Foo('42')/Bar", true);

			assert.strictEqual(fnGetHeader.calledWithExactly("OData-Version"), true);
			if (oFixture.iCallCount === 2) {
				assert.strictEqual(fnGetHeader.calledWithExactly("DataServiceVersion"), true);
			}
			assert.strictEqual(fnGetHeader.callCount, oFixture.iCallCount);
		});
	});

	//*********************************************************************************************
	[{
		iCallCount : 1,
		sError : "value 'foo' in response for /Foo('42')/Bar",
		mHeaders : {"OData-Version" : "foo"}
	}, {
		iCallCount : 2,
		sError : "value 'undefined' in response for /Foo('42')/Bar",
		mHeaders : {}
	}, {
		iCallCount : 2,
		sError : "'DataServiceVersion' header with value 'baz' in response for /Foo('42')/Bar",
		mHeaders : {DataServiceVersion : "baz"}
	}].forEach(function (oFixture, i) {
		QUnit.test("doCheckVersionHeader, error cases - " + i, function (assert) {
			var oRequestor = _Requestor.create("/"),
				fnGetHeader = this.spy(function (sHeaderKey) {
					return oFixture.mHeaders[sHeaderKey];
				});

			assert.throws(function () {
				// code under test
				oRequestor.doCheckVersionHeader(fnGetHeader, "Foo('42')/Bar");
			}, new Error("Expected 'OData-Version' header with value '4.0' but received "
				+ oFixture.sError));

			assert.strictEqual(fnGetHeader.calledWithExactly("OData-Version"), true);
			if (oFixture.iCallCount === 2) {
				assert.strictEqual(fnGetHeader.calledWithExactly("DataServiceVersion"), true);
			}
			assert.strictEqual(fnGetHeader.callCount, oFixture.iCallCount);
		});
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: Action", function (assert) {
		var oOperationMetadata = {
				$kind : "Action",
				$Parameter : [{
					$Name : "Foo"
				}, {
					$Name : "ID"
				}]
			},
			mParameters = {ID : "1", Foo : 42, "n/a" : NaN},
			oRequestor = _Requestor.create("/");

		// code under test
		assert.strictEqual(
			oRequestor.getPathAndAddQueryOptions("/OperationImport(...)", oOperationMetadata,
				mParameters),
			"OperationImport");

		assert.deepEqual(mParameters, {ID : "1", Foo : 42}, "n/a is removed");

		// code under test
		assert.strictEqual(
			oRequestor.getPathAndAddQueryOptions("/Entity('0815')/bound.Operation(...)",
				{$kind : "Action"}, mParameters),
			"Entity('0815')/bound.Operation");

		assert.deepEqual(mParameters, {}, "no parameters accepted");
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: Function", function (assert) {
		var oOperationMetadata = {
				$kind : "Function",
				$Parameter : [{
					$Name : "føø",
					$Type : "Edm.String"
				}, {
					$Name : "p2",
					$Type : "Edm.Int16"
				}, { // unused collection parameter must not lead to an error
					$Name : "p3",
					//$Nullable : true,
					$isCollection : true
				}]
			},
			oRequestor = _Requestor.create("/"),
			oRequestorMock = this.mock(oRequestor);

		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs("bãr'1", oOperationMetadata.$Parameter[0]).returns("'bãr''1'");
		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs(42, oOperationMetadata.$Parameter[1]).returns("42");

		assert.strictEqual(
			// code under test
			oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata,
				{føø : "bãr'1", p2 : 42, "n/a" : NaN}),
			"some.Function(f%C3%B8%C3%B8='b%C3%A3r''1',p2=42)");
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: Function w/o parameters", function (assert) {
		var oOperationMetadata = {$kind : "Function"},
			oRequestor = _Requestor.create("/");

		this.mock(oRequestor).expects("formatPropertyAsLiteral").never();

		assert.strictEqual(
			// code under test
			oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata, {}),
			"some.Function()");
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: Function w/ collection parameter", function (assert) {
		var oOperationMetadata = {
				$kind : "Function",
				$Parameter : [{$Name : "foo", $isCollection : true}]
			},
			oRequestor = _Requestor.create("/");

		this.mock(oRequestor).expects("formatPropertyAsLiteral").never();

		assert.throws(function () {
			// code under test
			oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata,
				{foo : [42]});
		}, new Error("Unsupported collection-valued parameter: foo"));
	});
	//TODO what about actions & collections?

	//*****************************************************************************************
	QUnit.test("isActionBodyOptional", function (assert) {
		var oRequestor = _Requestor.create("/");

		assert.strictEqual(oRequestor.isActionBodyOptional(), false);
	});

	//*****************************************************************************************
	QUnit.test("reportHeaderMessages", function () {
		var aMessages = [{code : "42", message : "Test"}, {code : "43", type : "Warning"}],
			sMessages = JSON.stringify(aMessages),
			oRequestor = _Requestor.create("/", oModelInterface),
			sResourcePath = "Product(42)/to_bar";

		this.mock(oModelInterface).expects("reportTransitionMessages")
			.withExactArgs([{
					code : "42",
					message : "Test"
				}, {
					code : "43",
					type : "Warning"
				}], sResourcePath);

		// code under test
		oRequestor.reportHeaderMessages(sResourcePath, sMessages);
	});

	//*****************************************************************************************
	QUnit.test("reportHeaderMessages without messages", function () {
		var oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oModelInterface).expects("reportTransitionMessages").never();

		// code under test
		oRequestor.reportHeaderMessages("foo(42)/to_bar");
	});

	//*****************************************************************************************
	QUnit.test("getModelInterface", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		// code under test
		assert.strictEqual(oRequestor.getModelInterface(), oModelInterface);
	});

	//*****************************************************************************************
	QUnit.test("getOrCreateBatchQueue", function (assert) {
		var aBatchQueue,
			oRequestor = _Requestor.create("/", oModelInterface);

		function checkBatchQueue(oBatchQueue0, sGroupId) {
			assert.strictEqual(oRequestor.mBatchQueue[sGroupId], oBatchQueue0);
			assert.strictEqual(oBatchQueue0.length, 1);
			assert.strictEqual(oBatchQueue0.iChangeSet, 0);
			assert.strictEqual(oBatchQueue0[0].length, 0);
			assert.strictEqual(oBatchQueue0[0].iSerialNumber, 0);
		}

		const oModelInterfaceMock = this.mock(oModelInterface);
		oModelInterfaceMock.expects("onCreateGroup").withExactArgs("group");

		// code under test
		aBatchQueue = oRequestor.getOrCreateBatchQueue("group");

		checkBatchQueue(aBatchQueue, "group");

		// code under test
		assert.strictEqual(oRequestor.getOrCreateBatchQueue("group"), aBatchQueue);

		oModelInterfaceMock.expects("onCreateGroup").withExactArgs("group2");

		// code under test
		checkBatchQueue(oRequestor.getOrCreateBatchQueue("group2"), "group2");

		oModelInterfaceMock.expects("onCreateGroup").withExactArgs("group3").never();

		// code under test: create queue without informing the model
		checkBatchQueue(oRequestor.getOrCreateBatchQueue("group3", true), "group3");
	});

	//*****************************************************************************************
	QUnit.test("getSerialNumber", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		// code under test
		assert.strictEqual(oRequestor.getSerialNumber(), 1);
		assert.strictEqual(oRequestor.getSerialNumber(), 2);
	});

	//*****************************************************************************************
	QUnit.test("addChangeSet", function (assert) {
		var aChangeSet0 = [],
			oGetRequest = {},
			oRequestor = _Requestor.create("/", oModelInterface),
			aRequests = [aChangeSet0, oGetRequest];

		aRequests.iChangeSet = 0;
		this.mock(oRequestor).expects("getOrCreateBatchQueue").withExactArgs("group", true)
			.returns(aRequests);
		this.mock(oRequestor).expects("getSerialNumber").withExactArgs().returns(42);

		// code under test
		oRequestor.addChangeSet("group");

		assert.strictEqual(aRequests.length, 3);
		assert.strictEqual(aRequests.iChangeSet, 1);
		assert.strictEqual(aRequests[1].length, 0);
		assert.strictEqual(aRequests[0], aChangeSet0);
		assert.strictEqual(aRequests[0].iSerialNumber, undefined);
		assert.strictEqual(aRequests[1].iSerialNumber, 42);
		assert.strictEqual(aRequests[2], oGetRequest);
	});

	//*****************************************************************************************
	[{
		changes : false,
		requests : [],
		result : [],
		title : "no requests"
	}, {
		changes : false,
		requests : [[], {method : "GET", url : "Products"}],
		result : [{method : "GET", url : "Products"}],
		title : "delete empty change set"
	}, {
		changes : true,
		requests : [[{method : "PATCH", url : "Products('0')", body : {Name : "p1"}}]],
		result : [{method : "PATCH", url : "Products('0')", body : {Name : "p1"}}],
		title : "unwrap change set"
	}, {
		changes : true,
		requests : [[
			{method : "PATCH", url : "Products('0')", body : {Name : null},
				headers : {"If-Match" : "ETag0"}, $promise : {}},
			{method : "PATCH", url : "Products('0')", body : {Name : "bar"},
				headers : {"If-Match" : "ETag0"}, $resolve : function () {}, _mergeInto : 0},
			{method : "PATCH", url : "Products('0')", body : {Note : "hello, world"},
				headers : {"If-Match" : "ETag0"}, $resolve : function () {}, _mergeInto : 0},
			{method : "PATCH", url : "Products('1')", body : {Name : "p1"},
				headers : {"If-Match" : "ETag1"}, $promise : {}},
			{method : "PATCH", url : "Products('0')", body : {Name : "bar2"},
				headers : {"If-Match" : "ETag0"}, $resolve : function () {}, _mergeInto : 0},
			{method : "PATCH", url : "Products('0')", body : {Name : "no merge!"},
				headers : {"If-Match" : "ETag2"}},
			{method : "POST", url : "Products", body : {Name : "baz"}},
			{method : "POST", url : "Products('0')/GetCurrentStock", body : {Name : "baz"},
				headers : {"If-Match" : "ETag0"}},
			{method : "PATCH", url : "BusinessPartners('42')",
				body : {Address : null}, headers : {"If-Match" : "ETag3"}, $promise : {}},
			{method : "PATCH", url : "BusinessPartners('42')",
				body : {Address : {City : "Walldorf"}}, headers : {"If-Match" : "ETag3"},
				$resolve : function () {}, _mergeInto : 8},
			{method : "PATCH", url : "BusinessPartners('42')",
				body : {Address : {PostalCode : "69190"}}, headers : {"If-Match" : "ETag3"},
				$resolve : function () {}, _mergeInto : 8}
		], {
			method : "GET", url : "Products"
		}],
		result : [[
			{method : "PATCH", url : "Products('0')", body : {Name : "bar2", Note : "hello, world"},
				headers : {"If-Match" : "ETag0"}},
			{method : "PATCH", url : "Products('1')", body : {Name : "p1"},
				headers : {"If-Match" : "ETag1"}},
			{method : "PATCH", url : "Products('0')", body : {Name : "no merge!"},
				headers : {"If-Match" : "ETag2"}},
			{method : "POST", url : "Products", body : {Name : "baz"}},
			{method : "POST", url : "Products('0')/GetCurrentStock", body : {Name : "baz"},
				headers : {"If-Match" : "ETag0"}},
			{method : "PATCH", url : "BusinessPartners('42')",
				body : {Address : {City : "Walldorf", PostalCode : "69190"}},
				headers : {"If-Match" : "ETag3"}}
		], {
			method : "GET", url : "Products"
		}],
		title : "merge PATCHes"
	}, {
		changes : true,
		requests : [
			[],
			[{method : "PATCH", url : "Products('0')", body : {Name : "p1"}}],
			[
				{method : "PATCH", url : "Products('0')", body : {Name : null},
					headers : {"If-Match" : "ETag0"}, $promise : {}},
				{method : "PATCH", url : "Products('0')", body : {Name : "bar"},
					headers : {"If-Match" : "ETag0"}, $resolve : function () {}, _mergeInto : 0}
			],
			[
				{method : "POST", url : "Products('0')/GetCurrentStock", body : {Name : "baz"},
					headers : {"If-Match" : "ETag0"}},
				{method : "PATCH", url : "BusinessPartners('42')",
					body : {Address : {City : "Walldorf"}}, headers : {"If-Match" : "ETag3"}}
			],
			[],
			{method : "GET", url : "Products"}
		],
		result : [
			{method : "PATCH", url : "Products('0')", body : {Name : "p1"}},
			{method : "PATCH", url : "Products('0')", body : {Name : "bar"},
				headers : {"If-Match" : "ETag0"}},
			[
				{method : "POST", url : "Products('0')/GetCurrentStock", body : {Name : "baz"},
					headers : {"If-Match" : "ETag0"}},
				{method : "PATCH", url : "BusinessPartners('42')",
					body : {Address : {City : "Walldorf"}},
					headers : {"If-Match" : "ETag3"}}
			],
			{method : "GET", url : "Products"}
		],
		title : "multiple change sets"
	}].forEach(function (oFixture) {
		QUnit.test("cleanUpChangeSets, " + oFixture.title, function (assert) {
			var oRequestor = _Requestor.create("/", oModelInterface),
				that = this;

			function checkRequests(aActualRequests, aExpectedRequests) {
				assert.strictEqual(aActualRequests.length, aExpectedRequests.length);
				aActualRequests.forEach(function (vActualRequest, i) {
					if (Array.isArray(vActualRequest)) { // change set
						checkRequests(vActualRequest, aExpectedRequests[i]);
						return;
					}
					assert.strictEqual(vActualRequest.method, aExpectedRequests[i].method);
					assert.deepEqual(vActualRequest.body, aExpectedRequests[i].body);
					assert.deepEqual(vActualRequest.headers, aExpectedRequests[i].headers);
				});
			}

			oFixture.requests.forEach(function (vActualRequest, i) {
				if (Array.isArray(vActualRequest)) { // change set
					oFixture.requests.iChangeSet = i;
					vActualRequest.forEach(function (oRequest) {
						if (oRequest.method === "PATCH") {
							oRequest.$mergeRequests = function () {};
						}
						if (oRequest.$resolve) {
							that.mock(oRequest).expects("$resolve")
								.withExactArgs(vActualRequest[oRequest._mergeInto].$promise);
						}
					});
				}
			});

			// code under test
			assert.strictEqual(oRequestor.cleanUpChangeSets(oFixture.requests), oFixture.changes);

			checkRequests(oFixture.requests, oFixture.result);
		});
	});

	//*****************************************************************************************
	QUnit.test("cleanUpChangeSets: DELETE", function (assert) {
		var oEntity1 = {"@odata.etag" : "etag1"},
			oEntity2 = {},
			oEntity3 = {"@odata.etag" : "etag3"},
			oRequestor = _Requestor.create("/", oModelInterface),
			aRequests = [[
					{method : "PATCH", url : "Products('1')", body : {Name : "p1"},
						headers : {"If-Match" : oEntity1}},
					{method : "DELETE", url : "Products('1')", headers : {"If-Match" : oEntity1}},
					{method : "DELETE", url : "Products('2')", headers : {"If-Match" : oEntity2}},
					{method : "DELETE", url : "Products('3')", headers : {"If-Match" : oEntity3}}
				]];

		aRequests.iChangeSet = 0;

		// code under test
		assert.strictEqual(oRequestor.cleanUpChangeSets(aRequests), true);

		assert.deepEqual(aRequests, [[
			{method : "PATCH", url : "Products('1')", body : {Name : "p1"},
				headers : {"If-Match" : oEntity1}},
			{method : "DELETE", url : "Products('1')",
				headers : {"If-Match" : {"@odata.etag" : "*"}}},
			{method : "DELETE", url : "Products('2')", headers : {"If-Match" : oEntity2}},
			{method : "DELETE", url : "Products('3')", headers : {"If-Match" : oEntity3}}
		]]);
		assert.deepEqual(oEntity1, {"@odata.etag" : "etag1"});
	});

	//*****************************************************************************************
[false, true].forEach(function (bTimeout) {
	QUnit.test("clearSessionContext: bTimeout=" + bTimeout, function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			iSessionTimer = {/*a number*/};

		oRequestor.mHeaders["SAP-ContextId"] = "context";
		oRequestor.iSessionTimer = iSessionTimer;
		this.mock(window).expects("clearInterval").withExactArgs(sinon.match.same(iSessionTimer));
		this.mock(oRequestor.oModelInterface).expects("fireSessionTimeout")
			.exactly(bTimeout ? 1 : 0).withExactArgs();

		// code under test
		oRequestor.clearSessionContext(bTimeout);

		assert.strictEqual(oRequestor.iSessionTimer, 0);
		assert.notOk("SAP-ContextId" in oRequestor.mHeaders);

		// code under test
		oRequestor.clearSessionContext();
	});
});

	//*****************************************************************************************
	QUnit.test("setSessionContext: SAP-Http-Session-Timeout=null", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(oRequestor).expects("clearSessionContext").withExactArgs();

		// code under test
		oRequestor.setSessionContext("context", null);

		assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "context");
		assert.strictEqual(oRequestor.iSessionTimer, 0);
	});

	//*****************************************************************************************
	QUnit.test("setSessionContext: SAP-Http-Session-Timeout=60", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			iSessionTimer = {};

		this.mock(oRequestor).expects("clearSessionContext").withExactArgs();
		this.mock(window).expects("setInterval")
			.withExactArgs(sinon.match.func, 55000)
			.returns(iSessionTimer);

		// code under test
		oRequestor.setSessionContext("context", "60");

		assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "context");
		assert.strictEqual(oRequestor.iSessionTimer, iSessionTimer);
	});

	//*****************************************************************************************
	["59", "0", "-100", "", "FooBar42", "60.0", " "].forEach(function (sTimeout) {
		QUnit.test("setSessionContext: unsupported header: " + sTimeout, function (assert) {
			var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

			this.mock(oRequestor).expects("clearSessionContext").withExactArgs();
			this.oLogMock.expects("warning")
				.withExactArgs("Unsupported SAP-Http-Session-Timeout header",
					sTimeout, sClassName);

			// code under test
			oRequestor.setSessionContext("context", sTimeout);

			assert.strictEqual(oRequestor.mHeaders["SAP-ContextId"], "context");
			assert.strictEqual(oRequestor.iSessionTimer, 0);
		});
	});

	//*****************************************************************************************
	QUnit.test("setSessionContext: no SAP-ContextId", function () {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(window).expects("setInterval").never();
		this.mock(oRequestor).expects("clearSessionContext").withExactArgs();

		// code under test
		oRequestor.setSessionContext(null, "120");
	});

	//*****************************************************************************************
[false, true].forEach(function (bWithCredentials) {
	const sTitle = "setSessionContext: successful ping, bWithCredentials: " + bWithCredentials;
	QUnit.test(sTitle, function (assert) {
		var oAjaxSettings = {
				headers : {
					"SAP-ContextId" : "context"
				},
				method : "HEAD"
			},
			oExpectation,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface, {}, {"sap-client" : "120"},
				/*sODataVersion*/undefined, bWithCredentials);

		if (bWithCredentials) {
			oAjaxSettings.xhrFields = {withCredentials : true};
		}
		oExpectation = this.mock(window).expects("setInterval")
			.withExactArgs(sinon.match.func, 115000);

		oRequestor.setSessionContext("context", "120");

		this.mock(jQuery).expects("ajax")
			.withExactArgs(sServiceUrl + "?sap-client=120", oAjaxSettings)
			.returns(createMock(assert, undefined, "OK", {}));

		// code under test - call setInterval function
		oExpectation.callArg(0);
	});
});

	//*****************************************************************************************
	[false, true].forEach(function (bErrorId) {
		QUnit.test("setSessionContext: error in ping, " + bErrorId, function (assert) {
			var that = this;

			return new Promise(function (resolve) {
				var oExpectation,
					oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

				oExpectation = that.mock(window).expects("setInterval")
					.withExactArgs(sinon.match.func, 115000);

				oRequestor.setSessionContext("context", "120");

				that.mock(jQuery).expects("ajax").withExactArgs(sServiceUrl, {
						headers : sinon.match({
							"SAP-ContextId" : "context"
						}),
						method : "HEAD"
					})
					.callsFake(function () {
						var jqXHR = new jQuery.Deferred();

						setTimeout(function () {
							jqXHR.reject({
								getResponseHeader : function (sName) {
									assert.strictEqual(sName, "SAP-Err-Id");
									return bErrorId ? "ICMENOSESSION" : null;
								},
								status : 500
							});
							resolve();
						}, 0);
						return jqXHR;
					});
				that.oLogMock.expects("error").exactly(bErrorId ? 1 : 0)
					.withExactArgs("Session not found on server", undefined, sClassName);
				that.mock(oRequestor).expects("clearSessionContext").exactly(bErrorId ? 1 : 0)
					.withExactArgs(true);

				// code under test - call setInterval function
				oExpectation.callArg(0);
			});
		});
	});

	//*****************************************************************************************
	// Tests the case that the setInterval timer is active for more than 30 minutes without having
	// been restarted by an application-invoked request. During this time the setInterval function
	// may have been called several times sending pings. Here we test the first call after the 30
	// minutes which is expected to terminate the session.
	QUnit.test("setSessionContext: session termination", function () {
		var oClock,
			oExpectation,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		oClock = sinon.useFakeTimers();
		try {
			oExpectation = this.mock(window).expects("setInterval")
				.withExactArgs(sinon.match.func, 115000);

			oRequestor.setSessionContext("context", "120");

			// Tick the clock ahead 30 min; does not call the timer because setInterval is mocked.
			oClock.tick(30 * 60 * 1000);

			this.mock(jQuery).expects("ajax").never();
			this.mock(oRequestor).expects("clearSessionContext").withExactArgs(true);

			// code under test - call setInterval function
			oExpectation.callArg(0);
		} finally {
			oClock.restore();
		}
	});

	//*****************************************************************************************
	QUnit.test("keep the session alive", function (assert) {
		var oClock,
			oJQueryMock = this.mock(jQuery),
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			sResourcePath = "Employees('1')/namespace.Prepare";

		oClock = sinon.useFakeTimers();
		return new Promise(function (resolve) {
			oJQueryMock.expects("ajax")
				.withExactArgs(sServiceUrl + sResourcePath, {
					contentType : undefined,
					data : undefined,
					headers : sinon.match.object,
					method : "POST"
				})
				.returns(createMock(assert, {}, "OK", {
					"OData-Version" : "4.0",
					"SAP-ContextId" : "context",
					"SAP-Http-Session-Timeout" : "960"
				}));

			// send a request that starts a session with timeout=960 (16 min)
			oRequestor.sendRequest("POST", sResourcePath).then(function () {
				oJQueryMock.expects("ajax").withExactArgs(sServiceUrl, {
						headers : sinon.match({
							"SAP-ContextId" : "context"
						}),
						method : "HEAD"
					})
					.returns(createMock(assert, undefined, "OK", {}));

				// expect a "ping" request after 15 min 55 sec
				oClock.tick(955000);

				// expect no "ping" request, but a terminated session after another 15 min 55 sec
				// (more than 30 min have passed since the latest request)
				oClock.tick(955000);

				assert.notOk("SAP-ContextId" in oRequestor.mHeaders);
				resolve();
			});
		}).finally(function () {
			oRequestor.destroy();
			oClock.restore();
		});
	});

	//*****************************************************************************************
	QUnit.test("waitForBatchResponseReceived", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			oSyncPromise;

		oRequestor.mBatchQueue = {
			myGroup : [[{$promise : Promise.resolve("~result~")}]]
		};

		// code under test
		oSyncPromise = oRequestor.waitForBatchResponseReceived("myGroup");

		assert.ok(oSyncPromise.isPending());

		return oSyncPromise.then(function (vResult) {
			assert.strictEqual(vResult, "~result~");
		});
	});

	//*****************************************************************************************
	QUnit.test("waitForRunningChangeRequests", function (assert) {
		var oPromise,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			aRequests = [];

		assert.strictEqual(oRequestor.waitForRunningChangeRequests("groupId"),
			SyncPromise.resolve());

		oRequestor.batchRequestSent("groupId", aRequests, /*bHasChanges*/true);

		oPromise = oRequestor.waitForRunningChangeRequests("groupId");

		assert.strictEqual(oPromise.isPending(), true);

		oRequestor.batchResponseReceived("groupId", aRequests, /*bHasChanges*/true);

		assert.strictEqual(oPromise.isFulfilled(), true);
		assert.strictEqual(oPromise.getResult(), undefined);
	});

	//*****************************************************************************************
	QUnit.test("addChangeToGroup: $direct", function () {
		var oChange = {
				$cancel : {},
				$resolve : function () {},
				$submit : {},
				body : {},
				method : {},
				headers : {},
				url : {}
			},
			oGroupLock = {},
			oPromise = {},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(oRequestor).expects("getGroupSubmitMode")
			.withExactArgs("direct").returns("Direct");
		this.mock(oRequestor).expects("lockGroup")
			.withExactArgs("direct", sinon.match.same(oRequestor), true, true)
			.returns(oGroupLock);
		this.mock(oRequestor).expects("request")
			.withExactArgs(sinon.match.same(oChange.method), sinon.match.same(oChange.url),
				sinon.match.same(oGroupLock), sinon.match.same(oChange.headers),
				sinon.match.same(oChange.body), sinon.match.same(oChange.$submit),
				sinon.match.same(oChange.$cancel))
			.returns(oPromise);
		this.mock(oChange).expects("$resolve").withExactArgs(sinon.match.same(oPromise));

		// code under test
		oRequestor.addChangeToGroup(oChange, "direct");
	});

	//*****************************************************************************************
	QUnit.test("addChangeToGroup: $batch", function (assert) {
		var oChange = {},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			aRequests = [[], [{}]];

		aRequests.iChangeSet = 1;
		this.mock(oRequestor).expects("getGroupSubmitMode")
			.withExactArgs("group").returns("API");
		this.mock(oRequestor).expects("request").never();
		this.mock(oRequestor).expects("getOrCreateBatchQueue")
			.withExactArgs("group")
			.returns(aRequests);

		// code under test
		oRequestor.addChangeToGroup(oChange, "group");

		assert.strictEqual(aRequests.length, 2);
		assert.deepEqual(aRequests[0], []);
		assert.strictEqual(aRequests[1].length, 2);
		assert.strictEqual(aRequests[1][1], oChange);
	});

	//*********************************************************************************************
	QUnit.test("lockGroup: non-blocking", function (assert) {
		var oGroupLock,
			aLockedGroupLocks = [],
			oOwner = {},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		oRequestor.aLockedGroupLocks = aLockedGroupLocks;
		this.mock(oRequestor).expects("getSerialNumber").returns(42);

		// code under test
		oGroupLock = oRequestor.lockGroup("foo", oOwner);

		assert.ok(oGroupLock instanceof _GroupLock);
		assert.strictEqual(oGroupLock.getGroupId(), "foo");
		assert.strictEqual(oGroupLock.oOwner, oOwner);
		assert.strictEqual(oGroupLock.isLocked(), false);
		assert.strictEqual(oGroupLock.getSerialNumber(), 42);
		assert.strictEqual(oRequestor.aLockedGroupLocks, aLockedGroupLocks);
		assert.strictEqual(oRequestor.aLockedGroupLocks.length, 0);
	});

	//*********************************************************************************************
[false, true].forEach(function (bModifying) {
	QUnit.test("lockGroup: blocking, modifying: " + bModifying, function (assert) {
		var fnCancel = {},
			oGroupLock,
			aLockedGroupLocks = [{}, {}],
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			oOwner = {};

		oRequestor.aLockedGroupLocks = aLockedGroupLocks;
		this.mock(oRequestor).expects("getSerialNumber").returns(42);

		// code under test
		oGroupLock = oRequestor.lockGroup("foo", oOwner, true, bModifying, fnCancel);

		assert.ok(oGroupLock instanceof _GroupLock);
		assert.strictEqual(oGroupLock.getGroupId(), "foo");
		assert.strictEqual(oGroupLock.isCanceled(), false);
		assert.strictEqual(oGroupLock.isLocked(), true);
		assert.strictEqual(oGroupLock.oOwner, oOwner);
		assert.strictEqual(oGroupLock.fnCancel, fnCancel);
		assert.strictEqual(oGroupLock.getSerialNumber(), 42);
		assert.strictEqual(oGroupLock.isModifying(), bModifying);
		assert.strictEqual(oRequestor.aLockedGroupLocks, aLockedGroupLocks);
		assert.deepEqual(oRequestor.aLockedGroupLocks, [{}, {}, oGroupLock]);
	});
});

	//*********************************************************************************************
	QUnit.test("submitBatch: group locks", function (assert) {
		var oBarGroupLock,
			oBarPromise,
			oBazPromise,
			oFooGroupLock,
			oFooPromise,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			that = this;

		oRequestorMock.expects("processBatch").never();

		oFooGroupLock = oRequestor.lockGroup("foo", {/*owner*/}, true);
		oBarGroupLock = oRequestor.lockGroup("bar", {/*owner*/}, true);

		this.oLogMock.expects("info")
			.withExactArgs("submitBatch('foo') is waiting for locks", null, sClassName);
		this.mock(window).expects("setTimeout").never();

		// code under test
		oFooPromise = oRequestor.submitBatch("foo");

		assert.ok(oFooPromise instanceof SyncPromise);

		this.oLogMock.expects("info")
			.withExactArgs("submitBatch('bar') is waiting for locks", null, sClassName);
		oRequestorMock.expects("hasOnlyPatchesWithoutSideEffects").withExactArgs("bar")
			.returns(false);

		// code under test
		oBarPromise = oRequestor.submitBatch("bar");

		oRequestorMock.expects("hasOnlyPatchesWithoutSideEffects").withExactArgs("baz")
			.returns(false);
		oRequestorMock.expects("processBatch").withExactArgs("baz").returns(Promise.resolve());

		// code under test
		oBazPromise = oRequestor.submitBatch("baz");

		oRequestorMock.expects("hasOnlyPatchesWithoutSideEffects").withExactArgs("foo")
			.returns(false);
		this.oLogMock.expects("info")
			.withExactArgs("submitBatch('foo') continues", null, sClassName);
		oRequestorMock.expects("processBatch").withExactArgs("foo").returns(Promise.resolve());

		// code under test
		oFooGroupLock.unlock();

		return Promise.all([
			oFooPromise.then(function () {
				assert.deepEqual(oRequestor.aLockedGroupLocks, [oBarGroupLock]);

				that.oLogMock.expects("info")
					.withExactArgs("submitBatch('bar') continues", null, sClassName);
				oRequestorMock.expects("processBatch").withExactArgs("bar")
					.returns(Promise.resolve());

				// code under test
				oBarGroupLock.unlock();
			}),
			oBarPromise.then(function () {
				assert.deepEqual(oRequestor.aLockedGroupLocks, []);
			}),
			oBazPromise
		]).finally(function () {
			window.setTimeout.restore();
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch: delay $batch", function () {
		var oPromise,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			oSetTimeoutExpectation;

		oRequestorMock.expects("hasOnlyPatchesWithoutSideEffects").withExactArgs("bay")
			.returns(true);
		this.oLogMock.expects("info")
			.withExactArgs("submitBatch('bay') is waiting for potential side effect requests",
				null, sClassName);
		oSetTimeoutExpectation = this.mock(window).expects("setTimeout")
			.withExactArgs(sinon.match.func, 0);
		this.oLogMock.expects("info")
			.withExactArgs("submitBatch('bay') continues", null, sClassName);
		oRequestorMock.expects("processBatch").never();

		// code under test
		oPromise = oRequestor.submitBatch("bay");

		oSetTimeoutExpectation.args[0][0]();
		oRequestorMock.expects("processBatch").withExactArgs("bay").returns(Promise.resolve());

		return oPromise.finally(function () {
			window.setTimeout.restore();
		});
	});

	//*********************************************************************************************
	QUnit.test("checkHeaderNames", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		// code under test
		oRequestor.checkHeaderNames({allowed : "123"});
		oRequestor.checkHeaderNames({"X-Http-Method" : "123"}); // V2 specific headers are allowed

		[
			"Accept", "Accept-Charset", "Content-Encoding", "Content-ID", "Content-Language",
			"Content-Length", "Content-Transfer-Encoding", "Content-Type", "If-Match",
			"If-None-Match", "Isolation", "OData-Isolation", "OData-MaxVersion", "OData-Version",
			"Prefer", "SAP-ContextId"
		].forEach(function (sHeaderName) {
			var mHeaders = {};

			mHeaders[sHeaderName] = "123";

			assert.throws(function () {
				// code under test
				oRequestor.checkHeaderNames(mHeaders);
			}, new Error("Unsupported header: " + sHeaderName));
		});
	});

	//*********************************************************************************************
	QUnit.test("checkForOpenRequests", function (assert) {
		var sErrorMessage = "Unexpected open requests",
			oGroupLockMock0,
			oGroupLockMock1,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		oRequestor.mBatchQueue["groupId"] = []; // empty batch queue: no error

		// code under test
		oRequestor.checkForOpenRequests();

		oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
		oRequestor.mBatchQueue["groupId"] = [[]]; // cancelled change request: no error

		// code under test
		oRequestor.checkForOpenRequests();

		oRequestor.mBatchQueue["groupId"] = [[{}]]; // batch queue with non-empty change set: error

		assert.throws(function () {
			// code under test
			oRequestor.checkForOpenRequests();
		}, new Error(sErrorMessage));

		oRequestor.mBatchQueue["groupId"] = [[], {}]; // batch queue with read request: error

		assert.throws(function () {
			// code under test
			oRequestor.checkForOpenRequests();
		}, new Error(sErrorMessage));

		oRequestor = _Requestor.create(sServiceUrl, oModelInterface);
		oRequestor.aLockedGroupLocks = [{isLocked : function () {}}, {isLocked : function () {}}];

		oGroupLockMock0 = this.mock(oRequestor.aLockedGroupLocks[0]);
		oGroupLockMock0.expects("isLocked").withExactArgs().returns(false);
		oGroupLockMock1 = this.mock(oRequestor.aLockedGroupLocks[1]);
		oGroupLockMock1.expects("isLocked").withExactArgs().returns(false);

		// code under test - only unlocked group locks
		oRequestor.checkForOpenRequests();

		oGroupLockMock0.expects("isLocked").withExactArgs().returns(false);
		oGroupLockMock1.expects("isLocked").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test - at least one locked group lock
			oRequestor.checkForOpenRequests();
		}, new Error(sErrorMessage));
	});

	//*********************************************************************************************
	QUnit.test("mergeGetRequests", function (assert) {
		var oClone1 = {},
			oClone6 = {},
			oClone9 = {$expand : {np2 : null}},
			oHelperMock = this.mock(_Helper),
			aMergedRequests,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			aRequests = [[
				// change set
			], { // [1] other requests are merged into this one
				url : "EntitySet1('42')?foo=bar",
				$metaPath : "/EntitySet1",
				$promise : {},
				$queryOptions : {$select : ["p1"]}
			}, { // [2] no query options -> no merge
				url : "EntitySet1('42')?foo=bar",
				$promise : {}
			}, { // [3] merge with [1]
				url : "EntitySet1('42')?foo=bar",
				$queryOptions : {$select : ["p3"]},
				$resolve : function () {}
			}, { // [4] no query options -> no merge
				url : "EntitySet1('42')?foo=bar"
			}, { // [5] no matching URL -> no merge; no nav.prop. must be added to $select
				url : "EntitySet3('42')",
				$metaPath : "/EntitySet3",
				$queryOptions : {$select : ["p5"], $expand : {np5 : null}}
			}, { // [6] other requests are merged into this one incl. $mergeRequests
				url : "EntitySet2('42')",
				$mergeRequests : function () {},
				$metaPath : "/EntitySet2",
				$promise : {},
				$queryOptions : {$select : ["p6"]}
			}, { // [7] merge with [6] incl. $mergeRequests
				url : "EntitySet2('42')",
				$mergeRequests : function () {},
				$queryOptions : {$select : ["p7"]},
				$resolve : function () {}
			}, { // [8] different owner -> no merge
				url : "EntitySet1('42')?foo=bar",
				// $mergeRequests : {}, // do not call
				$metaPath : "/EntitySet1",
				$owner : "different",
				$queryOptions : {$select : ["p8"]}
			}, { // [9] other requests are merged into this one; nav.prop. added to $select
				url : "EntitySet1('44')?foo=bar",
				$metaPath : "/EntitySet1",
				$promise : {},
				$queryOptions : {$select : [], $expand : {np2 : null}}
			}, { // [10] merge with [9]
				url : "EntitySet1('44')?foo=bar",
				$queryOptions : {$select : [], $expand : {np1 : null}},
				$resolve : function () {}
			}],
			aRequestQueryOptions = aRequests.map(function (oRequest) {
				// Note: the original query options may well contain "live" references
				// => "copy on write" is needed!
				return oRequest.$queryOptions;
			}),
			aRequestQueryOptionsJSON = aRequestQueryOptions.map(function (mQueryOptions) {
				return JSON.stringify(mQueryOptions);
			});

		aRequests.iChangeSet = 1;
		oHelperMock.expects("clone").withExactArgs(sinon.match.same(aRequests[1].$queryOptions))
			.returns(oClone1);
		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs(sinon.match.same(oClone1), sinon.match.same(aRequests[3].$queryOptions))
			.callThrough(); // -> {$select : ["p1", "p3"]}
		this.mock(aRequests[3]).expects("$resolve")
			.withExactArgs(sinon.match.same(aRequests[1].$promise));
		oHelperMock.expects("clone").withExactArgs(sinon.match.same(aRequests[6].$queryOptions))
			.returns(oClone6);
		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs(sinon.match.same(oClone6), sinon.match.same(aRequests[7].$queryOptions))
			.callThrough(); // -> {$select : ["p6", "p7"]}
		this.mock(aRequests[7]).expects("$mergeRequests").withExactArgs().returns("~aPaths~");
		this.mock(aRequests[6]).expects("$mergeRequests").withExactArgs("~aPaths~");
		this.mock(aRequests[7]).expects("$resolve")
			.withExactArgs(sinon.match.same(aRequests[6].$promise));
		oHelperMock.expects("clone").withExactArgs(sinon.match.same(aRequests[9].$queryOptions))
			.returns(oClone9);
		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs(sinon.match.same(oClone9), sinon.match.same(aRequests[10].$queryOptions))
			.callThrough(); // -> {$select : [], $expand : {np2 : null, np1 : null}}
		this.mock(aRequests[10]).expects("$resolve")
			.withExactArgs(sinon.match.same(aRequests[9].$promise));
		oRequestorMock.expects("addQueryString")
			.withExactArgs(aRequests[1].url, aRequests[1].$metaPath, sinon.match.same(oClone1))
			.returns("EntitySet1('42')?$select=p1,p3");
		oRequestorMock.expects("addQueryString")
			.withExactArgs(aRequests[5].url, aRequests[5].$metaPath,
				sinon.match.same(aRequests[5].$queryOptions)
					.and(sinon.match({$select : ["p5"], $expand : {np5 : null}})))
			.returns("EntitySet3('42')?$select=p5&expand=np5");
		oRequestorMock.expects("addQueryString")
			.withExactArgs(aRequests[6].url, aRequests[6].$metaPath, sinon.match.same(oClone6))
			.returns("EntitySet2('42')?$select=p6,p7");
		oRequestorMock.expects("addQueryString")
			.withExactArgs(aRequests[8].url, aRequests[8].$metaPath,
				sinon.match.same(aRequests[8].$queryOptions))
			.returns("EntitySet1('42')?$select=p8");
		oRequestorMock.expects("addQueryString")
			.withExactArgs(aRequests[9].url, aRequests[9].$metaPath,
				sinon.match.same(oClone9)
					.and(sinon.match({$select : ["np1"], $expand : {np1 : null, np2 : null}})))
			.returns("EntitySet1('44')?$select=np1&$expand=np1,np2");

		// code under test
		aMergedRequests = oRequestor.mergeGetRequests(aRequests);

		assert.strictEqual(aMergedRequests.length, 8);
		assert.strictEqual(aMergedRequests.iChangeSet, aRequests.iChangeSet);
		assert.strictEqual(aMergedRequests[0], aRequests[0]);
		assert.strictEqual(aMergedRequests[1], aRequests[1]);
		assert.strictEqual(aMergedRequests[2], aRequests[2]);
		assert.strictEqual(aMergedRequests[3], aRequests[4]);
		assert.strictEqual(aMergedRequests[4], aRequests[5]);
		assert.strictEqual(aMergedRequests[5], aRequests[6]);
		assert.strictEqual(aMergedRequests[6], aRequests[8]);
		assert.strictEqual(aMergedRequests[7], aRequests[9]);
		assert.strictEqual(aMergedRequests[1].url, "EntitySet1('42')?$select=p1,p3");
		assert.strictEqual(aMergedRequests[4].url, "EntitySet3('42')?$select=p5&expand=np5");
		assert.strictEqual(aMergedRequests[5].url, "EntitySet2('42')?$select=p6,p7");
		assert.strictEqual(aMergedRequests[6].url, "EntitySet1('42')?$select=p8");
		assert.strictEqual(aMergedRequests[7].url, "EntitySet1('44')?$select=np1&$expand=np1,np2");
		aRequestQueryOptions.forEach(function (mQueryOptions, i) {
			assert.strictEqual(JSON.stringify(mQueryOptions), aRequestQueryOptionsJSON[i],
				"unchanged #" + i);
		});
	});

	//*********************************************************************************************
	QUnit.test("addQueryString", function (assert) {
		var mConvertedQueryOptions = {},
			mQueryOptions = {},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(oRequestor).expects("convertQueryOptions").twice()
			.withExactArgs("/meta/path", sinon.match.same(mQueryOptions), false, true)
			.returns(mConvertedQueryOptions);
		this.mock(_Helper).expects("buildQuery").twice()
			.withExactArgs(sinon.match.same(mConvertedQueryOptions))
			.returns("?~");

		// code under test
		assert.strictEqual(
			oRequestor.addQueryString("EntitySet", "/meta/path", mQueryOptions),
			"EntitySet?~");
		assert.strictEqual(
			oRequestor.addQueryString("EntitySet?foo=bar", "/meta/path", mQueryOptions),
			"EntitySet?foo=bar&~");
	});

	//*********************************************************************************************
	QUnit.test("addQueryString with placeholders, partial", function (assert) {
		var mConvertedQueryOptions = {$bar : "bar~c", $foo : "foo~c"},
			mQueryOptions = {$bar : "bar", $foo : "foo"},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(oRequestor).expects("convertQueryOptions")
			.withExactArgs("/meta/path", sinon.match.same(mQueryOptions), false, true)
			.returns(mConvertedQueryOptions);
		this.mock(_Helper).expects("encodePair").withExactArgs("$foo", "foo~c").returns("$foo=foo");
		this.mock(_Helper).expects("buildQuery").withExactArgs({$bar : "bar~c"})
			.returns("?$bar=bar");

		// code under test
		assert.strictEqual(
			oRequestor.addQueryString("EntitySet?$foo=~", "/meta/path", mQueryOptions),
			"EntitySet?$foo=foo&$bar=bar");
	});

	//*********************************************************************************************
	QUnit.test("addQueryString with placeholders, complete", function (assert) {
		var mConvertedQueryOptions = {$bar : "bar~c", $foo : "foo~c"},
			oHelperMock = this.mock(_Helper),
			mQueryOptions = {$bar : "bar", $foo : "foo"},
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

		this.mock(oRequestor).expects("convertQueryOptions")
			.withExactArgs("/meta/path", sinon.match.same(mQueryOptions), false, true)
			.returns(mConvertedQueryOptions);
		oHelperMock.expects("encodePair").withExactArgs("$foo", "foo~c").returns("$foo=foo");
		oHelperMock.expects("encodePair").withExactArgs("$bar", "bar~c").returns("$bar=bar");
		oHelperMock.expects("buildQuery").withExactArgs({}).returns("");

		// code under test
		assert.strictEqual(
			oRequestor.addQueryString("EntitySet?$foo=~&$bar=~", "/meta/path", mQueryOptions),
			"EntitySet?$foo=foo&$bar=bar");
	});

	//*********************************************************************************************
	QUnit.test("checkConflictingStrictRequest", function (assert) {
		var oRequestor = _Requestor.create("/~/"),
			oRequest = {
				headers : {foo : "bar"}
			},
			oStrictRequest = {
				headers : {Prefer : "handling=strict"}
			};

		function success(aRequests, iChangeSetNo) {
			aRequests.iChangeSet = aRequests.length - 1;
			aRequests.push({});
			oRequestor.checkConflictingStrictRequest(oRequest, aRequests, iChangeSetNo);
			oRequestor.checkConflictingStrictRequest(oStrictRequest, aRequests, iChangeSetNo);
		}

		function fail(aRequests, iChangeSetNo) {
			aRequests.iChangeSet = aRequests.length - 1;
			aRequests.push({});
			oRequestor.checkConflictingStrictRequest(oRequest, aRequests, iChangeSetNo);
			assert.throws(function () {
				oRequestor.checkConflictingStrictRequest(oStrictRequest, aRequests, iChangeSetNo);
			}, new Error("All requests with strict handling must belong to the same change set"));
		}

		success([[]], 0);
		success([[oRequest], [oRequest]], 1);
		success([[oRequest], [oRequest]], 0);
		success([[oStrictRequest], [oRequest]], 0);
		success([[oRequest], [oStrictRequest]], 1);
		success([[oRequest], [oRequest, oStrictRequest]], 1);
		success([[oRequest], [oRequest, oStrictRequest], [oRequest]], 1);

		fail([[oStrictRequest], [oRequest]], 1);
		fail([[oRequest], [oStrictRequest], []], 2);
		fail([[oRequest], [oRequest, oStrictRequest], []], 2);
		fail([[oRequest], [oRequest, oStrictRequest], [oRequest]], 2);
		fail([[oRequest], [], [oStrictRequest]], 1);
	});

	//*****************************************************************************************
	QUnit.test("request: checkConflictingStrictRequests", function (assert) {
		var oConflictError = {},
			oExpectedRequest = {
				method : "POST",
				url : "some/url",
				headers : {
					Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
				},
				body : undefined,
				$cancel : undefined,
				$metaPath : undefined,
				$queryOptions : undefined,
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$resourcePath : "some/url",
				$submit : undefined
			},
			aRequests = [[]],
			oRequestor = _Requestor.create("/~/"),
			oGroupLock = oRequestor.lockGroup("groupId", {}),
			oRequestorMock = this.mock(oRequestor);

		aRequests.iChangeSet = 0;
		aRequests[0].iSerialNumber = 0;

		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("groupId").returns("~");
		oRequestorMock.expects("getOrCreateBatchQueue").withExactArgs("groupId").returns(aRequests);
		oRequestorMock.expects("checkConflictingStrictRequest")
			.withExactArgs(sinon.match(oExpectedRequest), sinon.match.same(aRequests), 0);

		// code under test
		oRequestor.request("POST", "some/url", oGroupLock);

		assert.strictEqual(aRequests[0][0].url, "some/url");

		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("groupId").returns("~");
		oRequestorMock.expects("getOrCreateBatchQueue").withExactArgs("groupId")
			.returns(aRequests);
		oRequestorMock.expects("checkConflictingStrictRequest")
			.withExactArgs(sinon.match(oExpectedRequest), sinon.match.same(aRequests), 0)
			.throws(oConflictError);

		// code under test - conflict case
		return oRequestor.request("POST", "some/url", oGroupLock.getUnlockedCopy())
			.then(function () {
				assert.notOk(true);
			}, function (oError) {
				assert.strictEqual(oConflictError, oError);
				assert.strictEqual(aRequests[0][0].url, "some/url");
				// no new request should be inserted
				assert.strictEqual(aRequests[0].length, 1);
			});
	});

	//*****************************************************************************************
	QUnit.test("sendOptimisticBatch: w/o optimistic batch", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface),
			oGetPromise = Promise.resolve(/*no first batch*/),
			sKey = window.location.href;

		this.mock(CacheManager).expects("get")
			.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey)
			.resolves(oGetPromise);

		this.mock(oRequestor).expects("sendBatch").never();

		// code under test
		oRequestor.sendOptimisticBatch();

		assert.strictEqual(oRequestor.oOptimisticBatch, null);

		return oGetPromise.then(function () {
			assert.deepEqual(oRequestor.oOptimisticBatch, {key : sKey});
		});
	});

	//*****************************************************************************************
	QUnit.test("sendOptimisticBatch: with optimistic batch", function (assert) {
		var oOptimisticBatch = {requests : "~aRequests~", groupId : "~sGroupId~"},
			oGetPromise = Promise.resolve(oOptimisticBatch),
			sKey = window.location.href,
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(CacheManager).expects("get")
			.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey)
			.resolves(oGetPromise);
		this.mock(oRequestor).expects("sendBatch")
			.withExactArgs("~aRequests~", "~sGroupId~")
			.returns("~sendBatchResult~");
		this.oLogMock.expects("info")
			.withExactArgs("optimistic batch: sent ", sKey, sClassName);

		// code under test
		oRequestor.sendOptimisticBatch();

		assert.strictEqual(oRequestor.oOptimisticBatch, null);

		return oGetPromise.then(function () {
			assert.deepEqual(oRequestor.oOptimisticBatch, {key : sKey,
				firstBatch : oOptimisticBatch,
				result : "~sendBatchResult~"});
		});
	});

	//*****************************************************************************************
	QUnit.test("sendOptimisticBatch: CacheManager.get rejects", function (assert) {
		var done = assert.async(),
			oError = new Error("CacheManager.get rejected"),
			oRequestor = _Requestor.create("/", oModelInterface),
			fnReporter = function (oError0) {
				assert.strictEqual(oError0, oError);
				assert.strictEqual(oRequestor.oOptimisticBatch, null);
				done();
			};

		this.mock(CacheManager).expects("get")
			.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + window.location.href)
			.rejects(oError);
		this.mock(oRequestor.oModelInterface).expects("getReporter")
			.withExactArgs()
			.returns(fnReporter);

		// code under test
		oRequestor.sendOptimisticBatch();

		assert.strictEqual(oRequestor.oOptimisticBatch, null);
	});

	//*****************************************************************************************
	QUnit.test("sendOptimisticBatch: #processBatch before read finished", function (assert) {
		var oOptimisticBatch = {requests : "~aRequests~", groupId : "~sGroupId~"},
			oRequestor = _Requestor.create("/", oModelInterface),
			that = this,
			oGetPromise = new Promise(function (fnResolve) {
				that.mock(oRequestor).expects("sendBatch").never();
				that.oLogMock.expects("error")
					.withExactArgs("optimistic batch: #sendBatch called before optimistic "
						+ "batch payload could be read", undefined, sClassName);
				fnResolve(oOptimisticBatch);
			});

		this.mock(CacheManager).expects("get")
			.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + window.location.href)
			.resolves(oGetPromise);
		this.mock(oRequestor).expects("isBatchSent")
			.withExactArgs()
			.returns(true); // simulate #processBatch

		// code under test
		oRequestor.sendOptimisticBatch();

		assert.strictEqual(oRequestor.oOptimisticBatch, null);

		return oGetPromise.then(function () {
			assert.deepEqual(oRequestor.oOptimisticBatch, null);
		});
	});

	//*****************************************************************************************
	QUnit.test("processOptimisticBatch: simple cases", function (assert) {
		var oCacheManagerMock = this.mock(CacheManager),
			sKey = window.location.href,
			oModelInterfaceMock = this.mock(oModelInterface),
			oRequestor = _Requestor.create("/", oModelInterface);

		assert.strictEqual(oRequestor.oOptimisticBatch, null);

		//** !this.oOptimisticBatch -> returns undefined
		oCacheManagerMock.expects("set").never();

		oModelInterfaceMock.expects("getOptimisticBatchEnabler").never();

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch("n/a", "n/a"), undefined);

		assert.strictEqual(oRequestor.oOptimisticBatch, null);

		//** no enabler existing -> nothing happens
		// simulate first app start w/o optimistic batch sent
		oRequestor.oOptimisticBatch = {key : sKey};
		oModelInterfaceMock.expects("getOptimisticBatchEnabler").withExactArgs()
			.returns(undefined);

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch("n/a", "n/a"), undefined);

		assert.strictEqual(oRequestor.oOptimisticBatch, null);

		//** enabler existing, but modifying batch (method other than GET)
		oRequestor.oOptimisticBatch = {key : sKey};
		oModelInterfaceMock.expects("getOptimisticBatchEnabler").withExactArgs()
			.returns("notCalled");
		this.oLogMock.expects("warning")
			.withExactArgs("optimistic batch: modifying batch not supported", sKey, sClassName);

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch([
				{method : "GET"},
				{method : "no GET!"}
			], "n/a"), undefined);

		//** enabler existing, but modifying batch (changeSet detected)
		oRequestor.oOptimisticBatch = {key : sKey};
		oModelInterfaceMock.expects("getOptimisticBatchEnabler").withExactArgs()
			.returns("notCalled");
		this.oLogMock.expects("warning")
			.withExactArgs("optimistic batch: modifying batch not supported", sKey, sClassName);

		// code under test
		assert.strictEqual(
			oRequestor.processOptimisticBatch([{method : "GET"}, [/*changeSet*/]], "n/a"),
			undefined);
	});

	//*****************************************************************************************
[0, null, undefined, false, Promise.resolve(false)].forEach(function (vEnablerResult) {
	var sTitle = "processOptimisticBatch: first app start, enabler returns falsy: ";

	QUnit.test(sTitle + vEnablerResult, function (assert) {
		var fnEnabler = sinon.spy(function () {
				return vEnablerResult;
			}),
			sKey = window.location.href,
			oRequestor = _Requestor.create("/", oModelInterface),
			that = this;

		oRequestor.oOptimisticBatch = {key : sKey}; // simulate sendOptimisticBatch just happen
		 this.mock(oModelInterface).expects("getOptimisticBatchEnabler")
			.withExactArgs()
			.returns(fnEnabler);
		that.oLogMock.expects("info")
			.withExactArgs("optimistic batch: disabled", sKey, sClassName);

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch([{method : "GET"}], "n/a"), undefined);

		assert.strictEqual(oRequestor.oOptimisticBatch, null);
		sinon.assert.calledOnceWithExactly(fnEnabler, sKey);

		// we have to wait for Promise.resolve() in productive code
		return Promise.resolve(vEnablerResult);
	});
});

	//*****************************************************************************************
[1, true, "true", Promise.resolve(true), Promise.resolve({})].forEach(function (vEnablerResult) {
	var sTitle = "processOptimisticBatch: first app start, enabler returns truthy: ";

	QUnit.test(sTitle + vEnablerResult, function (assert) {
		var fnEnabler = sinon.spy(function () {
				return vEnablerResult;
			}),
			sGroupId = "group",
			sKey = window.location.href,
			aRequests = [{
				headers : {header0 : "saved", "X-CSRF-Token" : "not saved"},
				method : "GET",
				url : "url0",
				foo : "not saved"
			}, {
				headers : {header1 : "saved", "X-CSRF-Token" : "not saved"},
				method : "GET",
				url : "url1",
				bar : "not saved"
			}],
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface),
			oSetPromise,
			that = this;

		//** enabler existing, and gets called with key, returns/resolves truthy, CacheManager.set
		oSetPromise = new Promise(function (fnResolve) {
			that.oLogMock.expects("info")
				.withExactArgs("optimistic batch: enabled, batch payload saved", sKey,
					sClassName);
			fnResolve();
		});

		aPromises.push(vEnablerResult);
		oRequestor.oOptimisticBatch = {key : sKey};
		this.mock(oModelInterface).expects("getOptimisticBatchEnabler")
			.withExactArgs()
			.returns(fnEnabler);
		this.mock(CacheManager).expects("set")
			.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey, {groupId : "group",
				requests : [{
					headers : {header0 : "saved"},
					method : "GET",
					url : "url0"
				}, {
					headers : {header1 : "saved"},
					method : "GET",
					url : "url1"
			}]})
			.returns(oSetPromise);
		aPromises.push(oSetPromise);

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch(aRequests, sGroupId), undefined);

		assert.strictEqual(oRequestor.oOptimisticBatch, null);
		sinon.assert.calledOnceWithExactly(fnEnabler, sKey);

		return Promise.all(aPromises);
	});
});

	//*****************************************************************************************
	QUnit.test("processOptimisticBatch: fnOptimisticBatchEnabler rejects", function (assert) {
		var done = assert.async(),
			oError = new Error("~enablerError~"),
			sKey = window.location.href,
			fnEnabler = function (sKey0) {
				assert.strictEqual(sKey0, sKey);
				return Promise.reject(oError);
			},
			fnReporter = function (oError0) {
				assert.strictEqual(oError0, oError);
				done();
			},
			oRequestor = _Requestor.create("/", oModelInterface);

		// simulate first app start w/o optimistic batch sent
		oRequestor.oOptimisticBatch = {key : sKey};

		this.mock(CacheManager).expects("set").never();
		this.mock(oModelInterface).expects("getReporter")
			.withExactArgs()
			.returns(fnReporter);
		this.mock(oModelInterface).expects("getOptimisticBatchEnabler")
			.withExactArgs()
			.returns(fnEnabler);

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch([], "n/a"), undefined);
	});

	//*****************************************************************************************
	QUnit.test("processOptimisticBatch: CacheManager.set rejects", function (assert) {
		var done = assert.async(),
			oError = new Error("CacheManager.set rejected"),
			sGroupId = "group",
			sKey = window.location.href,
			fnEnabler = function () {
				return Promise.resolve(true);
			},
			aRequests = [{
				headers : {foo : "bar"},
				method : "GET",
				url : "url0",
				foo : "foo0"
			}],
			oModelInterfaceMock = this.mock(oModelInterface),
			fnReporter = function (oError0) {
				assert.strictEqual(oError0, oError);
				done();
			},
			oRequestor = _Requestor.create("/", oModelInterface);

		// simulate first app start w/o optimistic batch sent
		oRequestor.oOptimisticBatch = {key : sKey};

		oModelInterfaceMock.expects("getReporter")
			.withExactArgs()
			.returns(fnReporter);
		oModelInterfaceMock.expects("getOptimisticBatchEnabler")
			.withExactArgs()
			.returns(fnEnabler);
		this.mock(CacheManager).expects("set")
			.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey, {
				groupId : "group",
				requests : [{
					headers : {foo : "bar"},
					method : "GET",
					url : "url0"
				}]
			})
			.rejects(oError);

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch(aRequests, sGroupId), undefined);
	});

	//*****************************************************************************************
[false, true, undefined].forEach((bEnabled) => { // undefined -> no enabler assigned
	[false, true].forEach((bCacheManagerRejects) => {
	const sTitle = `processOptimisticBatch: n+1 start, optimistic batch matches,
		enabler=${bEnabled}, del rejects=${bCacheManagerRejects}`;
	QUnit.test(sTitle, function (assert) {
		var done = assert.async(),
			oError = new Error("CacheManager.del rejected"),
			iGetReporterCount,
			sKey = window.location.href,
			oOptimisticBatch = {
				firstBatch : {
					requests : "~optimisticRequests~",
					groupId : "~optimisticGroup~"
				},
				key : sKey,
				result : "~optimisticBatchResult~"
			},
			fnEnabler = bEnabled === undefined ? undefined : sinon.stub().resolves(bEnabled),
			oRequestor = _Requestor.create("/", oModelInterface),
			fnReporter = function (oError0) {
				assert.strictEqual(oError0, oError);
				done();
			};

		if (bEnabled) {
			iGetReporterCount = 1;
		} else {
			iGetReporterCount = bEnabled !== undefined ? 1 : 0;
		}

		oRequestor.oOptimisticBatch = oOptimisticBatch;

		this.mock(_Requestor).expects("matchesOptimisticBatch")
			.withExactArgs("~requests~", "~group~", "~optimisticRequests~", "~optimisticGroup~")
			.returns(true);

		this.mock(oModelInterface).expects("getOptimisticBatchEnabler").returns(fnEnabler);
		this.mock(oModelInterface).expects("getReporter").exactly(iGetReporterCount)
			.withExactArgs().returns(fnReporter);
		if (bEnabled === false) {
			if (bCacheManagerRejects) {
				this.mock(CacheManager).expects("del")
					.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey).rejects(oError);
			} else {
				this.mock(CacheManager).expects("del")
					.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey).resolves();
				this.oLogMock.expects("info")
					.withExactArgs("optimistic batch: disabled, batch payload deleted", sKey,
						sClassName);
				done();
			}
		}
		this.oLogMock.expects("info")
			.withExactArgs("optimistic batch: success, response consumed", sKey, sClassName);
		this.mock(CacheManager).expects("set").never();

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch("~requests~", "~group~"),
			"~optimisticBatchResult~");

		assert.strictEqual(oRequestor.oOptimisticBatch, null);

		if (bEnabled !== undefined) {
			assert.strictEqual(fnEnabler.calledOnce, true);
		}
		if (bEnabled !== false) {
			done();
		}
	});
	});
});

	//*****************************************************************************************
	const sTitle = "processOptimisticBatch: n+1 start, optimistic batch matches, enabler rejects";
	QUnit.test(sTitle, function (assert) {
		var oError = new Error("Enabler rejects"),
			sKey = window.location.href,
			oOptimisticBatch = {
				firstBatch : {
					requests : "~optimisticRequests~",
					groupId : "~optimisticGroup~"
				},
				key : sKey,
				result : "~optimisticBatchResult~"
			},
			fnEnabler = sinon.stub().rejects(oError),
			oRequestor = _Requestor.create("/", oModelInterface),
			fnReporter = function (oError0) {
				assert.strictEqual(oError0, oError);
			};

		oRequestor.oOptimisticBatch = oOptimisticBatch;

		this.mock(_Requestor).expects("matchesOptimisticBatch")
			.withExactArgs("~requests~", "~group~", "~optimisticRequests~", "~optimisticGroup~")
			.returns(true);

		this.mock(oModelInterface).expects("getOptimisticBatchEnabler").returns(fnEnabler);
		this.mock(oModelInterface).expects("getReporter").withExactArgs().returns(fnReporter);

		this.oLogMock.expects("info")
			.withExactArgs("optimistic batch: disabled, batch payload deleted", sKey, sClassName)
			.never();
		this.oLogMock.expects("info")
			.withExactArgs("optimistic batch: success, response consumed", sKey, sClassName);
		this.mock(CacheManager).expects("set").never();
		this.mock(CacheManager).expects("del").never();

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch("~requests~", "~group~"),
			"~optimisticBatchResult~");

		assert.strictEqual(fnEnabler.calledOnce, true);
	});

	//*****************************************************************************************
[false, true].forEach((bRejects) => {
	const sTitle = `processOptimisticBatch: mismatch, CacheManager.del rejects=${bRejects}`;
	QUnit.test(sTitle, function (assert) {
		// Note: this test covers also the successful CacheManager.del case
		var oCacheManagerMock = this.mock(CacheManager),
			done = assert.async(),
			oError = new Error("CacheManager.del rejected"),
			sKey = window.location.href,
			oModelInterfaceMock = this.mock(oModelInterface),
			oOptimisticBatch = {
				firstBatch : {
					requests : "~optimisticRequests~",
					groupId : "~optimisticGroup~"
				},
				key : sKey,
				result : "~optimisticBatchResult~"
			},
			fnReporter = function (oError0) {
				assert.strictEqual(oError0, oError);
				done();
			},
			oRequestor = _Requestor.create("/", oModelInterface);

		oRequestor.oOptimisticBatch = oOptimisticBatch;
		this.mock(_Requestor).expects("matchesOptimisticBatch")
			.withExactArgs("~requests~", "~group~", "~optimisticRequests~", "~optimisticGroup~")
			.returns(false);

		this.oLogMock.expects("warning")
			.withExactArgs("optimistic batch: mismatch, response skipped", sKey, sClassName);
		if (bRejects) {
			oCacheManagerMock.expects("del")
				.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey)
				.rejects(oError);
		} else {
			oCacheManagerMock.expects("del")
				.withExactArgs("sap.ui.model.odata.v4.optimisticBatch:" + sKey)
				.resolves();
			done();
		}
		oModelInterfaceMock.expects("getReporter")
			.withExactArgs()
			.returns(fnReporter);
		oModelInterfaceMock.expects("getOptimisticBatchEnabler")
			.withExactArgs()
			.returns(undefined); // unrealistic, but this skips processing in productive code
		oCacheManagerMock.expects("set").never();

		// code under test
		assert.strictEqual(oRequestor.processOptimisticBatch("~requests~", "~group~"), undefined);

		assert.strictEqual(oRequestor.oOptimisticBatch, null);
	});
});

	//*****************************************************************************************
	QUnit.test("hasOnlyPatchesWithoutSideEffects", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
			oRequestorMock = this.mock(oRequestor);

		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("myGroup").returns("API");

		// code under test
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("myGroup"), false);

		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("$auto").returns("Auto");

		// code under test - mBatchQueue empty
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("$auto"), false);

		oRequestor.mBatchQueue["$auto"] = [[], {/* not a changeset */}];
		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("$auto").returns("Auto");

		// code under test - not a changeset
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("$auto"), false);

		oRequestor.mBatchQueue["$auto"] = [[{
			method : "~VERB~"
		}]];
		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("$auto").returns("Auto");

		// code under test - not a PATCH
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("$auto"), false);

		oRequestor.mBatchQueue["$auto"] = [[{
			headers : {
				Prefer : "~foo~"
			},
			method : "PATCH"
		}]];
		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("$auto").returns("Auto");

		// code under test - PATCH, header mismatch
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("$auto"), false);

		oRequestor.mBatchQueue["$auto"] = [[{
			headers : {
				Prefer : "return=minimal"
			},
			method : "PATCH"
		}]];
		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("$auto").returns("Auto");

		// code under test - single PATCH, correct header
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("$auto"), true);

		oRequestor.mBatchQueue["$auto"] = [[{
			headers : {
				Prefer : "return=minimal"
			},
			method : "PATCH"
		}, {
			headers : {
				Prefer : "return=minimal"
			},
			method : "PATCH"
		}]];
		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("$auto").returns("Auto");

		// code under test - multiple PATCHes, correct header
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("$auto"), true);

		oRequestor.mBatchQueue["$auto"] = [[{
			headers : {
				Prefer : "return=minimal"
			},
			method : "PATCH"
		}, {
			method : "GET"
		}]];
		oRequestorMock.expects("getGroupSubmitMode").withExactArgs("$auto").returns("Auto");

		// code under test - PATCH with correct header, GET
		assert.strictEqual(oRequestor.hasOnlyPatchesWithoutSideEffects("$auto"), false);
	});
});
// TODO: continue-on-error? -> flag on model
// TODO: cancelChanges: what about existing GET requests in deferred queue (delete or not)?
// TODO: tests for doConvertSystemQueryOptions missing. Only tested indirectly

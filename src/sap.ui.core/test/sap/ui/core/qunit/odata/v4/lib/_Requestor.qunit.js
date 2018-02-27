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

	var oModelInterface = {
			fnFetchMetadata : function () {
				throw new Error("Do not call me!");
			},
			fnGetGroupProperty : defaultGetGroupProperty,
			fnOnCreateGroup : function () {}
		},
		sServiceUrl = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
		sSampleServiceUrl
			= "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/";

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
	 *   "DataServiceVersion", "OData-Version" and "X-CSRF-Token" all with default value
	 *   <code>null</code>; if no response headers are given at all the default value for
	 *   "OData-Version" is "4.0";
	 * @returns {object}
	 *   a mock for jQuery's XHR wrapper
	 */
	function createMock(assert, oPayload, sTextStatus, mResponseHeaders) {
		var jqXHR = new jQuery.Deferred();

		setTimeout(function () {
			jqXHR.resolve(oPayload, sTextStatus, { // mock jqXHR for success handler
				getResponseHeader : function (sName) {
					mResponseHeaders = mResponseHeaders || {
							"OData-Version" : "4.0"
						};
					// Note: getResponseHeader treats sName case insensitive!
					switch (sName) {
					case "Content-Type":
						return mResponseHeaders["Content-Type"] || null;
					case "DataServiceVersion":
						return mResponseHeaders["DataServiceVersion"] || null;
					case "OData-Version":
						return mResponseHeaders["OData-Version"] || null;
					case "X-CSRF-Token":
						return mResponseHeaders["X-CSRF-Token"] || null;
					default:
						assert.ok(false, "unexpected getResponseHeader(" + sName + ")");
					}
				}
			});
		}, 0);

		return jqXHR;
	}

	/*
	 * Simulation of {@link sap.ui.model.odata.v4.ODataModel#getGroupProperty}
	 */
	function defaultGetGroupProperty(sGroupId, sPropertyName) {
		if (sPropertyName !== 'submit') {
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
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			// resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			this.mock(sap.ui).expects("getVersionInfo").atLeast(0);
		}
	});

	//*********************************************************************************************
	QUnit.test("_Requestor is an object, not a constructor function", function (assert) {
		assert.strictEqual(typeof _Requestor, "object");
	});

	//*********************************************************************************************
	QUnit.test("getServiceUrl", function (assert) {
		var oRequestor = _Requestor.create(sServiceUrl, oModelInterface,
				{"foo" : "must be ignored"});

		// code under test
		assert.strictEqual(oRequestor.getServiceUrl(), sServiceUrl);
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

			this.mock(oModelInterface).expects("fnGetGroupProperty")
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
			"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true"
		},
		mPredefinedRequestHeaders : {
			"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
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
			"Accept" : "application/json"
		},
		mPredefinedRequestHeaders : {
			"Accept" : "application/json",
			"MaxDataServiceVersion" : "2.0",
			"DataServiceVersion" : "2.0",
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
				"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true"
			},
			mPredefinedRequestHeaders = {
				"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
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
		assert.strictEqual(oRequestor.fnOnCreateGroup, undefined, "parameter fnOnCreateGroup");
		// OData version specific header maps
		assert.deepEqual(oRequestor.mFinalHeaders, mFinalHeaders, "mFinalHeaders");
		assert.deepEqual(oRequestor.mPredefinedPartHeaders, mPredefinedPartHeaders,
			"mPredefinedPartHeaders");
		assert.deepEqual(oRequestor.mPredefinedRequestHeaders, mPredefinedRequestHeaders,
			"mPredefinedRequestHeaders");
	});

	//*********************************************************************************************
	QUnit.test("request", function (assert) {
		var oChangedPayload = {"foo" : 42},
			oPayload = {},
			oPromise,
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, {
				"foo" : "URL params are ignored for normal requests"
			}),
			oResult = {},
			fnSubmit = this.spy();

		this.mock(oRequestor).expects("convertResourcePath").withExactArgs("Employees?foo=bar")
			.returns("~Employees~?foo=bar");
		this.mock(_Requestor).expects("cleanPayload")
			.withExactArgs(sinon.match.same(oPayload)).returns(oChangedPayload);
		this.mock(jQuery).expects("ajax")
			.withExactArgs(sServiceUrl + "~Employees~?foo=bar", {
				data : JSON.stringify(oChangedPayload),
				headers : sinon.match({
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
				}),
				method : "FOO"
			}).returns(createMock(assert, oResult, "OK"));

		// code under test
		oPromise = oRequestor.request("FOO", "Employees?foo=bar", "$direct",
			{"Content-Type" : "wrong"}, oPayload, fnSubmit);

		return oPromise.then(function (result) {
				assert.strictEqual(result, oResult);
			});
	});

	//*********************************************************************************************
	["NOTGET", "GET"].forEach(function (sMethod, i) {
		QUnit.test("request: wait for CSRF token if method is not GET, " + i, function (assert) {
			var oPayload = {},
				oPromise,
				oRequestor = _Requestor.create(sServiceUrl, oModelInterface),
				oResult = {},
				oSecurityTokenPromise = new Promise(function (fnResolve, fnReject) {
					setTimeout(function () {
						oRequestor.mHeaders["X-CSRF-Token"] = "abc123";
						fnResolve();
					}, 0);
				});

			// security token already requested by #refreshSecurityToken
			oRequestor.oSecurityTokenPromise = oSecurityTokenPromise;

			this.mock(jQuery).expects("ajax")
				.withExactArgs(sServiceUrl + "Employees?foo=bar", {
					data : JSON.stringify(oPayload),
					headers : sinon.match({
						"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
						"X-CSRF-Token" : sMethod === "GET" ? "Fetch" : "abc123"
					}),
					method : sMethod
				}).returns(createMock(assert, oResult, "OK"));

			// code under test
			oPromise = oRequestor.request(sMethod, "Employees?foo=bar", "$direct", {}, oPayload);

			return Promise.all([oPromise, oSecurityTokenPromise]);
		});
	});

	//*********************************************************************************************
	[{
		sODataVersion : "2.0",
		mExpectedRequestHeaders : {
			"Accept" : "application/json",
			"Content-Type" : "application/json;charset=UTF-8",
			"DataServiceVersion" : "2.0",
			"MaxDataServiceVersion" : "2.0",
			"X-CSRF-Token" : "Fetch"
		}
	}, {
		sODataVersion : "4.0",
		mExpectedRequestHeaders : {
			"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
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
				oRequestorMock = this.mock(oRequestor),
				oResponsePayload = {};

			this.mock(jQuery).expects("ajax")
				.withExactArgs(sServiceUrl + "Employees", {
					data : undefined,
					headers : sinon.match(oFixture.mExpectedRequestHeaders),
					method : "GET"
				}).returns(createMock(assert, oResponsePayload, "OK"));
			oRequestorMock.expects("doCheckVersionHeader")
				.withExactArgs(sinon.match.func, "Employees");
			oRequestorMock.expects("doConvertResponse")
				.withExactArgs(oResponsePayload, sMetaPath)
				.returns(oConvertedResponse);

			// code under test
			return oRequestor.request("GET", "Employees", "$direct", undefined, undefined,
					undefined, undefined, sMetaPath)
				.then(function (result) {
					assert.strictEqual(result, oConvertedResponse);
				});
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
			.returns(createMock(assert, oResponsePayload, "OK", {"DataServiceVersion" : "2.0"}));
		this.mock(oRequestor).expects("doConvertResponse")
			.withExactArgs(oResponsePayload, undefined)
			.throws(oError);

		// code under test
		return oRequestor.request("GET", "Employees", "$direct")
			.then(function (result) {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	QUnit.test("request: fail, unsupported OData service version, $direct", function (assert) {
		var oError = {},
			oRequestor = _Requestor.create("/", oModelInterface),
			oRequestorMock = this.mock(oRequestor);

		this.mock(jQuery).expects("ajax")
			.withArgs("/Employees")
			.returns(createMock(assert, {}, "OK"));
		oRequestorMock.expects("doCheckVersionHeader")
			.withExactArgs(sinon.match.func, "Employees")
			.throws(oError);
		oRequestorMock.expects("doConvertResponse").never();

		// code under test
		return oRequestor.request("GET", "Employees", "$direct")
			.then(function (result) {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	QUnit.test("request: fail, unsupported OData service version, $batch", function (assert) {
		var oError = {},
			oRequestor = _Requestor.create("/", oModelInterface),
			oRequestorMock = this.mock(oRequestor);

		this.mock(jQuery).expects("ajax")
			.withArgs("/$batch")
			.returns(createMock(assert, {}, "OK"));
		oRequestorMock.expects("doCheckVersionHeader")
			.withExactArgs(sinon.match.func, "$batch")
			.throws(oError);
		this.mock(_Batch).expects("deserializeBatchResponse").never();
		oRequestorMock.expects("doConvertResponse").never();

		// code under test
		return oRequestor.request("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [])
			.then(function (result) {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch: fail, unsupported OData service version", function (assert) {
		var oError = {},
			oGetProductsPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			mResponse = {
				headers : {
					"OData-Version" : "foo"
				},
				responseText : JSON.stringify({d : {foo : "bar"}})
			};

		oRequestorMock.expects("doConvertResponse").never();
		oGetProductsPromise = oRequestor.request("GET", "Products", "group1")
			.then(function () {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
		oRequestorMock.expects("request")
			.withArgs("POST", "$batch")
			.returns(Promise.resolve([mResponse]));
		oRequestorMock.expects("doCheckVersionHeader")
			.withExactArgs(sinon.match(function (fnGetResponseHeader) {
				assert.strictEqual(typeof fnGetResponseHeader, "function");
				assert.strictEqual(fnGetResponseHeader("OData-Version"), "foo",
					"getResponseHeader has to be called on mResponse");
				return true;
			}), "Products", true)
			.throws(oError);

		return Promise.all([oGetProductsPromise, oRequestor.submitBatch("group1")]);
	});

	//*********************************************************************************************
	[{
		sODataVersion : "2.0",
		aExpectedRequestHeaders : ["DataServiceVersion", "MaxDataServiceVersion"]
	}, {
		sODataVersion : "4.0",
		aExpectedRequestHeaders : ["OData-MaxVersion", "OData-Version"]
	}].forEach(function (oFixture) {
		var sTitle = "request: OData version specific headers for $batch; sODataVersion="
				+ oFixture.sODataVersion;

		QUnit.test(sTitle, function (assert) {
			var oRequestor = _Requestor.create(sServiceUrl, oModelInterface, undefined, undefined,
					oFixture.sODataVersion),
				oAjaxResponse = {},
				oDeserializeBatchResponse = {},
				mResponseHeaders = {"Content-Type" : "application/json"};

			if (oFixture.sODataVersion === "2.0") {
				mResponseHeaders["DataServiceVersion"] = "2.0";
			} else {
				mResponseHeaders["OData-Version"] = "4.0";
			}

			this.mock(jQuery).expects("ajax")
				.withExactArgs(sServiceUrl + "$batch", {
					data : sinon.match.string,
					headers : sinon.match(function (mAjaxHeaders) {
						oFixture.aExpectedRequestHeaders.forEach(function (sHeaderKey) {
							assert.strictEqual(mAjaxHeaders[sHeaderKey], oFixture.sODataVersion,
								"expected header: " + sHeaderKey);
						});
						return true;
					}),
					method : "POST"
				}).returns(createMock(assert, oAjaxResponse, "OK", mResponseHeaders));
			this.mock(_Batch).expects("deserializeBatchResponse")
				.withExactArgs("application/json", oAjaxResponse)
				.returns(oDeserializeBatchResponse);
			this.mock(oRequestor).expects("doConvertResponse").never();

			// code under test
			return oRequestor
				.request("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [])
				.then(function (result) {
					assert.strictEqual(result, oDeserializeBatchResponse);
			});
		});
	});

	//*********************************************************************************************
	[{
		sODataVersion : "2.0",
		mExpectedRequestHeaders : {
			"Accept" : "application/json",
			"Content-Type" : "application/json;charset=UTF-8"
		},
		mProductsResponse : {d : {results : [{foo : "bar"}]}}
	}, {
		sODataVersion : "4.0",
		mExpectedRequestHeaders : {
			"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		mProductsResponse : {value : [{foo : "bar"}]}
	}].forEach(function (oFixture) {
		var sTitle = "submitBatch(...): OData version specific headers; sODataVersion="
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
					$metaPath : sMetaPath,
					$promise : sinon.match.defined,
					$reject : sinon.match.func,
					$resolve : sinon.match.func,
					$submit : undefined
				}],
				oGetProductsPromise,
				oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, undefined,
					oFixture.sODataVersion),
				oRequestorMock = this.mock(oRequestor);

			oRequestorMock.expects("doConvertResponse")
				// not same; it is stringified and parsed
				.withExactArgs(oFixture.mProductsResponse, sMetaPath)
				.returns(oConvertedPayload);
			oGetProductsPromise = oRequestor.request("GET", "Products", "group1", undefined,
					undefined, undefined, undefined, sMetaPath)
				.then(function (oResponse) {
					assert.strictEqual(oResponse, oConvertedPayload);
				});

			oRequestorMock.expects("request")
				.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"},
					aExpectedRequests)
				.returns(Promise.resolve([
					{responseText : JSON.stringify(oFixture.mProductsResponse)}
				]));

			return Promise.all([oGetProductsPromise, oRequestor.submitBatch("group1")]);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch: fail to convert payload", function (assert) {
		var oError = {},
			oGetProductsPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined, undefined,
				"2.0"),
			oRequestorMock = this.mock(oRequestor),
			oResponse = {d : {foo : "bar"}};

		oRequestorMock.expects("doConvertResponse")
			.withExactArgs(oResponse, undefined)
			.throws(oError);
		oGetProductsPromise = oRequestor.request("GET", "Products", "group1")
			.then(function () {
				assert.notOk("Unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
		oRequestorMock.expects("request")
			.withArgs("POST", "$batch")
			.returns(Promise.resolve([{ responseText : JSON.stringify(oResponse)}]));

		return Promise.all([oGetProductsPromise, oRequestor.submitBatch("group1")]);
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
				oRequestor = _Requestor.create(sServiceUrl, oModelInterface, mDefaultHeaders),
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
			return oPromise.then(function (result) {
					assert.strictEqual(result, oResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), fnOnCreateGroup", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oModelInterface).expects("fnOnCreateGroup").withExactArgs("groupId");

		// code under test
		oRequestor.request("GET", "SalesOrders", "groupId");
		oRequestor.request("GET", "SalesOrders", "groupId");
	});

	//*********************************************************************************************
	QUnit.test("request(), fnGetGroupProperty", function (assert) {
		var oModelInterface = {
				fnGetGroupProperty : defaultGetGroupProperty,
				fnOnCreateGroup : null // optional
			},
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oModelInterface).expects("fnGetGroupProperty")
			.withExactArgs("groupId", "submit")
			.returns("API");

		// code under test
		oRequestor.request("GET", "SalesOrders", "groupId");
	});

	//*********************************************************************************************
	QUnit.test("request(), store CSRF token from server", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK", {
					"OData-Version" : "4.0",
					"X-CSRF-Token" : "abc123"
				}));

		return oRequestor.request("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), keep old CSRF token in case none is sent", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface, {"X-CSRF-Token" : "abc123"});

		this.mock(jQuery).expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "abc123"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK"));

		return oRequestor.request("GET", "").then(function () {
			assert.strictEqual(oRequestor.mHeaders["X-CSRF-Token"], "abc123");
		});
	});

	//*********************************************************************************************
	QUnit.test("request(), keep fetching CSRF token in case none is sent", function (assert) {
		var oMock = this.mock(jQuery),
			oRequestor = _Requestor.create("/", oModelInterface);

		oMock.expects("ajax")
			.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
			.returns(createMock(assert, {/*oPayload*/}, "OK"));

		return oRequestor.request("GET", "").then(function () {
			oMock.expects("ajax")
				.withExactArgs("/", sinon.match({headers : {"X-CSRF-Token" : "Fetch"}}))
				.returns(createMock(assert, {/*oPayload*/}, "OK"));

			return oRequestor.request("GET", "");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuccess) {
		QUnit.test("refreshSecurityToken: success = " + bSuccess, function (assert) {
			var oError = {},
				oPromise,
				oRequestor = _Requestor.create("/Service/", oModelInterface, undefined,
					{"sap-client" : "123"}),
				oTokenRequiredResponse = {};

			this.mock(_Helper).expects("createError")
				.exactly(bSuccess ? 0 : 2)
				.withExactArgs(sinon.match.same(oTokenRequiredResponse))
				.returns(oError);

			this.mock(jQuery).expects("ajax").twice()
				.withExactArgs("/Service/?sap-client=123", sinon.match({
					headers : {"X-CSRF-Token" : "Fetch"},
					method : "HEAD"
				}))
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
				oExpectation,
				oReadFailure = {},
				oRequestor = _Requestor.create("/Service/", oModelInterface,
					{"X-CSRF-Token" : "Fetch"}),
				oRequestPayload = {},
				oResponsePayload = {},
				fnSubmit = this.spy(),
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
				.withExactArgs(sinon.match.same(oTokenRequiredResponse))
				.returns(oError);
			this.mock(oRequestor).expects("convertResourcePath").atLeast(1)
				.withExactArgs("foo").returns("~foo~");

			// With <code>bRequestSucceeds === false</code>, "request" always fails,
			// with <code>bRequestSucceeds === true</code>, "request" always succeeds,
			// else "request" first fails due to missing CSRF token which can be fetched via
			// "ODataModel#refreshSecurityToken".
			this.mock(jQuery).expects("ajax").atLeast(1)
				.withExactArgs("/Service/~foo~", sinon.match({
					data : JSON.stringify(oRequestPayload),
					headers : {"foo" : "bar"},
					method : "FOO"
				}))
				.callsFake(function (sUrl, oSettings) {
					var jqXHR;

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

			oExpectation = this.mock(oRequestor).expects("refreshSecurityToken");
			if (o.bRequestSucceeds !== undefined) {
				oExpectation.never();
			} else {
				oExpectation.callsFake(function (sOldSecurityToken) {
					assert.strictEqual(sOldSecurityToken, "Fetch");
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

			return oRequestor.request("FOO", "foo", "$direct", {"foo" : "bar"}, oRequestPayload,
					fnSubmit)
				.then(function (oPayload) {
					assert.ok(bSuccess, "success possible");
					sinon.assert.calledOnce(fnSubmit);
					assert.strictEqual(oPayload, oResponsePayload);
				}, function (oError0) {
					assert.ok(!bSuccess, "certain failure");
					sinon.assert.calledOnce(fnSubmit);
					assert.strictEqual(oError0, o.bReadFails ? oReadFailure : oError);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("$batch repeated", function (assert) {
		var oBatchRequest = {
				body : "payload",
				headers : {
					"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
					"MIME-Version" : "1.0"
				}
			},
			oCleanedPayload = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface, {"_foo" : "_bar"},
				{"sap-client" : "111"}),
			oRequestPayload = {},
			sResponseContentType = "multipart/mixed; boundary=foo",
			oResponsePayload = {},
			oTokenRequiredResponse = {
				getResponseHeader : function (sName) {
					// Note: getResponseHeader treats sName case insensitive!
					assert.strictEqual(sName, "X-CSRF-Token");
					return "required";
				},
				"status" : 403
			};

		this.mock(_Requestor).expects("cleanBatch").twice()
			.withExactArgs(sinon.match.same(oRequestPayload))
			.returns(oCleanedPayload);
		this.mock(_Batch).expects("serializeBatchRequest").twice()
			.withExactArgs(sinon.match.same(oCleanedPayload))
			.returns(oBatchRequest);
		this.mock(_Batch).expects("deserializeBatchResponse").once()
			.withExactArgs(sResponseContentType, sinon.match.same(oResponsePayload))
			.returns(oResponsePayload);
		this.mock(_Helper).expects("createError").never();

		// "request" first fails due to missing CSRF token which can be fetched via
		// "ODataModel#refreshSecurityToken".
		this.mock(jQuery).expects("ajax").twice()
			.withExactArgs("/Service/$batch?sap-client=111", sinon.match({
				data : oBatchRequest.body,
				method : "FOO"
			}))
			.callsFake(function (sUrl, oSettings) {
				var jqXHR;

				if (oSettings.headers["X-CSRF-Token"] === "abc123") {
					jqXHR = createMock(assert, oResponsePayload, "OK", {
							"Content-Type" : sResponseContentType,
							"OData-Version" : "4.0"
						});
				} else {
					jqXHR = new jQuery.Deferred();
					setTimeout(function () {
						jqXHR.reject(oTokenRequiredResponse);
					}, 0);
				}

				delete oSettings.headers["X-CSRF-Token"];
				assert.deepEqual(oSettings.headers, {
					"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
					"MIME-Version" : "1.0",
					"OData-MaxVersion" : "4.0",
					"OData-Version" : "4.0",
					"_foo" : "_bar",
					"foo" : "bar"
				});

				return jqXHR;
			});

		this.mock(oRequestor).expects("refreshSecurityToken").callsFake(function () {
			return new Promise(function (fnResolve, fnReject) {
				setTimeout(function () {
					oRequestor.mHeaders["X-CSRF-Token"] = "abc123";
					fnResolve();
				}, 0);
			});
		});

		return oRequestor.request("FOO", "$batch", "$direct", {"foo" : "bar"}, oRequestPayload)
			.then(function (oPayload) {
				assert.strictEqual(oPayload, oResponsePayload);
			}, function (oError0) {
				assert.ok(false);
			});
	});

	//*********************************************************************************************
	// Integrative test simulating parallel POST requests: Both got a 403 token "required",
	// but the second not until the first already has completed fetching a new token,
	// here the second can simply reuse the already fetched token
	QUnit.test("parallel POST requests, fetch HEAD only once", function (assert) {
		var bFirstRequest = true,
			jqFirstTokenXHR = createMock(assert, {}, "OK", {
				"OData-Version" : "4.0",
				"X-CSRF-Token" : "abc123"
			}),
			iHeadRequestCount = 0,
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		this.mock(jQuery).expects("ajax").atLeast(1).callsFake(function (sUrl0, oSettings) {
			var jqXHR,
				oTokenRequiredResponse = {
					getResponseHeader : function (sName) {
						return "required";
					},
					"status" : 403
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
			oRequestor.request("POST", "$direct"),
			oRequestor.request("POST", "$direct")
		]).then(function () {
			assert.strictEqual(iHeadRequestCount, 1, "fetch HEAD only once");
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
		var aExpectedRequests = [[{
				method : "POST",
				url : "~Customers",
				headers : {
					"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					"Foo" : "baz"
				},
				body : {"ID" : 1},
				$cancel : undefined,
				$metaPath : undefined,
				$promise : sinon.match.defined,
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$submit : undefined
			}, {
				method : "DELETE",
				url : "~SalesOrders('42')",
				headers : {
					"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
				},
				body : undefined,
				$cancel : undefined,
				$metaPath : undefined,
				$promise : sinon.match.defined,
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$submit : undefined
			}], {
				method : "GET",
				url : "~Products",
				headers : {
					"Accept" : "application/json;odata.metadata=full",
					"Accept-Language" : "ab-CD",
					"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
					"Foo" : "bar"
				},
				body : undefined,
				$cancel : undefined,
				$metaPath : undefined,
				$promise : sinon.match.defined,
				$reject : sinon.match.func,
				$resolve : sinon.match.func,
				$submit : undefined
			}],
			aPromises = [],
			aResults = [{"foo1" : "bar1"}, {"foo2" : "bar2"}, undefined],
			aBatchResults = [[
					{responseText : JSON.stringify(aResults[1])},
					{responseText : ""}
				],
				{responseText : JSON.stringify(aResults[0])}
			],
			oRequestor = _Requestor.create("/Service/", oModelInterface,
				{"Accept-Language" : "ab-CD"}),
			oRequestorMock = this.mock(oRequestor);

		oRequestorMock.expects("convertResourcePath").withExactArgs("Products")
			.returns("~Products");
		aPromises.push(oRequestor.request("GET", "Products", "group1", {
			Foo : "bar",
			Accept : "application/json;odata.metadata=full"
		}).then(function (oResult) {
			assert.deepEqual(oResult, aResults[0]);
			aResults[0] = null;
		}));
		oRequestorMock.expects("convertResourcePath").withExactArgs("Customers")
			.returns("~Customers");
		aPromises.push(oRequestor.request("POST", "Customers", "group1", {
			Foo : "baz"
		}, {
			"ID" : 1
		}).then(function (oResult) {
			assert.deepEqual(oResult, aResults[1]);
			aResults[1] = null;
		}));
		oRequestorMock.expects("convertResourcePath").withExactArgs("SalesOrders('42')")
			.returns("~SalesOrders('42')");
		aPromises.push(oRequestor.request("DELETE", "SalesOrders('42')", "group1")
			.then(function (oResult) {
				assert.deepEqual(oResult, aResults[2]);
				aResults[2] = null;
			}));
		oRequestorMock.expects("convertResourcePath").withExactArgs("SalesOrders")
			.returns("~SalesOrders");
		oRequestor.request("GET", "SalesOrders", "group2");

		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"},
				aExpectedRequests)
			.returns(Promise.resolve(aBatchResults));

		aPromises.push(oRequestor.submitBatch("group1").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.deepEqual(aResults, [null, null, null], "all batch requests already resolved");
		}));
		aPromises.push(oRequestor.submitBatch("group1")); // must not call request again

		assert.strictEqual(oRequestor.mBatchQueue.group1, undefined);
		TestUtils.deepContains(oRequestor.mBatchQueue.group2, [[/*change set*/], {
			method : "GET",
			url : "~SalesOrders"
		}]);

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): single GET", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		oRequestor.request("GET", "Products", "groupId");
		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [
				// Note: no empty change set!
				sinon.match({method : "GET", url : "Products"})
			]).returns(Promise.resolve([
				{responseText : "{}"}
			]));

		// code under test
		return oRequestor.submitBatch("groupId");
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): merge PATCH requests", function (assert) {
		var aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface),
			fnSubmit0 = this.spy(),
			fnSubmit1 = this.spy(),
			fnSubmit2 = this.spy(),
			fnSubmit3 = this.spy();

		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {}, {Name : null}));
		oRequestor.request("PATCH", "Products('0')", "anotherGroupId", {}, {Name : "foo"});
		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {}, {Name : "bar"}));
		aPromises.push(oRequestor
			.request("GET", "Products", "groupId", undefined, undefined, fnSubmit0));
		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {}, {Note : "hello, world"}));
		// just different headers
		aPromises.push(oRequestor
			.request("PATCH", "Products('0')", "groupId", {"If-Match" : ""}, {Note : "no merge!"}));
		// just a different verb
		aPromises.push(oRequestor
			.request("POST", "Products", "groupId", {"If-Match" : ""}, {Name : "baz"}, fnSubmit1));
		// structured property
		// first set to null: may be merged with each other, but not with PATCHES to properties
		aPromises.push(oRequestor
			.request("PATCH", "BusinessPartners('42')", "groupId", {"If-Match" : ""},
				{Address : null}));
		aPromises.push(oRequestor
			.request("PATCH", "BusinessPartners('42')", "groupId", {"If-Match" : ""},
				{Address : null}));
		// then two different properties therein: must be merged
		aPromises.push(oRequestor
			.request("PATCH", "BusinessPartners('42')", "groupId", {"If-Match" : ""},
				{Address : {City : "Walldorf"}}, fnSubmit2));
		aPromises.push(oRequestor
			.request("PATCH", "BusinessPartners('42')", "groupId", {"If-Match" : ""},
				{Address : {PostalCode : "69190"}}, fnSubmit3));
		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [
				[
					sinon.match({
						body : {Name : "bar", Note : "hello, world"},
						method : "PATCH",
						url : "Products('0')"
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
						body : {Address : null},
						method : "PATCH",
						url : "BusinessPartners('42')"
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
			]).returns(Promise.resolve([
				[
					{responseText : JSON.stringify({Name : "bar", Note : "hello, world"})},
					{responseText : JSON.stringify({Note : "no merge!"})},
					{responseText : JSON.stringify({Name : "baz"})},
					{responseText : JSON.stringify({Address : null})},
					{responseText :
						JSON.stringify({Address : {City : "Walldorf", PostalCode : "69190"}})}
				],
				{responseText : JSON.stringify({Name : "Name", Note : "Note"})}
			]));

		// code under test
		aPromises.push(oRequestor.submitBatch("groupId"));

		sinon.assert.calledOnce(fnSubmit0);
		sinon.assert.calledWithExactly(fnSubmit0);
		sinon.assert.calledOnce(fnSubmit1);
		sinon.assert.calledWithExactly(fnSubmit1);
		sinon.assert.calledOnce(fnSubmit2);
		sinon.assert.calledWithExactly(fnSubmit2);
		sinon.assert.calledOnce(fnSubmit3);
		sinon.assert.calledWithExactly(fnSubmit3);
		return Promise.all(aPromises).then(function (aResults) {
			assert.deepEqual(aResults, [
				{Name : "bar", Note : "hello, world"}, // 1st PATCH
				{Name : "bar", Note : "hello, world"}, // 2nd PATCH, merged with 1st
				{Name : "Name", Note : "Note"}, // GET
				{Name : "bar", Note : "hello, world"}, // 3rd PATCH, merged with 1st and 2nd
				{Note : "no merge!"}, // PATCH with different headers
				{Name : "baz"}, // POST
				{Address : null},
				{Address : null},
				{Address : {City : "Walldorf", PostalCode : "69190"}},
				{Address : {City : "Walldorf", PostalCode : "69190"}},
				undefined // submitBatch()
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("submitBatch(...): $batch failure", function (assert) {
		var oBatchError = new Error("$batch request failed"),
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface);

		function unexpectedSuccess() {
			assert.ok(false, "unexpected success");
		}

		function assertError(oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(oError.message,
				"HTTP request was not processed because $batch failed");
			assert.strictEqual(oError.cause, oBatchError);
		}

		aPromises.push(oRequestor.request("PATCH", "Products('0')", "group", {}, {Name : "foo"})
			.then(unexpectedSuccess, assertError));
		aPromises.push(oRequestor.request("PATCH", "Products('1')", "group", {}, {Name : "foo"})
			.then(unexpectedSuccess, assertError));
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
		var oError = {error : {message : "404 Not found"}},
			aBatchResult = [{
				headers : {},
				responseText : "{}",
				status : 200
			}, {
				getResponseHeader : function () {
					return "application/json";
				},
				headers : {"Content-Type" :"application/json"},
				responseText : JSON.stringify(oError),
				status : 404,
				statusText : "Not found"
			}],
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface);

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
	QUnit.test("submitBatch(...): error in change set", function (assert) {
		var oError = {error : {message : "400 Bad Request"}},
			aBatchResult = [{
				getResponseHeader : function () {
					return "application/json";
				},
				headers : {"Content-Type" :"application/json"},
				responseText : JSON.stringify(oError),
				status : 400,
				statusText : "Bad Request"
			}],
			aPromises = [],
			oRequestor = _Requestor.create("/", oModelInterface);

		function assertError(oResultError, sMessage) {
			assert.ok(oResultError instanceof Error);
			assert.strictEqual(oResultError.message, "400 Bad Request");
			assert.strictEqual(oResultError.status, 400);
			assert.strictEqual(oResultError.statusText, "Bad Request");
		}

		aPromises.push(oRequestor.request("PATCH", "ProductList('HT-1001')", "group",
				{"If-Match" : "*"}, {Name : "foo"})
			.then(undefined, assertError));

		aPromises.push(oRequestor.request("POST", "Unknown", "group", undefined, {})
			.then(undefined, assertError));

		aPromises.push(oRequestor.request("PATCH", "ProductList('HT-1001')", "group",
				{"If-Match" : "*"}, {Name : "bar"})
			.then(undefined, assertError));

		aPromises.push(oRequestor.request("GET", "ok", "group")
			.then(undefined, function (oResultError) {
				assert.ok(oResultError instanceof Error);
				assert.strictEqual(oResultError.message,
					"HTTP request was not processed because the previous request failed");
				assertError(oResultError.cause);
			}));

		this.mock(oRequestor).expects("request")
			.returns(Promise.resolve(aBatchResult));

		aPromises.push(oRequestor.submitBatch("group").then(function (oResult) {
			assert.deepEqual(oResult, undefined);
		}));

		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("request(...): batch group id", function (assert) {
		var oRequestor = _Requestor.create("/", oModelInterface);

		oRequestor.request("PATCH", "EntitySet1", "group", {"foo" : "bar"}, {"a" : "b"});
		oRequestor.request("PATCH", "EntitySet2", "group", {"bar" : "baz"}, {"c" : "d"});
		oRequestor.request("PATCH", "EntitySet3", "$auto", {"header" : "value"}, {"e" : "f"});

		TestUtils.deepContains(oRequestor.mBatchQueue, {
			"group" : [
				[/*change set!*/{
					method : "PATCH",
					url : "EntitySet1",
					headers : {
						"foo" : "bar"
					},
					body : {"a" : "b"}
				}, {
					method : "PATCH",
					url : "EntitySet2",
					headers : {
						"bar" : "baz"
					},
					body : {"c" : "d"}
				}]
			],
			"$auto" : [
				[/*change set!*/{
					method : "PATCH",
					url : "EntitySet3",
					headers : {
						"header" : "value"
					},
					body : {"e" : "f"}
				}]
			]
		});
	});

	//*********************************************************************************************
	QUnit.test("request(...): call with $batch url", function (assert) {
		var oBatchRequest = {
				body : "abcd",
				headers : {
					"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
					"MIME-Version" : "1.0"
				}
			},
			aBatchRequests = [{}],
			aExpectedResponses = [],
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined,
				{"sap-client" : "123"}),
			oResult = "abc",
			sResponseContentType = "multipart/mixed; boundary=foo",
			oJqXHRMock = createMock(assert, oResult, "OK", {
				"Content-Type" : sResponseContentType,
				"OData-Version" : "4.0",
				"X-CSRF-Token" : "abc123"
			});

		this.mock(_Batch).expects("serializeBatchRequest")
			.withExactArgs(sinon.match.same(aBatchRequests))
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

		return oRequestor.request("POST", "$batch", "$direct", undefined, aBatchRequests)
			.then(function (oPayload) {
				assert.strictEqual(aExpectedResponses, oPayload);
			});
	});

	//*****************************************************************************************
	QUnit.test("hasPendingChanges, cancelChanges and running batch requests", function (assert) {
		var oBatchMock = this.mock(_Batch),
			oBatchRequest1,
			oBatchRequest2,
			oBatchRequest3,
			oJQueryMock = this.mock(jQuery),
			aPromises = [],
			sServiceUrl = "/Service/",
			oRequestor = _Requestor.create(sServiceUrl, oModelInterface);

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
					.returns([{}]);

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

		assert.strictEqual(oRequestor.hasPendingChanges(), false);

		// add a GET request and submit the queue
		oRequestor.request("GET", "Products", "groupId");
		oBatchRequest1 = expectBatch();
		aPromises.push(oRequestor.submitBatch("groupId"));
		assert.strictEqual(oRequestor.hasPendingChanges(), false,
			"a running GET request is not a pending change");

		// add a PATCH request and submit the queue
		oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "foo"});
		oBatchRequest2 = expectBatch();
		aPromises.push(oRequestor.submitBatch("groupId").then(function () {
			// code under test
			assert.strictEqual(oRequestor.hasPendingChanges(), true,
				"the batch with the second PATCH is still running");
			resolveBatch(oBatchRequest3);
		}));

		// code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), true);
		assert.throws(function () {
			oRequestor.cancelChanges("groupId");
		}, new Error("Cannot cancel the changes for group 'groupId', "
			+ "the batch request is running"));
		oRequestor.cancelChanges("anotherGroupId"); // the other groups are not affected

		// while the batch with the first PATCH is still running, add another PATCH and submit
		oRequestor.request("PATCH", "Products('1')", "groupId", {}, {Name : "bar"});
		oBatchRequest3 = expectBatch();
		aPromises.push(oRequestor.submitBatch("groupId").then(function () {
			// code under test
			assert.strictEqual(oRequestor.hasPendingChanges(), false);
			oRequestor.cancelChanges("groupId");
		}));

		resolveBatch(oBatchRequest1);
		resolveBatch(oBatchRequest2);
		return Promise.all(aPromises);
	});

	//*****************************************************************************************
	QUnit.test("cancelChanges: various requests", function (assert) {
		var fnCancel1 = this.spy(),
			fnCancel2 = this.spy(),
			fnCancel3 = this.spy(),
			fnCancelPost = this.spy(),
			iCount = 1,
			oPostData = {},
			oPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined,
				{"sap-client" : "123"});

		function unexpected () {
			assert.ok(false);
		}

		function rejected (iOrder, oError) {
			assert.strictEqual(oError.canceled, true);
			assert.strictEqual(iCount, iOrder);
			iCount += 1;
		}

		assert.strictEqual(oRequestor.hasPendingChanges(), false);

		oPromise = Promise.all([
			oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "foo"},
					undefined, fnCancel1)
				.then(unexpected, rejected.bind(null, 3)),
			oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "bar"},
					undefined, fnCancel2)
				.then(unexpected, rejected.bind(null, 2)),
			oRequestor.request("GET", "Employees", "groupId"),
			oRequestor.request("POST", "ActionImport('42')", "groupId", {}, {foo : "bar"}),
			oRequestor.request("POST", "LeaveRequests('42')/name.space.Submit", "groupId", {},
				oPostData, undefined, fnCancelPost).then(unexpected, function (oError) {
					assert.strictEqual(oError.canceled, true);
					assert.strictEqual(oError.message, "Request canceled: " +
						"POST LeaveRequests('42')/name.space.Submit; group: groupId");
				}),
			oRequestor.request("PATCH", "Products('1')", "groupId", {}, {Name : "baz"},
					undefined, fnCancel3)
				.then(unexpected, rejected.bind(null, 1))
		]);

		// code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), true);

		this.spy(oRequestor, "cancelChangesByFilter");

		// code under test
		oRequestor.cancelChanges("groupId");

		sinon.assert.calledOnce(fnCancel1);
		sinon.assert.calledWithExactly(fnCancel1);
		sinon.assert.calledOnce(fnCancel2);
		sinon.assert.calledOnce(fnCancel3);
		sinon.assert.calledOnce(fnCancelPost);
		sinon.assert.calledWithExactly(oRequestor.cancelChangesByFilter, sinon.match.func,
			"groupId");

		// code under test
		assert.strictEqual(oRequestor.hasPendingChanges(), false);

		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [
				sinon.match({
					method : "POST",
					url : "ActionImport('42')"
				}),
				sinon.match({
					method : "GET",
					url : "Employees"
				})
			]).returns(Promise.resolve([{}, {}]));

		oRequestor.submitBatch("groupId");

		return oPromise;
	});

	//*****************************************************************************************
	QUnit.test("cancelChanges: only PATCH", function (assert) {
		var fnCancel = function () {},
			oPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface, undefined,
				{"sap-client" : "123"});

		function unexpected () {
			assert.ok(false);
		}

		function rejected (oError) {
			assert.strictEqual(oError.canceled, true);
		}

		oPromise = Promise.all([
			oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "foo"},
					undefined, fnCancel)
				.then(unexpected, rejected),
			oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "bar"},
					undefined, fnCancel)
				.then(unexpected, rejected),
			oRequestor.request("PATCH", "Products('1')", "groupId", {}, {Name : "baz"},
					undefined, fnCancel)
				.then(unexpected, rejected)
		]);

		this.mock(oRequestor).expects("request").never();

		// code under test
		oRequestor.cancelChanges("groupId");
		oRequestor.submitBatch("groupId");

		return oPromise;
	});

	//*****************************************************************************************
	QUnit.test("cancelChanges: unused group", function (assert) {
		_Requestor.create("/Service/", oModelInterface).cancelChanges("unusedGroupId");
	});

	//*****************************************************************************************
	QUnit.test("removePatch", function (assert) {
		var fnCancel = this.spy(),
			oPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oTestPromise;

		oPromise = oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "foo"},
			undefined, fnCancel);
		oTestPromise = oPromise.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.canceled, true);
			});

		// code under test
		oRequestor.removePatch(oPromise);

		sinon.assert.calledOnce(fnCancel);
		this.mock(oRequestor).expects("request").never();
		oRequestor.submitBatch("groupId");
		return oTestPromise;
	});

	//*****************************************************************************************
	QUnit.test("removePatch: various requests", function (assert) {
		var fnCancel = this.spy(),
			oPromise,
			aPromises,
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		function unexpected () {
			assert.ok(false);
		}

		function rejected(oError) {
			assert.strictEqual(oError.canceled, true);
			assert.strictEqual(oError.message,
				"Request canceled: PATCH Products('0'); group: groupId");
		}

		oPromise = oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "foo"},
			undefined, fnCancel);

		aPromises = [
			oPromise.then(unexpected, rejected),
			oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "bar"}),
			oRequestor.request("GET", "Employees", "groupId")
		];

		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [
				sinon.match({
					method : "PATCH",
					url : "Products('0')",
					body : {Name : "bar"}
				}),
				sinon.match({
					method : "GET",
					url : "Employees"
				})
			]).returns(Promise.resolve([
				{responseText : "{}"},
				{responseText : "{}"}
			]));

		// code under test
		oRequestor.removePatch(oPromise);
		oRequestor.submitBatch("groupId");

		sinon.assert.calledOnce(fnCancel);

		return Promise.all(aPromises);
	});

	//*****************************************************************************************
	QUnit.test("removePatch after submitBatch", function (assert) {
		var oPromise,
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oPromise = oRequestor.request("PATCH", "Products('0')", "groupId", {}, {Name : "bar"});

		this.mock(oRequestor).expects("request").withArgs("POST", "$batch")
			.returns(Promise.resolve([{}]));

		oRequestor.submitBatch("groupId");

		// code under test
		assert.throws(function () {
			oRequestor.removePatch(oPromise);
		}, new Error("Cannot reset the changes, the batch request is running"));
	});

	//*****************************************************************************************
	QUnit.test("removePost", function (assert) {
		var oBody = {},
			fnCancel1 = this.spy(),
			fnCancel2 = this.spy(),
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oTestPromise;

		this.spy(oRequestor, "cancelChangesByFilter");
		oTestPromise = Promise.all([
			oRequestor.request("POST", "Products", "groupId", {}, oBody, undefined, fnCancel1)
				.then(function () {
					assert.ok(false);
				}, function (oError) {
					assert.strictEqual(oError.canceled, true);
				}),
			oRequestor.request("POST", "Products", "groupId", {}, {Name : "bar"}, undefined,
				fnCancel2)
		]);

		// code under test
		oRequestor.removePost("groupId", oBody);

		assert.ok(oRequestor.cancelChangesByFilter.calledWithExactly(sinon.match.func, "groupId"));

		this.mock(oRequestor).expects("request")
			.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [
				sinon.match({
					method : "POST",
					url : "Products",
					body : {Name : "bar"}
				})
			]).returns(Promise.resolve([{}]));

		// code under test
		oRequestor.submitBatch("groupId");

		sinon.assert.calledOnce(fnCancel1);
		sinon.assert.notCalled(fnCancel2);
		return oTestPromise;
	});

	//*****************************************************************************************
	QUnit.test("removePost with only one POST", function (assert) {
		var oBody = {},
			fnCancel = this.spy(),
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oTestPromise;

		oTestPromise = oRequestor.request("POST", "Products", "groupId", {}, oBody,
				undefined, fnCancel)
			.then(function () {
					assert.ok(false);
				}, function (oError) {
					assert.strictEqual(oError.canceled, true);
				}
		);

		// code under test
		oRequestor.removePost("groupId", oBody);
		sinon.assert.calledOnce(fnCancel);

		this.mock(oRequestor).expects("request").never();
		oRequestor.submitBatch("groupId");
		return oTestPromise;
	});

	//*****************************************************************************************
	QUnit.test("removePost after submitBatch", function (assert) {
		var oPayload = {},
			oRequestor = _Requestor.create("/Service/", oModelInterface);

		oRequestor.request("POST", "Products", "groupId", {}, oPayload);

		this.mock(oRequestor).expects("request").withArgs("POST", "$batch")
			.returns(Promise.resolve([{}]));

		oRequestor.submitBatch("groupId");

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
	QUnit.test("submitBatch: unwrap single change", function (assert) {
		var oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestorMock = this.mock(oRequestor);

		oRequestor.request("POST", "Products", "groupId", {}, {Name : "bar"});
		oRequestorMock.expects("isChangeSetOptional").withExactArgs().returns(true);
		oRequestorMock.expects("request")
			.withExactArgs("POST", "$batch", undefined, {"Accept" : "multipart/mixed"}, [
				sinon.match({
					method : "POST",
					url : "Products",
					body : {Name : "bar"}
				})
			]).returns(Promise.resolve([{}]));

		// code under test
		return oRequestor.submitBatch("groupId");
	});

	//*****************************************************************************************
	QUnit.test("relocate", function (assert) {
		var oBody1 = {},
			oBody2 = {},
			fnCancel = this.spy(),
			oExpectedHeader = {
				"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
				"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true",
				"foo" : "bar"
			},
			oHeaders = {foo : "bar"},
			oCreatePromise1,
			oCreatePromise2,
			oError = new Error("Post failed"),
			oRequestor = _Requestor.create("/Service/", oModelInterface),
			oRequestorMock = this.mock(oRequestor),
			fnSubmit = this.spy();

		oCreatePromise1 = oRequestor.request("POST", "Employees", "$parked.$auto", oHeaders, oBody1,
			fnSubmit, fnCancel);
		oCreatePromise2 = oRequestor.request("POST", "Employees", "$parked.$auto", oHeaders, oBody2,
			fnSubmit, fnCancel);

		assert.throws(function () {
			// code under test
			oRequestor.relocate("$foo", oBody1, "$auto");
		}, new Error("Request not found in group '$foo'"));

		assert.throws(function () {
			// code under test
			oRequestor.relocate("$parked.$auto", {foo : "bar"}, "$auto");
		}, new Error("Request not found in group '$parked.$auto'"));

		oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", "$auto", oExpectedHeader, oBody2, fnSubmit,
				fnCancel)
			.returns(Promise.resolve());

		// code under test
		oRequestor.relocate("$parked.$auto", oBody2, "$auto");

		assert.strictEqual(oRequestor.mBatchQueue["$parked.$auto"][0].length, 1, "one left");
		assert.strictEqual(oRequestor.mBatchQueue["$parked.$auto"][0][0].body, oBody1);

		return oCreatePromise2.then(function () {
			oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", "$auto", oExpectedHeader, oBody1, fnSubmit,
					fnCancel)
				.returns(Promise.reject(oError));

			// code under test
			oRequestor.relocate("$parked.$auto", oBody1, "$auto");

			return oCreatePromise1.then(undefined, function (oError0) {
				assert.strictEqual(oError0, oError);
				assert.strictEqual(oRequestor.mBatchQueue["$parked.$auto"], undefined);
			});
		}, undefined);
	});

	//*****************************************************************************************
	QUnit.test("cleanPayload", function (assert) {
		var oUnchanged = {
				"foo" : "bar"
			},
			oPostData = {
				"foo" : "bar",
				"a@$ui5.b" : "c",
				"@$ui51" : "bar",
				"@$ui5.option" : "baz",
				"@$ui5.transient" : true
			},
			oChangedPostData = {
				"foo" : "bar",
				"@$ui51" : "bar",
				"a@$ui5.b" : "c"
			};

		assert.strictEqual(_Requestor.cleanPayload(undefined), undefined);
		assert.strictEqual(_Requestor.cleanPayload(oUnchanged), oUnchanged);

		this.spy(jQuery, "extend");

		assert.deepEqual(_Requestor.cleanPayload(oPostData), oChangedPostData);
		assert.strictEqual(oPostData["@$ui5.option"], "baz");
		assert.strictEqual(oPostData["@$ui5.transient"], true);

		sinon.assert.calledOnce(jQuery.extend);
	});

	//*****************************************************************************************
	QUnit.test("cleanBatch", function (assert) {
		var oBody1 = {},
			oBody2 = {
				"@$ui5.foo" : "bar"
			},
			oChangedBody2 = {},
			oRequestorMock = this.mock(_Requestor),
			aRequests = [[{body : oBody1}], {method : "FOO", body : oBody2}],
			aResult = [[{body : oBody1}], {method : "FOO", body : oChangedBody2}];

		oRequestorMock.expects("cleanPayload")
			.withExactArgs(sinon.match.same(oBody1)).returns(oBody1);
		oRequestorMock.expects("cleanPayload")
			.withExactArgs(sinon.match.same(oBody2)).returns(oChangedBody2);

		// code under test
		assert.strictEqual(_Requestor.cleanBatch(aRequests), aRequests);
		assert.deepEqual(aRequests, aResult);
	});

	//*********************************************************************************************
	QUnit.test("request: $cached as groupId", function (assert) {
		var oRequestor = _Requestor.create("/");

		assert.throws(function(){
			//code under test
			oRequestor.request("GET", "/FOO", "$cached");
		},  new Error("Unexpected request: GET /FOO"));
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
			var oRequestor = _Requestor.create("/~/");

			assert.strictEqual(
				oRequestor.buildQueryString("/Foo", oFixture.o, undefined, true), "?" + oFixture.s,
				oFixture.s);
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
	QUnit.test("fetchTypeForPath", function (assert) {
		var oPromise = {},
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oModelInterface).expects("fnFetchMetadata")
			.withExactArgs("/EMPLOYEES/EMPLOYEE_2_TEAM/").returns(oPromise);

		// code under test
		assert.strictEqual(oRequestor.fetchTypeForPath("/EMPLOYEES/EMPLOYEE_2_TEAM"), oPromise);
	});

	//*********************************************************************************************
	QUnit.test("fetchTypeForPath, bAsName=true", function (assert) {
		var oPromise = {},
			oRequestor = _Requestor.create("/", oModelInterface);

		this.mock(oModelInterface).expects("fnFetchMetadata")
			.withExactArgs("/EMPLOYEES/EMPLOYEE_2_TEAM/$Type").returns(oPromise);

		// code under test
		assert.strictEqual(oRequestor.fetchTypeForPath("/EMPLOYEES/EMPLOYEE_2_TEAM", true),
			oPromise);
	});

	//*********************************************************************************************
	[{
		iCallCount : 1,
		mHeaders : { "OData-Version" : "4.0" }
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
		mHeaders : { "OData-Version" : "foo" }
	}, {
		iCallCount : 2,
		sError : "value 'undefined' in response for /Foo('42')/Bar",
		mHeaders : {}
	}, {
		iCallCount : 2,
		sError : "'DataServiceVersion' header with value 'baz' in response for /Foo('42')/Bar",
		mHeaders : { "DataServiceVersion" : "baz" }
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
	if (TestUtils.isRealOData()) {
		QUnit.test("request(...)/submitBatch (realOData) success", function (assert) {
			var oRequestor = _Requestor.create(TestUtils.proxy(sServiceUrl), oModelInterface),
				sResourcePath = "TEAMS('TEAM_01')";

			function assertResult(oPayload) {
				delete oPayload["@odata.metadataEtag"];
				assert.deepEqual(oPayload, {
					"@odata.context" : "$metadata#TEAMS/$entity",
					"Team_Id" : "TEAM_01",
					Name : "Business Suite",
					MEMBER_COUNT : 2,
					MANAGER_ID : "3",
					BudgetCurrency : "USD",
					Budget : "555.55"
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
			var oRequestor = _Requestor.create(TestUtils.proxy(sServiceUrl), oModelInterface);

			oRequestor.request("GET", "TEAMS('TEAM_01')", "group").then(function (oResult) {
				delete oResult["@odata.metadataEtag"];
				assert.deepEqual(oResult, {
					"@odata.context" : "$metadata#TEAMS/$entity",
					"Team_Id" : "TEAM_01",
					Name : "Business Suite",
					MEMBER_COUNT : 2,
					MANAGER_ID : "3",
					BudgetCurrency : "USD",
					Budget : "555.55"
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
			});

			return oRequestor.submitBatch("group").then(function (oResult) {
				assert.strictEqual(oResult, undefined);
			});
		});

		//*****************************************************************************************
		QUnit.test("request(ProductList)/submitBatch (realOData) patch", function (assert) {
			var oBody = {Name : "modified by QUnit test"},
				oRequestor = _Requestor.create(TestUtils.proxy(sSampleServiceUrl), oModelInterface),
				sResourcePath = "ProductList('HT-1001')";

			return Promise.all([
					oRequestor.request("PATCH", sResourcePath, "group", {"If-Match" : "*"}, oBody)
						.then(function (oResult) {
							TestUtils.deepContains(oResult, oBody);
						}),
					oRequestor.submitBatch("group")
				]);
		});

		//*****************************************************************************************
		QUnit.test("submitBatch (real OData): error in change set", function (assert) {
			var oCommonError,
				oRequestor = _Requestor.create(TestUtils.proxy(sSampleServiceUrl), oModelInterface);

			function onError(oError) {
				if (oCommonError) {
					assert.strictEqual(oError, oCommonError);
				} else {
					oCommonError = oError;
				}
			}

			return Promise.all([
				oRequestor.request("PATCH", "ProductList('HT-1001')", "group", {"If-Match" : "*"},
						{Name : "foo"})
					.then(undefined, onError),
				oRequestor.request("POST", "Unknown", "group", undefined, {})
					.then(undefined, onError),
				oRequestor.request("PATCH", "ProductList('HT-1001')", "group", {"If-Match" : "*"},
						{Name : "bar"})
					.then(undefined, onError),
				oRequestor.request("GET", "SalesOrderList?$skip=0&$top=10", "group")
					.then(undefined, function (oError) {
						assert.strictEqual(oError.message,
							"HTTP request was not processed because the previous request failed");
					}),
				oRequestor.submitBatch("group")
			]);
		});
	}

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: Action", function (assert) {
		var oOperationMetadata = {
				$kind : "Action",
				"$Parameter" : [{
					"$Name" : "Foo"
				}, {
					"$Name" : "ID"
				}]
			},
			mParameters = {"ID" : "1", "Foo" : 42, "n/a" : NaN},
			oRequestor = _Requestor.create("/");

		// code under test
		assert.strictEqual(
			oRequestor.getPathAndAddQueryOptions("/OperationImport(...)", oOperationMetadata,
				mParameters),
			"OperationImport");

		assert.deepEqual(mParameters, {"ID" : "1", "Foo" : 42}, "n/a is removed");

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
					$IsCollection : true
				}]
			},
			oRequestor = _Requestor.create("/"),
			oRequestorMock = this.mock(oRequestor);

		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs("bãr'1", oOperationMetadata.$Parameter[0]).returns("'bãr''1'");
		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs(42,  oOperationMetadata.$Parameter[1]).returns("42");

		assert.strictEqual(
			// code under test
			oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata,
				{"føø" : "bãr'1", "p2" : 42, "n/a" : NaN}),
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
				$Parameter : [{$Name : "foo", $IsCollection : true}]
			},
			oRequestor = _Requestor.create("/");

		this.mock(oRequestor).expects("formatPropertyAsLiteral").never();

		assert.throws(function () {
			// code under test
			oRequestor.getPathAndAddQueryOptions("/some.Function(...)", oOperationMetadata,
				{"foo" : [42]});
		}, new Error("Unsupported collection-valued parameter: foo"));
	});
	//TODO what about actions & collections?

	//*****************************************************************************************
	QUnit.test("isActionBodyOptional", function (assert) {
		var oRequestor = _Requestor.create("/");

		assert.strictEqual(oRequestor.isActionBodyOptional(), false);
	});
});
// TODO: continue-on-error? -> flag on model
// TODO: cancelChanges: what about existing GET requests in deferred queue (delete or not)?
// TODO: tests for doConvertSystemQueryOptions missing. Only tested indirectly
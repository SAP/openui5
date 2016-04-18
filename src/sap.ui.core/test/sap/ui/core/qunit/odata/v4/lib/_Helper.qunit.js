/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI"
], function (jQuery, _Helper, TestUtils, URI) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Helper", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	[{
		message : "CSRF token validation failed",
		"response" : {
			"headers" : {
				"Content-Type" : "text/plain;charset=utf-8",
				"x-csrf-token" : "Required"
			},
			"responseText" : "CSRF token validation failed",
			"status" : 403,
			"statusText" : "Forbidden"
		}
	}, {
		message : "401 Unauthorized",
		"response" : {
			"headers" : {
				"Content-Type" : "text/html;charset=utf-8"
			},
			"responseText" : "<html>...</html>",
			"status" : 401,
			"statusText" : "Unauthorized"
		}
	}, {
		// OData V4 error response body as JSON
		// "The error response MUST be a single JSON object. This object MUST have a
		// single name/value pair named error. The value must be a JSON object."
		body : {
			"error" : {
				"code" : "/IWBEP/CM_V4_RUNTIME/021",
				"message" :
					// Note: "a human-readable, language-dependent representation of the error"
					"The state of the resource (entity) was already changed (If-Match)",
				"@Common.ExceptionCategory" : "Client_Error",
				"@Common.Application" : {
					"ComponentId" : "OPU-BSE-BEP",
					"ServiceRepository" : "DEFAULT",
					"ServiceId" : "/IWBEP/TEA_BUSI",
					"ServiceVersion" : "0001"
				},
				"@Common.TransactionId" : "5617D1F235DE73F0E10000000A60180C",
				"@Common.Timestamp" : "20151009142600.103179",
				"@Common.ErrorResolution" : {
					"Analysis" : "Run transaction /IWFND/ERROR_LOG [...]",
					"Note" : "See SAP Note 1797736 for error analysis "
						+ "(https://service.sap.com/sap/support/notes/1797736)"
				}
			}
		},
		isConcurrentModification : true,
		message : "The state of the resource (entity) was already changed (If-Match)",
		"response" : {
			"headers" : {
				"Content-Type" : "application/json; odata.metadata=minimal;charset=utf-8"
			},
//			"responseText" : JSON.stringify(this.body)
			"status" : 412,
			"statusText" : "Precondition Failed"
		}
	}, {
		message : "999 Invalid JSON",
		"response" : {
			"headers" : {
				"Content-Type" : "application/json"
			},
			"responseText" : "<html>...</html>",
			"status" : 999,
			"statusText" : "Invalid JSON"
		},
		warning : sinon.match(/SyntaxError/)
	}, {
		message : "403 Forbidden",
		"response" : {
			"headers" : {
				"Content-Type" : "text/plain-not-quite-right"
			},
			"status" : 403,
			"statusText" : "Forbidden",
			"responseText" : "ignore this!"
		}
	}, {
		message : "Network error",
		"response" : {
			"headers" : {},
			"status" : 0,
			"statusText" : "error"
		}
	}, {
		message : "404 Not Found",
		"response" : {
			"headers" : {},
			"status" : 404,
			"statusText" : "Not Found"
		}
	}].forEach(function (oFixture) {
		QUnit.test("createError: " + oFixture.message, function (assert) {
			var oError,
				jqXHR = {
					getResponseHeader : function (sName) {
						return oFixture.response.headers[sName];
					},
					"status" : oFixture.response.status,
					"statusText" : oFixture.response.statusText,
					"responseText" : oFixture.response.responseText || JSON.stringify(oFixture.body)
				};

			if (oFixture.warning) {
				this.oLogMock.expects("warning").withExactArgs(oFixture.warning,
					oFixture.response.responseText, "sap.ui.model.odata.v4.lib._Helper");
			}

			oError = _Helper.createError(jqXHR);

			assert.ok(oError instanceof Error);
			assert.deepEqual(oError.error, oFixture.body && oFixture.body.error);
			assert.strictEqual(oError.isConcurrentModification, oFixture.isConcurrentModification);
			assert.strictEqual(oError.message, oFixture.message);
			assert.strictEqual(oError.status, oFixture.response.status);
			assert.strictEqual(oError.statusText, oFixture.response.statusText);
		});
	});

	//*********************************************************************************************
	QUnit.test("encode", function (assert) {
		var sUnchanged = "foo$,/:?@();";

		assert.strictEqual(_Helper.encode(sUnchanged, false), sUnchanged);
		assert.strictEqual(_Helper.encode(sUnchanged, true), sUnchanged);

		assert.strictEqual(_Helper.encode("€_&_=_#_+", false), "%E2%82%AC_%26_=_%23_%2B");
		assert.strictEqual(_Helper.encode("€_&_=_#_+", true), "%E2%82%AC_%26_%3D_%23_%2B");
	});

	//*********************************************************************************************
	QUnit.test("encodePair", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("encode").withExactArgs("key", true).returns("~key~");
		oHelperMock.expects("encode").withExactArgs("value", false).returns("~value~");

		sEncoded = _Helper.encodePair("key", "value");
		assert.strictEqual(sEncoded, "~key~=~value~");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: no query", function (assert) {
		assert.strictEqual(_Helper.buildQuery(), "");
		assert.strictEqual(_Helper.buildQuery({}), "");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: query", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("encodePair").withExactArgs("a", "b").returns("a=b");
		oHelperMock.expects("encodePair").withExactArgs("c", "d").returns("c=d");
		oHelperMock.expects("encodePair").withExactArgs("c", "e").returns("c=e");

		sEncoded = _Helper.buildQuery({a : "b", c : ["d", "e"]});
		assert.strictEqual(sEncoded, "?a=b&c=d&c=e");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery and decoding via URI.js", function (assert) {
		var sComplexString = "",
			i,
			mParameters = {},
			sUri;

		for (i = 32; i < 127; i++) {
			sComplexString = sComplexString + String.fromCharCode(i);
		}

		sUri = "/" + _Helper.buildQuery({foo : sComplexString});

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true).foo, sComplexString);

		mParameters[sComplexString] = "foo";
		sUri = "/" + _Helper.buildQuery(mParameters);

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true)[sComplexString], "foo");
	});

	//*********************************************************************************************
	QUnit.test("isSafeInteger", function (assert) {
		function test(sNumber, bValue) {
			assert.strictEqual(_Helper.isSafeInteger(sNumber), bValue, sNumber);
		}
		test(0, true);
		test((Math.pow(2, 53) - 1), true);
		test(Math.pow(2, 53), false);
		test(1 - Math.pow(2, 53), true);
		test(-Math.pow(2, 53), false);
		test("foo", false);
		test(3.14, false);
		test(null, false);
		test(undefined, false);
		test(NaN, false);
		test(Infinity, false);
		test(-Infinity, false);
	});

	//*********************************************************************************************
	// t: the tested type
	// v: the value to format
	// e: the expected result
	[
		{t : "Edm.Binary", v : "1qkYNh/P5uvZ0zA+siScD=", e : "binary'1qkYNh/P5uvZ0zA+siScD='"},
		{t : "Edm.Boolean", v : true, e : "true"},
		{t : "Edm.Byte", v : 255, e : "255"},
		{t : "Edm.Date", v : "2016-01-19", e : "2016-01-19"},
		{t : "Edm.DateTimeOffset", v : "2016-01-13T14:08:31Z", e : "2016-01-13T14:08:31Z"},
		{t : "Edm.Decimal", v : "-255.55", e : "-255.55"},
		{t : "Edm.Double", v : 3.14, e : "3.14"},
		{t : "Edm.Double", v : "INF", e : "INF"},
		{t : "Edm.Duration", v : "P1DT0H0M0S",	e : "duration'P1DT0H0M0S'"},
		{t : "Edm.Guid", v : "936DA01F-9ABD-4D9D-80C7-02AF85C822A8",
			e : "936DA01F-9ABD-4D9D-80C7-02AF85C822A8"},
		{t : "Edm.Int16", v : -32768, e : "-32768"},
		{t : "Edm.Int32", v : 2147483647, e : "2147483647"},
		{t : "Edm.Int64", v : "12345678901234568", e : "12345678901234568"},
		{t : "Edm.SByte", v : -128, e : "-128"},
		// Note: the internal representation of NaN/Infinity/-Infinity in the ODataModel
		// is "NaN", "INF" and "-INF".
		// That is how it comes from the server and it is not possible to change the model values
		// to the JS representation Infinity,-Infinity or NaN
		{t : "Edm.Single", v : "NaN", e : "NaN"},
		{t : "Edm.Single", v : "-INF", e : "-INF"},
		{t : "Edm.String", v : "foo", e : "'foo'"},
		{t : "Edm.String", v : "string with 'quote'", e : "'string with ''quote'''"},
		{t : "Edm.String", v : null, e : "null"},
		{t : "Edm.TimeOfDay", v : "18:59:59.999", e : "18:59:59.999"}
	].forEach(function (oFixture) {
		QUnit.test("formatLiteral: " + oFixture.t + " " +  oFixture.v, function (assert) {
			assert.strictEqual(
				_Helper.formatLiteral(oFixture.v, oFixture.t), oFixture.e);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatLiteral: error case", function (assert) {
		assert.throws(
			function () { _Helper.formatLiteral("foo", "Edm.bar"); },
			new Error("Unsupported type: Edm.bar")
		);
	});

	//*********************************************************************************************
	// Integration Tests with real backend
	if (TestUtils.isRealOData()) {
		QUnit.test("Integration test for formatLiteral", function (assert) {
			var done = assert.async(),
			sResolvedServiceUrl = TestUtils.proxy(
				"/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/");

			jQuery.ajax(sResolvedServiceUrl + "BusinessPartnerList?"
				+ "$filter=CompanyName eq + " + _Helper.formatLiteral("Becker Berlin", "Edm.String")
				, { method : "GET"}
			).then(function (oData, sTextStatus, jqXHR) {
				assert.strictEqual(oData.value[0].CompanyName, "Becker Berlin");
				done();
			});
		});
	}
});
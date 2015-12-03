/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI"
], function (Helper, TestUtils, URI) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0, no-multi-str: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Helper", {
		beforeEach : function () {
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
		// OData v4 error response body as JSON
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

			oError = Helper.createError(jqXHR);

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
		var sUnchanged = "foo$,/:?@()";

		assert.strictEqual(Helper.encode(sUnchanged, false), sUnchanged);
		assert.strictEqual(Helper.encode(sUnchanged, true), sUnchanged);

		assert.strictEqual(Helper.encode("€_&_=_#_+_;", false), "%E2%82%AC_%26_=_%23_%2B_%3B");
		assert.strictEqual(Helper.encode("€_&_=_#_+_;", true), "%E2%82%AC_%26_%3D_%23_%2B_%3B");
	});

	//*********************************************************************************************
	QUnit.test("encodePair", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(Helper);

		oHelperMock.expects("encode").withExactArgs("key", true).returns("~key~");
		oHelperMock.expects("encode").withExactArgs("value", false).returns("~value~");

		sEncoded = Helper.encodePair("key", "value");
		assert.strictEqual(sEncoded, "~key~=~value~");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: no query", function (assert) {
		assert.strictEqual(Helper.buildQuery(), "");
		assert.strictEqual(Helper.buildQuery({}), "");
	});

	//*********************************************************************************************
	QUnit.test("buildQuery: query", function (assert) {
		var sEncoded,
			oHelperMock = this.mock(Helper);

		oHelperMock.expects("encodePair").withExactArgs("a", "b").returns("a=b");
		oHelperMock.expects("encodePair").withExactArgs("c", "d").returns("c=d");
		oHelperMock.expects("encodePair").withExactArgs("c", "e").returns("c=e");

		sEncoded = Helper.buildQuery({a : "b", c: ["d", "e"]});
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

		sUri = "/" + Helper.buildQuery({foo: sComplexString});

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true).foo, sComplexString);

		mParameters[sComplexString] = "foo";
		sUri = "/" + Helper.buildQuery(mParameters);

		// decode via URI.js
		assert.strictEqual(new URI(sUri).search(true)[sComplexString], "foo");
	});

	//*********************************************************************************************
	[{
		message: "query parts without headers",
		requests: [
			{
				method: "GET",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')"
			}, {
				method: "GET",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2')"
			}
		],
		body: "--batch_123456\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1') HTTP/1.1\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_123456\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2') HTTP/1.1\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_123456--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_123456",
		"MIME-Version" : "1.0"
	}, {
		message: "query parts with headers",
		requests: [
			{
				method: "GET",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')",
				headers: {
					foo: "bar1",
					abc: "123"
				}
			}, {
				method: "GET",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2')",
				headers: {
					foo: "bar2",
					abc: "456"
				}
			}
		],
		body: "--batch_123456\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1') HTTP/1.1\r\n" +
			"foo:bar1\r\n" +
			"abc:123\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_123456\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2') HTTP/1.1\r\n" +
			"foo:bar2\r\n" +
			"abc:456\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_123456--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_123456",
		"MIME-Version" : "1.0"
	}].forEach(function (oFixture) {
		QUnit.test("serializeBatchRequest: " + oFixture.message, function (assert) {
			var oBatchRequest;

			this.oSandbox.mock(jQuery.sap).expects("uid").returns("batch_123456");

			oBatchRequest = Helper.serializeBatchRequest(oFixture.requests);

			assert.strictEqual(oBatchRequest.body, oFixture.body);
			assert.strictEqual(oBatchRequest["Content-Type"], oFixture["Content-Type"]);
			assert.strictEqual(oBatchRequest["MIME-Version"], oFixture["MIME-Version"]);
		});
	});

	//*********************************************************************************************
	QUnit[TestUtils.isRealOData() ? "test" : "skip"]("Multipart Integration Test: for query parts",
		function (assert) {
			var oBatchRequestBody,
				done = assert.async(),
				sServiceUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/",
				sResolvedServiceUrl = TestUtils.proxy(sServiceUrl);


			oBatchRequestBody = Helper.serializeBatchRequest([
				{
					method : "GET",
					url : sServiceUrl + "EMPLOYEES",
					headers : {
						Accept: "application/json"
					}
				},
				{
					method : "GET",
					url : sServiceUrl + "Departments",
					headers : {
						Accept: "application/json"
					}
				}
			]);

			jQuery.ajax(sResolvedServiceUrl, {
				method: "HEAD",
				headers : {
					"X-CSRF-Token" : "Fetch"
				}
			}).then(function (oData, sTextStatus, jqXHR) {
				var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
				jQuery.ajax(sResolvedServiceUrl + '$batch', {
					method: "POST",
					headers : {
						"Content-Type" : oBatchRequestBody["Content-Type"],
						"X-CSRF-Token" : sCsrfToken,
						// FIX4MASTER: remove sap-rfcswitch
						"sap-rfcswitch" : "X",
						"MIME-Version" : oBatchRequestBody["MIME-Version"]
					},
					data : oBatchRequestBody.body
				}).then(function (oData, sTextStatus, jqXHR) {
					assert.strictEqual(jqXHR.status, 200);
					done();
				});
			}, function (jqXHR, sTextStatus, sErrorMessage) {
				assert.ok(false, sErrorMessage);
				done();
			});
		}
	);
});

// TODO: refactoring about private and real public methods
// TODO: add tests for error handling?
// TODO: Gibt es eigentlich irgendein Encoding/Escaping zu beachten?
// TODO: TCH comment 1305194:PS10:"the header fields may encode non-US-ASCII header text as per RFC 2047" [Page 18]
// TODO: TCH comment 1305194:PS10: Mir ist die Semantik davon nicht klar. Und hier steht nirgendwo was von "UTF-8", aber das verwenden wir wohl implizit mit unseren JS-Strings. Siehe auch meine Frage in serializeHeaders().
// TODO: TCH comment 1305194:PS10: Brauchen wir hier einen "charset=UTF-8"-Zusatz? "The default character set, which must be assumed in the absence of a charset parameter, is US-ASCII."

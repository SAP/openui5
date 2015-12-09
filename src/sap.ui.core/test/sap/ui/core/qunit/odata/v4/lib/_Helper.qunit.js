/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI"
], function (Helper, TestUtils, URI) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0 */
	"use strict";

	var oEmployeesBody = {
			"@odata.context" : "$metadata#EMPLOYEES",
			"value" : [{
				"@odata.etag" : "W/\"19770724000000.0000000\"",
				"ID" : "1",
				"Name" : "Walter\"s Win's",
				"AGE" : 52,
				"ENTRYDATE" : "1977-07-24",
				"MANAGER_ID" : "",
				"ROOM_ID" : "1",
				"TEAM_ID" : "TEAM_01",
				"Is_Manager" : false,
				"LAST_MODIFIED_AT" : "1977-07-24T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69124",
						"CITYNAME" : "Heidelberg"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 5000.00,
					"BASIC_SALARY_CURR" : "EUR",
					"YEARLY_BONUS_AMOUNT" : 5000.000,
					"BONUS_CURR" : "KWD"
				}
			}, {
				"@odata.etag" : "W/\"20030701000000.0000000\"",
				"ID" : "2",
				"Name" : "Frederic Fall",
				"AGE" : 32,
				"ENTRYDATE" : "2003-07-01",
				"MANAGER_ID" : "2",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_03",
				"Is_Manager" : true,
				"LAST_MODIFIED_AT" : "2003-07-01T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 5100.33,
					"BASIC_SALARY_CURR" : "EUR",
					"YEARLY_BONUS_AMOUNT" : 10000.00,
					"BONUS_CURR" : "EUR"
				}
			}, {
				"@odata.etag" : "W/\"19770724000000.0000000\"",
				"ID" : "3",
				"Name" : "Jonathan Smith",
				"AGE" : 56,
				"ENTRYDATE" : "1977-07-24",
				"MANAGER_ID" : "1",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_01",
				"Is_Manager" : true,
				"LAST_MODIFIED_AT" : "1977-07-24T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 5100.33,
					"BASIC_SALARY_CURR" : "EUR",
					"YEARLY_BONUS_AMOUNT" : 10000.00,
					"BONUS_CURR" : "EUR"
				}
			}, {
				"@odata.etag" : "W/\"20040912000000.0000000\"",
				"ID" : "4",
				"Name" : "Peter Burke",
				"AGE" : 39,
				"ENTRYDATE" : "2004-09-12",
				"MANAGER_ID" : "3",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_02",
				"Is_Manager" : false,
				"LAST_MODIFIED_AT" : "2004-09-12T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
					"BASIC_SALARY_CURR" : "GBP",
					"YEARLY_BONUS_AMOUNT" : 15000.00,
					"BONUS_CURR" : "USD"
				}
			}, {
				"@odata.etag" : "W/\"20010201000000.0000000\"",
				"ID" : "5",
				"Name" : "John Field",
				"AGE" : 42,
				"ENTRYDATE" : "2001-02-01",
				"MANAGER_ID" : "3",
				"ROOM_ID" : "3",
				"TEAM_ID" : "TEAM_02",
				"Is_Manager" : true,
				"LAST_MODIFIED_AT" : "2001-02-01T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
					"BASIC_SALARY_CURR" : "GBP",
					"YEARLY_BONUS_AMOUNT" : 15000.00,
					"BONUS_CURR" : "USD"
				}
			}, {
				"@odata.etag" : "W/\"20101201000000.0000000\"",
				"ID" : "6",
				"Name" : "Susan Bay",
				"AGE" : 29,
				"ENTRYDATE" : "2010-12-01",
				"MANAGER_ID" : "1",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_03",
				"Is_Manager" : false,
				"LAST_MODIFIED_AT" : "2010-12-01T00:00:00Z",
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69190",
						"CITYNAME" : "Walldorf"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 2689.44,
					"BASIC_SALARY_CURR" : "GBP",
					"YEARLY_BONUS_AMOUNT" : 15000.00,
					"BONUS_CURR" : "USD"
				}
			}]
		},
		oDepartmentsBody = {
			"@odata.context" : "$metadata#Departments",
			"value" : [{
				"Sector" : "Consulting",
				"ID" : "1",
				"Name" : "Business Suite Consulting",
				"MemberCount" : 100,
				"ManagerID" : "3"
			}, {
				"Sector" : "Consulting",
				"ID" : "2002",
				"Name" : "BASIS Consulting",
				"MemberCount" : 200,
				"ManagerID" : "4"
			}, {
				"Sector" : "Financials",
				"ID" : "1001",
				"Name" : "Business Suite",
				"MemberCount" : 100,
				"ManagerID" : "5"
			}]
		},
		oNewEmployeeBody = {
			"@odata.context" : "$metadata#EMPLOYEES",
			"ID" : "7",
			"Name" : "Egon",
			"AGE" : 17,
			"ENTRYDATE" : "2015-10-01",
			"MANAGER_ID" : "",
			"ROOM_ID" : "",
			"TEAM_ID" : "",
			"Is_Manager" : false,
			"LOCATION" : {
				"COUNTRY" : "",
				"City" : {
					"POSTALCODE" : "",
					"CITYNAME" : ""
				}
			},
			"SALARY" : {
				"MONTHLY_BASIC_SALARY_AMOUNT" : 0.00,
				"BASIC_SALARY_CURR" : "",
				"YEARLY_BONUS_AMOUNT" : 0.00,
				"BONUS_CURR" : ""
			}
		},		sServiceUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/";

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
	[{// serialization
		testTitle: "query parts without headers",
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
		testTitle: "query parts with headers",
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
		QUnit.test("serializeBatchRequest: " + oFixture.testTitle, function (assert) {
			var oBatchRequest;

			this.oSandbox.mock(jQuery.sap).expects("uid").returns("batch_123456");

			oBatchRequest = Helper.serializeBatchRequest(oFixture.requests);

			assert.strictEqual(oBatchRequest.body, oFixture.body);
			assert.strictEqual(oBatchRequest["Content-Type"], oFixture["Content-Type"]);
			assert.strictEqual(oBatchRequest["MIME-Version"], oFixture["MIME-Version"]);
		});
	});

	//*********************************************************************************************
	// deserialization
	[{
		testTitle: "batch parts with preamble and epilogue",
		contentType: "multipart/mixed; boundary=batch_123456",
		body: "this is a preamble for the batch request\r\n\
--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 4711\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 9\r\n\
odata-version: 4.0\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 11\r\n\
odata-version: 4.0\r\n\
header-with-colonValue: http://host:8080/sap/opu/MyService\r\n\
header-with-space-before-colon : Headername with space before colon\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_123456--\r\n\
this is a batch request epilogue",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "9",
				"odata-version" : "4.0"
			},
			responseText : "{\"foo\":\"bar\"}"
		}, {
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "11",
				"odata-version" : "4.0",
				"header-with-colonValue" : "http://host:8080/sap/opu/MyService",
				"header-with-space-before-colon" : "Headername with space before colon"
			},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "batch parts without headers",
		contentType: 'multipart/mixed; boundary="batch_1 23456"',
		body: "--batch_1 23456\r\n\
Content-Type: application/http\r\n\
Content-Length: 4711\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_1 23456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_1 23456--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo\":\"bar\"}"
		}, {
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "batch boundary with special characters",
		contentType: 'multipart/mixed; myboundary="invalid"; boundary="batch_123456\'()+_,-./:=?"',
		body: "--batch_123456\'()+_,-./:=? \r\n\
Content-Type: application/http\r\n\
Content-Length: 4711\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_123456\'()+_,-./:=?  \r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_123456\'()+_,-./:=?-- \r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo\":\"bar\"}"
		}, {
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "multiple Content-Type parameters separated with space",
		contentType: 'multipart/mixed; boundary=batch_123456 ; foo=bar',
		body: "--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_123456--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "multiple Content-Type parameters separated w/o space",
		contentType: 'multipart/mixed; boundary=batch_123456;foo=bar',
		body: "--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_123456--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "Content-Type with charset parameter lowercase",
		contentType: 'multipart/mixed; boundary=batch_123456;foo=bar',
		body: "--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=utf-8\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_123456--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {"Content-Type" : "application/json;odata.metadata=minimal;charset=utf-8"},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "Content-Type with charset parameter uppercase + space + following parameter",
		contentType: 'multipart/mixed; boundary=batch_123456;foo=bar',
		body: "--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-8 ;foo=bar\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_123456--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal;charset=UTF-8 ;foo=bar"
			},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "Content-Type text/plain with only spaces in response body",
		contentType: 'multipart/mixed; boundary=batch_123456',
		body: "--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: text/plain\r\n\
\r\n\
  \r\n\
--batch_123456--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "text/plain"
			},
			responseText : "  "
		}]
	}].forEach(function (oFixture) {
		QUnit.test("deserializeBatchResponse: " + oFixture.testTitle, function (assert) {
			var aResponses = Helper.deserializeBatchResponse(oFixture.contentType, oFixture.body);
			assert.deepEqual(aResponses, oFixture.expectedResponses);
		});
	});

	//*********************************************************************************************
	QUnit.test("deserializeBatchResponse: detect unsupported charset: ", function (assert) {
		var sBody = "--batch_123456\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-16 ;foo=bar \r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_123456--\r\n";

		assert.throws(function () {
			Helper.deserializeBatchResponse("multipart/mixed; boundary=batch_123456", sBody);
		}, new Error('Unsupported "Content-Type" charset: UTF-16'));
	});

	//*********************************************************************************************
	// Integration Tests with real backend
	if (TestUtils.isRealOData()) {
		// integration tests serialization/deserialization
		[{  testTitle: "two get request for employees and departments",
			batchRequests: [{
					method : "GET",
					url : sServiceUrl + "EMPLOYEES",
					headers : { "Accept": "application/json" }
				}, {
					method : "GET",
					url : sServiceUrl + "Departments",
					headers : {"Accept": "application/json"}
			}],
			expectedResponses : [{
					status: 200,
					statusText: "OK",
					headers: {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "2652",
						"odata-version" : "4.0"
					},
					responseText : oEmployeesBody
				}, {
					status: 200,
					statusText: "OK",
					headers: {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "344",
						"odata-version" : "4.0"
					},
					responseText :  oDepartmentsBody
			}]
		},
		{   testTitle : "get, delete and post request",
			batchRequests: [{
					method : "GET",
					url : sServiceUrl + "EMPLOYEES",
					headers : { "Accept": "application/json"}
				}, {
					method : "DELETE",
					url : sServiceUrl + "EMPLOYEES('1')",
					headers : {
						"Accept": "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					}
				}, {
					method : "POST",
					url : sServiceUrl + "EMPLOYEES",
					headers : {
						"Accept": "application/json",
						"Content-Type": "application/json;charset=UTF-8"
					},
					body : '{"ENTRYDATE":"2015-10-01", "Name":"Egon", "AGE":17}'
			}],
			expectedResponses : [{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"Content-Length" : "2652",
						"odata-version" : "4.0"
					},
					responseText : oEmployeesBody
				}, {
					status : 204,
					statusText : "No Content",
					headers : {
						"Content-Length" : "0",
						"odata-version" : "4.0"
					},
					responseText : ""
				}, {
					status : 201,
					statusText : "Created",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"odata-version" : "4.0"
					},
					responseText : oNewEmployeeBody
			}]
		}].forEach(function (oFixture, i) {
			QUnit.test("Multipart Integration Test: " + oFixture.testTitle,
				function (assert) {
					var oBatchRequestContent,
						done = assert.async();

					oBatchRequestContent = Helper.serializeBatchRequest(oFixture.batchRequests);

					jQuery.ajax(TestUtils.proxy(sServiceUrl), {
						method: "HEAD",
						headers : {
							"X-CSRF-Token" : "Fetch"
						}
					}).then(function (oData, sTextStatus, jqXHR) {
						var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
						jQuery.ajax(TestUtils.proxy(sServiceUrl) + '$batch', {
							method: "POST",
							headers : {
								"Content-Type" : oBatchRequestContent["Content-Type"],
								"MIME-Version" : oBatchRequestContent["MIME-Version"],
								"X-CSRF-Token" : sCsrfToken,
								// FIX4MASTER: remove sap-rfcswitch
								"sap-rfcswitch" : "X"
							},
							data : oBatchRequestContent.body
						}).then(function (oData, sTextStatus, jqXHR) {
							var i,
								aResponses;

							assert.strictEqual(jqXHR.status, 200);
							aResponses = Helper.deserializeBatchResponse(
									jqXHR.getResponseHeader("Content-Type"), oData);

							for (i = 0; i < aResponses.length; i++) {
								if (aResponses[i].responseText) {
									aResponses[i].responseText =
										JSON.parse(aResponses[i].responseText);
								}
							}

							TestUtils.deepContains(aResponses, oFixture.expectedResponses);
							done();
						});
					}, function (jqXHR, sTextStatus, sErrorMessage) {
						assert.ok(false, sErrorMessage);
						done();
					});
				}
			);
		});

		// integration tests regarding error handling
		QUnit.test("Multipart Integration Test: response error handling",
			function (assert) {
				var oBatchRequestContent,
					done = assert.async(),
					sResolvedServiceUrl = TestUtils.proxy(sServiceUrl),
					aBatchRequests = [{
							method : "GET",
							url : sServiceUrl + "EMPLOYEES('9')",
							headers : { "Accept": "application/json" }
					}];

				oBatchRequestContent = Helper.serializeBatchRequest(aBatchRequests);

				jQuery.ajax(sResolvedServiceUrl, {
					method : "HEAD",
					headers : {
						"X-CSRF-Token" : "Fetch"
					}
				}).then(function (oData, sTextStatus, jqXHR) {
					var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
					jQuery.ajax(sResolvedServiceUrl + '$batch', {
						method: "POST",
						headers : {
							"Content-Type" : oBatchRequestContent["Content-Type"],
							"MIME-Version" : oBatchRequestContent["MIME-Version"],
							"X-CSRF-Token" : sCsrfToken,
							// FIX4MASTER: remove sap-rfcswitch
							"sap-rfcswitch" : "X"
						},
						data : oBatchRequestContent.body
					}).then(function (oData, sTextStatus, jqXHR) {
						var aResponses, oResponse;

						assert.strictEqual(jqXHR.status, 200);
						aResponses = Helper.deserializeBatchResponse(
							jqXHR.getResponseHeader("Content-Type"), oData);

						assert.strictEqual(aResponses.length, 1);
						oResponse = aResponses[0];

						assert.strictEqual(oResponse.status, 404);
						assert.strictEqual(oResponse.statusText, "Not Found");
						assert.ok(oResponse.headers["content-language"]);
						done();
					});
				}, function (jqXHR, sTextStatus, sErrorMessage) {
					assert.ok(false, sErrorMessage);
					done();
				});
			}
		);
	}
});

// TODO: refactoring about private and real public methods
// TODO: add tests for error handling in serialization?
// TODO: add test for error handling in deserialization, e.g. missing "boundary=" etc.
//     reuse _Helper.createError() for error parsing

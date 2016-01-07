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
		},
		sServiceUrl = "/sap/opu/local_v4/IWBEP/TEA_BUSI/";

	function parseResponses(aResponses) {
		var i, oResponse;
		for (i = 0; i < aResponses.length; i++) {
			oResponse = aResponses[i];
			if (Array.isArray(oResponse)) {
				parseResponses(oResponse);
			} else if (aResponses[i].responseText && aResponses[i].status < 400) {
				aResponses[i].responseText =
					JSON.parse(aResponses[i].responseText);
			}
		}
	}

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
		body: "--batch_id-0123456789012-345\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1') HTTP/1.1\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_id-0123456789012-345\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2') HTTP/1.1\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
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
		body: "--batch_id-0123456789012-345\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1') HTTP/1.1\r\n" +
			"foo:bar1\r\n" +
			"abc:123\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_id-0123456789012-345\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2') HTTP/1.1\r\n" +
			"foo:bar2\r\n" +
			"abc:456\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle: "batch request with changesets",
		expectedBoundaryIDs : ["id-0123456789012-345", "id-9876543210987-654"],
		requests: [[
			{
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_03"}'
			}, {
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_01"}'
			}
		]],
		body: "--batch_id-0123456789012-345\r\n" +
			"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
			"\r\n" +
			"--changeset_id-9876543210987-654\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"Content-ID:0.0\r\n" +
			"\r\n" +
			"PATCH /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1') HTTP/1.1\r\n" +
			"Content-Type:application/json\r\n" +
			"\r\n" +
			'{"TEAM_ID": "TEAM_03"}\r\n' +
			"--changeset_id-9876543210987-654\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"Content-ID:1.1\r\n" +
			"\r\n" +
			"PATCH /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2') HTTP/1.1\r\n" +
			"Content-Type:application/json\r\n" +
			"\r\n" +
			'{"TEAM_ID": "TEAM_01"}\r\n' +
			"--changeset_id-9876543210987-654--\r\n" +
			"--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}, {
		testTitle: "batch request with changesets and individual requests",
		expectedBoundaryIDs :
			["id-0123456789012-345", "id-9876543210987-654", "id-0123456789012-912"],
		requests: [{
				method: "GET",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')",
				headers: {
					foo: "bar1",
					abc: "123"
				}
			},
			[{
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_03"}'
			}, {
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_01"}'
			}],
			{
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('3')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_01"}'
			},
			[{
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('3')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_02"}'
			}, {
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('4')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_01"}'
			}]
		],
		body: "--batch_id-0123456789012-345\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"GET /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1') HTTP/1.1\r\n" +
			"foo:bar1\r\n" +
			"abc:123\r\n" +
			"\r\n" +
			"\r\n" +
			"--batch_id-0123456789012-345\r\n" +
			"Content-Type: multipart/mixed;boundary=changeset_id-9876543210987-654\r\n" +
			"\r\n" +
			"--changeset_id-9876543210987-654\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"Content-ID:0.0\r\n" +
			"\r\n" +
			"PATCH /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1') HTTP/1.1\r\n" +
			"Content-Type:application/json\r\n" +
			"\r\n" +
			'{"TEAM_ID": "TEAM_03"}\r\n' +
			"--changeset_id-9876543210987-654\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"Content-ID:1.1\r\n" +
			"\r\n" +
			"PATCH /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2') HTTP/1.1\r\n" +
			"Content-Type:application/json\r\n" +
			"\r\n" +
			'{"TEAM_ID": "TEAM_01"}\r\n' +
			"--changeset_id-9876543210987-654--\r\n" +
			"--batch_id-0123456789012-345\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"\r\n" +
			"PATCH /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('3') HTTP/1.1\r\n" +
			"Content-Type:application/json\r\n" +
			"\r\n" +
			'{"TEAM_ID": "TEAM_01"}\r\n' +
			"--batch_id-0123456789012-345\r\n" +
			"Content-Type: multipart/mixed;boundary=changeset_id-0123456789012-912\r\n" +
			"\r\n" +
			"--changeset_id-0123456789012-912\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"Content-ID:0.2\r\n" +
			"\r\n" +
			"PATCH /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('3') HTTP/1.1\r\n" +
			"Content-Type:application/json\r\n" +
			"\r\n" +
			'{"TEAM_ID": "TEAM_02"}\r\n' +
			"--changeset_id-0123456789012-912\r\n" +
			"Content-Type:application/http\r\n" +
			"Content-Transfer-Encoding:binary\r\n" +
			"Content-ID:1.3\r\n" +
			"\r\n" +
			"PATCH /sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('4') HTTP/1.1\r\n" +
			"Content-Type:application/json\r\n" +
			"\r\n" +
			'{"TEAM_ID": "TEAM_01"}\r\n' +
			"--changeset_id-0123456789012-912--\r\n" +
			"--batch_id-0123456789012-345--\r\n",
		"Content-Type" : "multipart/mixed; boundary=batch_id-0123456789012-345",
		"MIME-Version" : "1.0"
	}].forEach(function (oFixture) {
		QUnit.test("serializeBatchRequest: " + oFixture.testTitle, function (assert) {
			var oBatchRequest,
				oMock = this.oSandbox.mock(jQuery.sap);

			if (oFixture.expectedBoundaryIDs){
				oFixture.expectedBoundaryIDs.forEach(function (oValue) {
					oMock.expects("uid").returns(oValue);
				});
			} else {
				oMock.expects("uid").returns("id-0123456789012-345");
			}

			oBatchRequest = Helper.serializeBatchRequest(oFixture.requests);

			assert.strictEqual(oBatchRequest.body, oFixture.body);
			assert.strictEqual(oBatchRequest["Content-Type"], oFixture["Content-Type"]);
			assert.strictEqual(oBatchRequest["MIME-Version"], oFixture["MIME-Version"]);
		});
	});

	//*********************************************************************************************
	[{
		title: "changeset within a changeset",
		requests: [
			[{
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_03"}'
			}, [{
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_01"}'
			}]]
		],
		errorMessage : "Change set must not contain a nested change set."
	}, {
		title: "changeset with GET request",
		requests: [
			[{
				method: "PATCH",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('1')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_03"}'
			}, {
				method: "GET",
				url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees('2')",
				headers: {
					"Content-Type": "application/json"
				},
				body: '{"TEAM_ID": "TEAM_01"}'
			}]
		],
		errorMessage : "Invalid HTTP request method: GET. Change set must contain only POST, " +
			"PUT, PATCH or DELETE requests."
	}].forEach(function (oFixture) {
		QUnit.test("validation for serializeBatchRequest: " + oFixture.title, function (assert) {
			assert.throws(
				function () { Helper.serializeBatchRequest(oFixture.requests); },
				new Error(oFixture.errorMessage));
		});
	});

	//*********************************************************************************************
	// deserialization
	[{
		testTitle: "batch parts with preamble and epilogue",
		contentType: "multipart/mixed; boundary=batch_id-0123456789012-345",
		body: "this is a preamble for the batch request\r\n\
--batch_id-0123456789012-345\r\n\
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
--batch_id-0123456789012-345\r\n\
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
--batch_id-0123456789012-345--\r\n\
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
		contentType: ' multipart/mixed; myboundary="invalid"; '
			+ 'boundary="batch_id-0123456789012-345\'()+_,-./:=?"',
		body: "--batch_id-0123456789012-345\'()+_,-./:=? \r\n\
Content-Type: application/http\r\n\
Content-Length: 4711\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_id-0123456789012-345\'()+_,-./:=?  \r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345\'()+_,-./:=?-- \r\n",
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
		contentType: 'multipart/mixed; boundary=batch_id-0123456789012-345 ; foo=bar',
		body: "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "multiple Content-Type parameters separated w/o space",
		contentType: 'multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar',
		body: "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "Content-Type with charset parameter lowercase",
		contentType: 'multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar',
		body: "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=utf-8\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {"Content-Type" : "application/json;odata.metadata=minimal;charset=utf-8"},
			responseText : "{\"foo1\":\"bar1\"}"
		}]
	}, {
		testTitle: "Content-Type with charset parameter uppercase + space + following parameter",
		contentType: 'multipart/mixed; boundary=batch_id-0123456789012-345;foo=bar',
		body: "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-8 ;foo=bar\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
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
		contentType: 'multipart/mixed; boundary=batch_id-0123456789012-345',
		body: "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: text/plain\r\n\
\r\n\
  \r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "text/plain"
			},
			responseText : "  "
		}]
	}, {
		testTitle: "individual requests and change sets",
		contentType: 'multipart/mixed; boundary=batch_id-0123456789012-345',
		body: "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 2768\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 2652\r\n\
odata-version: 4.0\r\n\
\r\n\
{\"foo\":\"bar\"}\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-9876543210987-654\r\n\
Content-Length: 1603\r\n\
\r\n\
--changeset_id-9876543210987-654\r\n\
Content-Type: application/http\r\n\
Content-Length: 655\r\n\
content-transfer-encoding: binary\r\n\
content-id: 0.0\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 491\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4328660\"\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--changeset_id-9876543210987-654\r\n\
Content-Type: application/http\r\n\
Content-Length: 651\r\n\
content-transfer-encoding: binary\r\n\
content-id: 1.1\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 487\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4430570\"\r\n\
\r\n\
{\"foo2\":\"bar2\"}\r\n\
--changeset_id-9876543210987-654--\r\n\
\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 633\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 484\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4550440\"\r\n\
\r\n\
{\"foo3\":\"bar3\"}\r\n\
--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-0123456789012-912\r\n\
Content-Length:      1599\r\n\
\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 650\r\n\
content-transfer-encoding: binary\r\n\
content-id: 1.3\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 486\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4760440\"\r\n\
\r\n\
{\"foo5\":\"bar5\"}\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 652\r\n\
content-transfer-encoding: binary\r\n\
content-id: 0.2\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 488\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4660570\"\r\n\
\r\n\
{\"foo4\":\"bar4\"}\r\n\
--changeset_id-0123456789012-912--\r\n\
\r\n\
--batch_id-0123456789012-345--\r\n",
		expectedResponses : [{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "2652",
				"odata-version" : "4.0"
			},
			responseText : '{\"foo\":\"bar\"}'
		},
		[{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "491",
				"odata-version" : "4.0",
				"etag" : 'W/"20151211144619.4328660"'
			},
			responseText : '{\"foo1\":\"bar1\"}'
		},
		{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "487",
				"odata-version" : "4.0",
				"etag" : 'W/"20151211144619.4430570"'
			},
			responseText : '{\"foo2\":\"bar2\"}'
		}],
		{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "484",
				"odata-version" : "4.0",
				"etag" : 'W/"20151211144619.4550440"'
			},
			responseText : '{\"foo3\":\"bar3\"}'
		},
		[{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "488",
				"odata-version" : "4.0",
				"etag" : 'W/"20151211144619.4660570"'
			},
			responseText : '{\"foo4\":\"bar4\"}'
		},
		{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"Content-Length" : "486",
				"odata-version" : "4.0",
				"etag" : 'W/"20151211144619.4760440"'
			},
			responseText : '{\"foo5\":\"bar5\"}'
		}]]
	}].forEach(function (oFixture) {
		QUnit.test("deserializeBatchResponse: " + oFixture.testTitle, function (assert) {
			var aResponses = Helper.deserializeBatchResponse(oFixture.contentType, oFixture.body);
			assert.deepEqual(aResponses, oFixture.expectedResponses);
		});
	});

	//*********************************************************************************************
	[{
		title : "detect unsupported charset",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-16 ;foo=bar \r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n",
		errorMessage : 'Unsupported "Content-Type" charset: UTF-16'
	}, {
		title : "no Content-ID for change set response",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-0123456789012-912\r\n\
Content-Length: 1599\r\n\
\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 650\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 486\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4760440\"\r\n\
\r\n\
{\"foo5\":\"bar5\"}\r\n\
--changeset_id-0123456789012-912--\r\n\
\r\n\
--batch_id-0123456789012-345--\r\n",
		errorMessage : 'Content-ID MIME header missing for the change set response.'
	}, {
		title : "invalid Content-ID for change set response",
		body : "--batch_id-0123456789012-345\r\n\
Content-Type: multipart/mixed; boundary=changeset_id-0123456789012-912\r\n\
Content-Length: 1599\r\n\
\r\n\
--changeset_id-0123456789012-912\r\n\
Content-Type: application/http\r\n\
Content-Length: 650\r\n\
content-transfer-encoding: binary\r\n\
content-ID: x.1\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal\r\n\
Content-Length: 486\r\n\
odata-version: 4.0\r\n\
etag: W/\"20151211144619.4760440\"\r\n\
\r\n\
{\"foo5\":\"bar5\"}\r\n\
--changeset_id-0123456789012-912--\r\n\
\r\n\
--batch_id-0123456789012-345--\r\n",
		errorMessage : 'Invalid Content-ID value in change set response.'
	}].forEach(function (oFixture) {
		QUnit.test("Validation for deserializeBatchResponse: " + oFixture.title, function (assert) {
			assert.throws(function () {
				Helper.deserializeBatchResponse(
					"multipart/mixed; boundary=batch_id-0123456789012-345",
					oFixture.body);
			}, new Error(oFixture.errorMessage));
		});
	});

	//*********************************************************************************************
	[
		"application/json",
		"multipart/mixed; foo=bar",
		"application/json; boundary=batch_id-0123456789012-345"
	].forEach(function (sContentType) {
		QUnit.test("deserializeBatchResponse: detect invalid content type: ", function (assert) {
			var sBody = "--batch_id-0123456789012-345\r\n\
Content-Type: application/http\r\n\
Content-Length: 459\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json;odata.metadata=minimal;charset=UTF-8\r\n\
\r\n\
{\"foo1\":\"bar1\"}\r\n\
--batch_id-0123456789012-345--\r\n";

			assert.throws(function () {
				Helper.deserializeBatchResponse(sContentType, sBody);
			}, new Error('Invalid $batch response header "Content-Type": ' + sContentType));
		});
	});

	//*********************************************************************************************
	// Integration Tests with real backend
	if (TestUtils.isRealOData()) {
		// integration tests serialization/deserialization
		// --------------------------------------------
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
		// --------------------------------------------
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
		},
		// --------------------------------------------
		{   testTitle : "GET not existing entity set",
			batchRequests: [{
					method : "GET",
					url : sServiceUrl + "Departments",
					headers : { "Accept": "application/json"}
				},{
					method : "GET",
					url : sServiceUrl + "Unknown",
					headers : { "Accept": "application/json"}
				},{
					method : "GET",
					url : sServiceUrl + "TEAMS",
					headers : { "Accept": "application/json"}
				}],
				expectedResponses : [{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"odata-version" : "4.0"
					},
					responseText : oDepartmentsBody
				}, {
					status : 404,
					statusText : "Not Found",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal;charset=utf-8",
						"odata-version" : "4.0"
					}
			}]
		},
		// --------------------------------------------
		{   testTitle : "POST to not existing entity within change set",
			batchRequests: [{
					method : "GET",
					url : sServiceUrl + "Departments",
					headers : { "Accept": "application/json"}
				},
				[{
					method : "PATCH",
					url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('1')",
					headers : {
						"Content-Type": "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					},
					body : '{"TEAM_ID": "TEAM_03"}'
				}, {
					method : "POST",
					url : "/sap/opu/local_v4/IWBEP/TEA_BUSI/Unknown",
					headers : {
						"Content-Type": "application/json"
					},
					body : '{"bar": "bar"}'
				}],
				{
					method : "GET",
					url : sServiceUrl + "TEAMS",
					headers : { "Accept": "application/json"}
				}],
				expectedResponses : [{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"odata-version" : "4.0"
					},
					responseText : oDepartmentsBody
				}, {
					status : 404,
					statusText : "Not Found",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal;charset=utf-8",
						"odata-version" : "4.0"
					}
			}]
		},
		// --------------------------------------------
		{   testTitle : "POST to not existing entity within change set (odata.continue-on-error)",
			continueOnError : true,
			batchRequests : [{
					method : "GET",
					url : sServiceUrl + "Departments",
					headers : { "Accept": "application/json"}
				},
				[{
					method : "PATCH",
					url : "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('1')",
					headers : {
						"Content-Type": "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					},
					body : '{"TEAM_ID": "TEAM_03"}'
				}, {
					method : "POST",
					url : "/sap/opu/local_v4/IWBEP/TEA_BUSI/Unknown",
					headers : {
						"Content-Type": "application/json"
					},
					body: '{"bar": "bar"}'
				}],
				{
					method : "GET",
					url : sServiceUrl + "TEAMS",
					headers : { "Accept": "application/json"}
				}],
				expectedResponses : [{
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"odata-version" : "4.0"
					},
					responseText : oDepartmentsBody
				}, {
					status : 404,
					statusText : "Not Found",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal;charset=utf-8",
						"odata-version" : "4.0"
					}
				}, {
					status : 200,
					statusText : "OK",
					headers : {
						"Content-Type" : "application/json;odata.metadata=minimal",
						"odata-version" : "4.0"
					},
					responseText : {
						"@odata.context" : "$metadata#TEAMS",
						"value" : [
							{
								"Budget" : 555.55,
								"BudgetCurrency" : "USD",
								"MANAGER_ID" : "3",
								"MEMBER_COUNT" : 2,
								"Name" : "Business Suite",
								"Team_Id" : "TEAM_01"
							},
							{
								"Budget" : 666.666,
								"BudgetCurrency" : "KWD",
								"MANAGER_ID" : "5",
								"MEMBER_COUNT" : 2,
								"Name" : "SAP NetWeaver Gateway Core",
								"Team_Id" : "TEAM_02"
							},
							{
								"Budget" : 4444,
								"BudgetCurrency" : "JPY",
								"MANAGER_ID" : "2",
								"MEMBER_COUNT" : 2,
								"Name" : "SAP NetWeaver Gateway Content",
								"Team_Id" : "TEAM_03"
							}
						]
					}
			}]
		},
		// --------------------------------------------
		{   testTitle : "changesets and individual requests",
			batchRequests: [{
					method: "GET",
					url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES",
					headers: {
						"Accept": "application/json"
					}
				},
				[{
					method: "PATCH",
					url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('1')",
					headers: {
						"Content-Type": "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					},
					body: '{"TEAM_ID": "TEAM_03"}'
				}, {
					method: "PATCH",
					url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('2')",
					headers: {
						"Content-Type": "application/json",
						"If-Match" : "W/\"20030701000000.0000000\""
					},
					body: '{"TEAM_ID": "TEAM_01"}'
				}],
				{
					method: "PATCH",
					url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('5')",
					headers: {
						"Content-Type": "application/json",
						"If-Match" : "W/\"20010201000000.0000000\""
					},
					body: '{"TEAM_ID": "TEAM_01"}'
				},
				[{
					method: "PATCH",
					url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('3')",
					headers: {
						"Content-Type": "application/json",
						"If-Match" : "W/\"19770724000000.0000000\""
					},
					body: '{"TEAM_ID": "TEAM_02"}'
				}, {
					method: "PATCH",
					url: "/sap/opu/local_v4/IWBEP/TEA_BUSI/EMPLOYEES('4')",
					headers: {
						"Content-Type": "application/json",
						"If-Match" : "W/\"20040912000000.0000000\""
					},
					body: '{"TEAM_ID": "TEAM_01"}'
				}]
			],
			expectedResponses : [{
				status : 200,
				statusText : "OK",
				headers : {
					"Content-Type" : "application/json;odata.metadata=minimal",
					"odata-version" : "4.0"
				},
				responseText : oEmployeesBody
		},
		[{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"odata-version" : "4.0"
			},
			responseText : {
				"@odata.context" : "$metadata#EMPLOYEES/$entity",
				"ID" : "1",
				"Name" : "Walter\"s Win's",
				"AGE" : 52,
				"ENTRYDATE" : "1977-07-24",
				"MANAGER_ID" : "",
				"ROOM_ID" : "1",
				"TEAM_ID" : "TEAM_03",
				"Is_Manager" : false,
				"LOCATION" : {
					"COUNTRY" : "Germany",
					"City" : {
						"POSTALCODE" : "69124",
						"CITYNAME" : "Heidelberg"
					}
				},
				"SALARY" : {
					"MONTHLY_BASIC_SALARY_AMOUNT" : 5000,
					"BASIC_SALARY_CURR" : "EUR",
					"YEARLY_BONUS_AMOUNT" : 5000,
					"BONUS_CURR" : "KWD"
				}
			}
		},
		{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"odata-version" : "4.0"
			},
			responseText : {
				"@odata.context" : "$metadata#EMPLOYEES/$entity",
				"ID" : "2",
				"Name" : "Frederic Fall",
				"AGE" : 32,
				"ENTRYDATE" : "2003-07-01",
				"MANAGER_ID" : "2",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_01",
				"Is_Manager" : true,
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
					"YEARLY_BONUS_AMOUNT" : 10000,
					"BONUS_CURR" : "EUR"
				}
			}
		}],
		{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"odata-version" : "4.0"
			},
			responseText : {
				"@odata.context" : "$metadata#EMPLOYEES/$entity",
				"ID" : "5",
				"Name" : "John Field",
				"AGE" : 42,
				"ENTRYDATE" : "2001-02-01",
				"MANAGER_ID" : "3",
				"ROOM_ID" : "3",
				"TEAM_ID" : "TEAM_01",
				"Is_Manager" : true,
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
					"YEARLY_BONUS_AMOUNT" : 15000,
					"BONUS_CURR" : "USD"
				}
			}
		},
		[{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"odata-version" : "4.0"
			},
			responseText : {
				"@odata.context" : "$metadata#EMPLOYEES/$entity",
				"ID" : "3",
				"Name" : "Jonathan Smith",
				"AGE" : 56,
				"ENTRYDATE" : "1977-07-24",
				"MANAGER_ID" : "1",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_02",
				"Is_Manager" : true,
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
					"YEARLY_BONUS_AMOUNT" : 10000,
					"BONUS_CURR" : "EUR"
				}
			}
		},
		{
			status : 200,
			statusText : "OK",
			headers : {
				"Content-Type" : "application/json;odata.metadata=minimal",
				"odata-version" : "4.0"
			},
			responseText : {
				"@odata.context" : "$metadata#EMPLOYEES/$entity",
				"ID" : "4",
				"Name" : "Peter Burke",
				"AGE" : 39,
				"ENTRYDATE" : "2004-09-12",
				"MANAGER_ID" : "3",
				"ROOM_ID" : "2",
				"TEAM_ID" : "TEAM_01",
				"Is_Manager" : false,
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
					"YEARLY_BONUS_AMOUNT" : 15000,
					"BONUS_CURR" : "USD"
				}
			}
		}]]
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
						var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token"),
							oBatchHeaders = {
								"Content-Type" : oBatchRequestContent["Content-Type"],
								"MIME-Version" : oBatchRequestContent["MIME-Version"],
								"X-CSRF-Token" : sCsrfToken,
								// FIX4MASTER: remove sap-rfcswitch
								"sap-rfcswitch" : "X"
						};

						if (oFixture.continueOnError) {
							oBatchHeaders["Prefer"] = "odata.continue-on-error";
						}

						jQuery.ajax(TestUtils.proxy(sServiceUrl) + '$batch', {
							method: "POST",
							headers : oBatchHeaders,
							data : oBatchRequestContent.body
						}).then(function (oData, sTextStatus, jqXHR) {
							var aResponses;

							assert.strictEqual(jqXHR.status, 200);
							aResponses = Helper.deserializeBatchResponse(
									jqXHR.getResponseHeader("Content-Type"), oData);

							parseResponses(aResponses);

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

	//*********************************************************************************************
	QUnit.test("isSafeInteger", function (assert) {
		function test(sNumber, bValue) {
			assert.strictEqual(Helper.isSafeInteger(sNumber), bValue, sNumber);
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
});

// TODO: refactoring about private and real public methods

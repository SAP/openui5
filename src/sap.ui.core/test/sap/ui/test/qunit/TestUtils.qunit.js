/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/jquery"
], function(Log, TestUtils, jQuery) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aRegExpFixture = [{
			regExp : /GET \/Foo\/regexp\/b[a]r/,
			response : {
				message : "RegExp1"
			}
		}, {
			regExp : /GET \/Foo\/regexp\/ba[z]/,
			response : [{
				ifMatch : function (_oRequest) {
					return true;
				},
				message : "RegExp2"
			}, {
				code : 404,
				message : "nope"
			}]
		}, {
			regExp : /GET \/Foo\/regexp\/(ba[s])/,
			response : {
				source : "bar.json",
				buildResponse : function (oMatch, oResponse) {
					var oMessage = JSON.parse(oResponse.message);
					oMessage.foo = oMatch[1];
					oResponse.message = JSON.stringify(oMessage);
				}
			}
		}, {
			regExp : /GET .*regexp\/bor/,
			response : {
				message : "RegExp4"
			}
		}],
		mServerFixture = {
			"/Foo/bar" : {source : "bar.json"},
			"/Foo/baz" : [{
				ifMatch : function (oRequest) {
					return oRequest.requestHeaders["SAP-ContextId"] === "session";
				},
				headers : {"Content-Type" : "application/json;charset=utf-8"},
				message: '{"@odata.etag":"abc123"}'
			}, {
				code: 404,
				headers : {"Content-Type" : "text/plain"},
				message: "Missing SAP-ContextId"
			}],
			"DELETE /Foo/bar" : {
				code : 500,
				message : "Guru meditation"
			},
			"MERGE /Foo/bar" : {
				code: 204
			},
			"PATCH /Foo/bar" : {
				code: 200,
				message: '{"@odata.etag":"abc123"}'
			},
			"POST /Foo/bar" : {code: 200, source: "bar.json"},
			"POST /Foo/baz" : [{
				code : 400,
				headers : {"Content-Type" : "application/json;charset=utf-8"},
				ifMatch : /{"foo":0}/,
				message : '{"message":"Failure"}'
			}, {
				code : 200,
				source : "bar.json"
			}]
		};

	/**
	 * Checks that the header is as expected.
	 *
	 * @param {object} assert The QUnit assert object
	 * @param {string} sHeaderString The headers as in XMLHttpRequest#getAllResponseHeaders
	 * @param {string} sName The header name
	 * @param {string} [sValue] The expected header value
	 */
	function checkHeader(assert, sHeaderString, sName, sValue) {
		sHeaderString = sHeaderString + "\r\n";

		if (sValue) {
			assert.ok(sHeaderString.includes("\r\n" + sName + ": " + sValue + "\r\n"), sName);
		} else {
			assert.notOk(sHeaderString.includes("\r\n" + sName + ": ", sName));
		}
	}

	/**
	 * Formats the headers to a string similar to XMLHttpRequest#getAllResponseHeaders
	 *
	 * @param {map} mHeaders The headers
	 * @returns {string} The resulting string
	 */
	function headerString(mHeaders) {
		return Object.keys(mHeaders || {}).map(function (sKey) {
			return sKey + ": " + mHeaders[sKey];
		}).join("\r\n") + "\r\n";
	}

	/**
	 * Runs a request and returns a promise on the finished XMLHttpRequest object.
	 *
	 * @param {string} sMethod The request method
	 * @param {string} sUrl The request URL
	 * @param {map} [mRequestHeaders] The request headers
	 * @param {string} [sRequestBody=""] The request body
	 * @returns {Promise} A promise that is resolved with the XMLHttprequest object when the
	 *   response has arrived
	 */
	function request(sMethod, sUrl, mRequestHeaders, sRequestBody) {
		return new Promise(function (resolve) {
			var oXHR = new XMLHttpRequest();

			oXHR.open(sMethod, sUrl);
			oXHR.setRequestHeader("Accept-Foo", "bar");
			oXHR.setRequestHeader("X-CSRF-Token", "Refresh");
			Object.keys(mRequestHeaders || {}).forEach(function (sHeader) {
				oXHR.setRequestHeader(sHeader, mRequestHeaders[sHeader]);
			});
			oXHR.addEventListener("load", function () {
				resolve(oXHR);
			});
			oXHR.send(sRequestBody);
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.test.TestUtils", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("info").never();
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			/**
			 * workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			 * resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			 * @deprecated since 1.56, together with sap.ui.getVersioninfo
			 */
			this.mock(sap.ui).expects("getVersionInfo").atLeast(0);
		}
	});

	//*********************************************************************************************
	[{
		method : "GET",
		url : "/Foo/regexp/bor",
		status : 200,
		responseBody : "RegExp4",
		responseHeaders : {
			"OData-Version" : "4.0"
		}
	}, {
		method : "GET",
		url : "/Foo/regexp/bar",
		status : 200,
		responseBody : "RegExp1",
		responseHeaders : {
			"OData-Version" : "4.0"
		}
	}, {
		expectedLogMessage : "GET /Foo/regexp/baz, alternative (ifMatch) #0",
		method : "GET",
		url : "/Foo/regexp/baz",
		status : 200,
		responseBody : 'RegExp2',
		responseHeaders : {
			"OData-Version" : "4.0"
		}
	}, {
		method : "GET",
		url : "/Foo/regexp/bas",
		status : 200,
		responseBody : "{\"foo\":\"bas\",\"@odata.etag\":\"abc123\"}",
		responseHeaders : {
			"OData-Version" : "4.0",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		}
	}, {
		method : "GET",
		url : "/Foo/bar",
		status : 200,
		responseBody : '{"foo":"bar","@odata.etag":"abc123"}',
		responseHeaders : {
			"OData-Version" : "4.0",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		}
	}, {
		expectedLogMessage : "GET /Foo/baz, alternative (ifMatch) #1",
		method : "GET",
		url : "/Foo/baz",
		status : 404,
		responseHeaders : {
			"OData-Version" : "4.0",
			"Content-Type" : "text/plain"
		},
		responseBody : "Missing SAP-ContextId"
	}, {
		expectedLogMessage : "GET /Foo/baz, alternative (ifMatch) #0",
		method : "GET",
		url : "/Foo/baz",
		status : 200,
		requestHeaders : {
			"SAP-ContextId" : "session"
		},
		responseHeaders : {
			"OData-Version" : "4.0",
			"Content-Type" : "application/json;charset=utf-8"
		},
		responseBody : '{"@odata.etag":"abc123"}'
	}, {
		method : "DELETE",
		url : "/Foo/any",
		status : 204,
		responseHeaders : {
			"OData-Version" : "4.0"
		}
	}, {
		method : "DELETE",
		url : "/Foo/bar",
		status : 500,
		responseHeaders : {
			"OData-Version" : "4.0"
		},
		responseBody : "Guru meditation"
	}, {
		method : "MERGE",
		url : "/Foo/any",
		requestHeaders : {
			"Content-Type" : "application/json"
		},
		requestBody : '{"foo":"bar"}',
		status : 204,
		responseHeaders : {
			"DataServiceVersion" : "2.0"
		},
		responseBody : ''
	}, {
		method: "MERGE",
		url : "/Foo/bar",
		requestHeaders : {
			"Content-Type" : "application/json"
		},
		requestBody : '{"foo":"bar"}',
		status : 204,
		responseHeaders : {
			"DataServiceVersion" : "2.0"
		},
		responseBody : ''
	}, { // "auto responder"
		method : "PATCH",
		url : "/Foo/any",
		requestHeaders : {
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		requestBody : '{"foo":"bar"}',
		status : 204,
		responseHeaders : {
			"OData-Version" : "4.0"
		},
		responseBody : ''
	}, { // "server fixture"
		method : "PATCH",
		url : "/Foo/bar",
		requestHeaders : {
			"Content-Type" : "application/json;charset=utf-8"
		},
		requestBody : '{"@odata.etag":"abc123"}',
		status : 200,
		responseHeaders : {
			"OData-Version" : "4.0"
		},
		responseBody : '{"@odata.etag":"abc123"}'
	}, {
		method : "POST",
		url : "/Foo/any",
		requestHeaders : {
			"OData-Version" : "4.01",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		requestBody : '{"foo":"bar"}',
		status : 200,
		responseHeaders : {
			"OData-Version" : "4.01",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		responseBody : '{"foo":"bar"}'
	}, {
		method : "POST",
		url : "/Foo/bar",
		requestHeaders : {
			"OData-Version" : "4.01",
			"Content-Type" : "application/json;charset=utf-8"
		},
		requestBody : '{"foo":"bar"}',
		status : 200,
		responseHeaders : {
			"OData-Version" : "4.01",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		responseBody : '{"foo":"bar","@odata.etag":"abc123"}'
	}, {
		expectedLogMessage : "POST /Foo/baz, alternative (ifMatch) #0",
		method : "POST",
		url : "/Foo/baz",
		requestHeaders : {
			"Content-Type" : "application/json;charset=utf-8"
		},
		requestBody : '{"foo":0}',
		status : 400,
		responseHeaders : {
			"OData-Version" : "4.0",
			"Content-Type" : "application/json;charset=utf-8"
		},
		responseBody : '{"message":"Failure"}'
	}, {
		expectedLogMessage : "POST /Foo/baz, alternative (ifMatch) #1",
		method : "POST",
		url : "/Foo/baz",
		requestHeaders : {
			"Content-Type" : "application/json;charset=utf-8"
		},
		requestBody : '{"foo":1}',
		status : 200,
		responseHeaders : {
			"OData-Version" : "4.0",
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		responseBody : '{"foo":"bar","@odata.etag":"abc123"}'
	}].forEach(function (oFixture) {
		var sTitle = oFixture.method + " " + oFixture.url + ", status : " + oFixture.status;

		QUnit.test("useFakeServer: " + sTitle + " (direct)", function (assert) {
			var mHeaders = oFixture.method === "MERGE" ? {"DataServiceVersion" : "2.0"}
				: {"OData-Version" : "4.0"};

			Object.keys(oFixture.requestHeaders || {}).forEach(function (sKey) {
				mHeaders[sKey] = oFixture.requestHeaders[sKey];
			});
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/test/qunit/data", mServerFixture,
				aRegExpFixture);
			this.oLogMock.expects("info").withExactArgs(
				oFixture.expectedLogMessage || oFixture.method + " " + oFixture.url,
				'{"If-Match":undefined}', "sap.ui.test.TestUtils");

			TestUtils.onRequest(function (sMessage) {
				assert.strictEqual(sMessage, oFixture.requestBody);
			});
			return request(oFixture.method, oFixture.url, mHeaders, oFixture.requestBody
			).then(function (oXHR) {
				assert.strictEqual(oXHR.status, oFixture.status, "status");
				assert.strictEqual(oXHR.responseText, oFixture.responseBody || "", "body");
				assert.strictEqual(oXHR.getAllResponseHeaders(),
					headerString(oFixture.responseHeaders), "headers");
			}).finally(function () {
				TestUtils.onRequest(null);
			});
		});

		QUnit.test("useFakeServer: " + sTitle + " (batch)", function (assert) {
			var mBatchHeaders = {},
				mInitialHeaders = {},
				sUrl = oFixture.url.replace("/Foo/", "");

			if (oFixture.method === "MERGE") {
				mInitialHeaders["DataServiceVersion"] = "2.0";
				mBatchHeaders["DataServiceVersion"] = "2.0";
			} else {
				mInitialHeaders["OData-Version"] = "4.0";
				mBatchHeaders["OData-Version"] = "4.0";
			}

			mBatchHeaders["Content-Type"] = "multipart/mixed;boundary=batch_id-0123456789012-345";

			TestUtils.useFakeServer(this._oSandbox, "sap/ui/test/qunit/data", mServerFixture,
				aRegExpFixture);
			this.oLogMock.expects("info").withExactArgs(
				oFixture.expectedLogMessage || oFixture.method + " " + oFixture.url,
				'{"If-Match":undefined}', "sap.ui.test.TestUtils");

			TestUtils.onRequest(function (sMessage) {
				assert.ok(sMessage.includes(oFixture.method + " " + sUrl));
				if (oFixture.requestBody) {
					assert.ok(sMessage.includes(oFixture.requestBody));
				}
			});
			return request("POST", "/Foo/$batch", mInitialHeaders,
				"--batch_id-0123456789012-345\r\n"
				+ "Content-Type: application/http\r\n"
				+ "Content-Transfer-Encoding: binary\r\n"
				+ "\r\n"
				+ oFixture.method + " " + sUrl + " HTTP/1.1\r\n"
				+ headerString(oFixture.requestHeaders)
				+ "\r\n"
				+ (oFixture.requestBody || "")
				+ "\r\n"
				+ "--batch_id-0123456789012-345--\r\n"
				+ "epilogue"
			).then(function (oXHR) {
				assert.strictEqual(oXHR.status, 200, "status");
				assert.strictEqual(oXHR.responseText,
					"--batch_id-0123456789012-345\r\n"
					+ "Content-Type: application/http\r\n"
					+ "Content-Transfer-Encoding: binary\r\n"
					+ "\r\n"
					+ "HTTP/1.1 " + oFixture.status + " \r\n"
					+ headerString(oFixture.responseHeaders)
					+ "\r\n"
					+ (oFixture.responseBody || "")
					+ "\r\n"
					+ "--batch_id-0123456789012-345--\r\n",
					"body"
				);
				assert.strictEqual(oXHR.getAllResponseHeaders(), headerString(mBatchHeaders),
					"batch headers");
			}).finally(function () {
				TestUtils.onRequest(null);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("useFakeServer: multiple RegExp matches", function (assert) {
		TestUtils.useFakeServer(this._oSandbox, "sap/ui/test/qunit/data", [], [{
			regExp : /GET \/Foo\/regexp\/ba./,
			response : {
				message : "RegExp1"
			}
		}, {
			regExp : /GET \/Foo\/regexp\/b.r/,
			response : {
				message : "RegExp2"
			}
		}]);
		this.oLogMock.expects("warning")
			.withExactArgs("Multiple matches found for GET /Foo/regexp/bar", undefined,
				"sap.ui.test.TestUtils");

		return request("GET", "/Foo/regexp/bar", {"OData-Version": "4.0"}).then(function (oXHR) {
			assert.strictEqual(oXHR.status, 404, "status");
		});
	});

	//*********************************************************************************************
	QUnit.test("useFakeServer: HEAD /Foo/any (direct)", function (assert) {
		TestUtils.useFakeServer(this._oSandbox, "sap/ui/test/qunit/data", mServerFixture);
		this.oLogMock.expects("info").withExactArgs("HEAD /Foo/any", '{"If-Match":undefined}',
			"sap.ui.test.TestUtils");

		return request("HEAD", "/Foo/any", {"OData-Version": "4.0"}).then(function (oXHR) {
			assert.strictEqual(oXHR.status, 200, "status");
			assert.strictEqual(oXHR.responseText, "", "body");
			assert.strictEqual(oXHR.getAllResponseHeaders(), headerString({"OData-Version": "4.0"}),
				"headers");
		});
	});

	//*********************************************************************************************
	QUnit.test("useFakeServer: change set - success", function (assert) {
		TestUtils.useFakeServer(this._oSandbox, "sap/ui/test/qunit/data", mServerFixture);
		this.oLogMock.expects("info").withExactArgs("PATCH /Foo/any", '{"If-Match":undefined}',
			"sap.ui.test.TestUtils");
		this.oLogMock.expects("info").withExactArgs("PATCH /Foo/bar", '{"If-Match":undefined}',
			"sap.ui.test.TestUtils");
		this.oLogMock.expects("info").withExactArgs("GET /Foo/bar", '{"If-Match":undefined}',
			"sap.ui.test.TestUtils");

		return request("POST", "/Foo/$batch", {"OData-Version" : "4.0"}, [
			"--batch_id-1538663822135-19",
			"Content-Type: multipart/mixed;boundary=changeset_id-1538663822135-20",
			"",
			"--changeset_id-1538663822135-20",
			"Content-Type:application/http",
			"Content-Transfer-Encoding:binary",
			"Content-ID:0.0",
			"",
			"PATCH any HTTP/1.1",
			"Accept:application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Accept-Language:en-US",
			"X-CSRF-Token:n0Uqj99BFa41yJb2QELx7g",
			"Content-Type:application/json;charset=UTF-8;IEEE754Compatible=true",
			"",
			'{"foo":"bar"}',
			"--changeset_id-1538663822135-20",
			"Content-Type:application/http",
			"Content-Transfer-Encoding:binary",
			"Content-ID:1.0",
			"",
			"PATCH bar HTTP/1.1",
			"Accept:application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Accept-Language:en-US",
			"X-CSRF-Token:",
			"Content-Type:application/json;charset=UTF-8;IEEE754Compatible=true",
			"",
			'{"foo":"bar"}',
			"--changeset_id-1538663822135-20--",
			"--batch_id-1538663822135-19--",
			"Content-Type:application/http",
			"Content-Transfer-Encoding:binary",
			"",
			"GET bar HTTP/1.1",
			"Accept:application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Accept-Language:en",
			"X-CSRF-Token:QzqAwcv5s1HQA7xOQgaNGQ==",
			"Content-Type:application/json;charset=UTF-8;IEEE754Compatible=true",
			"",
			"",
			"--batch_id-1538663822135-19--"
		].join("\r\n")).then(function (oXHR) {
			assert.strictEqual(oXHR.responseText, [
				"--batch_id-1538663822135-19",
				"Content-Type: multipart/mixed;boundary=changeset_id-1538663822135-20",
				"",
				"--changeset_id-1538663822135-20",
				"Content-Type: application/http",
				"Content-Transfer-Encoding: binary",
				"Content-ID: 0.0",
				"",
				"HTTP/1.1 204 ", // "auto responder"
				"OData-Version: 4.0",
				"",
				"", // <-- No Content
				"--changeset_id-1538663822135-20",
				"Content-Type: application/http",
				"Content-Transfer-Encoding: binary",
				"Content-ID: 1.0",
				"",
				"HTTP/1.1 200 ", // "server fixture"
				"OData-Version: 4.0",
				"",
				'{"@odata.etag":"abc123"}',
				"--changeset_id-1538663822135-20--",
				"--batch_id-1538663822135-19",
				"Content-Type: application/http",
				"Content-Transfer-Encoding: binary",
				"",
				"HTTP/1.1 200 ", // "server fixture"
				"OData-Version: 4.0",
				"Content-Type: application/json;charset=UTF-8;IEEE754Compatible=true",
				"",
				"{\"foo\":\"bar\",\"@odata.etag\":\"abc123\"}",
				"--batch_id-1538663822135-19--",
				""
			].join("\r\n"));
		});
	});

	//*********************************************************************************************
	QUnit.test("useFakeServer: change set - failure", function (assert) {
		TestUtils.useFakeServer(this._oSandbox, "sap/ui/test/qunit/data", mServerFixture);
		this.oLogMock.expects("info").withExactArgs("POST /Foo/any", '{"If-Match":undefined}',
			"sap.ui.test.TestUtils");
		this.oLogMock.expects("info").withExactArgs("POST /Foo/baz, alternative (ifMatch) #0",
			'{"If-Match":undefined}', "sap.ui.test.TestUtils");
		this.oLogMock.expects("info").withExactArgs("GET /Foo/bar", '{"If-Match":undefined}',
			"sap.ui.test.TestUtils");

		return request("POST", "/Foo/$batch", {"OData-Version" : "4.0"}, [
			"--batch_id-1538663822135-19",
			"Content-Type: multipart/mixed;boundary=changeset_id-1538663822135-20",
			"",
			"--changeset_id-1538663822135-20",
			"Content-Type:application/http",
			"Content-Transfer-Encoding:binary",
			"Content-ID:0.0",
			"",
			"POST any HTTP/1.1",
			"Accept:application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Accept-Language:en-US",
			"X-CSRF-Token:n0Uqj99BFa41yJb2QELx7g",
			"Content-Type:application/json;charset=UTF-8;IEEE754Compatible=true",
			"",
			'{"foo":"bar"}',
			"--changeset_id-1538663822135-20",
			"Content-Type:application/http",
			"Content-Transfer-Encoding:binary",
			"Content-ID:1.0",
			"",
			"POST baz HTTP/1.1",
			"Accept:application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Accept-Language:en-US",
			"X-CSRF-Token:n0Uqj99BFa41yJb2QELx7g",
			"Content-Type:application/json;charset=UTF-8;IEEE754Compatible=true",
			"",
			'{"foo":0}',
			"--changeset_id-1538663822135-20--",
			"--batch_id-1538663822135-19--",
			"Content-Type:application/http",
			"Content-Transfer-Encoding:binary",
			"",
			"GET bar HTTP/1.1",
			"Accept:application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"Accept-Language:en",
			"X-CSRF-Token:QzqAwcv5s1HQA7xOQgaNGQ==",
			"Content-Type:application/json;charset=UTF-8;IEEE754Compatible=true",
			"",
			"",
			"--batch_id-1538663822135-19--"
		].join("\r\n")).then(function (oXHR) {
			assert.strictEqual(oXHR.responseText, [
				"--batch_id-1538663822135-19",
				"Content-Type: application/http",
				"Content-Transfer-Encoding: binary",
				"",
				"HTTP/1.1 400 ",
				"OData-Version: 4.0",
				"Content-Type: application/json;charset=utf-8",
				"",
				'{"message":"Failure"}',
				"--batch_id-1538663822135-19--",
				""
			].join("\r\n"));
		});
	});

	//*********************************************************************************************
	[{
		requestHeaders : { "OData-Version" : "Foo" },
		responseHeaders : {},
		expectedODataVersion : "Foo",
		expectedDataServiceVersion : null
	}, {
		requestHeaders : { "OData-Version" : "4.0" },
		responseHeaders : { "OData-Version" : "4.01" },
		expectedODataVersion : "4.01",
		expectedDataServiceVersion : null
	}, {
		requestHeaders : { "DataServiceVersion" : "Foo" },
		responseHeaders : {},
		expectedODataVersion : null,
		expectedDataServiceVersion : "Foo"
	}, {
		requestHeaders : { "DataServiceVersion" : "Foo" },
		responseHeaders : { "DataServiceVersion" : "Bar" },
		expectedODataVersion : null,
		expectedDataServiceVersion : "Bar"
	}, {
		requestHeaders : {},
		responseHeaders : {},
		expectedODataVersion : null,
		expectedDataServiceVersion : null
	}].forEach(function (oFixture, i) {
		var oOriginalResponseHeaders = jQuery.extend({}, oFixture.responseHeaders),
			mUrls = {
				"/Foo/bar" : {
					headers : oFixture.responseHeaders,
					message : "{\"foo\":\"bar\"}"
				}
			};

		QUnit.test("TestUtils: GET, " + i, function (assert) {
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", mUrls);
			this.oLogMock.expects("info").withExactArgs("GET /Foo/bar", '{"If-Match":undefined}',
				"sap.ui.test.TestUtils");
			return jQuery.ajax("/Foo/bar", {
				method : "GET",
				headers : oFixture.requestHeaders
			}).then(function (_vData, _sTextStatus, jqXHR) {
				assert.strictEqual(jqXHR.getResponseHeader("OData-Version"),
					oFixture.expectedODataVersion);
				assert.strictEqual(jqXHR.getResponseHeader("DataServiceVersion"),
					oFixture.expectedDataServiceVersion);
				// fixture must not be modified
				assert.deepEqual(oFixture.responseHeaders, oOriginalResponseHeaders);
			});
		});

		QUnit.test("TestUtils: $batch with GET, " + i, function (assert) {
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", mUrls);
			this.oLogMock.expects("info").withExactArgs("GET /Foo/bar", '{"If-Match":undefined}',
				"sap.ui.test.TestUtils");
			return jQuery.ajax("/$batch", {
				data : "--batch_id-0123456789012-345\r\n"
					+ "Content-Type:application/http\r\n"
					+ "Content-Transfer-Encoding:binary\r\n"
					+ "\r\n"
					+ "GET Foo/bar HTTP/1.1\r\n"
					+ "\r\n"
					+ "\r\n"
					+ "--batch_id-0123456789012-345\r\n",
				method : "POST",
				headers : oFixture.requestHeaders
			}).then(function (vData, _sTextStatus, jqXHR) {
				var sResponseHeaders;

				// check that $batch response header contains same OData version as in the request
				assert.strictEqual(jqXHR.getResponseHeader("OData-Version"),
					oFixture.requestHeaders["OData-Version"] || null);
				assert.strictEqual(jqXHR.getResponseHeader("DataServiceVersion"),
					oFixture.requestHeaders["DataServiceVersion"] || null);
				// fixture must not be modified
				assert.deepEqual(oFixture.responseHeaders, oOriginalResponseHeaders);

				// OData service version is same as in the header of each response within the batch
				sResponseHeaders = (vData.split("\r\n\r\n"))[1];
				checkHeader(assert, sResponseHeaders, "OData-Version",
					oFixture.expectedODataVersion);
				checkHeader(assert, sResponseHeaders, "DataServiceVersion",
					oFixture.expectedDataServiceVersion);
			});
		});
	});

	//*********************************************************************************************
	// DELETE, PATCH and POST requests cannot be configured in TestUtils.useFakeServer(), so OData
	// version headers are simply taken from the request
	["DELETE", "PATCH", "POST"].forEach(function (sMethod) {
		[{
			requestHeaders : {"OData-Version" : "Foo"},
			expectedODataVersion : "Foo",
			expectedDataServiceVersion : null
		}, {
			requestHeaders : { "DataServiceVersion" : "Foo" },
			expectedODataVersion : null,
			expectedDataServiceVersion : "Foo"
		}, {
			requestHeaders : {},
			expectedODataVersion : null,
			expectedDataServiceVersion : null
		}].forEach(function (oFixture, i) {
			var sTitle = sMethod + ", " + i;

			QUnit.test("TestUtils: " + sTitle, function (assert) {
				TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", {});
				this.oLogMock.expects("info").withExactArgs(sMethod + " /Foo/bar",
					'{"If-Match":undefined}', "sap.ui.test.TestUtils");
				return jQuery.ajax("/Foo/bar", {
					data : sMethod === "DELETE" ? "" : "{\"foo\":\"bar\"}",
					method : sMethod,
					headers : oFixture.requestHeaders
				}).then(function (_vData, _sTextStatus, jqXHR) {
					assert.strictEqual(jqXHR.getResponseHeader("OData-Version"),
						oFixture.expectedODataVersion);
					assert.strictEqual(jqXHR.getResponseHeader("OData-MaxVersion"), null);
					assert.strictEqual(jqXHR.getResponseHeader("DataServiceVersion"),
						oFixture.expectedDataServiceVersion);
				});
			});

			QUnit.test("TestUtils: $batch with " + sTitle, function (assert) {
				TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", {});
				this.oLogMock.expects("info").withExactArgs(sMethod + " /Foo/bar",
					'{"If-Match":undefined}', "sap.ui.test.TestUtils");
				return jQuery.ajax("/$batch", {
					data : "--batch_id-0123456789012-345\r\n"
						+ "Content-Type:application/http\r\n"
						+ "Content-Transfer-Encoding:binary\r\n"
						+ "\r\n"
						+ sMethod + " Foo/bar HTTP/1.1\r\n"
						+ "\r\n"
						+ "\r\n"
						+ "--batch_id-0123456789012-345\r\n",
					method : "POST",
					headers : oFixture.requestHeaders
				}).then(function (vData, _sTextStatus, jqXHR) {
					var sResponseHeaders;

					// check that $batch response header contains same OData version as the request
					assert.strictEqual(jqXHR.getResponseHeader("OData-Version"),
						oFixture.requestHeaders["OData-Version"] || null);
					assert.strictEqual(jqXHR.getResponseHeader("DataServiceVersion"),
						oFixture.requestHeaders["DataServiceVersion"] || null);

					// check OData service version in the headers of each response within the batch
					sResponseHeaders = (vData.split("\r\n\r\n"))[1];
					checkHeader(assert, sResponseHeaders, "OData-Version",
						oFixture.expectedODataVersion);
					checkHeader(assert, sResponseHeaders, "DataServiceVersion",
						oFixture.expectedDataServiceVersion);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("useFakeServer: change set - failure - continue on error (V2)", function (assert) {
		var mFixture = {
				"POST /Foo/Any" : {
					code : 400,
					message : '{"error" : {"code" : "010","message" : {"value" : "Error 0"}}}'
				},
				"GET /Foo/Any?$skip=0&$top=4" : {
					code : 200,
					message : '{"d":{"results":[]}}'
				}
			};
		TestUtils.useFakeServer(this._oSandbox, "sap/ui/test/qunit/data", mFixture);
		this.oLogMock.expects("info")
			.withExactArgs("POST /Foo/Any", '{"If-Match":undefined}', "sap.ui.test.TestUtils");
		this.oLogMock.expects("info")
			.withExactArgs("GET /Foo/Any?$skip=0&$top=4",'{"If-Match":undefined}',
				"sap.ui.test.TestUtils");

		return request("POST", "/Foo/$batch", {"DataServiceVersion" : "2.0"}, [
			"--batch_c35a-0361-5112",
			"Content-Type: multipart/mixed; boundary=changeset_ab4e-9114-8adf",
			"",
			"--changeset_ab4e-9114-8adf",
			"Content-Type: application/http",
			"Content-Transfer-Encoding: binary",
			"",
			"POST Any HTTP/1.1",
			"Content-ID: id-1",
			"Content-Type: application/json",
			"Accept: application/json",
			"Accept-Language: en-US",
			"DataServiceVersion: 2.0",
			"MaxDataServiceVersion: 2.0",
			"Content-Length: 47",
			"",
			'{"Note":"Foo","__metadata":{"type":"Foo.Any"}}',
			"--changeset_ab4e-9114-8adf--",
			"",
			"--batch_c35a-0361-5112",
			"Content-Type: application/http",
			"Content-Transfer-Encoding: binary",
			"",
			"GET Any?$skip=0&$top=4 HTTP/1.1",
			"sap-contextid-accept: header",
			"Accept: application/json",
			"Accept-Language: en-US",
			"DataServiceVersion: 2.0",
			"MaxDataServiceVersion: 2.0",
			"",
			"",
			"--batch_c35a-0361-5112--"
	].join("\r\n")).then(function (oXHR) {
			assert.strictEqual(oXHR.responseText, [
				"--batch_c35a-0361-5112",
				"Content-Type: application/http",
				"Content-Transfer-Encoding: binary",
				"",
				"HTTP/1.1 400 ",
				"DataServiceVersion: 2.0",
				"",
				'{"error" : {"code" : "010","message" : {"value" : "Error 0"}}}',
				"--batch_c35a-0361-5112",
				"Content-Type: application/http",
				"Content-Transfer-Encoding: binary",
				"",
				"HTTP/1.1 200 ",
				"DataServiceVersion: 2.0",
				"",
				'{"d":{"results":[]}}',
				"--batch_c35a-0361-5112--",
				""
			].join("\r\n"));
		});
	});
});

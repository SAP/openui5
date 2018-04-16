/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/TestUtils"
], function (jQuery, TestUtils) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.test.TestUtils", {
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
	QUnit.test("TestUtils: getDefaultOpaTimeout", function (assert) {
		var oTestUtilsMock = this.mock(TestUtils);

		oTestUtilsMock.expects("isRealOData").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(TestUtils.getDefaultOpaTimeout(), 30);

		oTestUtilsMock.expects("isRealOData").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(TestUtils.getDefaultOpaTimeout(), 5);
	});

	//*********************************************************************************************
	[{
		requestHeaders : { "oDaTa-VeRsIoN" : "Foo" }, // handle headers case-insensitive
		responseHeaders : {},
		expectedODataVersion : "Foo",
		expectedDataServiceVersion : null
	}, {
		requestHeaders : { "OData-Version" : "Bar" },
		responseHeaders : {},
		expectedODataVersion : "Bar",
		expectedDataServiceVersion : null
	}, {
		requestHeaders : { "OData-Version" : "4.0" },
		responseHeaders : { "ODaTa-VeRsIoN" : "4.1" }, // handle headers case-insensitive
		expectedODataVersion : "4.1",
		expectedDataServiceVersion : null
	}, {
		requestHeaders : { "dataserviceversion" : "Foo" }, // handle headers case-insensitive
		responseHeaders : {},
		expectedODataVersion : null,
		expectedDataServiceVersion : "Foo"
	}, {
		requestHeaders : { "DataServiceVersion" : "Bar" },
		responseHeaders : {},
		expectedODataVersion : null,
		expectedDataServiceVersion : "Bar"
	}, {
		requestHeaders : { "DataServiceVersion" : "Foo" },
		responseHeaders : { "daTaserViceverSion" : "Bar" }, // handle headers case-insensitive
		expectedODataVersion : null,
		expectedDataServiceVersion : "Bar"
	}, {
		requestHeaders : { "OData-Version" : "4.0" },
		responseHeaders : { "DataServiceVersion" : "2.0" },
		expectedODataVersion : null,
		expectedDataServiceVersion : "2.0"
	}, {
		requestHeaders : { "DataServiceVersion" : "2.0" },
		responseHeaders : { "OData-Version" : "4.0" },
		expectedODataVersion : "4.0",
		expectedDataServiceVersion : null
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
			return jQuery.ajax("/Foo/bar", {
				method : "GET",
				headers : oFixture.requestHeaders
			}).then(function (vData, sTextStatus, jqXHR) {
				assert.strictEqual(jqXHR.getResponseHeader("odata-version"),
					oFixture.expectedODataVersion);
				assert.strictEqual(jqXHR.getResponseHeader("dataserviceversion"),
					oFixture.expectedDataServiceVersion);
				// fixture must not be modified
				assert.deepEqual(oFixture.responseHeaders, oOriginalResponseHeaders);
			});
		});

		QUnit.test("TestUtils: $batch with GET, " + i, function (assert) {
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", mUrls);
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
			}).then(function (vData, sTextStatus, jqXHR) {
				var aBatchResponseParts,
					bExpectedODataVersion = oFixture.expectedODataVersion !== null
						|| oFixture.expectedDataServiceVersion !== null,
					bFoundODataVersionHeaders,
					sKey,
					aResponseHeaders;

				// check that $batch response header contains same OData version as in the request
				sKey = Object.keys(oFixture.requestHeaders)[0];

				assert.strictEqual(jqXHR.getResponseHeader("odata-version"),
					sKey && sKey.toLowerCase() === "odata-version"
						? oFixture.requestHeaders[sKey] : null);
				assert.strictEqual(jqXHR.getResponseHeader("dataserviceversion"),
					sKey && sKey.toLowerCase() === "dataserviceversion"
						? oFixture.requestHeaders[sKey] : null);
				// fixture must not be modified
				assert.deepEqual(oFixture.responseHeaders, oOriginalResponseHeaders);

				// OData service version is same as in the header of each response within the batch
				aBatchResponseParts = vData.split("\r\n\r\n");
				aResponseHeaders = aBatchResponseParts[1].split("\r\n");
				bFoundODataVersionHeaders = aResponseHeaders.some(function (sHeader) {
					var i, sHeaderKey, sHeaderValue;

					i = sHeader.indexOf(":");
					sHeaderKey = i >= 0 ? sHeader.slice(0, i) : sHeader;
					sHeaderValue = i >= 0 ? sHeader.slice(i + 1) : "";
					return sHeaderKey.toLowerCase() === "odata-version"
							&& sHeaderValue.trim() === oFixture.expectedODataVersion
						|| sHeaderKey.toLowerCase() === "dataserviceversion"
							&& sHeaderValue.trim() === oFixture.expectedDataServiceVersion;
				});
				assert.strictEqual(bFoundODataVersionHeaders, bExpectedODataVersion,
					"OData service version as expected in $batch response");
			});
		});
	});

	//*********************************************************************************************
	// DELETE, PATCH and POST requests cannot be configured in TestUtils.useFakeServer(), so OData
	// version headers are simply taken from the request
	["DELETE", "PATCH", "POST"].forEach(function (sMethod) {
		[{
			requestHeaders : {
				"oDaTa-VeRsIoN" : "Foo", // handle headers case-insensitive
				"OData-MaxVersion" : "Bar" // only OData-Version header is put into the response
			},
			expectedODataVersion : "Foo",
			expectedDataServiceVersion : null
		}, {
			requestHeaders : { "daTaserViceverSion" : "Foo" }, // handle headers case-insensitive
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
				return jQuery.ajax("/Foo/bar", {
					data : sMethod === "DELETE" ? "" : "{\"foo\":\"bar\"}",
					method : sMethod,
					headers : oFixture.requestHeaders
				}).then(function (vData, sTextStatus, jqXHR) {
					assert.strictEqual(jqXHR.getResponseHeader("odata-version"),
						oFixture.expectedODataVersion);
					assert.strictEqual(jqXHR.getResponseHeader("odata-maxversion"), null);
					assert.strictEqual(jqXHR.getResponseHeader("dataserviceversion"),
						oFixture.expectedDataServiceVersion);
				});
			});

			QUnit.test("TestUtils: $batch with " + sTitle, function (assert) {
				TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/odata/v4/data", {});
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
				}).then(function (vData, sTextStatus, jqXHR) {
					var aBatchResponseParts,
						bExpectedODataVersion = oFixture.expectedODataVersion !== null
							|| oFixture.expectedDataServiceVersion !== null,
						bFoundODataVersionHeaders,
						sKey,
						aResponseHeaders;

					// check that $batch response header contains same OData version as the request
					sKey = Object.keys(oFixture.requestHeaders)[0];

					assert.strictEqual(jqXHR.getResponseHeader("odata-version"),
						sKey && sKey.toLowerCase() === "odata-version"
							? oFixture.requestHeaders[sKey] : null);
					assert.strictEqual(jqXHR.getResponseHeader("dataserviceversion"),
						sKey && sKey.toLowerCase() === "dataserviceversion"
							? oFixture.requestHeaders[sKey] : null);

					// check OData service version in the headers of each response within the batch
					aBatchResponseParts = vData.split("\r\n\r\n");
					aResponseHeaders = aBatchResponseParts[1].split("\r\n");
					bFoundODataVersionHeaders = aResponseHeaders.some(function (sHeader) {
						var i, sHeaderKey, sHeaderValue;

						i = sHeader.indexOf(":");
						sHeaderKey = i >= 0 ? sHeader.slice(0, i) : sHeader;
						sHeaderValue = i >= 0 ? sHeader.slice(i + 1) : "";
						return sHeaderKey.toLowerCase() === "odata-version"
								&& sHeaderValue.trim() === oFixture.expectedODataVersion
							|| sHeaderKey.toLowerCase() === "dataserviceversion"
								&& sHeaderValue.trim() === oFixture.expectedDataServiceVersion;
					});
					assert.strictEqual(bFoundODataVersionHeaders, bExpectedODataVersion,
						"OData service version as expected in $batch response");
				});
			});
		});
	});
});

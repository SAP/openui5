/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/TestUtils"
], function (jQuery, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.test.TestUtils", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// workaround: Chrome extension "UI5 Inspector" calls this method which loads the
			// resource "sap-ui-version.json" and thus interferes with mocks for jQuery.ajax
			this.oSandbox.stub(sap.ui, "getVersionInfo");
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
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
		QUnit.test("TestUtils: GET, " + i, function (assert) {
			var oOriginalResponseHeaders = jQuery.extend({}, oFixture.responseHeaders),
				mUrls = {
					"/Foo/bar" : { headers : oFixture.responseHeaders,  message : "baz" }
				};
			TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data", mUrls);
			return jQuery.ajax("/Foo/bar", {
				method : "GET",
				headers : oFixture.requestHeaders
			}).then(function (oData, sTextStatus, jqXHR) {
				assert.strictEqual(jqXHR.getResponseHeader("odata-version"),
					oFixture.expectedODataVersion);
				assert.strictEqual(jqXHR.getResponseHeader("dataserviceversion"),
					oFixture.expectedDataServiceVersion);
				// fixture must not be modified
				assert.deepEqual(oFixture.responseHeaders, oOriginalResponseHeaders);
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
			QUnit.test("TestUtils: " + sMethod + ", " + i, function (assert) {
				TestUtils.useFakeServer(this.oSandbox, "sap/ui/core/qunit/odata/v4/data", {});
				return jQuery.ajax("/Foo/bar", {
					data : sMethod === "DELETE" ? "" : "{\"foo\":\"bar\"}",
					method : sMethod,
					headers : oFixture.requestHeaders
				}).then(function (oData, sTextStatus, jqXHR) {
					assert.strictEqual(jqXHR.getResponseHeader("odata-version"),
						oFixture.expectedODataVersion);
					assert.strictEqual(jqXHR.getResponseHeader("odata-maxversion"), null);
					assert.strictEqual(jqXHR.getResponseHeader("dataserviceversion"),
						oFixture.expectedDataServiceVersion);
				});
			});
		});
	});
});

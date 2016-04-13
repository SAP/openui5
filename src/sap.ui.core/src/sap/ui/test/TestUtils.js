/*!
 * ${copyright}
 */

sap.ui.define('sap/ui/test/TestUtils', ['jquery.sap.global', 'sap/ui/core/Core'],
	function(jQuery/*, Core*/) {
	"use strict";
	/*global QUnit, sinon */
	// Note: The dependency to Sinon.js has been omitted deliberately. Most test files load it via
	// <script> anyway and declaring the dependency would cause it to be loaded twice.

	var rBatch = /\/\$batch($|\?)/,
		mMessageForPath = {}, // a cache for files, see useFakeServer
		sRealOData = jQuery.sap.getUriParameters().get("realOData"),
		rRequestLine = /^GET (\S+) HTTP\/1\.1$/,
		bProxy = sRealOData === "true" || sRealOData === "proxy",
		bRealOData = bProxy || sRealOData === "direct",
		TestUtils;

	/**
	 * Checks that the actual value deeply contains the expected value, ignoring additional
	 * properties.
	 *
	 * @param {object} oActual
	 *   the actual value to be tested
	 * @param {object} oExpected
	 *   the expected value which needs to be contained structurally (as a subset) within the
	 *   actual value
	 * @param {string} sPath
	 *   path to the values under investigation
	 * @throws {Error}
	 *   in case the actual value does not deeply contain the expected value; the error message
	 *   provides a proof of this
	 */
	function deeplyContains(oActual, oExpected, sPath) {
		var sActualType = QUnit.objectType(oActual),
			sExpectedType = QUnit.objectType(oExpected),
			sName;

		if (sActualType !== sExpectedType) {
			throw new Error(sPath + ": actual type " + sActualType
				+ " does not match expected type " + sExpectedType);
		}

		if (sActualType === "array") {
			if (oActual.length < oExpected.length) {
				throw new Error(sPath
					+ ": array length: " + oActual.length + " < " + oExpected.length);
			}
		}

		if (sActualType === "array" || sActualType === "object") {
			for (sName in oExpected) {
				deeplyContains(oActual[sName], oExpected[sName],
					sPath === "/" ? sPath + sName : sPath + "/" + sName);
			}
		} else if (oActual !== oExpected) {
			throw new Error(sPath + ": actual value " + oActual
				+ " does not match expected value " + oExpected);
		}
	}

	/**
	 * Pushes a QUnit test which succeeds if and only if a call to {@link deeplyContains} succeeds
	 * as indicated via <code>bExpectSuccess</code>.
	 *
	 * @param {object} oActual
	 *   the actual value to be tested
	 * @param {object} oExpected
	 *   the expected value which needs to be contained structurally (as a subset) within the
	 *   actual value
	 * @param {string} sMessage
	 *   message text
	 * @param {boolean} bExpectSuccess
	 *   whether {@link deeplyContains} is expected to succeed
	 */
	function pushDeeplyContains(oActual, oExpected, sMessage, bExpectSuccess) {
		try {
			deeplyContains(oActual, oExpected, "/");
			QUnit.push(bExpectSuccess, oActual, oExpected, sMessage);
		} catch (ex) {
			QUnit.push(!bExpectSuccess, oActual, oExpected,
				(sMessage || "") + " failed because of " + ex.message);
		}
	}

	/**
	 * @classdesc
	 * A collection of functions that support QUnit testing.
	 *
	 * @namespace sap.ui.test.TestUtils
	 * @since 1.27.1
	 */
	TestUtils = /** @lends sap.ui.test.TestUtils */ {
		/**
		 * Companion to <code>QUnit.deepEqual</code> which only tests for the existence of expected
		 * properties, not the absence of others.
		 *
		 * <b>BEWARE:</b> We assume both values to be JS object literals, basically!
		 *
		 * @param {object} oActual
		 *   the actual value to be tested
		 * @param {object} oExpected
		 *   the expected value which needs to be contained structurally (as a subset) within the
		 *   actual value
		 * @param {string} [sMessage]
		 *   message text
		 */
		deepContains : function (oActual, oExpected, sMessage) {
			pushDeeplyContains(oActual, oExpected, sMessage, true);
		},

		/**
		 * Companion to <code>QUnit.notDeepEqual</code> and {@link #deepContains}.
		 *
		 * @param {object} oActual
		 *   the actual value to be tested
		 * @param {object} oExpected
		 *   the expected value which needs to be NOT contained structurally (as a subset) within
		 *   the actual value
		 * @param {string} [sMessage]
		 *   message text
		 */
		notDeepContains : function (oActual, oExpected, sMessage) {
			pushDeeplyContains(oActual, oExpected, sMessage, false);
		},

		/**
		 * Activates a sinon fake server in the given sandbox. The fake server responds only to
		 * those GET requests given in the fixture. It is automatically restored when the sandbox
		 * is restored.
		 *
		 * The function uses <a href="http://sinonjs.org/docs/">Sinon.js</a> and expects that it
		 * has been loaded.
		 *
		 * @param {object} oSandbox
		 *   a Sinon sandbox as created using <code>sinon.sandbox.create()</code>
		 * @param {string} sBase
		 *   The base path for <code>source</code> values in the fixture. The path must be relative
		 *   to the <code>test</code> folder of the <code>sap.ui.core</code> project, typically it
		 *   should start with "sap". It must not end with '/'.
		 *   Example: <code>"sap/ui/core/qunit/model"</code>
		 * @param {map} mFixture
		 *   The fixture. Each key represents a URL to respond to. The value is an object that may
		 *   have the following properties:
		 *   <ul>
		 *   <li>{number} <code>code</code>: The response code (<code>200</code> if not given)
		 *   <li>{map} <code>headers</code>: A list of headers to set in the response
		 *   <li>{string} <code>message</code>: The response message
		 *   <li>{string} <code>source</code>: The path of a file relative to <code>sBase</code> to
		 *     be used for the response message. It will be read synchronously in advance. In this
		 *     case the header <code>Content-Type</code> is determined from the source name's
		 *     extension.
		 *   </ul>
		 *   Requests ending on "/$batch" are handled differently. They are expected to be multipart
		 *   mime requests where each part is a GET request. The fixture value is an object in
		 *   which the key is a request URL and the value is an object as described above.
		 *
		 *   Each multipart request in the batch is responded separately. If the URL is not found
		 *   in the fixture, it is responded with a 404. The batch itself is always responded with a
		 *   200.
		 */
		useFakeServer : function (oSandbox, sBase, mFixture) {

			function batch(mUrls, oRequest) {
				var sBody = oRequest.requestBody,
					sBoundary,
					aRequestParts,
					aResponseParts = [""];

				sBoundary = firstLine(sBody);
				aRequestParts = sBody.split(sBoundary).slice(1, -1);
				aRequestParts.forEach(function (sRequestPart) {
					var aMatches,
						sRequestLine,
						sResponse;

					sRequestPart = sRequestPart.slice(sRequestPart.indexOf("\r\n\r\n") + 4);
					sRequestLine = firstLine(sRequestPart);
					aMatches = rRequestLine.exec(sRequestLine);
					sResponse = aMatches && mUrls[aMatches[1]];
					if (sResponse) {
						aResponseParts.push("\r\n" + sResponse);
						jQuery.sap.log.info(sRequestLine, null, "sap.ui.test.TestUtils");
					} else {
						aResponseParts.push("\r\nContent-Type: application/http\r\n"
							+ "content-transfer-encoding: binary\r\n\r\n"
							+ "HTTP/1.1 404 Not Found\r\n"
							+ "Content-Type: text/plain\r\n\r\nNo mock data found\r\n");
						jQuery.sap.log.error(sRequestLine, "No mock data found",
							"sap.ui.test.TestUtils");
					}
				});
				aResponseParts.push("--\r\n");
				oRequest.respond.apply(oRequest, [200, {
					"Content-Type" : "multipart/mixed; boundary=" + sBoundary.slice(2)
				}, aResponseParts.join(sBoundary)]);
			}

			function buildResponses(mFixture, bIsBatch) {
				var oHeaders,
					sMessage,
					oResponse,
					sUrl,
					mUrls = {};

				for (sUrl in mFixture) {
					oResponse = mFixture[sUrl];
					oHeaders = oResponse.headers || {};
					if (!bIsBatch && rBatch.test(sUrl)) {
						mUrls[sUrl] = batch.bind(null, buildResponses(oResponse, true));
					} else {
						if (oResponse.source) {
							sMessage = readMessage(sBase + oResponse.source);
							if (bIsBatch) {
								// In Git no files may contain CRLF, but multipart responses
								// require it. So we simply add the CR again.
								sMessage = sMessage.replace(/\n/g, "\r\n");
							} else {
								oHeaders["Content-Type"] = oHeaders["Content-Type"]
									|| contentType(oResponse.source);
							}
						} else {
							sMessage = oResponse.message || "";
						}
						mUrls[sUrl] = bIsBatch ? sMessage
							: [oResponse.code || 200, oHeaders, sMessage];
					}
				}
				return mUrls;
			}

			function contentType(sName) {
				if (/\.xml$/.test(sName)) {
					return "application/xml";
				}
				if (/\.json$/.test(sName)) {
					return "application/json";
				}
				return "application/x-octet-stream";
			}

			function firstLine(sText) {
				return sText.slice(0, sText.indexOf("\r\n"));
			}

			function readMessage(sPath) {
				var sMessage = mMessageForPath[sPath],
					oResult;

				if (!sMessage) {
					oResult = jQuery.sap.sjax({
						url: sPath,
						dataType: "text"
					});
					if (!oResult.success) {
						throw new Error(sPath + ": resource not found");
					}
					mMessageForPath[sPath] = sMessage = oResult.data;
				}
				return sMessage;
			}

			function setupServer() {
				var fnRestore,
					oServer,
					mUrls = buildResponses(mFixture, false),
					sUrl;

				// set up the fake server
				oServer = oSandbox.useFakeServer();
				oServer.autoRespond = true;

				for (sUrl in mUrls) {
					oServer.respondWith(sUrl, mUrls[sUrl]);
				}

				// wrap oServer.restore to also clear the filter
				fnRestore = oServer.restore;
				oServer.restore = function () {
					sinon.FakeXMLHttpRequest.filters = []; // no API to clear the filter
					fnRestore.apply(this, arguments); // call the original restore
				};
			}

			//TODO remove this workaround in IE9 for
			// https://github.com/cjohansen/Sinon.JS/commit/e8de34b5ec92b622ef76267a6dce12674fee6a73
			sinon.xhr.supportsCORS = true;

			sBase = "/" + window.location.pathname.split("/")[1] + "/test-resources/" + sBase + "/";
			setupServer();

			// set up a filter so that other requests (e.g. from jQuery.sap.require) go through
			sinon.FakeXMLHttpRequest.useFilters = true;
			sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl, bAsync) {
				return !(sUrl in mFixture); // do not fake if URL is unknown
			});

		},

		/**
		 * If a test is wrapped by this function, you can test that locale-dependent texts are
		 * created as expected, but avoid checking against the real message text. The function
		 * ensures that every message retrieved using
		 * <code>sap.ui.getCore().getLibraryResourceBundle().getText()</code> consists of the key
		 * followed by all parameters referenced in the bundle's text in order of their numbers.
		 *
		 * The function uses <a href="http://sinonjs.org/docs/">Sinon.js</a> and expects that it
		 * has been loaded. It creates a <a href="http://sinonjs.org/docs/#sandbox">Sinon
		 * sandbox</a> which is available as <code>this</code> in the code under test.
		 *
		 * <b>Example</b>:
		 *
		 * In the message bundle a message looks like this:
		 * <pre>
		 * EnterNumber=Enter a number with scale {1} and precision {0}.
		 * </pre>
		 * This leads to the following results:
		 * <table>
		 * <tr><th>Call</th><th>Result</th></tr>
		 * <tr><td><code>getText("EnterNumber", [10])</code></td>
		 *   <td>EnterNumber 10 {1}</td></tr>
		 * <tr><td><code>getText("EnterNumber", [10, 3])</code></td>
		 *   <td>EnterNumber 10 3</td></tr>
		 * <tr><td><code>getText("EnterNumber", [10, 3, "foo"])</code></td>
		 *   <td>EnterNumber 10 3</td></tr>
		 * </table>
		 *
		 * <b>Usage</b>:
		 * <pre>
		 * test("parse error", function () {
		 *     sap.ui.test.TestUtils.withNormalizedMessages(function () {
		 *         var oType = new sap.ui.model.odata.type.Decimal({},
		 *                        {constraints: {precision: 10, scale: 3});
		 *
		 *         throws(function () {
		 *             oType.parseValue("-123.4567", "string");
		 *         }, /EnterNumber 10 3/);
		 *     });
		 * });
		 * </pre>
		 * @param {function} fnCodeUnderTest
		 *   the code under test
		 * @since 1.27.1
		 */
		withNormalizedMessages: function (fnCodeUnderTest) {
			sinon.test(function () {
				var oCore = sap.ui.getCore(),
					fnGetBundle = oCore.getLibraryResourceBundle;

				this.stub(oCore, "getLibraryResourceBundle").returns({
					getText: function (sKey, aArgs) {
						var sResult = sKey,
							sText = fnGetBundle.call(oCore).getText(sKey),
							i;

						for (i = 0; i < 10; i += 1) {
							if (sText.indexOf("{" + i + "}") >= 0) {
								sResult += " " + (i >= aArgs.length ? "{" + i + "}" : aArgs[i]);
							}
						}
						return sResult;
					}
				});

				fnCodeUnderTest.apply(this);

			}).apply({}); // give Sinon a "this" to enrich
		},

		/**
		 * @returns {boolean}
		 *   <code>true</code> if the the real OData service is used.
		 */
		isRealOData : function () {
			return bRealOData;
		},

		/**
		 * Adjusts the given absolute path so that (in case of "?realOData=proxy") the request is
		 * passed through the SimpleProxyServlet.
		 *
		 * @param {string} sAbsolutePath
		 *   some absolute path
		 * @returns {string}
		 *   the absolute path transformed in a way that invokes a proxy
		 */
		proxy : function (sAbsolutePath) {
			return bProxy
				? "/" + window.location.pathname.split("/")[1] + "/proxy" + sAbsolutePath
				: sAbsolutePath;
		},

		/**
		 * Sets up the fake server for OData V4 responses unless real OData responses are requested.
		 *
		 * The behavior is controlled by the request property "realOData". There are two options:
		 * <ul>
		 * <li>"realOData=proxy" (or "realOData=true"): The test must be part of the UI5 Java
		 *   Servlet. Set the system property "com.sap.ui5.proxy.REMOTE_LOCATION" to a server
		 *   containing the Gateway test service.
		 * <li>"realOData=direct": The test and the Gateway service must be reachable via the same
		 *   host. This can be reached either by deploying the test code to the Gateway host or by
		 *   using a reverse proxy like the SAP Web Dispatcher.
		 * </ul>
		 *
		 * @param {object} oSandbox
		 *   a Sinon sandbox as created using <code>sinon.sandbox.create()</code>
		 * @param {map} mFixture
		 *   the fixture for {@link sap.ui.test.TestUtils#.useFakeServer}. If the value for a URL
		 *   contains <code>always:true</code>, this URL is faked even with <code>realOData</code>.
		 * @param {string} [sSourceBase="sap/ui/core/qunit/odata/v4/data"]
		 *   The base path for <code>source</code> values in the fixture. The path must be relative
		 *   to the <code>test</code> folder of the <code>sap.ui.core</code> project, typically it
		 *   should start with "sap". It must not end with '/'.
		 * @param {string} [sFilterBase=""]
		 *   A base path for the filter URLs. It is prepended to all keys in <code>mFixture</code>.
		 */
		setupODataV4Server : function (oSandbox, mFixture, sSourceBase, sFilterBase) {
			var mResultingFixture = {},
				bStart = false;

			sFilterBase = sFilterBase || "";
			Object.keys(mFixture).forEach(function (sUrl) {
				if (!bRealOData || mFixture[sUrl].always) {
					mResultingFixture[sFilterBase + sUrl] = mFixture[sUrl];
					bStart = true;
				}
			});
			if (bStart) {
				TestUtils.useFakeServer(oSandbox, sSourceBase || "sap/ui/core/qunit/odata/v4/data",
					mResultingFixture);
			}
		}
	};

	return TestUtils;
}, /* bExport= */ true);

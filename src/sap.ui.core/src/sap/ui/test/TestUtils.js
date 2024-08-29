/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Lib",
	"sap/ui/core/Rendering",
	"sap/ui/thirdparty/jquery"
], function (Log, merge, SyncPromise, Library, Rendering, jQuery) {
	"use strict";
	/*global QUnit, sinon */
	// Note: The dependency to Sinon.JS has been omitted deliberately. Most test files load it via
	// <script> anyway and declaring the dependency would cause it to be loaded twice.

	var rBatch = /\/\$batch($|\?)/,
		rContentId = /(?:^|\r\n)Content-Id\s*:\s*(\S+)/i,
		rHeaderLine = /^(.*)?:\s*(.*)$/,
		sJson = "application/json;charset=UTF-8;IEEE754Compatible=true",
		mMessageForPath = {}, // a cache for files, see useFakeServer
		sMimeHeaders = "\r\nContent-Type: application/http\r\n"
			+ "Content-Transfer-Encoding: binary\r\n",
		rMultipartHeader = /^Content-Type:\s*multipart\/mixed;\s*boundary=/i,
		oUriParameters = new URLSearchParams(window.location.search),
		sAutoRespondAfter = oUriParameters.get("autoRespondAfter"),
		sRealOData = oUriParameters.get("realOData"),
		rRequestKey = /^(\S+) (\S+)$/,
		rRequestLine = /^(GET|DELETE|MERGE|PATCH|POST) (\S+) HTTP\/1\.1$/,
		mData = {},
		rODataHeaders = /^(OData-Version|DataServiceVersion)$/,
		bRealOData = sRealOData === "true" || sRealOData === "direct",
		fnOnRequest = null,
		rNonReadableChars = /[ "[\]{}]/g,
		rNonReadableEscaped = /%(20|22|5B|5D|7B|7D)/gi,
		rMethod = /^\w+ /,
		TestUtils;

	if (bRealOData) {
		document.title += " (real OData)";
	}

	/**
	 * Checks that the actual value deeply contains the expected value, ignoring additional
	 * properties.
	 *
	 * @param {object} oActual
	 *   the actual value to be tested
	 * @param {object|RegExp} oExpected
	 *   the expected value which needs to be contained structurally (as a subset) within the
	 *   actual value, or a regular expression which must match the actual string(!) value
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

		if (sActualType === "string" && sExpectedType === "regexp") {
			if (!oExpected.test(oActual)) {
				throw new Error(sPath + ": actual value " + oActual
					+ " does not match expected regular expression " + oExpected);
			}
			return;
		}

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
			QUnit.assert.pushResult({
				result : bExpectSuccess,
				actual : oActual,
				expected : oExpected,
				message : sMessage
			});
		} catch (ex) {
			QUnit.assert.pushResult({
				result : !bExpectSuccess,
				actual : oActual,
				expected : oExpected,
				message : (sMessage || "") + " failed because of " + ex.message
			});
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
		 * If the UI5 core is dirty, the function returns a promise that waits until the rendering
		 * is finished.
		 *
		 * @returns {Promise}
		 *   A promise that is resolved when the UI5 core is no longer dirty
		 *
		 * @public
		 */
		awaitRendering : function () {
			return new Promise(function (resolve) {
				function check() {
					if (Rendering.isPending()) {
						setTimeout(check, 1);
					} else {
						resolve();
					}
				}

				check();
			});
		},

		/**
		 * Checks for a given object its "get*" and "request*" methods, corresponding to the named
		 * "fetch*" method, using the given arguments.
		 *
		 * @param {object} oTestContext
		 *   The QUnit "test" object
		 * @param {object} oTestee
		 *   The test candidate having the get<sMethodName> created via
		 *   sap.ui.model.odata.v4.lib._Helper.createGetMethod and request<sMethodName> created via
		 *   sap.ui.model.odata.v4.lib._Helper.createRequestMethod for the corresponding
		 *   fetch<sMethodName>
		 * @param {object} assert
		 *   The QUnit "assert" object
		 * @param {string} sMethodName
		 *   Method name "fetch*"
		 * @param {object[]} aArguments
		 *   Method arguments
		 * @param {boolean} [bThrow]
		 *   Whether the "get*" method throws if the promise is not fulfilled
		 * @returns {Promise}
		 *   The "request*" method's promise
		 *
		 * @see sap.ui.model.odata.v4.lib._Helper.createGetMethod
		 * @see sap.ui.model.odata.v4.lib._Helper.createRequestMethod
		 * @ui5-restricted sap.ui.model.odata.v4
		 */
		checkGetAndRequest : function (oTestContext, oTestee, assert, sMethodName, aArguments,
				bThrow) {
			var oExpectation,
				sGetMethodName = sMethodName.replace("fetch", "get"),
				oPromiseMock = oTestContext.mock(Promise),
				oReason = new Error("rejected"),
				oRejectedPromise = Promise.reject(oReason),
				sRequestMethodName = sMethodName.replace("fetch", "request"),
				oResult = {},
				oSyncPromise = SyncPromise.resolve(oRejectedPromise);

			// resolve...
			oExpectation = oTestContext.mock(oTestee).expects(sMethodName).exactly(4);
			oExpectation = oExpectation.withExactArgs.apply(oExpectation, aArguments);
			oExpectation.returns(SyncPromise.resolve(oResult));

			// get: fulfilled
			assert.strictEqual(oTestee[sGetMethodName].apply(oTestee, aArguments), oResult);

			// reject...
			oExpectation.returns(oSyncPromise);
			oPromiseMock.expects("resolve")
				.withExactArgs(sinon.match.same(oSyncPromise))
				.returns(oRejectedPromise); // return any promise (this is not unwrapping!)

			// request (promise still pending!)
			assert.strictEqual(oTestee[sRequestMethodName].apply(oTestee, aArguments),
				oRejectedPromise);

			// restore early so that JS coding executed from Selenium Webdriver does not cause
			// unexpected calls on the mock when it uses Promise.resolve and runs before automatic
			// mock reset in afterEach
			oPromiseMock.restore();

			// get: pending
			if (bThrow) {
				assert.throws(function () {
					oTestee[sGetMethodName].apply(oTestee, aArguments);
				}, new Error("Result pending"));
			} else {
				assert.strictEqual(oTestee[sGetMethodName].apply(oTestee, aArguments),
					undefined, "pending");
			}
			return oSyncPromise.catch(function () {
				// get: rejected
				if (bThrow) {
					assert.throws(function () {
						oTestee[sGetMethodName].apply(oTestee, aArguments);
					}, oReason);
				} else {
					assert.strictEqual(oTestee[sGetMethodName].apply(oTestee, aArguments),
						undefined, "rejected");
				}
			});
		},

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
		 *
		 * @public
		 */
		deepContains : function (oActual, oExpected, sMessage) {
			pushDeeplyContains(oActual, oExpected, sMessage, true);
		},

		/**
		 * Fixes a human readable URL by percent-encoding space, double quotes, square brackets, and
		 * curly brackets.
		 *
		 * @param {string} sUrl - The human readable URL
		 * @return {string} The fixed URL
		 *
		 * @see #.makeUrlReadable
		 */
		encodeReadableUrl : function (sUrl) {
			return sUrl.replaceAll(rNonReadableChars,
				(s) => `%${s.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase()}`);
		},

		/**
		 * Makes a URL better readable for humans by replacing the percent-encoding for space,
		 * double quotes, square brackets and curly brackets.
		 *
		 * @param {string} sUrl - The URL
		 * @return {string} The human readable URL
		 *
		 * @see #.encodeReadableUrl
		 */
		makeUrlReadable : function (sUrl) {
			return sUrl.replaceAll(rNonReadableEscaped,
				(_s, n) => String.fromCharCode(Number.parseInt(n, 16)));
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
		 *
		 * @public
		 */
		notDeepContains : function (oActual, oExpected, sMessage) {
			pushDeeplyContains(oActual, oExpected, sMessage, false);
		},

		/**
		 * Activates a sinon fake server in the given sandbox. The fake server responds to those
		 * requests given in the fixture, and to all DELETE, MERGE, PATCH, and POST requests
		 * regardless of the path. It is automatically restored when the sandbox is restored.
		 *
		 * The function uses <a href="http://sinonjs.org/docs/">Sinon.js</a> and expects that it
		 * has been loaded.
		 *
		 * POST requests ending on "/$batch" are handled automatically, unless a matching fixture is
		 * given. They are expected to be multipart-mime requests where each part is a DELETE, GET,
		 * PATCH, MERGE, or POST request. The response has a multipart-mime message containing
		 * responses to these inner requests. If an inner request is not a DELETE, a MERGE, a PATCH,
		 * or a POST, and it is not found in the fixture, or its message is not JSON, it is
		 * responded with an error code. The batch itself is always responded with code 200.
		 *
		 * "$batch" requests with an OData change set are supported, too. For each request in the
		 * change set a response is searched in the fixture. As long as all responses are success
		 * responses (code less than 400) a change set response is returned. Otherwise, the first
		 * error message is the response for the whole change set.
		 *
		 * All other POST requests with no matching response in the fixture are responded with code
		 * 200, the body is simply echoed.
		 *
		 * DELETE, MERGE, and PATCH requests with no matching response in the fixture are responded
		 * with code 204 ("No Content").
		 *
		 * Direct HEAD requests with no matching response in the fixture are responded with code 200
		 * and no content.
		 *
		 * The headers "OData-Version" and "DataServiceVersion" are copied from the request to the
		 * response unless specified in the fixture.
		 *
		 * @param {object} oSandbox
		 *   A Sinon sandbox as created using <code>sinon.sandbox.create()</code>
		 * @param {string} sBase
		 *   The base path for <code>source</code> values in the fixture. The path must be in the
		 *   project's test folder, typically it should start with "sap".
		 *   Example: <code>"sap/ui/core/qunit/model"</code>
		 * @param {map} mFixture
		 *   The fixture. Each key represents a method and a URL to respond to, in the form
		 *   "METHOD URL". The method "GET" may be omitted. Spaces, double quotes, square brackets,
		 *   and curly brackets inside the URL are percent-encoded automatically. The value is an
		 *   array or single response object that may have the following properties:
		 *   <ul>
		 *     <li> {number} <code>code</code>: The response code (<code>200</code> if not given)
		 *     <li> {map} <code>headers</code>: A map of headers to set in the response
		 *     <li> {RegExp|function} <code>ifMatch</code>: A filter to select the response. If not
		 *       given, all requests match. The first match in the list wins. A regular expression
		 *       is matched against the request body. A function is called with a request object
		 *       having properties method, url, requestHeaders and requestBody; it must return
		 *       truthy to indicate a match.
		 *     <li> {object|string} <code>message</code>: The response message, either as a string
		 *       or as an object which is serialized via <code>JSON.stringify</code> (the header
		 *       <code>Content-Type</code> will be set appropriately in this case)
		 *     <li> {string} <code>source</code>: The path of a file relative to <code>sBase</code>
		 *       to be used for the response message. It will be read synchronously in advance. In
		 *       this case the header <code>Content-Type</code> is determined from the source name's
		 *       extension unless specified. This has precedence over <code>message</code>.
		 *   </ul>
		 * @param {object[]} [aRegExps]
		 *    An array containing regular expressions in the regExp property and the corresponding
		 *    response(s) objects in the response property. If no match for a request was found in
		 *    the normal fixture, the regular expressions are checked. The response object looks
		 *    exactly the same as in the fixture and may additionally contain a method
		 *    <code>buildResponse(aMatch, oResponse, oRequest)</code> which gets passed the match
		 *    object, the response, and the request in order to allow modification of the response
		 *   before sending.
		 * @param {string} [sServiceUrl]
		 *   The service URL which determines a prefix for all requests the fake server responds to;
		 *   it responds with an error for requests not given in the fixture, except DELETE, MERGE,
		 *   PATCH, or POST. A missing URL is ignored.
		 * @param {boolean} [bStrict]
		 *   Whether responses are created from the given fixture only, without defaults per method.
		 *   It does not prevent the automatic handling of <code>$batch</code>.
		 * @returns {object}
		 *   The SinonJS fake server instance
		 *
		 * @public
		 */
		useFakeServer : function (oSandbox, sBase, mFixture, aRegExps, sServiceUrl, bStrict) {
			// a map from "method path" incl. service URL to a list of response objects with
			// properties code, headers, ifMatch and message
			var aRegexpResponses, mUrlToResponses;

			/*
			 * OData batch handler
			 *
			 * @param {string} sServiceBase
			 *   the service base URL
			 * @param {object} oRequest
			 *   the Sinon request object
			 */
			function batch(sServiceBase, oRequest) {
				var oMultipart = multipart(sServiceBase, oRequest.requestBody),
					mODataHeaders = getODataHeaders(oRequest);

				if (fnOnRequest) {
					fnOnRequest(oRequest.requestBody);
				}

				oRequest.respond(200,
					jQuery.extend({}, mODataHeaders, {
						"Content-Type" : "multipart/mixed;boundary=" + oMultipart.boundary
					}),
					formatMultipart(oMultipart, mODataHeaders));
			}

			/*
			 * Builds a responses from <code>mFixture</code>. Reads the source synchronously and
			 * caches it.
			 * @returns {object} a resource object with code, headers, ifMatch and message
			 */
			function buildResponse(oFixtureResponse) {
				var oResponse = {
						buildResponse : oFixtureResponse.buildResponse,
						code : oFixtureResponse.code || 200,
						headers : oFixtureResponse.headers || {},
						ifMatch : oFixtureResponse.ifMatch
					};

				if (oFixtureResponse.source) {
					oResponse.message = readMessage(sBase + oFixtureResponse.source);
					oResponse.headers["Content-Type"] ||= contentType(oFixtureResponse.source);
				} else if (typeof oFixtureResponse.message === "object") {
					oResponse.headers["Content-Type"] = sJson;
					oResponse.message = JSON.stringify(oFixtureResponse.message);
				} else {
					oResponse.message = oFixtureResponse.message;
				}
				return oResponse;
			}

			/*
			 * Builds the responses from <code>mFixture</code>. Reads the sources synchronously and
			 * caches them.
			 * @returns {map}
			 *   a map from "method path" (incl. service URL) to a list of response objects (with
			 *   properties code, headers, ifMatch and message)
			 */
			function buildResponses() {
				var oFixtureResponse,
					sUrl,
					mUrls = {};

				for (sUrl in mFixture) {
					oFixtureResponse = mFixture[sUrl];
					let sMethod = "GET ";
					const aMatch = rMethod.exec(sUrl);
					if (aMatch) {
						sMethod = aMatch[0];
						sUrl = sUrl.slice(sMethod.length);
					}
					sUrl = sMethod + TestUtils.encodeReadableUrl(sUrl);
					if (Array.isArray(oFixtureResponse)) {
						mUrls[sUrl] = oFixtureResponse.map(buildResponse);
					} else {
						mUrls[sUrl] = [buildResponse(oFixtureResponse)];
					}
				}
				return mUrls;
			}

			// calculates the content type from the given resource name
			function contentType(sName) {
				if (/\.xml$/.test(sName)) {
					return "application/xml";
				}
				if (/\.json$/.test(sName)) {
					return sJson;
				}
				return "application/x-octet-stream";
			}

			// Logs and returns a response for the given error
			function error(iCode, oRequest, sMessage) {
				Log.error(oRequest.requestLine
					|| oRequest.method + " " + TestUtils.makeUrlReadable(oRequest.url), sMessage,
					"sap.ui.test.TestUtils");

				return {
					code : iCode,
					headers : {"Content-Type" : "text/plain"},
					message : sMessage
				};
			}

			// returns the first line (containing method and url)
			function firstLine(sText) {
				return sText.slice(0, sText.indexOf("\r\n"));
			}

			/*
			 * Formats a multipart object into the message body.
			 *
			 * @param {object} oMultipart The multipart object with boundary and parts
			 * @param {map} mODataHeaders The OData headers to copy into the response parts
			 */
			function formatMultipart(oMultipart, mODataHeaders) {
				var aResponseParts = [""];

				oMultipart.parts.every(function (oPart) {
					aResponseParts.push(oPart.boundary
						? "\r\nContent-Type: multipart/mixed;boundary=" + oPart.boundary
							+ "\r\n\r\n" + formatMultipart(oPart, mODataHeaders)
						: formatResponse(oPart, mODataHeaders));
					// change set, success response or V2 request (continue on error by default)
					return !oPart.code || oPart.code < 400
						|| mODataHeaders.DataServiceVersion === "2.0";
				});
				aResponseParts.push("--\r\n");
				return aResponseParts.join("--" + oMultipart.boundary);
			}

			/*
			 * Formats the response to be inserted into the batch
			 *
			 * @param {object} oResponse The response with code, contentId, headers, message
			 * @param {map} mODataHeaders The OData headers from the batch to copy into the response
			 * @returns {string} The response to be inserted into the batch
			 */
			function formatResponse(oResponse, mODataHeaders) {
				var mHeaders = jQuery.extend({}, mODataHeaders, oResponse.headers);

				// Note: datajs expects a space after the response code
				return sMimeHeaders
					+ (oResponse.contentId ? "Content-ID: " + oResponse.contentId + "\r\n" : "")
					+ "\r\nHTTP/1.1 " + oResponse.code + " \r\n"
					+ Object.keys(mHeaders).map(function (sHeader) {
							return sHeader + ": " + mHeaders[sHeader];
						}).join("\r\n")
					+ "\r\n\r\n" + (oResponse.message || "") + "\r\n";
			}

			/**
			 * Gets matching responses to the URL and request method from the fixture. First, checks
			 * if a matching response is in the <code>mUrlToResponse</code> map. If that's not the
			 * case, it goes on to check the regular expressions for a match.
			 * @param {string} sMethod The request method
			 * @param {string} sUrl The URL of the request
			 * @returns {object} An object with the properties <code>responses</code> and
			 *   <code>match</code>
			 */
			function getMatchingResponse(sMethod, sUrl) {
				var aMatches, aMatchingResponses,
					sRequestLine = sMethod + " " + sUrl;

				if (mUrlToResponses[sRequestLine]) {
					return {
						responses : mUrlToResponses[sRequestLine]
					};
				}

				if (!aRegexpResponses) {
					return undefined;
				}

				aMatches = [];
				aMatchingResponses = aRegexpResponses.filter(function (oResponse) {
					var aMatch = sRequestLine.match(oResponse.regExp);

					if (aMatch) {
						aMatches.push(aMatch);
					}
					return aMatch;
				});

				if (aMatchingResponses.length > 1) {
					Log.warning("Multiple matches found for " + sRequestLine, undefined,
						"sap.ui.test.TestUtils");

					return undefined;
				}
				return aMatchingResponses.length ? {
					responses : aMatchingResponses[0].response,
					match : aMatches[0]
				} : undefined;
			}

			/*
			 * Returns a map with only the OData headers that have to be copied to the response
			 *
			 * @param {object} oRequest The request to take the headers from
			 */
			function getODataHeaders(oRequest) {
				var sKey,
					mODataHeaders = {};

				for (sKey in oRequest.requestHeaders) {
					if (rODataHeaders.test(sKey)) {
						mODataHeaders[sKey] = oRequest.requestHeaders[sKey];
					}
				}

				return mODataHeaders;
			}

			/*
			 * Determines the matching response for the request. Returns an error response if no
			 * match was found, unless <code>bTry</code> was given.
			 *
			 * @param {object} oRequest The Sinon request object
			 * @param {string} [sContentId] The content ID
			 * @param {boolean} [bTry]
			 *   Whether to do nothing and return <code>undefined</code> if no fixture matches; also
			 *   prevents defaulting for non-GET requests
			 * @returns {object|undefined} The response object or <code>undefined</code>
			 */
			function getResponseFromFixture(oRequest, sContentId, bTry) {
				var iAlternative,
					oMatch = getMatchingResponse(oRequest.method, oRequest.url),
					oResponse,
					aResponses = oMatch && oMatch.responses;

				aResponses = (aResponses || []).filter(function (oResponse0) {
					if (typeof oResponse0.ifMatch === "function") {
						return oResponse0.ifMatch(oRequest);
					}
					return !oResponse0.ifMatch || oResponse0.ifMatch.test(oRequest.requestBody);
				});
				if (aResponses.length) {
					oResponse = aResponses[0];
					if (typeof oResponse.buildResponse === "function") {
						oResponse = merge({}, oResponse);
						try {
							oResponse.buildResponse(oMatch.match, oResponse, oRequest);
						} catch (oError) {
							oResponse = error(500, oRequest, oError.stack);
						}
					}
					if (oMatch.responses.length > 1) {
						iAlternative = oMatch.responses.indexOf(oResponse);
					}
				} else if (!bStrict && !bTry) {
					switch (oRequest.method) {
						case "HEAD":
							oResponse = {code : 200};
							break;
						case "DELETE":
						case "MERGE":
						case "PATCH":
							oResponse = {
								code : 204
							};
							break;
						case "POST":
							oResponse = {
								code : 200,
								headers : {"Content-Type" : sJson},
								message : oRequest.requestBody
							};
							break;
						// no default
					}
				}
				if (oResponse) {
					Log.info(oRequest.method + " " + TestUtils.makeUrlReadable(oRequest.url)
						+ (iAlternative !== undefined
							? ", alternative (ifMatch) #" + iAlternative
							: ""),
						// Note: JSON.stringify(oRequest.requestHeaders) outputs too much for now
						'{"If-Match":' + JSON.stringify(oRequest.requestHeaders["If-Match"]) + "}",
						"sap.ui.test.TestUtils");
				} else if (bTry) {
					return undefined;
				} else {
					oResponse = error(404, oRequest, "No mock data found");
				}
				oResponse.headers = jQuery.extend({}, getODataHeaders(oRequest), oResponse.headers);
				if (sContentId && oResponse.code < 300) {
					oResponse.contentId = sContentId;
				}
				return oResponse;
			}

			/*
			 * Processes a multipart message (body or change set)
			 *
			 * @param {string} sServiceBase The service base URL
			 * @param {string} sBody The body
			 * @returns {object} An object with the properties boundary and parts
			 */
			function multipart(sServiceBase, sBody) {
				var sBoundary;

				// skip preamble consisting of whitespace (as sent by datajs)
				sBody = sBody.replace(/^\s+/, "");
				sBoundary = firstLine(sBody);
				return {
					boundary : firstLine(sBody).slice(2),
					parts : sBody.split(sBoundary).slice(1, -1).map(function (sRequestPart) {
						var aFailures, sFirstLine, aMatch, oMultipart, oRequest, iRequestStart;

						sRequestPart = sRequestPart.slice(2);
						sFirstLine = firstLine(sRequestPart);
						if (rMultipartHeader.test(sFirstLine)) {
							oMultipart = multipart(sServiceBase,
								sRequestPart.slice(sFirstLine.length + 4));
							aFailures = oMultipart.parts.filter(function (oPart) {
								return oPart.code >= 300;
							});
							return aFailures.length ? aFailures[0] : oMultipart;
						}
						iRequestStart = sRequestPart.indexOf("\r\n\r\n") + 4;
						oRequest = parseRequest(sServiceBase, sRequestPart.slice(iRequestStart));
						aMatch = rContentId.exec(sRequestPart.slice(0, iRequestStart));
						return getResponseFromFixture(oRequest, aMatch && aMatch[1]);
					})
				};
			}

			// Parses the request string of a batch into an object matching the Sinon request object
			function parseRequest(sServiceBase, sRequest) {
				var iBodySeparator = sRequest.indexOf("\r\n\r\n"),
					aLines,
					aMatches,
					oRequest = {requestHeaders : {}};

				oRequest.requestBody = sRequest.slice(iBodySeparator + 4, sRequest.length - 2);
				sRequest = sRequest.slice(0, iBodySeparator);
				aLines = sRequest.split("\r\n");
				oRequest.requestLine = aLines.shift();
				aMatches = rRequestLine.exec(oRequest.requestLine);
				if (aMatches) {
					oRequest.method = aMatches[1];
					oRequest.url = sServiceBase + aMatches[2];
					aLines.forEach(function (sLine) {
						const aMatches0 = rHeaderLine.exec(sLine);
						if (aMatches0) {
							oRequest.requestHeaders[aMatches0[1]] = aMatches0[2];
						}
					});
				}
				return oRequest;
			}

			// POST handler which recognizes a $batch
			function post(oRequest) {
				var sUrl = oRequest.url;

				if (rBatch.test(sUrl)) {
					if (!respondFromFixture(oRequest, true)) {
						batch(sUrl.slice(0, sUrl.indexOf("/$batch") + 1), oRequest);
					}
				} else {
					respondFromFixture(oRequest);
				}
			}

			/*
			 * Reads and caches the source for the given path.
			 */
			function readMessage(sPath) {
				var sMessage = mMessageForPath[sPath];

				if (!sMessage) {
					jQuery.ajax({
						async : false,
						url : sPath,
						dataType : "text",
						success : function (sBody) {
							sMessage = sBody;
						}
					});
					if (!sMessage) {
						throw new Error(sPath + ": resource not found");
					}
					mMessageForPath[sPath] = sMessage;
				}
				return sMessage;
			}

			/*
			 * Searches the response in the fixture and responds.
			 *
			 * @param {object} oRequest The Sinon request object
			 * @param {boolean} [bTry]
			 *   Whether to do nothing and return <code>false</code> if no fixture matches
			 * @returns {boolean} Whether the request was processed
			 */
			function respondFromFixture(oRequest, bTry) {
				var oResponse = getResponseFromFixture(oRequest, undefined, bTry);

				if (!oResponse) {
					return false;
				}
				if (fnOnRequest) {
					fnOnRequest(oRequest.requestBody);
				}
				oRequest.respond(oResponse.code, oResponse.headers, oResponse.message);
				return true;
			}

			function setupServer() {
				var fnRestore, oServer;

				// build the fixture
				mUrlToResponses = buildResponses();

				if (aRegExps) {
					aRegexpResponses = aRegExps.map(function (oRegExpFixture) {
						return {
							regExp : oRegExpFixture.regExp,
							response : Array.isArray(oRegExpFixture.response)
								? oRegExpFixture.response.map(buildResponse)
								: [buildResponse(oRegExpFixture.response)]
						};
					});
				}

				// set up the fake server
				oServer = sinon.fakeServer.create();
				if (oSandbox.getFakes) { // Sinon.JS version >= 5
					oSandbox.getFakes().push(oServer); // not a public API of Sinon.JS
				} else {
					oSandbox.add(oServer); // not a public API of Sinon.JS
				}
				oServer.autoRespond = true;
				if (sAutoRespondAfter) {
					oServer.autoRespondAfter = parseInt(sAutoRespondAfter);
				}

				// Send all requests except $batch through respondFromFixture
				oServer.respondWith("GET", /./, respondFromFixture);
				oServer.respondWith("DELETE", /./, respondFromFixture);
				oServer.respondWith("HEAD", /./, respondFromFixture);
				oServer.respondWith("PATCH", /./, respondFromFixture);
				oServer.respondWith("MERGE", /./, respondFromFixture);
				oServer.respondWith("POST", /./, post);

				// wrap oServer.restore to also clear the filter
				fnRestore = oServer.restore;
				oServer.restore = function () {
					sinon.FakeXMLHttpRequest.filters = []; // no API to clear the filter
					fnRestore.apply(this, arguments); // call the original restore
				};

				// Set up a filter so that other requests (e.g. from jQuery.sap.require) go through.
				// This filter fetches all DELETE, all POST (incl. $batch) and the selected GET
				// requests.
				sinon.xhr.supportsCORS = jQuery.support.cors;
				sinon.FakeXMLHttpRequest.useFilters = true;
				sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl) {
					var bOurs = getMatchingResponse(sMethod, sUrl)
						|| (sServiceUrl
							? sUrl.startsWith(sServiceUrl) || rBatch.test(sUrl)
							: sMethod === "DELETE" || sMethod === "HEAD" || sMethod === "MERGE"
								|| sMethod === "PATCH" || sMethod === "POST"
							);

					// must return true if the request is NOT processed by the fake server
					return !bOurs;
				});

				return oServer;
			}

			// ensure to always search the fake data in test-resources, remove cache buster token
			sBase = sap.ui.require.toUrl(sBase)
				.replace(/(^|\/)resources\/(~[-a-zA-Z0-9_.]*~\/)?/, "$1test-resources/") + "/";
			return setupServer();
		},

		/**
		 * If a test is wrapped by this function, you can test that locale-dependent texts are
		 * created as expected, but avoid checking against the real message text. The function
		 * ensures that every message retrieved using
		 * <code>sap.ui.getCore().getLibraryResourceBundle().getText()</code> or
		 * <code>sap.ui.core.Lib#getResourceBundle().getText()</code> consists of the key
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
		 * QUnit.test("parse error", function (assert) {
		 *     sap.ui.test.TestUtils.withNormalizedMessages(function () {
		 *         var oType = new sap.ui.model.odata.type.Decimal({},
		 *                        {constraints : {precision : 10, scale : 3});
		 *
		 *         assert.throws(function () {
		 *             oType.parseValue("-123.4567", "string");
		 *         }, /EnterNumber 10 3/);
		 *     });
		 * });
		 * </pre>
		 * @param {function} fnCodeUnderTest
		 *   the code under test
		 * @since 1.27.1
		 *
		 * @public
		 */
		withNormalizedMessages : function (fnCodeUnderTest) {
			var oSandbox;

			if (sinon.createSandbox) {
				oSandbox = sinon.createSandbox();
			} else {
				oSandbox = sinon.sandbox.create();
			}

			try {
				const fnGetBundle = Library.prototype._loadResourceBundle;
				oSandbox.stub(Library.prototype, "_loadResourceBundle").callsFake(function () {
					var oResourceBundle = fnGetBundle.apply(this, [arguments[0], /*sync*/true]);

					return {
						getText : function (sKey, aArgs) {
							var sResult = sKey,
								sText = oResourceBundle.getText(sKey),
								i;

							for (i = 0; i < 10; i += 1) {
								if (sText.indexOf("{" + i + "}") >= 0) {
									sResult += " " + (i >= aArgs.length ? "{" + i + "}" : aArgs[i]);
								}
							}
							return sResult;
						}
					};
				});

				fnCodeUnderTest.apply(this);
			} finally {
				oSandbox.verifyAndRestore();
			}
		},

		/**
		 * @returns {boolean}
		 *   <code>true</code> if the real OData service is used.
		 *
		 * @public
		 */
		isRealOData : function () {
			if (sRealOData === "proxy") {
				throw new Error("realOData=proxy is no longer supported");
			}
			return bRealOData;
		},

		/**
		 * Returns the realOData query parameter so that it can be forwarded to an embedded test
		 *
		 * @returns {string}
		 *  the realOData query parameter or "" if none was given
		 *
		 * @public
		 */
		getRealOData : function () {
			return sRealOData ? "&realOData=" + sRealOData : "";
		},

		/**
		 * Sets a callback function which is called when the fake server responds with a fake
		 * request. The function will be called with the request body as first parameter.
		 *
		 * Pass <code>null</code> to remove the listener.
		 *
		 * @param {function(string)} [fnCallback] - The function
		 *
		 * @ui5-restricted sap.ui.model.odata.v4
		 */
		onRequest : function (fnCallback) {
			fnOnRequest = fnCallback;
		},

		/**
		 * Returns the value which has been stored with the given key using {@link #setData} and
		 * resets it.
		 *
		 * @param {string} sKey
		 *   The key
		 * @returns {object}
		 *   The value
		 *
		 * @public
		 */
		retrieveData : function (sKey) {
			var vValue = mData[sKey];

			delete mData[sKey];
			return vValue;
		},

		/**
		 * Stores the given value under the given key so that it can be used by a test at a later
		 * point in time.
		 *
		 * @param {string} sKey
		 *   The key
		 * @param {object} vValue
		 *   The value
		 *
		 * @public
		 */
		setData : function (sKey, vValue) {
			mData[sKey] = vValue;
		},

		/**
		 * Sets up the fake server for OData responses unless real OData responses are requested.
		 *
		 * The behavior is controlled by the request property "realOData". If the property has the
		 * value "direct" or "true", the fake server is <i>not</i> set up. You will need a reverse
		 * proxy to forward the requests to the correct remote server then.
		 *
		 * @param {object} oSandbox
		 *   a Sinon sandbox as created using <code>sinon.sandbox.create()</code>
		 * @param {map} mFixture
		 *   the fixture for {@link sap.ui.test.TestUtils.useFakeServer}, automatically run through
		 *   {@link sap.ui.test.TestUtils.normalizeFixture}.
		 * @param {string} [sSourceBase="sap/ui/core/qunit/odata/v4/data"]
		 *   The base path for <code>source</code> values in the fixture. The path must be in the
		 *   project's test folder, typically it should start with "sap".
		 *   Example: <code>"sap/ui/core/qunit/model"</code>
		 * @param {string} [sFilterBase="/"]
		 *   A base path for relative filter URLs in <code>mFixture</code>.
		 * @param {object[]} [aRegExps]
		 *   The regular expression array for {@link sap.ui.test.TestUtils.useFakeServer}
		 *
		 * @public
		 * @see #.isRealOData
		 */
		setupODataV4Server : function (oSandbox, mFixture, sSourceBase, sFilterBase, aRegExps) {
			if (this.isRealOData()) {
				return;
			}
			if (!sFilterBase) {
				sFilterBase = "/";
			} else if (sFilterBase.slice(-1) !== "/") {
				sFilterBase += "/";
			}
			TestUtils.useFakeServer(oSandbox, sSourceBase || "sap/ui/core/qunit/odata/v4/data",
				TestUtils.normalizeFixture(mFixture, sFilterBase), aRegExps,
				sFilterBase !== "/" ? sFilterBase : undefined);
		},

		/**
		 * Normalizes the given fixture by adding method "GET" and prefix for relative filter URLs.
		 *
		 * @param {map} mFixture
		 *   the fixture for {@link sap.ui.test.TestUtils.useFakeServer}.
		 * @param {string} [sFilterBase="/"]
		 *   A base path for relative filter URLs in <code>mFixture</code>.
		 * @returns {map}
		 *   The normalized fixture
		 */
		normalizeFixture : function (mFixture, sFilterBase) {
			var mResultingFixture = {};

			Object.keys(mFixture).forEach(function (sRequest) {
				var aMatches = rRequestKey.exec(sRequest),
					sMethod,
					sUrl;

				if (aMatches) {
					sMethod = aMatches[1] || "GET";
					sUrl = aMatches[2];
				} else {
					sMethod = "GET";
					sUrl = sRequest;
				}
				if (!sUrl.startsWith("/")) {
					sUrl = sFilterBase + sUrl;
				}
				mResultingFixture[sMethod + " " + sUrl] = mFixture[sRequest];
			});

			return mResultingFixture;
		},

		/**
		 * Creates and returns a spy for <code>XMLHttpRequest.prototype.open</code> which is
		 * used in {@link module:sap/base/util/fetch}.
		 *
		 * @param {object} oSandbox
		 *   a Sinon sandbox as created using <code>sinon.sandbox.create()</code>
		 * @return {object} Returns the spy
		 */
		spyFetch : function (oSandbox) {
			var spy = oSandbox.spy(XMLHttpRequest.prototype, "open");

			/**
			 * Returns the request URL
			 * @param  {number} iCall The 'nth' call
			 * @return {string} Returns the request URL
			 */
			spy.calledWithUrl = function (iCall) {
				return spy.getCall(iCall).args[1];
			};

			return spy;
		}
	};

	return TestUtils;
});

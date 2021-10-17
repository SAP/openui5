import jQuery from "jquery.sap.sjax";
import Log from "sap/base/Log";
import merge from "sap/base/util/merge";
import UriParameters from "sap/base/util/UriParameters";
var rBatch = /\/\$batch($|\?)/, rContentId = /(?:^|\r\n)Content-Id\s*:\s*(\S+)/i, rHeaderLine = /^(.*)?:\s*(.*)$/, sJson = "application/json;charset=UTF-8;IEEE754Compatible=true", mMessageForPath = {}, sMimeHeaders = "\r\nContent-Type: application/http\r\n" + "Content-Transfer-Encoding: binary\r\n", rMultipartHeader = /^Content-Type:\s*multipart\/mixed;\s*boundary=/i, oUriParameters = UriParameters.fromQuery(window.location.search), sAutoRespondAfter = oUriParameters.get("autoRespondAfter"), sRealOData = oUriParameters.get("realOData"), rRequestKey = /^(\S+) (\S+)$/, rRequestLine = /^(GET|DELETE|MERGE|PATCH|POST) (\S+) HTTP\/1\.1$/, mData = {}, rODataHeaders = /^(OData-Version|DataServiceVersion)$/, bRealOData = sRealOData === "true" || sRealOData === "direct", iRequestCount = 0, bSupportAssistant = oUriParameters.get("supportAssistant") === "true", TestUtils;
if (bRealOData) {
    document.title = document.title + " (real OData)";
}
function deeplyContains(oActual, oExpected, sPath) {
    var sActualType = QUnit.objectType(oActual), sExpectedType = QUnit.objectType(oExpected), sName;
    if (sActualType === "string" && sExpectedType === "regexp") {
        if (!oExpected.test(oActual)) {
            throw new Error(sPath + ": actual value " + oActual + " does not match expected regular expression " + oExpected);
        }
        return;
    }
    if (sActualType !== sExpectedType) {
        throw new Error(sPath + ": actual type " + sActualType + " does not match expected type " + sExpectedType);
    }
    if (sActualType === "array") {
        if (oActual.length < oExpected.length) {
            throw new Error(sPath + ": array length: " + oActual.length + " < " + oExpected.length);
        }
    }
    if (sActualType === "array" || sActualType === "object") {
        for (sName in oExpected) {
            deeplyContains(oActual[sName], oExpected[sName], sPath === "/" ? sPath + sName : sPath + "/" + sName);
        }
    }
    else if (oActual !== oExpected) {
        throw new Error(sPath + ": actual value " + oActual + " does not match expected value " + oExpected);
    }
}
function pushDeeplyContains(oActual, oExpected, sMessage, bExpectSuccess) {
    try {
        deeplyContains(oActual, oExpected, "/");
        QUnit.assert.pushResult({
            result: bExpectSuccess,
            actual: oActual,
            expected: oExpected,
            message: sMessage
        });
    }
    catch (ex) {
        QUnit.assert.pushResult({
            result: !bExpectSuccess,
            actual: oActual,
            expected: oExpected,
            message: (sMessage || "") + " failed because of " + ex.message
        });
    }
}
TestUtils = {
    awaitRendering: function () {
        if (sap.ui.getCore().getUIDirty()) {
            return new Promise(function (resolve) {
                function check() {
                    if (sap.ui.getCore().getUIDirty()) {
                        setTimeout(check, 1);
                    }
                    else {
                        resolve();
                    }
                }
                check();
            });
        }
    },
    checkError: function (assert, oError, fnConstructor, sMessage) {
        assert.strictEqual(oError.constructor, fnConstructor);
        assert.strictEqual(oError.message, sMessage);
        assert.strictEqual(oError.name, fnConstructor.name);
    },
    deepContains: function (oActual, oExpected, sMessage) {
        pushDeeplyContains(oActual, oExpected, sMessage, true);
    },
    notDeepContains: function (oActual, oExpected, sMessage) {
        pushDeeplyContains(oActual, oExpected, sMessage, false);
    },
    useFakeServer: function (oSandbox, sBase, mFixture, aRegExps, sServiceUrl, bStrict) {
        var aRegexpResponses, mUrlToResponses;
        function batch(sServiceBase, oRequest) {
            var oMultipart = multipart(sServiceBase, oRequest.requestBody), mODataHeaders = getODataHeaders(oRequest);
            iRequestCount += 1;
            oRequest.respond(200, jQuery.extend({}, mODataHeaders, {
                "Content-Type": "multipart/mixed;boundary=" + oMultipart.boundary
            }), formatMultipart(oMultipart, mODataHeaders));
        }
        function buildResponse(oFixtureResponse) {
            var oResponse = {
                buildResponse: oFixtureResponse.buildResponse,
                code: oFixtureResponse.code || 200,
                headers: oFixtureResponse.headers || {},
                ifMatch: oFixtureResponse.ifMatch
            };
            if (oFixtureResponse.source) {
                oResponse.message = readMessage(sBase + oFixtureResponse.source);
                oResponse.headers["Content-Type"] = oResponse.headers["Content-Type"] || contentType(oFixtureResponse.source);
            }
            else if (typeof oFixtureResponse.message === "object") {
                oResponse.headers["Content-Type"] = sJson;
                oResponse.message = JSON.stringify(oFixtureResponse.message);
            }
            else {
                oResponse.message = oFixtureResponse.message;
            }
            return oResponse;
        }
        function buildResponses() {
            var oFixtureResponse, sUrl, mUrls = {};
            for (sUrl in mFixture) {
                oFixtureResponse = mFixture[sUrl];
                if (!sUrl.includes(" ")) {
                    sUrl = "GET " + sUrl;
                }
                if (Array.isArray(oFixtureResponse)) {
                    mUrls[sUrl] = oFixtureResponse.map(buildResponse);
                }
                else {
                    mUrls[sUrl] = [buildResponse(oFixtureResponse)];
                }
            }
            return mUrls;
        }
        function contentType(sName) {
            if (/\.xml$/.test(sName)) {
                return "application/xml";
            }
            if (/\.json$/.test(sName)) {
                return sJson;
            }
            return "application/x-octet-stream";
        }
        function error(iCode, oRequest, sMessage) {
            Log.error(oRequest.requestLine || oRequest.method + " " + oRequest.url, sMessage, "sap.ui.test.TestUtils");
            return {
                code: iCode,
                headers: { "Content-Type": "text/plain" },
                message: sMessage
            };
        }
        function firstLine(sText) {
            return sText.slice(0, sText.indexOf("\r\n"));
        }
        function formatMultipart(oMultipart, mODataHeaders) {
            var aResponseParts = [""];
            oMultipart.parts.every(function (oPart) {
                aResponseParts.push(oPart.boundary ? "\r\nContent-Type: multipart/mixed;boundary=" + oPart.boundary + "\r\n\r\n" + formatMultipart(oPart, mODataHeaders) : formatResponse(oPart, mODataHeaders));
                return !oPart.code || oPart.code < 400 || mODataHeaders.DataServiceVersion === "2.0";
            });
            aResponseParts.push("--\r\n");
            return aResponseParts.join("--" + oMultipart.boundary);
        }
        function formatResponse(oResponse, mODataHeaders) {
            var mHeaders = jQuery.extend({}, mODataHeaders, oResponse.headers);
            return sMimeHeaders + (oResponse.contentId ? "Content-ID: " + oResponse.contentId + "\r\n" : "") + "\r\nHTTP/1.1 " + oResponse.code + " \r\n" + Object.keys(mHeaders).map(function (sHeader) {
                return sHeader + ": " + mHeaders[sHeader];
            }).join("\r\n") + "\r\n\r\n" + (oResponse.message || "") + "\r\n";
        }
        function getMatchingResponse(sMethod, sUrl) {
            var aMatches, aMatchingResponses, sRequestLine = sMethod + " " + sUrl;
            if (mUrlToResponses[sRequestLine]) {
                return {
                    responses: mUrlToResponses[sRequestLine]
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
                Log.warning("Multiple matches found for " + sRequestLine, undefined, "sap.ui.test.TestUtils");
                return undefined;
            }
            return aMatchingResponses.length ? {
                responses: aMatchingResponses[0].response,
                match: aMatches[0]
            } : undefined;
        }
        function getODataHeaders(oRequest) {
            var sKey, mODataHeaders = {};
            for (sKey in oRequest.requestHeaders) {
                if (rODataHeaders.test(sKey)) {
                    mODataHeaders[sKey] = oRequest.requestHeaders[sKey];
                }
            }
            return mODataHeaders;
        }
        function getResponseFromFixture(oRequest, sContentId) {
            var iAlternative, oMatch = getMatchingResponse(oRequest.method, oRequest.url), oResponse, aResponses = oMatch && oMatch.responses;
            aResponses = (aResponses || []).filter(function (oResponse) {
                if (typeof oResponse.ifMatch === "function") {
                    return oResponse.ifMatch(oRequest);
                }
                return !oResponse.ifMatch || oResponse.ifMatch.test(oRequest.requestBody);
            });
            if (aResponses.length) {
                oResponse = aResponses[0];
                if (typeof oResponse.buildResponse === "function") {
                    oResponse = merge({}, oResponse);
                    oResponse.buildResponse(oMatch.match, oResponse);
                }
                if (oMatch.responses.length > 1) {
                    iAlternative = oMatch.responses.indexOf(oResponse);
                }
            }
            else if (!bStrict) {
                switch (oRequest.method) {
                    case "HEAD":
                        oResponse = { code: 200 };
                        break;
                    case "DELETE":
                    case "MERGE":
                    case "PATCH":
                        oResponse = {
                            code: 204
                        };
                        break;
                    case "POST":
                        oResponse = {
                            code: 200,
                            headers: { "Content-Type": sJson },
                            message: oRequest.requestBody
                        };
                        break;
                }
            }
            if (oResponse) {
                Log.info(oRequest.method + " " + oRequest.url + (iAlternative !== undefined ? ", alternative (ifMatch) #" + iAlternative : ""), "{\"If-Match\":" + JSON.stringify(oRequest.requestHeaders["If-Match"]) + "}", "sap.ui.test.TestUtils");
            }
            else {
                oResponse = error(404, oRequest, "No mock data found");
            }
            oResponse.headers = jQuery.extend({}, getODataHeaders(oRequest), oResponse.headers);
            if (sContentId && oResponse.code < 300) {
                oResponse.contentId = sContentId;
            }
            return oResponse;
        }
        function multipart(sServiceBase, sBody) {
            var sBoundary;
            sBody = sBody.replace(/^\s+/, "");
            sBoundary = firstLine(sBody);
            return {
                boundary: firstLine(sBody).slice(2),
                parts: sBody.split(sBoundary).slice(1, -1).map(function (sRequestPart) {
                    var aFailures, sFirstLine, aMatch, oMultipart, oRequest, iRequestStart;
                    sRequestPart = sRequestPart.slice(2);
                    sFirstLine = firstLine(sRequestPart);
                    if (rMultipartHeader.test(sFirstLine)) {
                        oMultipart = multipart(sServiceBase, sRequestPart.slice(sFirstLine.length + 4));
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
        function parseRequest(sServiceBase, sRequest) {
            var iBodySeparator = sRequest.indexOf("\r\n\r\n"), aLines, aMatches, oRequest = { requestHeaders: {} };
            oRequest.requestBody = sRequest.slice(iBodySeparator + 4, sRequest.length - 2);
            sRequest = sRequest.slice(0, iBodySeparator);
            aLines = sRequest.split("\r\n");
            oRequest.requestLine = aLines.shift();
            aMatches = rRequestLine.exec(oRequest.requestLine);
            if (aMatches) {
                oRequest.method = aMatches[1];
                oRequest.url = sServiceBase + aMatches[2];
                aLines.forEach(function (sLine) {
                    var aMatches = rHeaderLine.exec(sLine);
                    if (aMatches) {
                        oRequest.requestHeaders[aMatches[1]] = aMatches[2];
                    }
                });
            }
            return oRequest;
        }
        function post(oRequest) {
            var sUrl = oRequest.url;
            if (rBatch.test(sUrl)) {
                batch(sUrl.slice(0, sUrl.indexOf("/$batch") + 1), oRequest);
            }
            else {
                respondFromFixture(oRequest);
            }
        }
        function readMessage(sPath) {
            var sMessage = mMessageForPath[sPath];
            if (!sMessage) {
                jQuery.ajax({
                    async: false,
                    url: sPath,
                    dataType: "text",
                    success: function (sBody) {
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
        function respondFromFixture(oRequest) {
            var oResponse = getResponseFromFixture(oRequest);
            iRequestCount += 1;
            oRequest.respond(oResponse.code, oResponse.headers, oResponse.message);
        }
        function setupServer() {
            var fnRestore, oServer;
            mUrlToResponses = buildResponses();
            if (aRegExps) {
                aRegexpResponses = aRegExps.map(function (oRegExpFixture) {
                    return {
                        regExp: oRegExpFixture.regExp,
                        response: Array.isArray(oRegExpFixture.response) ? oRegExpFixture.response.map(buildResponse) : [buildResponse(oRegExpFixture.response)]
                    };
                });
            }
            oServer = sinon.fakeServer.create();
            oSandbox.add(oServer);
            oServer.autoRespond = true;
            if (sAutoRespondAfter) {
                oServer.autoRespondAfter = parseInt(sAutoRespondAfter);
            }
            oServer.respondWith("GET", /./, respondFromFixture);
            oServer.respondWith("DELETE", /./, respondFromFixture);
            oServer.respondWith("HEAD", /./, respondFromFixture);
            oServer.respondWith("PATCH", /./, respondFromFixture);
            oServer.respondWith("MERGE", /./, respondFromFixture);
            oServer.respondWith("POST", /./, post);
            fnRestore = oServer.restore;
            oServer.restore = function () {
                sinon.FakeXMLHttpRequest.filters = [];
                fnRestore.apply(this, arguments);
            };
            sinon.xhr.supportsCORS = jQuery.support.cors;
            sinon.FakeXMLHttpRequest.useFilters = true;
            sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl) {
                var bOurs = getMatchingResponse(sMethod, sUrl) || (sServiceUrl ? sUrl.startsWith(sServiceUrl) || rBatch.test(sUrl) : sMethod === "DELETE" || sMethod === "HEAD" || sMethod === "MERGE" || sMethod === "PATCH" || sMethod === "POST");
                return !bOurs;
            });
            return oServer;
        }
        sBase = sap.ui.require.toUrl(sBase).replace(/(^|\/)resources\/(~[-a-zA-Z0-9_.]*~\/)?/, "$1test-resources/") + "/";
        return setupServer();
    },
    withNormalizedMessages: function (fnCodeUnderTest) {
        var oSandbox = sinon.sandbox.create();
        try {
            var oCore = sap.ui.getCore(), fnGetBundle = oCore.getLibraryResourceBundle;
            oSandbox.stub(oCore, "getLibraryResourceBundle").returns({
                getText: function (sKey, aArgs) {
                    var sResult = sKey, sText = fnGetBundle.call(oCore).getText(sKey), i;
                    for (i = 0; i < 10; i += 1) {
                        if (sText.indexOf("{" + i + "}") >= 0) {
                            sResult += " " + (i >= aArgs.length ? "{" + i + "}" : aArgs[i]);
                        }
                    }
                    return sResult;
                }
            });
            fnCodeUnderTest.apply(this);
        }
        finally {
            oSandbox.verifyAndRestore();
        }
    },
    isRealOData: function () {
        if (sRealOData === "proxy") {
            throw new Error("realOData=proxy is no longer supported");
        }
        return bRealOData;
    },
    isSupportAssistant: function () {
        return bSupportAssistant;
    },
    getRealOData: function () {
        return sRealOData ? "&realOData=" + sRealOData : "";
    },
    getRequestCount: function () {
        return iRequestCount;
    },
    proxy: function (sAbsolutePath) {
        Log.warning("#proxy is no longer supported", null, "sap.ui.test.TestUtils");
        return sAbsolutePath;
    },
    resetRequestCount: function () {
        iRequestCount = 0;
    },
    retrieveData: function (sKey) {
        var vValue = mData[sKey];
        delete mData[sKey];
        return vValue;
    },
    setData: function (sKey, vValue) {
        mData[sKey] = vValue;
    },
    setupODataV4Server: function (oSandbox, mFixture, sSourceBase, sFilterBase, aRegExps) {
        var mResultingFixture = {};
        if (this.isRealOData()) {
            return;
        }
        if (!sFilterBase) {
            sFilterBase = "/";
        }
        else if (sFilterBase.slice(-1) !== "/") {
            sFilterBase += "/";
        }
        Object.keys(mFixture).forEach(function (sRequest) {
            var aMatches = rRequestKey.exec(sRequest), sMethod, sUrl;
            if (aMatches) {
                sMethod = aMatches[1] || "GET";
                sUrl = aMatches[2];
            }
            else {
                sMethod = "GET";
                sUrl = sRequest;
            }
            if (!sUrl.startsWith("/")) {
                sUrl = sFilterBase + sUrl;
            }
            mResultingFixture[sMethod + " " + sUrl] = mFixture[sRequest];
        });
        TestUtils.useFakeServer(oSandbox, sSourceBase || "sap/ui/core/qunit/odata/v4/data", mResultingFixture, aRegExps, sFilterBase !== "/" ? sFilterBase : undefined);
    }
};
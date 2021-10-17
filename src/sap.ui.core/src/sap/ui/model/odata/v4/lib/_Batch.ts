import _Helper from "./_Helper";
import escapeRegExp from "sap/base/strings/escapeRegExp";
var mAllowedChangeSetMethods = { "POST": true, "PUT": true, "PATCH": true, "DELETE": true }, rContentIdReference = /^\$\d+/, rHeaderParameter = /(\S*?)=(?:"(.+)"|(\S+))/;
function getBoundaryRegExp(sContentType) {
    var sBatchBoundary = getHeaderParameterValue(sContentType, "boundary"), iMultiPartTypeIndex = sContentType.trim().indexOf("multipart/mixed");
    if (iMultiPartTypeIndex !== 0 || !sBatchBoundary) {
        throw new Error("Invalid $batch response header \"Content-Type\": " + sContentType);
    }
    sBatchBoundary = escapeRegExp(sBatchBoundary);
    return new RegExp("--" + sBatchBoundary + "(?:[ \t]*\r\n|--)");
}
function getHeaderParameterValue(sHeaderValue, sParameterName) {
    var iParamIndex, aHeaderParts = sHeaderValue.split(";"), aMatches;
    sParameterName = sParameterName.toLowerCase();
    for (iParamIndex = 1; iParamIndex < aHeaderParts.length; iParamIndex += 1) {
        aMatches = rHeaderParameter.exec(aHeaderParts[iParamIndex]);
        if (aMatches[1].toLowerCase() === sParameterName) {
            return aMatches[2] || aMatches[3];
        }
    }
}
function getChangeSetContentType(sMimeTypeHeaders) {
    var sContentType = getHeaderValue(sMimeTypeHeaders, "content-type");
    return sContentType.startsWith("multipart/mixed;") ? sContentType : undefined;
}
function getChangeSetResponseIndex(sMimeTypeHeaders) {
    var sContentID = getHeaderValue(sMimeTypeHeaders, "content-id"), iResponseIndex;
    if (!sContentID) {
        throw new Error("Content-ID MIME header missing for the change set response.");
    }
    iResponseIndex = parseInt(sContentID);
    if (isNaN(iResponseIndex)) {
        throw new Error("Invalid Content-ID value in change set response.");
    }
    return iResponseIndex;
}
function getHeaderValue(sHeaders, sHeaderName) {
    var aHeaderParts, aHeaders = sHeaders.split("\r\n"), i;
    for (i = 0; i < aHeaders.length; i += 1) {
        aHeaderParts = aHeaders[i].split(":");
        if (aHeaderParts[0].toLowerCase().trim() === sHeaderName) {
            return aHeaderParts[1].trim();
        }
    }
}
function _deserializeBatchResponse(sContentType, sResponseBody, bIsChangeSet) {
    var aBatchParts = sResponseBody.split(getBoundaryRegExp(sContentType)), aResponses = [];
    aBatchParts = aBatchParts.slice(1, -1);
    aBatchParts.forEach(function (sBatchPart) {
        var sChangeSetContentType, sCharset, iColonIndex, sHeader, sHeaderName, sHeaderValue, aHttpHeaders, sHttpHeaders, iHttpHeadersEnd, aHttpStatusInfos, sMimeHeaders, iMimeHeadersEnd, oResponse = {}, iResponseIndex, i;
        iMimeHeadersEnd = sBatchPart.indexOf("\r\n\r\n");
        sMimeHeaders = sBatchPart.slice(0, iMimeHeadersEnd);
        iHttpHeadersEnd = sBatchPart.indexOf("\r\n\r\n", iMimeHeadersEnd + 4);
        sHttpHeaders = sBatchPart.slice(iMimeHeadersEnd + 4, iHttpHeadersEnd);
        sChangeSetContentType = getChangeSetContentType(sMimeHeaders);
        if (sChangeSetContentType) {
            aResponses.push(_deserializeBatchResponse(sChangeSetContentType, sBatchPart.slice(iMimeHeadersEnd + 4), true));
            return;
        }
        aHttpHeaders = sHttpHeaders.split("\r\n");
        aHttpStatusInfos = aHttpHeaders[0].split(" ");
        oResponse.status = parseInt(aHttpStatusInfos[1]);
        oResponse.statusText = aHttpStatusInfos.slice(2).join(" ");
        oResponse.headers = {};
        for (i = 1; i < aHttpHeaders.length; i += 1) {
            sHeader = aHttpHeaders[i];
            iColonIndex = sHeader.indexOf(":");
            sHeaderName = sHeader.slice(0, iColonIndex).trim();
            sHeaderValue = sHeader.slice(iColonIndex + 1).trim();
            oResponse.headers[sHeaderName] = sHeaderValue;
            if (sHeaderName.toLowerCase() === "content-type") {
                sCharset = getHeaderParameterValue(sHeaderValue, "charset");
                if (sCharset && sCharset.toLowerCase() !== "utf-8") {
                    throw new Error("Unsupported \"Content-Type\" charset: " + sCharset);
                }
            }
        }
        oResponse.responseText = sBatchPart.slice(iHttpHeadersEnd + 4, -2);
        if (bIsChangeSet) {
            iResponseIndex = getChangeSetResponseIndex(sMimeHeaders);
            aResponses[iResponseIndex] = oResponse;
        }
        else {
            aResponses.push(oResponse);
        }
    });
    return aResponses;
}
function serializeHeaders(mHeaders) {
    var sHeaderName, aHeaders = [];
    for (sHeaderName in mHeaders) {
        aHeaders.push(sHeaderName, ":", mHeaders[sHeaderName], "\r\n");
    }
    return aHeaders;
}
function _serializeBatchRequest(aRequests, iChangeSetIndex, sEpilogue) {
    var sBatchBoundary = (iChangeSetIndex !== undefined ? "changeset_" : "batch_") + _Helper.uid(), bIsChangeSet = iChangeSetIndex !== undefined, aRequestBody = [];
    if (bIsChangeSet) {
        aRequestBody.push("Content-Type: multipart/mixed;boundary=", sBatchBoundary, "\r\n\r\n");
    }
    aRequests.forEach(function (oRequest, iRequestIndex) {
        var sContentIdHeader = "", sUrl = oRequest.url;
        if (bIsChangeSet) {
            oRequest.$ContentID = iRequestIndex + "." + iChangeSetIndex;
            sContentIdHeader = "Content-ID:" + oRequest.$ContentID + "\r\n";
        }
        aRequestBody.push("--", sBatchBoundary, "\r\n");
        if (Array.isArray(oRequest)) {
            if (bIsChangeSet) {
                throw new Error("Change set must not contain a nested change set.");
            }
            aRequestBody = aRequestBody.concat(_serializeBatchRequest(oRequest, iRequestIndex).body);
        }
        else {
            if (bIsChangeSet && !mAllowedChangeSetMethods[oRequest.method]) {
                throw new Error("Invalid HTTP request method: " + oRequest.method + ". Change set must contain only POST, PUT, PATCH, or DELETE requests.");
            }
            if (iChangeSetIndex !== undefined && sUrl[0] === "$") {
                sUrl = sUrl.replace(rContentIdReference, "$&." + iChangeSetIndex);
            }
            aRequestBody = aRequestBody.concat("Content-Type:application/http\r\n", "Content-Transfer-Encoding:binary\r\n", sContentIdHeader, "\r\n", oRequest.method, " ", sUrl, " HTTP/1.1\r\n", serializeHeaders(_Helper.resolveIfMatchHeader(oRequest.headers)), "\r\n", JSON.stringify(oRequest.body) || "", "\r\n");
        }
    });
    aRequestBody.push("--", sBatchBoundary, "--\r\n", sEpilogue);
    return { body: aRequestBody, batchBoundary: sBatchBoundary };
}
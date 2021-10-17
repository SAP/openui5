import JSONModel from "sap/ui/model/json/JSONModel";
import sinon from "sap/ui/thirdparty/sinon";
import Log from "sap/base/Log";
var oSandbox = sinon.sandbox.create(), aUsers, sMetadata, sNamespace = "sap/ui/core/tutorial/odatav4", sLogComponent = "sap.ui.core.tutorial.odatav4.mockserver", rBaseUrl = /services.odata.org\/TripPinRESTierService/;
function getBaseUrl(sUrl) {
    var aMatches = sUrl.match(/http.+\(S\(.+\)\)\//);
    if (!Array.isArray(aMatches) || aMatches.length < 1) {
        throw new Error("Could not find a base URL in " + sUrl);
    }
    return aMatches[0];
}
function findUserIndex(sUserName) {
    for (var i = 0; i < aUsers.length; i++) {
        if (aUsers[i].UserName === sUserName) {
            return i;
        }
    }
    return -1;
}
function getUserDataFromRequestBody(sBody) {
    var aMatches = sBody.match(/({.+})/);
    if (!Array.isArray(aMatches) || aMatches.length !== 2) {
        throw new Error("Could not find any user data in " + sBody);
    }
    return JSON.parse(aMatches[1]);
}
function getUserKeyFromUrl(sUrl) {
    var aMatches = [];
    aMatches = sUrl.match(/People\('(.*)'\)/);
    return aMatches ? aMatches[1] : undefined;
}
function isUnique(sUserName) {
    return findUserIndex(sUserName) < 0;
}
function duplicateKeyError(sKey) {
    return JSON.stringify({
        error: {
            code: "409",
            message: "There is already a user with user name '" + sKey + "'.",
            target: "UserName"
        }
    });
}
function invalidKeyError(sKey) {
    return JSON.stringify({
        error: {
            code: "404",
            message: "There is no user with user name '" + sKey + "'.",
            target: "UserName"
        }
    });
}
function getSuccessResponse(sResponseBody) {
    return [
        200,
        {
            "Content-Type": "application/json; odata.metadata=minimal",
            "OData-Version": "4.0"
        },
        sResponseBody
    ];
}
function readData() {
    var oMetadataPromise = new Promise(function (fnResolve, fnReject) {
        var sResourcePath = sap.ui.require.toUrl(sNamespace + "/localService/metadata.xml");
        var oRequest = new XMLHttpRequest();
        oRequest.onload = function () {
            if (oRequest.status === 404) {
                var sError = "resource " + sResourcePath + " not found";
                Log.error(sError, sLogComponent);
                fnReject(new Error(sError, sLogComponent));
            }
            sMetadata = this.responseText;
            fnResolve();
        };
        oRequest.onerror = function () {
            var sError = "error loading resource '" + sResourcePath + "'";
            Log.error(sError, sLogComponent);
            fnReject(new Error(sError, sLogComponent));
        };
        oRequest.open("GET", sResourcePath);
        oRequest.send();
    });
    var oMockDataPromise = new Promise(function (fnResolve, fnReject) {
        var sResourcePath = sap.ui.require.toUrl(sNamespace + "/localService/mockdata/people.json");
        var oMockDataModel = new JSONModel(sResourcePath);
        oMockDataModel.attachRequestCompleted(function (oEvent) {
            if (oEvent.getParameter("errorobject") && oEvent.getParameter("errorobject").statusCode === 404) {
                var sError = "resource '" + sResourcePath + "' not found";
                Log.error(sError, sLogComponent);
                fnReject(new Error(sError, sLogComponent));
            }
            aUsers = this.getData().value;
            fnResolve();
        });
        oMockDataModel.attachRequestFailed(function () {
            var sError = "error loading resource '" + sResourcePath + "'";
            Log.error(sError, sLogComponent);
            fnReject(new Error(sError, sLogComponent));
        });
    });
    return Promise.all([oMetadataPromise, oMockDataPromise]);
}
function applySkipTop(oXhr, aResultSet) {
    var iSkip, iTop, aReducedUsers = [].concat(aResultSet), aMatches = oXhr.url.match(/\$skip=(\d+)&\$top=(\d+)/);
    if (Array.isArray(aMatches) && aMatches.length >= 3) {
        iSkip = aMatches[1];
        iTop = aMatches[2];
        return aResultSet.slice(iSkip, iSkip + iTop);
    }
    return aReducedUsers;
}
function applySort(oXhr, aResultSet) {
    var sFieldName, sDirection, aSortedUsers = [].concat(aResultSet), aMatches = oXhr.url.match(/\$orderby=(\w*)(?:%20(\w*))?/);
    if (!Array.isArray(aMatches) || aMatches.length < 2) {
        return aSortedUsers;
    }
    else {
        sFieldName = aMatches[1];
        sDirection = aMatches[2] || "asc";
        if (sFieldName !== "LastName") {
            throw new Error("Filters on field " + sFieldName + " are not supported.");
        }
        aSortedUsers.sort(function (a, b) {
            var nameA = a.LastName.toUpperCase();
            var nameB = b.LastName.toUpperCase();
            var bAsc = sDirection === "asc";
            if (nameA < nameB) {
                return bAsc ? -1 : 1;
            }
            if (nameA > nameB) {
                return bAsc ? 1 : -1;
            }
            return 0;
        });
        return aSortedUsers;
    }
}
function applyFilter(oXhr, aResultSet) {
    var sFieldName, sQuery, aFilteredUsers = [].concat(aResultSet), aMatches = oXhr.url.match(/\$filter=.*\((.*),'(.*)'\)/);
    if (Array.isArray(aMatches) && aMatches.length >= 3) {
        sFieldName = aMatches[1];
        sQuery = aMatches[2];
        if (sFieldName !== "LastName") {
            throw new Error("Filters on field " + sFieldName + " are not supported.");
        }
        aFilteredUsers = aUsers.filter(function (oUser) {
            return oUser.LastName.indexOf(sQuery) !== -1;
        });
    }
    return aFilteredUsers;
}
function handleGetMetadataRequests() {
    return [
        200,
        {
            "Content-Type": "application/xml",
            "odata-version": "4.0"
        },
        sMetadata
    ];
}
function handleGetCountRequests() {
    return getSuccessResponse(aUsers.length.toString());
}
function handleGetUserRequests(oXhr, bCount) {
    var iCount, aExpand, sExpand, iIndex, sKey, oResponse, sResponseBody, aResult, aSelect, sSelect, aSubSelects;
    aExpand = oXhr.url.match(/\$expand=([^&]+)/);
    if (aExpand) {
        sExpand = aExpand[0];
        sExpand = sExpand.substring(8);
        aSubSelects = sExpand.match(/\([^\)]*\)/g);
        for (var i = 0; i < aSubSelects.length; i++) {
            aSubSelects[i] = aSubSelects[i].replace(/\(\$select=/, "").replace(/\)/, "").split(",");
        }
        sExpand = sExpand.replace(/\([^\)]*\)/g, "");
        aExpand = sExpand.split(",");
    }
    aSelect = oXhr.url.match(/[^(]\$select=([\w|,]+)/);
    if (Array.isArray(aSelect)) {
        sSelect = aSelect[0];
        sSelect = sSelect.replace(/&/, "").replace(/\?/, "").substring(8);
        aSelect = sSelect.split(",");
    }
    sKey = getUserKeyFromUrl(oXhr.url);
    if (sKey) {
        iIndex = findUserIndex(sKey);
        if (/People\(.+\)\/Friends/.test(oXhr.url)) {
            oResponse = { value: [] };
            oResponse.value = createFriendsArray(aUsers[iIndex].Friends, aSelect);
        }
        else {
            oResponse = getUserObject(iIndex, aSelect, aExpand, aSubSelects);
        }
        if (iIndex > -1) {
            sResponseBody = JSON.stringify(oResponse);
            return getSuccessResponse(sResponseBody);
        }
        else {
            sResponseBody = invalidKeyError(sKey);
            return [
                400,
                {
                    "Content-Type": "application/json; charset=utf-8"
                },
                sResponseBody
            ];
        }
    }
    else {
        aResult = applyFilter(oXhr, aUsers);
        iCount = aResult.length;
        aResult = applySort(oXhr, aResult);
        aResult = applySkipTop(oXhr, aResult);
        oResponse = { "@odata.count": iCount, value: [] };
        aResult.forEach(function (oUser) {
            var iUserIndex = findUserIndex(oUser.UserName);
            oResponse.value.push(getUserObject(iUserIndex, aSelect, aExpand, aSubSelects));
        });
        sResponseBody = JSON.stringify(oResponse);
        return getSuccessResponse(sResponseBody);
    }
}
function getUserByIndex(iIndex, aProperties) {
    var oHelper = {}, oUser = aUsers[iIndex];
    if (oUser) {
        aProperties.forEach(function (selectProperty) {
            oHelper[selectProperty] = oUser[selectProperty];
        });
        return oHelper;
    }
    else {
        return null;
    }
}
function getUserObject(iIndex, aSelect, aExpand, aSubSelects) {
    var sBestFriend, iFriendIndex, aFriends, oObject = {}, oUser;
    oObject = getUserByIndex(iIndex, aSelect);
    if (aExpand) {
        oUser = aUsers[iIndex];
        for (var i = 0; i < aExpand.length; i++) {
            switch (aExpand[i]) {
                case "Friends":
                    oObject.Friends = [];
                    aFriends = oUser.Friends;
                    oObject.Friends = createFriendsArray(aFriends, aSubSelects[i]);
                    break;
                case "BestFriend":
                    sBestFriend = oUser.BestFriend;
                    iFriendIndex = findUserIndex(sBestFriend);
                    oObject.BestFriend = getUserByIndex(iFriendIndex, aSubSelects[i]);
                    break;
                default: break;
            }
        }
    }
    return oObject;
}
function createFriendsArray(aFriends, aSubSelects) {
    var aArray = [], iFriendIndex;
    if (aFriends) {
        aFriends.forEach(function (sFriend) {
            iFriendIndex = findUserIndex(sFriend);
            aArray.push(getUserByIndex(iFriendIndex, aSubSelects));
        });
        aArray = aArray.filter(function (element) {
            return element != null;
        });
    }
    return aArray;
}
function handlePatchUserRequests(oXhr) {
    var sKey, oUser, oChanges, sResponseBody;
    sKey = getUserKeyFromUrl(oXhr.url);
    oChanges = getUserDataFromRequestBody(oXhr.requestBody);
    if (oChanges.hasOwnProperty("UserName") && oChanges.UserName !== sKey && !isUnique(oChanges.UserName)) {
        sResponseBody = duplicateKeyError(oChanges.UserName);
        return [
            400,
            {
                "Content-Type": "application/json; charset=utf-8"
            },
            sResponseBody
        ];
    }
    else {
        oUser = aUsers[findUserIndex(sKey)];
        for (var sFieldName in oChanges) {
            if (oChanges.hasOwnProperty(sFieldName)) {
                oUser[sFieldName] = oChanges[sFieldName];
            }
        }
        sResponseBody = null;
        return [
            204,
            {
                "OData-Version": "4.0"
            },
            sResponseBody
        ];
    }
}
function handleDeleteUserRequests(oXhr) {
    var sKey;
    sKey = getUserKeyFromUrl(oXhr.url);
    aUsers.splice(findUserIndex(sKey), 1);
    return [
        204,
        {
            "OData-Version": "4.0"
        },
        null
    ];
}
function handlePostUserRequests(oXhr) {
    var oUser, sResponseBody;
    oUser = getUserDataFromRequestBody(oXhr.requestBody);
    if (isUnique(oUser.UserName)) {
        aUsers.push(oUser);
        sResponseBody = "{\"@odata.context\": \"" + getBaseUrl(oXhr.url) + "$metadata#People/$entity\",";
        sResponseBody += JSON.stringify(oUser).slice(1);
        return [
            201,
            {
                "Content-Type": "application/json; odata.metadata=minimal",
                "OData-Version": "4.0"
            },
            sResponseBody
        ];
    }
    else {
        sResponseBody = duplicateKeyError(oUser.UserName);
        return [
            400,
            {
                "Content-Type": "application/json; charset=utf-8"
            },
            sResponseBody
        ];
    }
}
function handleResetDataRequest() {
    readData();
    return [
        204,
        {
            "OData-Version": "4.0"
        },
        null
    ];
}
function handleDirectRequest(oXhr) {
    var aResponse;
    switch (oXhr.method) {
        case "GET":
            if (/\$metadata/.test(oXhr.url)) {
                aResponse = handleGetMetadataRequests();
            }
            else if (/\/\$count/.test(oXhr.url)) {
                aResponse = handleGetCountRequests();
            }
            else if (/People.*\?/.test(oXhr.url)) {
                aResponse = handleGetUserRequests(oXhr, /\$count=true/.test(oXhr.url));
            }
            break;
        case "PATCH":
            if (/People/.test(oXhr.url)) {
                aResponse = handlePatchUserRequests(oXhr);
            }
            break;
        case "POST":
            if (/People/.test(oXhr.url)) {
                aResponse = handlePostUserRequests(oXhr);
            }
            else if (/ResetDataSource/.test(oXhr.url)) {
                aResponse = handleResetDataRequest();
            }
            break;
        case "DELETE":
            if (/People/.test(oXhr.url)) {
                aResponse = handleDeleteUserRequests(oXhr);
            }
            break;
        default: break;
    }
    return aResponse;
}
function handleBatchRequest(oXhr) {
    var aResponse, sResponseBody = "", sOuterBoundary = oXhr.requestBody.match(/(.*)/)[1], sInnerBoundary, sPartBoundary, aOuterParts = oXhr.requestBody.split(sOuterBoundary).slice(1, -1), aParts, aMatches;
    aMatches = aOuterParts[0].match(/multipart\/mixed;boundary=(.+)/);
    if (aMatches && aMatches.length > 0) {
        sInnerBoundary = aMatches[1];
        aParts = aOuterParts[0].split("--" + sInnerBoundary).slice(1, -1);
    }
    else {
        aParts = aOuterParts;
    }
    if (sInnerBoundary) {
        sPartBoundary = "--" + sInnerBoundary;
        sResponseBody += sOuterBoundary + "\r\n" + "Content-Type: multipart/mixed; boundary=" + sInnerBoundary + "\r\n\r\n";
    }
    else {
        sPartBoundary = sOuterBoundary;
    }
    aParts.forEach(function (sPart, iIndex) {
        var aMatches = sPart.match(/(GET|DELETE|PATCH|POST) (\S+)(?:.|\r?\n)+\r?\n(.*)\r?\n$/);
        var aPartResponse = handleDirectRequest({
            method: aMatches[1],
            url: getBaseUrl(oXhr.url) + aMatches[2],
            requestBody: aMatches[3]
        });
        sResponseBody += sPartBoundary + "\r\n" + "Content-Type: application/http\r\n";
        if (sInnerBoundary) {
            sResponseBody += "Content-ID:" + iIndex + ".0\r\n";
        }
        sResponseBody += "\r\nHTTP/1.1 " + aPartResponse[0] + "\r\n";
        if (aPartResponse[1] && aPartResponse[0] !== 204) {
            for (var sHeader in aPartResponse[1]) {
                if (aPartResponse[1].hasOwnProperty(sHeader)) {
                    sResponseBody += sHeader + ": " + aPartResponse[1][sHeader] + "\r\n";
                }
            }
        }
        sResponseBody += "\r\n";
        if (aPartResponse[2]) {
            sResponseBody += aPartResponse[2];
        }
        sResponseBody += "\r\n";
    });
    if (sInnerBoundary) {
        sResponseBody += "--" + sInnerBoundary + "--\r\n";
    }
    sResponseBody += sOuterBoundary + "--";
    aResponse = [
        200,
        {
            "Content-Type": "multipart/mixed;boundary=" + sOuterBoundary.slice(2),
            "OData-Version": "4.0"
        },
        sResponseBody
    ];
    return aResponse;
}
function handleAllRequests(oXhr) {
    var aResponse;
    Log.info("Mockserver: Received " + oXhr.method + " request to URL " + oXhr.url, (oXhr.requestBody ? "Request body is:\n" + oXhr.requestBody : "No request body.") + "\n", sLogComponent);
    if (oXhr.method === "POST" && /\$batch$/.test(oXhr.url)) {
        aResponse = handleBatchRequest(oXhr);
    }
    else {
        aResponse = handleDirectRequest(oXhr);
    }
    oXhr.respond(aResponse[0], aResponse[1], aResponse[2]);
    Log.info("Mockserver: Sent response with return code " + aResponse[0], ("Response headers: " + JSON.stringify(aResponse[1]) + "\n\nResponse body:\n" + aResponse[2]) + "\n", sLogComponent);
}
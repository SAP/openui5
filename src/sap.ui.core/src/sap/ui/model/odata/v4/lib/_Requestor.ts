import _Batch from "./_Batch";
import _GroupLock from "./_GroupLock";
import _Helper from "./_Helper";
import asV2Requestor from "./_V2Requestor";
import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import jQuery from "sap/ui/thirdparty/jquery";
var mBatchHeaders = {
    "Accept": "multipart/mixed"
}, sClassName = "sap.ui.model.odata.v4.lib._Requestor", rSystemQueryOptionWithPlaceholder = /(\$\w+)=~/g, rTimeout = /^\d+$/;
function getResponseHeader(sHeaderName) {
    var sResponseHeader;
    sHeaderName = sHeaderName.toLowerCase();
    for (sResponseHeader in this.headers) {
        if (sResponseHeader.toLowerCase() === sHeaderName) {
            return this.headers[sResponseHeader];
        }
    }
}
function _Requestor(sServiceUrl, mHeaders, mQueryParams, oModelInterface) {
    this.mBatchQueue = {};
    this.mHeaders = mHeaders || {};
    this.aLockedGroupLocks = [];
    this.oModelInterface = oModelInterface;
    this.sQueryParams = _Helper.buildQuery(mQueryParams);
    this.mRunningChangeRequests = {};
    this.iSessionTimer = 0;
    this.iSerialNumber = 0;
    this.sServiceUrl = sServiceUrl;
    this.vStatistics = mQueryParams && mQueryParams["sap-statistics"];
    this.processSecurityTokenHandlers();
}
_Requestor.prototype.mFinalHeaders = {
    "Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true"
};
_Requestor.prototype.mPredefinedPartHeaders = {
    "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true"
};
_Requestor.prototype.mPredefinedRequestHeaders = {
    "Accept": "application/json;odata.metadata=minimal;IEEE754Compatible=true",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    "X-CSRF-Token": "Fetch"
};
_Requestor.prototype.mReservedHeaders = {
    accept: true,
    "accept-charset": true,
    "content-encoding": true,
    "content-id": true,
    "content-language": true,
    "content-length": true,
    "content-transfer-encoding": true,
    "content-type": true,
    "if-match": true,
    "if-none-match": true,
    isolation: true,
    "odata-isolation": true,
    "odata-maxversion": true,
    "odata-version": true,
    prefer: true,
    "sap-contextid": true
};
_Requestor.prototype.addChangeSet = function (sGroupId) {
    var aChangeSet = [], aRequests = this.getOrCreateBatchQueue(sGroupId);
    aChangeSet.iSerialNumber = this.getSerialNumber();
    aRequests.iChangeSet += 1;
    aRequests.splice(aRequests.iChangeSet, 0, aChangeSet);
};
_Requestor.prototype.addChangeToGroup = function (oChange, sGroupId) {
    var aRequests;
    if (this.getGroupSubmitMode(sGroupId) === "Direct") {
        oChange.$resolve(this.request(oChange.method, oChange.url, this.lockGroup(sGroupId, this, true, true), oChange.headers, oChange.body, oChange.$submit, oChange.$cancel));
    }
    else {
        aRequests = this.getOrCreateBatchQueue(sGroupId);
        aRequests[aRequests.iChangeSet].push(oChange);
    }
};
_Requestor.prototype.addQueryString = function (sResourcePath, sMetaPath, mQueryOptions) {
    var sQueryString;
    mQueryOptions = this.convertQueryOptions(sMetaPath, mQueryOptions, false, true);
    sResourcePath = sResourcePath.replace(rSystemQueryOptionWithPlaceholder, function (_sString, sOption) {
        var sValue = mQueryOptions[sOption];
        delete mQueryOptions[sOption];
        return _Helper.encodePair(sOption, sValue);
    });
    sQueryString = _Helper.buildQuery(mQueryOptions);
    if (!sQueryString) {
        return sResourcePath;
    }
    return sResourcePath + (sResourcePath.includes("?") ? "&" + sQueryString.slice(1) : sQueryString);
};
_Requestor.prototype.batchRequestSent = function (sGroupId, aRequests, bHasChanges) {
    var oPromise, fnResolve;
    if (bHasChanges) {
        if (!(sGroupId in this.mRunningChangeRequests)) {
            this.mRunningChangeRequests[sGroupId] = [];
        }
        oPromise = new SyncPromise(function (resolve) {
            fnResolve = resolve;
        });
        oPromise.$resolve = fnResolve;
        oPromise.$requests = aRequests;
        this.mRunningChangeRequests[sGroupId].push(oPromise);
    }
};
_Requestor.prototype.batchResponseReceived = function (sGroupId, aRequests, bHasChanges) {
    var aPromises;
    if (bHasChanges) {
        aPromises = this.mRunningChangeRequests[sGroupId].filter(function (oPromise) {
            if (oPromise.$requests === aRequests) {
                oPromise.$resolve();
                return false;
            }
            return true;
        });
        if (aPromises.length) {
            this.mRunningChangeRequests[sGroupId] = aPromises;
        }
        else {
            delete this.mRunningChangeRequests[sGroupId];
        }
    }
};
_Requestor.prototype.buildQueryString = function (sMetaPath, mQueryOptions, bDropSystemQueryOptions, bSortExpandSelect) {
    return _Helper.buildQuery(this.convertQueryOptions(sMetaPath, mQueryOptions, bDropSystemQueryOptions, bSortExpandSelect));
};
_Requestor.prototype.cancelChanges = function (sGroupId) {
    if (this.mRunningChangeRequests[sGroupId]) {
        throw new Error("Cannot cancel the changes for group '" + sGroupId + "', the batch request is running");
    }
    this.cancelChangesByFilter(function () {
        return true;
    }, sGroupId);
    this.cancelGroupLocks(sGroupId);
};
_Requestor.prototype.cancelChangesByFilter = function (fnFilter, sGroupId) {
    var bCanceled = false, that = this;
    function cancelGroupChangeRequests(sGroupId0) {
        var aBatchQueue = that.mBatchQueue[sGroupId0], oChangeRequest, aChangeSet, oError, i, j;
        for (j = aBatchQueue.length - 1; j >= 0; j -= 1) {
            if (Array.isArray(aBatchQueue[j])) {
                aChangeSet = aBatchQueue[j];
                for (i = aChangeSet.length - 1; i >= 0; i -= 1) {
                    oChangeRequest = aChangeSet[i];
                    if (oChangeRequest.$cancel && fnFilter(oChangeRequest)) {
                        oChangeRequest.$cancel();
                        oError = new Error("Request canceled: " + oChangeRequest.method + " " + oChangeRequest.url + "; group: " + sGroupId0);
                        oError.canceled = true;
                        oChangeRequest.$reject(oError);
                        aChangeSet.splice(i, 1);
                        bCanceled = true;
                    }
                }
            }
        }
    }
    if (sGroupId) {
        if (this.mBatchQueue[sGroupId]) {
            cancelGroupChangeRequests(sGroupId);
        }
    }
    else {
        for (sGroupId in this.mBatchQueue) {
            cancelGroupChangeRequests(sGroupId);
        }
    }
    return bCanceled;
};
_Requestor.prototype.cancelGroupLocks = function (sGroupId) {
    this.aLockedGroupLocks.forEach(function (oGroupLock) {
        if ((!sGroupId || sGroupId === oGroupLock.getGroupId()) && oGroupLock.isModifying() && oGroupLock.isLocked()) {
            oGroupLock.cancel();
        }
    });
};
_Requestor.prototype.checkConflictingStrictRequest = function (oRequest, aRequests, iChangeSetNo) {
    function isOtherChangeSetWithStrictHandling(aChangeSet, i) {
        return iChangeSetNo !== i && aChangeSet.some(isUsingStrictHandling);
    }
    function isUsingStrictHandling(oRequest) {
        return oRequest.headers["Prefer"] === "handling=strict";
    }
    if (isUsingStrictHandling(oRequest) && aRequests.slice(0, aRequests.iChangeSet + 1).some(isOtherChangeSetWithStrictHandling)) {
        throw new Error("All requests with strict handling must belong to the same change set");
    }
};
_Requestor.prototype.checkForOpenRequests = function () {
    var that = this;
    if (Object.keys(this.mRunningChangeRequests).length || Object.keys(this.mBatchQueue).some(function (sGroupId) {
        return that.mBatchQueue[sGroupId].some(function (vRequest) {
            return Array.isArray(vRequest) ? vRequest.length : true;
        });
    }) || this.aLockedGroupLocks.some(function (oGroupLock) {
        return oGroupLock.isLocked();
    })) {
        throw new Error("Unexpected open requests");
    }
};
_Requestor.prototype.checkHeaderNames = function (mHeaders) {
    var sKey;
    for (sKey in mHeaders) {
        if (this.mReservedHeaders[sKey.toLowerCase()]) {
            throw new Error("Unsupported header: " + sKey);
        }
    }
};
_Requestor.prototype.cleanUpChangeSets = function (aRequests) {
    var aChangeSet, bHasChanges = false, i;
    function addToChangeSet(oChange) {
        if (!mergePatch(oChange)) {
            aChangeSet.push(oChange);
        }
    }
    function mergePatch(oChange) {
        if (oChange.method !== "PATCH") {
            return false;
        }
        return aChangeSet.some(function (oCandidate) {
            if (oCandidate.method === "PATCH" && oCandidate.headers["If-Match"] === oChange.headers["If-Match"]) {
                _Helper.merge(oCandidate.body, oChange.body);
                oChange.$resolve(oCandidate.$promise);
                return true;
            }
        });
    }
    for (i = aRequests.iChangeSet; i >= 0; i -= 1) {
        aChangeSet = [];
        aRequests[i].forEach(addToChangeSet);
        if (aChangeSet.length === 0) {
            aRequests.splice(i, 1);
        }
        else if (aChangeSet.length === 1 && this.isChangeSetOptional()) {
            aRequests[i] = aChangeSet[0];
        }
        else {
            aRequests[i] = aChangeSet;
        }
        bHasChanges = bHasChanges || aChangeSet.length > 0;
    }
    return bHasChanges;
};
_Requestor.prototype.clearSessionContext = function (bTimeout) {
    if (bTimeout) {
        this.oModelInterface.fireSessionTimeout();
    }
    delete this.mHeaders["SAP-ContextId"];
    if (this.iSessionTimer) {
        clearInterval(this.iSessionTimer);
        this.iSessionTimer = 0;
    }
};
_Requestor.prototype.convertExpand = function (mExpandItems, bSortExpandSelect) {
    var aKeys, aResult = [], that = this;
    if (!mExpandItems || typeof mExpandItems !== "object") {
        throw new Error("$expand must be a valid object");
    }
    aKeys = Object.keys(mExpandItems);
    if (bSortExpandSelect) {
        aKeys = aKeys.sort();
    }
    aKeys.forEach(function (sExpandPath) {
        var vExpandOptions = mExpandItems[sExpandPath];
        if (vExpandOptions && typeof vExpandOptions === "object") {
            aResult.push(that.convertExpandOptions(sExpandPath, vExpandOptions, bSortExpandSelect));
        }
        else {
            aResult.push(sExpandPath);
        }
    });
    return aResult.join(",");
};
_Requestor.prototype.convertExpandOptions = function (sExpandPath, vExpandOptions, bSortExpandSelect) {
    var aExpandOptions = [];
    this.doConvertSystemQueryOptions(undefined, vExpandOptions, function (sOptionName, vOptionValue) {
        aExpandOptions.push(sOptionName + "=" + vOptionValue);
    }, undefined, bSortExpandSelect);
    return aExpandOptions.length ? sExpandPath + "(" + aExpandOptions.join(";") + ")" : sExpandPath;
};
_Requestor.prototype.convertQueryOptions = function (sMetaPath, mQueryOptions, bDropSystemQueryOptions, bSortExpandSelect) {
    var mConvertedQueryOptions = {};
    if (!mQueryOptions) {
        return undefined;
    }
    this.doConvertSystemQueryOptions(sMetaPath, mQueryOptions, function (sKey, vValue) {
        mConvertedQueryOptions[sKey] = vValue;
    }, bDropSystemQueryOptions, bSortExpandSelect);
    return mConvertedQueryOptions;
};
_Requestor.prototype.convertResourcePath = function (sResourcePath) {
    return sResourcePath;
};
_Requestor.prototype.destroy = function () {
    this.clearSessionContext();
};
_Requestor.prototype.doCheckVersionHeader = function (fnGetHeader, sResourcePath, bVersionOptional) {
    var sODataVersion = fnGetHeader("OData-Version"), vDataServiceVersion = !sODataVersion && fnGetHeader("DataServiceVersion");
    if (vDataServiceVersion) {
        throw new Error("Expected 'OData-Version' header with value '4.0' but received" + " 'DataServiceVersion' header with value '" + vDataServiceVersion + "' in response for " + this.sServiceUrl + sResourcePath);
    }
    if (sODataVersion === "4.0" || !sODataVersion && bVersionOptional) {
        return;
    }
    throw new Error("Expected 'OData-Version' header with value '4.0' but received value '" + sODataVersion + "' in response for " + this.sServiceUrl + sResourcePath);
};
_Requestor.prototype.doConvertResponse = function (oResponsePayload, _sMetaPath) {
    return oResponsePayload;
};
_Requestor.prototype.doConvertSystemQueryOptions = function (_sMetaPath, mQueryOptions, fnResultHandler, bDropSystemQueryOptions, bSortExpandSelect) {
    var that = this;
    Object.keys(mQueryOptions).forEach(function (sKey) {
        var vValue = mQueryOptions[sKey];
        if (bDropSystemQueryOptions && sKey[0] === "$") {
            return;
        }
        switch (sKey) {
            case "$expand":
                if (vValue !== "~") {
                    vValue = that.convertExpand(vValue, bSortExpandSelect);
                }
                break;
            case "$select":
                if (Array.isArray(vValue)) {
                    vValue = bSortExpandSelect ? vValue.sort().join(",") : vValue.join(",");
                }
                break;
            default:
        }
        fnResultHandler(sKey, vValue);
    });
};
_Requestor.prototype.fetchTypeForPath = function (sMetaPath, bAsName) {
    return this.oModelInterface.fetchMetadata(sMetaPath + (bAsName ? "/$Type" : "/"));
};
_Requestor.prototype.formatPropertyAsLiteral = function (vValue, oProperty) {
    return _Helper.formatLiteral(vValue, oProperty.$Type);
};
_Requestor.prototype.getGroupSubmitMode = function (sGroupId) {
    return this.oModelInterface.getGroupProperty(sGroupId, "submit");
};
_Requestor.prototype.getModelInterface = function () {
    return this.oModelInterface;
};
_Requestor.prototype.getOrCreateBatchQueue = function (sGroupId) {
    var aChangeSet, aRequests = this.mBatchQueue[sGroupId];
    if (!aRequests) {
        aChangeSet = [];
        aChangeSet.iSerialNumber = 0;
        aRequests = this.mBatchQueue[sGroupId] = [aChangeSet];
        aRequests.iChangeSet = 0;
        if (this.oModelInterface.onCreateGroup) {
            this.oModelInterface.onCreateGroup(sGroupId);
        }
    }
    return aRequests;
};
_Requestor.prototype.getPathAndAddQueryOptions = function (sPath, oOperationMetadata, mParameters) {
    var aArguments = [], sName, mName2Parameter = {}, oParameter, that = this;
    sPath = sPath.slice(1, -5);
    if (oOperationMetadata.$Parameter) {
        oOperationMetadata.$Parameter.forEach(function (oParameter) {
            mName2Parameter[oParameter.$Name] = oParameter;
        });
    }
    if (oOperationMetadata.$kind === "Function") {
        for (sName in mParameters) {
            oParameter = mName2Parameter[sName];
            if (oParameter) {
                if (oParameter.$isCollection) {
                    throw new Error("Unsupported collection-valued parameter: " + sName);
                }
                aArguments.push(encodeURIComponent(sName) + "=" + encodeURIComponent(that.formatPropertyAsLiteral(mParameters[sName], oParameter)));
            }
        }
        sPath += "(" + aArguments.join(",") + ")";
    }
    else {
        for (sName in mParameters) {
            if (!(sName in mName2Parameter)) {
                delete mParameters[sName];
            }
        }
    }
    return sPath;
};
_Requestor.prototype.getSerialNumber = function () {
    this.iSerialNumber += 1;
    return this.iSerialNumber;
};
_Requestor.prototype.getServiceUrl = function () {
    return this.sServiceUrl;
};
_Requestor.prototype.hasChanges = function (sGroupId, oEntity) {
    var aRequests = this.mBatchQueue[sGroupId];
    if (aRequests) {
        return aRequests.some(function (vRequests) {
            return Array.isArray(vRequests) && vRequests.some(function (oRequest) {
                return oRequest.headers["If-Match"] === oEntity;
            });
        });
    }
    return false;
};
_Requestor.prototype.hasPendingChanges = function (sGroupId) {
    var that = this;
    function filter(mMap) {
        if (!sGroupId) {
            return Object.keys(mMap);
        }
        return sGroupId in mMap ? [sGroupId] : [];
    }
    return filter(this.mRunningChangeRequests).length > 0 || this.aLockedGroupLocks.some(function (oGroupLock) {
        return (sGroupId === undefined || oGroupLock.getGroupId() === sGroupId) && oGroupLock.isModifying() && oGroupLock.isLocked();
    }) || filter(this.mBatchQueue).some(function (sGroupId0) {
        return that.mBatchQueue[sGroupId0].some(function (vRequests) {
            return Array.isArray(vRequests) && vRequests.some(function (oRequest) {
                return oRequest.$cancel;
            });
        });
    });
};
_Requestor.prototype.isActionBodyOptional = function () {
    return false;
};
_Requestor.prototype.isChangeSetOptional = function () {
    return true;
};
_Requestor.prototype.mergeGetRequests = function (aRequests) {
    var aResultingRequests = [], that = this;
    function merge(oRequest) {
        return oRequest.$queryOptions && aResultingRequests.some(function (oCandidate) {
            if (oCandidate.$queryOptions && oRequest.url === oCandidate.url) {
                _Helper.aggregateExpandSelect(oCandidate.$queryOptions, oRequest.$queryOptions);
                oRequest.$resolve(oCandidate.$promise);
                return true;
            }
            return false;
        });
    }
    aRequests.forEach(function (oRequest) {
        if (!merge(oRequest)) {
            aResultingRequests.push(oRequest);
        }
    });
    aResultingRequests.forEach(function (oRequest) {
        if (oRequest.$queryOptions) {
            oRequest.url = that.addQueryString(oRequest.url, oRequest.$metaPath, oRequest.$queryOptions);
        }
    });
    aResultingRequests.iChangeSet = aRequests.iChangeSet;
    return aResultingRequests;
};
_Requestor.prototype.processBatch = function (sGroupId) {
    var bHasChanges, aRequests = this.mBatchQueue[sGroupId] || [], that = this;
    function onSubmit(vRequest) {
        if (Array.isArray(vRequest)) {
            vRequest.forEach(onSubmit);
        }
        else if (vRequest.$submit) {
            vRequest.$submit();
        }
    }
    function reject(oError, vRequest) {
        if (Array.isArray(vRequest)) {
            vRequest.forEach(reject.bind(null, oError));
        }
        else {
            vRequest.$reject(oError);
        }
    }
    function visit(aRequests, aResponses) {
        var oCause;
        aRequests.forEach(function (vRequest, index) {
            var oError, sETag, oResponse, vResponse = aResponses[index];
            if (Array.isArray(vResponse)) {
                visit(vRequest, vResponse);
            }
            else if (!vResponse) {
                oError = new Error("HTTP request was not processed because the previous request failed");
                oError.cause = oCause;
                oError.$reported = true;
                vRequest.$reject(oError);
            }
            else if (vResponse.status >= 400) {
                vResponse.getResponseHeader = getResponseHeader;
                oCause = _Helper.createError(vResponse, "Communication error", vRequest.url ? that.sServiceUrl + vRequest.url : undefined, vRequest.$resourcePath);
                if (Array.isArray(vRequest)) {
                    _Helper.decomposeError(oCause, vRequest, that.sServiceUrl).forEach(function (oError, i) {
                        vRequest[i].$reject(oError);
                    });
                }
                else {
                    vRequest.$reject(oCause);
                }
            }
            else {
                if (vResponse.responseText) {
                    try {
                        that.doCheckVersionHeader(getResponseHeader.bind(vResponse), vRequest.url, true);
                        oResponse = that.doConvertResponse(JSON.parse(vResponse.responseText), vRequest.$metaPath);
                    }
                    catch (oErr) {
                        vRequest.$reject(oErr);
                        return;
                    }
                }
                else {
                    oResponse = vRequest.method === "GET" ? null : {};
                }
                that.reportHeaderMessages(vRequest.url, getResponseHeader.call(vResponse, "sap-messages"));
                sETag = getResponseHeader.call(vResponse, "ETag");
                if (sETag) {
                    oResponse["@odata.etag"] = sETag;
                }
                vRequest.$resolve(oResponse);
            }
        });
    }
    delete this.mBatchQueue[sGroupId];
    onSubmit(aRequests);
    bHasChanges = this.cleanUpChangeSets(aRequests);
    if (aRequests.length === 0) {
        return Promise.resolve();
    }
    aRequests = this.mergeGetRequests(aRequests);
    this.batchRequestSent(sGroupId, aRequests, bHasChanges);
    return this.sendBatch(aRequests, sGroupId).then(function (aResponses) {
        visit(aRequests, aResponses);
    }).catch(function (oError) {
        var oRequestError = new Error("HTTP request was not processed because $batch failed");
        oRequestError.cause = oError;
        reject(oRequestError, aRequests);
        throw oError;
    }).finally(function () {
        that.batchResponseReceived(sGroupId, aRequests, bHasChanges);
    });
};
_Requestor.prototype.ready = function () {
    return SyncPromise.resolve();
};
_Requestor.prototype.lockGroup = function (sGroupId, oOwner, bLocked, bModifying, fnCancel) {
    var oGroupLock;
    oGroupLock = new _GroupLock(sGroupId, oOwner, bLocked, bModifying, this.getSerialNumber(), fnCancel);
    if (bLocked) {
        this.aLockedGroupLocks.push(oGroupLock);
    }
    return oGroupLock;
};
_Requestor.prototype.processSecurityTokenHandlers = function () {
    var that = this;
    this.oSecurityTokenPromise = null;
    sap.ui.getCore().getConfiguration().getSecurityTokenHandlers().some(function (fnHandler) {
        var oSecurityTokenPromise = fnHandler(that.sServiceUrl);
        if (oSecurityTokenPromise !== undefined) {
            that.oSecurityTokenPromise = oSecurityTokenPromise.then(function (mHeaders) {
                that.checkHeaderNames(mHeaders);
                Object.assign(that.mHeaders, { "X-CSRF-Token": undefined }, mHeaders);
                that.oSecurityTokenPromise = null;
            }).catch(function (oError) {
                Log.error("An error occurred within security token handler: " + fnHandler, oError, sClassName);
                throw oError;
            });
            return true;
        }
    });
};
_Requestor.prototype.refreshSecurityToken = function (sOldSecurityToken) {
    var that = this;
    if (!this.oSecurityTokenPromise) {
        if (sOldSecurityToken !== this.mHeaders["X-CSRF-Token"]) {
            return Promise.resolve();
        }
        this.oSecurityTokenPromise = new Promise(function (fnResolve, fnReject) {
            jQuery.ajax(that.sServiceUrl + that.sQueryParams, {
                method: "HEAD",
                headers: Object.assign({}, that.mHeaders, { "X-CSRF-Token": "Fetch" })
            }).then(function (_oData, _sTextStatus, jqXHR) {
                var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
                if (sCsrfToken) {
                    that.mHeaders["X-CSRF-Token"] = sCsrfToken;
                }
                else {
                    delete that.mHeaders["X-CSRF-Token"];
                }
                that.oSecurityTokenPromise = null;
                fnResolve();
            }, function (jqXHR) {
                that.oSecurityTokenPromise = null;
                fnReject(_Helper.createError(jqXHR, "Could not refresh security token"));
            });
        });
    }
    return this.oSecurityTokenPromise;
};
_Requestor.prototype.relocate = function (sCurrentGroupId, oBody, sNewGroupId) {
    var aRequests = this.mBatchQueue[sCurrentGroupId], that = this, bFound = aRequests && aRequests[0].some(function (oChange, i) {
        if (oChange.body === oBody) {
            that.addChangeToGroup(oChange, sNewGroupId);
            aRequests[0].splice(i, 1);
            return true;
        }
    });
    if (!bFound) {
        throw new Error("Request not found in group '" + sCurrentGroupId + "'");
    }
};
_Requestor.prototype.relocateAll = function (sCurrentGroupId, sNewGroupId, oEntity) {
    var j = 0, aRequests = this.mBatchQueue[sCurrentGroupId], that = this;
    if (aRequests) {
        aRequests[0].slice().forEach(function (oChange) {
            if (!oEntity || oChange.headers["If-Match"] === oEntity) {
                that.addChangeToGroup(oChange, sNewGroupId);
                aRequests[0].splice(j, 1);
            }
            else {
                j += 1;
            }
        });
    }
};
_Requestor.prototype.removePatch = function (oPromise) {
    var bCanceled = this.cancelChangesByFilter(function (oChangeRequest) {
        return oChangeRequest.$promise === oPromise;
    });
    if (!bCanceled) {
        throw new Error("Cannot reset the changes, the batch request is running");
    }
};
_Requestor.prototype.removePost = function (sGroupId, oEntity) {
    var oBody = _Helper.getPrivateAnnotation(oEntity, "postBody"), bCanceled = this.cancelChangesByFilter(function (oChangeRequest) {
        return oChangeRequest.body === oBody;
    }, sGroupId);
    if (!bCanceled) {
        throw new Error("Cannot reset the changes, the batch request is running");
    }
};
_Requestor.prototype.reportHeaderMessages = function (sResourcePath, sMessages) {
    if (sMessages) {
        this.oModelInterface.reportTransitionMessages(JSON.parse(sMessages), sResourcePath);
    }
};
_Requestor.prototype.request = function (sMethod, sResourcePath, oGroupLock, mHeaders, oPayload, fnSubmit, fnCancel, sMetaPath, sOriginalResourcePath, bAtFront, mQueryOptions) {
    var iChangeSetNo, oError, sGroupId = oGroupLock && oGroupLock.getGroupId() || "$direct", oPromise, iRequestSerialNumber = Infinity, oRequest, that = this;
    if (sGroupId === "$cached") {
        oError = new Error("Unexpected request: " + sMethod + " " + sResourcePath);
        oError.$cached = true;
        throw oError;
    }
    if (oGroupLock && oGroupLock.isCanceled()) {
        if (fnCancel) {
            fnCancel();
        }
        oError = new Error("Request already canceled");
        oError.canceled = true;
        return Promise.reject(oError);
    }
    if (oGroupLock) {
        oGroupLock.unlock();
        iRequestSerialNumber = oGroupLock.getSerialNumber();
    }
    sResourcePath = this.convertResourcePath(sResourcePath);
    sOriginalResourcePath = sOriginalResourcePath || sResourcePath;
    if (this.getGroupSubmitMode(sGroupId) !== "Direct") {
        oPromise = new Promise(function (fnResolve, fnReject) {
            var aRequests = that.getOrCreateBatchQueue(sGroupId);
            oRequest = {
                method: sMethod,
                url: sResourcePath,
                headers: Object.assign({}, that.mPredefinedPartHeaders, that.mHeaders, mHeaders, that.mFinalHeaders),
                body: oPayload,
                $cancel: fnCancel,
                $metaPath: sMetaPath,
                $queryOptions: mQueryOptions,
                $reject: fnReject,
                $resolve: fnResolve,
                $resourcePath: sOriginalResourcePath,
                $submit: fnSubmit
            };
            if (sMethod === "GET") {
                aRequests.push(oRequest);
            }
            else if (bAtFront) {
                aRequests[0].unshift(oRequest);
            }
            else {
                iChangeSetNo = aRequests.iChangeSet;
                while (aRequests[iChangeSetNo].iSerialNumber > iRequestSerialNumber) {
                    iChangeSetNo -= 1;
                }
                that.checkConflictingStrictRequest(oRequest, aRequests, iChangeSetNo);
                aRequests[iChangeSetNo].push(oRequest);
            }
        });
        oRequest.$promise = oPromise;
        return oPromise;
    }
    if (this.vStatistics !== undefined) {
        mQueryOptions = Object.assign({ "sap-statistics": this.vStatistics }, mQueryOptions);
    }
    if (mQueryOptions) {
        sResourcePath = that.addQueryString(sResourcePath, sMetaPath, mQueryOptions);
    }
    if (fnSubmit) {
        fnSubmit();
    }
    return this.sendRequest(sMethod, sResourcePath, Object.assign({}, mHeaders, this.mFinalHeaders), JSON.stringify(oPayload), sOriginalResourcePath).then(function (oResponse) {
        that.reportHeaderMessages(oResponse.resourcePath, oResponse.messages);
        return that.doConvertResponse(oResponse.body, sMetaPath);
    });
};
_Requestor.prototype.sendBatch = function (aRequests, sGroupId) {
    var oBatchRequest = _Batch.serializeBatchRequest(aRequests, this.getGroupSubmitMode(sGroupId) === "Auto" ? "Group ID: " + sGroupId : "Group ID (API): " + sGroupId);
    return this.sendRequest("POST", "$batch" + this.sQueryParams, Object.assign(oBatchRequest.headers, mBatchHeaders), oBatchRequest.body).then(function (oResponse) {
        if (oResponse.messages !== null) {
            throw new Error("Unexpected 'sap-messages' response header for batch request");
        }
        return _Batch.deserializeBatchResponse(oResponse.contentType, oResponse.body);
    });
};
_Requestor.prototype.sendRequest = function (sMethod, sResourcePath, mHeaders, sPayload, sOriginalResourcePath) {
    var sRequestUrl = this.sServiceUrl + sResourcePath, that = this;
    return new Promise(function (fnResolve, fnReject) {
        function send(bIsFreshToken) {
            var sOldCsrfToken = that.mHeaders["X-CSRF-Token"];
            return jQuery.ajax(sRequestUrl, {
                contentType: mHeaders && mHeaders["Content-Type"],
                data: sPayload,
                headers: Object.assign({}, that.mPredefinedRequestHeaders, that.mHeaders, _Helper.resolveIfMatchHeader(mHeaders)),
                method: sMethod
            }).then(function (vResponse, _sTextStatus, jqXHR) {
                var sETag = jqXHR.getResponseHeader("ETag"), sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
                try {
                    that.doCheckVersionHeader(jqXHR.getResponseHeader, sResourcePath, !vResponse);
                }
                catch (oError) {
                    fnReject(oError);
                    return;
                }
                if (sCsrfToken) {
                    that.mHeaders["X-CSRF-Token"] = sCsrfToken;
                }
                that.setSessionContext(jqXHR.getResponseHeader("SAP-ContextId"), jqXHR.getResponseHeader("SAP-Http-Session-Timeout"));
                if (!vResponse) {
                    vResponse = sMethod === "GET" ? null : {};
                }
                if (sETag && typeof vResponse === "object") {
                    vResponse["@odata.etag"] = sETag;
                }
                fnResolve({
                    body: vResponse,
                    contentType: jqXHR.getResponseHeader("Content-Type"),
                    messages: jqXHR.getResponseHeader("sap-messages"),
                    resourcePath: sResourcePath
                });
            }, function (jqXHR) {
                var sContextId = jqXHR.getResponseHeader("SAP-ContextId"), sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token"), sMessage;
                if (!bIsFreshToken && jqXHR.status === 403 && sCsrfToken && sCsrfToken.toLowerCase() === "required") {
                    that.refreshSecurityToken(sOldCsrfToken).then(function () {
                        send(true);
                    }, fnReject);
                }
                else {
                    sMessage = "Communication error";
                    if (sContextId) {
                        that.setSessionContext(sContextId, jqXHR.getResponseHeader("SAP-Http-Session-Timeout"));
                    }
                    else if (that.mHeaders["SAP-ContextId"]) {
                        sMessage = "Session not found on server";
                        Log.error(sMessage, undefined, sClassName);
                        that.clearSessionContext(true);
                    }
                    fnReject(_Helper.createError(jqXHR, sMessage, sRequestUrl, sOriginalResourcePath));
                }
            });
        }
        if (that.oSecurityTokenPromise && sMethod !== "GET") {
            that.oSecurityTokenPromise.then(send);
        }
        else {
            send();
        }
    });
};
_Requestor.prototype.setSessionContext = function (sContextId, sSAPHttpSessionTimeout) {
    var iTimeoutSeconds = rTimeout.test(sSAPHttpSessionTimeout) ? parseInt(sSAPHttpSessionTimeout) : 0, iSessionTimeout = Date.now() + 30 * 60 * 1000, that = this;
    this.clearSessionContext();
    if (sContextId) {
        that.mHeaders["SAP-ContextId"] = sContextId;
        if (iTimeoutSeconds >= 60) {
            this.iSessionTimer = setInterval(function () {
                if (Date.now() >= iSessionTimeout) {
                    that.clearSessionContext(true);
                }
                else {
                    jQuery.ajax(that.sServiceUrl + that.sQueryParams, {
                        method: "HEAD",
                        headers: {
                            "SAP-ContextId": that.mHeaders["SAP-ContextId"]
                        }
                    }).fail(function (jqXHR) {
                        if (jqXHR.getResponseHeader("SAP-Err-Id") === "ICMENOSESSION") {
                            Log.error("Session not found on server", undefined, sClassName);
                            that.clearSessionContext(true);
                        }
                    });
                }
            }, (iTimeoutSeconds - 5) * 1000);
        }
        else if (sSAPHttpSessionTimeout !== null) {
            Log.warning("Unsupported SAP-Http-Session-Timeout header", sSAPHttpSessionTimeout, sClassName);
        }
    }
};
_Requestor.prototype.submitBatch = function (sGroupId) {
    var bBlocked, oPromise, that = this;
    oPromise = SyncPromise.all(this.aLockedGroupLocks.map(function (oGroupLock) {
        return oGroupLock.waitFor(sGroupId);
    }));
    bBlocked = oPromise.isPending();
    if (bBlocked) {
        Log.info("submitBatch('" + sGroupId + "') is waiting for locks", null, sClassName);
    }
    return oPromise.then(function () {
        if (bBlocked) {
            Log.info("submitBatch('" + sGroupId + "') continues", null, sClassName);
        }
        that.aLockedGroupLocks = that.aLockedGroupLocks.filter(function (oGroupLock) {
            return oGroupLock.isLocked();
        });
        return that.processBatch(sGroupId);
    });
};
_Requestor.prototype.waitForRunningChangeRequests = function (sGroupId) {
    var aPromises = this.mRunningChangeRequests[sGroupId];
    if (aPromises) {
        return aPromises.length > 1 ? SyncPromise.all(aPromises) : aPromises[0];
    }
    return SyncPromise.resolve();
};
_Requestor.create = function (sServiceUrl, oModelInterface, mHeaders, mQueryParams, sODataVersion) {
    var oRequestor = new _Requestor(sServiceUrl, mHeaders, mQueryParams, oModelInterface);
    if (sODataVersion === "2.0") {
        asV2Requestor(oRequestor);
    }
    return oRequestor;
};
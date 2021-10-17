import Log from "sap/base/Log";
import deepEqual from "sap/base/util/deepEqual";
import isEmptyObject from "sap/base/util/isEmptyObject";
import merge from "sap/base/util/merge";
import uid from "sap/base/util/uid";
import URI from "sap/ui/thirdparty/URI";
var rAmpersand = /&/g, sClassName = "sap.ui.model.odata.v4.lib._Helper", rEquals = /\=/g, rEscapedCloseBracket = /%29/g, rEscapedOpenBracket = /%28/g, rEscapedTick = /%27/g, rHash = /#/g, rNotMetaContext = /\([^/]*|\/-?\d+/g, rPlus = /\+/g, rSingleQuote = /'/g, rSingleQuoteTwice = /''/g, rWhitespace = /\s+/g, _Helper;
_Helper = {
    addByPath: function (mMap, sPath, oItem) {
        if (oItem) {
            if (!mMap[sPath]) {
                mMap[sPath] = [oItem];
            }
            else if (mMap[sPath].indexOf(oItem) < 0) {
                mMap[sPath].push(oItem);
            }
        }
    },
    addChildrenWithAncestor: function (aChildren, aAncestors, mChildren) {
        if (aAncestors.length) {
            aChildren.forEach(function (sPath) {
                var aSegments;
                if (aAncestors.indexOf(sPath) >= 0) {
                    mChildren[sPath] = true;
                    return;
                }
                aSegments = sPath.split("/");
                aSegments.pop();
                while (aSegments.length) {
                    if (aAncestors.indexOf(aSegments.join("/")) >= 0) {
                        mChildren[sPath] = true;
                        break;
                    }
                    aSegments.pop();
                }
            });
        }
    },
    addToSelect: function (mQueryOptions, aSelectPaths) {
        mQueryOptions.$select = mQueryOptions.$select || [];
        aSelectPaths.forEach(function (sPath) {
            if (mQueryOptions.$select.indexOf(sPath) < 0) {
                mQueryOptions.$select.push(sPath);
            }
        });
    },
    adjustTargets: function (oMessage, oOperationMetadata, sParameterContextPath, sContextPath) {
        var sAdditionalTargetsKey = _Helper.getAnnotationKey(oMessage, ".additionalTargets"), aTargets;
        aTargets = [oMessage.target].concat(oMessage[sAdditionalTargetsKey]).map(function (sTarget) {
            return sTarget && _Helper.getAdjustedTarget(sTarget, oOperationMetadata, sParameterContextPath, sContextPath);
        }).filter(function (sTarget) {
            return sTarget;
        });
        oMessage.target = aTargets[0];
        if (sAdditionalTargetsKey) {
            oMessage[sAdditionalTargetsKey] = aTargets.slice(1);
        }
    },
    adjustTargetsInError: function (oError, oOperationMetadata, sParameterContextPath, sContextPath) {
        if (!oError.error) {
            return;
        }
        _Helper.adjustTargets(oError.error, oOperationMetadata, sParameterContextPath, sContextPath);
        if (oError.error.details) {
            oError.error.details.forEach(function (oMessage) {
                _Helper.adjustTargets(oMessage, oOperationMetadata, sParameterContextPath, sContextPath);
            });
        }
    },
    aggregateExpandSelect: function (mAggregatedQueryOptions, mQueryOptions) {
        if (mQueryOptions.$select) {
            _Helper.addToSelect(mAggregatedQueryOptions, mQueryOptions.$select);
        }
        if (mQueryOptions.$expand) {
            mAggregatedQueryOptions.$expand = mAggregatedQueryOptions.$expand || {};
            Object.keys(mQueryOptions.$expand).forEach(function (sPath) {
                if (mAggregatedQueryOptions.$expand[sPath]) {
                    _Helper.aggregateExpandSelect(mAggregatedQueryOptions.$expand[sPath], mQueryOptions.$expand[sPath]);
                }
                else {
                    mAggregatedQueryOptions.$expand[sPath] = mQueryOptions.$expand[sPath];
                }
            });
        }
    },
    buildPath: function () {
        var sPath = "", sSegment, i;
        for (i = 0; i < arguments.length; i += 1) {
            sSegment = arguments[i];
            if (sSegment || sSegment === 0) {
                if (sPath && sPath !== "/" && sSegment[0] !== "(") {
                    sPath += "/";
                }
                sPath += sSegment;
            }
        }
        return sPath;
    },
    buildQuery: function (mParameters) {
        var aKeys, aQuery;
        if (!mParameters) {
            return "";
        }
        aKeys = Object.keys(mParameters);
        if (aKeys.length === 0) {
            return "";
        }
        aQuery = [];
        aKeys.forEach(function (sKey) {
            var vValue = mParameters[sKey];
            if (Array.isArray(vValue)) {
                vValue.forEach(function (sItem) {
                    aQuery.push(_Helper.encodePair(sKey, sItem));
                });
            }
            else {
                aQuery.push(_Helper.encodePair(sKey, vValue));
            }
        });
        return "?" + aQuery.join("&");
    },
    clone: function clone(vValue, fnReplacer) {
        return vValue === undefined || vValue === Infinity || vValue === -Infinity || vValue !== vValue ? vValue : JSON.parse(JSON.stringify(vValue, fnReplacer));
    },
    createError: function (jqXHR, sMessage, sRequestUrl, sResourcePath) {
        var sBody = jqXHR.responseText, sContentType = jqXHR.getResponseHeader("Content-Type"), sPreference, oResult = new Error(sMessage + ": " + jqXHR.status + " " + jqXHR.statusText), sRetryAfter = jqXHR.getResponseHeader("Retry-After"), iRetryAfter;
        oResult.status = jqXHR.status;
        oResult.statusText = jqXHR.statusText;
        oResult.requestUrl = sRequestUrl;
        oResult.resourcePath = sResourcePath;
        if (jqXHR.status === 0) {
            oResult.message = "Network error";
            return oResult;
        }
        if (sContentType) {
            sContentType = sContentType.split(";")[0];
        }
        if (jqXHR.status === 412) {
            sPreference = jqXHR.getResponseHeader("Preference-Applied");
            if (sPreference && sPreference.replace(rWhitespace, "") === "handling=strict") {
                oResult.strictHandlingFailed = true;
            }
            else {
                oResult.isConcurrentModification = true;
            }
        }
        if (sRetryAfter) {
            iRetryAfter = parseInt(sRetryAfter);
            oResult.retryAfter = new Date(Number.isNaN(iRetryAfter) ? sRetryAfter : Date.now() + iRetryAfter * 1000);
        }
        if (sContentType === "application/json") {
            try {
                oResult.error = JSON.parse(sBody).error;
                oResult.message = oResult.error.message;
                if (typeof oResult.message === "object") {
                    oResult.message = oResult.error.message.value;
                }
            }
            catch (e) {
                Log.warning(e.toString(), sBody, sClassName);
            }
        }
        else if (sContentType === "text/plain") {
            oResult.message = sBody;
        }
        return oResult;
    },
    createGetMethod: function (sFetch, bThrow) {
        return function () {
            var oSyncPromise = this[sFetch].apply(this, arguments);
            if (oSyncPromise.isFulfilled()) {
                return oSyncPromise.getResult();
            }
            else if (bThrow) {
                if (oSyncPromise.isRejected()) {
                    oSyncPromise.caught();
                    throw oSyncPromise.getResult();
                }
                else {
                    throw new Error("Result pending");
                }
            }
        };
    },
    createMissing: function (oObject, aSegments) {
        aSegments.reduce(function (oCurrent, sSegment, i) {
            if (!(sSegment in oCurrent)) {
                oCurrent[sSegment] = i + 1 < aSegments.length ? {} : null;
            }
            return oCurrent[sSegment];
        }, oObject);
    },
    createRequestMethod: function (sFetch) {
        return function () {
            return Promise.resolve(this[sFetch].apply(this, arguments));
        };
    },
    createTechnicalDetails: function (oMessage) {
        var oClonedMessage, oError = oMessage["@$ui5.error"], oOriginalMessage = oMessage["@$ui5.originalMessage"] || oMessage, oTechnicalDetails = {};
        if (oError && (oError.status || oError.cause)) {
            oError = oError.cause || oError;
            oTechnicalDetails.httpStatus = oError.status;
            if (oError.isConcurrentModification) {
                oTechnicalDetails.isConcurrentModification = true;
            }
            if (oError.retryAfter) {
                oTechnicalDetails.retryAfter = oError.retryAfter;
            }
        }
        if (!(oOriginalMessage instanceof Error)) {
            Object.defineProperty(oTechnicalDetails, "originalMessage", {
                enumerable: true,
                get: function () {
                    if (!oClonedMessage) {
                        oClonedMessage = _Helper.publicClone(oOriginalMessage);
                    }
                    return oClonedMessage;
                }
            });
        }
        return oTechnicalDetails;
    },
    decomposeError: function (oError, aRequests, sServiceUrl) {
        var aDetailContentIDs = oError.error.details && oError.error.details.map(function (oDetail) {
            return _Helper.getContentID(oDetail);
        }), sTopLevelContentID = _Helper.getContentID(oError.error);
        return aRequests.map(function (oRequest, i) {
            var oClone = new Error(oError.message);
            function isRelevant(oMessage, sContentID) {
                if (i === 0 && !sContentID) {
                    if (oMessage.target) {
                        oMessage.message = oMessage.target + ": " + oMessage.message;
                    }
                    delete oMessage.target;
                    return true;
                }
                return sContentID === oRequest.$ContentID;
            }
            oClone.error = _Helper.clone(oError.error);
            oClone.requestUrl = sServiceUrl + oRequest.url;
            oClone.resourcePath = oRequest.$resourcePath;
            oClone.status = oError.status;
            oClone.statusText = oError.statusText;
            if (!isRelevant(oClone.error, sTopLevelContentID)) {
                oClone.error.$ignoreTopLevel = true;
            }
            if (oClone.error.details) {
                oClone.error.details = oClone.error.details.filter(function (oDetail, i) {
                    return isRelevant(oDetail, aDetailContentIDs[i]);
                });
            }
            return oClone;
        });
    },
    deepEqual: deepEqual,
    deletePrivateAnnotation: function (oObject, sAnnotation) {
        var oPrivateNamespace = oObject["@$ui5._"];
        if (oPrivateNamespace) {
            delete oPrivateNamespace[sAnnotation];
        }
    },
    drillDown: function (oObject, aSegments) {
        return aSegments.reduce(function (oCurrent, sSegment) {
            return (oCurrent && sSegment in oCurrent) ? oCurrent[sSegment] : undefined;
        }, oObject);
    },
    encode: function (sPart, bEncodeEquals) {
        var sEncoded = encodeURI(sPart).replace(rAmpersand, "%26").replace(rHash, "%23").replace(rPlus, "%2B");
        if (bEncodeEquals) {
            sEncoded = sEncoded.replace(rEquals, "%3D");
        }
        return sEncoded;
    },
    encodePair: function (sKey, sValue) {
        return _Helper.encode(sKey, true) + "=" + _Helper.encode(sValue, false);
    },
    extractMessages: function (oError) {
        var aMessages = [];
        function addMessage(oMessage, iNumericSeverity, bTechnical) {
            var oRawMessage = {
                additionalTargets: _Helper.getAdditionalTargets(oMessage),
                code: oMessage.code,
                message: oMessage.message,
                numericSeverity: iNumericSeverity,
                technical: bTechnical || oMessage.technical,
                "@$ui5.error": oError,
                "@$ui5.originalMessage": oMessage
            };
            Object.keys(oMessage).forEach(function (sProperty) {
                if (sProperty[0] === "@") {
                    if (sProperty.endsWith(".numericSeverity")) {
                        oRawMessage.numericSeverity = oMessage[sProperty];
                    }
                    else if (sProperty.endsWith(".longtextUrl") && oError.requestUrl && oMessage[sProperty]) {
                        oRawMessage.longtextUrl = _Helper.makeAbsolute(oMessage[sProperty], oError.requestUrl);
                    }
                }
            });
            if (typeof oMessage.target === "string") {
                if (oMessage.target[0] === "$" || !oError.resourcePath) {
                    oRawMessage.message = oMessage.target + ": " + oMessage.message;
                }
                else {
                    oRawMessage.target = oMessage.target;
                }
            }
            oRawMessage.transition = true;
            aMessages.push(oRawMessage);
        }
        if (oError.error) {
            if (!oError.error.$ignoreTopLevel) {
                addMessage(oError.error, 4, true);
            }
            if (oError.error.details) {
                oError.error.details.forEach(function (oMessage) {
                    addMessage(oMessage);
                });
            }
        }
        else {
            addMessage(oError, 4, true);
        }
        return aMessages;
    },
    extractMergeableQueryOptions: function (mQueryOptions) {
        var mExtractedQueryOptions = {};
        if ("$expand" in mQueryOptions) {
            mExtractedQueryOptions.$expand = mQueryOptions.$expand;
            mQueryOptions.$expand = "~";
        }
        if ("$select" in mQueryOptions) {
            mExtractedQueryOptions.$select = mQueryOptions.$select;
            mQueryOptions.$select = "~";
        }
        return mExtractedQueryOptions;
    },
    fetchPropertyAndType: function (fnFetchMetadata, sMetaPath) {
        return fnFetchMetadata(sMetaPath).then(function (oProperty) {
            if (oProperty && oProperty.$kind === "NavigationProperty") {
                return fnFetchMetadata(sMetaPath + "/").then(function () {
                    return oProperty;
                });
            }
            return oProperty;
        });
    },
    filterPaths: function (aMetaPaths, aPathsToFilter) {
        return aPathsToFilter.filter(function (sPathToFilter) {
            var sMetaPathToFilter = _Helper.getMetaPath(sPathToFilter);
            return aMetaPaths.every(function (sMetaPath) {
                return !_Helper.hasPathPrefix(sMetaPathToFilter, sMetaPath);
            });
        });
    },
    fireChange: function (mChangeListeners, sPropertyPath, vValue) {
        var aListeners = mChangeListeners[sPropertyPath], i;
        if (aListeners) {
            for (i = 0; i < aListeners.length; i += 1) {
                aListeners[i].onChange(vValue);
            }
        }
    },
    fireChanges: function (mChangeListeners, sPath, oValue, bRemoved) {
        Object.keys(oValue).forEach(function (sProperty) {
            var sPropertyPath = _Helper.buildPath(sPath, sProperty), vValue = oValue[sProperty];
            if (vValue && typeof vValue === "object") {
                _Helper.fireChanges(mChangeListeners, sPropertyPath, vValue, bRemoved);
            }
            else {
                _Helper.fireChange(mChangeListeners, sPropertyPath, bRemoved ? undefined : vValue);
            }
        });
        _Helper.fireChange(mChangeListeners, sPath, bRemoved ? undefined : oValue);
    },
    formatLiteral: function (vValue, sType) {
        if (vValue === undefined) {
            throw new Error("Illegal value: undefined");
        }
        if (vValue === null) {
            return "null";
        }
        switch (sType) {
            case "Edm.Binary": return "binary'" + vValue + "'";
            case "Edm.Boolean":
            case "Edm.Byte":
            case "Edm.Double":
            case "Edm.Int16":
            case "Edm.Int32":
            case "Edm.SByte":
            case "Edm.Single": return String(vValue);
            case "Edm.Date":
            case "Edm.DateTimeOffset":
            case "Edm.Decimal":
            case "Edm.Guid":
            case "Edm.Int64":
            case "Edm.TimeOfDay": return vValue;
            case "Edm.Duration": return "duration'" + vValue + "'";
            case "Edm.String": return "'" + vValue.replace(rSingleQuote, "''") + "'";
            default: throw new Error("Unsupported type: " + sType);
        }
    },
    getAdditionalTargets: function (oMessage) {
        return _Helper.getAnnotation(oMessage, ".additionalTargets");
    },
    getAdjustedTarget: function (sTarget, oOperationMetadata, sParameterContextPath, sContextPath) {
        var bIsParameterName, sParameterName, aSegments;
        aSegments = sTarget.split("/");
        sParameterName = aSegments.shift();
        if (sParameterName === "$Parameter") {
            sTarget = aSegments.join("/");
            sParameterName = aSegments.shift();
        }
        if (oOperationMetadata.$IsBound && sParameterName === oOperationMetadata.$Parameter[0].$Name) {
            sTarget = _Helper.buildPath(sContextPath, aSegments.join("/"));
            return sTarget;
        }
        bIsParameterName = oOperationMetadata.$Parameter.some(function (oParameter) {
            return sParameterName === oParameter.$Name;
        });
        if (bIsParameterName) {
            sTarget = sParameterContextPath + "/" + sTarget;
            return sTarget;
        }
    },
    getAnnotation: function (oMessage, sName) {
        var sAnnotationKey = _Helper.getAnnotationKey(oMessage, sName);
        return sAnnotationKey && oMessage[sAnnotationKey];
    },
    getAnnotationKey: function (oObject, sName, sProperty) {
        var sAnnotationKey, bDuplicate, sPrefix = (sProperty || "") + "@";
        Object.keys(oObject).forEach(function (sKey) {
            if (sKey.startsWith(sPrefix) && sKey.endsWith(sName)) {
                if (sAnnotationKey) {
                    Log.warning("Cannot distinguish " + sAnnotationKey + " from " + sKey, undefined, sClassName);
                    bDuplicate = true;
                }
                sAnnotationKey = sKey;
            }
        });
        return bDuplicate ? undefined : sAnnotationKey;
    },
    getContentID: function (oMessage) {
        return _Helper.getAnnotation(oMessage, ".ContentID");
    },
    getKeyFilter: function (oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties) {
        var aFilters = [], sKey, mKey2Value = _Helper.getKeyProperties(oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties);
        if (!mKey2Value) {
            return undefined;
        }
        for (sKey in mKey2Value) {
            aFilters.push(sKey + " eq " + mKey2Value[sKey]);
        }
        return aFilters.join(" and ");
    },
    getKeyPredicate: function (oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties, bKeepSingleProperty) {
        var mKey2Value = _Helper.getKeyProperties(oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties, true);
        if (!mKey2Value) {
            return undefined;
        }
        aKeyProperties = Object.keys(mKey2Value).map(function (sAlias, _iIndex, aKeys) {
            var vValue = encodeURIComponent(mKey2Value[sAlias]);
            return bKeepSingleProperty || aKeys.length > 1 ? encodeURIComponent(sAlias) + "=" + vValue : vValue;
        });
        return "(" + aKeyProperties.join(",") + ")";
    },
    getKeyProperties: function (oInstance, sMetaPath, mTypeForMetaPath, aKeyProperties, bReturnAlias) {
        var bFailed, mKey2Value = {};
        aKeyProperties = aKeyProperties || mTypeForMetaPath[sMetaPath].$Key;
        bFailed = aKeyProperties.some(function (vKey) {
            var sKey, sKeyPath, sPropertyName, aSegments, oType, vValue;
            if (typeof vKey === "string") {
                sKey = sKeyPath = vKey;
            }
            else {
                sKey = Object.keys(vKey)[0];
                sKeyPath = vKey[sKey];
                if (!bReturnAlias) {
                    sKey = sKeyPath;
                }
            }
            aSegments = sKeyPath.split("/");
            vValue = _Helper.drillDown(oInstance, aSegments);
            if (vValue === undefined) {
                return true;
            }
            sPropertyName = aSegments.pop();
            oType = mTypeForMetaPath[_Helper.buildPath(sMetaPath, aSegments.join("/"))];
            vValue = _Helper.formatLiteral(vValue, oType[sPropertyName].$Type);
            mKey2Value[sKey] = vValue;
        });
        return bFailed ? undefined : mKey2Value;
    },
    getMetaPath: function (sPath) {
        if (sPath[0] === "/") {
            return sPath.replace(rNotMetaContext, "");
        }
        if (sPath[0] !== "(") {
            sPath = "/" + sPath;
        }
        return sPath.replace(rNotMetaContext, "").slice(1);
    },
    getPrivateAnnotation: function (oObject, sAnnotation) {
        var oPrivateNamespace = oObject["@$ui5._"];
        return oPrivateNamespace && oPrivateNamespace[sAnnotation];
    },
    getQueryOptionsForPath: function (mQueryOptions, sPath) {
        sPath = _Helper.getMetaPath(sPath);
        if (sPath) {
            sPath.split("/").some(function (sSegment) {
                mQueryOptions = mQueryOptions && mQueryOptions.$expand && mQueryOptions.$expand[sSegment];
                if (!mQueryOptions || mQueryOptions === true) {
                    mQueryOptions = {};
                    return true;
                }
            });
        }
        return mQueryOptions || {};
    },
    getRelativePath: function (sPath, sBasePath) {
        if (sBasePath.length) {
            if (!sPath.startsWith(sBasePath)) {
                return undefined;
            }
            sPath = sPath.slice(sBasePath.length);
            if (sPath) {
                if (sPath[0] === "/") {
                    return sPath.slice(1);
                }
                if (sPath[0] !== "(") {
                    return undefined;
                }
            }
        }
        return sPath;
    },
    hasPrivateAnnotation: function (oObject, sAnnotation) {
        var oPrivateNamespace = oObject["@$ui5._"];
        return oPrivateNamespace ? sAnnotation in oPrivateNamespace : false;
    },
    informAll: function (mChangeListeners, sPath, vOld, vNew) {
        if (vNew === vOld) {
            return;
        }
        if (vNew && typeof vNew === "object") {
            Object.keys(vNew).forEach(function (sProperty) {
                _Helper.informAll(mChangeListeners, _Helper.buildPath(sPath, sProperty), vOld && vOld[sProperty], vNew[sProperty]);
            });
        }
        else {
            _Helper.fireChange(mChangeListeners, sPath, vNew === undefined ? null : vNew);
            vNew = {};
        }
        if (vOld && typeof vOld === "object") {
            Object.keys(vOld).forEach(function (sProperty) {
                if (!vNew.hasOwnProperty(sProperty)) {
                    _Helper.informAll(mChangeListeners, _Helper.buildPath(sPath, sProperty), vOld[sProperty], undefined);
                }
            });
        }
    },
    inheritPathValue: function (aSegments, oSource, oTarget) {
        aSegments.forEach(function (sSegment, i) {
            var bMissing = !(sSegment in oTarget);
            if (i + 1 < aSegments.length) {
                if (bMissing) {
                    oTarget[sSegment] = {};
                }
                oSource = oSource[sSegment];
                oTarget = oTarget[sSegment];
            }
            else if (bMissing) {
                oTarget[sSegment] = oSource[sSegment];
            }
        });
    },
    intersectQueryOptions: function (mCacheQueryOptions, aPaths, fnFetchMetadata, sRootMetaPath, mNavigationPropertyPaths, sPrefix, bAllowEmptySelect) {
        var aExpands = [], mExpands = {}, mResult, oRootMetaData, aSelects, mSelects = {};
        function filterStructural(bSkipFirstSegment, sMetaPath) {
            var aSegments = sMetaPath.split("/");
            return aSegments.every(function (sSegment, i) {
                return i === 0 && bSkipFirstSegment || sSegment === "$count" || fnFetchMetadata(sRootMetaPath + "/" + aSegments.slice(0, i + 1).join("/")).getResult().$kind === "Property";
            });
        }
        if (aPaths.indexOf("") >= 0) {
            throw new Error("Unsupported empty navigation property path");
        }
        if (aPaths.indexOf("*") >= 0) {
            aSelects = mCacheQueryOptions && mCacheQueryOptions.$select || [];
        }
        else if (mCacheQueryOptions && mCacheQueryOptions.$select && mCacheQueryOptions.$select.indexOf("*") < 0) {
            _Helper.addChildrenWithAncestor(aPaths, mCacheQueryOptions.$select, mSelects);
            _Helper.addChildrenWithAncestor(mCacheQueryOptions.$select, aPaths, mSelects);
            aSelects = Object.keys(mSelects).filter(filterStructural.bind(null, true));
        }
        else {
            aSelects = aPaths.filter(filterStructural.bind(null, false));
        }
        if (mCacheQueryOptions && mCacheQueryOptions.$expand) {
            aExpands = Object.keys(mCacheQueryOptions.$expand);
            aExpands.forEach(function (sNavigationPropertyPath) {
                var mChildQueryOptions, sMetaPath = sRootMetaPath + "/" + sNavigationPropertyPath, sPrefixedNavigationPropertyPath = _Helper.buildPath(sPrefix, sNavigationPropertyPath), mSet = {}, aStrippedPaths;
                _Helper.addChildrenWithAncestor([sNavigationPropertyPath], aPaths, mSet);
                if (!isEmptyObject(mSet)) {
                    if (fnFetchMetadata(sMetaPath).getResult().$isCollection) {
                        mNavigationPropertyPaths[sPrefixedNavigationPropertyPath] = true;
                    }
                    mExpands[sNavigationPropertyPath] = mCacheQueryOptions.$expand[sNavigationPropertyPath];
                    return;
                }
                aStrippedPaths = _Helper.stripPathPrefix(sNavigationPropertyPath, aPaths);
                if (aStrippedPaths.length) {
                    if (fnFetchMetadata(sMetaPath).getResult().$isCollection) {
                        throw new Error("Unsupported collection-valued navigation property " + sMetaPath);
                    }
                    mChildQueryOptions = _Helper.intersectQueryOptions(mCacheQueryOptions.$expand[sNavigationPropertyPath] || {}, aStrippedPaths, fnFetchMetadata, sMetaPath, mNavigationPropertyPaths, sPrefixedNavigationPropertyPath);
                    if (mChildQueryOptions) {
                        mExpands[sNavigationPropertyPath] = mChildQueryOptions;
                    }
                }
            });
        }
        if (!aSelects.length && isEmptyObject(mExpands)) {
            return null;
        }
        mResult = Object.assign({}, mCacheQueryOptions, { $select: aSelects });
        oRootMetaData = fnFetchMetadata(sRootMetaPath).getResult();
        if (oRootMetaData.$kind === "NavigationProperty" && !oRootMetaData.$isCollection) {
            _Helper.selectKeyProperties(mResult, fnFetchMetadata(sRootMetaPath + "/").getResult());
        }
        else if (!aSelects.length && !bAllowEmptySelect) {
            mResult.$select = Object.keys(mExpands).slice(0, 1);
        }
        if (isEmptyObject(mExpands)) {
            delete mResult.$expand;
        }
        else {
            mResult.$expand = mExpands;
        }
        return mResult;
    },
    hasPathPrefix: function (sPath, sBasePath) {
        return _Helper.getRelativePath(sPath, sBasePath) !== undefined;
    },
    isSafeInteger: function (iNumber) {
        if (typeof iNumber !== "number" || !isFinite(iNumber)) {
            return false;
        }
        iNumber = Math.abs(iNumber);
        return iNumber <= 9007199254740991 && Math.floor(iNumber) === iNumber;
    },
    makeAbsolute: function (sUrl, sBase) {
        return new URI(sUrl).absoluteTo(sBase).toString().replace(rEscapedTick, "'").replace(rEscapedOpenBracket, "(").replace(rEscapedCloseBracket, ")");
    },
    merge: merge,
    mergeQueryOptions: function (mQueryOptions, sOrderby, aFilters) {
        var mResult;
        function set(sProperty, sValue) {
            if (sValue && (!mQueryOptions || mQueryOptions[sProperty] !== sValue)) {
                if (!mResult) {
                    mResult = mQueryOptions ? _Helper.clone(mQueryOptions) : {};
                }
                mResult[sProperty] = sValue;
            }
        }
        set("$orderby", sOrderby);
        if (aFilters) {
            set("$filter", aFilters[0]);
            set("$$filterBeforeAggregate", aFilters[1]);
        }
        return mResult || mQueryOptions;
    },
    namespace: function (sName) {
        var iIndex;
        sName = sName.split("/")[0].split("(")[0];
        iIndex = sName.lastIndexOf(".");
        return iIndex < 0 ? "" : sName.slice(0, iIndex);
    },
    parseLiteral: function (sLiteral, sType, sPath) {
        function checkNaN(nValue) {
            if (!isFinite(nValue)) {
                throw new Error(sPath + ": Not a valid " + sType + " literal: " + sLiteral);
            }
            return nValue;
        }
        if (sLiteral === "null") {
            return null;
        }
        switch (sType) {
            case "Edm.Boolean": return sLiteral === "true";
            case "Edm.Byte":
            case "Edm.Int16":
            case "Edm.Int32":
            case "Edm.SByte": return checkNaN(parseInt(sLiteral));
            case "Edm.Date":
            case "Edm.DateTimeOffset":
            case "Edm.Decimal":
            case "Edm.Guid":
            case "Edm.Int64":
            case "Edm.TimeOfDay": return sLiteral;
            case "Edm.Double":
            case "Edm.Single": return sLiteral === "INF" || sLiteral === "-INF" || sLiteral === "NaN" ? sLiteral : checkNaN(parseFloat(sLiteral));
            case "Edm.String": return sLiteral.slice(1, -1).replace(rSingleQuoteTwice, "'");
            default: throw new Error(sPath + ": Unsupported type: " + sType);
        }
    },
    publicClone: function (vValue, bRemoveClientAnnotations) {
        return _Helper.clone(vValue, function (sKey, vValue) {
            if (bRemoveClientAnnotations ? !sKey.startsWith("@$ui5.") : sKey !== "@$ui5._") {
                return vValue;
            }
        });
    },
    removeByPath: function (mMap, sPath, oItem) {
        var aItems = mMap[sPath], iIndex;
        if (aItems) {
            iIndex = aItems.indexOf(oItem);
            if (iIndex >= 0) {
                if (aItems.length === 1) {
                    delete mMap[sPath];
                }
                else {
                    aItems.splice(iIndex, 1);
                }
            }
        }
    },
    resolveIfMatchHeader: function (mHeaders) {
        var vIfMatchValue = mHeaders && mHeaders["If-Match"];
        if (vIfMatchValue && typeof vIfMatchValue === "object") {
            vIfMatchValue = vIfMatchValue["@odata.etag"];
            mHeaders = Object.assign({}, mHeaders);
            if (vIfMatchValue === undefined) {
                delete mHeaders["If-Match"];
            }
            else {
                mHeaders["If-Match"] = vIfMatchValue;
            }
        }
        return mHeaders;
    },
    selectKeyProperties: function (mQueryOptions, oType) {
        if (oType && oType.$Key) {
            _Helper.addToSelect(mQueryOptions, oType.$Key.map(function (vKey) {
                if (typeof vKey === "object") {
                    return vKey[Object.keys(vKey)[0]];
                }
                return vKey;
            }));
        }
    },
    setPrivateAnnotation: function (oObject, sAnnotation, vValue) {
        var oPrivateNamespace = oObject["@$ui5._"];
        if (!oPrivateNamespace) {
            oPrivateNamespace = oObject["@$ui5._"] = {};
        }
        oPrivateNamespace[sAnnotation] = vValue;
    },
    stripPathPrefix: function (sPrefix, aPaths) {
        var sPathPrefix = sPrefix + "/";
        if (sPrefix === "") {
            return aPaths;
        }
        return aPaths.filter(function (sPath) {
            return sPath === sPrefix || sPath.startsWith(sPathPrefix);
        }).map(function (sPath) {
            return sPath.slice(sPathPrefix.length);
        });
    },
    toArray: function (vElement) {
        if (vElement === undefined || vElement === null) {
            return [];
        }
        if (Array.isArray(vElement)) {
            return vElement;
        }
        return [vElement];
    },
    uid: uid,
    updateAll: function (mChangeListeners, sPath, oTarget, oSource, fnCheckKeyPredicate) {
        Object.keys(oSource).forEach(function (sProperty) {
            var sPropertyPath = _Helper.buildPath(sPath, sProperty), sSourcePredicate, vSourceProperty = oSource[sProperty], sTargetPredicate, vTargetProperty = oTarget[sProperty];
            if (sProperty === "@$ui5._") {
                sSourcePredicate = _Helper.getPrivateAnnotation(oSource, "predicate");
                if (fnCheckKeyPredicate && fnCheckKeyPredicate(sPath)) {
                    sTargetPredicate = _Helper.getPrivateAnnotation(oTarget, "predicate");
                    if (sSourcePredicate !== sTargetPredicate) {
                        throw new Error("Key predicate of '" + sPath + "' changed from " + sTargetPredicate + " to " + sSourcePredicate);
                    }
                }
                else {
                    _Helper.setPrivateAnnotation(oTarget, "predicate", sSourcePredicate);
                }
            }
            else if (Array.isArray(vSourceProperty)) {
                oTarget[sProperty] = vSourceProperty;
            }
            else if (vSourceProperty && typeof vSourceProperty === "object") {
                oTarget[sProperty] = _Helper.updateAll(mChangeListeners, sPropertyPath, vTargetProperty || {}, vSourceProperty, fnCheckKeyPredicate);
            }
            else if (vTargetProperty !== vSourceProperty) {
                oTarget[sProperty] = vSourceProperty;
                if (vTargetProperty && typeof vTargetProperty === "object") {
                    _Helper.fireChanges(mChangeListeners, sPropertyPath, vTargetProperty, true);
                }
                else {
                    _Helper.fireChange(mChangeListeners, sPropertyPath, vSourceProperty);
                }
            }
        });
        return oTarget;
    },
    updateExisting: function (mChangeListeners, sPath, oOldObject, oNewObject) {
        if (!oNewObject) {
            return;
        }
        Object.keys(oOldObject).forEach(function (sProperty) {
            var sPropertyPath = _Helper.buildPath(sPath, sProperty), vOldProperty = oOldObject[sProperty], vNewProperty = oNewObject[sProperty];
            if (sProperty in oNewObject || sProperty[0] === "#") {
                if (Array.isArray(vNewProperty)) {
                    oOldObject[sProperty] = vNewProperty;
                }
                else if (vNewProperty && typeof vNewProperty === "object") {
                    if (vOldProperty) {
                        _Helper.updateExisting(mChangeListeners, sPropertyPath, vOldProperty, vNewProperty);
                    }
                    else {
                        oOldObject[sProperty] = vNewProperty;
                        _Helper.fireChanges(mChangeListeners, sPropertyPath, vNewProperty, false);
                    }
                }
                else if (vOldProperty !== vNewProperty) {
                    oOldObject[sProperty] = vNewProperty;
                    if (vOldProperty && typeof vOldProperty === "object") {
                        _Helper.fireChanges(mChangeListeners, sPropertyPath, vOldProperty, true);
                    }
                    else {
                        _Helper.fireChange(mChangeListeners, sPropertyPath, vNewProperty);
                    }
                }
            }
        });
        Object.keys(oNewObject).filter(function (sProperty) {
            return sProperty[0] === "#";
        }).filter(function (sAdvertisedAction) {
            return !(sAdvertisedAction in oOldObject);
        }).forEach(function (sNewAdvertisedAction) {
            var vNewProperty = oNewObject[sNewAdvertisedAction], sPropertyPath = _Helper.buildPath(sPath, sNewAdvertisedAction);
            oOldObject[sNewAdvertisedAction] = vNewProperty;
            _Helper.fireChanges(mChangeListeners, sPropertyPath, vNewProperty, false);
        });
    },
    updateSelected: function (mChangeListeners, sPath, oOldValue, oNewValue, aSelect) {
        function copyPathValue(sPropertyPath, oSource, oTarget) {
            var aSegments = sPropertyPath.split("/");
            aSegments.every(function (sSegment, iIndex) {
                var vSourceProperty = oSource[sSegment], vTargetProperty = oTarget[sSegment];
                if (Array.isArray(vSourceProperty)) {
                    oTarget[sSegment] = vSourceProperty;
                }
                else if (vSourceProperty && typeof vSourceProperty === "object") {
                    oTarget = oTarget[sSegment] = vTargetProperty || {};
                    oSource = vSourceProperty;
                    return true;
                }
                else if (vTargetProperty !== vSourceProperty) {
                    oTarget[sSegment] = vSourceProperty;
                    if (vTargetProperty && typeof vTargetProperty === "object") {
                        _Helper.fireChanges(mChangeListeners, _Helper.buildPath(sPath, aSegments.slice(0, iIndex + 1).join("/")), vTargetProperty, true);
                    }
                    else if (iIndex === aSegments.length - 1) {
                        _Helper.fireChange(mChangeListeners, _Helper.buildPath(sPath, sPropertyPath), vSourceProperty);
                    }
                }
                return false;
            });
        }
        if (!aSelect || aSelect.indexOf("*") >= 0) {
            _Helper.updateAll(mChangeListeners, sPath, oOldValue, oNewValue);
            return;
        }
        aSelect.forEach(function (sProperty) {
            copyPathValue(sProperty, oNewValue, oOldValue);
        });
    },
    updateTransientPaths: function (mMap, sTransientPredicate, sPredicate) {
        var sPath;
        for (sPath in mMap) {
            if (sPath.includes(sTransientPredicate)) {
                mMap[sPath.replace(sTransientPredicate, sPredicate)] = mMap[sPath];
                delete mMap[sPath];
            }
        }
    },
    wrapChildQueryOptions: function (sBaseMetaPath, sChildMetaPath, mChildQueryOptions, fnFetchMetadata) {
        var sExpandSelectPath = "", aMetaPathSegments = sChildMetaPath.split("/"), oProperty, sPropertyMetaPath = sBaseMetaPath, mQueryOptions = {}, mQueryOptionsForPathPrefix = mQueryOptions, i;
        if (sChildMetaPath === "") {
            return mChildQueryOptions;
        }
        for (i = 0; i < aMetaPathSegments.length; i += 1) {
            sPropertyMetaPath = _Helper.buildPath(sPropertyMetaPath, aMetaPathSegments[i]);
            sExpandSelectPath = _Helper.buildPath(sExpandSelectPath, aMetaPathSegments[i]);
            oProperty = fnFetchMetadata(sPropertyMetaPath).getResult();
            if (oProperty.$kind === "NavigationProperty") {
                mQueryOptionsForPathPrefix.$expand = {};
                mQueryOptionsForPathPrefix = mQueryOptionsForPathPrefix.$expand[sExpandSelectPath] = (i === aMetaPathSegments.length - 1) ? mChildQueryOptions : {};
                _Helper.selectKeyProperties(mQueryOptionsForPathPrefix, fnFetchMetadata(sPropertyMetaPath + "/").getResult());
                sExpandSelectPath = "";
            }
            else if (oProperty.$kind !== "Property") {
                return undefined;
            }
        }
        if (oProperty.$kind === "Property") {
            if (Object.keys(mChildQueryOptions).length > 0) {
                Log.error("Failed to enhance query options for auto-$expand/$select as the" + " child binding has query options, but its path '" + sChildMetaPath + "' points to a structural property", JSON.stringify(mChildQueryOptions), sClassName);
                return undefined;
            }
            _Helper.addToSelect(mQueryOptionsForPathPrefix, [sExpandSelectPath]);
        }
        if ("$apply" in mChildQueryOptions) {
            Log.debug("Cannot wrap $apply into $expand: " + sChildMetaPath, JSON.stringify(mChildQueryOptions), sClassName);
            return undefined;
        }
        return mQueryOptions;
    }
};
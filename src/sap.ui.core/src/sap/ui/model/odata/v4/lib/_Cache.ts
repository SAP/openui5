import _GroupLock from "./_GroupLock";
import _Helper from "./_Helper";
import _Requestor from "./_Requestor";
import Log from "sap/base/Log";
import isEmptyObject from "sap/base/util/isEmptyObject";
import SyncPromise from "sap/ui/base/SyncPromise";
import ODataUtils from "sap/ui/model/odata/ODataUtils";
var sClassName = "sap.ui.model.odata.v4.lib._Cache", rEndsWithTransientPredicate = /\(\$uid=[-\w]+\)$/, sMessagesAnnotation = "@com.sap.vocabularies.Common.v1.Messages", rNumber = /^-?\d+$/, rSegmentWithPredicate = /^([^(]*)(\(.*\))$/;
function addToCount(mChangeListeners, sPath, aCollection, iDelta) {
    if (aCollection.$count !== undefined) {
        setCount(mChangeListeners, sPath, aCollection, aCollection.$count + iDelta);
    }
}
function isSubPath(sRequestPath, sPath) {
    return sPath === "" || sRequestPath === sPath || sRequestPath.startsWith(sPath + "/");
}
function setCount(mChangeListeners, sPath, aCollection, vCount) {
    if (typeof vCount === "string") {
        vCount = parseInt(vCount);
    }
    _Helper.updateExisting(mChangeListeners, sPath, aCollection, { $count: vCount });
}
function _Cache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, fnGetOriginalResourcePath, bSharedRequest) {
    this.iActiveUsages = 1;
    this.mChangeListeners = {};
    this.fnGetOriginalResourcePath = fnGetOriginalResourcePath;
    this.iInactiveSince = Infinity;
    this.mPatchRequests = {};
    this.oPendingRequestsPromise = null;
    this.mPostRequests = {};
    this.sReportedMessagesPath = undefined;
    this.oRequestor = oRequestor;
    this.bSentRequest = false;
    this.bSortExpandSelect = bSortExpandSelect;
    this.setResourcePath(sResourcePath);
    this.setQueryOptions(mQueryOptions);
    this.bSharedRequest = bSharedRequest;
}
_Cache.prototype._delete = function (oGroupLock, sEditUrl, sPath, oETagEntity, fnCallback) {
    var aSegments = sPath.split("/"), vDeleteProperty = aSegments.pop(), iIndex = rNumber.test(vDeleteProperty) ? Number(vDeleteProperty) : undefined, sParentPath = aSegments.join("/"), that = this;
    this.checkSharedRequest();
    this.addPendingRequest();
    return this.fetchValue(_GroupLock.$cached, sParentPath).then(function (vCacheData) {
        var vCachePath = _Cache.from$skip(vDeleteProperty, vCacheData), oEntity = vDeleteProperty ? vCacheData[vCachePath] || vCacheData.$byPredicate[vCachePath] : vCacheData, mHeaders, sKeyPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate"), sEntityPath = _Helper.buildPath(sParentPath, Array.isArray(vCacheData) ? sKeyPredicate : vDeleteProperty), sTransientGroup = _Helper.getPrivateAnnotation(oEntity, "transient");
        if (sTransientGroup === true) {
            throw new Error("No 'delete' allowed while waiting for server response");
        }
        if (sTransientGroup) {
            oGroupLock.unlock();
            that.oRequestor.removePost(sTransientGroup, oEntity);
            return undefined;
        }
        if (oEntity["$ui5.deleting"]) {
            throw new Error("Must not delete twice: " + sEditUrl);
        }
        oEntity["$ui5.deleting"] = true;
        mHeaders = { "If-Match": oETagEntity || oEntity };
        sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
        return SyncPromise.all([
            that.oRequestor.request("DELETE", sEditUrl, oGroupLock.getUnlockedCopy(), mHeaders, undefined, undefined, undefined, undefined, _Helper.buildPath(that.getOriginalResourcePath(oEntity), sEntityPath)).catch(function (oError) {
                if (oError.status !== 404) {
                    delete oEntity["$ui5.deleting"];
                    throw oError;
                }
            }).then(function () {
                if (Array.isArray(vCacheData)) {
                    fnCallback(that.removeElement(vCacheData, iIndex, sKeyPredicate, sParentPath), vCacheData);
                }
                else {
                    if (vDeleteProperty) {
                        _Helper.updateExisting(that.mChangeListeners, sParentPath, vCacheData, _Cache.makeUpdateData([vDeleteProperty], null));
                    }
                    else {
                        oEntity["$ui5.deleted"] = true;
                    }
                    fnCallback();
                }
                that.oRequestor.getModelInterface().reportStateMessages(that.sResourcePath, [], [sEntityPath]);
            }),
            iIndex === undefined && that.requestCount(oGroupLock),
            oGroupLock.unlock()
        ]);
    }).finally(function () {
        that.removePendingRequest();
    });
};
_Cache.prototype.addPendingRequest = function () {
    var fnResolve;
    if (!this.oPendingRequestsPromise) {
        this.oPendingRequestsPromise = new SyncPromise(function (resolve) {
            fnResolve = resolve;
        });
        this.oPendingRequestsPromise.$count = 0;
        this.oPendingRequestsPromise.$resolve = fnResolve;
    }
    this.oPendingRequestsPromise.$count += 1;
};
_Cache.prototype.calculateKeyPredicate = function (oInstance, mTypeForMetaPath, sMetaPath) {
    var sPredicate, oType = mTypeForMetaPath[sMetaPath];
    if (oType && oType.$Key) {
        sPredicate = _Helper.getKeyPredicate(oInstance, sMetaPath, mTypeForMetaPath);
        if (sPredicate) {
            _Helper.setPrivateAnnotation(oInstance, "predicate", sPredicate);
        }
    }
    return sPredicate;
};
_Cache.prototype.checkSharedRequest = function () {
    if (this.bSharedRequest) {
        throw new Error(this + " is read-only");
    }
};
_Cache.prototype.create = function (oGroupLock, oPostPathPromise, sPath, sTransientPredicate, oEntityData, fnErrorCallback, fnSubmitCallback) {
    var aCollection, bKeepTransientPath = oEntityData && oEntityData["@$ui5.keepTransientPath"], oPostBody, that = this;
    function cleanUp() {
        _Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
        aCollection.splice(aCollection.indexOf(oEntityData), 1);
        aCollection.$created -= 1;
        addToCount(that.mChangeListeners, sPath, aCollection, -1);
        delete aCollection.$byPredicate[sTransientPredicate];
        if (!sPath) {
            that.adjustReadRequests(0, -1);
        }
        oGroupLock.cancel();
    }
    function setCreatePending() {
        that.addPendingRequest();
        _Helper.setPrivateAnnotation(oEntityData, "transient", true);
        fnSubmitCallback();
    }
    function request(sPostPath, oPostGroupLock) {
        var sPostGroupId = oPostGroupLock.getGroupId();
        _Helper.setPrivateAnnotation(oEntityData, "transient", sPostGroupId);
        _Helper.addByPath(that.mPostRequests, sPath, oEntityData);
        return SyncPromise.all([
            that.oRequestor.request("POST", sPostPath, oPostGroupLock, null, oPostBody, setCreatePending, cleanUp, undefined, _Helper.buildPath(that.sResourcePath, sPath, sTransientPredicate)),
            that.fetchTypes()
        ]).then(function (aResult) {
            var oCreatedEntity = aResult[0], sPredicate, aSelect;
            _Helper.deletePrivateAnnotation(oEntityData, "postBody");
            _Helper.deletePrivateAnnotation(oEntityData, "transient");
            oEntityData["@$ui5.context.isTransient"] = false;
            _Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
            that.visitResponse(oCreatedEntity, aResult[1], _Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sPath)), sPath + sTransientPredicate, bKeepTransientPath);
            sPredicate = _Helper.getPrivateAnnotation(oCreatedEntity, "predicate");
            if (sPredicate) {
                _Helper.setPrivateAnnotation(oEntityData, "predicate", sPredicate);
                if (bKeepTransientPath) {
                    sPredicate = sTransientPredicate;
                }
                else {
                    aCollection.$byPredicate[sPredicate] = oEntityData;
                    _Helper.updateTransientPaths(that.mChangeListeners, sTransientPredicate, sPredicate);
                }
            }
            aSelect = _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath).$select;
            _Helper.updateSelected(that.mChangeListeners, _Helper.buildPath(sPath, sPredicate || sTransientPredicate), oEntityData, oCreatedEntity, aSelect && aSelect.concat("@odata.etag"));
            that.removePendingRequest();
            return oEntityData;
        }, function (oError) {
            if (oError.canceled) {
                throw oError;
            }
            that.removePendingRequest();
            fnErrorCallback(oError);
            if (that.fetchTypes().isRejected()) {
                throw oError;
            }
            return request(sPostPath, that.oRequestor.lockGroup(that.oRequestor.getGroupSubmitMode(sPostGroupId) === "API" ? sPostGroupId : "$parked." + sPostGroupId, that, true, true));
        });
    }
    this.checkSharedRequest();
    oEntityData = _Helper.publicClone(oEntityData, true) || {};
    oPostBody = _Helper.merge({}, oEntityData);
    _Helper.setPrivateAnnotation(oEntityData, "postBody", oPostBody);
    _Helper.setPrivateAnnotation(oEntityData, "transientPredicate", sTransientPredicate);
    oEntityData["@$ui5.context.isTransient"] = true;
    aCollection = this.getValue(sPath);
    if (!Array.isArray(aCollection)) {
        throw new Error("Create is only supported for collections; '" + sPath + "' does not reference a collection");
    }
    aCollection.unshift(oEntityData);
    aCollection.$created += 1;
    addToCount(this.mChangeListeners, sPath, aCollection, 1);
    aCollection.$byPredicate = aCollection.$byPredicate || {};
    aCollection.$byPredicate[sTransientPredicate] = oEntityData;
    if (!sPath) {
        that.adjustReadRequests(0, 1);
    }
    return oPostPathPromise.then(function (sPostPath) {
        sPostPath += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
        return request(sPostPath, oGroupLock);
    });
};
_Cache.prototype.deregisterChange = function (sPath, oListener) {
    if (!this.bSharedRequest) {
        _Helper.removeByPath(this.mChangeListeners, sPath, oListener);
    }
};
_Cache.prototype.drillDown = function (oData, sPath, oGroupLock, bCreateOnDemand) {
    var oDataPromise = SyncPromise.resolve(oData), oEntity, iEntityPathLength, aSegments, bTransient = false, that = this;
    function invalidSegment(sSegment, bAsInfo) {
        Log[bAsInfo ? "info" : "error"]("Failed to drill-down into " + sPath + ", invalid segment: " + sSegment, that.toString(), sClassName);
        return undefined;
    }
    function missingValue(oValue, sSegment, iPathLength) {
        var sPropertyPath = aSegments.slice(0, iPathLength).join("/"), sReadLink, sServiceUrl;
        if (Array.isArray(oValue)) {
            return invalidSegment(sSegment, sSegment === "0");
        }
        return that.oRequestor.getModelInterface().fetchMetadata(that.sMetaPath + "/" + _Helper.getMetaPath(sPropertyPath)).then(function (oProperty) {
            var vPermissions;
            if (!oProperty) {
                return invalidSegment(sSegment);
            }
            if (oProperty.$Type === "Edm.Stream") {
                sReadLink = oValue[sSegment + "@odata.mediaReadLink"] || oValue[sSegment + "@mediaReadLink"];
                sServiceUrl = that.oRequestor.getServiceUrl();
                return sReadLink || _Helper.buildPath(sServiceUrl + that.sResourcePath, sPropertyPath);
            }
            if (!bTransient) {
                vPermissions = oValue[_Helper.getAnnotationKey(oValue, ".Permissions", sSegment)];
                if (vPermissions === 0 || vPermissions === "None") {
                    return undefined;
                }
                if (!oEntity && !Array.isArray(oData)) {
                    oEntity = oData;
                    iEntityPathLength = 0;
                }
                return oEntity && that.fetchLateProperty(oGroupLock, oEntity, aSegments.slice(0, iEntityPathLength).join("/"), aSegments.slice(iEntityPathLength).join("/"), aSegments.slice(iEntityPathLength, iPathLength).join("/")) || invalidSegment(sSegment);
            }
            if (oProperty.$kind === "NavigationProperty") {
                return null;
            }
            if (!oProperty.$Type.startsWith("Edm.")) {
                return {};
            }
            if ("$DefaultValue" in oProperty) {
                return oProperty.$Type === "Edm.String" ? oProperty.$DefaultValue : _Helper.parseLiteral(oProperty.$DefaultValue, oProperty.$Type, sPropertyPath);
            }
            return null;
        });
    }
    if (!sPath) {
        return oDataPromise;
    }
    aSegments = sPath.split("/");
    return aSegments.reduce(function (oPromise, sSegment, i) {
        return oPromise.then(function (vValue) {
            var vIndex, aMatches, oParentValue;
            if (sSegment === "$count") {
                return Array.isArray(vValue) ? vValue.$count : invalidSegment(sSegment);
            }
            if (vValue === undefined || vValue === null) {
                return undefined;
            }
            if (typeof vValue !== "object" || sSegment === "@$ui5._" || Array.isArray(vValue) && (sSegment[0] === "$" || sSegment === "length")) {
                return invalidSegment(sSegment);
            }
            if (_Helper.hasPrivateAnnotation(vValue, "predicate")) {
                oEntity = vValue;
                iEntityPathLength = i;
            }
            oParentValue = vValue;
            bTransient = bTransient || vValue["@$ui5.context.isTransient"];
            aMatches = rSegmentWithPredicate.exec(sSegment);
            if (aMatches) {
                if (aMatches[1]) {
                    vValue = vValue[aMatches[1]];
                }
                if (vValue) {
                    vValue = vValue.$byPredicate && vValue.$byPredicate[aMatches[2]];
                }
            }
            else {
                vIndex = _Cache.from$skip(sSegment, vValue);
                if (bCreateOnDemand && vIndex === sSegment && (vValue[sSegment] === undefined || vValue[sSegment] === null)) {
                    vValue[sSegment] = {};
                }
                vValue = vValue[vIndex];
            }
            return vValue === undefined && sSegment[0] !== "#" && !sSegment.includes("@") ? missingValue(oParentValue, sSegment, i + 1) : vValue;
        });
    }, oDataPromise);
};
_Cache.prototype.fetchLateProperty = function (oGroupLock, oResource, sResourcePath, sRequestedPropertyPath, sMissingPropertyPath) {
    var sFullResourceMetaPath, sFullResourcePath, sMergeBasePath, oPromise, mQueryOptions, sRequestPath, sResourceMetaPath = _Helper.getMetaPath(sResourcePath), mTypeForMetaPath = this.fetchTypes().getResult(), aUpdateProperties = [sRequestedPropertyPath], that = this;
    function visitQueryOptions(mQueryOptions0, sBasePath) {
        var sMetaPath = _Helper.buildPath(sFullResourceMetaPath, sBasePath), oEntityType = mTypeForMetaPath[sMetaPath], sExpand;
        if (!oEntityType) {
            oEntityType = that.fetchType(mTypeForMetaPath, sMetaPath).getResult();
        }
        if (sBasePath) {
            (oEntityType.$Key || []).forEach(function (vKey) {
                if (typeof vKey === "object") {
                    vKey = vKey[Object.keys(vKey)[0]];
                }
                aUpdateProperties.push(_Helper.buildPath(sBasePath, vKey));
            });
            aUpdateProperties.push(sBasePath + "/@odata.etag");
            aUpdateProperties.push(sBasePath + "/@$ui5._/predicate");
        }
        if (mQueryOptions0.$expand) {
            sExpand = Object.keys(mQueryOptions0.$expand)[0];
            visitQueryOptions(mQueryOptions0.$expand[sExpand], _Helper.buildPath(sBasePath, sExpand));
        }
    }
    if (!this.mLateQueryOptions) {
        return undefined;
    }
    sFullResourceMetaPath = _Helper.buildPath(this.sMetaPath, sResourceMetaPath);
    mQueryOptions = _Helper.intersectQueryOptions(_Helper.getQueryOptionsForPath(this.mLateQueryOptions, sResourcePath), [sRequestedPropertyPath], this.oRequestor.getModelInterface().fetchMetadata, sFullResourceMetaPath, {});
    if (!mQueryOptions) {
        return undefined;
    }
    visitQueryOptions(mQueryOptions);
    sFullResourcePath = _Helper.buildPath(this.sResourcePath, sResourcePath);
    sRequestPath = sFullResourcePath + this.oRequestor.buildQueryString(sFullResourceMetaPath, mQueryOptions, false, true);
    oPromise = this.mPropertyRequestByPath[sRequestPath];
    if (!oPromise) {
        sMergeBasePath = sFullResourcePath + this.oRequestor.buildQueryString(sFullResourceMetaPath, this.mQueryOptions, true);
        oPromise = this.oRequestor.request("GET", sMergeBasePath, oGroupLock.getUnlockedCopy(), undefined, undefined, undefined, undefined, sFullResourceMetaPath, undefined, false, mQueryOptions).then(function (oData) {
            that.visitResponse(oData, mTypeForMetaPath, sFullResourceMetaPath, sResourcePath);
            return oData;
        });
        this.mPropertyRequestByPath[sRequestPath] = oPromise;
    }
    return oPromise.then(function (oData) {
        var sPredicate = _Helper.getPrivateAnnotation(oData, "predicate");
        if (sPredicate && _Helper.getPrivateAnnotation(oResource, "predicate") !== sPredicate) {
            throw new Error("GET " + sRequestPath + ": Key predicate changed from " + _Helper.getPrivateAnnotation(oResource, "predicate") + " to " + sPredicate);
        }
        if (oData["@odata.etag"] !== oResource["@odata.etag"]) {
            throw new Error("GET " + sRequestPath + ": ETag changed");
        }
        _Helper.updateSelected(that.mChangeListeners, sResourcePath, oResource, oData, aUpdateProperties);
        return _Helper.drillDown(oResource, sMissingPropertyPath.split("/"));
    }).finally(function () {
        delete that.mPropertyRequestByPath[sRequestPath];
    });
};
_Cache.prototype.fetchType = function (mTypeForMetaPath, sMetaPath) {
    var that = this;
    return this.oRequestor.fetchTypeForPath(sMetaPath).then(function (oType) {
        var oMessageAnnotation, aPromises = [];
        if (oType) {
            oMessageAnnotation = that.oRequestor.getModelInterface().fetchMetadata(sMetaPath + "/" + sMessagesAnnotation).getResult();
            if (oMessageAnnotation) {
                oType = Object.create(oType);
                oType[sMessagesAnnotation] = oMessageAnnotation;
            }
            mTypeForMetaPath[sMetaPath] = oType;
            (oType.$Key || []).forEach(function (vKey) {
                if (typeof vKey === "object") {
                    vKey = vKey[Object.keys(vKey)[0]];
                    aPromises.push(that.fetchType(mTypeForMetaPath, sMetaPath + "/" + vKey.slice(0, vKey.lastIndexOf("/"))));
                }
            });
            return SyncPromise.all(aPromises).then(function () {
                return oType;
            });
        }
    });
};
_Cache.prototype.fetchTypes = function () {
    var aPromises, mTypeForMetaPath, that = this;
    function fetchExpandedTypes(sBaseMetaPath, mQueryOptions) {
        if (mQueryOptions && mQueryOptions.$expand) {
            Object.keys(mQueryOptions.$expand).forEach(function (sNavigationPath) {
                var sMetaPath = sBaseMetaPath;
                sNavigationPath.split("/").forEach(function (sSegment) {
                    sMetaPath += "/" + sSegment;
                    aPromises.push(that.fetchType(mTypeForMetaPath, sMetaPath));
                });
                fetchExpandedTypes(sMetaPath, mQueryOptions.$expand[sNavigationPath]);
            });
        }
    }
    if (!this.oTypePromise) {
        aPromises = [];
        mTypeForMetaPath = {};
        aPromises.push(this.fetchType(mTypeForMetaPath, this.sMetaPath));
        fetchExpandedTypes(this.sMetaPath, this.mQueryOptions);
        this.oTypePromise = SyncPromise.all(aPromises).then(function () {
            return mTypeForMetaPath;
        });
    }
    return this.oTypePromise;
};
_Cache.prototype.getDownloadQueryOptions = function (mQueryOptions) {
    return mQueryOptions;
};
_Cache.prototype.getDownloadUrl = function (sPath, mCustomQueryOptions) {
    var mQueryOptions = this.mQueryOptions;
    if (sPath) {
        mQueryOptions = _Helper.getQueryOptionsForPath(mQueryOptions, sPath);
        mQueryOptions = _Helper.merge({}, mCustomQueryOptions, mQueryOptions);
    }
    return this.oRequestor.getServiceUrl() + _Helper.buildPath(this.sResourcePath, sPath) + this.oRequestor.buildQueryString(_Helper.buildPath(this.sMetaPath, _Helper.getMetaPath(sPath)), this.getDownloadQueryOptions(mQueryOptions));
};
_Cache.prototype.getLateQueryOptions = function () {
    return this.mLateQueryOptions;
};
_Cache.prototype.getQueryOptions = function () {
    return this.mQueryOptions;
};
_Cache.prototype.getValue = function (_sPath) {
    throw new Error("Unsupported operation");
};
_Cache.prototype.getOriginalResourcePath = function (oEntity) {
    return this.fnGetOriginalResourcePath && this.fnGetOriginalResourcePath(oEntity) || this.sResourcePath;
};
_Cache.prototype.getResourcePath = function () {
    return this.sResourcePath;
};
_Cache.prototype.hasChangeListeners = function () {
    return !isEmptyObject(this.mChangeListeners);
};
_Cache.prototype.hasPendingChangesForPath = function (sPath) {
    return Object.keys(this.mPatchRequests).some(function (sRequestPath) {
        return isSubPath(sRequestPath, sPath);
    }) || Object.keys(this.mPostRequests).some(function (sRequestPath) {
        return isSubPath(sRequestPath, sPath);
    });
};
_Cache.prototype.hasSentRequest = function () {
    return this.bSentRequest;
};
_Cache.prototype.patch = function (sPath, oData) {
    var that = this;
    this.checkSharedRequest();
    return this.fetchValue(_GroupLock.$cached, sPath).then(function (oCacheValue) {
        _Helper.updateExisting(that.mChangeListeners, sPath, oCacheValue, oData);
        return oCacheValue;
    });
};
_Cache.prototype.refreshSingle = function (oGroupLock, sPath, iIndex, sPredicate, bKeepAlive, fnDataRequested) {
    var that = this;
    this.checkSharedRequest();
    return this.fetchValue(_GroupLock.$cached, sPath).then(function (aElements) {
        var mQueryOptions = Object.assign({}, _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath)), sReadUrl;
        if (iIndex !== undefined) {
            sPredicate = _Helper.getPrivateAnnotation(aElements[iIndex], "predicate");
        }
        sReadUrl = _Helper.buildPath(that.sResourcePath, sPath, sPredicate);
        if (bKeepAlive && that.mLateQueryOptions) {
            _Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
        }
        delete mQueryOptions.$apply;
        delete mQueryOptions.$count;
        delete mQueryOptions.$filter;
        delete mQueryOptions.$orderby;
        delete mQueryOptions.$search;
        sReadUrl += that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false, that.bSortExpandSelect);
        that.bSentRequest = true;
        return SyncPromise.all([
            that.oRequestor.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested),
            that.fetchTypes()
        ]).then(function (aResult) {
            var oElement = aResult[0];
            that.replaceElement(aElements, iIndex, sPredicate, oElement, aResult[1], sPath);
        });
    });
};
_Cache.prototype.refreshSingleWithRemove = function (oGroupLock, sPath, iIndex, sPredicate, bKeepAlive, fnDataRequested, fnOnRemove) {
    var that = this;
    this.checkSharedRequest();
    return SyncPromise.all([
        this.fetchValue(_GroupLock.$cached, sPath),
        this.fetchTypes()
    ]).then(function (aResults) {
        var aElements = aResults[0], oEntity, sInCollectionFilter, mInCollectionQueryOptions = {}, sInCollectionUrl, sKeyFilter, mQueryOptions = Object.assign({}, _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath)), sReadUrl, sReadUrlPrefix = _Helper.buildPath(that.sResourcePath, sPath), aRequests = [], mTypeForMetaPath = aResults[1];
        if (iIndex !== undefined) {
            oEntity = aElements[iIndex];
            sPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate");
        }
        else {
            oEntity = aElements.$byPredicate[sPredicate];
        }
        sKeyFilter = _Helper.getKeyFilter(oEntity, that.sMetaPath, mTypeForMetaPath);
        sInCollectionFilter = (mQueryOptions.$filter ? "(" + mQueryOptions.$filter + ") and " : "") + sKeyFilter;
        delete mQueryOptions.$count;
        delete mQueryOptions.$orderby;
        that.bSentRequest = true;
        if (bKeepAlive) {
            if (that.mLateQueryOptions) {
                _Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
            }
            mInCollectionQueryOptions = Object.assign({}, mQueryOptions);
            mInCollectionQueryOptions.$filter = sInCollectionFilter;
            mQueryOptions.$filter = sKeyFilter;
            delete mQueryOptions.$search;
            sReadUrl = sReadUrlPrefix + that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false, that.bSortExpandSelect);
            aRequests.push(that.oRequestor.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested));
            if (iIndex !== undefined && (sKeyFilter !== sInCollectionFilter || mInCollectionQueryOptions.$search)) {
                delete mInCollectionQueryOptions.$select;
                delete mInCollectionQueryOptions.$expand;
                mInCollectionQueryOptions.$count = true;
                mInCollectionQueryOptions.$top = 0;
                sInCollectionUrl = sReadUrlPrefix + that.oRequestor.buildQueryString(that.sMetaPath, mInCollectionQueryOptions);
                aRequests.push(that.oRequestor.request("GET", sInCollectionUrl, oGroupLock.getUnlockedCopy()));
            }
        }
        else {
            mQueryOptions.$filter = sInCollectionFilter;
            sReadUrl = sReadUrlPrefix + that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false, that.bSortExpandSelect);
            aRequests.push(that.oRequestor.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested));
        }
        return SyncPromise.all(aRequests).then(function (aResults) {
            var aReadResult = aResults[0].value, bRemoveFromCollection = aResults[1] && aResults[1]["@odata.count"] === "0";
            if (aReadResult.length > 1) {
                throw new Error("Unexpected server response, more than one entity returned.");
            }
            else if (aReadResult.length === 0) {
                that.removeElement(aElements, iIndex, sPredicate, sPath);
                that.oRequestor.getModelInterface().reportStateMessages(that.sResourcePath, [], [sPath + sPredicate]);
                fnOnRemove(false);
            }
            else if (bRemoveFromCollection) {
                that.removeElement(aElements, iIndex, sPredicate, sPath);
                that.replaceElement(aElements, undefined, sPredicate, aReadResult[0], mTypeForMetaPath, sPath);
                fnOnRemove(true);
            }
            else {
                that.replaceElement(aElements, iIndex, sPredicate, aReadResult[0], mTypeForMetaPath, sPath);
            }
        });
    });
};
_Cache.prototype.registerChange = function (sPath, oListener) {
    if (!this.bSharedRequest) {
        _Helper.addByPath(this.mChangeListeners, sPath, oListener);
    }
};
_Cache.prototype.removeElement = function (aElements, iIndex, sPredicate, sPath) {
    var oElement, sTransientPredicate;
    oElement = aElements.$byPredicate[sPredicate];
    if (iIndex !== undefined) {
        iIndex = _Cache.getElementIndex(aElements, sPredicate, iIndex);
        aElements.splice(iIndex, 1);
        addToCount(this.mChangeListeners, sPath, aElements, -1);
    }
    delete aElements.$byPredicate[sPredicate];
    sTransientPredicate = _Helper.getPrivateAnnotation(oElement, "transientPredicate");
    if (sTransientPredicate) {
        aElements.$created -= 1;
        delete aElements.$byPredicate[sTransientPredicate];
    }
    else if (!sPath) {
        if (iIndex !== undefined) {
            this.iLimit -= 1;
            this.adjustReadRequests(iIndex, -1);
        }
    }
    return iIndex;
};
_Cache.prototype.removeMessages = function () {
    if (this.sReportedMessagesPath) {
        this.oRequestor.getModelInterface().reportStateMessages(this.sReportedMessagesPath, {});
        this.sReportedMessagesPath = undefined;
    }
};
_Cache.prototype.removePendingRequest = function () {
    if (this.oPendingRequestsPromise) {
        this.oPendingRequestsPromise.$count -= 1;
        if (!this.oPendingRequestsPromise.$count) {
            this.oPendingRequestsPromise.$resolve();
            this.oPendingRequestsPromise = null;
        }
    }
};
_Cache.prototype.replaceElement = function (aElements, iIndex, sPredicate, oElement, mTypeForMetaPath, sPath) {
    var oOldElement, sTransientPredicate;
    if (iIndex === undefined) {
        aElements.$byPredicate[sPredicate] = oElement;
    }
    else {
        iIndex = _Cache.getElementIndex(aElements, sPredicate, iIndex);
        oOldElement = aElements[iIndex];
        aElements[iIndex] = aElements.$byPredicate[sPredicate] = oElement;
        sTransientPredicate = _Helper.getPrivateAnnotation(oOldElement, "transientPredicate");
        if (sTransientPredicate) {
            oElement["@$ui5.context.isTransient"] = false;
            aElements.$byPredicate[sTransientPredicate] = oElement;
            _Helper.setPrivateAnnotation(oElement, "transientPredicate", sTransientPredicate);
        }
    }
    this.visitResponse(oElement, mTypeForMetaPath, _Helper.getMetaPath(_Helper.buildPath(this.sMetaPath, sPath)), sPath + sPredicate);
};
_Cache.prototype.requestCount = function (oGroupLock) {
    var sExclusiveFilter, mQueryOptions, sReadUrl, that = this;
    if (this.mQueryOptions && this.mQueryOptions.$count) {
        mQueryOptions = Object.assign({}, this.mQueryOptions);
        delete mQueryOptions.$expand;
        delete mQueryOptions.$orderby;
        delete mQueryOptions.$select;
        sExclusiveFilter = this.getFilterExcludingCreated();
        if (sExclusiveFilter) {
            mQueryOptions.$filter = mQueryOptions.$filter ? "(" + mQueryOptions.$filter + ") and " + sExclusiveFilter : sExclusiveFilter;
        }
        mQueryOptions.$top = 0;
        sReadUrl = this.sResourcePath + this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions);
        return this.oRequestor.request("GET", sReadUrl, oGroupLock.getUnlockedCopy()).catch(function (oError) {
            if (oError.cause && oError.cause.status === 404) {
                return that.oRequestor.request("GET", sReadUrl, oGroupLock.getUnlockedCopy());
            }
            throw oError;
        }).then(function (oResult) {
            var iCount = parseInt(oResult["@odata.count"]) + that.aElements.$created;
            setCount(that.mChangeListeners, "", that.aElements, iCount);
            that.iLimit = iCount;
        });
    }
};
_Cache.prototype.resetChangesForPath = function (sPath) {
    var that = this;
    Object.keys(this.mPatchRequests).forEach(function (sRequestPath) {
        var aPromises, i;
        if (isSubPath(sRequestPath, sPath)) {
            aPromises = that.mPatchRequests[sRequestPath];
            for (i = aPromises.length - 1; i >= 0; i -= 1) {
                that.oRequestor.removePatch(aPromises[i]);
            }
            delete that.mPatchRequests[sRequestPath];
        }
    });
    Object.keys(this.mPostRequests).forEach(function (sRequestPath) {
        var aEntities, sTransientGroup, i;
        if (isSubPath(sRequestPath, sPath)) {
            aEntities = that.mPostRequests[sRequestPath];
            for (i = aEntities.length - 1; i >= 0; i -= 1) {
                sTransientGroup = _Helper.getPrivateAnnotation(aEntities[i], "transient");
                that.oRequestor.removePost(sTransientGroup, aEntities[i]);
            }
            delete that.mPostRequests[sRequestPath];
        }
    });
};
_Cache.prototype.setActive = function (bActive) {
    if (bActive) {
        this.iActiveUsages += 1;
        this.iInactiveSince = Infinity;
    }
    else {
        this.iActiveUsages -= 1;
        if (!this.iActiveUsages) {
            this.iInactiveSince = Date.now();
        }
        this.mChangeListeners = {};
    }
};
_Cache.prototype.setLateQueryOptions = function (mQueryOptions) {
    if (mQueryOptions) {
        this.mLateQueryOptions = {
            $select: mQueryOptions.$select,
            $expand: mQueryOptions.$expand
        };
    }
    else {
        this.mLateQueryOptions = null;
    }
};
_Cache.prototype.setProperty = function (sPropertyPath, vValue, sEntityPath) {
    var that = this;
    this.checkSharedRequest();
    return this.fetchValue(_GroupLock.$cached, sEntityPath, null, null, true).then(function (oEntity) {
        _Helper.updateAll(that.mChangeListeners, sEntityPath, oEntity, _Cache.makeUpdateData(sPropertyPath.split("/"), vValue));
    });
};
_Cache.prototype.setQueryOptions = function (mQueryOptions, bForce) {
    this.checkSharedRequest();
    if (this.bSentRequest && !bForce) {
        throw new Error("Cannot set query options: Cache has already sent a request");
    }
    this.mQueryOptions = mQueryOptions;
    this.sQueryString = this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, this.bSortExpandSelect);
};
_Cache.prototype.setResourcePath = function (sResourcePath) {
    this.checkSharedRequest();
    this.sResourcePath = sResourcePath;
    this.sMetaPath = _Helper.getMetaPath("/" + sResourcePath);
    this.oTypePromise = undefined;
    this.mLateQueryOptions = null;
    this.mPropertyRequestByPath = {};
};
_Cache.prototype.toString = function () {
    return this.oRequestor.getServiceUrl() + this.sResourcePath + this.sQueryString;
};
_Cache.prototype.update = function (oGroupLock, sPropertyPath, vValue, fnErrorCallback, sEditUrl, sEntityPath, sUnitOrCurrencyPath, bPatchWithoutSideEffects, fnPatchSent) {
    var oPromise, aPropertyPath = sPropertyPath.split("/"), aUnitOrCurrencyPath, that = this;
    this.checkSharedRequest();
    try {
        oPromise = this.fetchValue(_GroupLock.$cached, sEntityPath);
    }
    catch (oError) {
        if (!oError.$cached || this.oPromise !== null) {
            throw oError;
        }
        oPromise = this.oPromise = SyncPromise.resolve({ "@odata.etag": "*" });
    }
    return oPromise.then(function (oEntity) {
        var sFullPath = _Helper.buildPath(sEntityPath, sPropertyPath), sGroupId = oGroupLock.getGroupId(), vOldValue, oPatchPromise, oPostBody, sParkedGroup, sTransientGroup, sUnitOrCurrencyValue, oUpdateData = _Cache.makeUpdateData(aPropertyPath, vValue);
        function onCancel() {
            _Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
            _Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity, _Cache.makeUpdateData(aPropertyPath, vOldValue));
        }
        function patch(oPatchGroupLock, bAtFront) {
            var mHeaders = { "If-Match": oEntity }, oRequestLock;
            function onSubmit() {
                oRequestLock = that.oRequestor.lockGroup(sGroupId, that, true);
                fnPatchSent();
            }
            if (bPatchWithoutSideEffects) {
                mHeaders.Prefer = "return=minimal";
            }
            oPatchPromise = that.oRequestor.request("PATCH", sEditUrl, oPatchGroupLock, mHeaders, oUpdateData, onSubmit, onCancel, undefined, _Helper.buildPath(that.getOriginalResourcePath(oEntity), sEntityPath), bAtFront);
            _Helper.addByPath(that.mPatchRequests, sFullPath, oPatchPromise);
            return SyncPromise.all([
                oPatchPromise,
                that.fetchTypes()
            ]).then(function (aResult) {
                var oPatchResult = aResult[0];
                _Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
                if (!bPatchWithoutSideEffects) {
                    that.visitResponse(oPatchResult, aResult[1], _Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sEntityPath)), sEntityPath);
                }
                _Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity, bPatchWithoutSideEffects ? { "@odata.etag": oPatchResult["@odata.etag"] } : oPatchResult);
            }, function (oError) {
                var sRetryGroupId = sGroupId;
                if (!fnErrorCallback) {
                    onCancel();
                    throw oError;
                }
                _Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
                if (oError.canceled) {
                    throw oError;
                }
                fnErrorCallback(oError);
                switch (that.oRequestor.getGroupSubmitMode(sGroupId)) {
                    case "API": break;
                    case "Auto":
                        if (!that.oRequestor.hasChanges(sGroupId, oEntity)) {
                            sRetryGroupId = "$parked." + sGroupId;
                        }
                        break;
                    default: throw oError;
                }
                oRequestLock.unlock();
                oRequestLock = undefined;
                return patch(that.oRequestor.lockGroup(sRetryGroupId, that, true, true), true);
            }).finally(function () {
                if (oRequestLock) {
                    oRequestLock.unlock();
                }
            });
        }
        if (!oEntity) {
            throw new Error("Cannot update '" + sPropertyPath + "': '" + sEntityPath + "' does not exist");
        }
        sTransientGroup = _Helper.getPrivateAnnotation(oEntity, "transient");
        if (sTransientGroup) {
            if (sTransientGroup === true) {
                throw new Error("No 'update' allowed while waiting for server response");
            }
            if (sTransientGroup.startsWith("$parked.")) {
                sParkedGroup = sTransientGroup;
                sTransientGroup = sTransientGroup.slice(8);
            }
            if (sTransientGroup !== sGroupId) {
                throw new Error("The entity will be created via group '" + sTransientGroup + "'. Cannot patch via group '" + sGroupId + "'");
            }
        }
        vOldValue = _Helper.drillDown(oEntity, aPropertyPath);
        _Helper.updateAll(that.mChangeListeners, sEntityPath, oEntity, oUpdateData);
        oPostBody = _Helper.getPrivateAnnotation(oEntity, "postBody");
        if (oPostBody) {
            _Helper.updateAll({}, sEntityPath, oPostBody, oUpdateData);
        }
        if (sUnitOrCurrencyPath) {
            aUnitOrCurrencyPath = sUnitOrCurrencyPath.split("/");
            sUnitOrCurrencyPath = _Helper.buildPath(sEntityPath, sUnitOrCurrencyPath);
            sUnitOrCurrencyValue = that.getValue(sUnitOrCurrencyPath);
            if (sUnitOrCurrencyValue === undefined) {
                Log.debug("Missing value for unit of measure " + sUnitOrCurrencyPath + " when updating " + sFullPath, that.toString(), sClassName);
            }
            else {
                _Helper.merge(sTransientGroup ? oPostBody : oUpdateData, _Cache.makeUpdateData(aUnitOrCurrencyPath, sUnitOrCurrencyValue));
            }
        }
        if (sTransientGroup) {
            if (sParkedGroup) {
                _Helper.setPrivateAnnotation(oEntity, "transient", sTransientGroup);
                that.oRequestor.relocate(sParkedGroup, oPostBody, sTransientGroup);
            }
            oGroupLock.unlock();
            return Promise.resolve();
        }
        that.oRequestor.relocateAll("$parked." + sGroupId, sGroupId, oEntity);
        sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
        return patch(oGroupLock);
    });
};
_Cache.prototype.visitResponse = function (oRoot, mTypeForMetaPath, sRootMetaPath, sRootPath, bKeepTransientPath, iStart) {
    var aCachePaths, bHasMessages = false, mPathToODataMessages = {}, sRequestUrl = this.oRequestor.getServiceUrl() + this.sResourcePath, that = this;
    function addMessages(aMessages, sInstancePath, sContextUrl) {
        bHasMessages = true;
        if (aMessages && aMessages.length) {
            mPathToODataMessages[sInstancePath] = aMessages;
            aMessages.forEach(function (oMessage) {
                if (oMessage.longtextUrl) {
                    oMessage.longtextUrl = _Helper.makeAbsolute(oMessage.longtextUrl, sContextUrl);
                }
            });
        }
    }
    function buildContextUrl(sBaseUrl, sContextUrl) {
        return sContextUrl ? _Helper.makeAbsolute(sContextUrl, sBaseUrl) : sBaseUrl;
    }
    function visitArray(aInstances, sMetaPath, sCollectionPath, sContextUrl) {
        var mByPredicate = {}, iIndex, vInstance, sPredicate, i;
        for (i = 0; i < aInstances.length; i += 1) {
            vInstance = aInstances[i];
            iIndex = sCollectionPath === "" ? iStart + i : i;
            if (vInstance && typeof vInstance === "object") {
                visitInstance(vInstance, sMetaPath, sCollectionPath, sContextUrl, iIndex);
                sPredicate = _Helper.getPrivateAnnotation(vInstance, "predicate");
                if (!sCollectionPath) {
                    aCachePaths.push(sPredicate || iIndex.toString());
                }
                if (sPredicate) {
                    mByPredicate[sPredicate] = vInstance;
                    aInstances.$byPredicate = mByPredicate;
                }
            }
        }
    }
    function visitInstance(oInstance, sMetaPath, sInstancePath, sContextUrl, iIndex) {
        var aMatches, sPredicate, oType = mTypeForMetaPath[sMetaPath], sMessageProperty = oType && oType[sMessagesAnnotation] && oType[sMessagesAnnotation].$Path, aMessages;
        sContextUrl = buildContextUrl(sContextUrl, oInstance["@odata.context"]);
        sPredicate = that.calculateKeyPredicate(oInstance, mTypeForMetaPath, sMetaPath);
        if (iIndex !== undefined) {
            sInstancePath = _Helper.buildPath(sInstancePath, sPredicate || iIndex);
        }
        else if (!bKeepTransientPath && sPredicate) {
            aMatches = rEndsWithTransientPredicate.exec(sInstancePath);
            if (aMatches) {
                sInstancePath = sInstancePath.slice(0, -aMatches[0].length) + sPredicate;
            }
        }
        if (sRootPath && !aCachePaths) {
            aCachePaths = [sInstancePath];
        }
        if (sMessageProperty) {
            aMessages = _Helper.drillDown(oInstance, sMessageProperty.split("/"));
            if (aMessages !== undefined) {
                addMessages(aMessages, sInstancePath, sContextUrl);
            }
        }
        Object.keys(oInstance).forEach(function (sProperty) {
            var sCount, sPropertyMetaPath = sMetaPath + "/" + sProperty, vPropertyValue = oInstance[sProperty], sPropertyPath = _Helper.buildPath(sInstancePath, sProperty);
            if (sProperty.endsWith("@odata.mediaReadLink") || sProperty.endsWith("@mediaReadLink")) {
                oInstance[sProperty] = _Helper.makeAbsolute(vPropertyValue, sContextUrl);
            }
            if (sProperty.includes("@")) {
                return;
            }
            if (Array.isArray(vPropertyValue)) {
                vPropertyValue.$created = 0;
                vPropertyValue.$count = undefined;
                sCount = oInstance[sProperty + "@odata.count"];
                if (sCount) {
                    setCount({}, "", vPropertyValue, sCount);
                }
                else if (!oInstance[sProperty + "@odata.nextLink"]) {
                    setCount({}, "", vPropertyValue, vPropertyValue.length);
                }
                visitArray(vPropertyValue, sPropertyMetaPath, sPropertyPath, buildContextUrl(sContextUrl, oInstance[sProperty + "@odata.context"]));
            }
            else if (vPropertyValue && typeof vPropertyValue === "object") {
                visitInstance(vPropertyValue, sPropertyMetaPath, sPropertyPath, sContextUrl);
            }
        });
    }
    if (iStart !== undefined) {
        aCachePaths = [];
        visitArray(oRoot.value, sRootMetaPath || this.sMetaPath, "", buildContextUrl(sRequestUrl, oRoot["@odata.context"]));
    }
    else if (oRoot && typeof oRoot === "object") {
        visitInstance(oRoot, sRootMetaPath || this.sMetaPath, sRootPath || "", sRequestUrl);
    }
    if (bHasMessages) {
        this.sReportedMessagesPath = this.getOriginalResourcePath(oRoot);
        this.oRequestor.getModelInterface().reportStateMessages(this.sReportedMessagesPath, mPathToODataMessages, aCachePaths);
    }
};
function _CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, sDeepResourcePath, bSharedRequest) {
    _Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, function () {
        return sDeepResourcePath;
    }, bSharedRequest);
    this.sContext = undefined;
    this.aElements = [];
    this.aElements.$byPredicate = {};
    this.aElements.$count = undefined;
    this.aElements.$created = 0;
    this.aElements.$tail = undefined;
    this.iLimit = Infinity;
    this.aReadRequests = [];
    this.bServerDrivenPaging = false;
    this.oSyncPromiseAll = undefined;
}
_CollectionCache.prototype = Object.create(_Cache.prototype);
_CollectionCache.prototype.addKeptElement = function (oElement) {
    this.aElements.$byPredicate[_Helper.getPrivateAnnotation(oElement, "predicate")] = oElement;
};
_CollectionCache.prototype.adjustReadRequests = function (iIndex, iOffset) {
    this.aReadRequests.forEach(function (oReadRequest) {
        if (oReadRequest.iStart >= iIndex) {
            oReadRequest.iStart += iOffset;
            oReadRequest.iEnd += iOffset;
        }
    });
};
_CollectionCache.prototype.fetchValue = function (oGroupLock, sPath, _fnDataRequested, oListener, bCreateOnDemand) {
    var aElements, sFirstSegment = sPath.split("/")[0], oSyncPromise, that = this;
    oGroupLock.unlock();
    if (this.aElements.$byPredicate[sFirstSegment]) {
        oSyncPromise = SyncPromise.resolve();
    }
    else if ((oGroupLock === _GroupLock.$cached || sFirstSegment !== "$count") && this.aElements[sFirstSegment] !== undefined) {
        oSyncPromise = SyncPromise.resolve(this.aElements[sFirstSegment]);
    }
    else {
        if (!this.oSyncPromiseAll) {
            aElements = this.aElements.$tail ? this.aElements.concat(this.aElements.$tail) : this.aElements;
            this.oSyncPromiseAll = SyncPromise.all(aElements);
        }
        oSyncPromise = this.oSyncPromiseAll;
    }
    return oSyncPromise.then(function () {
        that.registerChange(sPath, oListener);
        return that.drillDown(that.aElements, sPath, oGroupLock, bCreateOnDemand);
    });
};
_CollectionCache.prototype.fill = function (oPromise, iStart, iEnd) {
    var i, n = Math.max(this.aElements.length, 1024);
    if (iEnd > n) {
        if (this.aElements.$tail && oPromise) {
            throw new Error("Cannot fill from " + iStart + " to " + iEnd + ", $tail already in use, # of elements is " + this.aElements.length);
        }
        this.aElements.$tail = oPromise;
        iEnd = this.aElements.length;
    }
    for (i = iStart; i < iEnd; i += 1) {
        this.aElements[i] = oPromise;
    }
    this.oSyncPromiseAll = undefined;
};
_CollectionCache.prototype.getFilterExcludingCreated = function () {
    var oElement, sKeyFilter, aKeyFilters = [], mTypeForMetaPath, i;
    for (i = 0; i < this.aElements.$created; i += 1) {
        oElement = this.aElements[i];
        if (!oElement["@$ui5.context.isTransient"]) {
            mTypeForMetaPath = mTypeForMetaPath || this.fetchTypes().getResult();
            sKeyFilter = _Helper.getKeyFilter(oElement, this.sMetaPath, mTypeForMetaPath);
            if (sKeyFilter) {
                aKeyFilters.push(sKeyFilter);
            }
        }
    }
    return aKeyFilters.length ? "not (" + aKeyFilters.join(" or ") + ")" : undefined;
};
_CollectionCache.prototype.getQueryString = function () {
    var sExclusiveFilter = this.getFilterExcludingCreated(), mQueryOptions = Object.assign({}, this.mQueryOptions), sFilterOptions = mQueryOptions.$filter, sQueryString = this.sQueryString;
    if (sExclusiveFilter) {
        if (sFilterOptions) {
            mQueryOptions.$filter = "(" + sFilterOptions + ") and " + sExclusiveFilter;
            sQueryString = this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, this.bSortExpandSelect);
        }
        else {
            sQueryString += (sQueryString ? "&" : "?") + "$filter=" + _Helper.encode(sExclusiveFilter, false);
        }
    }
    return sQueryString;
};
_CollectionCache.prototype.getResourcePathWithQuery = function (iStart, iEnd) {
    var iCreated = this.aElements.$created, sQueryString = this.getQueryString(), sDelimiter = sQueryString ? "&" : "?", iExpectedLength = iEnd - iStart, sResourcePath = this.sResourcePath + sQueryString;
    if (iStart < iCreated) {
        throw new Error("Must not request created element");
    }
    iStart -= iCreated;
    if (iStart > 0 || iExpectedLength < Infinity) {
        sResourcePath += sDelimiter + "$skip=" + iStart;
    }
    if (iExpectedLength < Infinity) {
        sResourcePath += "&$top=" + iExpectedLength;
    }
    return sResourcePath;
};
_CollectionCache.prototype.getValue = function (sPath) {
    var oSyncPromise = this.drillDown(this.aElements, sPath, _GroupLock.$cached);
    if (oSyncPromise.isFulfilled()) {
        return oSyncPromise.getResult();
    }
};
_CollectionCache.prototype.handleResponse = function (iStart, iEnd, oResult, mTypeForMetaPath) {
    var iCount = -1, sCount, iCreated = this.aElements.$created, oElement, oKeptElement, iOld$count = this.aElements.$count, sPredicate, iResultLength = oResult.value.length, i;
    this.sContext = oResult["@odata.context"];
    this.visitResponse(oResult, mTypeForMetaPath, undefined, undefined, undefined, iStart);
    for (i = 0; i < iResultLength; i += 1) {
        oElement = oResult.value[i];
        sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
        if (sPredicate) {
            oKeptElement = this.aElements.$byPredicate[sPredicate];
            if (oKeptElement) {
                if (oElement["@odata.etag"] === oKeptElement["@odata.etag"]) {
                    _Helper.merge(oElement, oKeptElement);
                }
                else if (this.hasPendingChangesForPath(sPredicate)) {
                    throw new Error("Modified on client and on server: " + this.sResourcePath + sPredicate);
                }
            }
            this.aElements.$byPredicate[sPredicate] = oElement;
        }
        this.aElements[iStart + i] = oElement;
    }
    sCount = oResult["@odata.count"];
    if (sCount) {
        this.iLimit = iCount = parseInt(sCount);
    }
    if (oResult["@odata.nextLink"]) {
        this.bServerDrivenPaging = true;
        if (iEnd < this.aElements.length) {
            for (i = iStart + iResultLength; i < iEnd; i += 1) {
                delete this.aElements[i];
            }
        }
        else {
            this.aElements.length = iStart + iResultLength;
        }
    }
    else if (iResultLength < iEnd - iStart) {
        if (iCount === -1) {
            iCount = iOld$count && iOld$count - iCreated;
        }
        iCount = Math.min(iCount !== undefined ? iCount : Infinity, iStart - iCreated + iResultLength);
        this.aElements.length = iCreated + iCount;
        this.iLimit = iCount;
        if (!sCount && iCount > 0 && !this.aElements[iCount - 1]) {
            iCount = undefined;
        }
    }
    if (iCount !== -1) {
        setCount(this.mChangeListeners, "", this.aElements, iCount !== undefined ? iCount + iCreated : undefined);
    }
};
_CollectionCache.prototype.read = function (iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested) {
    var aElementsRange, oPromise = this.oPendingRequestsPromise || this.aElements.$tail, that = this;
    if (iIndex < 0) {
        throw new Error("Illegal index " + iIndex + ", must be >= 0");
    }
    if (iLength < 0) {
        throw new Error("Illegal length " + iLength + ", must be >= 0");
    }
    if (oPromise) {
        return oPromise.then(function () {
            return that.read(iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested);
        });
    }
    ODataUtils._getReadIntervals(this.aElements, iIndex, iLength, this.bServerDrivenPaging ? 0 : iPrefetchLength, this.aElements.$created + this.iLimit).forEach(function (oInterval) {
        that.requestElements(oInterval.start, oInterval.end, oGroupLock.getUnlockedCopy(), fnDataRequested);
        fnDataRequested = undefined;
    });
    oGroupLock.unlock();
    aElementsRange = this.aElements.slice(iIndex, iIndex + iLength + iPrefetchLength);
    if (this.aElements.$tail && iIndex + iLength > this.aElements.length) {
        aElementsRange.push(this.aElements.$tail);
    }
    return SyncPromise.all(aElementsRange).then(function () {
        var aElements = that.aElements.slice(iIndex, iIndex + iLength);
        aElements.$count = that.aElements.$count;
        return {
            "@odata.context": that.sContext,
            value: aElements
        };
    });
};
_CollectionCache.prototype.refreshKeptElements = function (oGroupLock, fnOnRemove) {
    var aPredicates = Object.keys(this.aElements.$byPredicate).sort(), mTypes, that = this;
    function calculateKeptElementsQuery() {
        var aKeyFilters, mQueryOptions = _Helper.merge({}, that.mQueryOptions);
        _Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
        delete mQueryOptions.$count;
        delete mQueryOptions.$orderby;
        delete mQueryOptions.$search;
        aKeyFilters = aPredicates.map(function (sPredicate) {
            return _Helper.getKeyFilter(that.aElements.$byPredicate[sPredicate], that.sMetaPath, mTypes);
        });
        mQueryOptions.$filter = aKeyFilters.join(" or ");
        if (aKeyFilters.length > 1) {
            mQueryOptions.$top = aKeyFilters.length;
        }
        return that.sResourcePath + that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false, true);
    }
    if (aPredicates.length === 0) {
        return undefined;
    }
    mTypes = this.fetchTypes().getResult();
    return this.oRequestor.request("GET", calculateKeptElementsQuery(), oGroupLock).then(function (oResponse) {
        var mStillAliveElements;
        that.visitResponse(oResponse, mTypes, undefined, undefined, undefined, 0);
        mStillAliveElements = oResponse.value.$byPredicate || {};
        aPredicates.forEach(function (sPredicate) {
            if (sPredicate in mStillAliveElements) {
                _Helper.updateAll(that.mChangeListeners, sPredicate, that.aElements.$byPredicate[sPredicate], mStillAliveElements[sPredicate]);
            }
            else {
                delete that.aElements.$byPredicate[sPredicate];
                fnOnRemove(sPredicate);
            }
        });
    });
};
_CollectionCache.prototype.requestElements = function (iStart, iEnd, oGroupLock, fnDataRequested) {
    var oPromise, oReadRequest = {
        iEnd: iEnd,
        iStart: iStart
    }, that = this;
    this.aReadRequests.push(oReadRequest);
    this.bSentRequest = true;
    oPromise = SyncPromise.all([
        this.oRequestor.request("GET", this.getResourcePathWithQuery(iStart, iEnd), oGroupLock, undefined, undefined, fnDataRequested),
        this.fetchTypes()
    ]).then(function (aResult) {
        if (that.aElements.$tail === oPromise) {
            that.aElements.$tail = undefined;
        }
        that.handleResponse(oReadRequest.iStart, oReadRequest.iEnd, aResult[0], aResult[1]);
    }).catch(function (oError) {
        that.fill(undefined, oReadRequest.iStart, oReadRequest.iEnd);
        throw oError;
    }).finally(function () {
        that.aReadRequests.splice(that.aReadRequests.indexOf(oReadRequest), 1);
    });
    this.fill(oPromise, iStart, iEnd);
};
_CollectionCache.prototype.requestSideEffects = function (oGroupLock, aPaths, mNavigationPropertyPaths, aPredicates, bSingle) {
    var aElements, iMaxIndex = -1, mMergeableQueryOptions, mQueryOptions, mPredicates = {}, sResourcePath, mTypeForMetaPath = this.fetchTypes().getResult(), that = this;
    this.checkSharedRequest();
    if (this.oPendingRequestsPromise) {
        return this.oPendingRequestsPromise.then(function () {
            return that.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths, aPredicates, bSingle);
        });
    }
    mQueryOptions = _Helper.intersectQueryOptions(Object.assign({}, this.mQueryOptions, this.mLateQueryOptions), aPaths, this.oRequestor.getModelInterface().fetchMetadata, this.sMetaPath, mNavigationPropertyPaths, "", true);
    if (!mQueryOptions) {
        return SyncPromise.resolve();
    }
    if (bSingle) {
        aElements = [this.aElements.$byPredicate[aPredicates[0]]];
    }
    else {
        aPredicates.forEach(function (sPredicate) {
            mPredicates[sPredicate] = true;
        });
        aElements = this.aElements.filter(function (oElement, i) {
            var sPredicate;
            if (!oElement) {
                return false;
            }
            if (_Helper.hasPrivateAnnotation(oElement, "transient")) {
                iMaxIndex = i;
                return false;
            }
            sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
            if (mPredicates[sPredicate] || _Helper.hasPrivateAnnotation(oElement, "transientPredicate")) {
                iMaxIndex = i;
                delete mPredicates[sPredicate];
                return true;
            }
            delete that.aElements[i];
            delete that.aElements.$byPredicate[sPredicate];
            return false;
        });
        this.aElements.length = iMaxIndex + 1;
        if (!aElements.length) {
            return SyncPromise.resolve();
        }
        Object.keys(mPredicates).forEach(function (sPredicate) {
            aElements.push(that.aElements.$byPredicate[sPredicate]);
        });
    }
    mQueryOptions.$filter = aElements.map(function (oElement) {
        return _Helper.getKeyFilter(oElement, that.sMetaPath, mTypeForMetaPath);
    }).join(" or ");
    if (aElements.length > 1) {
        mQueryOptions.$top = aElements.length;
    }
    _Helper.selectKeyProperties(mQueryOptions, mTypeForMetaPath[this.sMetaPath]);
    delete mQueryOptions.$count;
    delete mQueryOptions.$orderby;
    delete mQueryOptions.$search;
    mMergeableQueryOptions = _Helper.extractMergeableQueryOptions(mQueryOptions);
    sResourcePath = this.sResourcePath + this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
    return this.oRequestor.request("GET", sResourcePath, oGroupLock, undefined, undefined, undefined, undefined, this.sMetaPath, undefined, false, mMergeableQueryOptions).then(function (oResult) {
        var oElement, sPredicate, i, n;
        function preventKeyPredicateChange(sPath) {
            sPath = sPath.slice(sPredicate.length + 1);
            return !aPaths.some(function (sSideEffectPath) {
                return _Helper.getRelativePath(sPath, sSideEffectPath) !== undefined;
            });
        }
        if (oResult.value.length !== aElements.length) {
            throw new Error("Expected " + aElements.length + " row(s), but instead saw " + oResult.value.length);
        }
        that.visitResponse(oResult, mTypeForMetaPath, undefined, "", false, NaN);
        for (i = 0, n = oResult.value.length; i < n; i += 1) {
            oElement = oResult.value[i];
            sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
            _Helper.updateAll(that.mChangeListeners, sPredicate, that.aElements.$byPredicate[sPredicate], oElement, preventKeyPredicateChange);
        }
    });
};
function _PropertyCache(oRequestor, sResourcePath, mQueryOptions) {
    _Cache.call(this, oRequestor, sResourcePath, mQueryOptions);
    this.oPromise = null;
}
_PropertyCache.prototype = Object.create(_Cache.prototype);
_PropertyCache.prototype._delete = function () {
    throw new Error("Unsupported");
};
_PropertyCache.prototype.create = function () {
    throw new Error("Unsupported");
};
_PropertyCache.prototype.fetchValue = function (oGroupLock, _sPath, fnDataRequested, oListener, bCreateOnDemand) {
    var that = this;
    if (bCreateOnDemand) {
        throw new Error("Unsupported argument: bCreateOnDemand");
    }
    if (this.oPromise) {
        oGroupLock.unlock();
    }
    else {
        this.bSentRequest = true;
        this.oPromise = SyncPromise.resolve(this.oRequestor.request("GET", this.sResourcePath + this.sQueryString, oGroupLock, undefined, undefined, fnDataRequested, undefined, this.sMetaPath));
    }
    return this.oPromise.then(function (oResult) {
        that.registerChange("", oListener);
        return oResult && typeof oResult === "object" ? oResult.value : oResult;
    });
};
_PropertyCache.prototype.update = function () {
    throw new Error("Unsupported");
};
function _SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, bSharedRequest, fnGetOriginalResourcePath, bPost, sMetaPath) {
    _Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, fnGetOriginalResourcePath, bSharedRequest);
    this.sMetaPath = sMetaPath || this.sMetaPath;
    this.bPost = bPost;
    this.bPosting = false;
    this.oPromise = null;
}
_SingleCache.prototype = Object.create(_Cache.prototype);
_SingleCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener, bCreateOnDemand) {
    var sResourcePath = this.sResourcePath + this.sQueryString, that = this;
    if (this.oPromise) {
        oGroupLock.unlock();
    }
    else {
        if (this.bPost) {
            throw new Error("Cannot fetch a value before the POST request");
        }
        this.oPromise = SyncPromise.all([
            this.oRequestor.request("GET", sResourcePath, oGroupLock, undefined, undefined, fnDataRequested, undefined, this.sMetaPath),
            this.fetchTypes()
        ]).then(function (aResult) {
            that.visitResponse(aResult[0], aResult[1]);
            return aResult[0];
        });
        this.bSentRequest = true;
    }
    return this.oPromise.then(function (oResult) {
        if (oResult && oResult["$ui5.deleted"]) {
            throw new Error("Cannot read a deleted entity");
        }
        that.registerChange(sPath, oListener);
        return that.drillDown(oResult, sPath, oGroupLock, bCreateOnDemand);
    });
};
_SingleCache.prototype.getValue = function (sPath) {
    var oSyncPromise;
    if (this.oPromise && this.oPromise.isFulfilled()) {
        oSyncPromise = this.drillDown(this.oPromise.getResult(), sPath, _GroupLock.$cached);
        if (oSyncPromise.isFulfilled()) {
            return oSyncPromise.getResult();
        }
    }
};
_SingleCache.prototype.post = function (oGroupLock, oData, oEntity, bIgnoreETag, fnOnStrictHandlingFailed) {
    var sGroupId, mHeaders = oEntity ? { "If-Match": bIgnoreETag && "@odata.etag" in oEntity ? "*" : oEntity } : {}, sHttpMethod = "POST", that = this;
    function post(oGroupLock0) {
        that.bPosting = true;
        return SyncPromise.all([
            that.oRequestor.request(sHttpMethod, that.sResourcePath + that.sQueryString, oGroupLock0, mHeaders, oData),
            that.fetchTypes()
        ]).then(function (aResult) {
            that.visitResponse(aResult[0], aResult[1]);
            that.bPosting = false;
            return aResult[0];
        }, function (oError) {
            that.bPosting = false;
            if (fnOnStrictHandlingFailed && oError.strictHandlingFailed) {
                return fnOnStrictHandlingFailed(oError).then(function (bConfirm) {
                    var oCanceledError;
                    if (bConfirm) {
                        delete mHeaders["Prefer"];
                        return post(oGroupLock0.getUnlockedCopy());
                    }
                    oCanceledError = Error("Action canceled due to strict handling");
                    oCanceledError.canceled = true;
                    throw oCanceledError;
                });
            }
            throw oError;
        });
    }
    this.checkSharedRequest();
    if (!this.bPost) {
        throw new Error("POST request not allowed");
    }
    if (this.bPosting) {
        throw new Error("Parallel POST requests not allowed");
    }
    if (oEntity) {
        sGroupId = oGroupLock.getGroupId();
        this.oRequestor.relocateAll("$parked." + sGroupId, sGroupId, oEntity);
    }
    if (oData) {
        sHttpMethod = oData["X-HTTP-Method"] || sHttpMethod;
        delete oData["X-HTTP-Method"];
        if (this.oRequestor.isActionBodyOptional() && !Object.keys(oData).length) {
            oData = undefined;
        }
    }
    this.bSentRequest = true;
    if (fnOnStrictHandlingFailed) {
        mHeaders["Prefer"] = "handling=strict";
    }
    this.oPromise = post(oGroupLock);
    return this.oPromise;
};
_SingleCache.prototype.requestSideEffects = function (oGroupLock, aPaths, mNavigationPropertyPaths, sResourcePath) {
    var mMergeableQueryOptions, oOldValuePromise = this.oPromise, mQueryOptions, oResult, that = this;
    this.checkSharedRequest();
    mQueryOptions = oOldValuePromise && _Helper.intersectQueryOptions(Object.assign({}, this.mQueryOptions, this.mLateQueryOptions), aPaths, this.oRequestor.getModelInterface().fetchMetadata, this.sMetaPath, mNavigationPropertyPaths);
    if (!mQueryOptions) {
        return SyncPromise.resolve();
    }
    mMergeableQueryOptions = _Helper.extractMergeableQueryOptions(mQueryOptions);
    sResourcePath = (sResourcePath || this.sResourcePath) + this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
    oResult = SyncPromise.all([
        this.oRequestor.request("GET", sResourcePath, oGroupLock, undefined, undefined, undefined, undefined, this.sMetaPath, undefined, false, mMergeableQueryOptions),
        this.fetchTypes(),
        this.fetchValue(_GroupLock.$cached, "")
    ]).then(function (aResult) {
        return aResult;
    }).then(function (aResult) {
        var oNewValue = aResult[0], oOldValue = aResult[2];
        _Helper.setPrivateAnnotation(oNewValue, "predicate", _Helper.getPrivateAnnotation(oOldValue, "predicate"));
        that.visitResponse(oNewValue, aResult[1]);
        _Helper.updateAll(that.mChangeListeners, "", oOldValue, oNewValue, function (sPath) {
            return !aPaths.some(function (sSideEffectPath) {
                return _Helper.getRelativePath(sPath, sSideEffectPath) !== undefined;
            });
        });
    });
    return oResult;
};
_Cache.create = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, sDeepResourcePath, bSharedRequest) {
    var iCount, aKeys, sPath, oSharedCollectionCache, mSharedCollectionCacheByPath;
    if (bSharedRequest) {
        sPath = sResourcePath + oRequestor.buildQueryString(_Helper.getMetaPath("/" + sResourcePath), mQueryOptions, false, bSortExpandSelect);
        mSharedCollectionCacheByPath = oRequestor.$mSharedCollectionCacheByPath;
        if (!mSharedCollectionCacheByPath) {
            mSharedCollectionCacheByPath = oRequestor.$mSharedCollectionCacheByPath = {};
        }
        oSharedCollectionCache = mSharedCollectionCacheByPath[sPath];
        if (oSharedCollectionCache) {
            oSharedCollectionCache.setActive(true);
        }
        else {
            aKeys = Object.keys(mSharedCollectionCacheByPath);
            iCount = aKeys.length;
            if (iCount > 100) {
                aKeys.filter(function (sKey) {
                    return !mSharedCollectionCacheByPath[sKey].iActiveUsages;
                }).sort(function (sKey1, sKey2) {
                    return mSharedCollectionCacheByPath[sKey1].iInactiveSince - mSharedCollectionCacheByPath[sKey2].iInactiveSince;
                }).every(function (sKey) {
                    delete mSharedCollectionCacheByPath[sKey];
                    iCount -= 1;
                    return iCount > 100;
                });
            }
            oSharedCollectionCache = mSharedCollectionCacheByPath[sPath] = new _CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, sDeepResourcePath, bSharedRequest);
        }
        return oSharedCollectionCache;
    }
    return new _CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, sDeepResourcePath);
};
_Cache.createProperty = function (oRequestor, sResourcePath, mQueryOptions) {
    return new _PropertyCache(oRequestor, sResourcePath, mQueryOptions);
};
_Cache.createSingle = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, bSharedRequest, fnGetOriginalResourcePath, bPost, sMetaPath) {
    return new _SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, bSharedRequest, fnGetOriginalResourcePath, bPost, sMetaPath);
};
_Cache.from$skip = function (sSegment, aCollection) {
    return rNumber.test(sSegment) ? (aCollection.$created || 0) + Number(sSegment) : sSegment;
};
_Cache.getElementIndex = function (aElements, sKeyPredicate, iIndex) {
    var oElement = aElements[iIndex];
    if (!oElement || _Helper.getPrivateAnnotation(oElement, "predicate") !== sKeyPredicate) {
        iIndex = aElements.indexOf(aElements.$byPredicate[sKeyPredicate]);
    }
    return iIndex;
};
_Cache.makeUpdateData = function (aPropertyPath, vValue) {
    return aPropertyPath.reduceRight(function (vValue0, sSegment) {
        var oResult = {};
        oResult[sSegment] = vValue0;
        return oResult;
    }, vValue);
};
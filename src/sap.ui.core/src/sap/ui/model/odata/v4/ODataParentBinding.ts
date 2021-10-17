import Context from "./Context";
import asODataBinding from "./ODataBinding";
import SubmitMode from "./SubmitMode";
import _Helper from "./lib/_Helper";
import Log from "sap/base/Log";
import SyncPromise from "sap/ui/base/SyncPromise";
import ChangeReason from "sap/ui/model/ChangeReason";
function ODataParentBinding() {
    asODataBinding.call(this);
    this.mAggregatedQueryOptions = {};
    this.bAggregatedQueryOptionsInitial = true;
    this.aChildCanUseCachePromises = [];
    this.bHasPathReductionToParent = false;
    this.iPatchCounter = 0;
    this.bPatchSuccess = true;
    this.oReadGroupLock = undefined;
    this.oRefreshPromise = null;
    this.oResumePromise = undefined;
}
asODataBinding(ODataParentBinding.prototype);
var sClassName = "sap.ui.model.odata.v4.ODataParentBinding";
ODataParentBinding.prototype.attachPatchCompleted = function (fnFunction, oListener) {
    this.attachEvent("patchCompleted", fnFunction, oListener);
};
ODataParentBinding.prototype.detachPatchCompleted = function (fnFunction, oListener) {
    this.detachEvent("patchCompleted", fnFunction, oListener);
};
ODataParentBinding.prototype.doSuspend = function () {
};
ODataParentBinding.prototype.firePatchCompleted = function (bSuccess) {
    if (this.iPatchCounter === 0) {
        throw new Error("Completed more PATCH requests than sent");
    }
    this.iPatchCounter -= 1;
    this.bPatchSuccess = this.bPatchSuccess && bSuccess;
    if (this.iPatchCounter === 0) {
        this.fireEvent("patchCompleted", { success: this.bPatchSuccess });
        this.bPatchSuccess = true;
    }
};
ODataParentBinding.prototype.attachPatchSent = function (fnFunction, oListener) {
    this.attachEvent("patchSent", fnFunction, oListener);
};
ODataParentBinding.prototype.detachPatchSent = function (fnFunction, oListener) {
    this.detachEvent("patchSent", fnFunction, oListener);
};
ODataParentBinding.prototype.firePatchSent = function () {
    this.iPatchCounter += 1;
    if (this.iPatchCounter === 1) {
        this.fireEvent("patchSent");
    }
};
ODataParentBinding.prototype._findEmptyPathParentContext = function (oContext) {
    if (this.sPath === "" && this.oContext.getBinding) {
        return this.oContext.getBinding()._findEmptyPathParentContext(this.oContext);
    }
    return oContext;
};
ODataParentBinding.prototype.aggregateQueryOptions = function (mQueryOptions, sBaseMetaPath, bCacheImmutable) {
    var mAggregatedQueryOptionsClone = _Helper.merge({}, bCacheImmutable && this.mLateQueryOptions || this.mAggregatedQueryOptions), bChanged = false, that = this;
    function merge(mAggregatedQueryOptions, mQueryOptions0, sMetaPath, bInsideExpand, bAdd) {
        function mergeExpandPath(sExpandPath) {
            var bAddExpand = !mAggregatedQueryOptions.$expand[sExpandPath], sExpandMetaPath = sMetaPath + "/" + sExpandPath;
            if (bAddExpand) {
                mAggregatedQueryOptions.$expand[sExpandPath] = {};
                if (bCacheImmutable && that.oModel.getMetaModel().fetchObject(sExpandMetaPath).getResult().$isCollection) {
                    return false;
                }
                bChanged = true;
            }
            return merge(mAggregatedQueryOptions.$expand[sExpandPath], mQueryOptions0.$expand[sExpandPath], sExpandMetaPath, true, bAddExpand);
        }
        function mergeSelectPath(sSelectPath) {
            if (mAggregatedQueryOptions.$select.indexOf(sSelectPath) < 0) {
                bChanged = true;
                mAggregatedQueryOptions.$select.push(sSelectPath);
            }
            return true;
        }
        return (!bInsideExpand || Object.keys(mAggregatedQueryOptions).every(function (sName) {
            return sName in mQueryOptions0 || sName === "$count" || sName === "$expand" || sName === "$select";
        })) && Object.keys(mQueryOptions0).every(function (sName) {
            switch (sName) {
                case "$count":
                    if (mQueryOptions0.$count) {
                        mAggregatedQueryOptions.$count = true;
                    }
                    return true;
                case "$expand":
                    mAggregatedQueryOptions.$expand = mAggregatedQueryOptions.$expand || {};
                    return Object.keys(mQueryOptions0.$expand).every(mergeExpandPath);
                case "$select":
                    mAggregatedQueryOptions.$select = mAggregatedQueryOptions.$select || [];
                    return mQueryOptions0.$select.every(mergeSelectPath);
                default:
                    if (bAdd) {
                        mAggregatedQueryOptions[sName] = mQueryOptions0[sName];
                        return true;
                    }
                    return mQueryOptions0[sName] === mAggregatedQueryOptions[sName];
            }
        });
    }
    if (merge(mAggregatedQueryOptionsClone, mQueryOptions, sBaseMetaPath)) {
        if (!bCacheImmutable) {
            this.mAggregatedQueryOptions = mAggregatedQueryOptionsClone;
        }
        else if (bChanged) {
            this.mLateQueryOptions = mAggregatedQueryOptionsClone;
        }
        return true;
    }
    return false;
};
ODataParentBinding.prototype.changeParameters = function (mParameters) {
    var mBindingParameters = Object.assign({}, this.mParameters), sChangeReason, sKey, that = this;
    function updateChangeReason(sName) {
        if (that.oModel.bAutoExpandSelect && (sName === "$expand" || sName === "$select")) {
            throw new Error("Cannot change " + sName + " parameter in auto-$expand/$select mode: " + JSON.stringify(mParameters[sName]) + " !== " + JSON.stringify(mBindingParameters[sName]));
        }
        if (sName === "$filter" || sName === "$search") {
            sChangeReason = ChangeReason.Filter;
        }
        else if (sName === "$orderby" && sChangeReason !== ChangeReason.Filter) {
            sChangeReason = ChangeReason.Sort;
        }
        else if (!sChangeReason) {
            sChangeReason = ChangeReason.Change;
        }
    }
    if (!mParameters) {
        throw new Error("Missing map of binding parameters");
    }
    for (sKey in mParameters) {
        if (sKey.startsWith("$$")) {
            if (mParameters[sKey] === mBindingParameters[sKey]) {
                continue;
            }
            throw new Error("Unsupported parameter: " + sKey);
        }
        if (mParameters[sKey] === undefined && mBindingParameters[sKey] !== undefined) {
            updateChangeReason(sKey);
            delete mBindingParameters[sKey];
        }
        else if (mBindingParameters[sKey] !== mParameters[sKey]) {
            updateChangeReason(sKey);
            if (typeof mParameters[sKey] === "object") {
                mBindingParameters[sKey] = _Helper.clone(mParameters[sKey]);
            }
            else {
                mBindingParameters[sKey] = mParameters[sKey];
            }
        }
    }
    if (sChangeReason) {
        if (this.hasPendingChanges()) {
            throw new Error("Cannot change parameters due to pending changes");
        }
        this.applyParameters(mBindingParameters, sChangeReason);
    }
};
ODataParentBinding.prototype.checkUpdateInternal = function (bForceUpdate) {
    var that = this;
    function updateDependents() {
        return SyncPromise.all(that.getDependentBindings().map(function (oDependentBinding) {
            return oDependentBinding.checkUpdateInternal();
        }));
    }
    if (bForceUpdate !== undefined) {
        throw new Error("Unsupported operation: " + sClassName + "#checkUpdateInternal must not" + " be called with parameters");
    }
    return this.oCachePromise.then(function (oCache) {
        if (oCache && that.bRelative) {
            return that.fetchResourcePath(that.oContext).then(function (sResourcePath) {
                if (oCache.getResourcePath() === sResourcePath) {
                    return updateDependents();
                }
                return that.refreshInternal("");
            });
        }
        return updateDependents();
    });
};
ODataParentBinding.prototype.createInCache = function (oUpdateGroupLock, vCreatePath, sCollectionPath, sTransientPredicate, oInitialData, fnErrorCallback, fnSubmitCallback) {
    var that = this;
    return this.oCachePromise.then(function (oCache) {
        var sPathInCache;
        if (oCache) {
            sPathInCache = _Helper.getRelativePath(sCollectionPath, that.getResolvedPath());
            return oCache.create(oUpdateGroupLock, vCreatePath, sPathInCache, sTransientPredicate, oInitialData, fnErrorCallback, fnSubmitCallback).then(function (oCreatedEntity) {
                if (that.mCacheByResourcePath) {
                    delete that.mCacheByResourcePath[oCache.getResourcePath()];
                }
                return oCreatedEntity;
            });
        }
        return that.oContext.getBinding().createInCache(oUpdateGroupLock, vCreatePath, sCollectionPath, sTransientPredicate, oInitialData, fnErrorCallback, fnSubmitCallback);
    });
};
ODataParentBinding.prototype.createReadGroupLock = function (sGroupId, bLocked, iCount) {
    var oGroupLock, that = this;
    function addUnlockTask() {
        that.oModel.addPrerenderingTask(function () {
            iCount -= 1;
            if (iCount > 0) {
                Promise.resolve().then(addUnlockTask);
            }
            else if (that.oReadGroupLock === oGroupLock) {
                Log.debug("Timeout: unlocked " + oGroupLock, null, sClassName);
                that.removeReadGroupLock();
            }
        });
    }
    this.removeReadGroupLock();
    this.oReadGroupLock = oGroupLock = this.lockGroup(sGroupId, bLocked);
    if (bLocked) {
        iCount = 2 + (iCount || 0);
        addUnlockTask();
    }
};
ODataParentBinding.prototype.createRefreshPromise = function () {
    var oPromise, fnResolve;
    oPromise = new Promise(function (resolve) {
        fnResolve = resolve;
    });
    oPromise.$resolve = fnResolve;
    this.oRefreshPromise = oPromise;
    return oPromise;
};
ODataParentBinding.prototype.deleteFromCache = function (oGroupLock, sEditUrl, sPath, oETagEntity, fnCallback) {
    var sGroupId;
    if (this.oCache === undefined) {
        throw new Error("DELETE request not allowed");
    }
    if (this.oCache) {
        sGroupId = oGroupLock.getGroupId();
        if (!this.oModel.isAutoGroup(sGroupId) && !this.oModel.isDirectGroup(sGroupId)) {
            throw new Error("Illegal update group ID: " + sGroupId);
        }
        return this.oCache._delete(oGroupLock, sEditUrl, sPath, oETagEntity, fnCallback);
    }
    return this.oContext.getBinding().deleteFromCache(oGroupLock, sEditUrl, _Helper.buildPath(this.oContext.iIndex, this.sPath, sPath), oETagEntity, fnCallback);
};
ODataParentBinding.prototype.destroy = function () {
    this.aChildCanUseCachePromises = [];
    this.removeReadGroupLock();
    this.oResumePromise = undefined;
    asODataBinding.prototype.destroy.call(this);
};
ODataParentBinding.prototype.fetchIfChildCanUseCache = function (oContext, sChildPath, vChildQueryOptions) {
    var sBaseForPathReduction = this.getBaseForPathReduction(), sBaseMetaPath = _Helper.getMetaPath(oContext.getPath()), bCacheImmutable, oCanUseCachePromise, bDependsOnOperation = oContext.getPath().includes("(...)"), iIndex = oContext.getIndex(), bIsAdvertisement = sChildPath[0] === "#", oMetaModel = this.oModel.getMetaModel(), aPromises, sResolvedChildPath = this.oModel.resolve(sChildPath, oContext), that = this;
    function fetchPropertyAndType() {
        if (bIsAdvertisement) {
            return oMetaModel.fetchObject(sBaseMetaPath + "/");
        }
        return _Helper.fetchPropertyAndType(that.oModel.oInterface.fetchMetadata, getStrippedMetaPath(sResolvedChildPath));
    }
    function getStrippedMetaPath(sPath) {
        var iIndex;
        sPath = _Helper.getMetaPath(sPath);
        iIndex = sPath.indexOf("@");
        return iIndex > 0 ? sPath.slice(0, iIndex) : sPath;
    }
    if (bDependsOnOperation && !sResolvedChildPath.includes("/$Parameter/") || this.getRootBinding().isSuspended() || this.mParameters && this.mParameters.$$aggregation) {
        return SyncPromise.resolve(sResolvedChildPath);
    }
    bCacheImmutable = this.oCachePromise.isRejected() || iIndex !== undefined && iIndex !== Context.VIRTUAL || oContext.isKeepAlive() || this.oCache === null || this.oCache && this.oCache.hasSentRequest();
    aPromises = [
        this.doFetchQueryOptions(this.oContext),
        fetchPropertyAndType(),
        vChildQueryOptions
    ];
    oCanUseCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
        var mChildQueryOptions = aResult[2], mWrappedChildQueryOptions, mLocalQueryOptions = aResult[0], oProperty = aResult[1], sReducedChildMetaPath, sReducedPath;
        if (Array.isArray(oProperty)) {
            return undefined;
        }
        sReducedPath = oMetaModel.getReducedPath(sResolvedChildPath, sBaseForPathReduction);
        sReducedChildMetaPath = _Helper.getRelativePath(getStrippedMetaPath(sReducedPath), sBaseMetaPath);
        if (sReducedChildMetaPath === undefined) {
            that.bHasPathReductionToParent = true;
            return that.oContext.getBinding().fetchIfChildCanUseCache(that.oContext, _Helper.getRelativePath(sResolvedChildPath, that.oContext.getPath()), vChildQueryOptions);
        }
        if (bDependsOnOperation || sReducedChildMetaPath === "$count" || sReducedChildMetaPath.endsWith("/$count")) {
            return sReducedPath;
        }
        if (that.bAggregatedQueryOptionsInitial) {
            that.selectKeyProperties(mLocalQueryOptions, sBaseMetaPath);
            that.mAggregatedQueryOptions = _Helper.clone(mLocalQueryOptions);
            that.bAggregatedQueryOptionsInitial = false;
        }
        if (bIsAdvertisement) {
            mWrappedChildQueryOptions = { "$select": [sReducedChildMetaPath.slice(1)] };
            return that.aggregateQueryOptions(mWrappedChildQueryOptions, sBaseMetaPath, bCacheImmutable) ? sReducedPath : undefined;
        }
        if (sReducedChildMetaPath === "" || oProperty && (oProperty.$kind === "Property" || oProperty.$kind === "NavigationProperty")) {
            mWrappedChildQueryOptions = _Helper.wrapChildQueryOptions(sBaseMetaPath, sReducedChildMetaPath, mChildQueryOptions, that.oModel.oInterface.fetchMetadata);
            if (mWrappedChildQueryOptions) {
                return that.aggregateQueryOptions(mWrappedChildQueryOptions, sBaseMetaPath, bCacheImmutable) ? sReducedPath : undefined;
            }
            return undefined;
        }
        if (sReducedChildMetaPath === "value") {
            return that.aggregateQueryOptions(mChildQueryOptions, sBaseMetaPath, bCacheImmutable) ? sReducedPath : undefined;
        }
        Log.error("Failed to enhance query options for auto-$expand/$select as the path '" + sResolvedChildPath + "' does not point to a property", JSON.stringify(oProperty), sClassName);
        return undefined;
    }).then(function (sReducedPath) {
        if (that.mLateQueryOptions) {
            if (that.oCache) {
                that.oCache.setLateQueryOptions(that.mLateQueryOptions);
            }
            else if (that.oCache === null) {
                return that.oContext.getBinding().fetchIfChildCanUseCache(that.oContext, that.sPath, SyncPromise.resolve(that.mLateQueryOptions)).then(function (sPath) {
                    return sPath && sReducedPath;
                });
            }
        }
        return sReducedPath;
    });
    this.aChildCanUseCachePromises.push(oCanUseCachePromise);
    this.oCachePromise = SyncPromise.all([this.oCachePromise, oCanUseCachePromise]).then(function (aResult) {
        var oCache = aResult[0];
        if (oCache && !oCache.hasSentRequest() && !that.oOperation) {
            if (that.bSharedRequest) {
                oCache.setActive(false);
                oCache = that.createAndSetCache(that.mAggregatedQueryOptions, oCache.getResourcePath(), oContext);
            }
            else {
                oCache.setQueryOptions(_Helper.merge({}, that.oModel.mUriParameters, that.mAggregatedQueryOptions));
            }
        }
        return oCache;
    });
    this.oCachePromise.catch(function (oError) {
        that.oModel.reportError(that + ": Failed to enhance query options for " + "auto-$expand/$select for child " + sChildPath, sClassName, oError);
    });
    return oCanUseCachePromise;
};
ODataParentBinding.prototype.fetchResolvedQueryOptions = function (oContext) {
    var fnFetchMetadata, mConvertedQueryOptions, sMetaPath, oModel = this.oModel, mQueryOptions = this.getQueryOptionsFromParameters();
    if (!(oModel.bAutoExpandSelect && mQueryOptions.$select)) {
        return SyncPromise.resolve(mQueryOptions);
    }
    fnFetchMetadata = oModel.oInterface.fetchMetadata;
    sMetaPath = _Helper.getMetaPath(oModel.resolve(this.sPath, oContext));
    mConvertedQueryOptions = Object.assign({}, mQueryOptions, { $select: [] });
    return SyncPromise.all(mQueryOptions.$select.map(function (sSelectPath) {
        return _Helper.fetchPropertyAndType(fnFetchMetadata, sMetaPath + "/" + sSelectPath).then(function () {
            var mWrappedQueryOptions = _Helper.wrapChildQueryOptions(sMetaPath, sSelectPath, {}, fnFetchMetadata);
            if (mWrappedQueryOptions) {
                _Helper.aggregateExpandSelect(mConvertedQueryOptions, mWrappedQueryOptions);
            }
            else {
                _Helper.addToSelect(mConvertedQueryOptions, [sSelectPath]);
            }
        });
    })).then(function () {
        return mConvertedQueryOptions;
    });
};
ODataParentBinding.prototype.getBaseForPathReduction = function () {
    var oParentBinding, sParentUpdateGroupId;
    if (!this.isRoot()) {
        oParentBinding = this.oContext.getBinding();
        sParentUpdateGroupId = oParentBinding.getUpdateGroupId();
        if (sParentUpdateGroupId === this.getUpdateGroupId() || this.oModel.getGroupProperty(sParentUpdateGroupId, "submit") !== SubmitMode.API) {
            return oParentBinding.getBaseForPathReduction();
        }
    }
    return this.getResolvedPath();
};
ODataParentBinding.prototype.getInheritableQueryOptions = function () {
    if (this.mLateQueryOptions) {
        return _Helper.merge({}, this.mCacheQueryOptions, this.mLateQueryOptions);
    }
    return this.mCacheQueryOptions || _Helper.getQueryOptionsForPath(this.oContext.getBinding().getInheritableQueryOptions(), this.sPath);
};
ODataParentBinding.prototype.getGeneration = function () {
    return this.bRelative && this.oContext.getGeneration && this.oContext.getGeneration() || 0;
};
ODataParentBinding.prototype.getQueryOptionsForPath = function (sPath, oContext) {
    if (Object.keys(this.mParameters).length) {
        return _Helper.getQueryOptionsForPath(this.getQueryOptionsFromParameters(), sPath);
    }
    oContext = oContext || this.oContext;
    if (!this.bRelative || !oContext.getQueryOptionsForPath) {
        return {};
    }
    return oContext.getQueryOptionsForPath(_Helper.buildPath(this.sPath, sPath));
};
ODataParentBinding.prototype.getResumePromise = function () {
    return this.oResumePromise;
};
ODataParentBinding.prototype.hasPendingChangesInDependents = function () {
    var aDependents = this.getDependentBindings();
    return aDependents.some(function (oDependent) {
        var oCache = oDependent.oCache, bHasPendingChanges;
        if (oCache !== undefined) {
            if (oCache && oCache.hasPendingChangesForPath("")) {
                return true;
            }
        }
        else if (oDependent.hasPendingChangesForPath("")) {
            return true;
        }
        if (oDependent.mCacheByResourcePath) {
            bHasPendingChanges = Object.keys(oDependent.mCacheByResourcePath).some(function (sPath) {
                return oDependent.mCacheByResourcePath[sPath].hasPendingChangesForPath("");
            });
            if (bHasPendingChanges) {
                return true;
            }
        }
        return oDependent.hasPendingChangesInDependents();
    }) || this.oModel.withUnresolvedBindings("hasPendingChangesInCaches", this.getResolvedPath().slice(1));
};
ODataParentBinding.prototype.isPatchWithoutSideEffects = function () {
    return this.mParameters.$$patchWithoutSideEffects || !this.isRoot() && this.oContext && this.oContext.getBinding().isPatchWithoutSideEffects();
};
ODataParentBinding.prototype.isMeta = function () {
    return false;
};
ODataParentBinding.prototype.refreshDependentBindings = function (sResourcePathPrefix, sGroupId, bCheckUpdate, bKeepCacheOnError) {
    return SyncPromise.all(this.getDependentBindings().map(function (oDependentBinding) {
        return oDependentBinding.refreshInternal(sResourcePathPrefix, sGroupId, bCheckUpdate, bKeepCacheOnError);
    }));
};
ODataParentBinding.prototype.refreshDependentListBindingsWithoutCache = function () {
    return SyncPromise.all(this.getDependentBindings().map(function (oDependentBinding) {
        if (oDependentBinding.filter && oDependentBinding.oCache === null) {
            return oDependentBinding.refreshInternal("");
        }
        if (oDependentBinding.refreshDependentListBindingsWithoutCache) {
            return oDependentBinding.refreshDependentListBindingsWithoutCache();
        }
    }));
};
ODataParentBinding.prototype.removeReadGroupLock = function () {
    if (this.oReadGroupLock) {
        this.oReadGroupLock.unlock(true);
        this.oReadGroupLock = undefined;
    }
};
ODataParentBinding.prototype.refreshSuspended = function (sGroupId) {
    if (sGroupId && sGroupId !== this.getGroupId()) {
        throw new Error(this + ": Cannot refresh a suspended binding with group ID '" + sGroupId + "' (own group ID is '" + this.getGroupId() + "')");
    }
    this.setResumeChangeReason(ChangeReason.Refresh);
};
ODataParentBinding.prototype.resetChangesInDependents = function (aPromises) {
    this.getDependentBindings().forEach(function (oDependent) {
        aPromises.push(oDependent.oCachePromise.then(function (oCache) {
            if (oCache) {
                oCache.resetChangesForPath("");
            }
            oDependent.resetInvalidDataState();
        }).unwrap());
        if (oDependent.mCacheByResourcePath) {
            Object.keys(oDependent.mCacheByResourcePath).forEach(function (sPath) {
                oDependent.mCacheByResourcePath[sPath].resetChangesForPath("");
            });
        }
        oDependent.resetChangesInDependents(aPromises);
    });
};
ODataParentBinding.prototype.resolveRefreshPromise = function (oPromise) {
    if (this.oRefreshPromise) {
        this.oRefreshPromise.$resolve(oPromise.catch(function (oError) {
            if (!oError.canceled) {
                throw oError;
            }
        }));
        this.oRefreshPromise = null;
    }
    return oPromise;
};
ODataParentBinding.prototype._resume = function (bAsPrerenderingTask) {
    var that = this;
    function doResume() {
        that.bSuspended = false;
        if (that.oResumePromise) {
            that.resumeInternal(true);
            that.oResumePromise.$resolve();
            that.oResumePromise = undefined;
        }
    }
    if (this.oOperation) {
        throw new Error("Cannot resume an operation binding: " + this);
    }
    if (!this.isRoot()) {
        throw new Error("Cannot resume a relative binding: " + this);
    }
    if (!this.bSuspended) {
        throw new Error("Cannot resume a not suspended binding: " + this);
    }
    if (bAsPrerenderingTask) {
        this.createReadGroupLock(this.getGroupId(), true, 1);
        this.oModel.addPrerenderingTask(doResume);
    }
    else {
        this.createReadGroupLock(this.getGroupId(), true);
        doResume();
    }
};
ODataParentBinding.prototype.resume = function () {
    this._resume(false);
};
ODataParentBinding.prototype.resumeAsync = function () {
    this._resume(true);
    return Promise.resolve(this.oResumePromise);
};
ODataParentBinding.prototype.selectKeyProperties = function (mQueryOptions, sMetaPath) {
    _Helper.selectKeyProperties(mQueryOptions, this.oModel.getMetaModel().getObject(sMetaPath + "/"));
};
ODataParentBinding.prototype.suspend = function () {
    var fnResolve;
    if (this.oOperation) {
        throw new Error("Cannot suspend an operation binding: " + this);
    }
    if (!this.isRoot()) {
        throw new Error("Cannot suspend a relative binding: " + this);
    }
    if (this.bSuspended) {
        throw new Error("Cannot suspend a suspended binding: " + this);
    }
    if (this.hasPendingChanges()) {
        throw new Error("Cannot suspend a binding with pending changes: " + this);
    }
    this.bSuspended = true;
    this.oResumePromise = new SyncPromise(function (resolve) {
        fnResolve = resolve;
    });
    this.oResumePromise.$resolve = fnResolve;
    this.removeReadGroupLock();
    this.doSuspend();
};
ODataParentBinding.prototype.updateAggregatedQueryOptions = function (mNewQueryOptions) {
    var aAllKeys = Object.keys(mNewQueryOptions), that = this;
    if (this.mAggregatedQueryOptions) {
        aAllKeys = aAllKeys.concat(Object.keys(this.mAggregatedQueryOptions));
        aAllKeys.forEach(function (sName) {
            if (that.bAggregatedQueryOptionsInitial || sName !== "$select" && sName !== "$expand") {
                if (mNewQueryOptions[sName] === undefined) {
                    delete that.mAggregatedQueryOptions[sName];
                }
                else {
                    that.mAggregatedQueryOptions[sName] = mNewQueryOptions[sName];
                }
            }
        });
    }
};
ODataParentBinding.prototype.visitSideEffects = function (sGroupId, aPaths, oContext, mNavigationPropertyPaths, aPromises, sPrefix) {
    var aDependentBindings = oContext ? this.oModel.getDependentBindings(oContext) : this.getDependentBindings();
    aDependentBindings.forEach(function (oDependentBinding) {
        var sPath = _Helper.buildPath(sPrefix, _Helper.getMetaPath(oDependentBinding.getPath())), aStrippedPaths;
        if (oDependentBinding.oCache) {
            aStrippedPaths = _Helper.stripPathPrefix(sPath, aPaths);
            if (aStrippedPaths.length) {
                aPromises.push(oDependentBinding.requestSideEffects(sGroupId, aStrippedPaths));
            }
        }
        else if (mNavigationPropertyPaths[sPath]) {
            aPromises.push(oDependentBinding.refreshInternal("", sGroupId));
        }
        else {
            oDependentBinding.visitSideEffects(sGroupId, aPaths, null, mNavigationPropertyPaths, aPromises, sPath);
        }
    });
};
function asODataParentBinding(oPrototype) {
    if (this) {
        ODataParentBinding.apply(this, arguments);
    }
    else {
        Object.assign(oPrototype, ODataParentBinding.prototype);
    }
}
[
    "adjustPredicate",
    "destroy",
    "doDeregisterChangeListener",
    "fetchCache",
    "getGeneration",
    "hasPendingChangesForPath"
].forEach(function (sMethod) {
    asODataParentBinding.prototype[sMethod] = ODataParentBinding.prototype[sMethod];
});
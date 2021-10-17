import _Helper from "./lib/_Helper";
import SyncPromise from "sap/ui/base/SyncPromise";
import ChangeReason from "sap/ui/model/ChangeReason";
import OperationMode from "sap/ui/model/odata/OperationMode";
import Context from "sap/ui/model/odata/v4/Context";
var aChangeReasonPrecedence = [ChangeReason.Context, ChangeReason.Change, ChangeReason.Refresh, ChangeReason.Sort, ChangeReason.Filter], sClassName = "sap.ui.model.odata.v4.ODataBinding", rIndexOrTransientPredicate = /\/\d|\(\$uid=/;
function hasPrecedenceOver(sChangeReason0, sChangeReason1) {
    return aChangeReasonPrecedence.indexOf(sChangeReason0) > aChangeReasonPrecedence.indexOf(sChangeReason1);
}
function ODataBinding() {
    this.mCacheByResourcePath = undefined;
    this.oCache = null;
    this.oCachePromise = SyncPromise.resolve(null);
    this.mCacheQueryOptions = undefined;
    this.oFetchCacheCallToken = undefined;
    this.mLateQueryOptions = undefined;
    this.sReducedPath = undefined;
    this.sResumeChangeReason = undefined;
}
ODataBinding.prototype.adjustPredicate = function (sTransientPredicate, sPredicate) {
    this.sReducedPath = this.sReducedPath.replace(sTransientPredicate, sPredicate);
};
ODataBinding.prototype.assertSameCache = function (oExpectedCache) {
    var oError;
    if (this.oCache !== oExpectedCache) {
        oError = new Error(this + " is ignoring response from inactive cache: " + oExpectedCache);
        oError.canceled = true;
        throw oError;
    }
};
ODataBinding.prototype.checkBindingParameters = function (mParameters, aAllowed) {
    var that = this;
    Object.keys(mParameters).forEach(function (sKey) {
        var vValue = mParameters[sKey];
        if (!sKey.startsWith("$$")) {
            return;
        }
        if (aAllowed.indexOf(sKey) < 0) {
            throw new Error("Unsupported binding parameter: " + sKey);
        }
        switch (sKey) {
            case "$$aggregation": break;
            case "$$groupId":
            case "$$updateGroupId":
                that.oModel.checkGroupId(vValue, false, "Unsupported value for binding parameter '" + sKey + "': ");
                break;
            case "$$ignoreMessages":
                if (vValue !== true && vValue !== false) {
                    throw new Error("Unsupported value for binding parameter " + "'$$ignoreMessages': " + vValue);
                }
                break;
            case "$$inheritExpandSelect":
                if (vValue !== true && vValue !== false) {
                    throw new Error("Unsupported value for binding parameter " + "'$$inheritExpandSelect': " + vValue);
                }
                if (!that.oOperation) {
                    throw new Error("Unsupported binding parameter $$inheritExpandSelect: " + "binding is not an operation binding");
                }
                if (mParameters.$expand) {
                    throw new Error("Must not set parameter $$inheritExpandSelect on a binding " + "which has a $expand binding parameter");
                }
                break;
            case "$$operationMode":
                if (vValue !== OperationMode.Server) {
                    throw new Error("Unsupported operation mode: " + vValue);
                }
                break;
            case "$$canonicalPath":
            case "$$noPatch":
            case "$$ownRequest":
            case "$$patchWithoutSideEffects":
            case "$$sharedRequest":
                if (vValue !== true) {
                    throw new Error("Unsupported value for binding parameter '" + sKey + "': " + vValue);
                }
                break;
            default: throw new Error("Unknown binding-specific parameter: " + sKey);
        }
    });
};
ODataBinding.prototype.checkSuspended = function (bIfNoResumeChangeReason) {
    var oRootBinding = this.getRootBinding();
    if (oRootBinding && oRootBinding.isSuspended() && (!bIfNoResumeChangeReason || this.isRoot() || this.getResumeChangeReason())) {
        throw new Error("Must not call method when the binding's root binding is suspended: " + this);
    }
};
ODataBinding.prototype.checkUpdate = function (bForceUpdate) {
    var that = this;
    if (arguments.length > 1) {
        throw new Error("Only the parameter bForceUpdate is supported");
    }
    this.checkUpdateInternal(bForceUpdate).catch(function (oError) {
        that.oModel.reportError("Failed to update " + that, sClassName, oError);
    });
};
ODataBinding.prototype.createAndSetCache = function (mQueryOptions, sResourcePath, oContext) {
    var oCache, sDeepResourcePath, iGeneration;
    this.mCacheQueryOptions = Object.assign({}, this.oModel.mUriParameters, mQueryOptions);
    if (this.bRelative) {
        if (oContext.isTransient && oContext.isTransient() && oContext.getProperty("@$ui5.context.isTransient")) {
            this.oCache = null;
            return null;
        }
        oCache = this.mCacheByResourcePath && this.mCacheByResourcePath[sResourcePath];
        iGeneration = oContext.getGeneration && oContext.getGeneration() || 0;
        if (oCache && oCache.$generation >= iGeneration) {
            oCache.setActive(true);
        }
        else {
            sDeepResourcePath = _Helper.buildPath(oContext.getPath(), this.sPath).slice(1);
            oCache = this.doCreateCache(sResourcePath, this.mCacheQueryOptions, oContext, sDeepResourcePath);
            if (!(this.mParameters && this.mParameters.$$sharedRequest)) {
                this.mCacheByResourcePath = this.mCacheByResourcePath || {};
                this.mCacheByResourcePath[sResourcePath] = oCache;
            }
            oCache.$deepResourcePath = sDeepResourcePath;
            oCache.$generation = iGeneration;
        }
    }
    else {
        oCache = this.doCreateCache(sResourcePath, this.mCacheQueryOptions);
    }
    if (this.mLateQueryOptions) {
        oCache.setLateQueryOptions(this.mLateQueryOptions);
    }
    this.oCache = oCache;
    return oCache;
};
ODataBinding.prototype.destroy = function () {
    this.mCacheByResourcePath = undefined;
    this.oCachePromise.then(function (oOldCache) {
        if (oOldCache) {
            oOldCache.setActive(false);
        }
    }, function () { });
    this.oCache = null;
    this.oCachePromise = SyncPromise.resolve(null);
    this.mCacheQueryOptions = undefined;
    this.oContext = undefined;
    this.oFetchCacheCallToken = undefined;
};
ODataBinding.prototype.doDeregisterChangeListener = function (sPath, oListener) {
    this.oCache.deregisterChange(sPath, oListener);
};
ODataBinding.prototype.fetchCache = function (oContext, bIgnoreParentCache, bKeepQueryOptions) {
    var oCache = this.oCache, oCallToken = {}, aPromises, that = this;
    if (!this.bRelative) {
        oContext = undefined;
    }
    if (oCache) {
        oCache.setActive(false);
    }
    else if (bKeepQueryOptions) {
        if (oCache === undefined) {
            throw new Error("Unsupported bKeepQueryOptions while oCachePromise is pending");
        }
        this.oFetchCacheCallToken = undefined;
        return;
    }
    this.oCache = undefined;
    if (bKeepQueryOptions) {
        this.oCachePromise = SyncPromise.resolve(Promise.resolve()).then(function () {
            return that.createAndSetCache(that.mCacheQueryOptions, oCache.getResourcePath(), oContext);
        });
        this.oFetchCacheCallToken = undefined;
        return;
    }
    aPromises = [
        this.fetchQueryOptionsForOwnCache(oContext, bIgnoreParentCache),
        this.oModel.oRequestor.ready()
    ];
    this.mCacheQueryOptions = undefined;
    this.oFetchCacheCallToken = oCallToken;
    this.oCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
        var mQueryOptions = aResult[0].mQueryOptions;
        that.sReducedPath = aResult[0].sReducedPath;
        if (mQueryOptions && !(oContext && oContext.iIndex === Context.VIRTUAL)) {
            return that.fetchResourcePath(oContext).then(function (sResourcePath) {
                var oError;
                if (that.oFetchCacheCallToken !== oCallToken) {
                    oError = new Error("Cache discarded as a new cache has been created");
                    oError.canceled = true;
                    throw oError;
                }
                return that.createAndSetCache(mQueryOptions, sResourcePath, oContext);
            });
        }
        that.oCache = null;
        return null;
    });
    this.oCachePromise.catch(function (oError) {
        that.oModel.reportError("Failed to create cache for binding " + that, sClassName, oError);
    });
};
ODataBinding.prototype.fetchQueryOptionsForOwnCache = function (oContext, bIgnoreParentCache) {
    var bHasNonSystemQueryOptions, oQueryOptionsPromise, sResolvedPath = this.oModel.resolve(this.sPath, oContext), that = this;
    function wrapQueryOptions(vQueryOptions, sReducedPath) {
        return SyncPromise.resolve(vQueryOptions).then(function (mQueryOptions) {
            return {
                mQueryOptions: mQueryOptions,
                sReducedPath: sReducedPath || sResolvedPath
            };
        });
    }
    if (this.oOperation || this.bRelative && !oContext || this.isMeta()) {
        return wrapQueryOptions(undefined);
    }
    oQueryOptionsPromise = this.doFetchQueryOptions(oContext);
    if (this.oModel.bAutoExpandSelect && this.aChildCanUseCachePromises && !(this.mParameters && this.mParameters.$$aggregation)) {
        oQueryOptionsPromise = SyncPromise.all([
            oQueryOptionsPromise,
            Promise.resolve().then(function () {
                return SyncPromise.all(that.aChildCanUseCachePromises);
            })
        ]).then(function (aResult) {
            that.aChildCanUseCachePromises = [];
            that.updateAggregatedQueryOptions(aResult[0]);
            return that.mAggregatedQueryOptions;
        });
    }
    if (bIgnoreParentCache || !this.bRelative || !oContext.fetchValue) {
        return wrapQueryOptions(oQueryOptionsPromise);
    }
    if (this.oModel.bAutoExpandSelect) {
        bHasNonSystemQueryOptions = this.mParameters && Object.keys(that.mParameters).some(function (sKey) {
            return sKey[0] !== "$" || sKey[1] === "$";
        });
        if (bHasNonSystemQueryOptions) {
            return wrapQueryOptions(oQueryOptionsPromise);
        }
        return oContext.getBinding().fetchIfChildCanUseCache(oContext, that.sPath, oQueryOptionsPromise).then(function (sReducedPath) {
            return wrapQueryOptions(sReducedPath ? undefined : oQueryOptionsPromise, sReducedPath);
        });
    }
    if (this.mParameters && Object.keys(this.mParameters).length) {
        return wrapQueryOptions(oQueryOptionsPromise);
    }
    return oQueryOptionsPromise.then(function (mQueryOptions) {
        return wrapQueryOptions(Object.keys(mQueryOptions).length ? mQueryOptions : undefined);
    });
};
ODataBinding.prototype.fetchResourcePath = function (oContext) {
    var bCanonicalPath, sContextPath, oContextPathPromise, that = this;
    if (!this.bRelative) {
        return SyncPromise.resolve(this.sPath.slice(1));
    }
    oContext = oContext || this.oContext;
    if (!oContext) {
        return SyncPromise.resolve();
    }
    sContextPath = oContext.getPath();
    bCanonicalPath = oContext.fetchCanonicalPath && (this.mParameters && this.mParameters.$$canonicalPath || rIndexOrTransientPredicate.test(sContextPath));
    oContextPathPromise = bCanonicalPath ? oContext.fetchCanonicalPath() : SyncPromise.resolve(sContextPath);
    return oContextPathPromise.then(function (sContextResourcePath) {
        return _Helper.buildPath(sContextResourcePath, that.sPath).slice(1);
    });
};
ODataBinding.prototype.getGroupId = function () {
    return this.sGroupId || (this.bRelative && this.oContext && this.oContext.getGroupId && this.oContext.getGroupId()) || this.oModel.getGroupId();
};
ODataBinding.prototype.getRelativePath = function (sPath) {
    var sRelativePath;
    if (sPath[0] === "/") {
        sRelativePath = _Helper.getRelativePath(sPath, this.getResolvedPath());
        if (sRelativePath === undefined && this.oReturnValueContext) {
            sRelativePath = _Helper.getRelativePath(sPath, this.oReturnValueContext.getPath());
        }
        return sRelativePath;
    }
    return sPath;
};
ODataBinding.prototype.getResumeChangeReason = function () {
    var sStrongestChangeReason = this.sResumeChangeReason;
    this.getDependentBindings().forEach(function (oDependentBinding) {
        var sDependentChangeReason = oDependentBinding.getResumeChangeReason();
        if (sDependentChangeReason && hasPrecedenceOver(sDependentChangeReason, sStrongestChangeReason)) {
            sStrongestChangeReason = sDependentChangeReason;
        }
    });
    return sStrongestChangeReason;
};
ODataBinding.prototype.getRootBinding = function () {
    if (this.bRelative) {
        if (!this.oContext) {
            return undefined;
        }
        if (this.oContext.getBinding) {
            return this.oContext.getBinding().getRootBinding();
        }
    }
    return this;
};
ODataBinding.prototype.getRootBindingResumePromise = function () {
    var oRootBinding = this.getRootBinding();
    return oRootBinding && oRootBinding.getResumePromise() || SyncPromise.resolve();
};
ODataBinding.prototype.getUpdateGroupId = function () {
    return this.sUpdateGroupId || (this.bRelative && this.oContext && this.oContext.getUpdateGroupId && this.oContext.getUpdateGroupId()) || this.oModel.getUpdateGroupId();
};
ODataBinding.prototype.hasPendingChanges = function () {
    return this.isResolved() && (this.hasPendingChangesForPath("") || this.hasPendingChangesInDependents());
};
ODataBinding.prototype.hasPendingChangesForPath = function (sPath) {
    return this.withCache(function (oCache, sCachePath) {
        return oCache.hasPendingChangesForPath(sCachePath);
    }, sPath, true).unwrap();
};
ODataBinding.prototype.hasPendingChangesInCaches = function (sResourcePathPrefix) {
    var that = this;
    if (!this.mCacheByResourcePath) {
        return false;
    }
    return Object.keys(this.mCacheByResourcePath).some(function (sResourcePath) {
        var oCache = that.mCacheByResourcePath[sResourcePath];
        return oCache.$deepResourcePath.startsWith(sResourcePathPrefix) && oCache.hasPendingChangesForPath("");
    });
};
ODataBinding.prototype.isInitial = function () {
    throw new Error("Unsupported operation: isInitial");
};
ODataBinding.prototype.isRoot = function () {
    return !this.bRelative || this.oContext && !this.oContext.getBinding;
};
ODataBinding.prototype.isRootBindingSuspended = function () {
    var oRootBinding = this.getRootBinding();
    return oRootBinding && oRootBinding.isSuspended();
};
ODataBinding.prototype.lockGroup = function (sGroupId, bLocked, bModifying, fnCancel) {
    sGroupId = sGroupId || (bModifying ? this.getUpdateGroupId() : this.getGroupId());
    return this.oModel.lockGroup(sGroupId, this, bLocked, bModifying, fnCancel);
};
ODataBinding.prototype.refresh = function (sGroupId) {
    if (typeof sGroupId === "boolean") {
        throw new Error("Unsupported parameter bForceUpdate");
    }
    this.requestRefresh(sGroupId).catch(this.oModel.getReporter());
};
ODataBinding.prototype.removeCachesAndMessages = function (sResourcePathPrefix, bCachesOnly) {
    var that = this;
    if (!bCachesOnly && this.oCache) {
        this.oCache.removeMessages();
    }
    if (this.mCacheByResourcePath) {
        Object.keys(this.mCacheByResourcePath).forEach(function (sResourcePath) {
            var oCache = that.mCacheByResourcePath[sResourcePath], sDeepResourcePath = oCache.$deepResourcePath;
            if (_Helper.hasPathPrefix(sDeepResourcePath, sResourcePathPrefix)) {
                if (!bCachesOnly) {
                    oCache.removeMessages();
                }
                delete that.mCacheByResourcePath[sResourcePath];
            }
        });
    }
};
ODataBinding.prototype.requestAbsoluteSideEffects = function (sGroupId, aAbsolutePaths) {
    var aPaths = [], sMetaPath = _Helper.getMetaPath(this.getResolvedPath());
    aAbsolutePaths.some(function (sAbsolutePath) {
        var sRelativePath = _Helper.getRelativePath(sAbsolutePath, sMetaPath);
        if (sRelativePath !== undefined) {
            aPaths.push(sRelativePath);
        }
        else if (_Helper.hasPathPrefix(sMetaPath, sAbsolutePath)) {
            aPaths = [""];
            return true;
        }
    });
    if (aPaths.length) {
        if (this.requestSideEffects) {
            return this.requestSideEffects(sGroupId, aPaths);
        }
        return this.refreshInternal("", sGroupId, true);
    }
};
ODataBinding.prototype.requestRefresh = function (sGroupId) {
    if (!this.isRoot()) {
        throw new Error("Refresh on this binding is not supported");
    }
    if (this.hasPendingChanges()) {
        throw new Error("Cannot refresh due to pending changes");
    }
    this.oModel.checkGroupId(sGroupId);
    return Promise.resolve(this.refreshInternal("", sGroupId, true)).then(function () {
    });
};
ODataBinding.prototype.resetChanges = function () {
    var aPromises = [];
    this.checkSuspended();
    this.resetChangesForPath("", aPromises);
    this.resetChangesInDependents(aPromises);
    this.resetInvalidDataState();
    return Promise.all(aPromises).then(function () { });
};
ODataBinding.prototype.resetChangesForPath = function (sPath, aPromises) {
    aPromises.push(this.withCache(function (oCache, sCachePath) {
        oCache.resetChangesForPath(sCachePath);
    }, sPath).unwrap());
};
ODataBinding.prototype.resetInvalidDataState = function () { };
ODataBinding.prototype.setResumeChangeReason = function (sChangeReason) {
    if (hasPrecedenceOver(sChangeReason, this.sResumeChangeReason)) {
        this.sResumeChangeReason = sChangeReason;
    }
};
ODataBinding.prototype.toString = function () {
    return this.getMetadata().getName() + ": " + (this.bRelative ? this.oContext + "|" : "") + this.sPath;
};
ODataBinding.prototype.withCache = function (fnProcessor, sPath, bSync, bWithOrWithoutCache) {
    var oCachePromise = bSync ? SyncPromise.resolve(this.oCache) : this.oCachePromise, sRelativePath, that = this;
    sPath = sPath || "";
    return oCachePromise.then(function (oCache) {
        if (oCache) {
            sRelativePath = that.getRelativePath(sPath);
            if (sRelativePath !== undefined) {
                return fnProcessor(oCache, sRelativePath, that);
            }
        }
        else if (oCache === undefined) {
            return undefined;
        }
        else if (that.oOperation) {
            return bWithOrWithoutCache ? fnProcessor(null, that.getRelativePath(sPath), that) : undefined;
        }
        if (that.bRelative && that.oContext && that.oContext.withCache) {
            return that.oContext.withCache(fnProcessor, sPath[0] === "/" ? sPath : _Helper.buildPath(that.sPath, sPath), bSync, bWithOrWithoutCache);
        }
        return undefined;
    });
};
function asODataBinding(oPrototype) {
    if (this) {
        ODataBinding.apply(this, arguments);
    }
    else {
        Object.assign(oPrototype, ODataBinding.prototype);
    }
}
[
    "adjustPredicate",
    "destroy",
    "doDeregisterChangeListener",
    "fetchCache",
    "hasPendingChangesForPath"
].forEach(function (sMethod) {
    asODataBinding.prototype[sMethod] = ODataBinding.prototype[sMethod];
});
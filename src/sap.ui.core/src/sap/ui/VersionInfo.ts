import LoaderExtensions from "sap/base/util/LoaderExtensions";
export class VersionInfo {
    static load(mOptions: any) {
        mOptions = mOptions || {};
        mOptions.async = true;
        return VersionInfo._load(mOptions);
    }
    private static _load(mOptions: any) {
        if (typeof mOptions !== "object") {
            mOptions = {
                library: mOptions
            };
        }
        mOptions.async = mOptions.async === true;
        mOptions.failOnError = mOptions.failOnError !== false;
        if (!sap.ui.versioninfo) {
            if (mOptions.async && oVersionInfoPromise instanceof Promise) {
                return oVersionInfoPromise.then(function () {
                    return VersionInfo._load(mOptions);
                });
            }
            var fnHandleSuccess = function (oVersionInfo) {
                oVersionInfoPromise = null;
                if (oVersionInfo === null) {
                    return undefined;
                }
                sap.ui.versioninfo = oVersionInfo;
                return VersionInfo._load(mOptions);
            };
            var fnHandleError = function (oError) {
                oVersionInfoPromise = null;
                throw oError;
            };
            var vReturn = LoaderExtensions.loadResource("sap-ui-version.json", {
                async: mOptions.async,
                failOnError: mOptions.async || mOptions.failOnError
            });
            if (vReturn instanceof Promise) {
                oVersionInfoPromise = vReturn;
                return vReturn.then(fnHandleSuccess, fnHandleError);
            }
            else {
                return fnHandleSuccess(vReturn);
            }
        }
        else {
            var oResult;
            if (typeof mOptions.library !== "undefined") {
                var aLibs = sap.ui.versioninfo.libraries;
                if (aLibs) {
                    for (var i = 0, l = aLibs.length; i < l; i++) {
                        if (aLibs[i].name === mOptions.library) {
                            oResult = aLibs[i];
                            break;
                        }
                    }
                }
            }
            else {
                oResult = sap.ui.versioninfo;
            }
            return mOptions.async ? Promise.resolve(oResult) : oResult;
        }
    }
    private static _getTransitiveDependencyForLibraries(aLibraries: any) {
        transformVersionInfo();
        if (mKnownLibs) {
            var mClosure = aLibraries.reduce(function (all, lib) {
                all[lib] = true;
                return Object.assign(all, mKnownLibs[lib]);
            }, {});
            aLibraries = Object.keys(mClosure);
        }
        return aLibraries;
    }
    private static _getTransitiveDependencyForComponent(sComponentName: any) {
        transformVersionInfo();
        if (mKnownComponents) {
            return mKnownComponents[sComponentName];
        }
    }
}
var oVersionInfoPromise = null;
var oVersionInfo;
var mKnownLibs;
var mKnownComponents;
Object.defineProperty(sap.ui, "versioninfo", {
    configurable: true,
    enumerable: true,
    get: function () {
        return oVersionInfo;
    },
    set: function (oNewVersionInfo) {
        oVersionInfo = oNewVersionInfo;
        mKnownLibs = null;
        mKnownComponents = null;
    }
});
function transformVersionInfo() {
    if (sap.ui.versioninfo && sap.ui.versioninfo.libraries && !mKnownLibs) {
        mKnownLibs = {};
        sap.ui.versioninfo.libraries.forEach(function (oLib, i) {
            mKnownLibs[oLib.name] = {};
            var mDeps = oLib.manifestHints && oLib.manifestHints.dependencies && oLib.manifestHints.dependencies.libs;
            for (var sDep in mDeps) {
                if (!mDeps[sDep].lazy) {
                    mKnownLibs[oLib.name][sDep] = true;
                }
            }
        });
    }
    if (sap.ui.versioninfo && sap.ui.versioninfo.components && !mKnownComponents) {
        mKnownComponents = {};
        Object.keys(sap.ui.versioninfo.components).forEach(function (sComponentName) {
            var oComponentInfo = sap.ui.versioninfo.components[sComponentName];
            mKnownComponents[sComponentName] = {
                library: oComponentInfo.library,
                hasOwnPreload: oComponentInfo.hasOwnPreload || false,
                dependencies: []
            };
            var mDeps = oComponentInfo.manifestHints && oComponentInfo.manifestHints.dependencies && oComponentInfo.manifestHints.dependencies.libs;
            for (var sDep in mDeps) {
                if (!mDeps[sDep].lazy) {
                    mKnownComponents[sComponentName].dependencies.push(sDep);
                }
            }
        });
    }
}
import ManagedObjectMetadata from "sap/ui/base/ManagedObjectMetadata";
import Manifest from "sap/ui/core/Manifest";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import deepExtend from "sap/base/util/deepExtend";
import isPlainObject from "sap/base/util/isPlainObject";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
export class ComponentMetadata {
    static prototype = Object.create(ManagedObjectMetadata.prototype);
    applySettings(oClassInfo: any) {
        var oStaticInfo = this._oStaticInfo = oClassInfo.metadata;
        var sName = this.getName(), sPackage = sName.replace(/\.\w+?$/, "");
        if (oStaticInfo._src) {
            if (oStaticInfo._src == "component.json") {
                Log.warning("Usage of declaration \"metadata: 'component.json'\" is deprecated (component " + sName + "). Use \"metadata: 'json'\" instead.");
            }
            else if (oStaticInfo._src != "json") {
                throw new Error("Invalid metadata declaration for component " + sName + ": \"" + oStaticInfo._src + "\"! Use \"metadata: 'json'\" to load metadata from component.json.");
            }
            var sResource = sPackage.replace(/\./g, "/") + "/component.json";
            Log.info("The metadata of the component " + sName + " is loaded from file " + sResource + ".");
            try {
                var oResponse = LoaderExtensions.loadResource(sResource, {
                    dataType: "json"
                });
                extend(oStaticInfo, oResponse);
            }
            catch (err) {
                Log.error("Failed to load component metadata from \"" + sResource + "\" (component " + sName + ")! Reason: " + err);
            }
        }
        ManagedObjectMetadata.prototype.applySettings.call(this, oClassInfo);
        this._sComponentName = sPackage;
        this._bInitialized = false;
        this._iInstanceCount = 0;
        var oManifest = oStaticInfo["manifest"];
        if (oManifest) {
            oStaticInfo.__metadataVersion = 2;
            if (typeof oManifest === "string" && oManifest === "json") {
                return;
            }
        }
        else {
            oStaticInfo.__metadataVersion = 1;
            oManifest = {};
        }
        this._applyManifest(oManifest);
    }
    private _applyManifest(oManifestJson: any) {
        if (this._oManifest) {
            Log.warning("Can't apply manifest to ComponentMetadata as it has already been created.", this.getName(), "sap.ui.core.ComponentMetadata");
            return;
        }
        oManifestJson["name"] = oManifestJson["name"] || this.getName();
        oManifestJson["sap.app"] = oManifestJson["sap.app"] || {
            "id": this.getComponentName()
        };
        oManifestJson["sap.ui5"] = oManifestJson["sap.ui5"] || {};
        if (!this.isBaseClass()) {
            oManifestJson["sap.ui5"]["extends"] = oManifestJson["sap.ui5"]["extends"] || {};
        }
        this._convertLegacyMetadata(this._oStaticInfo, oManifestJson);
        this._oManifest = new Manifest(oManifestJson, {
            componentName: this.getComponentName(),
            baseUrl: sap.ui.require.toUrl(this.getComponentName().replace(/\./g, "/")) + "/",
            process: this._oStaticInfo.__metadataVersion === 2
        });
    }
    init(...args: any) {
        if (this._iInstanceCount === 0) {
            var oParent = this.getParent();
            if (oParent instanceof ComponentMetadata) {
                oParent.init();
            }
            this.getManifestObject().init();
            this._bInitialized = true;
        }
        this._iInstanceCount++;
    }
    exit(...args: any) {
        var iInstanceCount = Math.max(this._iInstanceCount - 1, 0);
        if (iInstanceCount === 0) {
            this.getManifestObject().exit();
            var oParent = this.getParent();
            if (oParent instanceof ComponentMetadata) {
                oParent.exit();
            }
            this._bInitialized = false;
        }
        this._iInstanceCount = iInstanceCount;
    }
    onInitComponent(oInstance: any) {
        Log.error("The function ComponentMetadata#onInitComponent will be removed soon!");
    }
    onExitComponent(oInstance: any) {
        Log.error("The function ComponentMetadata#onExitComponent will be removed soon!");
    }
    isBaseClass(...args: any) {
        return /^sap\.ui\.core\.(UI)?Component$/.test(this.getName());
    }
    getMetadataVersion(...args: any) {
        return this._oStaticInfo.__metadataVersion;
    }
    getManifestObject(...args: any) {
        if (!this._oManifest) {
            var oManifest = this._oStaticInfo["manifest"];
            if (typeof oManifest === "string" && oManifest === "json") {
                var sName = this.getName();
                var sPackage = this.getComponentName();
                var sResource = sPackage.replace(/\./g, "/") + "/manifest.json";
                var bIsResourceLoaded = !!sap.ui.loader._.getModuleState(sResource);
                if (!bIsResourceLoaded && syncCallBehavior === 2) {
                    Log.error("[nosync] Loading manifest of the component " + sName + " ignored.", sResource, "sap.ui.core.ComponentMetadata");
                    oManifest = {};
                }
                else {
                    if (!bIsResourceLoaded && syncCallBehavior === 1) {
                        Log.error("[nosync] The manifest of the component " + sName + " is loaded with sync XHR.", sResource, "sap.ui.core.ComponentMetadata");
                    }
                    else {
                        Log.info("The manifest of the component " + sName + " is loaded from file " + sResource + ".");
                    }
                    try {
                        var oResponse = LoaderExtensions.loadResource(sResource, {
                            dataType: "json"
                        });
                        oManifest = oResponse;
                    }
                    catch (err) {
                        Log.error("Failed to load component manifest from \"" + sResource + "\" (component " + sName + ")! Reason: " + err);
                        oManifest = {};
                    }
                }
                this._applyManifest(oManifest);
            }
        }
        return this._oManifest;
    }
    getManifest(...args: any) {
        if (this.getMetadataVersion() === 1) {
            return this.getManifestObject().getRawJson();
        }
        return this.getManifestObject().getJson();
    }
    private _getManifest(...args: any) {
        Log.warning("ComponentMetadata#_getManifest: do not use deprecated functions anymore!");
        return this.getManifestObject().getJson();
    }
    getRawManifest(...args: any) {
        return this.getManifestObject().getRawJson();
    }
    private _getRawManifest(...args: any) {
        Log.warning("ComponentMetadata#_getRawManifest: do not use deprecated functions anymore!");
        return this.getManifestObject().getRawJson();
    }
    getManifestEntry(sKey: any, bMerged: any) {
        var oData = this.getManifestObject().getEntry(sKey);
        if (oData !== undefined && !isPlainObject(oData)) {
            return oData;
        }
        var oParent, oParentData;
        if (bMerged && (oParent = this.getParent()) instanceof ComponentMetadata) {
            oParentData = oParent.getManifestEntry(sKey, bMerged);
        }
        if (oParentData || oData) {
            oData = deepExtend({}, oParentData, oData);
        }
        return oData;
    }
    getCustomEntry(sKey: any, bMerged: any) {
        if (!sKey || sKey.indexOf(".") <= 0) {
            Log.warning("Component Metadata entries with keys without namespace prefix can not be read via getCustomEntry. Key: " + sKey + ", Component: " + this.getName());
            return null;
        }
        var oParent, oData = this._oStaticInfo[sKey] || {};
        if (!isPlainObject(oData)) {
            Log.warning("Custom Component Metadata entry with key '" + sKey + "' must be an object. Component: " + this.getName());
            return null;
        }
        if (bMerged && (oParent = this.getParent()) instanceof ComponentMetadata) {
            return deepExtend({}, oParent.getCustomEntry(sKey, bMerged), oData);
        }
        return deepExtend({}, oData);
    }
    getComponentName(...args: any) {
        return this._sComponentName;
    }
    getDependencies(...args: any) {
        if (!this._oLegacyDependencies) {
            var mDependencies = this.getManifestEntry("/sap.ui5/dependencies"), sUI5Version = mDependencies && mDependencies.minUI5Version || null, mLibs = mDependencies && mDependencies.libs || {}, mComponents = mDependencies && mDependencies.components || {};
            var mLegacyDependencies = {
                ui5version: sUI5Version,
                libs: [],
                components: []
            };
            for (var sLib in mLibs) {
                mLegacyDependencies.libs.push(sLib);
            }
            for (var sComponent in mComponents) {
                mLegacyDependencies.components.push(sComponent);
            }
            this._oLegacyDependencies = mLegacyDependencies;
        }
        return this._oLegacyDependencies;
    }
    getIncludes(...args: any) {
        Log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getIncludes() is deprecated. " + "For CSS files, please use the '/sap.ui5/resources/css' section in your 'manifest.json'. ", "Deprecation", null, function () {
            return {
                type: "sap.ui.core.ComponentMetadata",
                name: this.getName()
            };
        }.bind(this));
        if (!this._aLegacyIncludes) {
            var aIncludes = [], mResources = this.getManifestEntry("/sap.ui5/resources") || {}, aCSSResources = mResources && mResources.css || [], aJSResources = mResources && mResources.js || [];
            for (var i = 0, l = aCSSResources.length; i < l; i++) {
                if (aCSSResources[i] && aCSSResources[i].uri) {
                    aIncludes.push(aCSSResources[i].uri);
                }
            }
            for (var i = 0, l = aJSResources.length; i < l; i++) {
                if (aJSResources[i] && aJSResources[i].uri) {
                    aIncludes.push(aJSResources[i].uri);
                }
            }
            this._aLegacyIncludes = (aIncludes.length > 0) ? aIncludes : null;
        }
        return this._aLegacyIncludes;
    }
    getUI5Version(...args: any) {
        return this.getManifestEntry("/sap.ui5/dependencies/minUI5Version");
    }
    getComponents(...args: any) {
        return this.getDependencies().components;
    }
    getLibs(...args: any) {
        return this.getDependencies().libs;
    }
    getVersion(...args: any) {
        return this.getManifestEntry("/sap.app/applicationVersion/version");
    }
    getConfig(sKey: any, bDoNotMerge: any) {
        var mConfig = this.getManifestEntry("/sap.ui5/config", !bDoNotMerge);
        if (!mConfig) {
            return {};
        }
        if (!sKey) {
            return mConfig;
        }
        return mConfig.hasOwnProperty(sKey) ? mConfig[sKey] : {};
    }
    getCustomizing(bDoNotMerge: any) {
        return this.getManifestEntry("/sap.ui5/extends/extensions", !bDoNotMerge);
    }
    getModels(bDoNotMerge: any) {
        if (!this._oLegacyModels) {
            this._oLegacyModels = {};
            var mDataSources = this.getManifestEntry("/sap.ui5/models") || {};
            for (var sDataSource in mDataSources) {
                var oDataSource = mDataSources[sDataSource];
                this._oLegacyModels[sDataSource] = oDataSource.settings || {};
                this._oLegacyModels[sDataSource].type = oDataSource.type;
                this._oLegacyModels[sDataSource].uri = oDataSource.uri;
            }
        }
        var oParent, mModels = deepExtend({}, this._oLegacyModels);
        if (!bDoNotMerge && (oParent = this.getParent()) instanceof ComponentMetadata) {
            mModels = deepExtend({}, oParent.getModels(), mModels);
        }
        return mModels;
    }
    handleValidation(...args: any) {
        return this.getManifestEntry("/sap.ui5/handleValidation");
    }
    getServices(...args: any) {
        Log.warning("Usage of sap.ui.core.ComponentMetadata.protoype.getServices is deprecated!");
        return this._oStaticInfo.services || {};
    }
    private _convertLegacyMetadata(oStaticInfo: any, oManifest: any) {
        var fnCreateObject = function (a, fnCallback) {
            var o = {};
            if (a) {
                for (var i = 0, l = a.length; i < l; i++) {
                    var oValue = a[i];
                    if (typeof oValue === "string") {
                        o[oValue] = typeof fnCallback === "function" && fnCallback(oValue) || {};
                    }
                }
            }
            return o;
        };
        var oAppManifest = oManifest["sap.app"];
        var oUI5Manifest = oManifest["sap.ui5"];
        for (var sName in oStaticInfo) {
            var oValue = oStaticInfo[sName];
            if (oValue !== undefined) {
                switch (sName) {
                    case "name":
                        oManifest[sName] = oManifest[sName] || oValue;
                        oAppManifest["id"] = oAppManifest["id"] || oValue;
                        break;
                    case "description":
                    case "keywords":
                        oAppManifest[sName] = oAppManifest[sName] || oValue;
                        break;
                    case "version":
                        var mAppVersion = oAppManifest.applicationVersion = oAppManifest.applicationVersion || {};
                        mAppVersion.version = mAppVersion.version || oValue;
                        break;
                    case "config":
                        oUI5Manifest[sName] = oUI5Manifest[sName] || oValue;
                        break;
                    case "customizing":
                        var mExtends = oUI5Manifest["extends"] = oUI5Manifest["extends"] || {};
                        mExtends.extensions = mExtends.extensions || oValue;
                        break;
                    case "dependencies":
                        if (!oUI5Manifest[sName]) {
                            oUI5Manifest[sName] = {};
                            oUI5Manifest[sName].minUI5Version = oValue.ui5version;
                            oUI5Manifest[sName].libs = fnCreateObject(oValue.libs);
                            oUI5Manifest[sName].components = fnCreateObject(oValue.components);
                        }
                        break;
                    case "includes":
                        if (!oUI5Manifest["resources"]) {
                            oUI5Manifest["resources"] = {};
                            if (oValue && oValue.length > 0) {
                                for (var i = 0, l = oValue.length; i < l; i++) {
                                    var sResource = oValue[i];
                                    var m = sResource.match(/\.(css|js)$/i);
                                    if (m) {
                                        oUI5Manifest["resources"][m[1]] = oUI5Manifest["resources"][m[1]] || [];
                                        oUI5Manifest["resources"][m[1]].push({
                                            "uri": sResource
                                        });
                                    }
                                }
                            }
                        }
                        break;
                    case "handleValidation":
                        if (oUI5Manifest[sName] === undefined) {
                            oUI5Manifest[sName] = oValue;
                        }
                        break;
                    case "models":
                        if (!oUI5Manifest["models"]) {
                            var oModels = {};
                            for (var sModel in oValue) {
                                var oDS = oValue[sModel];
                                var oModel = {};
                                for (var sDSSetting in oDS) {
                                    var oDSSetting = oDS[sDSSetting];
                                    switch (sDSSetting) {
                                        case "type":
                                        case "uri":
                                            oModel[sDSSetting] = oDSSetting;
                                            break;
                                        default:
                                            oModel.settings = oModel.settings || {};
                                            oModel.settings[sDSSetting] = oDSSetting;
                                    }
                                }
                                oModels[sModel] = oModel;
                            }
                            oUI5Manifest["models"] = oModels;
                        }
                        break;
                }
            }
        }
    }
    static preprocessClassInfo(oClassInfo: any) {
        if (oClassInfo && typeof oClassInfo.metadata === "string") {
            oClassInfo.metadata = {
                _src: oClassInfo.metadata
            };
        }
        return oClassInfo;
    }
    constructor(sClassName: any, oClassInfo: any) {
        ManagedObjectMetadata.apply(this, arguments);
    }
}
var oCfgData = window["sap-ui-config"] || {};
var syncCallBehavior = 0;
if (oCfgData["xx-nosync"] === "warn" || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search)) {
    syncCallBehavior = 1;
}
if (oCfgData["xx-nosync"] === true || oCfgData["xx-nosync"] === "true" || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search)) {
    syncCallBehavior = 2;
}
ComponentMetadata.prototype.constructor = ComponentMetadata;
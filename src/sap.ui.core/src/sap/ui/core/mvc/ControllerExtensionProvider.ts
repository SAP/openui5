import Log from "sap/base/Log";
import Component from "sap/ui/core/Component";
export class ControllerExtensionProvider {
    private static _sExtensionProvider = null;
    static registerExtensionProvider(sExtensionProvider: any) {
        ControllerExtensionProvider._sExtensionProvider = sExtensionProvider;
    }
    static getControllerExtensions(sControllerName: any, sComponentId: any, sViewId: any, bAsync: any) {
        var mControllerExtensions = {
            customizingControllerNames: [],
            providerControllers: []
        };
        var oComponent = Component.get(sComponentId);
        if (oComponent && oComponent.getLocalId) {
            sViewId = oComponent.getLocalId(sViewId) || sViewId;
        }
        var aManifestExtensions = readManifestExtensionConfiguration(sControllerName, oComponent, sViewId);
        mControllerExtensions.customizingControllerNames = aManifestExtensions;
        if (bAsync) {
            if (ControllerExtensionProvider._sExtensionProvider) {
                return loadExtensionProvider(bAsync).then(function (oExternalProvider) {
                    return oExternalProvider.getControllerExtensions(sControllerName, sComponentId, bAsync, sViewId);
                }).then(function (aExternalExtensions) {
                    mControllerExtensions.providerControllers = aExternalExtensions || [];
                    return mControllerExtensions;
                });
            }
            else {
                return Promise.resolve(mControllerExtensions);
            }
        }
        else {
            if (ControllerExtensionProvider._sExtensionProvider) {
                var oExternalProvider = loadExtensionProvider();
                if (oExternalProvider) {
                    var aExternalExtensions = oExternalProvider.getControllerExtensions(sControllerName, sComponentId, bAsync, sViewId);
                    if (aExternalExtensions && Array.isArray(aExternalExtensions)) {
                        mControllerExtensions.providerControllers = aExternalExtensions;
                    }
                    else {
                        Log.error("Controller Extension Provider: Error in ExtensionProvider.getControllerExtensions: " + ControllerExtensionProvider._sExtensionProvider + " - no valid extensions returned. Return value must be an array of ControllerExtensions.");
                    }
                }
            }
            return mControllerExtensions;
        }
    }
}
var mExtensionProvider = {};
function readManifestExtensionConfiguration(sControllerName, oComponent, sViewId) {
    var aControllerNames = [];
    var mInstanceSpecificConfig = Component.getCustomizing(oComponent, {
        type: "sap.ui.controllerExtensions",
        name: sControllerName + "#" + sViewId
    });
    var aControllerExtConfigs = [];
    if (mInstanceSpecificConfig) {
        aControllerExtConfigs.push(mInstanceSpecificConfig);
    }
    else {
        var mDefaultConfig = Component.getCustomizing(oComponent, {
            type: "sap.ui.controllerExtensions",
            name: sControllerName
        });
        if (mDefaultConfig) {
            aControllerExtConfigs.push(mDefaultConfig);
        }
    }
    for (var i = 0; i < aControllerExtConfigs.length; i++) {
        var vControllerExtensions = aControllerExtConfigs[i];
        if (vControllerExtensions) {
            var sExtControllerName = typeof vControllerExtensions === "string" ? vControllerExtensions : vControllerExtensions.controllerName;
            aControllerNames = aControllerNames.concat(vControllerExtensions.controllerNames || []);
            if (sExtControllerName) {
                aControllerNames.unshift(sExtControllerName);
            }
        }
    }
    return aControllerNames;
}
function loadExtensionProvider(bAsync) {
    var sProviderName = ControllerExtensionProvider._sExtensionProvider.replace(/\./g, "/"), oProvider = mExtensionProvider[sProviderName];
    if (oProvider) {
        return bAsync ? Promise.resolve(oProvider) : oProvider;
    }
    if (sProviderName) {
        if (bAsync) {
            return new Promise(function (resolve, reject) {
                sap.ui.require([sProviderName], function (ExtensionProvider) {
                    oProvider = new ExtensionProvider();
                    mExtensionProvider[sProviderName] = oProvider;
                    resolve(oProvider);
                }, reject);
            });
        }
        else {
            var ExtensionProviderClass = sap.ui.requireSync(sProviderName);
            oProvider = new ExtensionProviderClass();
            mExtensionProvider[sProviderName] = oProvider;
            return oProvider;
        }
    }
    else {
        return bAsync ? Promise.resolve() : undefined;
    }
}
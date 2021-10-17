import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import View from "sap/ui/core/mvc/View";
import Component from "sap/ui/core/Component";
sap.ui.extensionpoint = function (oContainer, sExtName, fnCreateDefaultContent, oTargetControl, sAggregationName) {
    Log.warning("Do not use deprecated factory function 'sap.ui.extensionpoint'. Use 'sap.ui.core.ExtensionPoint.load' instead", "sap.ui.extensionpoint", null, function () {
        return {
            type: "sap.ui.extensionpoint",
            name: sExtName
        };
    });
    return ExtensionPoint._factory(oContainer, sExtName, fnCreateDefaultContent, oTargetControl, sAggregationName);
};
var ExtensionPoint = sap.ui.extensionpoint;
ExtensionPoint._factory = function (oContainer, sExtName, fnCreateDefaultContent, oTargetControl, sAggregationName, bAsync) {
    var oExtensionConfig, oView, vResult, sViewOrFragmentName;
    if (oContainer) {
        if (oContainer.isA("sap.ui.core.mvc.View")) {
            sViewOrFragmentName = oContainer.sViewName;
            oView = oContainer;
        }
        else if (oContainer.isA("sap.ui.core.Fragment")) {
            sViewOrFragmentName = oContainer.getFragmentName();
            oView = oContainer._oContainingView;
        }
        oExtensionConfig = Component.getCustomizing(oContainer, {
            type: "sap.ui.viewExtensions",
            name: sViewOrFragmentName,
            extensionName: sExtName
        });
    }
    if (oExtensionConfig) {
        if (oExtensionConfig.className) {
            Log.info("Customizing: View extension found for extension point '" + sExtName + "' in View '" + oView.sViewName + "': " + oExtensionConfig.className + ": " + (oExtensionConfig.viewName || oExtensionConfig.fragmentName));
            var sId = oView && oExtensionConfig.id ? oView.createId(oExtensionConfig.id) : oExtensionConfig.id;
            var oFactoryConfig = {
                async: bAsync,
                id: sId,
                type: oExtensionConfig.type
            };
            if (bAsync && oView._sProcessingMode) {
                oFactoryConfig.processingMode = oView._sProcessingMode;
            }
            if (oExtensionConfig.className === "sap.ui.core.Fragment") {
                var Fragment = sap.ui.require("sap.ui.core.Fragment");
                oFactoryConfig.fragmentName = oExtensionConfig.fragmentName;
                oFactoryConfig.containingView = oView;
                if (bAsync) {
                    if (Fragment) {
                        vResult = Fragment.load(oFactoryConfig);
                    }
                    else {
                        vResult = new Promise(function (fnResolve, fnReject) {
                            sap.ui.require(["sap/ui/core/Fragment"], function (Fragment) {
                                fnResolve(Fragment.load(oFactoryConfig));
                            }, fnReject);
                        });
                    }
                }
                else {
                    Fragment = Fragment || sap.ui.requireSync("sap/ui/core/Fragment");
                    var oFragment = new Fragment(oFactoryConfig);
                    vResult = (Array.isArray(oFragment) ? oFragment : [oFragment]);
                }
            }
            else if (oExtensionConfig.className === "sap.ui.core.mvc.View") {
                oFactoryConfig.viewName = oExtensionConfig.viewName;
                var oExtensionView = View._create(oFactoryConfig);
                if (bAsync) {
                    vResult = oExtensionView.loaded();
                }
                else {
                    vResult = [oExtensionView];
                }
            }
            else {
                Log.warning("Customizing: Unknown extension className configured (and ignored) in Component.js for extension point '" + sExtName + "' in View '" + oView.sViewName + "': " + oExtensionConfig.className);
            }
        }
        else {
            Log.warning("Customizing: no extension className configured in Component.js for extension point '" + sExtName + "' in View '" + oView.sViewName + "': " + oExtensionConfig.className);
        }
    }
    else if (ExtensionPoint._fnExtensionProvider) {
        var sExtensionProvider = ExtensionPoint._fnExtensionProvider(oView);
        var sFragmentId;
        if (oView.isA("sap.ui.core.Fragment")) {
            sFragmentId = oView._sExplicitId;
            var oController = oView.getController();
            oView = oController && typeof oController.isA === "function" && oController.isA("sap.ui.core.mvc.Controller") && oController.getView();
            if (oView) {
                sFragmentId = oView.getLocalId(sFragmentId) || sFragmentId;
            }
        }
        if (sExtensionProvider) {
            if (!oView) {
                Log.warning("View instance could not be passed to ExtensionPoint Provider for extension point '" + sExtName + "' " + "in fragment '" + sFragmentId + "'.");
            }
            return [{
                    providerClass: sExtensionProvider,
                    view: oView,
                    fragmentId: sFragmentId,
                    name: sExtName,
                    createDefault: fnCreateDefaultContent,
                    targetControl: undefined,
                    aggregationName: undefined,
                    index: undefined,
                    ready: function (aControls) {
                        var next = this._nextSibling;
                        while (next != null) {
                            next.index += aControls.length;
                            next = next._nextSibling;
                        }
                    },
                    _isExtensionPoint: true,
                    _nextSibling: null
                }];
        }
    }
    if (!vResult && typeof fnCreateDefaultContent === "function") {
        vResult = fnCreateDefaultContent();
    }
    var fnProcessResult = function (vResult) {
        if (vResult && !Array.isArray(vResult)) {
            vResult = [vResult];
        }
        if (vResult && oTargetControl) {
            var oAggregationInfo = oTargetControl.getMetadata().getAggregation(sAggregationName);
            if (oAggregationInfo) {
                for (var i = 0, l = vResult.length; i < l; i++) {
                    oTargetControl[oAggregationInfo._sMutator](vResult[i]);
                }
            }
            else {
                Log.error("Creating extension point failed - Tried to add extension point with name " + sExtName + " to an aggregation of " + oTargetControl.getId() + " in view " + oView.sViewName + ", but sAggregationName was not provided correctly and I could not find a default aggregation");
            }
        }
        return vResult || [];
    };
    if (vResult && typeof vResult.then === "function") {
        return vResult.then(fnProcessResult);
    }
    else {
        return fnProcessResult(vResult);
    }
};
ExtensionPoint.registerExtensionProvider = function (fnExtensionProvider) {
    if (fnExtensionProvider == null) {
        delete ExtensionPoint._fnExtensionProvider;
    }
    else if (typeof fnExtensionProvider == "function") {
        ExtensionPoint._fnExtensionProvider = fnExtensionProvider;
    }
    else {
        Log.error("ExtensionPoint provider must be a function!");
    }
};
ExtensionPoint.load = function (mOptions) {
    return Promise.resolve(ExtensionPoint._factory(mOptions.container, mOptions.name, mOptions.createDefaultContent, null, null, !!mOptions.async));
};
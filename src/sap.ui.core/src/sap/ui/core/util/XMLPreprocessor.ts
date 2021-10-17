import Log from "sap/base/Log";
import deepExtend from "sap/base/util/deepExtend";
import JSTokenizer from "sap/base/util/JSTokenizer";
import ObjectPath from "sap/base/util/ObjectPath";
import BindingParser from "sap/ui/base/BindingParser";
import ManagedObject from "sap/ui/base/ManagedObject";
import SyncPromise from "sap/ui/base/SyncPromise";
import Component from "sap/ui/core/Component";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import BindingMode from "sap/ui/model/BindingMode";
import CompositeBinding from "sap/ui/model/CompositeBinding";
import Context from "sap/ui/model/Context";
import Measurement from "sap/ui/performance/Measurement";
var sNAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1", sXMLPreprocessor = "sap.ui.core.util.XMLPreprocessor", aPerformanceCategories = [sXMLPreprocessor], sPerformanceGetResolvedBinding = sXMLPreprocessor + "/getResolvedBinding", sPerformanceInsertFragment = sXMLPreprocessor + "/insertFragment", sPerformanceProcess = sXMLPreprocessor + ".process", oSyncPromiseResolved = SyncPromise.resolve(), oSyncPromiseResolvedTrue = SyncPromise.resolve(true), fnToString = Object.prototype.toString, mVisitors = {}, With = ManagedObject.extend("sap.ui.core.util._with", {
    metadata: {
        library: "sap.ui.core",
        properties: {
            any: "any"
        },
        aggregations: {
            child: { multiple: false, type: "sap.ui.core.util._with" }
        }
    },
    updateProperty: function () {
        this.setAny(this.mBindingInfos.any.binding.getExternalValue());
    }
}), Repeat = With.extend("sap.ui.core.util._repeat", {
    metadata: {
        library: "sap.ui.core",
        aggregations: {
            list: { multiple: true, type: "n/a", _doesNotRequireFactory: true }
        }
    },
    updateList: function () {
    }
});
function createContextInterface(oWithControl, mSettings, i, vBindingOrContext) {
    function getBindingOrContext(iPart) {
        if (!vBindingOrContext) {
            vBindingOrContext = oWithControl.getBinding("any");
            if (vBindingOrContext instanceof CompositeBinding) {
                vBindingOrContext = vBindingOrContext.getBindings();
                if (i !== undefined) {
                    vBindingOrContext = vBindingOrContext[i];
                }
            }
        }
        return Array.isArray(vBindingOrContext) ? vBindingOrContext[iPart] : vBindingOrContext;
    }
    function getPath(oBindingOrContext) {
        return oBindingOrContext instanceof Context ? oBindingOrContext.getPath() : oBindingOrContext.getModel().resolve(oBindingOrContext.getPath(), oBindingOrContext.getContext());
    }
    return {
        getInterface: function (iPart, sPath) {
            var oBaseContext, oBindingOrContext, oModel;
            if (typeof iPart === "string") {
                sPath = iPart;
                iPart = undefined;
            }
            getBindingOrContext();
            if (Array.isArray(vBindingOrContext)) {
                if (iPart >= 0 && iPart < vBindingOrContext.length) {
                    oBindingOrContext = vBindingOrContext[iPart];
                }
                else {
                    throw new Error("Invalid index of part: " + iPart);
                }
            }
            else if (iPart !== undefined) {
                throw new Error("Not the root formatter of a composite binding");
            }
            else if (sPath) {
                oBindingOrContext = vBindingOrContext;
            }
            else {
                throw new Error("Missing path");
            }
            if (sPath) {
                oModel = oBindingOrContext.getModel();
                if (sPath.charAt(0) !== "/") {
                    oBaseContext = oBindingOrContext instanceof Context ? oBindingOrContext : oModel.createBindingContext(oBindingOrContext.getPath(), oBindingOrContext.getContext());
                }
                oBindingOrContext = oModel.createBindingContext(sPath, oBaseContext);
                if (!oBindingOrContext) {
                    throw new Error("Model could not create binding context synchronously: " + oModel);
                }
            }
            return createContextInterface(null, mSettings, undefined, oBindingOrContext);
        },
        getModel: function (iPart) {
            var oBindingOrContext = getBindingOrContext(iPart);
            return oBindingOrContext && oBindingOrContext.getModel();
        },
        getPath: function (iPart) {
            var oBindingOrContext = getBindingOrContext(iPart);
            return oBindingOrContext && getPath(oBindingOrContext);
        },
        getSetting: function (sName) {
            if (sName === "bindingContexts" || sName === "models") {
                throw new Error("Illegal argument: " + sName);
            }
            return mSettings[sName];
        }
    };
}
function getAny(oWithControl, oBindingInfo, mSettings, oScope, bAsync) {
    var bValueAsPromise = false;
    function prepare(oInfo, i) {
        var fnFormatter = oInfo.formatter, oModel, sModelName = oInfo.model;
        if (oInfo.path && oInfo.path.indexOf(">") > 0) {
            sModelName = oInfo.path.slice(0, oInfo.path.indexOf(">"));
        }
        oModel = oWithControl.getModel(sModelName);
        if (fnFormatter && fnFormatter.requiresIContext === true) {
            fnFormatter = oInfo.formatter = fnFormatter.bind(null, createContextInterface(oWithControl, mSettings, i));
        }
        if (fnFormatter && bAsync && (oModel && oModel.$$valueAsPromise || i === undefined && bValueAsPromise)) {
            oInfo.formatter = function () {
                var that = this;
                return SyncPromise.all(arguments).then(function (aArguments) {
                    return fnFormatter.apply(that, aArguments);
                });
            };
            oInfo.formatter.textFragments = fnFormatter.textFragments;
        }
        oInfo.mode = BindingMode.OneTime;
        oInfo.parameters = oInfo.parameters || {};
        oInfo.parameters.scope = oScope;
        if (bAsync && oModel && oModel.$$valueAsPromise) {
            bValueAsPromise = oInfo.parameters.$$valueAsPromise = true;
        }
    }
    try {
        if (oBindingInfo.parts) {
            oBindingInfo.parts.forEach(prepare);
        }
        prepare(oBindingInfo);
        oWithControl.bindProperty("any", oBindingInfo);
        return oWithControl.getBinding("any") ? SyncPromise.resolve(oWithControl.getAny()) : null;
    }
    catch (e) {
        return SyncPromise.reject(e);
    }
    finally {
        oWithControl.unbindProperty("any", true);
    }
}
function stopAndGo(aElements, fnCallback) {
    var i = -1;
    function next(bFound) {
        if (bFound) {
            return aElements[i];
        }
        i += 1;
        if (i < aElements.length) {
            return fnCallback(aElements[i], i, aElements).then(next);
        }
    }
    return aElements.length ? next() : oSyncPromiseResolved;
}
function serializeSingleElement(oElement) {
    var oAttribute, oAttributesList = oElement.attributes, sText = "<" + oElement.nodeName, i, n;
    for (i = 0, n = oAttributesList.length; i < n; i += 1) {
        oAttribute = oAttributesList.item(i);
        sText += " " + oAttribute.name + "=\"" + oAttribute.value + "\"";
    }
    return sText + (oElement.childNodes.length ? ">" : "/>");
}
function visitNodeWrapper(oElement, oInterface) {
    return oInterface.visitNode(oElement);
}
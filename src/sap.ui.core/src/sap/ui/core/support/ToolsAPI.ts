import library from "sap/ui/core/library";
import Global from "sap/ui/Global";
import Core from "sap/ui/core/Core";
import ElementMetadata from "sap/ui/core/ElementMetadata";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
import UriParameters from "sap/base/util/UriParameters";
import jQuery from "jquery.sap.global";
var configurationInfo = sap.ui.getCore().getConfiguration();
function _getLibraries() {
    var libraries = Global.versioninfo ? Global.versioninfo.libraries : undefined;
    var formattedLibraries = Object.create(null);
    if (libraries !== undefined) {
        libraries.forEach(function (element, index, array) {
            formattedLibraries[element.name] = element.version;
        });
    }
    return formattedLibraries;
}
function _getLoadedLibraries() {
    var libraries = sap.ui.getCore().getLoadedLibraries();
    var formattedLibraries = Object.create(null);
    Object.keys(sap.ui.getCore().getLoadedLibraries()).forEach(function (element, index, array) {
        formattedLibraries[element] = libraries[element].version;
    });
    return formattedLibraries;
}
function getURLParameters() {
    var oParams = UriParameters.fromQuery(window.location.search);
    return Array.from(oParams.keys()).reduce(function (oResult, sKey) {
        oResult[sKey] = oParams.getAll(sKey);
        return oResult;
    }, {});
}
function _getFrameworkInformation() {
    return {
        commonInformation: {
            version: Global.version,
            buildTime: Global.buildinfo.buildtime,
            lastChange: Global.buildinfo.lastchange,
            jquery: jQuery.fn.jquery,
            userAgent: navigator.userAgent,
            applicationHREF: window.location.href,
            documentTitle: document.title,
            documentMode: document.documentMode || "",
            debugMode: jQuery.sap.debug(),
            statistics: jQuery.sap.statistics()
        },
        configurationBootstrap: window["sap-ui-config"] || Object.create(null),
        configurationComputed: {
            theme: configurationInfo.getTheme(),
            language: configurationInfo.getLanguage(),
            formatLocale: configurationInfo.getFormatLocale(),
            accessibility: configurationInfo.getAccessibility(),
            animation: configurationInfo.getAnimation(),
            rtl: configurationInfo.getRTL(),
            debug: configurationInfo.getDebug(),
            inspect: configurationInfo.getInspect(),
            originInfo: configurationInfo.getOriginInfo(),
            noDuplicateIds: configurationInfo.getNoDuplicateIds()
        },
        libraries: _getLibraries(),
        loadedLibraries: _getLoadedLibraries(),
        loadedModules: LoaderExtensions.getAllRequiredModules().sort(),
        URLParameters: getURLParameters()
    };
}
var controlTree = {
    _createRenderedTreeModel: function (nodeElement, resultArray) {
        var node = nodeElement;
        var childNode = node.firstElementChild;
        var results = resultArray;
        var subResult = results;
        var control = sap.ui.getCore().byId(node.id);
        if (node.getAttribute("data-sap-ui") && control) {
            results.push({
                id: control.getId(),
                name: control.getMetadata().getName(),
                type: "sap-ui-control",
                content: []
            });
            subResult = results[results.length - 1].content;
        }
        else if (node.getAttribute("data-sap-ui-area")) {
            results.push({
                id: node.id,
                name: "sap-ui-area",
                type: "data-sap-ui",
                content: []
            });
            subResult = results[results.length - 1].content;
        }
        while (childNode) {
            this._createRenderedTreeModel(childNode, subResult);
            childNode = childNode.nextElementSibling;
        }
    }
};
var controlInformation = {
    _getOwnProperties: function (control) {
        var result = Object.create(null);
        var controlPropertiesFromMetadata = control.getMetadata().getProperties();
        result.meta = Object.create(null);
        result.meta.controlName = control.getMetadata().getName();
        result.properties = Object.create(null);
        Object.keys(controlPropertiesFromMetadata).forEach(function (key) {
            result.properties[key] = Object.create(null);
            result.properties[key].value = control.getProperty(key);
            result.properties[key].type = controlPropertiesFromMetadata[key].getType().getName ? controlPropertiesFromMetadata[key].getType().getName() : "";
        });
        return result;
    },
    _copyInheritedProperties: function (control, inheritedMetadata) {
        var inheritedMetadataProperties = inheritedMetadata.getProperties();
        var result = Object.create(null);
        result.meta = Object.create(null);
        result.meta.controlName = inheritedMetadata.getName();
        result.properties = Object.create(null);
        Object.keys(inheritedMetadataProperties).forEach(function (key) {
            result.properties[key] = Object.create(null);
            result.properties[key].value = inheritedMetadataProperties[key].get(control);
            result.properties[key].type = inheritedMetadataProperties[key].getType().getName ? inheritedMetadataProperties[key].getType().getName() : "";
        });
        return result;
    },
    _getInheritedProperties: function (control) {
        var result = [];
        var inheritedMetadata = control.getMetadata().getParent();
        while (inheritedMetadata instanceof ElementMetadata) {
            result.push(this._copyInheritedProperties(control, inheritedMetadata));
            inheritedMetadata = inheritedMetadata.getParent();
        }
        return result;
    },
    _getProperties: function (controlId) {
        var control = sap.ui.getCore().byId(controlId);
        var properties = Object.create(null);
        if (control) {
            properties.own = this._getOwnProperties(control);
            properties.inherited = this._getInheritedProperties(control);
        }
        return properties;
    },
    _getModelFromContext: function (control, controlProperty) {
        var bindingContext = control.getBinding(controlProperty);
        var bindingContextModel = bindingContext.getModel();
        var bindingInfoParts = (control.getBindingInfo(controlProperty).parts) ? control.getBindingInfo(controlProperty).parts : [];
        var modelNames = [];
        for (var i = 0; i < bindingInfoParts.length; i++) {
            modelNames.push(bindingInfoParts[i].model);
        }
        var model = {
            names: modelNames,
            path: bindingContext.getPath()
        };
        if (bindingContextModel) {
            model.mode = bindingContextModel.getDefaultBindingMode();
            model.type = bindingContextModel.getMetadata().getName();
            model.data = bindingContextModel.getData ? bindingContextModel.getData("/") : undefined;
        }
        return model;
    },
    _getBindDataForProperties: function (control) {
        var properties = control.getMetadata().getAllProperties();
        var propertiesBindingData = Object.create(null);
        for (var key in properties) {
            if (properties.hasOwnProperty(key) && control.getBinding(key)) {
                propertiesBindingData[key] = Object.create(null);
                propertiesBindingData[key].path = control.getBinding(key).getPath();
                propertiesBindingData[key].value = control.getBinding(key).getValue();
                propertiesBindingData[key].type = control.getMetadata().getProperty(key).getType().getName ? control.getMetadata().getProperty(key).getType().getName() : "";
                propertiesBindingData[key].mode = control.getBinding(key).getBindingMode();
                propertiesBindingData[key].model = this._getModelFromContext(control, key);
            }
        }
        return propertiesBindingData;
    },
    _getBindDataForAggregations: function (control) {
        var aggregations = control.getMetadata().getAllAggregations();
        var aggregationsBindingData = Object.create(null);
        for (var key in aggregations) {
            if (aggregations.hasOwnProperty(key) && control.getBinding(key)) {
                aggregationsBindingData[key] = Object.create(null);
                aggregationsBindingData[key].model = this._getModelFromContext(control, key);
            }
        }
        return aggregationsBindingData;
    }
};
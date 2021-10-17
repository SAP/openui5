import DataType from "sap/ui/base/DataType";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import library from "sap/ui/core/library";
import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import camelize from "sap/base/strings/camelize";
var ComponentLifecycle = library.ComponentLifecycle;
var ComponentContainerMetadata = ComponentContainer.getMetadata();
var ComponentSupport = function () {
};
ComponentSupport.run = function () {
    var aElements = ComponentSupport._find();
    for (var i = 0, l = aElements.length; i < l; i++) {
        var oElement = aElements[i];
        Log.debug("Parsing element " + oElement.outerHTML, "", "sap/ui/core/ComponentSupport");
        var mSettings = ComponentSupport._parse(oElement);
        ComponentSupport._applyDefaultSettings(mSettings);
        Log.debug("Creating ComponentContainer with the following settings", JSON.stringify(mSettings, 0, 2), "sap/ui/core/ComponentSupport");
        new ComponentContainer(mSettings).placeAt(oElement);
        oElement.removeAttribute("data-sap-ui-component");
    }
};
ComponentSupport._find = function () {
    return document.querySelectorAll("[data-sap-ui-component]");
};
ComponentSupport._parse = function (oElement) {
    var mSettings = {};
    for (var i = 0, l = oElement.attributes.length; i < l; i++) {
        var oAttribute = oElement.attributes[i];
        var oParsedAttributeName = /^data-((?!sap-ui-component).+)/g.exec(oAttribute.name);
        if (oParsedAttributeName) {
            var sKey = camelize(oParsedAttributeName[1]);
            var oValue = oAttribute.value;
            if (sKey !== "id") {
                var oProperty = ComponentContainerMetadata.getProperty(sKey);
                var oEvent = !oProperty && ComponentContainerMetadata.getEvent(sKey);
                if (!oProperty && !oEvent) {
                    Log.warning("Property or event \"" + sKey + "\" will be ignored as it does not exist in sap.ui.core.ComponentContainer");
                    continue;
                }
                if (oProperty) {
                    var oType = DataType.getType(oProperty.type);
                    if (!oType) {
                        throw new Error("Property \"" + oProperty.name + "\" has no known type");
                    }
                    oValue = oType.parseValue(oValue);
                }
                else if (oEvent) {
                    var fnCallback = ObjectPath.get(oValue);
                    if (typeof fnCallback !== "function") {
                        throw new Error("Callback handler for event \"" + oEvent.name + "\" not found");
                    }
                    oValue = fnCallback;
                }
            }
            mSettings[sKey] = oValue;
        }
    }
    return mSettings;
};
ComponentSupport._applyDefaultSettings = function (mSettings) {
    mSettings.async = true;
    if (mSettings.manifest === undefined || mSettings.manifest === "true") {
        mSettings.manifest = true;
    }
    else if (mSettings.manifest === "false") {
        Log.error("Ignoring \"manifest=false\" for ComponentContainer of component \"" + mSettings.name + "\" as it is not supported by ComponentSupport. " + "Forcing \"manifest=true\"", "", "sap/ui/core/ComponentSupport");
        mSettings.manifest = true;
    }
    mSettings.lifecycle = mSettings.lifecycle === undefined ? ComponentLifecycle.Container : mSettings.lifecycle;
    mSettings.autoPrefixId = mSettings.autoPrefixId === undefined ? true : mSettings.autoPrefixId;
};
ComponentSupport.run();
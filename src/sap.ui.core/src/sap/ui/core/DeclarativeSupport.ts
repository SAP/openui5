import jQuery from "sap/ui/thirdparty/jquery";
import DataType from "sap/ui/base/DataType";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "./Control";
import CustomData from "./CustomData";
import HTML from "./HTML";
import View from "./mvc/View";
import EventHandlerResolver from "./mvc/EventHandlerResolver";
import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import assert from "sap/base/assert";
import camelize from "sap/base/strings/camelize";
export class DeclarativeSupport {
    static attributes = {
        "data-sap-ui-type": true,
        "data-sap-ui-id": true,
        "data-sap-ui-aggregation": true,
        "data-sap-ui-default-aggregation": true,
        "data-sap-ui-binding": function (sValue, mSettings) {
            var oBindingInfo = ManagedObject.bindingParser(sValue);
            mSettings.objectBindings = mSettings.objectBindings || {};
            mSettings.objectBindings[oBindingInfo.model || undefined] = oBindingInfo;
        },
        "data-tooltip": function (sValue, mSettings) {
            mSettings["tooltip"] = sValue;
        },
        "tooltip": function (sValue, mSettings, fnClass) {
            mSettings["tooltip"] = sValue;
            Log.warning("[Deprecated] Control \"" + mSettings.id + "\": The attribute \"tooltip\" is not prefixed with \"data-*\". Future version of declarative support will only suppport attributes with \"data-*\" prefix.");
        },
        "class": true,
        "style": true,
        "id": true
    };
    static compile(oElement: any, oView: any, isRecursive: any) {
        var that = this;
        jQuery(oElement).find("[data-sap-ui-type]").filter(function () {
            return jQuery(this).parents("[data-sap-ui-type]").length === 0;
        }).each(function () {
            that._compile(this, oView, isRecursive);
        });
    }
    private static _compile(oElement: any, oView: any, isRecursive: any) {
        var $element = jQuery(oElement);
        var sType = $element.attr("data-sap-ui-type");
        var aControls = [];
        var bIsUIArea = sType === "sap.ui.core.UIArea";
        if (bIsUIArea) {
            var that = this;
            $element.children().each(function () {
                var oControl = that._createControl(this, oView);
                if (oControl) {
                    aControls.push(oControl);
                }
            });
        }
        else {
            var oControl = this._createControl(oElement, oView);
            if (oControl) {
                aControls.push(oControl);
            }
        }
        $element.empty();
        var aAttr = [];
        jQuery.each(oElement.attributes, function (iIndex, oAttr) {
            var sName = oAttr.name;
            if (!bIsUIArea || bIsUIArea && /^data-/g.test(sName.toLowerCase())) {
                aAttr.push(sName);
            }
        });
        if (aAttr.length > 0) {
            $element.removeAttr(aAttr.join(" "));
        }
        aControls.forEach(function (oControl) {
            if (oControl instanceof Control) {
                if (oView && !isRecursive) {
                    oView.addContent(oControl);
                }
                else {
                    oControl.placeAt(oElement);
                    if (oView) {
                        oView.connectControl(oControl);
                    }
                }
            }
        });
    }
    private static _createControl(oElement: any, oView: any) {
        var $element = jQuery(oElement);
        var oControl = null;
        var sType = $element.attr("data-sap-ui-type");
        if (sType) {
            var fnClass = sap.ui.requireSync(sType.replace(/\./g, "/"));
            fnClass = fnClass || ObjectPath.get(sType);
            assert(typeof fnClass !== "undefined", "Class not found: " + sType);
            var mSettings = {};
            mSettings.id = this._getId($element, oView);
            if (oView && oView._sProcessingMode != null && fnClass.getMetadata().hasSpecialSetting("processingMode")) {
                mSettings.processingMode = oView._sProcessingMode;
            }
            this._addSettingsForAttributes(mSettings, fnClass, oElement, oView);
            this._addSettingsForAggregations(mSettings, fnClass, oElement, oView);
            var oControl;
            if (View.prototype.isPrototypeOf(fnClass.prototype) && typeof fnClass._sType === "string") {
                oControl = View._create(mSettings, undefined, fnClass._sType);
            }
            else {
                oControl = new fnClass(mSettings);
            }
            if (oElement.className) {
                oControl.addStyleClass(oElement.className);
            }
            $element.removeAttr("data-sap-ui-type");
        }
        else {
            oControl = this._createHtmlControl(oElement, oView);
        }
        return oControl;
    }
    private static _createHtmlControl(oElement: any, oView: any) {
        var oHTML = new HTML();
        oHTML.setDOMContent(oElement);
        this.compile(oElement, oView, true);
        return oHTML;
    }
    private static _addSettingsForAttributes(mSettings: any, fnClass: any, oElement: any, oView: any) {
        var that = this;
        var oSpecialAttributes = DeclarativeSupport.attributes;
        var fnBindingParser = ManagedObject.bindingParser;
        var aCustomData = [];
        var reCustomData = /^data-custom-data:(.+)/i;
        jQuery.each(oElement.attributes, function (iIndex, oAttr) {
            var sName = oAttr.name;
            var sValue = oAttr.value;
            if (!reCustomData.test(sName)) {
                if (typeof oSpecialAttributes[sName] === "undefined") {
                    sName = that.convertAttributeToSettingName(sName, mSettings.id);
                    var oProperty = that._getProperty(fnClass, sName);
                    if (oProperty) {
                        var oBindingInfo = fnBindingParser(sValue, oView && oView.getController(), true);
                        if (oBindingInfo && typeof oBindingInfo === "object") {
                            mSettings[sName] = oBindingInfo;
                        }
                        else {
                            mSettings[sName] = that.convertValueToType(that.getPropertyDataType(oProperty), oBindingInfo || sValue);
                        }
                    }
                    else if (that._getAssociation(fnClass, sName)) {
                        var oAssociation = that._getAssociation(fnClass, sName);
                        if (oAssociation.multiple) {
                            sValue = sValue.replace(/\s*,\s*|\s+/g, ",");
                            mSettings[sName] = sValue.split(",").map(function (sId) {
                                return oView ? oView.createId(sId) : sId;
                            });
                        }
                        else {
                            mSettings[sName] = oView ? oView.createId(sValue) : sValue;
                        }
                    }
                    else if (that._getAggregation(fnClass, sName)) {
                        var oAggregation = that._getAggregation(fnClass, sName);
                        if (oAggregation.multiple) {
                            var oBindingInfo = fnBindingParser(sValue, oView && oView.getController());
                            if (oBindingInfo) {
                                mSettings[sName] = oBindingInfo;
                            }
                            else {
                                throw new Error("Aggregation " + sName + " with cardinality 0..n only allows binding paths as attribute value");
                            }
                        }
                        else if (oAggregation.altTypes) {
                            var oBindingInfo = fnBindingParser(sValue, oView && oView.getController(), true);
                            if (oBindingInfo && typeof oBindingInfo === "object") {
                                mSettings[sName] = oBindingInfo;
                            }
                            else {
                                mSettings[sName] = that.convertValueToType(oAggregation.altTypes[0], oBindingInfo || sValue);
                            }
                        }
                        else {
                            throw new Error("Aggregation " + sName + " not supported");
                        }
                    }
                    else if (that._getEvent(fnClass, sName)) {
                        var oController = oView && (oView._oContainingView || oView).getController();
                        var vHandler = EventHandlerResolver.resolveEventHandler(sValue, oController);
                        if (vHandler) {
                            mSettings[sName] = vHandler;
                        }
                        else {
                            throw new Error("Control \"" + mSettings.id + "\": The function \"" + sValue + "\" for the event \"" + sName + "\" is not defined");
                        }
                    }
                    else {
                        assert((sName === "id"), "DeclarativeSupport encountered unknown setting '" + sName + "' for class '" + fnClass.getMetadata().getName() + "' (value:'" + sValue + "')");
                    }
                }
                else if (typeof oSpecialAttributes[sName] === "function") {
                    oSpecialAttributes[sName](sValue, mSettings, fnClass);
                }
            }
            else {
                sName = camelize(reCustomData.exec(sName)[1]);
                var oBindingInfo = fnBindingParser(sValue, oView && oView.getController());
                aCustomData.push(new CustomData({
                    key: sName,
                    value: oBindingInfo || sValue
                }));
            }
        });
        if (aCustomData.length > 0) {
            mSettings.customData = aCustomData;
        }
        return mSettings;
    }
    private static _addSettingsForAggregations(mSettings: any, fnClass: any, oElement: any, oView: any) {
        var $element = jQuery(oElement);
        var sDefaultAggregation = this._getDefaultAggregation(fnClass, oElement);
        var that = this;
        var oAggregations = fnClass.getMetadata().getAllAggregations();
        $element.children().each(function () {
            var $child = jQuery(this);
            var sAggregation = $child.attr("data-sap-ui-aggregation");
            var sType = $child.attr("data-sap-ui-type");
            var bUseDefault = false;
            if (!sAggregation) {
                bUseDefault = true;
                sAggregation = sDefaultAggregation;
            }
            if (sAggregation && oAggregations[sAggregation]) {
                var bMultiple = oAggregations[sAggregation].multiple;
                var addControl = function (oChildElement) {
                    var oControl = that._createControl(oChildElement, oView);
                    if (oControl) {
                        if (bMultiple) {
                            if (!mSettings[sAggregation]) {
                                mSettings[sAggregation] = [];
                            }
                            if (typeof mSettings[sAggregation].path === "string") {
                                assert(!mSettings[sAggregation].template, "list bindings support only a single template object");
                                mSettings[sAggregation].template = oControl;
                            }
                            else {
                                mSettings[sAggregation].push(oControl);
                            }
                        }
                        else {
                            mSettings[sAggregation] = oControl;
                        }
                    }
                };
                if (bUseDefault || (sType && !bUseDefault)) {
                    addControl(this);
                }
                else {
                    $child.children().each(function () {
                        addControl(this);
                    });
                }
            }
            $child.removeAttr("data-sap-ui-aggregation");
            $child.removeAttr("data-sap-ui-type");
        });
        return mSettings;
    }
    private static _getId(oElement: any, oView: any) {
        var $element = jQuery(oElement);
        var sId = $element.attr("id");
        if (sId) {
            if (oView) {
                sId = oView.createId(sId);
                $element.attr("data-sap-ui-id", sId);
            }
            $element.attr("id", "");
        }
        return sId;
    }
    private static _getProperty(fnClass: any, sName: any) {
        return fnClass.getMetadata().getProperty(sName);
    }
    static convertValueToType(oType: any, sValue: any) {
        if (oType instanceof DataType) {
            sValue = oType.parseValue(sValue);
        }
        return typeof sValue === "string" ? ManagedObject.bindingParser.escape(sValue) : sValue;
    }
    static getPropertyDataType(oProperty: any) {
        var oType = DataType.getType(oProperty.type);
        if (!oType) {
            throw new Error("Property " + oProperty.name + " has no known type");
        }
        return oType;
    }
    static convertAttributeToSettingName(sAttribute: any, sId: any, bDeprecationWarning: any) {
        if (sAttribute.indexOf("data-") === 0) {
            sAttribute = sAttribute.substr(5);
        }
        else if (bDeprecationWarning) {
            Log.warning("[Deprecated] Control \"" + sId + "\": The attribute \"" + sAttribute + "\" is not prefixed with \"data-*\". Future version of declarative support will only suppport attributes with \"data-*\" prefix.");
        }
        else {
            throw new Error("Control \"" + sId + "\": The attribute \"" + sAttribute + "\" is not prefixed with \"data-*\".");
        }
        return camelize(sAttribute);
    }
    private static _getAssociation(fnClass: any, sName: any) {
        return fnClass.getMetadata().getAssociation(sName);
    }
    private static _getAggregation(fnClass: any, sName: any) {
        return fnClass.getMetadata().getAggregation(sName);
    }
    private static _getEvent(fnClass: any, sName: any) {
        return fnClass.getMetadata().getEvent(sName);
    }
    private static _getDefaultAggregation(fnClass: any, oElement: any) {
        var $element = jQuery(oElement);
        var sDefaultAggregation = $element.attr("data-sap-ui-default-aggregation") || fnClass.getMetadata().getDefaultAggregationName();
        $element.removeAttr("data-sap-ui-default-aggregation");
        return sDefaultAggregation;
    }
}
import BaseTreeModifier from "./BaseTreeModifier";
import ManagedObject from "sap/ui/base/ManagedObject";
import DataType from "sap/ui/base/DataType";
import merge from "sap/base/util/merge";
import XMLHelper from "sap/ui/util/XMLHelper";
import EventHandlerResolver from "sap/ui/core/mvc/EventHandlerResolver";
import includes from "sap/base/util/includes";
import ObjectPath from "sap/base/util/ObjectPath";
import isPlainObject from "sap/base/util/isPlainObject";
import Fragment from "sap/ui/core/Fragment";
var CUSTOM_DATA_NS = "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1";
var XmlTreeModifier = merge({}, BaseTreeModifier, {
    targets: "xmlTree",
    setVisible: function (oControl, bVisible) {
        if (bVisible) {
            oControl.removeAttribute("visible");
        }
        else {
            oControl.setAttribute("visible", bVisible);
        }
    },
    getVisible: function (oControl) {
        return XmlTreeModifier.getProperty(oControl, "visible");
    },
    setStashed: function (oControl, bStashed) {
        if (!bStashed) {
            oControl.removeAttribute("stashed");
        }
        else {
            oControl.setAttribute("stashed", bStashed);
        }
        XmlTreeModifier.setVisible(oControl, !bStashed);
    },
    getStashed: function (oControl) {
        return Promise.all([
            XmlTreeModifier.getProperty(oControl, "stashed"),
            XmlTreeModifier.getProperty(oControl, "visible")
        ]).then(function (aProperties) {
            return !!aProperties[0] || !aProperties[1];
        });
    },
    bindProperty: function (oControl, sPropertyName, vBindingInfos) {
        oControl.setAttribute(sPropertyName, "{" + vBindingInfos + "}");
    },
    unbindProperty: function (oControl, sPropertyName) {
        oControl.removeAttribute(sPropertyName);
    },
    _setProperty: function (oControl, sPropertyName, vPropertyValue, bEscapeBindingStrings) {
        var sValue = XmlTreeModifier._getSerializedValue(vPropertyValue);
        if (bEscapeBindingStrings) {
            sValue = XmlTreeModifier._escapeCurlyBracketsInString(sValue);
        }
        oControl.setAttribute(sPropertyName, sValue);
    },
    setProperty: function (oControl, sPropertyName, vPropertyValue) {
        XmlTreeModifier._setProperty(oControl, sPropertyName, vPropertyValue, true);
    },
    getProperty: function (oControl, sPropertyName) {
        var oPropertyInfo;
        var oType;
        var vPropertyValue = oControl.getAttribute(sPropertyName);
        return XmlTreeModifier.getControlMetadata(oControl).then(function (oMetadata) {
            oPropertyInfo = oMetadata.getProperty(sPropertyName);
            if (oPropertyInfo) {
                oType = oPropertyInfo.getType();
                if (sPropertyName === "value" && XmlTreeModifier.getControlType(oControl) === "sap.ui.core.CustomData") {
                    return XmlTreeModifier.getProperty(oControl, "key").then(function (oKeyProperty) {
                        if (oKeyProperty === "sap-ui-custom-settings") {
                            oType = DataType.getType("object");
                        }
                    });
                }
            }
            return undefined;
        }).then(function () {
            if (oPropertyInfo) {
                if (vPropertyValue === null) {
                    vPropertyValue = oPropertyInfo.getDefaultValue() || oType.getDefaultValue();
                }
                else {
                    var vUnescaped = ManagedObject.bindingParser(vPropertyValue, undefined, true);
                    if (isPlainObject(vUnescaped)) {
                        if (vUnescaped.path || vUnescaped.parts) {
                            vPropertyValue = undefined;
                        }
                        else {
                            vPropertyValue = vUnescaped;
                        }
                    }
                    else {
                        vPropertyValue = oType.parseValue(vUnescaped || vPropertyValue);
                    }
                }
            }
            return vPropertyValue;
        });
    },
    isPropertyInitial: function (oControl, sPropertyName) {
        var vPropertyValue = oControl.getAttribute(sPropertyName);
        return (vPropertyValue == null);
    },
    setPropertyBinding: function (oControl, sPropertyName, sPropertyBinding) {
        if (typeof sPropertyBinding !== "string") {
            throw new Error("For XML, only strings are supported to be set as property binding.");
        }
        oControl.setAttribute(sPropertyName, sPropertyBinding);
    },
    getPropertyBinding: function (oControl, sPropertyName) {
        var vPropertyValue = oControl.getAttribute(sPropertyName);
        if (vPropertyValue) {
            var vUnescaped = ManagedObject.bindingParser(vPropertyValue, undefined, true);
            if (vUnescaped && (vUnescaped.path || vUnescaped.parts)) {
                return vUnescaped;
            }
        }
        return undefined;
    },
    createAndAddCustomData: function (oControl, sCustomDataKey, sValue) {
        oControl.setAttributeNS(CUSTOM_DATA_NS, "custom.data.via.modifier:" + sCustomDataKey, XmlTreeModifier._escapeCurlyBracketsInString(sValue));
        return Promise.resolve();
    },
    createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings, bAsync) {
        var sId, sLocalName, oError;
        if (!XmlTreeModifier.bySelector(oSelector, oAppComponent, oView)) {
            var aClassNameParts = sClassName.split(".");
            var sNamespaceURI = "";
            if (aClassNameParts.length > 1) {
                sLocalName = aClassNameParts.pop();
                sNamespaceURI = aClassNameParts.join(".");
            }
            var oNewElementNode = oView.ownerDocument.createElementNS(sNamespaceURI, sLocalName);
            sId = XmlTreeModifier.getControlIdBySelector(oSelector, oAppComponent);
            if (sId) {
                oNewElementNode.setAttribute("id", sId);
            }
            return Promise.resolve().then(function () {
                if (mSettings) {
                    return XmlTreeModifier.applySettings(oNewElementNode, mSettings);
                }
                return undefined;
            }).then(function () {
                return Promise.resolve(oNewElementNode);
            });
        }
        else {
            oError = new Error("Can't create a control with duplicated ID " + sId);
            return Promise.reject(oError);
        }
    },
    applySettings: function (oControl, mSettings) {
        return XmlTreeModifier.getControlMetadata(oControl).then(function (oMetadata) {
            var mMetadata = oMetadata.getJSONKeys();
            Object.keys(mSettings).forEach(function (sKey) {
                var oKeyInfo = mMetadata[sKey];
                var vValue = mSettings[sKey];
                switch (oKeyInfo._iKind) {
                    case 0:
                        XmlTreeModifier._setProperty(oControl, sKey, vValue, false);
                        break;
                    case 3:
                        XmlTreeModifier.setAssociation(oControl, sKey, vValue);
                        break;
                    default: throw new Error("Unsupported in applySettings on XMLTreeModifier: " + sKey);
                }
            });
        });
    },
    _byId: function (sId, oView) {
        if (oView) {
            if (oView.ownerDocument && oView.ownerDocument.getElementById && oView.ownerDocument.getElementById(sId)) {
                return oView.ownerDocument.getElementById(sId);
            }
            return oView.querySelector("[id='" + sId + "']");
        }
        return undefined;
    },
    getId: function (oControl) {
        return oControl.getAttribute("id");
    },
    getParent: function (oControl) {
        var oParent = oControl.parentNode;
        if (!XmlTreeModifier.getId(oParent) && !XmlTreeModifier._isExtensionPoint(oParent)) {
            oParent = oParent.parentNode;
        }
        return oParent;
    },
    _getLocalName: function (xmlElement) {
        return xmlElement.localName || xmlElement.baseName || xmlElement.nodeName;
    },
    getControlType: function (oControl) {
        return XmlTreeModifier._getControlTypeInXml(oControl);
    },
    setAssociation: function (vParent, sName, sId) {
        if (typeof sId !== "string") {
            sId = XmlTreeModifier.getId(sId);
        }
        vParent.setAttribute(sName, sId);
    },
    getAssociation: function (vParent, sName) {
        return vParent.getAttribute(sName);
    },
    getAllAggregations: function (oControl) {
        return XmlTreeModifier.getControlMetadata(oControl).then(function (oControlMetadata) {
            return oControlMetadata.getAllAggregations();
        });
    },
    getAggregation: function (oParent, sName) {
        var aChildren = [];
        var bSingleValueAggregation;
        return XmlTreeModifier._isSingleValueAggregation(oParent, sName).then(function (bSingleValueAggregationReturn) {
            bSingleValueAggregation = bSingleValueAggregationReturn;
            return XmlTreeModifier._findAggregationNode(oParent, sName);
        }).then(function (oAggregationNode) {
            if (oAggregationNode) {
                return XmlTreeModifier._getControlsInAggregation(oParent, oAggregationNode).then(function (aChildrenLocal) {
                    aChildren = aChildrenLocal;
                });
            }
            return XmlTreeModifier._isAltTypeAggregation(oParent, sName).then(function (isAltTypeAggregation) {
                if (isAltTypeAggregation && bSingleValueAggregation) {
                    return XmlTreeModifier.getProperty(oParent, sName).then(function (oChild) {
                        aChildren.push(oChild);
                    });
                }
                return undefined;
            });
        }).then(function () {
            if (sName === "customData") {
                var mCustomSettings;
                var aNewCustomData = Array.prototype.slice.call(oParent.attributes).reduce(function (aNamespacedCustomData, oAttribute) {
                    var sLocalName = XmlTreeModifier._getLocalName(oAttribute);
                    if (oAttribute.namespaceURI === CUSTOM_DATA_NS) {
                        var oNewCustomData = oParent.ownerDocument.createElementNS("sap.ui.core", "CustomData");
                        oNewCustomData.setAttribute("key", sLocalName);
                        oNewCustomData.setAttribute("value", oAttribute.value);
                        aNamespacedCustomData.push(oNewCustomData);
                    }
                    else if (oAttribute.namespaceURI && oAttribute.name.indexOf("xmlns:") !== 0) {
                        if (!mCustomSettings) {
                            mCustomSettings = {};
                        }
                        if (!mCustomSettings.hasOwnProperty(oAttribute.namespaceURI)) {
                            mCustomSettings[oAttribute.namespaceURI] = {};
                        }
                        mCustomSettings[oAttribute.namespaceURI][sLocalName] = oAttribute.nodeValue;
                    }
                    return aNamespacedCustomData;
                }, []);
                aChildren = aChildren.concat(aNewCustomData);
                if (mCustomSettings) {
                    var oNewCustomData = oParent.ownerDocument.createElementNS("sap.ui.core", "CustomData");
                    oNewCustomData.setAttribute("key", "sap-ui-custom-settings");
                    XmlTreeModifier.setProperty(oNewCustomData, "value", mCustomSettings);
                    aChildren.push(oNewCustomData);
                }
            }
            return bSingleValueAggregation ? aChildren[0] : aChildren;
        });
    },
    insertAggregation: function (oParent, sName, oObject, iIndex, oView, bSkipAdjustIndex) {
        return XmlTreeModifier._findAggregationNode(oParent, sName).then(function (oAggregationNode) {
            if (!oAggregationNode) {
                var sNamespaceURI = oParent.namespaceURI;
                return XmlTreeModifier.createControl(sNamespaceURI + "." + sName, undefined, oView).then(function (oAggregationNode) {
                    oParent.appendChild(oAggregationNode);
                    return oAggregationNode;
                });
            }
            return oAggregationNode;
        }).then(function (oAggregationNode) {
            if (!bSkipAdjustIndex) {
                var aChildren = oAggregationNode.children;
                var iOffset = 0;
                var iStopIndex = (iIndex < aChildren.length) ? iIndex : aChildren.length;
                for (var i = 0; i < iStopIndex; i++) {
                    if (aChildren[i].namespaceURI === "sap.ui.core" && aChildren[i].tagName.indexOf("ExtensionPoint") > -1) {
                        iOffset = iOffset + 1 - aChildren[i].children.length;
                    }
                }
                iIndex = iIndex + iOffset;
            }
            if (iIndex >= oAggregationNode.childElementCount) {
                oAggregationNode.appendChild(oObject);
            }
            else {
                return XmlTreeModifier._getControlsInAggregation(oParent, oAggregationNode).then(function (aReferenceNodes) {
                    oAggregationNode.insertBefore(oObject, aReferenceNodes[iIndex]);
                });
            }
            return undefined;
        });
    },
    removeAggregation: function (oParent, sName, oObject) {
        return XmlTreeModifier._findAggregationNode(oParent, sName).then(function (oAggregationNode) {
            oAggregationNode.removeChild(oObject);
        });
    },
    removeAllAggregation: function (oControl, sName) {
        return XmlTreeModifier._findAggregationNode(oControl, sName).then(function (oAggregationNode) {
            if (oControl === oAggregationNode) {
                return XmlTreeModifier._getControlsInAggregation(oControl, oControl).then(function (aChildControls) {
                    aChildControls.forEach(function (oChildControl) {
                        oControl.removeChild(oChildControl);
                    });
                });
            }
            return oControl.removeChild(oAggregationNode);
        });
    },
    _findAggregationNode: function (oParent, sName) {
        var oAggregationNode;
        var aChildren = XmlTreeModifier._children(oParent);
        for (var i = 0; i < aChildren.length; i++) {
            var oNode = aChildren[i];
            if (oNode.localName === sName) {
                oAggregationNode = oNode;
                break;
            }
        }
        var oPromise = Promise.resolve(oAggregationNode);
        if (!oAggregationNode) {
            oPromise = oPromise.then(XmlTreeModifier._isDefaultAggregation.bind(XmlTreeModifier, oParent, sName)).then(function (bIsDefaultAggregation) {
                if (bIsDefaultAggregation) {
                    return oParent;
                }
                return oAggregationNode;
            });
        }
        return oPromise;
    },
    _isDefaultAggregation: function (oParent, sAggregationName) {
        return XmlTreeModifier.getControlMetadata(oParent).then(function (oControlMetadata) {
            var oDefaultAggregation = oControlMetadata.getDefaultAggregation();
            return oDefaultAggregation && sAggregationName === oDefaultAggregation.name;
        });
    },
    _isNotNamedAggregationNode: function (oParent, oChildNode) {
        return XmlTreeModifier.getAllAggregations(oParent).then(function (mAllAggregatiosnMetadata) {
            var oAggregation = mAllAggregatiosnMetadata[oChildNode.localName];
            return oParent.namespaceURI !== oChildNode.namespaceURI || !oAggregation;
        });
    },
    _isSingleValueAggregation: function (oParent, sAggregationName) {
        return XmlTreeModifier.getAllAggregations(oParent).then(function (mAllAggregatiosnMetadata) {
            var oAggregationMetadata = mAllAggregatiosnMetadata[sAggregationName];
            return !oAggregationMetadata.multiple;
        });
    },
    _isAltTypeAggregation: function (oParent, sAggregationName) {
        return XmlTreeModifier.getControlMetadata(oParent).then(function (oControlMetadata) {
            return oControlMetadata.getAllAggregations()[sAggregationName];
        }).then(function (oAggregationMetadata) {
            return !!oAggregationMetadata.altTypes;
        });
    },
    _isExtensionPoint: function (oControl) {
        return XmlTreeModifier._getControlTypeInXml(oControl) === "sap.ui.core.ExtensionPoint";
    },
    getControlMetadata: function (oControl) {
        return XmlTreeModifier._getControlMetadataInXml(oControl);
    },
    _getControlsInAggregation: function (oParent, oAggregationNode) {
        var aChildren = Array.prototype.slice.call(XmlTreeModifier._children(oAggregationNode));
        return Promise.all(aChildren.map(function (oChild) {
            return XmlTreeModifier._isNotNamedAggregationNode(oParent, oChild).then(function (bIsNotNamedAggregationNode) {
                return bIsNotNamedAggregationNode ? oChild : undefined;
            });
        })).then(function (aChildren) {
            return aChildren.filter(function (oChild) { return !!oChild; });
        });
    },
    _children: function (oParent) {
        if (oParent.children) {
            return oParent.children;
        }
        else {
            var aChildren = [];
            for (var i = 0; i < oParent.childNodes.length; i++) {
                var oNode = oParent.childNodes[i];
                if (oNode.nodeType === oNode.ELEMENT_NODE) {
                    aChildren.push(oNode);
                }
            }
            return aChildren;
        }
    },
    getBindingTemplate: function (oControl, sAggregationName) {
        return XmlTreeModifier._findAggregationNode(oControl, sAggregationName).then(function (oAggregationNode) {
            if (oAggregationNode) {
                var aChildren = XmlTreeModifier._children(oAggregationNode);
                if (aChildren.length === 1) {
                    return aChildren[0];
                }
            }
            return undefined;
        });
    },
    updateAggregation: function (oControl, sAggregationName) {
    },
    findIndexInParentAggregation: function (oControl) {
        var oParent = XmlTreeModifier.getParent(oControl);
        if (!oParent) {
            return Promise.resolve(-1);
        }
        return XmlTreeModifier.getParentAggregationName(oControl, oParent).then(function (sAggregationName) {
            return XmlTreeModifier.getAggregation(oParent, sAggregationName);
        }).then(function (aControlsInAggregation) {
            if (Array.isArray(aControlsInAggregation)) {
                var aPromises = aControlsInAggregation.map(function (oControl) {
                    return Promise.resolve().then(function () {
                        if (XmlTreeModifier._isExtensionPoint(oControl)) {
                            return oControl;
                        }
                        return XmlTreeModifier.getProperty(oControl, "stashed").then(function (oProperty) {
                            return !oProperty ? oControl : undefined;
                        });
                    });
                });
                return Promise.all(aPromises).then(function (aControlsInAggregation) {
                    return aControlsInAggregation.filter(function (oControl) {
                        return !!oControl;
                    }).indexOf(oControl);
                });
            }
            else {
                return 0;
            }
        });
    },
    getParentAggregationName: function (oControl, oParent) {
        return Promise.resolve().then(function () {
            if (!oParent.isSameNode(oControl.parentNode)) {
                return false;
            }
            else {
                return XmlTreeModifier._isNotNamedAggregationNode(oParent, oControl);
            }
        }).then(function (bNotNamedAggregation) {
            if (bNotNamedAggregation) {
                return XmlTreeModifier.getControlMetadata(oParent).then(function (oMetadata) {
                    return oMetadata.getDefaultAggregationName();
                });
            }
            else {
                return XmlTreeModifier._getLocalName(oControl.parentNode);
            }
        });
    },
    findAggregation: function (oControl, sAggregationName) {
        return XmlTreeModifier.getControlMetadata(oControl).then(function (oMetadata) {
            return oMetadata.getAllAggregations();
        }).then(function (oAggregations) {
            if (oAggregations) {
                return oAggregations[sAggregationName];
            }
            return undefined;
        });
    },
    validateType: function (oControl, mAggregationMetadata, oParent, sFragment, iIndex) {
        var sTypeOrInterface = mAggregationMetadata.type;
        return XmlTreeModifier.getAggregation(oParent, mAggregationMetadata.name).then(function (oAggregation) {
            if (mAggregationMetadata.multiple === false && oAggregation && oAggregation.length > 0) {
                return false;
            }
            return Fragment.load({
                definition: sFragment
            });
        }).then(function (aControls) {
            if (!Array.isArray(aControls)) {
                aControls = [aControls];
            }
            var bReturn = aControls[iIndex].isA(sTypeOrInterface);
            aControls.forEach(function (oFragmentControl) {
                oFragmentControl.destroy();
            });
            return bReturn;
        });
    },
    instantiateFragment: function (sFragment, sNamespace, oView) {
        var oFragment = XMLHelper.parse(sFragment);
        return XmlTreeModifier._checkAndPrefixIdsInFragment(oFragment, sNamespace).then(function (oFragment) {
            var aControls;
            if (oFragment.localName === "FragmentDefinition") {
                aControls = XmlTreeModifier._getElementNodeChildren(oFragment);
            }
            else {
                aControls = [oFragment];
            }
            aControls.forEach(function (oNode) {
                if (XmlTreeModifier._byId(oNode.getAttribute("id"), oView)) {
                    throw Error("The following ID is already in the view: " + oNode.getAttribute("id"));
                }
            });
            return aControls;
        });
    },
    templateControlFragment: function (sFragmentName, mPreprocessorSettings) {
        return BaseTreeModifier._templateFragment(sFragmentName, mPreprocessorSettings).then(function (oFragment) {
            return XmlTreeModifier._children(oFragment);
        });
    },
    destroy: function (oControl) {
        var oParent = oControl.parentNode;
        if (oParent) {
            oParent.removeChild(oControl);
        }
    },
    _getFlexCustomData: function (oControl, sType) {
        if (!oControl) {
            return undefined;
        }
        return oControl.getAttributeNS("sap.ui.fl", sType);
    },
    attachEvent: function (oNode, sEventName, sFunctionPath, vData) {
        if (typeof ObjectPath.get(sFunctionPath) !== "function") {
            return Promise.reject(new Error("Can't attach event because the event handler function is not found or not a function."));
        }
        return XmlTreeModifier.getProperty(oNode, sEventName).then(function (sValue) {
            sValue = sValue || "";
            var aEventHandlers = EventHandlerResolver.parse(sValue);
            var sEventHandler = sFunctionPath;
            var aParams = ["$event"];
            if (vData) {
                aParams.push(JSON.stringify(vData));
            }
            sEventHandler += "(" + aParams.join(",") + ")";
            if (!includes(aEventHandlers, sEventHandler)) {
                aEventHandlers.push(sEventHandler);
            }
            oNode.setAttribute(sEventName, aEventHandlers.join(";"));
        });
    },
    detachEvent: function (oNode, sEventName, sFunctionPath) {
        if (typeof ObjectPath.get(sFunctionPath) !== "function") {
            return Promise.reject(new Error("Can't attach event because the event handler function is not found or not a function."));
        }
        return XmlTreeModifier.getProperty(oNode, sEventName).then(function (sValue) {
            sValue = sValue || "";
            var aEventHandlers = EventHandlerResolver.parse(sValue);
            var iEventHandlerIndex = aEventHandlers.findIndex(function (sEventHandler) {
                return sEventHandler.includes(sFunctionPath);
            });
            if (iEventHandlerIndex > -1) {
                aEventHandlers.splice(iEventHandlerIndex, 1);
            }
            if (aEventHandlers.length) {
                oNode.setAttribute(sEventName, aEventHandlers.join(";"));
            }
            else {
                oNode.removeAttribute(sEventName);
            }
        });
    },
    bindAggregation: function (oNode, sAggregationName, vBindingInfos, oView) {
        return Promise.resolve().then(function () {
            XmlTreeModifier.bindProperty(oNode, sAggregationName, vBindingInfos.path);
            return XmlTreeModifier.insertAggregation(oNode, sAggregationName, vBindingInfos.template, 0, oView);
        });
    },
    unbindAggregation: function (oNode, sAggregationName) {
        return Promise.resolve().then(function () {
            if (oNode.hasAttribute(sAggregationName)) {
                oNode.removeAttribute(sAggregationName);
                return XmlTreeModifier.removeAllAggregation(oNode, sAggregationName);
            }
            return undefined;
        });
    },
    getExtensionPointInfo: function (sExtensionPointName, oView) {
        return Promise.resolve().then(function () {
            if (oView && sExtensionPointName) {
                var aExtensionPoints = Array.prototype.slice.call(oView.getElementsByTagNameNS("sap.ui.core", "ExtensionPoint"));
                var aFilteredExtensionPoints = aExtensionPoints.filter(function (oExtPoint) {
                    return oExtPoint.getAttribute("name") === sExtensionPointName;
                });
                var oExtensionPoint = (aFilteredExtensionPoints.length === 1) ? aFilteredExtensionPoints[0] : undefined;
                if (oExtensionPoint) {
                    var oParent = XmlTreeModifier.getParent(oExtensionPoint);
                    return Promise.all([
                        XmlTreeModifier.getParentAggregationName(oExtensionPoint, oParent),
                        XmlTreeModifier.findIndexInParentAggregation(oExtensionPoint)
                    ]).then(function (aProperties) {
                        var oExtensionPointInfo = {
                            parent: oParent,
                            aggregationName: aProperties[0],
                            index: aProperties[1] + 1,
                            defaultContent: Array.prototype.slice.call(XmlTreeModifier._children(oExtensionPoint))
                        };
                        return oExtensionPointInfo;
                    });
                }
            }
            return undefined;
        });
    }
});
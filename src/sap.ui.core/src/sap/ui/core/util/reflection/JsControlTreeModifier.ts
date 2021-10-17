import BindingParser from "sap/ui/base/BindingParser";
import BaseTreeModifier from "./BaseTreeModifier";
import XmlTreeModifier from "./XmlTreeModifier";
import ObjectPath from "sap/base/util/ObjectPath";
import XMLHelper from "sap/ui/util/XMLHelper";
import merge from "sap/base/util/merge";
import Fragment from "sap/ui/core/Fragment";
var JsControlTreeModifier = {
    targets: "jsControlTree",
    setVisible: function (oControl, bVisible) {
        if (oControl.setVisible) {
            this.unbindProperty(oControl, "visible");
            oControl.setVisible(bVisible);
        }
        else {
            throw new Error("Provided control instance has no setVisible method");
        }
    },
    getVisible: function (oControl) {
        if (oControl.getVisible) {
            return Promise.resolve(oControl.getVisible());
        }
        else {
            return Promise.reject(new Error("Provided control instance has no getVisible method"));
        }
    },
    setStashed: function (oControl, bStashed) {
        bStashed = !!bStashed;
        if (oControl.unstash) {
            if (oControl.isStashed() === true && bStashed === false) {
                oControl = oControl.unstash();
            }
            if (oControl.setVisible) {
                this.setVisible(oControl, !bStashed);
            }
            return oControl;
        }
        else {
            throw new Error("Provided control instance has no unstash method");
        }
    },
    getStashed: function (oControl) {
        if (oControl.isStashed) {
            if (oControl.isStashed()) {
                return Promise.resolve(true);
            }
            return this.getVisible(oControl).then(function (bIsVisible) {
                return !bIsVisible;
            });
        }
        return Promise.reject(new Error("Provided control instance has no isStashed method"));
    },
    bindProperty: function (oControl, sPropertyName, vBindingInfos) {
        oControl.bindProperty(sPropertyName, vBindingInfos);
    },
    unbindProperty: function (oControl, sPropertyName) {
        if (oControl) {
            oControl.unbindProperty(sPropertyName, true);
        }
    },
    setProperty: function (oControl, sPropertyName, vPropertyValue) {
        var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
        var oBindingParserResult;
        var bError;
        this.unbindProperty(oControl, sPropertyName);
        try {
            oBindingParserResult = BindingParser.complexParser(vPropertyValue, undefined, true);
        }
        catch (error) {
            bError = true;
        }
        if (oMetadata) {
            if (this._isSerializable(vPropertyValue)) {
                if (oBindingParserResult && typeof oBindingParserResult === "object" || bError) {
                    vPropertyValue = this._escapeCurlyBracketsInString(vPropertyValue);
                }
                var sPropertySetter = oMetadata._sMutator;
                oControl[sPropertySetter](vPropertyValue);
            }
            else {
                throw new TypeError("Value cannot be stringified", "sap.ui.core.util.reflection.JsControlTreeModifier");
            }
        }
    },
    getProperty: function (oControl, sPropertyName) {
        var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
        var oProperty;
        if (oMetadata) {
            var sPropertyGetter = oMetadata._sGetter;
            oProperty = oControl[sPropertyGetter]();
        }
        return Promise.resolve(oProperty);
    },
    isPropertyInitial: function (oControl, sPropertyName) {
        return oControl.isPropertyInitial(sPropertyName);
    },
    setPropertyBinding: function (oControl, sPropertyName, oPropertyBinding) {
        this.unbindProperty(oControl, sPropertyName);
        var mSettings = {};
        mSettings[sPropertyName] = oPropertyBinding;
        return oControl.applySettings(mSettings);
    },
    getPropertyBinding: function (oControl, sPropertyName) {
        return oControl.getBindingInfo(sPropertyName);
    },
    createAndAddCustomData: function (oControl, sCustomDataKey, sValue, oAppComponent) {
        return this.createControl("sap.ui.core.CustomData", oAppComponent).then(function (oCustomData) {
            this.setProperty(oCustomData, "key", sCustomDataKey);
            this.setProperty(oCustomData, "value", sValue);
            return this.insertAggregation(oControl, "customData", oCustomData, 0);
        }.bind(this));
    },
    createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings) {
        return new Promise(function (fnResolve, fnReject) {
            if (this.bySelector(oSelector, oAppComponent)) {
                var sErrorMessage = "Can't create a control with duplicated ID " + (oSelector.id || oSelector);
                fnReject(sErrorMessage);
                return;
            }
            sap.ui.require([sClassName.replace(/\./g, "/")], function (ClassObject) {
                var sId = this.getControlIdBySelector(oSelector, oAppComponent);
                fnResolve(new ClassObject(sId, mSettings));
            }.bind(this), function () {
                fnReject(new Error("Required control '" + sClassName + "' couldn't be created asynchronously"));
            });
        }.bind(this));
    },
    applySettings: function (oControl, mSettings) {
        return Promise.resolve(oControl.applySettings(mSettings));
    },
    _byId: function (sId) {
        return sap.ui.getCore().byId(sId);
    },
    getId: function (oControl) {
        return oControl.getId();
    },
    getParent: function (oControl) {
        return oControl.getParent && oControl.getParent();
    },
    getControlMetadata: function (oControl) {
        return Promise.resolve(oControl && oControl.getMetadata());
    },
    getControlType: function (oControl) {
        return oControl && oControl.getMetadata().getName();
    },
    setAssociation: function (vParent, sName, sId) {
        var oMetadata = vParent.getMetadata().getAssociation(sName);
        oMetadata.set(vParent, sId);
    },
    getAssociation: function (vParent, sName) {
        var oMetadata = vParent.getMetadata().getAssociation(sName);
        return oMetadata.get(vParent);
    },
    getAllAggregations: function (oParent) {
        return Promise.resolve(oParent.getMetadata().getAllAggregations());
    },
    getAggregation: function (oParent, sName) {
        return this.findAggregation(oParent, sName).then(function (oAggregation) {
            if (oAggregation) {
                return oParent[oAggregation._sGetter]();
            }
            return undefined;
        });
    },
    insertAggregation: function (oParent, sName, oObject, iIndex) {
        if (sName === "customData") {
            return oParent.insertAggregation(sName, oObject, iIndex, true);
        }
        return this.findAggregation(oParent, sName).then(function (oAggregation) {
            if (oAggregation) {
                if (oAggregation.multiple) {
                    var iInsertIndex = iIndex || 0;
                    oParent[oAggregation._sInsertMutator](oObject, iInsertIndex);
                }
                else {
                    oParent[oAggregation._sMutator](oObject);
                }
            }
        });
    },
    removeAggregation: function (oControl, sName, oObject) {
        if (sName === "customData") {
            oControl.removeAggregation(sName, oObject, true);
            return Promise.resolve();
        }
        return this.findAggregation(oControl, sName).then(function (oAggregation) {
            if (oAggregation) {
                oControl[oAggregation._sRemoveMutator](oObject);
            }
        });
    },
    removeAllAggregation: function (oControl, sName) {
        if (sName === "customData") {
            oControl.removeAllAggregation(sName, true);
            return Promise.resolve();
        }
        return this.findAggregation(oControl, sName).then(function (oAggregation) {
            if (oAggregation) {
                oControl[oAggregation._sRemoveAllMutator]();
            }
        });
    },
    getBindingTemplate: function (oControl, sAggregationName) {
        var oBinding = oControl.getBindingInfo(sAggregationName);
        return Promise.resolve(oBinding && oBinding.template);
    },
    updateAggregation: function (oControl, sAggregationName) {
        return this.findAggregation(oControl, sAggregationName).then(function (oAggregation) {
            if (oAggregation && oControl.getBinding(sAggregationName)) {
                oControl[oAggregation._sDestructor]();
                oControl.updateAggregation(sAggregationName);
            }
        });
    },
    findIndexInParentAggregation: function (oControl) {
        var oParent = this.getParent(oControl);
        if (!oParent) {
            return Promise.resolve(-1);
        }
        return this.getParentAggregationName(oControl).then(function (sParentAggregationName) {
            return this.getAggregation(oParent, sParentAggregationName);
        }.bind(this)).then(function (aControlsInAggregation) {
            if (Array.isArray(aControlsInAggregation)) {
                return aControlsInAggregation.indexOf(oControl);
            }
            else {
                return 0;
            }
        });
    },
    getParentAggregationName: function (oControl) {
        return Promise.resolve(oControl.sParentAggregationName);
    },
    findAggregation: function (oControl, sAggregationName) {
        return new Promise(function (resolve, reject) {
            if (oControl) {
                if (oControl.getMetadata) {
                    var oMetadata = oControl.getMetadata();
                    var oAggregations = oMetadata.getAllAggregations();
                    if (oAggregations) {
                        resolve(oAggregations[sAggregationName]);
                        return;
                    }
                }
            }
            resolve();
        });
    },
    validateType: function (oControl, oAggregationMetadata, oParent, sFragment) {
        var sTypeOrInterface = oAggregationMetadata.type;
        return this.getAggregation(oParent, oAggregationMetadata.name).then(function (oAggregation) {
            if (oAggregationMetadata.multiple === false && oAggregation && oAggregation.length > 0) {
                return false;
            }
            return oControl.isA(sTypeOrInterface);
        });
    },
    instantiateFragment: function (sFragment, sNamespace, oView) {
        var oFragment = XMLHelper.parse(sFragment);
        return this._checkAndPrefixIdsInFragment(oFragment, sNamespace).then(function (oFragment) {
            return Fragment.load({
                definition: oFragment,
                sId: oView && oView.getId(),
                controller: oView.getController()
            });
        }).then(function (aNewControls) {
            if (!Array.isArray(aNewControls)) {
                aNewControls = [aNewControls];
            }
            return aNewControls;
        });
    },
    templateControlFragment: function (sFragmentName, mPreprocessorSettings, oView) {
        return BaseTreeModifier._templateFragment(sFragmentName, mPreprocessorSettings).then(function (oFragment) {
            var oController = (oView && oView.getController()) || undefined;
            return Fragment.load({
                definition: oFragment,
                controller: oController
            });
        });
    },
    destroy: function (oControl, bSuppressInvalidate) {
        oControl.destroy(bSuppressInvalidate);
    },
    _getFlexCustomData: function (oControl, sType) {
        var oCustomData = typeof oControl === "object" && typeof oControl.data === "function" && oControl.data("sap-ui-custom-settings");
        return ObjectPath.get(["sap.ui.fl", sType], oCustomData);
    },
    attachEvent: function (oObject, sEventName, sFunctionPath, vData) {
        return new Promise(function (fnResolve, fnReject) {
            var fnCallback = ObjectPath.get(sFunctionPath);
            if (typeof fnCallback !== "function") {
                fnReject(new Error("Can't attach event because the event handler function is not found or not a function."));
            }
            fnResolve(oObject.attachEvent(sEventName, vData, fnCallback));
        });
    },
    detachEvent: function (oObject, sEventName, sFunctionPath) {
        return new Promise(function (fnResolve, fnReject) {
            var fnCallback = ObjectPath.get(sFunctionPath);
            if (typeof fnCallback !== "function") {
                fnReject(new Error("Can't attach event because the event handler function is not found or not a function."));
            }
            fnResolve(oObject.detachEvent(sEventName, fnCallback));
        });
    },
    bindAggregation: function (oControl, sAggregationName, oBindingInfo) {
        return Promise.resolve(oControl.bindAggregation(sAggregationName, oBindingInfo));
    },
    unbindAggregation: function (oControl, sAggregationName) {
        return Promise.resolve(oControl.unbindAggregation(sAggregationName));
    },
    getExtensionPointInfo: function (sExtensionPointName, oView) {
        var oViewNode = (oView._xContent) ? oView._xContent : oView;
        return XmlTreeModifier.getExtensionPointInfo(sExtensionPointName, oViewNode).then(function (oExtensionPointInfo) {
            if (oExtensionPointInfo) {
                oExtensionPointInfo.index--;
                oExtensionPointInfo.parent = oExtensionPointInfo.parent && this._byId(oView.createId(oExtensionPointInfo.parent.getAttribute("id")));
                oExtensionPointInfo.defaultContent = oExtensionPointInfo.defaultContent.map(function (oNode) {
                    var sId = oView.createId(oNode.getAttribute("id"));
                    return this._byId(sId);
                }.bind(this)).filter(function (oControl) {
                    return !!oControl;
                });
            }
            return oExtensionPointInfo;
        }.bind(this));
    }
};
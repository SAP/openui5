import ManagedObject from "../base/ManagedObject";
import assert from "sap/base/assert";
export class LabelEnablement {
    static writeLabelForAttribute(oRenderManager: any, oLabel: any) {
        if (!oLabel || !oLabel.getLabelForRendering) {
            return;
        }
        var sControlId = oLabel.getLabelForRendering();
        if (!sControlId) {
            return;
        }
        var oControl = toControl(sControlId);
        if (oControl && oControl.getIdForLabel) {
            sControlId = oControl.getIdForLabel();
        }
        if (sControlId && isLabelableControl(oControl)) {
            oRenderManager.attr("for", sControlId);
        }
    }
    static getReferencingLabels(oElement: any) {
        var sId = oElement ? oElement.getId() : null;
        if (!sId) {
            return [];
        }
        return CONTROL_TO_LABELS_MAPPING[sId] || [];
    }
    static isRequired(oElement: any) {
        if (checkRequired(oElement)) {
            return true;
        }
        var aLabelIds = LabelEnablement.getReferencingLabels(oElement), oLabel;
        for (var i = 0; i < aLabelIds.length; i++) {
            oLabel = sap.ui.getCore().byId(aLabelIds[i]);
            if (checkRequired(oLabel)) {
                return true;
            }
        }
        return false;
    }
    static enrich(oControl: any) {
        checkLabelEnablementPreconditions(oControl);
        oControl.__orig_setLabelFor = oControl.setLabelFor;
        oControl.setLabelFor = function (sId) {
            var res = this.__orig_setLabelFor.apply(this, arguments);
            refreshMapping(this);
            return res;
        };
        oControl.__orig_exit = oControl.exit;
        oControl.exit = function () {
            this._sAlternativeId = null;
            refreshMapping(this, true);
            if (oControl.__orig_exit) {
                oControl.__orig_exit.apply(this, arguments);
            }
        };
        oControl.setAlternativeLabelFor = function (sId) {
            if (sId instanceof ManagedObject) {
                sId = sId.getId();
            }
            else if (sId != null && typeof sId !== "string") {
                assert(false, "setAlternativeLabelFor(): sId must be a string, an instance of sap.ui.base.ManagedObject or null");
                return this;
            }
            this._sAlternativeId = sId;
            refreshMapping(this);
            return this;
        };
        oControl.getLabelForRendering = function () {
            var sId = this.getLabelFor() || this._sAlternativeId;
            var oControl = toControl(sId);
            return isLabelableControl(oControl) ? sId : "";
        };
        if (!oControl.getMetadata().getProperty("required")) {
            return;
        }
        oControl.__orig_setRequired = oControl.setRequired;
        oControl.setRequired = function (bRequired) {
            var bOldRequired = this.getRequired(), oReturn = this.__orig_setRequired.apply(this, arguments);
            if (this.getRequired() !== bOldRequired) {
                toControl(this.__sLabeledControl, true);
            }
            return oReturn;
        };
        oControl.isRequired = function () {
            var oFor = toControl(this.getLabelForRendering(), false);
            return checkRequired(this) || checkRequired(oFor);
        };
        oControl.isDisplayOnly = function () {
            if (this.getDisplayOnly) {
                return this.getDisplayOnly();
            }
            else {
                return false;
            }
        };
        oControl.isWrapping = function () {
            if (this.getWrapping) {
                return this.getWrapping();
            }
            else {
                return false;
            }
        };
        oControl.disableRequiredChangeCheck = function (bNoCheck) {
            this._bNoRequiredChangeCheck = bNoCheck;
        };
        oControl.attachRequiredChange = function (oFor) {
            if (oFor && !this._bNoRequiredChangeCheck) {
                if (oFor.getMetadata().getProperty("required")) {
                    oFor.attachEvent("_change", _handleControlChange, this);
                }
                this._bRequiredAttached = true;
            }
        };
        oControl.detachRequiredChange = function (oFor) {
            if (oFor && !this._bNoRequiredChangeCheck) {
                if (oFor.getMetadata().getProperty("required")) {
                    oFor.detachEvent("_change", _handleControlChange, this);
                }
                this._bRequiredAttached = false;
            }
        };
        function _handleControlChange(oEvent) {
            if (oEvent.getParameter("name") == "required") {
                this.invalidate();
            }
        }
        oControl.__orig_onAfterRendering = oControl.onAfterRendering;
        oControl.onAfterRendering = function (oEvent) {
            var res;
            if (this.__orig_onAfterRendering) {
                res = this.__orig_onAfterRendering.apply(this, arguments);
            }
            if (!this._bNoRequiredChangeCheck && !this._bRequiredAttached && this.__sLabeledControl) {
                var oFor = toControl(this.__sLabeledControl, false);
                this.attachRequiredChange(oFor);
            }
            return res;
        };
    }
}
var CONTROL_TO_LABELS_MAPPING = {};
var NON_LABELABLE_CONTROLS = ["sap.ui.comp.navpopover.SmartLink", "sap.m.Link", "sap.m.Label", "sap.m.Text"];
function toControl(sId, bInvalidate) {
    if (!sId) {
        return null;
    }
    var oControl = sap.ui.getCore().byId(sId);
    if (oControl && bInvalidate && (!oControl.isA("sap.ui.core.Control") || oControl.getDomRef())) {
        oControl.invalidate();
    }
    return oControl;
}
function findLabelForControl(label) {
    var sId = label.getLabelFor() || label._sAlternativeId || "";
    return sId;
}
function refreshMapping(oLabel, bDestroy) {
    var sLabelId = oLabel.getId();
    var sOldId = oLabel.__sLabeledControl;
    var sNewId = bDestroy ? null : findLabelForControl(oLabel);
    if (sOldId == sNewId) {
        return;
    }
    if (!bDestroy) {
        oLabel.invalidate();
    }
    if (sNewId) {
        oLabel.__sLabeledControl = sNewId;
    }
    else {
        delete oLabel.__sLabeledControl;
    }
    var aLabelsOfControl;
    if (sOldId) {
        aLabelsOfControl = CONTROL_TO_LABELS_MAPPING[sOldId];
        if (aLabelsOfControl) {
            aLabelsOfControl = aLabelsOfControl.filter(function (sCurrentLabelId) {
                return sCurrentLabelId != sLabelId;
            });
            if (aLabelsOfControl.length) {
                CONTROL_TO_LABELS_MAPPING[sOldId] = aLabelsOfControl;
            }
            else {
                delete CONTROL_TO_LABELS_MAPPING[sOldId];
            }
        }
    }
    if (sNewId) {
        aLabelsOfControl = CONTROL_TO_LABELS_MAPPING[sNewId] || [];
        aLabelsOfControl.push(sLabelId);
        CONTROL_TO_LABELS_MAPPING[sNewId] = aLabelsOfControl;
    }
    var oOldControl = toControl(sOldId, true);
    var oNewControl = toControl(sNewId, true);
    if (oOldControl) {
        oLabel.detachRequiredChange(oOldControl);
    }
    if (oNewControl) {
        oLabel.attachRequiredChange(oNewControl);
    }
}
function checkLabelEnablementPreconditions(oControl) {
    if (!oControl) {
        throw new Error("sap.ui.core.LabelEnablement cannot enrich null");
    }
    var oMetadata = oControl.getMetadata();
    if (!oMetadata.isInstanceOf("sap.ui.core.Label")) {
        throw new Error("sap.ui.core.LabelEnablement only supports Controls with interface sap.ui.core.Label");
    }
    var oLabelForAssociation = oMetadata.getAssociation("labelFor");
    if (!oLabelForAssociation || oLabelForAssociation.multiple) {
        throw new Error("sap.ui.core.LabelEnablement only supports Controls with a to-1 association 'labelFor'");
    }
}
function isLabelableControl(oControl) {
    if (!oControl) {
        return true;
    }
    var sName = oControl.getMetadata().getName();
    return NON_LABELABLE_CONTROLS.indexOf(sName) < 0;
}
function checkRequired(oElem) {
    return !!(oElem && oElem.getRequired && oElem.getRequired());
}
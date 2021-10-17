import assert from "sap/base/assert";
var StashedControlSupport = {}, stashedControls = {};
StashedControlSupport.mixInto = function (fnClass) {
    assert(!fnClass.prototype.unstash, "StashedControlSupport: fnClass already has method 'unstash', sideeffects possible", fnClass.getMetadata().getName());
    if (fnClass.getMetadata().isA("sap.ui.core.Fragment") || fnClass.getMetadata().isA("sap.ui.core.mvc.View")) {
        throw new Error("Stashing is not supported for sap.ui.coreFragment or sap.ui.core.mvc.View");
    }
    mixInto(fnClass);
};
function mixInto(fnClass) {
    fnClass.prototype.unstash = function () {
        if (this.isStashed()) {
            var oControl = unstash(this);
            oControl.stashed = false;
            return oControl;
        }
        return this;
    };
    fnClass.prototype.isStashed = function () {
        return !!stashedControls[this.getId()];
    };
    var fnClone = fnClass.prototype.clone;
    fnClass.prototype.clone = function () {
        if (this.isStashed()) {
            throw new Error("A stashed control cannot be cloned, id: '" + this.getId() + "'.");
        }
        return fnClone.apply(this, arguments);
    };
    var fnDestroy = fnClass.prototype.destroy;
    fnClass.prototype.destroy = function () {
        delete stashedControls[this.getId()];
        fnDestroy.apply(this, arguments);
    };
}
function unstash(oWrapperControl) {
    var oWrapperParent;
    var iIndexInParent;
    var oTargetAggregation;
    var oStashedInfo = stashedControls[oWrapperControl.getId()];
    oWrapperParent = oWrapperControl.getParent();
    if (oWrapperParent) {
        oTargetAggregation = oWrapperParent.getMetadata().getAggregation(oWrapperControl.sParentAggregationName);
        iIndexInParent = oTargetAggregation.indexOf(oWrapperParent, oWrapperControl);
        oTargetAggregation.remove(oWrapperParent, oWrapperControl);
    }
    oWrapperControl.destroy();
    var Component = sap.ui.require("sap/ui/core/Component");
    var oOwnerComponent = Component && oWrapperParent && Component.getOwnerComponentFor(oWrapperParent);
    var aControls;
    var fnCreate = oStashedInfo.fnCreate;
    if (oOwnerComponent) {
        aControls = oOwnerComponent.runAsOwner(fnCreate);
    }
    else {
        aControls = fnCreate();
    }
    if (iIndexInParent >= 0) {
        aControls.forEach(function (c) {
            oTargetAggregation.insert(oWrapperParent, c, iIndexInParent);
        });
    }
    delete stashedControls[oWrapperControl.getId()];
    return aControls[0];
}
function getStashedControls(bAsInstance, sParentId) {
    var aStashedChildren = [];
    for (var sId in stashedControls) {
        var oPlaceholder = sap.ui.getCore().byId(stashedControls[sId].wrapperId);
        var vInstanceOrId = bAsInstance ? oPlaceholder : sId;
        var oPlaceholderParent = oPlaceholder && oPlaceholder.getParent();
        if (!sParentId || (oPlaceholderParent && oPlaceholderParent.getId() === sParentId)) {
            aStashedChildren.push(vInstanceOrId);
        }
    }
    return aStashedChildren;
}
StashedControlSupport.getStashedControlIds = function (sParentId) {
    return getStashedControls(false, sParentId);
};
StashedControlSupport.getStashedControls = function (sParentId) {
    return getStashedControls(true, sParentId);
};
StashedControlSupport.createStashedControl = function (mSettings) {
    var oStashedInfo = {
        wrapperId: mSettings.wrapperId,
        fnCreate: mSettings.fnCreate
    };
    stashedControls[mSettings.wrapperId] = oStashedInfo;
    return oStashedInfo;
};
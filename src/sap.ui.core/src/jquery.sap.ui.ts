import jQuery from "jquery.sap.global";
import ObjectPath from "sap/base/util/ObjectPath";
function fgetUIAreaOfCtrl(oCtrl) {
    return oCtrl.getUIArea().getInterface();
}
function fUIAreaFilter() {
    return sap.ui.getCore().getUIArea(this.id) != null;
}
function fgetUIArea() {
    return sap.ui.getCore().getUIArea(this.id);
}
jQuery.fn.root = function (oRootControl) {
    if (oRootControl) {
        sap.ui.getCore().setRoot(this.get(0), oRootControl);
        return this;
    }
    var aControls = this.control();
    if (aControls.length > 0) {
        return aControls.map(fgetUIAreaOfCtrl);
    }
    var aUIAreas = this.uiarea();
    if (aUIAreas.length > 0) {
        return aUIAreas;
    }
    this.each(function () {
        sap.ui.getCore().createUIArea(this);
    });
    return this;
};
jQuery.fn.uiarea = function (iIdx) {
    var aUIAreas = this.slice("[id]").filter(fUIAreaFilter).map(fgetUIArea).get();
    return typeof (iIdx) === "number" ? aUIAreas[iIdx] : aUIAreas;
};
jQuery.fn.sapui = function (sControlType, sId, oConfiguration) {
    return this.each(function () {
        var oControl = null;
        if (this) {
            if (sControlType.indexOf(".") == -1) {
                sControlType = "sap.ui.commons." + sControlType;
            }
            var fnClass = ObjectPath.get(sControlType);
            if (fnClass) {
                if (typeof oConfiguration == "object" && typeof oConfiguration.press == "function") {
                    oConfiguration.press = jQuery.proxy(oConfiguration.press, this);
                }
                oControl = new (fnClass)(sId, oConfiguration);
                oControl.placeAt(this);
            }
        }
    });
};
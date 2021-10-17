import jQuery from "sap/ui/thirdparty/jquery";
import BaseObject from "sap/ui/base/Object";
import assert from "sap/base/assert";
var fnSyncStyleClass = function (sStyleClass, vSource, vDestination) {
    if (!sStyleClass) {
        return vDestination;
    }
    if (BaseObject.isA(vSource, "sap.ui.core.Control")) {
        vSource = vSource.$();
    }
    else if (typeof vSource === "string") {
        vSource = jQuery(document.getElementById(vSource));
    }
    else if (!(vSource instanceof jQuery)) {
        assert(false, "sap/ui/core/syncStyleClass(): vSource must be a jQuery object or a Control or a string");
        return vDestination;
    }
    var bClassFound = !!vSource.closest("." + sStyleClass).length;
    if (vDestination instanceof jQuery) {
        vDestination.toggleClass(sStyleClass, bClassFound);
    }
    else if (BaseObject.isA(vDestination, "sap.ui.core.Control")) {
        vDestination.toggleStyleClass(sStyleClass, bClassFound);
    }
    else {
        assert(false, "sap/ui/core/syncStyleClass(): vDestination must be a jQuery object or a Control");
    }
    return vDestination;
};
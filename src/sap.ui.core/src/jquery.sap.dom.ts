import jQuery from "jquery.sap.global";
import domContainsOrEquals from "sap/ui/dom/containsOrEquals";
import fnSyncStyleClass from "sap/ui/core/syncStyleClass";
import domGetOwnerWindow from "sap/ui/dom/getOwnerWindow";
import domGetScrollbarSize from "sap/ui/dom/getScrollbarSize";
import domDenormalizeScrollLeftRTL from "sap/ui/dom/denormalizeScrollLeftRTL";
import domDenormalizeScrollBeginRTL from "sap/ui/dom/denormalizeScrollBeginRTL";
import domUnitsRem from "sap/ui/dom/units/Rem";
jQuery.sap.domById = function domById(sId, oWindow) {
    return sId ? (oWindow || window).document.getElementById(sId) : null;
};
jQuery.sap.byId = function byId(sId, oContext) {
    var escapedId = "";
    if (sId) {
        escapedId = "#" + sId.replace(/(:|\.)/g, "\\$1");
    }
    return jQuery(escapedId, oContext);
};
jQuery.sap.focus = function focus(oDomRef) {
    if (!oDomRef) {
        return;
    }
    oDomRef.focus();
    return true;
};
jQuery.sap.pxToRem = domUnitsRem.fromPx;
jQuery.sap.remToPx = domUnitsRem.toPx;
jQuery.fn.outerHTML = function () {
    var oDomRef = this.get(0);
    if (oDomRef && oDomRef.outerHTML) {
        return oDomRef.outerHTML.trim();
    }
    else {
        var doc = this[0] ? this[0].ownerDocument : document;
        var oDummy = doc.createElement("div");
        oDummy.appendChild(oDomRef.cloneNode(true));
        return oDummy.innerHTML;
    }
};
jQuery.sap.containsOrEquals = domContainsOrEquals;
jQuery.sap.denormalizeScrollLeftRTL = domDenormalizeScrollLeftRTL;
jQuery.sap.denormalizeScrollBeginRTL = domDenormalizeScrollBeginRTL;
jQuery.support.selectstart = "onselectstart" in document.createElement("div");
jQuery.sap.ownerWindow = domGetOwnerWindow;
jQuery.sap.scrollbarSize = domGetScrollbarSize;
jQuery.sap.syncStyleClass = fnSyncStyleClass;
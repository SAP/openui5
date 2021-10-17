import jQuery from "sap/ui/thirdparty/jquery";
import domGetOwnerWindow from "sap/ui/dom/getOwnerWindow";
var fnRect = function rect() {
    var oDomRef = this.get(0);
    if (oDomRef) {
        if (oDomRef.getBoundingClientRect) {
            var oClientRect = oDomRef.getBoundingClientRect();
            var oRect = { top: oClientRect.top, left: oClientRect.left, width: oClientRect.right - oClientRect.left, height: oClientRect.bottom - oClientRect.top };
            var oWnd = domGetOwnerWindow(oDomRef);
            oRect.left += jQuery(oWnd).scrollLeft();
            oRect.top += jQuery(oWnd).scrollTop();
            return oRect;
        }
        else {
            return { top: 10, left: 10, width: oDomRef.offsetWidth, height: oDomRef.offsetHeight };
        }
    }
    return null;
};
jQuery.fn.rect = fnRect;
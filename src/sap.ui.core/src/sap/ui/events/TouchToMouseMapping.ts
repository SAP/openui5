export class TouchToMouseMapping {
    static init(oContext: any) {
        var oDocument = oContext, bHandleEvent = false, oTarget = null, bIsMoved = false, iStartX, iStartY, i = 0;
        var aMouseEvents = ["mousedown", "mouseover", "mouseup", "mouseout", "click"];
        var fireMouseEvent = function (sType, oEvent) {
            if (!bHandleEvent) {
                return;
            }
            var oMappedEvent = oEvent.type == "touchend" ? oEvent.changedTouches[0] : oEvent.touches[0];
            var newEvent = oDocument.createEvent("MouseEvent");
            newEvent.initMouseEvent(sType, true, true, window, oEvent.detail, oMappedEvent.screenX, oMappedEvent.screenY, oMappedEvent.clientX, oMappedEvent.clientY, oEvent.ctrlKey, oEvent.shiftKey, oEvent.altKey, oEvent.metaKey, oEvent.button, oEvent.relatedTarget);
            newEvent.isSynthetic = true;
            window.setTimeout(function () {
                oTarget.dispatchEvent(newEvent);
            }, 0);
        };
        var isInputField = function (oEvent) {
            return oEvent.target.tagName.match(/input|textarea|select/i);
        };
        var onMouseEvent = function (oEvent) {
            if (!oEvent.isSynthetic && !isInputField(oEvent)) {
                oEvent.stopPropagation();
                oEvent.preventDefault();
            }
        };
        var onTouchStart = function (oEvent) {
            var oTouches = oEvent.touches, oTouch;
            bHandleEvent = (oTouches.length == 1 && !isInputField(oEvent));
            bIsMoved = false;
            if (bHandleEvent) {
                oTouch = oTouches[0];
                oTarget = oTouch.target;
                if (oTarget.nodeType === 3) {
                    oTarget = oTarget.parentNode;
                }
                iStartX = oTouch.clientX;
                iStartY = oTouch.clientY;
                fireMouseEvent("mousedown", oEvent);
            }
        };
        var onTouchMove = function (oEvent) {
            var oTouch;
            if (bHandleEvent) {
                oTouch = oEvent.touches[0];
                if (Math.abs(oTouch.clientX - iStartX) > 10 || Math.abs(oTouch.clientY - iStartY) > 10) {
                    bIsMoved = true;
                }
                if (bIsMoved) {
                    fireMouseEvent("mousemove", oEvent);
                }
            }
        };
        var onTouchEnd = function (oEvent) {
            fireMouseEvent("mouseup", oEvent);
            if (!bIsMoved) {
                fireMouseEvent("click", oEvent);
            }
        };
        var onTouchCancel = function (oEvent) {
            fireMouseEvent("mouseup", oEvent);
        };
        for (; i < aMouseEvents.length; i++) {
            oDocument.addEventListener(aMouseEvents[i], onMouseEvent, true);
        }
        oDocument.addEventListener("touchstart", onTouchStart, true);
        oDocument.addEventListener("touchmove", onTouchMove, true);
        oDocument.addEventListener("touchend", onTouchEnd, true);
        oDocument.addEventListener("touchcancel", onTouchCancel, true);
        TouchToMouseMapping.disableTouchToMouseHandling = function () {
            var i = 0;
            oDocument.removeEventListener("touchstart", onTouchStart, true);
            oDocument.removeEventListener("touchmove", onTouchMove, true);
            oDocument.removeEventListener("touchend", onTouchEnd, true);
            oDocument.removeEventListener("touchcancel", onTouchCancel, true);
            for (; i < aMouseEvents.length; i++) {
                oDocument.removeEventListener(aMouseEvents[i], onMouseEvent, true);
            }
        };
    }
}
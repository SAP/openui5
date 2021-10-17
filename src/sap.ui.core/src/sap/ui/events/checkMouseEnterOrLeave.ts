var fnCheckMouseEnterOrLeave = function checkMouseEnterOrLeave(oEvent, oDomRef) {
    if (oEvent.type != "mouseover" && oEvent.type != "mouseout") {
        return false;
    }
    var isMouseEnterLeave = false;
    var element = oDomRef;
    var parent = oEvent.relatedTarget;
    try {
        while (parent && parent !== element) {
            parent = parent.parentNode;
        }
        if (parent !== element) {
            isMouseEnterLeave = true;
        }
    }
    catch (e) {
    }
    return isMouseEnterLeave;
};
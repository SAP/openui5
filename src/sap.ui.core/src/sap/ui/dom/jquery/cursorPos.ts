import jQuery from "sap/ui/thirdparty/jquery";
var fnCursorPos = function cursorPos(iPos) {
    var len = arguments.length, sTagName, sType;
    sTagName = this.prop("tagName");
    sType = this.prop("type");
    if (this.length === 1 && ((sTagName == "INPUT" && (sType == "text" || sType == "password" || sType == "search")) || sTagName == "TEXTAREA")) {
        var oDomRef = this.get(0);
        if (len > 0) {
            if (typeof (oDomRef.selectionStart) == "number") {
                oDomRef.focus();
                oDomRef.selectionStart = iPos;
                oDomRef.selectionEnd = iPos;
            }
            return this;
        }
        else {
            if (typeof (oDomRef.selectionStart) == "number") {
                return oDomRef.selectionStart;
            }
            return -1;
        }
    }
    else {
        return this;
    }
};
jQuery.fn.cursorPos = fnCursorPos;
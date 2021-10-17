import jQuery from "sap/ui/thirdparty/jquery";
var fnGetSelectedText = function () {
    var oDomRef = this.get(0);
    try {
        if (typeof oDomRef.selectionStart === "number") {
            return oDomRef.value.substring(oDomRef.selectionStart, oDomRef.selectionEnd);
        }
    }
    catch (e) {
    }
    return "";
};
jQuery.fn.getSelectedText = fnGetSelectedText;
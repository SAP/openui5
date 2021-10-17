import jQuery from "sap/ui/thirdparty/jquery";
var fnSelectText = function selectText(iStart, iEnd) {
    var oDomRef = this.get(0);
    try {
        if (typeof (oDomRef.selectionStart) === "number") {
            oDomRef.setSelectionRange(iStart > 0 ? iStart : 0, iEnd);
        }
    }
    catch (e) {
    }
    return this;
};
jQuery.fn.selectText = fnSelectText;
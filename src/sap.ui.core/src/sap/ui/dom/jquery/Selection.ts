import jQuery from "sap/ui/thirdparty/jquery";
jQuery.fn.disableSelection = function () {
    return this.on(("onselectstart" in document.createElement("div") ? "selectstart" : "mousedown") + ".ui-disableSelection", function (oEvent) {
        oEvent.preventDefault();
    });
};
jQuery.fn.enableSelection = function () {
    return this.off(".ui-disableSelection");
};
import jQuery from "sap/ui/thirdparty/jquery";
var fnHasTabIndex = function (oElem) {
    var iTabIndex = jQuery.prop(oElem, "tabIndex");
    return iTabIndex != null && iTabIndex >= 0 && (!jQuery.attr(oElem, "disabled") || jQuery.attr(oElem, "tabindex"));
};
jQuery.fn.hasTabIndex = function () {
    return fnHasTabIndex(this.get(0));
};
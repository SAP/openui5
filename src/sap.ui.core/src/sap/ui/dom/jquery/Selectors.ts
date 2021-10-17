import jQuery from "sap/ui/thirdparty/jquery";
function getValue(oTarget, sProperty) {
    var descriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
    return descriptor && descriptor.value;
}
function visible(element) {
    var oOffsetParent = jQuery(element).offsetParent();
    var bOffsetParentFound = false;
    var $refs = jQuery(element).parents().filter(function () {
        if (this === oOffsetParent) {
            bOffsetParentFound = true;
        }
        return bOffsetParentFound;
    });
    return !jQuery(element).add($refs).filter(function () {
        return jQuery.css(this, "visibility") === "hidden" || jQuery.expr.pseudos.hidden(this);
    }).length;
}
function focusable(element, isTabIndexNotNaN) {
    var nodeName = element.nodeName.toLowerCase();
    if (nodeName === "area") {
        var map = element.parentNode, mapName = map.name, img;
        if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
            return false;
        }
        img = jQuery("img[usemap='#" + mapName + "']")[0];
        return !!img && visible(img);
    }
    return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : nodeName == "a" ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) && visible(element);
}
if (!getValue(jQuery.expr.pseudos, "focusable")) {
    jQuery.expr.pseudos.focusable = function (element) {
        return focusable(element, !isNaN(jQuery.attr(element, "tabindex")));
    };
}
if (!getValue(jQuery.expr.pseudos, "sapTabbable")) {
    jQuery.expr.pseudos.sapTabbable = function (element) {
        var tabIndex = jQuery.attr(element, "tabindex"), isTabIndexNaN = isNaN(tabIndex);
        return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
    };
}
if (!getValue(jQuery.expr.pseudos, "sapFocusable")) {
    jQuery.expr.pseudos.sapFocusable = function (element) {
        return focusable(element, !isNaN(jQuery.attr(element, "tabindex")));
    };
}
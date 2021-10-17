import jQuery from "sap/ui/thirdparty/jquery";
function isHidden(oElem) {
    return (oElem.offsetWidth <= 0 && oElem.offsetHeight <= 0) || jQuery.css(oElem, "visibility") === "hidden";
}
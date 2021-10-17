import jQuery from "sap/ui/thirdparty/jquery";
import isHidden from "sap/ui/dom/isHidden";
function findFocusableDomRef(oContainer, bForward) {
    var oChild = bForward ? oContainer.firstChild : oContainer.lastChild, oFocusableDescendant;
    while (oChild) {
        if (oChild.nodeType == 1 && !isHidden(oChild)) {
            if (jQuery(oChild).hasTabIndex()) {
                return oChild;
            }
            oFocusableDescendant = findFocusableDomRef(oChild, bForward);
            if (oFocusableDescendant) {
                return oFocusableDescendant;
            }
        }
        oChild = bForward ? oChild.nextSibling : oChild.previousSibling;
    }
    return null;
}
jQuery.fn.firstFocusableDomRef = function () {
    var oContainerDomRef = this.get(0);
    if (!oContainerDomRef || isHidden(oContainerDomRef)) {
        return null;
    }
    return findFocusableDomRef(oContainerDomRef, true);
};
jQuery.fn.lastFocusableDomRef = function () {
    var oContainerDomRef = this.get(0);
    if (!oContainerDomRef || isHidden(oContainerDomRef)) {
        return null;
    }
    return findFocusableDomRef(oContainerDomRef, false);
};
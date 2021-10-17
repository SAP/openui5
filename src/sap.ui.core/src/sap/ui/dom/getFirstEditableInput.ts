import jQuery from "sap/ui/thirdparty/jquery";
import isHidden from "sap/ui/dom/isHidden";
function findEditableInput(oContainer) {
    return jQuery(oContainer).find("input, textarea").not("input[readonly],textarea[readonly],input[type=hidden],input[type=button],input[type=submit],input[type=reset],input[type=image],button").filter(":enabled:visible:first")[0];
}
function getFirstEditableInput(oContainer) {
    if (!oContainer || isHidden(oContainer)) {
        return null;
    }
    return findEditableInput(oContainer);
}
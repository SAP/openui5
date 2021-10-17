import jQuery from "sap/ui/thirdparty/jquery";
var fnParentByAttribute = function parentByAttribute(sAttribute, sValue) {
    if (this.length > 0) {
        if (sValue) {
            return this.first().parents("[" + sAttribute + "='" + sValue + "']").get(0);
        }
        else {
            return this.first().parents("[" + sAttribute + "]").get(0);
        }
    }
};
jQuery.fn.parentByAttribute = fnParentByAttribute;
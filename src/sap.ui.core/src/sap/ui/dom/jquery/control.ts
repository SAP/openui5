import jQuery from "sap/ui/thirdparty/jquery";
jQuery.fn.control = function (iIndex, bIncludeRelated) {
    var aControls = this.map(function () {
        var sControlId;
        if (bIncludeRelated) {
            var $Closest = jQuery(this).closest("[data-sap-ui],[data-sap-ui-related]");
            sControlId = $Closest.attr("data-sap-ui-related") || $Closest.attr("id");
        }
        else {
            sControlId = jQuery(this).closest("[data-sap-ui]").attr("id");
        }
        return sap.ui.getCore().byId(sControlId);
    });
    return aControls.get(iIndex);
};
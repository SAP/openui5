/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/ActionToolbar",
    "../Util"
], function (ActionToolbar, Util) {
	"use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

    var oDesignTime = {
            description: "{description}",
            name: "{name}",
            aggregations: {},
            properties: {},
            actions: {
                settings: {
                    name: oResourceBundle.getText("actiontoolbar.RTA_SETTINGS_NAME"),
                    handler: function (oControl, mPropertyBag) {
                        return sap.ui.mdc.p13n.Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "actionsKey").then(function(aChanges){
                            return aChanges;
                        });
                    },
                    CAUTION_variantIndependent: true
                }
            }
	    },
        aAllowedAggregations = [
            "actions"
        ],
        aAllProperties = [];

    return Util.getDesignTime(ActionToolbar, aAllProperties, aAllowedAggregations, oDesignTime);

});

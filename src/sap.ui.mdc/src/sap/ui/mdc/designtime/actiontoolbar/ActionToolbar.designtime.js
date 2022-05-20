/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/ActionToolbar",
    "sap/ui/mdc/p13n/Engine",
    "../Util"
], function (ActionToolbar, Engine, Util) {
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
                        return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "actionsKey").then(function(aChanges){
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

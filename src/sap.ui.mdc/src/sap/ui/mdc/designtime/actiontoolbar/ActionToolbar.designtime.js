/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Lib",
    "sap/ui/mdc/ActionToolbar",
    "sap/m/p13n/Engine",
    "../Util"
], function(Library, ActionToolbar, Engine, Util) {
	"use strict";

    const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

    const oDesignTime = {
            description: "{description}",
            name: "{name}",
            aggregations: {
                between: {
                    propagateMetadata: function(oElement) {
                        if (oElement.isA("sap.ui.fl.variants.VariantManagement")) {
                            return null;
                        }
                        return {
                            actions: "not-adaptable" // other controls within the conten aggregation will not be adaptable for RTA and Visual Editor
                        };
                    }
                }
            },
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
            "actions", "between"
        ],
        aAllowedProperties = [];

    return Util.getDesignTime(ActionToolbar, aAllowedProperties, aAllowedAggregations, oDesignTime);

});

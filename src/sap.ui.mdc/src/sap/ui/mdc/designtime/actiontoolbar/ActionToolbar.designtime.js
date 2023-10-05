/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/ActionToolbar",
    "sap/m/p13n/Engine",
    "../Util",
    "sap/ui/core/Lib"
], function(ActionToolbar, Engine, Util, Lib) {
	"use strict";

    const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

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

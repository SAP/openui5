/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/ActionToolbar",
	"sap/m/p13n/Engine",
	"../Util"
], (ActionToolbar, Engine, Util) => {
	"use strict";


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
			},
			actions: {
				propagateRelevantContainer: true
			}
		},
		properties: {},
		actions: {
			settings: {
				"sap.ui.mdc": {
					name: "actiontoolbar.RTA_SETTINGS_NAME",
					handler: function(oControl, mPropertyBag) {
						return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "actionsKey").then((aChanges) => {
							return aChanges;
						});
					},
					CAUTION_variantIndependent: true
				}
			}
		}
	},
		aAllowedAggregations = [
			"actions", "between"
		],
		aAllowedProperties = [];

	return Util.getDesignTime(ActionToolbar, aAllowedProperties, aAllowedAggregations, oDesignTime);

});
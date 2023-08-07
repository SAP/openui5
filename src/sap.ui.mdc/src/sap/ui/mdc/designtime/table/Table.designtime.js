/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine",
	"sap/ui/mdc/Table",
	"../Util"
], function (Engine, Table, Util) {
	"use strict";

	// initial structure of designTime object
	var oDesignTime = {
		name: "{name}",
		description: "{description}",
		actions: {
			settings: function () {
				//RTA expects the settings to be returned as function
				return {
					handler: function (oControl, mPropertyBag) {
						return oControl.finalizePropertyHelper().then(function(){
							return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, oControl.getActiveP13nModes());
						});
					}
				};
			}
		},
		properties: {},
		aggregations: {
			_content: {
				propagateMetadata: function(oElement) {

					if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
						return {
							domRef: function(oTable) {
								return oTable.getDomRef();
							}
						};
					}

					if (oElement.isA("sap.ui.fl.variants.VariantManagement") ||
						oElement.isA("sap.ui.mdc.ActionToolbar") ||
						oElement.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction") ||
						oElement.isA("sap.ui.mdc.Field") ||
						(oElement.getParent() &&
							(oElement.getParent().isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction") ||
							oElement.getParent().isA("sap.ui.mdc.Field")))) {
						return null;
					}

					return {
						actions: "not-adaptable" // other controls within the conten aggregation will not be adaptable for RTA and Visual Editor
					};
				}
			}
		}
	};
	// array containing all allowed control properties. Update the aAllowedProperties to enable a property for DTA
	var aAllowedProperties = ["width", "headerLevel",
			"header", "headerVisible", "showRowCount", "threshold",
			"enableExport", "busyIndicatorDelay","enableColumnResize",
			"showPasteButton", "multiSelectMode"],
		// array containing all allowed control aggregations. Update the aAllowedAggregations to enable an aggregation for DTA
		aAllowedAggregations = [
			"_content"
		];

	return Util.getDesignTime(Table, aAllowedProperties, aAllowedAggregations, oDesignTime);

});

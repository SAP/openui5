/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine",
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
						return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, oControl.getActiveP13nModes());
					}
				};
			}
		},
		properties: {},
		aggregations: {
			_content: {
				// If the inner table has height 0px (can happen with GridTable in Auto mode), RTA incorrectly thinks that all elements inside this
				// table are invisible, and therefore doesn't show overlays. Unfortunately, it also ignores the inner table's designtime that contains
				// a solution for this issue.
				// To fix the issue here, we tell RTA to not take the domRef of the direct child in the _content aggregation, but the one of the
				// MDCTable itself (":sap-domref" is a magic pointer to the domRef of the "main" control).
				// This should not affect the size or position of any overlays, it just fixes the RTA algorithm for determining the visibility of
				// an element.
				domRef: ":sap-domref",
				propagateMetadata: function(oElement) {
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
	var aAllowedProperties = ["width", "height", "headerLevel",
			"header", "headerVisible", "showRowCount", "threshold",
			"noDataText", "enableExport", "busyIndicatorDelay","enableColumnResize",
			"showPasteButton", "multiSelectMode"],
		// array containing all allowed control aggregations. Update the aAllowedAggregations to enable an aggregation for DTA
		aAllowedAggregations = [
			"_content"
		];

	return Util.getDesignTime(Table, aAllowedProperties, aAllowedAggregations, oDesignTime);

});

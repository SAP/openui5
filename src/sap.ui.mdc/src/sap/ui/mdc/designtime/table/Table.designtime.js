/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine", "sap/ui/mdc/Table", "../Util"
], (Engine, Table, Util) => {
	"use strict";

	// initial structure of designTime object
	const oDesignTime = {
		name: "{name}",
		description: "{description}",
		actions: {
			settings: function(oControl) {
				const bImplicitPersistence = Engine.getInstance()._determineModification(oControl).payload.hasPP;
				return {
					"sap.ui.mdc": {
						name: "p13nDialog.VIEW_SETTINGS",
						handler: function (oControl, mPropertyBag) {
							return oControl.finalizePropertyHelper().then(() => {
								return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, oControl.getActiveP13nModes());
							});
						}
					},
					CAUTION_variantIndependent: bImplicitPersistence
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
				propagateMetadata: function (oElement) {
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
	const aAllowedProperties = ["width",
		"headerLevel",
		"header",
		"headerVisible",
		"showRowCount",
		"threshold",
		"enableExport",
		"busyIndicatorDelay",
		"enableColumnResize",
		"showPasteButton",
		"multiSelectMode"
	],
		// array containing all allowed control aggregations. Update the aAllowedAggregations to enable an aggregation for DTA
		aAllowedAggregations = [
			"_content"
		];

	return Util.getDesignTime(Table, aAllowedProperties, aAllowedAggregations, oDesignTime);

});
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine", "sap/ui/mdc/Chart", "../Util"
], (Engine, Chart, Util) => {
	"use strict";

	const oDesignTime = {
		actions: {
			settings: {
				"sap.ui.mdc": function(oControl) {
					return Engine.getInstance()._runWithPersistence(oControl, (bIsGlobal) => {
						return {
							name: "p13nDialog.VIEW_SETTINGS",
							handler: function(oControl, mPropertyBag) {
								const aP13nMode = oControl.getP13nMode();
								const iIdx = aP13nMode.indexOf("Type");
								if (iIdx > -1) {
									aP13nMode.splice(iIdx, 1);
								}
								if (oControl.isPropertyHelperFinal()) {
									return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, aP13nMode);
								} else {
									return oControl.finalizePropertyHelper().then(() => {
										return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, aP13nMode);
									});
								}
							},
							CAUTION_variantIndependent: bIsGlobal
						};
					});
				}
			}
		},
		aggregations: {
			_toolbar: {
				propagateMetadata: function(oElement) {
					return null;
				}
			}
		}
	};

	const aAllowedAggregations = ["_toolbar"],
		aAllowedProperties = ["headerLevel", "headerVisible"];

	return Util.getDesignTime(Chart, aAllowedProperties, aAllowedAggregations, oDesignTime);

});

sap.ui.define(['sap/ui/core/Fragment'],
	function(Fragment) {
	"use strict";

	var ExtensionPointProvider = {
		/**
		 * <code>ExtensionPointProvider.applyExtensionPoint</code> is called during XMLView processing once all necessary information
		 * is collected.
		 *
		 * After inserting the final controls into the target aggregation of the target control,
		 * the ready() function on the oExtensionPoint object must be called.
		 *
		 * @param {object} oExtensionPoint an object containing all necessary information to process the ExtensionPoint.
		 * Documentation of all available properties and functions can be found in {@link sap.ui.core.ExtensionPoint}.
		 * @returns {Promise} a Promise which resolves once the
		 */
		applyExtensionPoint: function(oExtensionPoint) {
			if (oExtensionPoint.name === "Button_Ext_As_BindingTemplate") {
				return Fragment.load({
					id: oExtensionPoint.view.createId("ep"),
					name: "sap.ui.sample.mvc.XMLViewBindableAggregationEP",
					controller: oExtensionPoint.view.getController()
				}).then(function(vControls) {
					if (!Array.isArray(vControls)) {
						vControls = [vControls];
					}
					vControls.forEach(function(oControl, i) {
						oExtensionPoint.targetControl.insertAggregation(oExtensionPoint.aggregationName, oControl, oExtensionPoint.index + i);
					});
					oExtensionPoint.ready(vControls);
				});
			}
		}
	};

	return ExtensionPointProvider;
});

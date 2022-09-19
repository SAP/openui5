/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/variants/context/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings"
], function(
	ContextSharingComponent,
	ComponentContainer,
	Layer,
	Settings
) {
	"use strict";

	var oComponentContainer;

	/**
	 * Provides an API for creating and managing the component for variant management context sharing.
	 *
	 * @namespace sap.ui.fl.write.api.ContextSharingAPI
	 * @experimental Since 1.88
	 * @since 1.88
	 * @private
	 * @ui5-restricted sap.ui.comp, sap.ui.fl
	 */
	var ContextSharingAPI = /** @lends sap.ui.fl.write.api.ContextSharingAPI */{

		/**
		 * Creates component for sharing contexts in variant management.
		 * In case the component already exists, it will not be created again to avoid duplicate IDs.
		 * <code>sap.ui.fl.variants.context.Component.setSelectedContexts</code> needs to be called afterwards.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} [mPropertyBag.layer] - Layer
		 * @param {string} [mPropertyBag.isComp=true] - Flag if the control owning the Component is the comp.VariantManagement
		 * @returns {Promise<sap.ui.core.ComponentContainer>} Promise resolving with the ComponentContainer or nothing depending on the availability of the feature in the used back end
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.fl
		 */
		createComponent: function(mPropertyBag) {
			if (mPropertyBag.layer !== Layer.CUSTOMER) {
				return Promise.resolve();
			}
			return Settings.getInstance().then(function(oSettings) {
				return (mPropertyBag.isComp) ? oSettings.isContextSharingEnabledForComp() : oSettings.isContextSharingEnabled();
			}).then(function(bIsEnabled) {
				if (bIsEnabled) {
					if (!oComponentContainer || oComponentContainer.bIsDestroyed) {
						var oComponent = new ContextSharingComponent("contextSharing");
						oComponent.setSelectedContexts({role: []});
						oComponentContainer = new ComponentContainer("contextSharingContainer", {component: oComponent});
					}
					return oComponentContainer;
				}
			});
		}

	};

	return ContextSharingAPI;
});

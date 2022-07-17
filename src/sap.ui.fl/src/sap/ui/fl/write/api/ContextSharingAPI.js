/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/variants/context/Component",
	"sap/ui/core/ComponentContainer"
], function(
	FeaturesAPI,
	ContextSharingComponent,
	ComponentContainer
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
		 * @returns {Promise<sap.ui.core.ComponentContainer>} Promise resolving with the ComponentContainer or nothing depending on the availability of the feature in the used back end
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.fl
		 */
		createComponent: function(mPropertyBag) {
			return FeaturesAPI.isContextSharingEnabled(mPropertyBag.layer).then(function(bIsEnabled) {
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

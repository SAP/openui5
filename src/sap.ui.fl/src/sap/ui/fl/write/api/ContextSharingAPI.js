/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings"
], function(
	Component,
	ManifestUtils,
	ContextBasedAdaptationsAPI,
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
		 * @param {sap.ui.core.Control} [mPropertyBag.variantManagementControl] - Comp or control variant management control
		 * @returns {Promise<sap.ui.core.ComponentContainer>} Promise resolving with the ComponentContainer or nothing depending on the availability of the feature in the used back end
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.fl
		 */
		createComponent(mPropertyBag) {
			if (mPropertyBag.layer !== Layer.CUSTOMER) {
				return Promise.resolve();
			}
			var sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.variantManagementControl);
			return Settings.getInstance().then(function(oSettings) {
				return oSettings.isContextSharingEnabled() && !ContextBasedAdaptationsAPI.adaptationExists({reference: sReference, layer: Layer.CUSTOMER});
			}).then(async function(bIsEnabled) {
				if (bIsEnabled) {
					if (!oComponentContainer || oComponentContainer.bIsDestroyed) {
						const oComponent = await Component.create({name: "sap.ui.fl.variants.context", id: "contextSharing"});
						oComponent.showMessageStrip(true);
						oComponent.setSelectedContexts({role: []});
						// eslint-disable-next-line require-atomic-updates
						oComponentContainer = new ComponentContainer("contextSharingContainer", {component: oComponent});
						// Ensure view is fully loaded
						return oComponent.getRootControl().oAsyncState.promise.then(function() {
							return oComponentContainer;
						});
					}
					return oComponentContainer;
				}
			});
		}

	};

	return ContextSharingAPI;
});

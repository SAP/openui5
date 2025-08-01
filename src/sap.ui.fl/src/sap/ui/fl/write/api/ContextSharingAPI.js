/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Layer"
], function(
	Component,
	ComponentContainer,
	ManifestUtils,
	Settings,
	ContextBasedAdaptationsAPI,
	Layer
) {
	"use strict";

	let oComponentPromise = Promise.resolve();
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
		 * Checks if context sharing is enabled.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @returns {boolean} True if context sharing is enabled
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.fl
		 */
		async isContextSharingEnabled(mPropertyBag) {
			if (mPropertyBag.layer !== Layer.CUSTOMER) {
				return false;
			}
			const sReference = ManifestUtils.getFlexReferenceForControl(mPropertyBag.variantManagementControl);
			const oSettings = await Settings.getInstance();
			const bIsEnabled = oSettings.getIsContextSharingEnabled()
				&& !ContextBasedAdaptationsAPI.adaptationExists({reference: sReference, layer: Layer.CUSTOMER});
			return bIsEnabled;
		},

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
		async createComponent(mPropertyBag) {
			if (await this.isContextSharingEnabled(mPropertyBag)) {
				oComponentPromise = oComponentPromise.then(async (oComponentContainer) => {
					if (oComponentContainer && !oComponentContainer.isDestroyed()) {
						return oComponentContainer;
					}
					const oComponent = await Component.create({
						name: "sap.ui.fl.variants.context", id: "contextSharing"
					});
					oComponent.showMessageStrip(true);
					oComponent.setSelectedContexts({role: []});
					// Ensure view is fully loaded
					oComponentContainer = new ComponentContainer("contextSharingContainer", {component: oComponent});
					await oComponent.getRootControl().oAsyncState.promise;
					return oComponentContainer;
				});
				return oComponentPromise;
			}
			return undefined;
		}
	};

	return ContextSharingAPI;
});

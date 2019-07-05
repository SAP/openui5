/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/ControlPersonalizationAPI"
], function(
	OldControlPersonalizationAPI
) {
	"use strict";

	/**
	 * Provides an API to handle specific functionality for personalized changes.
	 *
	 * @namespace
	 * @name sap.ui.fl.apply.api.ControlVariantApplyAPI
	 * @author SAP SE
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @public
	 */
	var ControlVariantApplyAPI = {

		/**
		 *
		 * Clears URL technical parameter 'sap-ui-fl-control-variant-id' for control variants. Use this method in case you normally want
		 * the variant parameter in the URL, but have a few special navigation pattern, where you want to clear it. If you don't want that
		 * parameter in general, set updateVariantInURL parameter on your variant management control to false. SAP Fiori Elements use this
		 * method.
		 * If a variant management control is given as parameter, only parameters specific to that control are cleared.
		 *
		 * @param {sap.ui.base.ManagedObject} [oVariantManagementControl] - The variant management control for which the URL technical parameter has to be cleared
		 *
		 * @method sap.ui.fl.apply.api.ControlVariantApplyAPI.clearVariantParameterInURL
		 * @public
		 */
		clearVariantParameterInURL: function () {
			OldControlPersonalizationAPI.clearVariantParameterInURL.apply(OldControlPersonalizationAPI, arguments);
		},

		/**
		 *
		 * Activates the passed variant applicable to the passed control/component.
		 *
		 * @param {sap.ui.base.ManagedObject|string} vElement - The component or control (instance or ID) on which the variantModel is set
		 * @param {string} sVariantReference - The variant reference which needs to be activated
		 *
		 * @returns {Promise} Returns Promise that resolves after the variant is updated or rejects when an error occurs
		 *
		 * @method sap.ui.fl.apply.api.ControlVariantApplyAPI.activateVariant
		 * @public
		 */
		activateVariant: function() {
			return OldControlPersonalizationAPI.activateVariant.apply(OldControlPersonalizationAPI, arguments);
		}

	};
	return ControlVariantApplyAPI;
}, true);

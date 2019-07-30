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
	 * Provides an API for applications to work with control variants. See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply.api.ControlVariantApplyAPI
	 * @experimental Since 1.67
	 * @since 1.67
	 * @version ${version}
	 * @public
	 */
	var ControlVariantApplyAPI = /** @lends sap.ui.fl.apply.api.ControlVariantApplyAPI */{

		/**
		 *
		 * Clears URL technical parameter <code>sap-ui-fl-control-variant-id</code> for control variants.
		 * Use this method in case you normally want the variant parameter in the URL, but have a few special navigation patterns where you want to clear it.
		 * If you don't want that parameter in general, set the <code>updateVariantInURL</code> parameter on your variant management control to <code>false</code>. SAP Fiori elements use this method.
		 * If a variant management control is given as a parameter, only parameters specific to that control are cleared.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.variantManagementControl - Variant management control for which the URL technical parameter has to be cleared
		 *
		 * @public
		 */
		clearVariantParameterInURL: function () {
			OldControlPersonalizationAPI.clearVariantParameterInURL.apply(OldControlPersonalizationAPI, arguments);
		},

		/**
		 *
		 * Activates the passed variant applicable to the passed control/component.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject|string} mPropertyBag.element - Component or control (instance or ID) on which the <code>variantModel</code> is set
		 * @param {string} mPropertyBag.variantReference - Reference to the variant that needs to be activated
		 *
		 * @returns {Promise} Promise that resolves after the variant is updated, or is rejected if an error occurs
		 *
		 * @public
		 */
		activateVariant: function() {
			return OldControlPersonalizationAPI.activateVariant.apply(OldControlPersonalizationAPI, arguments);
		}

	};
	return ControlVariantApplyAPI;
}, true);

/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/ControlPersonalizationAPI",
	"sap/ui/fl/Utils"
], function(
	Log,
	OldControlPersonalizationAPI,
	Utils
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
		 * Clears URL technical parameter <code>sap-ui-fl-control-variant-id</code> for control variants.
		 * Use this method in case you normally want the variant parameter in the URL, but have a few special navigation patterns where you want to clear it.
		 * If you don't want that parameter in general, set the <code>updateVariantInURL</code> parameter on your variant management control to <code>false</code>. SAP Fiori elements use this method.
		 * If a variant management control is given as a parameter, only parameters specific to that control are cleared.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.control - Variant management control for which the URL technical parameter has to be cleared
		 *
		 * @public
		 */
		clearVariantParameterInURL: function (mPropertyBag) {
			OldControlPersonalizationAPI.clearVariantParameterInURL(mPropertyBag.control);
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
		activateVariant: function(mPropertyBag) {
			return OldControlPersonalizationAPI.activateVariant(mPropertyBag.element, mPropertyBag.variantReference);
		},

		/**
		 * Saves a function that will be called after a variant has been applied with the new variant as parameter.
		 * Even if the same variant is selected again the callback is called.
		 * The function also performs a sanity check after the control has been rendered.
		 * If the passed variant control ID does not match the responsible variant management control, the callback will not be saved.
		 * Optionally this function is also called after the initial variant is applied without a sanity check.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector of the control
		 * @param {string} mPropertyBag.vmControlId - ID of the variant management control
		 * @param {function} mPropertyBag.callback - Callback that will be called after a variant has been applied
		 * @param {boolean} [mPropertyBag.callAfterInitialVariant] - The callback will also be called after the initial variant is applied
		 *
		 * @public
		 */
		attachVariantApplied: function(mPropertyBag) {
			var oControl = mPropertyBag.selector.id && sap.ui.getCore().byId(mPropertyBag.selector.id) || mPropertyBag.selector;
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var oVariantModel = oAppComponent.getModel(Utils.VARIANT_MODEL_NAME);

			oVariantModel.attachVariantApplied({
				vmControlId: mPropertyBag.vmControlId,
				control: oControl,
				callback: mPropertyBag.callback,
				callAfterInitialVariant: mPropertyBag.callAfterInitialVariant
			});
		},

		/**
		 * Removes the saved callback for the given control and variant management control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector of the control
		 * @param {string} mPropertyBag.vmControlId - ID of the variant management control
		 *
		 * @public
		 */
		detachVariantApplied: function(mPropertyBag) {
			var oControl = mPropertyBag.selector.id && sap.ui.getCore().byId(mPropertyBag.selector.id) || mPropertyBag.selector;
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var oVariantModel = oAppComponent.getModel(Utils.VARIANT_MODEL_NAME);
			oVariantModel.detachVariantApplied(mPropertyBag.vmControlId, oControl.getId());
		}
	};

	return ControlVariantApplyAPI;
}, true);

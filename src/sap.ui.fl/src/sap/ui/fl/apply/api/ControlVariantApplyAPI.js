/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/Utils"
], function(
	Log,
	Component,
	Element,
	URLHandler,
	Utils
) {
	"use strict";

	var VARIANT_MODEL_NAME = "$FlexVariants";

	// The API methods can be called before the model is set on the component
	function waitForVariantModel(oAppComponent) {
		var oVariantModel = oAppComponent.getModel(VARIANT_MODEL_NAME);
		if (oVariantModel) {
			return Promise.resolve(oVariantModel);
		}
		return new Promise(function(resolve) {
			function onModelContextChange() {
				oVariantModel = oAppComponent.getModel(VARIANT_MODEL_NAME);
				if (oVariantModel) {
					oAppComponent.detachModelContextChange(onModelContextChange);
					resolve(oVariantModel);
				}
			}
			oAppComponent.attachModelContextChange(onModelContextChange);
		});
	}

	/**
	 * Provides an API for applications to work with control variants. See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply.api.ControlVariantApplyAPI
	 * @since 1.67
	 * @public
	 */
	var ControlVariantApplyAPI = /** @lends sap.ui.fl.apply.api.ControlVariantApplyAPI */{
		/**
		 * Returns the name of the Variant Model
		 *
		 * @returns {string} Name of the Variant Model
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getVariantModelName() {
			return VARIANT_MODEL_NAME;
		},

		/**
		 * Returns a promise that resolves to the variant model once it is available
		 *
		 * @param {object} oAppComponent - Application component
		 * @returns {Promise} Promise resolving to the Variant Model
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getVariantModel(oAppComponent) {
			return waitForVariantModel(oAppComponent);
		},

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
		clearVariantParameterInURL(mPropertyBag) {
			var aUpdatedVariantParameters;
			var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);
			var oVariantModel = oAppComponent && oAppComponent.getModel(VARIANT_MODEL_NAME);
			if (!oVariantModel) {
				// technical parameters are not updated, only URL hash is updated
				Log.error("Variant model could not be found on the provided control");
				return;
			}

			// check if variant for the passed variant management control is present
			if (mPropertyBag.control.isA("sap.ui.fl.variants.VariantManagement")) {
				var sVariantManagementReference = oVariantModel.getLocalId(mPropertyBag.control.getId(), oAppComponent);
				var mCleansedParametersWithIndex = URLHandler.removeURLParameterForVariantManagement({
					model: oVariantModel,
					vmReference: sVariantManagementReference
				});
				aUpdatedVariantParameters = mCleansedParametersWithIndex.parameters;
			}

			// both technical parameters and URL hash updated
			URLHandler.update({
				parameters: aUpdatedVariantParameters || [],
				updateURL: true,
				updateHashEntry: !!oVariantModel,
				model: oVariantModel || {},
				silent: !oVariantModel
			});
		},

		/**
		 *
		 * Activates the passed variant applicable to the passed control/component.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject|string} mPropertyBag.element - Component or control (instance or ID) on which the <code>variantModel</code> is set
		 * @param {string} mPropertyBag.variantReference - Reference to the variant that needs to be activated
		 *
		 * @returns {Promise} Resolves after the variant is activated or rejects if an error occurs
		 *
		 * @public
		 */
		activateVariant(mPropertyBag) {
			function logAndReject(oError) {
				Log.error(oError);
				return Promise.reject(oError);
			}

			var oElement;
			if (typeof mPropertyBag.element === "string") {
				oElement = Component.getComponentById(mPropertyBag.element);
				if (!(oElement instanceof Component)) {
					oElement = Element.getElementById(mPropertyBag.element);

					if (!(oElement instanceof Element)) {
						return logAndReject(Error("No valid component or control found for the provided ID"));
					}
				}
			} else if (mPropertyBag.element instanceof Component || mPropertyBag.element instanceof Element) {
				oElement = mPropertyBag.element;
			}

			var oAppComponent = Utils.getAppComponentForControl(oElement);
			if (!oAppComponent) {
				return logAndReject(Error("A valid variant management control or component (instance or ID) should be passed as parameter"));
			}

			var oVariantModel = oAppComponent.getModel(VARIANT_MODEL_NAME);
			if (!oVariantModel) {
				return logAndReject(Error("No variant management model found for the passed control or application component"));
			}
			var sVariantManagementReference = oVariantModel.getVariantManagementReference(mPropertyBag.variantReference).variantManagementReference;
			if (!sVariantManagementReference) {
				return logAndReject(Error("A valid control or component, and a valid variant/ID combination are required"));
			}

			// sap/fe is using this API very early during app start, sometimes before FlexState is initialized
			return oVariantModel.waitForVMControlInit(sVariantManagementReference)

			.then(function() {
				return oVariantModel.updateCurrentVariant({
					variantManagementReference: sVariantManagementReference,
					newVariantReference: mPropertyBag.variantReference,
					appComponent: oAppComponent
				});
			})
			.catch(function(oError) {
				Log.error(oError);
				throw oError;
			});
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
		attachVariantApplied(mPropertyBag) {
			var oControl = mPropertyBag.selector.id && Element.getElementById(mPropertyBag.selector.id) || mPropertyBag.selector;
			var oAppComponent = Utils.getAppComponentForControl(oControl);

			waitForVariantModel(oAppComponent).then(function(oVariantModel) {
				oVariantModel.attachVariantApplied({
					vmControlId: mPropertyBag.vmControlId,
					control: oControl,
					callback: mPropertyBag.callback,
					callAfterInitialVariant: mPropertyBag.callAfterInitialVariant
				});
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
		detachVariantApplied(mPropertyBag) {
			var oControl = mPropertyBag.selector.id && Element.getElementById(mPropertyBag.selector.id) || mPropertyBag.selector;
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			waitForVariantModel(oAppComponent).then(function(oVariantModel) {
				oVariantModel.detachVariantApplied(mPropertyBag.vmControlId, oControl.getId());
			});
		}
	};

	return ControlVariantApplyAPI;
});

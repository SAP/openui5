/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/core/Element",
	"sap/ui/core/Component"
], function(
	Utils,
	Element,
	Component
) {
	"use strict";

	var sVariantTechnicalParameterName = "sap-ui-fl-control-variant-id";

	var ControlVariantsAPI = {

		/**
		 * Clears URL technical parameter 'sap-ui-fl-control-variant-id' for control variants.
		 * If a variant management control is given as parameter, only that control specific parameters are cleared.
		 * @param {sap.ui.core.Element} [oVariantManagementControl] The variant management control for which URL technical parameter has to be cleared
		 * @public
		 */
		clearVariantParameterInURL : function (oVariantManagementControl) {
			var aUrlParameters = [];
			if (oVariantManagementControl instanceof Element) {
				var oAppComponent = Utils.getAppComponentForControl(oVariantManagementControl);
				var oVariantModel = oAppComponent.getModel("$FlexVariants");
				var sVariantManagementReference = oVariantModel._getLocalId(oVariantManagementControl.getId(), oAppComponent);
				var mVariantParametersInURL = oVariantModel.getVariantIndexInURL(sVariantManagementReference);

				if (mVariantParametersInURL.index > -1) {
					mVariantParametersInURL.parameters[sVariantTechnicalParameterName].splice(mVariantParametersInURL.index, 1);
					aUrlParameters = mVariantParametersInURL.parameters[sVariantTechnicalParameterName].slice(0);
				}
			}
			Utils.setTechnicalURLParameterValues(oAppComponent, sVariantTechnicalParameterName, aUrlParameters);
		},

		/**
		 * Activates the passed variant applicable on the passed control/component
		 * @param {sap.ui.base.ManagedObject|String} vElement The component or control (instance or id) on which the variantModel is set
		 * @param {String} sVariantReference The variant reference which needs to be activated
		 * @returns {Promise} Returns Promise that resolves after the variant is updated or rejects when an error occurs
		 * @public
		 */
		activateVariant : function (vElement, sVariantReference) {
			var oElement;
			return Promise.resolve()
				.then( function () {
						if (typeof vElement === 'string' || vElement instanceof String) {
							oElement = sap.ui.getCore().getComponent(vElement);

							if (!(oElement instanceof Component)) {
								oElement = sap.ui.getCore().byId(vElement);

								if (!(oElement instanceof Element)) {
									throw new Error("A valid component or control cannot be found for the provided Id");
								}
							}
						} else if (vElement instanceof Component || vElement instanceof Element) {
							oElement = vElement;
						}

						var oAppComponent = Utils.getAppComponentForControl(oElement);
						if (!oAppComponent) {
							throw new Error("A valid variant management control or component (instance or id) should be passed as parameter");
						}

						var oVariantModel = oAppComponent.getModel("$FlexVariants");
						if (!oVariantModel) {
							throw new Error("No variant management model found for the passed control or component");
						}
						var sVariantManagementReference = oVariantModel.getVariantManagementReference(sVariantReference).variantManagementReference;
						if (!sVariantManagementReference) {
							throw new Error("A valid control or component, and variant id combination is required");
						}

					return oVariantModel.updateCurrentVariant(sVariantManagementReference, sVariantReference);
				})
				["catch"](function (oError) {
							Utils.log.error(oError);
							return Promise.reject(oError);
						});
		}
	};
	return ControlVariantsAPI;
}, true);
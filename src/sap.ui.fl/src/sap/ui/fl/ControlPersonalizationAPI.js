/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/core/Component",
	"sap/ui/thirdparty/jquery"
], function(
	Utils,
	ChangeRegistry,
	FlexControllerFactory,
	JsControlTreeModifier,
	Element,
	ManagedObject,
	VariantManagement,
	Component,
	jQuery
) {
	"use strict";

	/**
	 * Provides an API to handle specific functionality for personalized changes.
	 *
	 * @namespace
	 * @name sap.ui.fl.ControlPersonalizationAPI
	 * @author SAP SE
	 * @experimental Since 1.56
	 * @since 1.56
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Object containing attributes of a change, along with the control to which this change should be applied.
	 *
	 * @typedef {object} sap.ui.fl.ControlPersonalizationAPI.PersonalizationChange
	 * @since 1.56
	 * @private
	 * @ui5-restricted
	 * @property {sap.ui.core.Element} selectorControl The control object to be used as selector for the change
	 * @property {object} changeSpecificData The map of change-specific data to perform a flex change
	 * @property {string} changeSpecificData.changeType The change type for which a change handler is registered
	 */

	var VARIANT_TECHNICAL_PARAMETER_NAME = "sap-ui-fl-control-variant-id";

	var ControlPersonalizationAPI = {

		/**
		 * Returns a map of parameters used in public functions.
		 *
		 * @param {sap.ui.core.Element} oControl - The control for which a variant management control has to be evaluated
		 * @returns {object} Returns a map with needed parameters
		 * @private
		 */
		_determineParameters : function(oControl) {
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
			var oRootControl = oAppComponent.getRootControl();
			var oView = Utils.getViewForControl(oControl);
			var oVariantModel = oAppComponent.getModel("$FlexVariants");

			var mParams = {
				rootControl : oRootControl,
				view : oView,
				variantModel : oVariantModel,
				variantManagement : {},
				flexController: oFlexController
			};
			var oVMControl;
			var aForControlTypes;

			jQuery.makeArray(mParams.rootControl.$().find(".sapUiFlVarMngmt")).map(function(oVariantManagementNode) {
				oVMControl = sap.ui.getCore().byId(oVariantManagementNode.id);
				if (oVMControl.getMetadata().getName() === "sap.ui.fl.variants.VariantManagement") {
					aForControlTypes = oVMControl.getFor();
					aForControlTypes.forEach(function(sControlType) {
						mParams.variantManagement[sControlType] = mParams.variantModel._getLocalId(oVariantManagementNode.id, oAppComponent);
					});
				}
			});

			return mParams;
		},

		/**
		 * Returns the local ID of the encompassing variant management control.
		 *
		 * @param {sap.ui.core.Element} oControl - The control for which a variant management control has to be evaluated
		 * @returns {object} Returns a map with needed parameters
		 * @private
		 */
		_getVariantManagement : function(oControl, mParams) {
			mParams = mParams || this._determineParameters(oControl);
			var fnCheckForControl = function (oControl) {
				if (!mParams.variantManagement[oControl.getId()] && oControl.getParent() && oControl.getId() !== mParams.rootControl.getId()) {
					return fnCheckForControl(oControl.getParent());
				} else if (!oControl.getParent() || oControl.getId() === mParams.rootControl.getId()) {
					return mParams.variantManagement[oControl.getId()] || "";
				} else {
					return mParams.variantManagement[oControl.getId()];
				}
			};

			return fnCheckForControl(oControl);
		},

		/**
		 *
		 * Clears URL technical parameter 'sap-ui-fl-control-variant-id' for control variants.
		 * If a variant management control is given as parameter, only parameters specific to that control are cleared.
		 *
		 * @param {sap.ui.base.ManagedObject} [oVariantManagementControl] - The variant management control for which the URL technical parameter has to be cleared
		 *
		 * @method sap.ui.fl.ControlPersonalizationAPI.clearVariantParameterInURL
		 * @public
		 */
		clearVariantParameterInURL : function (oControl) {
			var aUrlParameters = [];
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var oVariantModel = oAppComponent instanceof Component ? oAppComponent.getModel("$FlexVariants") : undefined;
			if (!oVariantModel) {
				//technical parameters are not updated, only URL hash is updated
				Utils.setTechnicalURLParameterValues(undefined, VARIANT_TECHNICAL_PARAMETER_NAME, aUrlParameters);
				return Utils.log.warning("Variant model could not be found on the provided control");
			}

			//check if variant for the passed variant management control is present
			if (oControl instanceof VariantManagement) {
				var sVariantManagementReference = oVariantModel._getLocalId(oControl.getId(), oAppComponent);
				var mVariantParametersInURL = oVariantModel.getVariantIndexInURL(sVariantManagementReference);

				if (mVariantParametersInURL.index > -1) {
					mVariantParametersInURL.parameters[VARIANT_TECHNICAL_PARAMETER_NAME].splice(mVariantParametersInURL.index, 1);
					aUrlParameters = mVariantParametersInURL.parameters[VARIANT_TECHNICAL_PARAMETER_NAME].slice(0);
				}
			}

			//both technical parameters and URL hash updated
			oVariantModel.updateHasherEntry({
				parameters: aUrlParameters,
				updateURL: true,
				component: oAppComponent
			});
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
		 * @method sap.ui.fl.ControlPersonalizationAPI.activateVariant
		 * @public
		 */
		activateVariant : function(vElement, sVariantReference) {
			var oElement;
			return Promise.resolve()
			.then(function () {
					if (typeof vElement === 'string' || vElement instanceof String) {
						oElement = Component.get(vElement);

						if (!(oElement instanceof Component)) {
							oElement = sap.ui.getCore().byId(vElement);

							if (!(oElement instanceof Element)) {
								throw new Error("No valid component or control found for the provided ID");
							}
						}
					} else if (vElement instanceof Component || vElement instanceof Element) {
						oElement = vElement;
					}

					var oAppComponent = Utils.getAppComponentForControl(oElement);
					if (!oAppComponent) {
						throw new Error("A valid variant management control or component (instance or ID) should be passed as parameter");
					}

					var oVariantModel = oAppComponent.getModel("$FlexVariants");
					if (!oVariantModel) {
						throw new Error("No variant management model found for the passed control or application component");
					}
					var sVariantManagementReference = oVariantModel.getVariantManagementReference(sVariantReference).variantManagementReference;
					if (!sVariantManagementReference) {
						throw new Error("A valid control or component, and a valid variant/ID combination are required");
					}

				return oVariantModel.updateCurrentVariant(sVariantManagementReference, sVariantReference, oAppComponent);
			})
			["catch"](function (oError) {
						Utils.log.error(oError);
						return Promise.reject(oError);
					});
		},

		_checkChangeSpecificData: function(oChange, sLayer) {
			if (!oChange.changeSpecificData) {
				return "No changeSpecificData available";
			}
			if (!oChange.changeSpecificData.changeType) {
				return "No valid changeType";
			}

			if (!(oChange.selectorControl instanceof Element)) {
				return "No valid selectorControl";
			}

			var sControlType = oChange.selectorControl.getMetadata().getName();
			var oChangeHandler = ChangeRegistry.getInstance().getChangeHandler(oChange.changeSpecificData.changeType, sControlType, oChange.selectorControl, JsControlTreeModifier, sLayer);
			if (!oChangeHandler) {
				return "No valid ChangeHandler";
			}
			if (!oChangeHandler.revertChange) {
				return "ChangeHandler has no revertChange function";
			}
		},

		/**
		 * Creates personalization changes, adds them to the flex persistence (not yet saved) and applies them to the control.
		 *
		 * @param {object} mPropertyBag - Changes along with other settings that need to be added
		 * @param {array} mPropertyBag.controlChanges - Array of control changes of type {@link sap.ui.fl.ControlPersonalizationAPI.PersonalizationChange}
		 * @param {boolean} [mPropertyBag.ignoreVariantManagement=false] - If flag is set to true then variant management will be ignored
		 *
		 * @returns {Promise} Returns Promise resolving to an array of successfully applied changes,
		 * after the changes have been written to the map of dirty changes and applied to the control
		 *
		 * @method sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChanges
		 * @public
		 */
		addPersonalizationChanges: function(mPropertyBag) {
			var aSuccessfulChanges = [];
			var sLayer = Utils.getCurrentLayer(true);
			var aPromises = [];

			mPropertyBag.controlChanges.forEach(function(oChange) {
				var mChangeSpecificData = {};
				Object.assign(mChangeSpecificData, {
					developerMode: false,
					layer: sLayer
				});

				var sCheckResult = this._checkChangeSpecificData(oChange, sLayer);
				if (sCheckResult) {
					aPromises.push(function() {
						return Promise.reject({
							change: oChange,
							message: sCheckResult
						});
					});
					return;
				}

				var mParams = this._determineParameters(oChange.selectorControl);
				if (!mPropertyBag.ignoreVariantManagement) {
					// check for preset variantReference
					if (!oChange.changeSpecificData.variantReference) {
						var sVariantManagementReference = this._getVariantManagement(oChange.selectorControl, mParams);
						if (sVariantManagementReference) {
							var sCurrentVariantReference = mParams.variantModel.oData[sVariantManagementReference].currentVariant;
							oChange.changeSpecificData.variantReference = sCurrentVariantReference;
						}
					}
				} else {
					// delete preset variantReference
					delete oChange.changeSpecificData.variantReference;
				}
				aPromises.push(
					function() {
						return mParams.flexController.createAndApplyChange(Object.assign(mChangeSpecificData, oChange.changeSpecificData), oChange.selectorControl)
							.then(function (oAppliedChange) {
								// FlexController.createAndApplyChanges will only resolve for successfully applied changes
								aSuccessfulChanges.push(oAppliedChange);
							});
					}
				);
			}.bind(this));

			return Utils.execPromiseQueueSequentially(aPromises)
				.then(function() {
					return aSuccessfulChanges;
				});
		},

		/**
		 * Saves unsaved changes added to {@link sap.ui.fl.ChangePersistence}.
		 *
		 * @param {array} aChanges - Array of changes to be saved
		 * @param {sap.ui.base.ManagedObject} oManagedObject - A managed object instance which has an application component responsible, on which changes need to be saved
		 *
		 * @returns {Promise} Returns Promise which is resolved when the passed array of changes have been saved
		 *
		 * @method sap.ui.fl.ControlPersonalizationAPI.saveChanges
		 * @public
		 */
		saveChanges: function(aChanges, oManagedObject) {
			if (!(oManagedObject instanceof ManagedObject)) {
				Utils.log.error("A valid sap.ui.base.ManagedObject instance is required as a parameter");
				return;
			}
			return FlexControllerFactory.createForControl(oManagedObject)._oChangePersistence.saveSequenceOfDirtyChanges(aChanges);
		},

		/**
		 * Determines the availability of an encompassing variant management control.
		 *
		 * @param {sap.ui.base.ManagedObject} oControl - The control which should be tested for an encompassing variant management control
		 *
		 * @returns {boolean} Returns true if a variant management control is encompassing the given control, else false
		 *
		 * @method sap.ui.fl.ControlPersonalizationAPI.hasVariantManagement
		 * @public
		 */
		hasVariantManagement : function(oControl) {
			return !!this._getVariantManagement(oControl);
		}
	};
	return ControlPersonalizationAPI;
}, true);
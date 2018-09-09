/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/core/Component",
	"sap/ui/thirdparty/jquery"
], function(
	Utils,
	ChangeRegistry,
	JsControlTreeModifier,
	Element,
	VariantManagement,
	Component,
	jQuery
) {
	"use strict";

	/**
	 * Provides an API to handle specific functionality of the {@link sap.ui.fl.variants.VariantManagement variant management control}.
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
	 * Object containing attributes of a change, along with the control on which this change should be applied.
	 *
	 * <pre>
	 * {
	 *    selectorControl: &lt;sap.ui.core.Control&gt; // the control object to be used as selector for the change,
	 *    changeSpecificData: { &lt;object&gt; // the map of change-specific data to perform a flex change,
	 *       changeType: &lt;string&gt; // the change type for which a change handler is registered
	 *       ... // other change specific data
	 *    }
	 * }
	 * </pre>
	 *
	 * @typedef {object} sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChange
	 * @since 1.56
	 * @private
	 * @ui5-restricted
	 * @property {sap.ui.core.Control} selectorControl - The control object to be used as selector for the change
	 * @property {object} changeSpecificData - The map of change-specific data to perform a flex change
	 * @property {string} changeSpecificData.changeType - The change type for which a change handler is registered
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
			var oComponent = Utils.getSelectorComponentForControl(oControl);
			var oRootControl = oAppComponent.getRootControl();
			var oView = Utils.getViewForControl(oControl);
			var oVariantModel = oAppComponent.getModel("$FlexVariants");

			var mParams = {
				appComponent : oAppComponent,
				component: oComponent,
				rootControl : oRootControl,
				view : oView,
				variantModel : oVariantModel,
				variantManagement : {}
			};
			var oVMControl;
			var aForControlTypes;

			jQuery.makeArray(mParams.rootControl.$().find(".sapUiFlVarMngmt")).map(function(oVariantManagementNode) {
				oVMControl = sap.ui.getCore().byId(oVariantManagementNode.id);
				if (oVMControl.getMetadata().getName() === "sap.ui.fl.variants.VariantManagement") {
					aForControlTypes = oVMControl.getFor();
					aForControlTypes.forEach(function(sControlType) {
						mParams.variantManagement[sControlType] = mParams.variantModel._getLocalId(oVariantManagementNode.id, mParams.component);
					});
				}
			});

			return mParams;
		},

		/**
		 * Returns the local id of the encompassing variant management control.
		 *
		 * @param {sap.ui.core.Element} oControl - The control for which a variant management control has to be evaluated
		 * @returns {object} Returns a map with needed parameters
		 * @private
		 */
		_getVariantManagement : function(oControl) {
			var mParams = this._determineParameters(oControl);
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
		 * If a variant management control is given as parameter, only that control specific parameters are cleared.
		 *
		 * @param {sap.ui.base.ManagedObject} [oVariantManagementControl] The variant management control for which URL technical parameter has to be cleared
		 *
		 * @method sap.ui.fl.ControlPersonalizationAPI.clearVariantParameterInURL
		 * @public
		 */
		clearVariantParameterInURL : function (oControl) {
			var aUrlParameters = [];
			var oAppComponent = Utils.getAppComponentForControl(oControl);
			var oComponent = Utils.getSelectorComponentForControl(oControl);
			var oVariantModel = oAppComponent instanceof Component ? oAppComponent.getModel("$FlexVariants") : undefined;
			if (!oVariantModel) {
				//technical parameters are not updated, only URL hash is updated
				Utils.setTechnicalURLParameterValues(undefined, VARIANT_TECHNICAL_PARAMETER_NAME, aUrlParameters);
				return Utils.log.warning("Variant model could not be found on the provided control");
			}

			//check if variant for the passed variant management control is present
			if (oControl instanceof VariantManagement) {
				var sVariantManagementReference = oVariantModel._getLocalId(oControl.getId(), oComponent);
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
		 * Activates the passed variant applicable on the passed control/component.
		 *
		 * @param {sap.ui.base.ManagedObject|string} vElement The component or control (instance or id) on which the variantModel is set
		 * @param {string} sVariantReference The variant reference which needs to be activated
		 *
		 * @returns {Promise} Returns Promise that resolves after the variant is updated or rejects when an error occurs
		 *
		 * @method sap.ui.fl.ControlPersonalizationAPI.activateVariant
		 * @public
		 */
		activateVariant : function(vElement, sVariantReference) {
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

						var oComponent = Utils.getSelectorComponentForControl(oElement);
						var oAppComponent = Utils.getAppComponentForControl(oElement);
						if (!oAppComponent) {
							throw new Error("A valid variant management control or component (instance or id) should be passed as parameter");
						}

						var oVariantModel = oAppComponent.getModel("$FlexVariants");
						if (!oVariantModel) {
							throw new Error("No variant management model found for the passed control or application component");
						}
						var sVariantManagementReference = oVariantModel.getVariantManagementReference(sVariantReference).variantManagementReference;
						if (!sVariantManagementReference) {
							throw new Error("A valid control or component, and variant id combination is required");
						}

					return oVariantModel.updateCurrentVariant(sVariantManagementReference, sVariantReference, oComponent);
				})
				["catch"](function (oError) {
							Utils.log.error(oError);
							return Promise.reject(oError);
						});
		},

		/**
		 * Creates personalization changes, adds them to the flex persistence (not yet saved) and applies them to the control.
		 *
		 * @param {array} aControlChanges - Array of control changes of type {@link sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChange}
		 *
		 * @returns {Promise} Returns Promise that resolves after the changes have been written to the map of dirty changes and applied to the control
		 *
		 * @method sap.ui.fl.ControlPersonalizationAPI.addPersonalizationChanges
		 * @public
		 */
		addPersonalizationChanges : function(aControlChanges) {
			var oChangeHandler;
			var sVariantManagementReference;
			var sCurrentVariantReference;
			var oSelectorControl;
			var mChange;
			var mChangeSpecificData;
			var mControlChangeSpecificData;
			var mPropertyBag;
			var mParams;
			var oError;
			var oChange;
			var aPromises = [];
			var sLayer = Utils.getCurrentLayer(true);

			var fnGetChangeHandler = function(sChangeType, oElement) {
				var sControlType = oElement.getMetadata().getName();
				return ChangeRegistry.getInstance().getChangeHandler(sChangeType, sControlType, oElement, JsControlTreeModifier, sLayer);
			};

			var fnCheckChangeSpecificData = function(mChange) {
				var oError;
				if (!mChange.selectorControl || !mChange.selectorControl.getMetadata) {
					oError = {
						change : mChange,
						message : "No valid selectorControl"
					};
				} else {
					if (!mChange.changeSpecificData) {
						oError = {
							change : mChange,
							message : "No changeSpecificData available"
						};
					} else if (!mChange.changeSpecificData.changeType) {
						oError = {
							change : mChange,
							message : "No valid changeType"
						};
					} else {
						oChangeHandler = fnGetChangeHandler(mChange.changeSpecificData.changeType, mChange.selectorControl);
						if (!oChangeHandler) {
							oError = {
								change : mChange,
								message : "No valid ChangeHandler"
							};
						} else if (!oChangeHandler.revertChange) {
							oError = {
								change : mChange,
								message : "ChangeHandler has no revertChange function"
							};
						}
					}
				}
				return oError;
			};

			var fnAddAndApplyChanges = function(oChange, oSelectorControl, mPropertyBag) {
				mParams.variantModel.oFlexController.addPreparedChange(oChange, mParams.appComponent);
				return mParams.variantModel.oFlexController.checkTargetAndApplyChange(oChange, oSelectorControl, mPropertyBag);
			};

			var fnAddPromiseReject = function(oError) {
				return Promise.reject(oError);
			};

			for (var i = 0; i < aControlChanges.length; i++) {
				mChange = aControlChanges[i];
				mChangeSpecificData = {};
				Object.assign(mChangeSpecificData, {
					developerMode: false,
					layer: sLayer
				});

				oError = fnCheckChangeSpecificData(mChange);
				if (oError) {
					aPromises.push(fnAddPromiseReject.bind(this, oError));
				} else {
					mControlChangeSpecificData = mChange.changeSpecificData;
					oSelectorControl = mChange.selectorControl;
					if (!mParams) {
						mParams = this._determineParameters(oSelectorControl);
					}
					sVariantManagementReference = this._getVariantManagement(oSelectorControl);
					sCurrentVariantReference = undefined;

					if (!sVariantManagementReference) {
						oError = {
							change : mChange,
							message : "No Variant Management Control available for change"
						};
						aPromises.push(fnAddPromiseReject.bind(this, oError));
					} else {
						sCurrentVariantReference = mParams.variantModel.oData[sVariantManagementReference].currentVariant;

						oChange = mParams.variantModel.oFlexController.createChange(
							Object.assign(mChangeSpecificData, mControlChangeSpecificData),
							oSelectorControl
						);
						oChange.setVariantReference(sCurrentVariantReference);

						mPropertyBag = {
							component: mParams.component, // set local component
							view: mParams.view,
							modifier: JsControlTreeModifier
						};

						aPromises.push(fnAddAndApplyChanges.bind(this, oChange, oSelectorControl, mPropertyBag));
					}
				}
			}
			return Utils.execPromiseQueueSequentially(aPromises);
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
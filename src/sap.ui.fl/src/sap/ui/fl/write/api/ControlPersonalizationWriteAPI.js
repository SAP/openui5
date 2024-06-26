/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	Log,
	JsControlTreeModifier,
	Element,
	FlexState,
	VariantUtils,
	ControlVariantApplyAPI,
	FlexRuntimeInfoAPI,
	ChangeHandlerStorage,
	Settings,
	ChangesWriteAPI,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer,
	Utils
) {
	"use strict";

	var mChangeCreationListeners = {};

	function checkChangeSpecificData(oChange, sLayer) {
		if (!oChange.changeSpecificData) {
			return Promise.reject(new Error("No changeSpecificData available"));
		}
		if (!oChange.changeSpecificData.changeType) {
			return Promise.reject(new Error("No valid changeType"));
		}

		if (!(oChange.selectorControl instanceof Element)) {
			return Promise.reject(new Error("No valid selectorControl"));
		}

		var sControlType = oChange.selectorControl.getMetadata().getName();
		return ChangeHandlerStorage.getChangeHandler(
			oChange.changeSpecificData.changeType,
			sControlType,
			oChange.selectorControl,
			JsControlTreeModifier,
			sLayer
		);
	}

	function getRelevantVariantManagementReference(oAppComponent, oControl, bUseStaticArea) {
		var sVMControlId = VariantUtils.getRelevantVariantManagementControlId(oControl, [], bUseStaticArea);
		return JsControlTreeModifier.getSelector(sVMControlId, oAppComponent).id;
	}

	function logAndReject(sMessage) {
		Log.error(sMessage);
		return Promise.reject(sMessage);
	}

	/**
	 * Object containing attributes of a change, along with the control to which this change should be applied.
	 *
	 * @typedef {object} sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange
	 * @property {sap.ui.core.Element} selectorElement - Control object to be used as the selector for the change
	 * @property {object} changeSpecificData - Map of change-specific data to perform a flex change
	 * @property {string} changeSpecificData.changeType - Change type for which a change handler is registered
	 * @property {object} changeSpecificData.content - Content for the change
	 * @property {boolean} [transient=false] - Transient changes are not persisted
	 * @since 1.69
	 * @private
	 * @ui5-restricted UI5 controls that allow personalization
	 */

	/**
	 * Provides an API for controls to implement personalization.
	 *
	 * @namespace sap.ui.fl.write.api.ControlPersonalizationWriteAPI
	 * @since 1.69
	 * @private
	 * @ui5-restricted UI5 controls that allow personalization
	 */
	var ControlPersonalizationWriteAPI = /** @lends sap.ui.fl.write.api.ControlPersonalizationWriteAPI */{
		/**
		 * Creates personalization changes, adds them to the flex persistence (not yet saved) and applies them to the control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange[]} mPropertyBag.changes - Array of control changes of type {@link sap.ui.fl.write.api.ControlPersonalizationWriteAPI.PersonalizationChange}
		 * @param {boolean} [mPropertyBag.ignoreVariantManagement=false] - If flag is set to <code>true</code>, the changes will not belong to any variant, otherwise it will be detected if the changes are done in the context of variant mangement
		 * @param {boolean} [mPropertyBag.useStaticArea=false] - If flag is set to true then the static area is used to determine the variant management control
		 *
		 * @returns {Promise} Promise resolving to an array of successfully applied changes, after the changes have been written to the map of dirty changes (except transient changes) and applied to the control
		 * @private
		 * @ui5-restricted
		 */
		async add(mPropertyBag) {
			if (!mPropertyBag.changes.length) {
				return Promise.resolve([]);
			}
			var oReferenceControl = (
				mPropertyBag.changes[0].selectorElement
				|| mPropertyBag.changes[0].selectorControl
			);
			var oAppComponent = Utils.getAppComponentForControl(oReferenceControl);
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oReferenceControl});
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oAppComponent);
			var oVariantModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
			var sLayer = Layer.USER;
			var aSuccessfulChanges = [];

			function createChanges() {
				var aChanges = [];
				var aChangesToBeAdded = [];
				return mPropertyBag.changes.reduce(function(pPromise, oPersonalizationChange) {
					return pPromise
					.then(function() {
						oPersonalizationChange.selectorControl = oPersonalizationChange.selectorElement;
						return checkChangeSpecificData(oPersonalizationChange, sLayer);
					})
					.then(function() {
						// Transient changes are always VM-independent
						if (!oPersonalizationChange.transient && !mPropertyBag.ignoreVariantManagement) {
							// check for preset variantReference
							if (!oPersonalizationChange.changeSpecificData.variantReference) {
								var sVariantManagementReference = getRelevantVariantManagementReference(
									oAppComponent,
									oPersonalizationChange.selectorControl,
									mPropertyBag.useStaticArea
								);
								if (sVariantManagementReference) {
									var sCurrentVariantReference = oVariantModel.oData[sVariantManagementReference].currentVariant;
									oPersonalizationChange.changeSpecificData.variantReference = sCurrentVariantReference;
								}
							}
						} else {
							// delete preset variantReference
							delete oPersonalizationChange.changeSpecificData.variantReference;
						}

						oPersonalizationChange.changeSpecificData = Object.assign(
							oPersonalizationChange.changeSpecificData,
							{developerMode: false, layer: sLayer}
						);
						return ChangesWriteAPI.create({
							changeSpecificData: oPersonalizationChange.changeSpecificData,
							selector: oPersonalizationChange.selectorControl
						});
					})
					.then(function(oCreatedChange) {
						if (!oPersonalizationChange.transient) {
							aChangesToBeAdded.push(oCreatedChange);
						}

						aChanges.push({
							changeInstance: oCreatedChange,
							selectorControl: oPersonalizationChange.selectorControl
						});
					})
					.catch(function(oError) {
						Log.error("A Change was not created successfully. Reason: ", oError.message);
					});
				}, Promise.resolve())
				.then(function() {
					oChangePersistence.addChanges(aChangesToBeAdded, oAppComponent);
					return aChanges;
				})
				.catch(function(oError) {
					Log.error("Changes were not added successfully. Reason: ", oError.message);
				});
			}

			function applyChanges(aChanges) {
				return aChanges.reduce(function(pPromise, oChange) {
					return pPromise
					.then(function() {
						oChange.changeInstance.setQueuedForApply();
						return ChangesWriteAPI.apply({
							change: oChange.changeInstance,
							element: oChange.selectorControl
						});
					})
					.then(function(oResult) {
						if (oResult.success) {
							aSuccessfulChanges.push(oChange.changeInstance);
						} else {
							throw oResult.error || new Error("ChangesWriteAPI.apply failed with unspecified error");
						}
					})
					.catch(function(oError) {
						oChangePersistence.deleteChange(oChange.changeInstance);
						Log.error("A Change was not applied successfully. Reason: ", oError.message);
					});
				}, Promise.resolve());
			}

			// Make sure to first create and add all changes so that change handlers
			// that rely on change batching in the applier can wait for them, e.g.
			// when adding multiple columns at once to a MDC table
			const aChanges = await createChanges();
			await applyChanges(aChanges);

			(mChangeCreationListeners[sFlexReference] || [])
			.forEach(function(fnCallback) {
				fnCallback(aSuccessfulChanges);
			});
			return aSuccessfulChanges;
		},

		/**
		 * Deletes changes recorded for the provided selectors. Changes to be deleted can be filtered by specification of change type(s).
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector[]} mPropertyBag.selectors - Array of selectors, at least one selector is necessary
		 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes to be deleted
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place and changes are reverted
		 *
		 * @private
		 * @ui5-restricted
		 */
		reset(mPropertyBag) {
			if (!mPropertyBag.selectors || mPropertyBag.selectors.length === 0) {
				return logAndReject("At least one control ID has to be provided as a parameter");
			}

			var oAppComponent = mPropertyBag.selectors[0].appComponent || Utils.getAppComponentForControl(mPropertyBag.selectors[0]);
			if (!oAppComponent) {
				return logAndReject("App Component could not be determined");
			}

			var aSelectorIds = mPropertyBag.selectors.map(function(vControl) {
				var sControlId = vControl.id || vControl.getId();
				var sLocalId = oAppComponent.getLocalId(sControlId);
				return sLocalId || sControlId;
			});
			var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
			if (FlexState.isInitialized({control: oAppComponent})) {
				return oFlexController.resetChanges(Layer.USER, undefined, oAppComponent, aSelectorIds, mPropertyBag.changeTypes);
			}
			return Promise.resolve();
		},

		/**
		 * Reset dirty changes for a given control.
		 * This function also triggers a reversion of deleted UI changes.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Control} mPropertyBag.selector - Retrieves the associated flex persistence
		 * @param {string} [mPropertyBag.generator] - Generator of changes
		 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes
		 *
		 * @returns {Promise} Promise that resolves after the deletion took place
		 *
		 * @private
		 * @ui5-restricted
		 */
		restore(mPropertyBag) {
			if (!mPropertyBag || !mPropertyBag.selector) {
				return Promise.reject("No selector was provided");
			}

			var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);

			if (!oAppComponent) {
				return Promise.reject("App Component could not be determined");
			}

			var oFlexController = FlexControllerFactory.createForControl(oAppComponent);
			if (FlexState.isInitialized({control: oAppComponent})) {
				// limit the deletion to the passed selector control only
				return oFlexController.removeDirtyChanges(Layer.USER, oAppComponent, mPropertyBag.selector, mPropertyBag.generator, mPropertyBag.changeTypes);
			}
			return Promise.resolve();
		},

		/**
		 * Checks for dirty flex objects that match the given parameters.
		 * This function can be used to determine if a restore should be enabled.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Control} mPropertyBag.selector - Control for which dirty flex objects are checked
		 * @param {string} [mPropertyBag.generator] - Generator of changes
		 * @param {string[]} [mPropertyBag.changeTypes] - Types of changes
		 * @returns {boolean} True if the control has dirty flex objects
		 */
		hasDirtyFlexObjects(mPropertyBag) {
			if (!mPropertyBag || !mPropertyBag.selector) {
				throw Error("No selector was provided");
			}
			var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.selector);
			if (!oAppComponent) {
				throw Error("App Component could not be determined");
			}

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oAppComponent);
			var aDirtyFlexObjects = oChangePersistence.getDirtyChanges();

			return aDirtyFlexObjects.some(function(oFlexObject) {
				if (oFlexObject.getLayer() !== Layer.USER) {
					return false;
				}

				if (mPropertyBag.generator && oFlexObject.getSupportInformation().generator !== mPropertyBag.generator) {
					return false;
				}

				if (mPropertyBag.changeTypes && mPropertyBag.changeTypes.indexOf(oFlexObject.getChangeType()) === -1) {
					return false;
				}

				var vSelector = oFlexObject.getSelector();
				return mPropertyBag.selector.getId() === JsControlTreeModifier.getControlIdBySelector(vSelector, oAppComponent);
			});
		},

		/**
		 * Saves unsaved changes to the backend service.
		 *
	 	 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {string[]} [mPropertyBag.changes] - Array of changes to be saved; if not provided, all unsaved changes will be saved
		 *
		 * @returns {Promise} Promise that is resolved when the changes have been saved
		 *
		 * @private
		 * @ui5-restricted
		 */
		save(mPropertyBag) {
			var oAppComponent = mPropertyBag.selector.appComponent || Utils.getAppComponentForControl(mPropertyBag.selector);
			if (!oAppComponent) {
				return logAndReject("App Component could not be determined");
			}
			var oFlexController = FlexControllerFactory.createForControl(oAppComponent);

			if (FlexState.isInitialized({control: oAppComponent})) {
				return oFlexController.saveSequenceOfDirtyChanges(mPropertyBag.changes, oAppComponent);
			}
			return Promise.resolve();
		},

		/**
		 * Builds the {@link sap.ui.fl.Selector} for an element that is not yet available.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance to retrieve the app component
		 * @param {string} mPropertyBag.elementId - ID of the selector
		 * @param {string} mPropertyBag.elementType - Type of the selector
		 * @returns {sap.ui.fl.ElementSelector} - Object that can be used as a {@link sap.ui.fl.Selector}
		 * @private
		 * @ui5-restricted
		 */
		buildSelectorFromElementIdAndType(mPropertyBag) {
			var oAppComponent = Utils.getAppComponentForControl(mPropertyBag.element);
			if (!oAppComponent || !mPropertyBag.elementId || !mPropertyBag.elementType) {
				throw new Error("Not enough information given to build selector.");
			}
			return {
				elementId: mPropertyBag.elementId,
				elementType: mPropertyBag.elementType,
				appComponent: oAppComponent,
				// included for backwards compatibility
				id: mPropertyBag.elementId,
				controlType: mPropertyBag.elementType
			};
		},

		/**
		 * Checks if the data storing implementation for a given layer is capable of handling condensing.
		 *
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if condensing is enabled
		 * @private
		 * @sapui5-restricted sap.ovp
		 */
		isCondensingEnabled() {
			return Settings.getInstance()
			.then(function(oSettings) {
				return oSettings.isCondensingEnabled(Layer.USER);
			});
		},

		/**
		 * Registers the provided callback function to be called when personalization changes are
		 * added for the flex reference that the given control belongs to.
		 *
		 * @param {sap.ui.core.Control} oControl - Reference control to get the flex reference
		 * @param {function} fnCallback - Function to be called on change creation
		 * @private
		 * @sapui5-restricted sap.ui.rta
		 */
		attachChangeCreation(oControl, fnCallback) {
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oControl});
			mChangeCreationListeners[sFlexReference] = (mChangeCreationListeners[sFlexReference] || []).concat(fnCallback);
		},

		/**
		 * Removes a previously registered callback function by reference.
		 *
		 * @param {sap.ui.core.Control} oControl - Reference control to get the flex reference
		 * @param {function} fnCallback - Function reference to be removed
		 * @private
		 * @sapui5-restricted sap.ui.rta
		 */
		detachChangeCreation(oControl, fnCallback) {
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oControl});
			if (Array.isArray(mChangeCreationListeners[sFlexReference])) {
				mChangeCreationListeners[sFlexReference] = mChangeCreationListeners[sFlexReference].filter(function(fnRegisteredCallback) {
					return fnRegisteredCallback !== fnCallback;
				});
			}
		},

		/**
		 * Removes all registered change creation listeners.
		 *
		 * @param {sap.ui.core.Control} [oControl] - When provided, listeners are only removed for the flex reference of the given control
		 * @private
		 * @sapui5-restricted sap.ui.rta
		 */
		detachAllChangeCreationListeners(oControl) {
			if (oControl) {
				var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oControl});
				delete mChangeCreationListeners[sFlexReference];
			} else {
				mChangeCreationListeners = {};
			}
		}
	};

	return ControlPersonalizationWriteAPI;
});

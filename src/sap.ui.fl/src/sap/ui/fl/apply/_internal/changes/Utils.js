/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/flexObjects/AnnotationChange",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/requireAsync",
	"sap/ui/fl/Utils"
], function(
	ApplyStrategyFactory,
	FlexCustomData,
	AnnotationChange,
	AppDescriptorChange,
	ChangeHandlerStorage,
	requireAsync,
	FlUtils
) {
	"use strict";

	/**
	 * Util class for Applier/ChangeReverter.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.Utils
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
	 */

	 function isDependencyStillValid(oChange, bHasChangeApplyFinishedCustomData) {
		// if change is already applied OR if apply process has started,
		// then dependency is no more valid
		if (bHasChangeApplyFinishedCustomData || oChange.hasApplyProcessStarted()) {
			return false;
		}
		return true;
	}

	const Utils = {
		/**
		 * Returns the control map containing control, controlType, bTemplateAffected and originalControl
		 *
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change to be evaluated if template is affected
		 * @param {sap.ui.core.Control} oControl - Control that is the target of the passed change
		 * @param {object} mPropertyBag - Contains additional data that are needed for reading of changes
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Component instance that is currently loading
		 * @param {object} mPropertyBag.view - The currently loaded view
		 * @returns {object} Contains the information about the control
		 * @private
		 */
		getControlIfTemplateAffected(oChange, oControl, mPropertyBag) {
			const oModifier = mPropertyBag.modifier;
			const mControl = {
				originalControl: oControl
			};
			const oOriginalDependentSelector = oChange.getOriginalSelector();
			if (oChange.getContent().boundAggregation && oOriginalDependentSelector) {
				mControl.control = oModifier.bySelector(oOriginalDependentSelector, mPropertyBag.appComponent, mPropertyBag.view);
				mControl.controlType = oModifier.getControlType(mControl.control);
				mControl.bTemplateAffected = true;
			} else {
				mControl.control = oControl;
				mControl.controlType = oModifier.getControlType(oControl);
				mControl.bTemplateAffected = false;
			}
			return mControl;
		},

		/**
		 * Fetches the change handler for a specific flex object or for the given parameters (e.g. for UI changes
		 * or when the flex object is not available yet).
		 * If the change handler is currently being registered, the function waits for the registration.
		 *
		 * @param {object} mPropertyBag - Data required to retrieve the change handler
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} [mPropertyBag.flexObject] - Flex object for which the change handler is requested
		 * @param {string} [mPropertyBag.changeType] - Change type of the flex object
		 * @param {sap.ui.core.Control} [mPropertyBag.control] - Control for which the change handler is requested
		 * @param {string} [mPropertyBag.controlType] - Type of the control for which the change handler is requested
		 * @param {string} [mPropertyBag.layer] - Layer of the flex object
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} [mPropertyBag.modifier] - Control tree modifier
		 * @param {boolean} [mPropertyBag.appDescriptorChange] - Whether the flex object is an app descriptor change
		 * @param {boolean} [mPropertyBag.annotationChange] - Whether the flex object is an annotation change
		 * @returns {Promise} Promise resolving with the retrieved change handler or undefined
		 */
		async getChangeHandler(mPropertyBag) {
			const sChangeType = mPropertyBag.changeType || mPropertyBag.flexObject?.getChangeType();
			if (mPropertyBag.flexObject instanceof AppDescriptorChange || mPropertyBag.appDescriptorChange) {
				const mStrategy = mPropertyBag.strategy || await ApplyStrategyFactory.getRuntimeStrategy();
				try {
					const oRegistry = await mStrategy.registry();
					return await oRegistry[sChangeType]?.();
				} catch (oError) {
					mStrategy.handleError(oError);
				}
			} else if (mPropertyBag.flexObject instanceof AnnotationChange || mPropertyBag.annotationChange) {
				return ChangeHandlerStorage.getAnnotationChangeHandler({
					changeType: sChangeType
				});
			} else if (mPropertyBag.control) {
				const sLibraryName = await mPropertyBag.modifier.getLibraryName(mPropertyBag.control);
				// the ChangeHandlerRegistration includes all the predefined ChangeHandlers.
				// With this as a standard import the ChangeHandlers would not be able to access API classes due to circular dependencies.
				// TODO should be removed as soon as the ChangePersistence / FlexController are gone
				const ChangeHandlerRegistration =
					await requireAsync("sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration");
				await ChangeHandlerRegistration.waitForChangeHandlerRegistration(sLibraryName);
				const sLayer = mPropertyBag.layer || mPropertyBag.flexObject?.getLayer();
				return ChangeHandlerStorage.getChangeHandler(
					sChangeType, mPropertyBag.controlType, mPropertyBag.control, mPropertyBag.modifier, sLayer
				);
			}
			return undefined;
		},

		checkIfDependencyIsStillValid(oAppComponent, oModifier, mChangesMap, sChangeId) {
			const oChange = FlUtils.getChangeFromChangesMap(mChangesMap.mChanges, sChangeId);
			// Change could be deleted after a save (condensing) so it is no longer a relevant dependency
			if (!oChange) {
				return false;
			}
			const oControl = oModifier.bySelector(oChange.getSelector(), oAppComponent);
			// if the control is currently not available,
			// the change is also not applied anymore and the dependency is still valid
			if (!oControl) {
				return true;
			}
			const bHasChangeApplyFinishedCustomData = FlexCustomData.hasChangeApplyFinishedCustomData(oControl, oChange, oModifier);
			return isDependencyStillValid(oChange, bHasChangeApplyFinishedCustomData);
		},

		/**
		 * Checks if the passed change belongs to the given view
		 *
		 * @param {object} mPropertyBag - Additional information
		 * @param {object} mPropertyBag.modifier - Reuse operations handling the changes on the given view type
		 * @param {object} mPropertyBag.appComponent - Application component for the view
		 * @param {object} mPropertyBag.viewId - ID of the view
		 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change instance to check
		 * @returns {boolean} <code>true</code> if the change belongs to the given view
		 */
		isChangeInView(mPropertyBag, oChange) {
			const oModifier = mPropertyBag.modifier;
			const oAppComponent = mPropertyBag.appComponent;
			const oSelector = oChange.getSelector();
			if (!oSelector) {
				return false;
			}
			if (oSelector.viewSelector) {
				const sSelectorViewId = oModifier.getControlIdBySelector(oSelector.viewSelector, oAppComponent);
				return sSelectorViewId === mPropertyBag.viewId;
			}
			const sSelectorId = oSelector.id;
			if (sSelectorId) {
				let sViewId;
				if (oChange.getSelector().idIsLocal) {
					if (oAppComponent) {
						sViewId = oAppComponent.getLocalId(mPropertyBag.viewId);
					}
				} else {
					sViewId = mPropertyBag.viewId;
				}
				let iIndex = 0;
				let sSelectorIdViewPrefix;
				do {
					iIndex = sSelectorId.indexOf("--", iIndex);
					sSelectorIdViewPrefix = sSelectorId.slice(0, iIndex);
					iIndex++;
				} while (sSelectorIdViewPrefix !== sViewId && iIndex > 0);

				return sSelectorIdViewPrefix === sViewId;
			}
			return false;
		}
	};

	return Utils;
});
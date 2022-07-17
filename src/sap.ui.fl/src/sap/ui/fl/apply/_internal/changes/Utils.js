/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/Utils"
], function (
	FlexCustomData,
	ChangeHandlerStorage,
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

	var Utils = {
		/**
		 * Returns the control map containing control, controlType, bTemplateAffected and originalControl
		 *
		 * @param {sap.ui.fl.Change} oChange - Change to be evaluated if template is affected
		 * @param {sap.ui.core.Control} oControl - Control that is the target of the passed change
		 * @param {object} mPropertyBag - Contains additional data that are needed for reading of changes
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Component instance that is currently loading
		 * @param {object} mPropertyBag.view - The currenty loaded view
		 * @returns {object} Contains the information about the control
		 * @private
		 */
		getControlIfTemplateAffected: function (oChange, oControl, mPropertyBag) {
			var oModifier = mPropertyBag.modifier;
			var oChangeDefinition = oChange.getDefinition();
			var mControl = {
				originalControl: oControl
			};
			var oOriginalDependentSelector = oChangeDefinition.dependentSelector && oChangeDefinition.dependentSelector.originalSelector;
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
		 * Fetches the change handler for a specific change and control;
		 * if the change handler is currently being registered the function waits for the registration.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change for which the change handler should be fetched
		 * @param {object} mControl - Object with information about the control
		 * @param {sap.ui.core.Control} mControl.control - Control instance
		 * @param {string} mControl.controlType - Type of the control
		 * @param {object} mPropertyBag - Contains additional data that are needed for fetching the change handler
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @returns {Promise} Promise resolving with the change handler or an empty object
		 */
		getChangeHandler: function(oChange, mControl, mPropertyBag) {
			var sLibraryName = mPropertyBag.modifier.getLibraryName(mControl.control);
			// the ChangeHandlerRegistration includes all the predefined ChangeHandlers.
			// With this as a standard import the ChangeHandlers would not be able to access API classes due to circular dependencies.
			// TODO should be removed as soon as the ChangePersistence / FlexController are gone
			return FlUtils.requireAsync("sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration")

			.then(function(ChangeHandlerRegistration) {
				return ChangeHandlerRegistration.waitForChangeHandlerRegistration(sLibraryName);
			})

			.then(function() {
				var sChangeType = oChange.getChangeType();
				var sLayer = oChange.getLayer();
				return ChangeHandlerStorage.getChangeHandler(sChangeType, mControl.controlType, mControl.control, mPropertyBag.modifier, sLayer);
			});
		},

		checkIfDependencyIsStillValidSync: function(oAppComponent, oModifier, mChangesMap, sChangeId) {
			var oChange = FlUtils.getChangeFromChangesMap(mChangesMap.mChanges, sChangeId);
			var oControl = oModifier.bySelector(oChange.getSelector(), oAppComponent);
			var bHasChangeApplyFinishedCustomData = FlexCustomData.sync.hasChangeApplyFinishedCustomData(oControl, oChange);
			return isDependencyStillValid(oChange, bHasChangeApplyFinishedCustomData);
		},

		checkIfDependencyIsStillValid: function(oAppComponent, oModifier, mChangesMap, sChangeId) {
			var oChange = FlUtils.getChangeFromChangesMap(mChangesMap.mChanges, sChangeId);
			var oControl = oModifier.bySelector(oChange.getSelector(), oAppComponent);
			return FlexCustomData.hasChangeApplyFinishedCustomData(oControl, oChange, oModifier)
				.then(isDependencyStillValid.bind(null, oChange));
		},

		/**
		 * Checks if the passed change belongs to the given view
		 *
		 * @param {object} mPropertyBag - Additional information
		 * @param {object} mPropertyBag.modifier - Reuse operations handling the changes on the given view type
		 * @param {object} mPropertyBag.appComponent - Application component for the view
		 * @param {object} mPropertyBag.viewId - ID of the view
		 * @param {sap.ui.fl.Change} oChange - Change instance to check
		 * @returns {boolean} <code>true</code> if the change belongs to the given view
		 */
		filterChangeByView: function(mPropertyBag, oChange) {
			var oModifier = mPropertyBag.modifier;
			var oAppComponent = mPropertyBag.appComponent;
			var oSelector = oChange.getSelector();
			if (!oSelector) {
				return false;
			}
			if (oSelector.viewSelector) {
				var sSelectorViewId = oModifier.getControlIdBySelector(oSelector.viewSelector, oAppComponent);
				return sSelectorViewId === mPropertyBag.viewId;
			}
			var sSelectorId = oSelector.id;
			if (sSelectorId) {
				var sViewId;
				if (oChange.getSelector().idIsLocal) {
					if (oAppComponent) {
						sViewId = oAppComponent.getLocalId(mPropertyBag.viewId);
					}
				} else {
					sViewId = mPropertyBag.viewId;
				}
				var iIndex = 0;
				var sSelectorIdViewPrefix;
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
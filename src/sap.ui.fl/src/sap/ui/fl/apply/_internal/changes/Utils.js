/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/fl/registry/ChangeRegistry"
], function (
	FlexCustomData,
	FlUtils,
	ChangeHandlerRegistration,
	ChangeRegistry
) {
	"use strict";

	/**
	 * Util class for Applier/ChangeReverter.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.Utils
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
	 */

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
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise/FakePromise resolving with the change handler or an empty object
		 */
		getChangeHandler: function(oChange, mControl, mPropertyBag) {
			var sLibraryName = mPropertyBag.modifier.getLibraryName(mControl.control);
			var oWaitForRegistration = new FlUtils.FakePromise();
			if (ChangeHandlerRegistration.isChangeHandlerRegistrationInProgress(sLibraryName)) {
				oWaitForRegistration = ChangeHandlerRegistration.waitForChangeHandlerRegistration(sLibraryName);
			}
			return oWaitForRegistration.then(function() {
				var sChangeType = oChange.getChangeType();
				var sLayer = oChange.getLayer();
				var oChangeRegistryInstance = ChangeRegistry.getInstance();
				// make sure to use the most current flex settings that have been retrieved during processView
				oChangeRegistryInstance.initSettings();
				return oChangeRegistryInstance.getChangeHandler(sChangeType, mControl.controlType, mControl.control, mPropertyBag.modifier, sLayer);
			});
		},

		checkIfDependencyIsStillValid: function(oAppComponent, oModifier, mChangesMap, sChangeId) {
			var oChange = FlUtils.getChangeFromChangesMap(mChangesMap.mChanges, sChangeId);
			var oControl = oModifier.bySelector(oChange.getSelector(), oAppComponent);

			// if change is already applied OR if apply process has started,
			// then dependency is no more valid
			if (FlexCustomData.hasChangeApplyFinishedCustomData(oControl, oChange, oModifier) || oChange.hasApplyProcessStarted()) {
				return false;
			}
			return true;
		}
	};

	return Utils;
});
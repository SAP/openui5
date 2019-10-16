/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/FlexCustomData",
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
		 * Returns the control map containing control and control type
		 *
		 * @param {sap.ui.fl.Change} oChange - change to be evaluated if template is affected
		 * @param {sap.ui.core.Control} oControl - control which is the target of the passed change
		 * @param {string} sControlType - control type of the given control
		 * @param {map} mPropertyBag - contains additional data that are needed for reading of changes
		 * - {sap.ui.core.util.reflection.BaseTreeModifier} oModifier - The control tree modifier
		 * - {sap.ui.core.Component} oAppComponent - component instance that is currently loading
		 * @returns {map} mControl contains the original selector control of the template and its control type
		 * - control {object}
		 * - originalControl {object}
		 * - controlType {string}
		 * @private
		 */
		getControlIfTemplateAffected: function (oChange, oControl, sControlType, mPropertyBag) {
			var oChangeDefinition = oChange.getDefinition();
			var mControl = {
				originalControl: oControl
			};
			var oOriginalDependentSelector = oChangeDefinition.dependentSelector && oChangeDefinition.dependentSelector.originalSelector;
			if (oChange.getContent().boundAggregation && oOriginalDependentSelector) {
				var oModifier = mPropertyBag.modifier;
				mControl.control = oModifier.bySelector(oOriginalDependentSelector, mPropertyBag.appComponent, mPropertyBag.view);
				mControl.controlType = oModifier.getControlType(mControl.control);
				mControl.bTemplateAffected = true;
			} else {
				mControl.control = oControl;
				mControl.controlType = sControlType;
				mControl.bTemplateAffected = false;
			}
			return mControl;
		},

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
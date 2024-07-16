/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/extend",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	extend,
	Classification
) {
	"use strict";

	/**
	 * Change handler for adding IFrame
	 *
	 * @alias sap.ui.fl.changeHandler.UpdateIFrame
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.72
	 * @private
	 */
	var UpdateIFrame = {};

	const aUpdatableProperties = ["width", "height", "url", "_settings", "advancedSettings"];

	/**
	 * Extract an IFrame control settings.
	 *
	 * @param {object} oModifier Modifier for the controls
	 * @param {sap.ui.fl.util.IFrame} oIFrame IFrame to extract settings from
	 * @return {Promise<object>} Promise returning the settings
	 * @ui5-restricted sap.ui.fl
	 */
	function getIFrameSettings(oModifier, oIFrame) {
		var oSettings = {};
		var aPromises = [];
		aUpdatableProperties.forEach(function(sPropertyName) {
			var oPromise = Promise.resolve()
			.then(oModifier.getProperty.bind(oModifier, oIFrame, sPropertyName))
			.then(function(vValue) {
				oSettings[sPropertyName] = vValue;
			});
			aPromises.push(oPromise);
		});
		return Promise.all(aPromises)
		.then(function() {
			return oSettings;
		});
	}

	/**
	 * Apply settings to the IFrame control.
	 *
	 * @param {object} oModifier Modifier for the controls
	 * @param {sap.ui.fl.util.IFrame} oIFrame IFrame to set settings to
	 * @param {object} mSettings Settings
	 * @returns {Promise} Promise resolving with applySettings
	 * @ui5-restricted sap.ui.fl
	 */
	function applySettings(oModifier, oIFrame, mSettings) {
		var mFullSettings = extend({ _settings: mSettings }, mSettings);
		return Promise.resolve()
		.then(oModifier.applySettings.bind(oModifier, oIFrame, mFullSettings));
	}

	/**
	 * Update the IFrame control settings.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @returns {Promise} Promise resolving with applySettings
	 * @ui5-restricted sap.ui.fl
	 */
	UpdateIFrame.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;

		return oModifier.getControlMetadata(oControl)
		.then(function(oControlMetadata) {
			if (oControlMetadata.getName() !== "sap.ui.fl.util.IFrame") {
				return Promise.reject(new Error("UpdateIFrame only for sap.ui.fl.util.IFrame"));
			}
			return getIFrameSettings(oModifier, oControl);
		})
		.then(function(oOriginalSettings) {
			oChange.setRevertData({
				originalSettings: oOriginalSettings
			});
			return applySettings(oModifier, oControl, oChange.getContent());
		});
	};

	/**
	 * Reverts previously applied change.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @returns {Promise} Promise resolving with change being reverted
	 * @ui5-restricted sap.ui.fl
	 */
	UpdateIFrame.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		return Promise.resolve()
		.then(function() {
			if (mRevertData) {
				// If available, the URL is reverted to before parsing the parameters (saved in "_settings")
				if (mRevertData.originalSettings._settings && mRevertData.originalSettings._settings.url) {
					mRevertData.originalSettings.url = mRevertData.originalSettings._settings.url;
				}
				return applySettings(mPropertyBag.modifier, oControl, mRevertData.originalSettings);
			}
			return Promise.reject(new Error("Attempt to revert an unapplied change."));
		})
		.then(function() {
			oChange.resetRevertData();
		});
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Must contain settings with IFrame properties to update
	 * @param {object} oSpecificChangeInfo.content IFrame settings
	 * @param {string} oSpecificChangeInfo.content.width Width
	 * @param {string} oSpecificChangeInfo.content.height Height
	 * @param {string} oSpecificChangeInfo.content.url Url
	 * @ui5-restricted sap.ui.fl
	 */
	UpdateIFrame.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		if (!oSpecificChangeInfo.content || !Object.keys(oSpecificChangeInfo.content).some(function(sProperty) {
			return aUpdatableProperties.indexOf(sProperty) !== -1;
		})) {
			throw new Error("oSpecificChangeInfo attribute required");
		}
		oChange.setContent(oSpecificChangeInfo.content);
	};

	UpdateIFrame.getCondenserInfo = function(oChange) {
		return {
			classification: Classification.Update,
			affectedControl: oChange.getSelector(),
			uniqueKey: "iFrame",
			updateContent: oChange.getContent()
		};
	};

	return UpdateIFrame;
});

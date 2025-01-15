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
	const UpdateIFrame = {};

	const aUpdatableProperties = ["width", "height", "url", "_settings", "advancedSettings"];

	/**
	 * Extract an IFrame control settings.
	 *
	 * @param {object} oModifier Modifier for the controls
	 * @param {sap.ui.fl.util.IFrame} oIFrame IFrame to extract settings from
	 * @return {Promise<object>} Promise returning the settings
	 * @ui5-restricted sap.ui.fl
	 */
	async function getIFrameSettings(oModifier, oIFrame) {
		const oSettings = {};
		for (const sPropertyName of aUpdatableProperties) {
			const vValue = await oModifier.getProperty(oIFrame, sPropertyName);
			oSettings[sPropertyName] = vValue;
		}
		return oSettings;
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
		const mFullSettings = extend({ _settings: mSettings }, mSettings);
		return oModifier.applySettings(oIFrame, mFullSettings);
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
	UpdateIFrame.applyChange = async function(oChange, oControl, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;

		const oControlMetadata = await oModifier.getControlMetadata(oControl);
		if (oControlMetadata.getName() !== "sap.ui.fl.util.IFrame") {
			throw Error("UpdateIFrame only for sap.ui.fl.util.IFrame");
		}
		const oOriginalSettings = await getIFrameSettings(oModifier, oControl);
		oChange.setRevertData({
			originalSettings: oOriginalSettings
		});
		return applySettings(oModifier, oControl, oChange.getContent());
	};

	/**
	 * Reverts previously applied change.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @returns {Promise<undefined>} Promise resolving with change being reverted
	 * @ui5-restricted sap.ui.fl
	 */
	UpdateIFrame.revertChange = async function(oChange, oControl, mPropertyBag) {
		const mRevertData = oChange.getRevertData();

		if (mRevertData) {
			// If available, the URL is reverted to before parsing the parameters (saved in "_settings")
			if (mRevertData.originalSettings._settings && mRevertData.originalSettings._settings.url) {
				mRevertData.originalSettings.url = mRevertData.originalSettings._settings.url;
			}
			await applySettings(mPropertyBag.modifier, oControl, mRevertData.originalSettings);
			oChange.resetRevertData();
		} else {
			throw Error("Attempt to revert an unapplied change.");
		}
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

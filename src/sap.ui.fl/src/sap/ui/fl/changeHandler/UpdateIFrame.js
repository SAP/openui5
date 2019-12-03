/*!
 * ${copyright}
 */

sap.ui.define([
], function(
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

	var aUpdatableProperties = ["width", "height", "url"];

	/**
	 * Extract an IFrame control settings.
	 *
	 * @param {object} oModifier Modifier for the controls
	 * @param {sap.ui.fl.util.IFrame} oIFrame IFrame to extract settings from
	 * @return {object} Settings
	 * @ui5-restricted sap.ui.fl
	 */
	function getIFrameSettings (oModifier, oIFrame) {
		var oSettings = {};
		aUpdatableProperties.forEach(function (sPropertyName) {
			var vValue = oModifier.getProperty(oIFrame, sPropertyName);
			if (vValue !== undefined) {
				oSettings[sPropertyName] = vValue;
			}
		});
		return oSettings;
	}

	/**
	 * Update the IFrame control settings.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.ui.fl
	 */
	UpdateIFrame.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var oControlMetadata = oModifier.getControlMetadata(oControl);
		if (oControlMetadata.getName() !== "sap.ui.fl.util.IFrame") {
			throw new Error("UpdateIFrame only for sap.ui.fl.util.IFrame");
		}
		oChange.setRevertData({
			originalSettings: getIFrameSettings(oModifier, oControl)
		});
		oModifier.applySettings(oControl, oChangeDefinition.settings);
	};

	/**
	 * Reverts previously applied change.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.ui.fl
	 */
	UpdateIFrame.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();
		if (mRevertData) {
			mPropertyBag.modifier.applySettings(oControl, mRevertData.originalSettings);
			oChange.resetRevertData();
		} else {
			throw new Error("Attempt to revert an unapplied change.");
		}
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Must contain settings with IFrame properties to update
	 * @param {object} oSpecificChangeInfo.content IFrame settings
	 * @param {string} oSpecificChangeInfo.content.width Width
	 * @param {string} oSpecificChangeInfo.content.height Height
	 * @param {string} oSpecificChangeInfo.content.url Url
	 * @ui5-restricted sap.ui.fl
	 */
	UpdateIFrame.completeChangeContent = function (oChange, oSpecificChangeInfo) {
		var oChangeJson = oChange.getDefinition();
		if (!oSpecificChangeInfo.content || !Object.keys(oSpecificChangeInfo.content).some(function (sProperty) {
			return aUpdatableProperties.indexOf(sProperty) !== -1;
		})) {
			throw new Error("oSpecificChangeInfo attribute required");
		}
		oChangeJson.settings = oSpecificChangeInfo.content;
	};

	return UpdateIFrame;
}, /* bExport= */true);

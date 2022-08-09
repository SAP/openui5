/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils"
], function(
	ChangeVisualizationUtils
) {
	"use strict";

	var RenameVisualization = {};

	/**
	 * Creates a localized description for rename changes based on the provided
	 * change handler payload or the current element label.
	 *
	 * @param {object} mPayload - Change visualization payload from the change handler
	 * @param {string} [mPayload.originalLabel] - Label before the change was applied
	 * @param {object} [mPayload.newLabel] - Label after the change was applied
	 * @param {string} sFallbackLabel - New label as a fallback if change handler provides no info
	 * @returns {object} Localized description
	 */
	RenameVisualization.getDescription = function(mPayload, sFallbackLabel) {
		var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sKey = mPayload.originalLabel
			? "TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO"
			: "TXT_CHANGEVISUALIZATION_CHANGE_RENAME_TO";
		var sDescriptionText = oRtaResourceBundle.getText(
			sKey,
			[
				ChangeVisualizationUtils.shortenString(mPayload.newLabel) || sFallbackLabel,
				ChangeVisualizationUtils.shortenString(mPayload.originalLabel)
			]
		);
		var sDescriptionTooltip = oRtaResourceBundle.getText(
			sKey,
			[
				mPayload.newLabel || sFallbackLabel,
				mPayload.originalLabel
			]
		);
		return {
			descriptionText: sDescriptionText,
			descriptionTooltip: sDescriptionTooltip
		};
	};

	return RenameVisualization;
});
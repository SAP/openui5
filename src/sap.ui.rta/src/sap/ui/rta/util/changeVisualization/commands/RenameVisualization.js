/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils"
], function(
	Lib,
	ChangeVisualizationUtils
) {
	"use strict";

	const RenameVisualization = {};

	/**
	 * Creates a localized description for rename changes based on the provided
	 * change handler payload or the current element label.
	 *
	 * @param {object} mPayload - Change visualization description payload from the change handler
	 * @param {string} [mPayload.originalLabel] - Label before the change was applied
	 * @param {object} [mPayload.newLabel] - Label after the change was applied
	 * @param {string} sFallbackLabel - New label as a fallback if change handler provides no info
	 * @returns {object} Localized description
	 */
	RenameVisualization.getDescription = function(mPayload, sFallbackLabel) {
		const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
		const sKey = mPayload.originalLabel
			? "TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO"
			: "TXT_CHANGEVISUALIZATION_CHANGE_RENAME_TO";
		const sDescriptionText = oRtaResourceBundle.getText(
			sKey,
			[
				ChangeVisualizationUtils.shortenString(mPayload.newLabel) || sFallbackLabel,
				ChangeVisualizationUtils.shortenString(mPayload.originalLabel)
			]
		);
		const sDescriptionTooltip = oRtaResourceBundle.getText(
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
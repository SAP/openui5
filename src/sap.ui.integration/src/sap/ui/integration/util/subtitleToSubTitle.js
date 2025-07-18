/*!
 * ${copyright}
 */

sap.ui.define([
], (
) => {
	"use strict";

	/**
	 * Converts the subtitle and subtitleMaxLines properties in the configuration to subTitle and subTitleMaxLines.
	 * This is necessary for consistency in the card header and image overlay configurations when resolving the manifest.
	 *
	 * @param {object} oConfiguration The card configuration object.
	 * @returns {void}
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	function subtitleToSubTitle(oConfiguration) {
		if (oConfiguration?.hasOwnProperty("subtitle")) {
			const sSubtitle = oConfiguration.subtitle;
			delete oConfiguration.subtitle;
			oConfiguration.subTitle = sSubtitle;
		}

		if (oConfiguration?.hasOwnProperty("subtitleMaxLines")) {
			const sSubtitleMaxLines = oConfiguration.subtitleMaxLines;
			delete oConfiguration.subtitleMaxLines;
			oConfiguration.subTitleMaxLines = sSubtitleMaxLines;
		}
	}

	return subtitleToSubTitle;
});
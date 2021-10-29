/*
 * ! ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	var MoveVisualization = {};

	/**
	 * Creates a localized description and button text for move changes based on the provided
	 * current element label.
	 *
	 * @param {object} mPayload - Change visualization payload from the change handler
	 * @param {string} sLabel - Change handler label
	 * @returns {object} Localized description text and button text
	 */
	MoveVisualization.getDescription = function (mPayload, sLabel) {
		var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sDescriptionText = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", sLabel);
		var sButtonText = oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE");
		return { descriptionText: sDescriptionText, buttonText: sButtonText};
	};

	return MoveVisualization;
});
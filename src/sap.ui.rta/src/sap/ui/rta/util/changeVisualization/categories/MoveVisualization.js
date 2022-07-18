/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	ChangeVisualizationUtils,
	JsControlTreeModifier
) {
	"use strict";

	var MoveVisualization = {};

	/**
	 * Creates a localized description and button text for move changes based on the provided
	 * current element label.
	 *
	 * @param {object} mPayload - Change visualization payload from the change handler
	 * @param {string} sLabel - Change handler label
	 * @param {object} mPropertyBag - Additional properties
	 * @returns {object} Localized description text and button text
	 */
	MoveVisualization.getDescription = function(mPayload, sLabel, mPropertyBag) {
		var oRtaResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sDescriptionText = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE_WITHIN", ChangeVisualizationUtils.shortenString(sLabel));
		var sDescriptionTooltip = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE_WITHIN", sLabel);
		var sButtonText;
		var oAppComponent = mPropertyBag.appComponent;
		var sSourceParentId = (
			mPayload.sourceParentContainer
			&& JsControlTreeModifier.getControlIdBySelector(mPayload.sourceParentContainer, oAppComponent)
		);
		var sTargetParentId = (
			mPayload.targetParentContainer
			&& JsControlTreeModifier.getControlIdBySelector(mPayload.targetParentContainer, oAppComponent)
		);

		if (sSourceParentId !== sTargetParentId) {
			sDescriptionText = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", ChangeVisualizationUtils.shortenString(sLabel));
			sDescriptionTooltip = (sSourceParentId && oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", sLabel)) || "";
			sButtonText = sSourceParentId && oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE");
		}
		return { descriptionText: sDescriptionText, descriptionTooltip: sDescriptionTooltip, buttonText: sButtonText };
	};

	return MoveVisualization;
});
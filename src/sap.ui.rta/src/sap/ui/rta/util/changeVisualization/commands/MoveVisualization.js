/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Lib"
], function(
	ChangeVisualizationUtils,
	JsControlTreeModifier,
	Lib
) {
	"use strict";

	var MoveVisualization = {};

	/**
	 * Creates a localized description and button text for move changes based on the provided
	 * current element label.
	 *
	 * @param {object} mPayload - Change visualization description payload from the change handler
	 * @param {string} mPayload.sourceContainer - container from where the element was moved
	 * @param {string} mPayload.targetContainer - container to where the element was moved
	 * @param {string} sLabel - Change handler label
	 * @param {object} mPropertyBag - Additional properties
	 * @returns {object} Localized description text and button text
	 */
	MoveVisualization.getDescription = function(mPayload, sLabel, mPropertyBag) {
		var oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
		var sDescriptionText = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE_WITHIN", [ChangeVisualizationUtils.shortenString(sLabel)]);
		var sDescriptionTooltip = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE_WITHIN", [sLabel]);
		var sButtonText;
		var oAppComponent = mPropertyBag.appComponent;

		var sSourceId = (
			mPayload.sourceContainer
			&& JsControlTreeModifier.getControlIdBySelector(mPayload.sourceContainer, oAppComponent)
		);
		var sTargetId = (
			mPayload.targetContainer
			&& JsControlTreeModifier.getControlIdBySelector(mPayload.targetContainer, oAppComponent)
		);

		if (sSourceId !== sTargetId) {
			sDescriptionText = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", [ChangeVisualizationUtils.shortenString(sLabel)]);
			sDescriptionTooltip = (sSourceId && oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", [sLabel])) || "";
			sButtonText = sSourceId && oRtaResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE");
		}
		return { descriptionText: sDescriptionText, descriptionTooltip: sDescriptionTooltip, buttonText: sButtonText };
	};

	return MoveVisualization;
});
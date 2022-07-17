/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/ElementUtil",
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils"
], function(
	Core,
	JsControlTreeModifier,
	ElementUtil,
	ChangeVisualizationUtils
) {
	"use strict";

	var oRtaResourceBundle = Core.getLibraryResourceBundle("sap.ui.rta");

	var CombineVisualization = {};

	/**
	 * Creates a localized description for combine changes based on the provided
	 * payload containing the combined elements.
	 *
	 * @param {object} mPayload - Change visualization payload from the change handler
	 * @param {array.<string>} mPayload.originalSelectors - Selectors of the elements that were combined
	 * @param {string} sLabel - Current element label
	 * @param {object} mPropertyBag - Additional properties
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component
	 * @returns {object} Map containing localized description text and tooltip
	 */
	CombineVisualization.getDescription = function (mPayload, sLabel, mPropertyBag) {
		var iOriginalSelectorCount = (mPayload.originalSelectors || []).length;
		if (iOriginalSelectorCount < 2) {
			// Fallback if no payload was provided
			return {
				descriptionText: oRtaResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE",
					[ChangeVisualizationUtils.shortenString(sLabel)]
				),
				descriptionTooltip: oRtaResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE",
					[sLabel]
				)
			};
		}

		var oAppComponent = mPropertyBag.appComponent;
		var aOriginalSelectors = mPayload.originalSelectors;
		var aLabels = aOriginalSelectors.map(function (oSelector) {
			var sId = JsControlTreeModifier.getControlIdBySelector(oSelector, oAppComponent);
			var oControl = Core.byId(sId);
			return oControl ? ElementUtil.getLabelForElement(oControl) : sId;
		});
		var aShortLabels = aLabels.map(ChangeVisualizationUtils.shortenString);

		if (iOriginalSelectorCount === 2) {
			return {
				descriptionText: oRtaResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_TWO",
					aShortLabels
				),
				descriptionTooltip: oRtaResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_TWO",
					aLabels
				)
			};
		}

		return {
			descriptionText: oRtaResourceBundle.getText(
				"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_MANY",
				[aLabels.length]
			),
			descriptionTooltip: aLabels
				.map(function(sLabel) {
					return "\"" + sLabel + "\"";
				})
				.join(",\n")
		};
	};

	return CombineVisualization;
});
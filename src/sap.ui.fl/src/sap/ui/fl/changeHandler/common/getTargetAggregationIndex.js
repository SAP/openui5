/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Get the target aggregation index (or default it if not found)
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control:
	 * the definition must contains a targetAggregation and index.
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @return {number} Target aggregation index to insert the control
	 * @ui5-restricted sap.ui.fl
	 */
	return function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var sAggregationName = oChangeDefinition.content.targetAggregation;
		var iIndex = oChangeDefinition.content.index;
		if (iIndex === undefined) {
			var aAggregationContent = oModifier.getAggregation(oControl, sAggregationName);
			iIndex = aAggregationContent.length /* last by default */;
		}
		return iIndex;
	};
});

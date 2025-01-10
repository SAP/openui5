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
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control:
	 * the definition must contains a targetAggregation and index.
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @return {Promise} Promise resolving with target aggregation index to insert the control
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	return async function(oChange, oControl, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		const oChangeContent = oChange.getContent();
		const sAggregationName = oChangeContent.targetAggregation;
		const iIndex = oChangeContent.index;

		if (iIndex === undefined) {
			const aAggregationContent = await oModifier.getAggregation(oControl, sAggregationName);
			return aAggregationContent.length; /* last by default */
		}
		return iIndex;
	};
});

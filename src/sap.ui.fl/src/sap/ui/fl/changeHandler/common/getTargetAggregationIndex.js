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
	 * @return {Promise} Promise resolving with target aggregation index to insert the control
	 * @ui5-restricted sap.ui.fl
	 */
	return function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeContent = oChange.getContent();
		var sAggregationName = oChangeContent.targetAggregation;
		var iIndex = oChangeContent.index;

		if (iIndex === undefined) {
			return Promise.resolve()
				.then(oModifier.getAggregation.bind(oModifier, oControl, sAggregationName))
				.then(function(aAggregationContent) {
					return aAggregationContent.length; /* last by default */
				});
		}
		return Promise.resolve(iIndex);
	};
});

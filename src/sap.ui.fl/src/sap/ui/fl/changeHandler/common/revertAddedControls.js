/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils"
], function(
	Utils
) {
	"use strict";

	/**
	 * Restores the previous state of the control, removing the content of the fragment
	 * from the aggregation
	 *
	 * @param {object} oChange Change object with instructions to be applied on the control
	 * @param {object} oControl Control which has been determined by the selector id
	 * @param {object} mPropertyBag Property bag
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent App component
	 * @param {object} mPropertyBag.view Root view
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	return async function(oChange, oControl, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		let sAggregationName = oChange.getContent().targetAggregation;
		const oView = mPropertyBag.view || Utils.getViewForControl(oControl);
		const oAppComponent = mPropertyBag.appComponent;
		const aRevertData = oChange.getRevertData() || [];

		for (const vRevertData of aRevertData) {
			let sControlId;
			if (typeof vRevertData === "string") {
				sControlId = vRevertData;
			} else {
				sControlId = vRevertData.id;
				sAggregationName ||= vRevertData.aggregationName;
			}
			// when we apply the change in XML and revert in JS, the saved ID is not yet concatenated with the view
			const oControlToRemove = oModifier.bySelector(sControlId, oAppComponent, oView)
				|| (oView?.createId && oModifier.bySelector(oView.createId(sControlId)));
			if (oControlToRemove.destroy) {
				oControlToRemove.destroy();
			}
			await oModifier.removeAggregation(oControl, sAggregationName, oControlToRemove);
		}
		oChange.resetRevertData();
	};
});

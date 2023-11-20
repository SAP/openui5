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
	 * @return {Promise} Promise resolving to true if change has been reverted successfully
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	return function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var sAggregationName = oChange.getContent().targetAggregation;
		var oView = mPropertyBag.view || Utils.getViewForControl(oControl);
		var oAppComponent = mPropertyBag.appComponent;
		var aRevertData = oChange.getRevertData() || [];

		return aRevertData.reduce(function(oPreviousPromise, vRevertData) {
			return oPreviousPromise.then(function() {
				var sControlId;
				if (typeof vRevertData === "string") {
					sControlId = vRevertData;
				} else {
					sControlId = vRevertData.id;
					sAggregationName ||= vRevertData.aggregationName;
				}
				// when we apply the change in XML and revert in JS, the saved ID is not yet concatenated with the view
				return oModifier.bySelector(sControlId, oAppComponent, oView) || oView && oView.createId && oModifier.bySelector(oView.createId(sControlId));
			}).then(function(oControlToRemove) {
				if (oControlToRemove.destroy) {
					return oControlToRemove.destroy();
				}
				return oModifier.removeAggregation(oControl, sAggregationName, oControlToRemove);
			});
		}, Promise.resolve())
		.then(function() {
			oChange.resetRevertData();
		});
	};
});

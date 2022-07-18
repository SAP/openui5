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
	 * @ui5-restricted sap.ui.fl
	 */
	return function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeContent = oChange.getContent();
		var sAggregationName = oChangeContent.targetAggregation;
		var oView = mPropertyBag.view || Utils.getViewForControl(oControl);
		var oAppComponent = mPropertyBag.appComponent;
		var aRevertData = oChange.getRevertData() || [];
		var aControlsToRemove = aRevertData.map(function (vRevert) {
			var sControlId;
			if (typeof vRevert === "string") {
				sControlId = vRevert;
			} else {
				sControlId = vRevert.id;
				sAggregationName = sAggregationName || vRevert.aggregationName;
			}
			// when we apply the change in XML and revert in JS, the saved ID is not yet concatinated with the view
			return oModifier.bySelector(sControlId, oAppComponent, oView) || oView && oView.createId && oModifier.bySelector(oView.createId(sControlId));
		});

		var aPromises = [];
		aControlsToRemove.forEach(function(oControlToRemove) {
			var fnPromise = function() {
				return Promise.resolve()
					.then(oModifier.removeAggregation.bind(oModifier, oControl, sAggregationName, oControlToRemove))
					.then(function() {
						if (oControlToRemove.destroy) {
							oControlToRemove.destroy();
						}
					});
			};
			aPromises.push(fnPromise);
		});

		return Utils.execPromiseQueueSequentially(aPromises, true, true)
			.then(function() {
				oChange.resetRevertData();
				return true;
			});
	};
});

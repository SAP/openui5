/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LayerUtils"
], function(
	LayerUtils
) {
	"use strict";

	/**
	 * Change handler for stashing of a control.
	 * @alias sap.ui.fl.changeHandler.StashControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var StashControl = {};

	/**
	 * Stashes and hides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @public
	 */
	StashControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var bStashed = mPropertyBag.modifier.getStashed(oControl);
		var iOriginalIndex = mPropertyBag.modifier.findIndexInParentAggregation(oControl);
		this.setChangeRevertData(oChange, bStashed, iOriginalIndex);

		if (LayerUtils.isDeveloperLayer(oChange.getLayer())) {
			mPropertyBag.modifier.setStashed(oControl, true);
		} else {
			mPropertyBag.modifier.setVisible(oControl, false);
		}
	};

	/**
	 * Reverts previously applied change
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @public
	 */
	StashControl.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		if (LayerUtils.isDeveloperLayer(oChange.getLayer())) {
			var oUnstashedControl = mPropertyBag.modifier.setStashed(oControl, mRevertData.originalValue, mPropertyBag.appComponent);
			if (oUnstashedControl) {
				var iUnstashedIndex = mPropertyBag.modifier.findIndexInParentAggregation((oUnstashedControl));
				if (iUnstashedIndex !== mRevertData.originalIndex) {
					var oParent = mPropertyBag.modifier.getParent(oUnstashedControl);
					var sAggregationName = mPropertyBag.modifier.getParentAggregationName(oUnstashedControl);
					mPropertyBag.modifier.removeAggregation(oParent, sAggregationName, oUnstashedControl);
					mPropertyBag.modifier.insertAggregation(oParent, sAggregationName, oUnstashedControl, mRevertData.originalIndex);
				}
			}
		} else {
			mPropertyBag.modifier.setVisible(oControl, !mRevertData.originalValue);
		}
		oChange.resetRevertData();
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object to be completed
	 * @param {object} oSpecificChangeInfo - As an empty object since no additional attributes are required for this operation
	 * @public
	 */
	StashControl.completeChangeContent = function() {};

	StashControl.setChangeRevertData = function(oChange, bValue, iOriginalIndex) {
		oChange.setRevertData({
			originalValue: bValue,
			originalIndex: iOriginalIndex
		});
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} Condenser specific information
	 * @public
	 */
	StashControl.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: sap.ui.fl.condenser.Classification.Reverse,
			uniqueKey: "stashed"
		};
	};

	return StashControl;
});

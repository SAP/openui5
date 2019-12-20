/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log"
], function(
	Log
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
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag	- map of properties
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @returns {boolean} true - if change could be applied
	 * @public
	 */
	StashControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var bStashed = mPropertyBag.modifier.getStashed(oControl);
		var iOriginalIndex = mPropertyBag.modifier.findIndexInParentAggregation(oControl);
		this.setChangeRevertData(oChange, bStashed, iOriginalIndex);
		mPropertyBag.modifier.setStashed(oControl, true);
		return true;
	};

	/**
	 * Reverts previously applied change
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag	- map of properties
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @returns {boolean} true - if change has been reverted
	 * @public
	 */
	StashControl.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		if (mRevertData) {
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
			oChange.resetRevertData();
		} else {
			Log.error("Attempt to revert an unapplied change.");
			return false;
		}

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	StashControl.completeChangeContent = function() {
	};

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
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	StashControl.getCondenserInfo = function(/* oChange */) {
		return {
			classificationType: sap.ui.fl.ClassificationType.Reverse,
			uniqueKey: "stashed"
		};
	};

	return StashControl;
},
/* bExport= */true);

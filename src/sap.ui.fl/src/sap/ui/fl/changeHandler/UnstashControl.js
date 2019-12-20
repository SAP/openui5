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
	 * Change handler for unstashing of a control.
	 * @alias sap.ui.fl.changeHandler.UnstashControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var UnstashControl = { };

	/**
	 * Unstashes and shows a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 */
	UnstashControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var mContent = oChange.getContent();
		var oModifier = mPropertyBag.modifier;
		var bStashed = false;

		oChange.setRevertData({
			originalValue: mPropertyBag.modifier.getStashed(oControl)
		});

		var oUnstashedControl = oModifier.setStashed(oControl, bStashed, mPropertyBag.appComponent) || oControl;

		//old way including move, new way will have separate move change
		//only applicable for XML modifier
		if (mContent.parentAggregationName) {
			var sTargetAggregation = mContent.parentAggregationName;
			var oTargetParent = oModifier.getParent(oUnstashedControl);
			oModifier.removeAggregation(oTargetParent, sTargetAggregation, oUnstashedControl);
			oModifier.insertAggregation(oTargetParent, sTargetAggregation, oUnstashedControl, mContent.index, mPropertyBag.view);
		}
		return oUnstashedControl;
	};

	/**
	 * Reverts previously applied change
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @return {boolean} true - if change has been reverted
	 * @public
	 */
	UnstashControl.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		if (mRevertData) {
			mPropertyBag.modifier.setStashed(oControl, mRevertData.originalValue);
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
	UnstashControl.completeChangeContent = function(oChange, oSpecificChangeInfo) {
		var oChangeJson = oChange.getDefinition();

		if (oSpecificChangeInfo.content) {
			//old way including move, new way will have seperate move change
			oChangeJson.content = oSpecificChangeInfo.content;
		}
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	UnstashControl.getCondenserInfo = function(/* oChange */) {
		return {
			classificationType: sap.ui.fl.ClassificationType.Reverse,
			uniqueKey: "stashed"
		};
	};

	return UnstashControl;
},
/* bExport= */true);

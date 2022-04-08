/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	CondenserClassification
) {
	"use strict";

	/**
	 * Change handler for unstashing of a control.
	 * @alias sap.ui.fl.changeHandler.UnstashControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var UnstashControl = {};

	/**
	 * Unstashes and shows a control.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @returns {sap.ui.core.Control} Returns the unstashed control
	 * @public
	 */
	UnstashControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var mContent = oChange.getContent();
		var oModifier = mPropertyBag.modifier;
		var bStashed = false;
		var oUnstashedControl;

		return Promise.resolve()
			.then(oModifier.getStashed.bind(oModifier, oControl))
			.then(function(bPreviouslyStashed) {
				oChange.setRevertData({
					originalValue: bPreviouslyStashed
				});
				oUnstashedControl = oModifier.setStashed(oControl, bStashed, mPropertyBag.appComponent) || oControl;
				//old way including move, new way will have separate move change
				//only applicable for XML modifier
				if (mContent.parentAggregationName) {
					var sTargetAggregation = mContent.parentAggregationName;
					var oTargetParent = oModifier.getParent(oUnstashedControl);
					return Promise.resolve()
						.then(oModifier.removeAggregation.bind(oModifier, oTargetParent, sTargetAggregation, oUnstashedControl))
						.then(oModifier.insertAggregation.bind(oModifier, oTargetParent, sTargetAggregation, oUnstashedControl, mContent.index, mPropertyBag.view));
				}
				return undefined;
			})
			.then(function() {
				return oUnstashedControl;
			});
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
	UnstashControl.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();
		mPropertyBag.modifier.setStashed(oControl, mRevertData.originalValue);
		oChange.resetRevertData();
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object to be completed
	 * @param {object} oSpecificChangeInfo - As an empty object since no additional attributes are required for this operation
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
	 * @returns {object} - Condenser specific information
	 * @public
	 */
	UnstashControl.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: CondenserClassification.Reverse,
			uniqueKey: "stashed"
		};
	};

	return UnstashControl;
});

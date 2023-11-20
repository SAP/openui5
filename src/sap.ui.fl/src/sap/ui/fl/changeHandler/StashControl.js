/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	LayerUtils,
	CondenserClassification,
	JsControlTreeModifier
) {
	"use strict";

	/**
	 * Change handler for stashing of a control.
	 * @alias sap.ui.fl.changeHandler.StashControl
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.27.0
	 */
	var StashControl = {};

	/**
	 * Stashes and hides a control.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @returns {Promise} Promise resolving when the change is applied.
	 * @public
	 */
	StashControl.applyChange = async function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;

		const bStashed = await oModifier.getStashed(oControl);
		const iOriginalIndex = await oModifier.findIndexInParentAggregation(oControl);
		this.setChangeRevertData(oChange, bStashed, iOriginalIndex);
		if (LayerUtils.isDeveloperLayer(oChange.getLayer())) {
			return oModifier.setStashed(oControl, true);
		}
		return oModifier.setVisible(oControl, false);
	};

	/**
	 * Reverts previously applied change
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @returns {Promise} Promise resolving when change is reverted
	 * @public
	 */
	StashControl.revertChange = async function(oChange, oControl, mPropertyBag) {
		const mRevertData = oChange.getRevertData();
		const oModifier = mPropertyBag.modifier;
		if (LayerUtils.isDeveloperLayer(oChange.getLayer())) {
			const oUnstashedControl = oModifier.setStashed(oControl, mRevertData.originalValue, mPropertyBag.appComponent);
			if (oUnstashedControl) {
				const iUnstashedIndex = await oModifier.findIndexInParentAggregation(oUnstashedControl);
				if (iUnstashedIndex !== mRevertData.originalIndex) {
					const oParent = oModifier.getParent(oUnstashedControl);
					const sAggregationName = await oModifier.getParentAggregationName(oUnstashedControl);
					await oModifier.moveAggregation(
						oParent,
						sAggregationName,
						oParent,
						sAggregationName,
						oUnstashedControl,
						mRevertData.originalIndex);
				}
			}
		}
		oModifier.setVisible(oControl, !mRevertData.originalValue);
		oChange.resetRevertData();
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object to be completed
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
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} Condenser specific information
	 * @public
	 */
	StashControl.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: CondenserClassification.Reverse,
			uniqueKey: "stashed"
		};
	};

	StashControl.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oSelector = oChange.getSelector();
		const oElement = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		return {
			affectedControls: [oSelector],
			displayControls: [oElement.getParent().getId()]
		};
	};

	return StashControl;
});

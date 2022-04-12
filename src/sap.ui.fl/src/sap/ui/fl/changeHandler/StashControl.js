/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/changeHandler/JsControlTreeModifier"
], function(
	LayerUtils,
	JsControlTreeModifier
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
	 * @returns {Promise} Promise resolving when the change is applied.
	 * @public
	 */
	StashControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var bStashed;
		var oModifier = mPropertyBag.modifier;

		return Promise.resolve()
			.then(oModifier.getStashed.bind(oModifier, oControl))
			.then(function(bRetrievedStashed) {
				bStashed = bRetrievedStashed;
				return oModifier.findIndexInParentAggregation(oControl);
			})
			.then(function(iOriginalIndex) {
				this.setChangeRevertData(oChange, bStashed, iOriginalIndex);
				if (LayerUtils.isDeveloperLayer(oChange.getLayer())) {
					return oModifier.setStashed(oControl, true);
				}
				return oModifier.setVisible(oControl, false);
			}.bind(this));
	};

	function fnHandleUnstashedControl(iUnstashedIndex, mRevertData, oUnstashedControl, oModifier) {
		var sAggregationName;
		if (iUnstashedIndex !== mRevertData.originalIndex) {
			var oParent = oModifier.getParent(oUnstashedControl);
			return Promise.return()
				.then(oModifier.getParentAggregationName.bind(oModifier, oUnstashedControl))
				.then(function(sRetrievedAggregationName) {
					sAggregationName = sRetrievedAggregationName;
					return oModifier.removeAggregation(oParent, sAggregationName, oUnstashedControl);
				})
				.then(oModifier.insertAggregation.bind(oModifier, oParent, sAggregationName, oUnstashedControl, mRevertData.originalIndex));
		}
		return Promise.resolve();
	}

	/**
	 * Reverts previously applied change
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @returns {Promise} Promise resolving when change is reverted
	 * @public
	 */
	StashControl.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();
		var oModifier = mPropertyBag.modifier;

		return Promise.resolve()
			.then(function() {
				if (LayerUtils.isDeveloperLayer(oChange.getLayer())) {
					var oUnstashedControl = oModifier.setStashed(oControl, mRevertData.originalValue, mPropertyBag.appComponent);
					if (oUnstashedControl) {
						return Promise.resolve()
							.then(oModifier.findIndexInParentAggregation.bind(oModifier, oUnstashedControl))
							.then(function(iUnstashedIndex) {
								return fnHandleUnstashedControl(iUnstashedIndex, mRevertData, oUnstashedControl, oModifier);
							});
					}
					return Promise.resolve();
				}
				return oModifier.setVisible(oControl, !mRevertData.originalValue);
			})
			.then(function() {
				oChange.resetRevertData();
			});
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

	StashControl.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oSelector = oChange.getSelector();
		var oElement = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		return {
			affectedControls: [oSelector],
			displayControls: [oElement.getParent().getId()]
		};
	};

	return StashControl;
});

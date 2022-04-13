/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/condenser/Classification",
	'sap/ui/fl/changeHandler/JsControlTreeModifier'
], function(
	Log,
	CondenserClassification,
	JsControlTreeModifier
) {
	"use strict";

	var PROPERTY_NAME = "visible";

	/**
	 * Change handler for hiding of a control.
	 * @alias sap.ui.fl.changeHandler.HideControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var HideControl = {};

	/**
	 * Hides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @return {Promise} Promise resolving when change is applied
	 * @public
	 */
	HideControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		return Promise.resolve()
			.then(oModifier.getVisible.bind(oModifier, oControl))
			.then(function(bVisible) {
				oChange.setRevertData({
					originalValue: bVisible
				});
				oModifier.setVisible(oControl, false);
			});
	};


	/**
	 * Reverts previously applied change
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag	- map of properties
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @return {Promise} Promise resolving when change was successfully reverted
	 * @public
	 */
	HideControl.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		return Promise.resolve()
			.then(function() {
				if (mRevertData) {
					mPropertyBag.modifier.setVisible(oControl, mRevertData.originalValue);
					oChange.resetRevertData();
				} else {
					Log.error("Attempt to revert an unapplied change.");
				}
			});
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	HideControl.completeChangeContent = function() {
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	HideControl.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: CondenserClassification.Reverse,
			uniqueKey: PROPERTY_NAME
		};
	};

	HideControl.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oSelector = oChange.getSelector();
		var oElement = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		return {
			affectedControls: [oSelector],
			displayControls: [oElement.getParent().getId()]
		};
	};

	return HideControl;
},
/* bExport= */true);

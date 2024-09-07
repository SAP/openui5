/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	Log,
	JsControlTreeModifier,
	CondenserClassification
) {
	"use strict";

	var PROPERTY_NAME = "visible";

	/**
	 * Change handler for unhiding of a control.
	 * @alias sap.ui.fl.changeHandler.UnhideControl
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.27.0
	 */
	var UnhideControl = {};

	/**
	 * Unhides a control.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - property bag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @return {Promise} Promise resolving when the change is applied successfully
	 * @public
	 */
	UnhideControl.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		return Promise.resolve()
		.then(oModifier.getProperty.bind(oModifier, oControl, PROPERTY_NAME))
		.then(function(oOriginalValue) {
			oChange.setRevertData({
				originalValue: oOriginalValue
			});
			mPropertyBag.modifier.setVisible(oControl, true);
		});
	};

	/**
	 * Reverts previously applied change
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - property bag
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @public
	 */
	UnhideControl.revertChange = function(oChange, oControl, mPropertyBag) {
		var mRevertData = oChange.getRevertData();

		if (mRevertData) {
			mPropertyBag.modifier.setVisible(oControl, mRevertData.originalValue);
			oChange.resetRevertData();
		} else {
			Log.error("Attempt to revert an unapplied change.");
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	UnhideControl.completeChangeContent = function() {
	};

	/**
	 * Retrieves the condenser specific information
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser specific information
	 * @public
	 */
	UnhideControl.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: CondenserClassification.Reverse,
			uniqueKey: PROPERTY_NAME
		};
	};

	UnhideControl.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oSelector = oChange.getSelector();
		const oElement = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		const oReturn = {
			updateRequired: true
		};

		function findFirstVisibleParent(oControl) {
			if (!oControl) {
				return null;
			}

			if (oControl.getVisible?.()) {
				return oControl;
			}

			return findFirstVisibleParent(oControl.getParent());
		}

		// If the element is currently invisible (e.g. after being added and removed again),
		// the indicator should be on its first visible parent
		if (!oElement.getVisible()) {
			const oFirstVisibleParent = findFirstVisibleParent(oElement.getParent());
			if (oFirstVisibleParent) {
				oReturn.displayControls = [oFirstVisibleParent.getId()];
			}
		}
		return oReturn;
	};

	return UnhideControl;
});

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/library"
], function (flLibrary) {
	"use strict";

	/**
	 * Change handler for changing sap.m.IconTabBar selected tab filter
	 *
	 * @alias sap.m.changeHandler.SelectIconTabBarFilter
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.96
	 */
	var SelectIconTabBarFilter = {};

	/**
	 * Changes sap.m.IconTabBar selectedKey property
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.IconTabBar} oControl - Icon Tab Bar in which the selected tab should be changed
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 *
	 * @public
	 */
	SelectIconTabBarFilter.applyChange = function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeContent = oChange.getContent();

		// Make sure the "select" event of the control is fired.
		// By default it is not fired when the "selectedKey" property is changed,
		// but only via user interaction
		oControl._bFireSelectEvent = oChangeContent.fireEvent;
		oModifier.setProperty(oControl, "selectedKey", oChangeContent.selectedKey);
		oControl._bFireSelectEvent = false;

		oChange.setRevertData({key:oChangeContent.previousSelectedKey, fireEvent: oChangeContent.fireEvent});
	};

	/**
	 * Reverts applied change
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.IconTabBar} oControl - Link that matches the change selector for reverting the change
	 * @param {object} mPropertyBag - Property bag containing the modifier and the view
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @public
	 */
	SelectIconTabBarFilter.revertChange = function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oRevertData = oChange.getRevertData();

		// Make sure the "select" event of the control is fired.
		// By default it is not fired when the "selectedKey" property is changed,
		// but only via user interaction
		oControl._bFireSelectEvent = oRevertData.fireEvent;
		oModifier.setProperty(oControl, "selectedKey", oRevertData.key);
		oControl._bFireSelectEvent = false;

		oChange.resetRevertData();
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo - Specific info object
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 *
	 * @public
	 */
	SelectIconTabBarFilter.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {};


	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	SelectIconTabBarFilter.getCondenserInfo = function (oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: flLibrary.condenser.Classification.LastOneWins,
			uniqueKey: oChange.getContent().selectedKey
		};
	};

	return SelectIconTabBarFilter;
});
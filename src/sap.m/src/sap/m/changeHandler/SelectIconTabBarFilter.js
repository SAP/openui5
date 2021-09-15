/*!
 * ${copyright}
 */

sap.ui.define(function () {
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
	 * @return {Promise} Promise resolving when change was successfully applied
	 *
	 * @public
	 */
	SelectIconTabBarFilter.applyChange = function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var sSelectedTab = oChangeDefinition.content;

		return oModifier.getProperty(oControl, "selectedKey").then(function(oProperty){
			var oRevertData = {
				selectedKey: oProperty
			};
			oModifier.setProperty(oControl, "selectedKey", sSelectedTab);
			oChange.setRevertData(oRevertData);
		});

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
		var sSelectedTab = oRevertData.selectedKey;

		oModifier.setProperty(oControl, "selectedKey", sSelectedTab);
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


	return SelectIconTabBarFilter;
});
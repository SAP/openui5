/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * Change handler for changing sap.ui.webc.main.Link target
	 *
	 * @alias sap.ui.webc.main.changeHandler.ChangeLinkTarget
	 * @author SAP SE
	 * @version ${version}
	 */
	var ChangeLinkTarget = {};

	/**
	 * Changes sap.ui.webc.main.Link target property
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.webc.main.Link} oControl - Link which target should be changed
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @return {Promise} Promise resolving when change was successfully applied
	 *
	 * @public
	 */
	ChangeLinkTarget.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var sTarget = oChangeDefinition.content;
		return Promise.resolve()
			.then(oModifier.getProperty.bind(oModifier, oControl, "target"))
			.then(function(oProperty) {
				var oRevertData = {
					target: oProperty
				};
				oModifier.setProperty(oControl, "target", sTarget);
				oChange.setRevertData(oRevertData);
			});
	};

	/**
	 * Reverts applied change.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.webc.main.Link} oControl - Link that matches the change selector for reverting the change
	 * @param {object} mPropertyBag - Property bag containing the modifier and the view
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @public
	 */
	ChangeLinkTarget.revertChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oRevertData = oChange.getRevertData();
		var sTarget = oRevertData.target;
		oModifier.setProperty(oControl, "target", sTarget);
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo - Specific info object
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 *
	 * @public
	 */
	ChangeLinkTarget.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {};


	return ChangeLinkTarget;
});
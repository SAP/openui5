/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * Change handler for changing sap.m.Link target
	 *
	 * @alias sap.m.changeHandler.ChangeLinkTarget
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.71
	 */
	var ChangeLinkTarget = {};

	/**
	 * Changes sap.m.Link target property
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.Link} oControl - Link which target should be changed
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @return {boolean} true if change could be applied
	 *
	 * @public
	 */
	ChangeLinkTarget.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			oChangeDefinition = oChange.getDefinition(),
			sTarget = oChangeDefinition.content,
			oRevertData = {
				target: oModifier.getProperty(oControl, "target")
			};

		oModifier.setProperty(oControl, "target", sTarget);
		oChange.setRevertData(oRevertData);

		return true;
	};

	/**
	 * Reverts applied change
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.Link} oControl - Link that matches the change selector for reverting the change
	 * @param {object} mPropertyBag - Property bag containing the modifier and the view
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @return {boolean} true if successful
	 * @public
	 */
	ChangeLinkTarget.revertChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			oRevertData = oChange.getRevertData(),
			sTarget = oRevertData.target;

		oModifier.setProperty(oControl, "target", sTarget);

		return true;
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
	ChangeLinkTarget.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {

		return true;
	};


	return ChangeLinkTarget;
});
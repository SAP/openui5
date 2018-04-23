/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base", "sap/ui/fl/Utils"
], function(BaseChangeHandler, Utils) {
	"use strict";

	/**
	 * Change handler for renaming labels and titles inside the FormContainer Control
	 *
	 * @alias sap.ui.layout.changeHandler.RenameFormContainer
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.48
	 * @private
	 * @experimental Since 1.48. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RenameFormContainer = { };

	// Defines object which contains constants used in the handler
	var _CONSTANTS = {
		TARGET_ALIAS: "target"
	};

	/**
	 * Changes the properties on the given control
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper Change object with instructions to be applied on the control
	 * @param {object} oControl The control which has been determined by the selector id
	 * @param {object} mPropertyBag Map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
	 *                                sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
	 * @private
	 */
	RenameFormContainer.applyChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			oChangeDefinition = oChangeWrapper.getDefinition(),
			oRenamedElement = oChangeWrapper.getDependentControl(_CONSTANTS.TARGET_ALIAS, mPropertyBag),
			oTitle = oModifier.getAggregation(oRenamedElement, "title");

		if (oChangeDefinition.texts && oChangeDefinition.texts.formText && this._isProvided(oChangeDefinition.texts.formText.value)) {

			var sValue = oChangeDefinition.texts.formText.value;

			if (typeof oTitle === "string") {
				oModifier.setProperty(oRenamedElement, "title", sValue);
			} else {
				oModifier.setProperty(oTitle, "text", sValue);
			}

			return true;
		} else {
			Utils.log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
			//however subsequent changes should be applied
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo With attribute fieldLabel, the new field label to be included in the change
	 * @param {object} mPropertyBag Map containing the application component
	 * @private
	 */
	RenameFormContainer.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo, mPropertyBag) {
		var oChangeDefinition = oChangeWrapper.getDefinition();

		if (!(oSpecificChangeInfo.renamedElement && oSpecificChangeInfo.renamedElement.id)) {
			throw new Error("Rename of the group cannot be executed: oSpecificChangeInfo.renamedElement attribute required");
		}

		if (!this._isProvided(oSpecificChangeInfo.value)) {
			throw new Error("Rename of the group cannot be executed: oSpecificChangeInfo.value attribute required");
		}

		oChangeWrapper.addDependentControl(oSpecificChangeInfo.renamedElement.id, _CONSTANTS.TARGET_ALIAS, mPropertyBag);
		BaseChangeHandler.setTextInChange(oChangeDefinition, "formText", oSpecificChangeInfo.value, "XGRP");

	};

	RenameFormContainer._isProvided = function(sString){
		return typeof (sString) === "string";
	};

	return RenameFormContainer;
}, /* bExport= */true);
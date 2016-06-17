/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define(["jquery.sap.global", "sap/ui/fl/changeHandler/Base", "sap/ui/fl/Utils"], function(jQuery, Base, Utils) {
	"use strict";

	/**
	 * Change handler for renaming labels and titles inside the SimpleForm Control
	 *
	 * @alias sap.ui.layout.changeHandler.RenameForm
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.40
	 * @private
	 * @experimental Since 1.40. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RenameForm = { };

	/**
	 * Changes the properties on the given control
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper - change object with instructions to be applied on the control
	 * @param {object} oControl - the control which has been determined by the selector id
	 * @param {object} oModifier - control modifier object (either sap.ui.fl.changeHandler.JsControlTreeModifier or
	 *                             sap.ui.fl.changeHandler.XmlTreeModifier)
	 * @param {object} oView - view object where the controls are embedded
	 * @private
	 * @name sap.ui.layout.changeHandler.RenameForm#applyChange
	 */
	RenameForm.applyChange = function(oChangeWrapper, oControl, oModifier, oView) {
		var oChange = oChangeWrapper.getDefinition();
		var sRenameId = oChange.content.sRenameId;
		var oReferrer = oModifier.byId(sRenameId, oView);

		if (this._checkSufficientInfo(oChange, oReferrer)) {
			if (!oControl) {
				throw new Error("no Control provided for renaming");
			}

			var sValue = oChange.texts.formText.value;
			var sPropertyName = "text";

			oModifier.setProperty(oReferrer, sPropertyName, sValue);

			return true;
		} else {
			Utils.log.error("Change does not contain sufficient information to be applied: [" + oChange.layer + "]" + oChange.namespace + "/" + oChange.fileName + "." + oChange.fileType);
			//however subsequent changes should be applied
		}
	};

	/**
	 * Check for sufficient information to apply changes
	 *
	 * @param {object} oChange - change object with instructions to be applied on the control
	 * @param {object} oReferrer - the control which has been determined by the id sRenameId
	 * @private
	 */
	RenameForm._checkSufficientInfo = function(oChange, oReferrer) {
		if (oChange.texts && oChange.texts.formText && this._isProvided(oChange.texts.formText.value) && oReferrer) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo with attribute fieldLabel, the new field label to be included in the change
	 * @private
	 */
	RenameForm.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.sRenameId) {
			oChange.content.sRenameId = oSpecificChangeInfo.sRenameId;
		} else {
			throw new Error("oSpecificChangeInfo.sRenameId attribute required");
		}

		if (this._isProvided(oSpecificChangeInfo.value)) {
			Base.setTextInChange(oChange, "formText", oSpecificChangeInfo.value, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.value attribute required");
		}
	};

	RenameForm._isProvided = function(sString){
		return typeof (sString) === "string";
	};

	return RenameForm;
}, /* bExport= */true);

/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/Log"
], function(
	BaseChangeHandler,
	JsControlTreeModifier,
	Log
) {
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
	 * @param {object} mPropertyBag - map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
	 *                                sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
	 * @private
	 */
	RenameForm.applyChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oChangeDefinition = oChangeWrapper.getDefinition();

		// !important : sRenameId was used in 1.40, do not remove for compatibility!
		var vSelector = oChangeDefinition.content.elementSelector || oChangeDefinition.content.sRenameId;
		var oRenamedElement = oModifier.bySelector(vSelector, oAppComponent, oView);

		if (oChangeDefinition.texts && oChangeDefinition.texts.formText && this._isProvided(oChangeDefinition.texts.formText.value)) {
			if (!oControl) {
				throw new Error("no Control provided for renaming");
			}

			oChangeWrapper.setRevertData(oModifier.getProperty(oRenamedElement, "text"));
			var sValue = oChangeDefinition.texts.formText.value;
			oModifier.setProperty(oRenamedElement, "text", sValue);

			return true;
		} else {
			Log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
			//however subsequent changes should be applied
		}
	};

	/**
	 * Reverts a Rename Change
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag property bag
	 * @param {object} mPropertyBag.modifier modifier for the controls
	 * @returns {boolean} true if successful
	 * @public
	 */
	RenameForm.revertChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var sOldText = oChangeWrapper.getRevertData();
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeDefinition = oChangeWrapper.getDefinition();
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;

		// !important : sRenameId was used in 1.40, do not remove for compatibility!
		var vSelector = oChangeDefinition.content.elementSelector || oChangeDefinition.content.sRenameId;
		var oRenamedElement = oModifier.bySelector(vSelector, oAppComponent, oView);

		if (sOldText || sOldText === "") {
			oModifier.setProperty(oRenamedElement, "text", sOldText);
			// In some cases the SimpleForm does not properly update the value, so the invalidate call is required
			oRenamedElement.getParent().invalidate();
			oChangeWrapper.resetRevertData();
			return true;
		} else {
			Log.error("Change doesn't contain sufficient information to be reverted. Most Likely the Change didn't go through applyChange.");
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper - change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo - with attribute fieldLabel, the new field label to be included in the change
	 * @param {object} mPropertyBag - map containing the application component
	 * @private
	 */
	RenameForm.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo, mPropertyBag) {
		var oChangeDefinition = oChangeWrapper.getDefinition();

		if (!oSpecificChangeInfo.changeType) {
			throw new Error("oSpecificChangeInfo.changeType attribute required");
		}

		if (oSpecificChangeInfo.renamedElement && oSpecificChangeInfo.renamedElement.id) {
			var oRenamedElement = sap.ui.getCore().byId(oSpecificChangeInfo.renamedElement.id);
			var oStableRenamedElement;
			if (oSpecificChangeInfo.changeType === "renameLabel") {
				oStableRenamedElement = oRenamedElement.getLabel();
			} else if (oSpecificChangeInfo.changeType === "renameTitle") {
				oStableRenamedElement = oRenamedElement.getTitle();
			}
			oChangeDefinition.content.elementSelector = JsControlTreeModifier.getSelector(oStableRenamedElement, mPropertyBag.appComponent);
			oChangeWrapper.addDependentControl(oStableRenamedElement, "elementSelector", mPropertyBag);
		} else {
			throw new Error("oSpecificChangeInfo.renamedElement attribute required");
		}

		if (this._isProvided(oSpecificChangeInfo.value)) {
			BaseChangeHandler.setTextInChange(oChangeDefinition, "formText", oSpecificChangeInfo.value, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.value attribute required");
		}
	};

	RenameForm._isProvided = function(sString){
		return typeof (sString) === "string";
	};

	return RenameForm;
}, /* bExport= */true);

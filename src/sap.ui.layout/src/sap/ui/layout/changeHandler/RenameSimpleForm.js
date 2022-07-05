/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/Log"
], function(
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
	 * @returns {Promise} Promise resolving when change is successfully applied
	 * @private
	 */
	RenameForm.applyChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oTexts = oChangeWrapper.getTexts();
		var oContent = oChangeWrapper.getContent();
		// !important : sRenameId was used in 1.40, do not remove for compatibility!
		var vSelector = oContent.elementSelector || oContent.sRenameId;
		var oRenamedElement = oModifier.bySelector(vSelector, oAppComponent, oView);

		if (oTexts && oTexts.formText && this._isProvided(oTexts.formText.value)) {
			if (!oControl) {
				return Promise.reject(new Error("no Control provided for renaming"));
			}

			return oModifier.getProperty(oRenamedElement, "text").then(function(sProperty) {
				oChangeWrapper.setRevertData(sProperty);
				var sValue = oTexts.formText.value;
				oModifier.setProperty(oRenamedElement, "text", sValue);
			});
		} else {
			return Promise.resolve();
		}
	};

	/**
	 * Reverts a Rename Change
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag property bag
	 * @param {object} mPropertyBag.modifier modifier for the controls
	 * @public
	 */
	RenameForm.revertChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var sOldText = oChangeWrapper.getRevertData();
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeContent = oChangeWrapper.getContent();
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;

		// !important : sRenameId was used in 1.40, do not remove for compatibility!
		var vSelector = oChangeContent.elementSelector || oChangeContent.sRenameId;
		var oRenamedElement = oModifier.bySelector(vSelector, oAppComponent, oView);

		if (sOldText || sOldText === "") {
			oModifier.setProperty(oRenamedElement, "text", sOldText);
			// In some cases the SimpleForm does not properly update the value, so the invalidate call is required
			oRenamedElement.getParent().invalidate();
			oChangeWrapper.resetRevertData();
		} else {
			Log.error("Change doesn't contain sufficient information to be reverted. Most Likely the Change didn't go through applyChange.");
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange - change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo - with attribute fieldLabel, the new field label to be included in the change
	 * @param {object} mPropertyBag - map containing the application component
	 * @private
	 */
	RenameForm.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oContent = {};

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
			oContent.elementSelector = JsControlTreeModifier.getSelector(oStableRenamedElement, mPropertyBag.appComponent);
			oChange.addDependentControl(oStableRenamedElement, "elementSelector", mPropertyBag);
		} else {
			throw new Error("oSpecificChangeInfo.renamedElement attribute required");
		}

		if (this._isProvided(oSpecificChangeInfo.value)) {
			oChange.setText("formText", oSpecificChangeInfo.value, "XFLD");
		} else {
			throw new Error("oSpecificChangeInfo.value attribute required");
		}

		oChange.setContent(oContent);
	};

	RenameForm._isProvided = function(sString){
		return typeof (sString) === "string";
	};

	RenameForm.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oElementSelector = oChange.getContent().elementSelector;
		var oAffectedControlSelector = JsControlTreeModifier.bySelector(oElementSelector, oAppComponent).getParent().getId();
		return {
			affectedControls: [oAffectedControlSelector],
			payload: {
				originalLabel: oChange.getRevertData(),
				newLabel:  oChange.getTexts().formText.value
			}
		};
	};

	return RenameForm;
}, /* bExport= */true);

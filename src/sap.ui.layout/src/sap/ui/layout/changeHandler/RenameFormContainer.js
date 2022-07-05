/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
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
	 * @returns {Promise} Promise resolving when change is applied successfully
	 * @private
	 */
	RenameFormContainer.applyChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			oTexts = oChangeWrapper.getTexts(),
			oRenamedElement = oChangeWrapper.getDependentControl(_CONSTANTS.TARGET_ALIAS, mPropertyBag);

		return Promise.resolve()
			.then(function() {
				return oModifier.getAggregation(oRenamedElement, "title");
			})
			.then(function(oTitle) {
				if (oTexts && oTexts.formText && this._isProvided(oTexts.formText.value)) {
					var sValue = oTexts.formText.value;
					var oRevertDataPromise;
					if (typeof oTitle === "string") {
						oRevertDataPromise = Promise.resolve(oModifier.getProperty(oRenamedElement, "title")).then(function(sTitle) {
							oChangeWrapper.setRevertData(sTitle);
							oModifier.setProperty(oRenamedElement, "title", sValue);
						});
					} else {
						oRevertDataPromise = Promise.resolve(oModifier.getProperty(oTitle, "text")).then(function(sText) {
							oChangeWrapper.setRevertData(sText);
							oModifier.setProperty(oTitle, "text", sValue);
						});
					}
					return oRevertDataPromise;
				}
			}.bind(this));
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo With attribute fieldLabel, the new field label to be included in the change
	 * @param {object} mPropertyBag Map containing the application component
	 * @private
	 */
	RenameFormContainer.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		if (!(oSpecificChangeInfo.renamedElement && oSpecificChangeInfo.renamedElement.id)) {
			throw new Error("Rename of the group cannot be executed: oSpecificChangeInfo.renamedElement attribute required");
		}

		if (!this._isProvided(oSpecificChangeInfo.value)) {
			throw new Error("Rename of the group cannot be executed: oSpecificChangeInfo.value attribute required");
		}

		oChange.addDependentControl(oSpecificChangeInfo.renamedElement.id, _CONSTANTS.TARGET_ALIAS, mPropertyBag);
		oChange.setText("formText", oSpecificChangeInfo.value, "XGRP");
	};

	/**
	 * Reverts the applied change
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper Change wrapper object with instructions to be applied to the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @returns {Promise} Promise resolving when change is successfully reverted
	 * @public
	 */
	RenameFormContainer.revertChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var sOldText = oChangeWrapper.getRevertData(),
			oModifier = mPropertyBag.modifier,
			oRenamedElement = oChangeWrapper.getDependentControl(_CONSTANTS.TARGET_ALIAS, mPropertyBag);

		return Promise.resolve()
			.then(function() {
				return oModifier.getAggregation(oRenamedElement, "title");
			})
			.then(function(oTitle) {
				if (typeof oTitle === "string") {
					oModifier.setProperty(oRenamedElement, "title", sOldText);
				} else {
					oModifier.setProperty(oTitle, "text", sOldText);
				}
				oChangeWrapper.resetRevertData();
			});
	};

	RenameFormContainer._isProvided = function(sString){
		return typeof (sString) === "string";
	};

	return RenameFormContainer;
}, /* bExport= */true);
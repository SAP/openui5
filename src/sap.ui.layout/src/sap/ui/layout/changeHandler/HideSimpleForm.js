/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global'
], function(jQuery) {
	"use strict";

	/**
	 * Change handler for hiding of a control.
	 * @alias sap.ui.fl.changeHandler.HideControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var HideForm = { };

	/**
	 * Hides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @public
	 */
	HideForm.applyChange = function(oChangeWrapper, oControl, oModifier, oView) {
		var oChange = oChangeWrapper.getDefinition();
		var sRemoveElementId;
		if (!oChange.content.removedElement || !oChange.content.removedElement.id) {
			// sHideId field key was used in 1.40, do not remove!
			sRemoveElementId = oChange.content.sHideId;
		} else {
			sRemoveElementId = oChange.content.removedElement.id;
		}


		var oCtrl = oModifier.byId(sRemoveElementId, oView);
		var aContent = oModifier.getAggregation(oControl, "content");
		var iStart = -1;

		if (oChange.changeType === "hideSimpleFormField") {
			aContent.some(function (oField, index) {
				if (oField === oCtrl) {
					iStart = index;
					oModifier.setVisible(oField, false);
				}
				if (iStart >= 0 && index > iStart) {
					if ((oModifier.getControlType(oField) === "sap.m.Label") ||
							(oModifier.getControlType(oField) === "sap.ui.core.Title") ||
							(oModifier.getControlType(oField) === "sap.ui.core.Toolbar")) {
						return true;
					} else {
						oModifier.setVisible(oField, false);
					}
				}
			});
		} else if (oChange.changeType === "removeSimpleFormGroup") {
			aContent.some(function (oField, index) {
				if (oField === oCtrl) {
					iStart = index;
				}
				if (iStart >= 0 && index > iStart) {
					if ((oModifier.getControlType(oField) === "sap.ui.core.Title") ||
							(oModifier.getControlType(oField) === "sap.ui.core.Toolbar")) {
						if (iStart === 0) {
							oModifier.removeAggregation(oControl, "content", oField, oView);
							oModifier.insertAggregation(oControl, "content", oField, 0, oView);
						}
						return true;
					} else {
						oModifier.setVisible(oField, false);
					}
				}
			});
			oModifier.removeAggregation(oControl, "content", oCtrl, oView);
		}

		return true;
	};

	/**
	 * @private
	 */
	HideForm._getStableElement = function(oElement) {
		if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
			// TODO: get Toolbar!
			return oElement.getTitle();
		} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
			return oElement.getLabel();
		} else {
			return oElement;
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	HideForm.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.removedElement && oSpecificChangeInfo.removedElement.id) {
			var sStableId = this._getStableElement(sap.ui.getCore().byId(oSpecificChangeInfo.removedElement.id)).getId();
			oChange.content.removedElement = {
				id : sStableId
			};
		} else {
			throw new Error("oSpecificChangeInfo.removedElement.id attribute required");
		}
	};


	/**
	 * Transform the remove action format to the hideControl change format
	 *
	 * @param {object} mRemoveActionParameter a json object with the remove parameter
	 * @returns {object} json object that the completeChangeContent method will take as oSpecificChangeInfo
	 * @public
	 */
	HideForm.buildStableChangeInfo = function(mRemoveActionParameter){
		return mRemoveActionParameter;
	};

	return HideForm;
},
/* bExport= */true);

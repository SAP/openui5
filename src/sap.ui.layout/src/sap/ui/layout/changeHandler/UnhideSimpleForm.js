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
	var UnhideForm = { };

	/**
	 * Unhides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @public
	 */
	UnhideForm.applyChange = function(oChangeWrapper, oControl, oModifier, oView) {
		var oChange = oChangeWrapper.getDefinition();
		var sUnhideId = oChange.content.sUnhideId;

		var oCtrl = oModifier.byId(sUnhideId, oView);
		var aContent = oModifier.getAggregation(oControl, "content");
		var iStart = -1;

		if (oChange.changeType === "unhideSimpleFormField") {
			aContent.some(function (oField, index) {
				if (oField === oCtrl) {
					iStart = index;
					oModifier.setVisible(oField, true);
				}
				if (iStart >= 0 && index > iStart) {
					if ((oModifier.getControlType(oField) === "sap.m.Label") || (oModifier.getControlType(oField) === "sap.ui.core.Title")) {
						return true;
					} else {
						oModifier.setVisible(oField, true);
					}
				}
			});
		}

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @public
	 */
	UnhideForm.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.sUnhideId) {
			oChange.content.sUnhideId = oSpecificChangeInfo.sUnhideId;
		} else {
			throw new Error("oSpecificChangeInfo.sUnhideId attribute required");
		}
	};

	return UnhideForm;
},
/* bExport= */true);

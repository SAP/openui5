/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global', "sap/ui/fl/changeHandler/JsControlTreeModifier"
], function(jQuery, JsControlTreeModifier) {
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
	UnhideForm.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oChangeDefinition = oChange.getDefinition();

		// !important : sUnhideId was used in 1.40, do not remove for compatibility!
		var oControlToUnhide = oModifier.bySelector(oChangeDefinition.content.elementSelector || oChangeDefinition.content.sUnhideId, oAppComponent, oView);
		var aContent = oModifier.getAggregation(oControl, "content");
		var iStart = -1;

		if (oChangeDefinition.changeType === "unhideSimpleFormField") {
			aContent.some(function (oField, index) {
				if (oField === oControlToUnhide) {
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
			oChange.content.elementSelector = JsControlTreeModifier.getSelector(sap.ui.getCore().byId(oSpecificChangeInfo.sUnhideId));
		} else {
			throw new Error("oSpecificChangeInfo.sUnhideId attribute required");
		}
	};

	return UnhideForm;
},
/* bExport= */true);

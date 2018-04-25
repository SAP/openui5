/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(JsControlTreeModifier) {
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
	 * @param {sap.ui.fl.Change} oChangeWrapper - change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
	 *                                sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
	 * @public
	 */
	UnhideForm.applyChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oChangeDefinition = oChangeWrapper.getDefinition();

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
					if ((oModifier.getControlType(oField) === "sap.m.Label")
						|| (oModifier.getControlType(oField) === "sap.ui.comp.smartfield.SmartLabel")
						|| (oModifier.getControlType(oField) === "sap.ui.core.Title")
						|| (oModifier.getControlType(oField) === "sap.m.Title")
						|| (oModifier.getControlType(oField) === "sap.m.Toolbar")
						|| (oModifier.getControlType(oField) === "sap.m.OverflowToolbar")) {
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
	 * @param {sap.ui.fl.Change} oChangeWrapper Change object to be completed
	 * @param {object} oSpecificChangeInfo With attribute sUnhideId, the id of the control to unhide
	 * @param {object} mPropertyBag Map containing the application component
	 * @public
	 */
	UnhideForm.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo, mPropertyBag) {
		var oChangeDefinition = oChangeWrapper.getDefinition();
		//TODO remove sUnhideId when rta is switched to new logic to create reveal changes
		if (oSpecificChangeInfo.sUnhideId) {
			var oUnhideElement = sap.ui.getCore().byId(oSpecificChangeInfo.sUnhideId);
			oChangeDefinition.content.elementSelector = JsControlTreeModifier.getSelector(oUnhideElement, mPropertyBag.appComponent);
			oChangeWrapper.addDependentControl(oUnhideElement, "elementSelector", mPropertyBag);
		} else if (oSpecificChangeInfo.revealedElementId ) {
			//translate from FormElement (unstable id) to the label control (stable id and in public aggregation)
			var oFormElement = sap.ui.getCore().byId(oSpecificChangeInfo.revealedElementId || oSpecificChangeInfo.sUnhideId);
			var oLabel = oFormElement.getLabel();
			oChangeDefinition.content.elementSelector = JsControlTreeModifier.getSelector(oLabel, mPropertyBag.appComponent);
			oChangeWrapper.addDependentControl(oLabel, "elementSelector", mPropertyBag);
		} else {
			throw new Error("oSpecificChangeInfo.revealedElementId attribute required");
		}
	};

	return UnhideForm;
},
/* bExport= */true);

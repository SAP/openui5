/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/fl/changeHandler/JsControlTreeModifier'
], function(jQuery, JsControlTreeModifier) {
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
	HideForm.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oChangeDefinition = oChange.getDefinition();

		// !important : sHideId was used in 1.40, do not remove for compatibility!
		var oRemovedElement = oModifier.bySelector(oChangeDefinition.content.elementSelector || oChangeDefinition.content.sHideId, oAppComponent, oView);
		var aContent = oModifier.getAggregation(oControl, "content");
		var iStart = -1;

		if (oChangeDefinition.changeType === "hideSimpleFormField") {
			aContent.some(function (oField, index) {
				if (oField === oRemovedElement) {
					iStart = index;
					oModifier.setVisible(oField, false);
				}
				if (iStart >= 0 && index > iStart) {
					if ((oModifier.getControlType(oField) === "sap.m.Label") ||
							(oModifier.getControlType(oField) === "sap.ui.core.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Toolbar")) {
						return true;
					} else {
						oModifier.setVisible(oField, false);
					}
				}
			});
		} else if (oChangeDefinition.changeType === "removeSimpleFormGroup") {
			aContent.some(function (oField, index) {
				if (oField === oRemovedElement) {
					iStart = index;
				}
				if (iStart >= 0 && index > iStart) {
					if ((oModifier.getControlType(oField) === "sap.ui.core.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Title") ||
							(oModifier.getControlType(oField) === "sap.m.Toolbar")) {
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
			oModifier.removeAggregation(oControl, "content", oRemovedElement, oView);
		}

		return true;
	};

	/**
	 * @private
	 */
	HideForm._getStableElement = function(oElement) {
		if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
			return oElement.getTitle() || oElement.getToolbar();
		} else if (oElement.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
			return oElement.getLabel();
		} else {
			return oElement;
		}
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.oChangeWrapper} oChange change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @param {object} mPropertyBag
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
	 * @public
	 */
	HideForm.completeChangeContent = function(oChangeWrapper, oSpecificChangeInfo, mPropertyBag) {
		var oChange = oChangeWrapper.getDefinition();
		if (oSpecificChangeInfo.removedElement && oSpecificChangeInfo.removedElement.id) {
			var oStableElement = this._getStableElement(sap.ui.getCore().byId(oSpecificChangeInfo.removedElement.id));
			oChange.content.elementSelector = JsControlTreeModifier.getSelector(oStableElement, mPropertyBag.appComponent);
			oChangeWrapper.addDependentControl(oStableElement, "elementSelector", mPropertyBag);
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
	HideForm.buildStableChangeInfo = function(mRemoveActionParameter) {
		return mRemoveActionParameter;
	};

	return HideForm;
},
/* bExport= */true);

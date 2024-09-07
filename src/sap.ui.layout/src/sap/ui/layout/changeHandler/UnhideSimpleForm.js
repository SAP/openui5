/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(Element, JsControlTreeModifier) {
	"use strict";

	/**
	 * Change handler for hiding of a control.
	 * @alias sap.ui.fl.changeHandler.HideControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var UnhideForm = { };

	function _isXmlModifier(mPropertyBag) {
		return mPropertyBag.modifier.targets === "xmlTree";
	}

	/**
	 * Unhides a control
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper - change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
	 *                                sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
	 * @returns {Promise} Promise resolving when change is successfully applied
	 * @public
	 */
	UnhideForm.applyChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oContent = oChangeWrapper.getContent();
		// in case of custom fields the application needs to be on JS.
		// In the other case the visibility of the control will be overridden by the custom field binding afterwards
		if (_isXmlModifier(mPropertyBag)) {
			return Promise.reject(Error("Change cannot be applied in XML. Retrying in JS."));
		}

		// !important : sUnhideId was used in 1.40, do not remove for compatibility reasons!
		var oControlToUnhide = oModifier.bySelector(oContent.elementSelector || oContent.sUnhideId, oAppComponent, oView);
		return Promise.resolve()
			.then(function() {
				return oModifier.getAggregation(oControl, "content");
			})
			.then(function(aContent) {
				var iStart = -1;

				if (oChangeWrapper.getChangeType() === "unhideSimpleFormField") {
					oChangeWrapper.setRevertData(true);
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
							}
							oModifier.setVisible(oField, true);
						}
					});
				}
			});
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
		//TODO remove sUnhideId when rta is switched to new logic to create reveal changes
		var oContent = {};
		if (oSpecificChangeInfo.sUnhideId) {
			var oUnhideElement = Element.getElementById(oSpecificChangeInfo.sUnhideId);
			oContent.elementSelector = JsControlTreeModifier.getSelector(oUnhideElement, mPropertyBag.appComponent);
			oChangeWrapper.addDependentControl(oUnhideElement, "elementSelector", mPropertyBag);
		} else if (oSpecificChangeInfo.revealedElementId ) {
			//translate from FormElement (unstable id) to the label control (stable id and in public aggregation)
			var oFormElement = Element.getElementById(oSpecificChangeInfo.revealedElementId || oSpecificChangeInfo.sUnhideId);
			var oLabel = oFormElement.getLabel();
			oContent.elementSelector = JsControlTreeModifier.getSelector(oLabel, mPropertyBag.appComponent);
			oChangeWrapper.addDependentControl(oLabel, "elementSelector", mPropertyBag);
		} else {
			throw new Error("oSpecificChangeInfo.revealedElementId attribute required");
		}
		oChangeWrapper.setContent(oContent);
	};

	/**
	 * Reverts the applied change
	 *
	 * @param {sap.ui.fl.Change} oChangeWrapper - Change object with instructions to be applied to the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @returns {Promise} Promise resolving when change is successfully reverted
	 * @public
	 */
	UnhideForm.revertChange = function(oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oChangeContent = oChangeWrapper.getContent();

		// !important : sUnhideId was used in 1.40, do not remove for compatibility reasons!
		var oControlToRevertUnhide = oModifier.bySelector(oChangeContent.elementSelector || oChangeContent.sUnhideId, oAppComponent, oView);
		return Promise.resolve()
			.then(function() {
				return oModifier.getAggregation(oControl, "content");
			})
			.then(function(aContent) {
				var iStart = -1;

				if (oChangeWrapper.getChangeType() === "unhideSimpleFormField") {
					aContent.some(function (oField, index) {
						if (oField === oControlToRevertUnhide) {
							iStart = index;
							oModifier.setVisible(oField, false);
						}
						if (iStart >= 0 && index > iStart) {
							if ((oModifier.getControlType(oField) === "sap.m.Label")
								|| (oModifier.getControlType(oField) === "sap.ui.comp.smartfield.SmartLabel")
								|| (oModifier.getControlType(oField) === "sap.ui.core.Title")
								|| (oModifier.getControlType(oField) === "sap.m.Title")
								|| (oModifier.getControlType(oField) === "sap.m.Toolbar")
								|| (oModifier.getControlType(oField) === "sap.m.OverflowToolbar")
							) {
								return true;
							}
							oModifier.setVisible(oField, false);
						}
					});
					oChangeWrapper.resetRevertData();
				}
				return Promise.resolve();
			});
	};

	UnhideForm.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		// Groups cannot be revealed, so we just need to handle the FormElement case
		const oElementSelector = oChange.getContent().elementSelector;
		const oFormSelector = oChange.getSelector();
		const oLabel = JsControlTreeModifier.bySelector(oElementSelector, oAppComponent);
		const oFormElement = oLabel.getParent();
		const oForm = JsControlTreeModifier.bySelector(oFormSelector, oAppComponent);

		const oReturn = {
			affectedControls: [oFormElement.getId()],
			updateRequired: true
		};

		// If the form element is currently invisible (defined by the Label), the indicator is on the form
		// We don't show it on the group because the group could have been removed before, leading to the
		// element to be implicitly moved to another group, leading to inconsistent results in visualization
		if (!oLabel.getVisible()) {
			oReturn.displayControls = [oForm.getId()];
		}

		return oReturn;
	};

	return UnhideForm;
});

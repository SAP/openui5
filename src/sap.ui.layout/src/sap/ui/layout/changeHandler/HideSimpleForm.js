/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/fl/changeHandler/JsControlTreeModifier', "sap/base/Log"], function(JsControlTreeModifier, Log) {
	"use strict";

	/**
	 * Change handler for hiding of a control.
	 * @alias sap.ui.fl.changeHandler.HideControl
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var HideForm = { };

	var fnIsTitleOrToolbar = function(oControl, oModifier){
		var sControlType = oModifier.getControlType(oControl);
		return (sControlType === "sap.ui.core.Title") ||
			(sControlType === "sap.m.Title") ||
			(sControlType === "sap.m.Toolbar") ||
			(sControlType === "sap.m.OverflowToolbar");
	};

	var fnGetFirstToolbarOrTitle = function(aContent, oModifier) {
		var iIndex;
		for (iIndex = 0; iIndex < aContent.length; ++iIndex){
			if (fnIsTitleOrToolbar(aContent[iIndex], oModifier)){
				return aContent[iIndex];
			}
		}
	};

	/**
	 * Hides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - map of properties
	 * @returns {boolean} true - if change could be applied
	 * @public
	 */
	HideForm.applyChange = function(oChange, oControl, mPropertyBag) {
		try {
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var oAppComponent = mPropertyBag.appComponent;

			var oChangeDefinition = oChange.getDefinition();

			// !important : sHideId was used in 1.40, do not remove for compatibility!
			var oRemovedElement = oModifier.bySelector(oChangeDefinition.content.elementSelector || oChangeDefinition.content.sHideId, oAppComponent, oView);
			var aContent = oModifier.getAggregation(oControl, "content");
			var iStart = -1;
			var mState = this._getState(oControl, oModifier, oAppComponent);
			oChange.setRevertData(mState);

			// this is needed to trigger a refresh of a simpleform! Otherwise simpleForm content and visualization are not in sync
			oModifier.removeAllAggregation(oControl, "content");
			for (var i = 0; i < aContent.length; ++i) {
				oModifier.insertAggregation(oControl, "content", aContent[i], i, oView);
			}

			if (oChangeDefinition.changeType === "hideSimpleFormField") {
				aContent.some(function (oField, index) {
					if (oField === oRemovedElement) {
						iStart = index;
						oModifier.setVisible(oField, false);
					}
					if (iStart >= 0 && index > iStart) {
						if ((oModifier.getControlType(oField) === "sap.m.Label") ||
							(oModifier.getControlType(oField) === "sap.ui.comp.smartfield.SmartLabel") ||
							fnIsTitleOrToolbar(oField, oModifier)) {
							return true;
						} else {
							oModifier.setVisible(oField, false);
						}
					}
				});
			} else if (oChangeDefinition.changeType === "removeSimpleFormGroup") {
				var oTitleOrToolbar = fnGetFirstToolbarOrTitle(aContent, oModifier);
				var bFirstContainerWithoutTitle = oTitleOrToolbar && !oRemovedElement;
				aContent.some(function (oField, index) {
					// if there is no Title/Toolbar, there is only the one FormContainer without Title/Toolbar.
					// Therefor all Fields will be hidden.
					if (!oTitleOrToolbar) {
						oModifier.setVisible(oField, false);
					} else if (bFirstContainerWithoutTitle) {
						// if there is oTitleOrToolbar but no oRemovedElement the first FormContainer needs to be hidden.
						// This FormContainer has no Title/Toolbar, but there are FormContainers with Title/Toolbar
						// Therefor we have to set iStart to 0 and hide the first Field once
						iStart = 0;
						oModifier.setVisible(oField, false);
						bFirstContainerWithoutTitle = false;
					} else {
						if (oField === oRemovedElement) {
							iStart = index;
						}
						if (iStart >= 0 && index > iStart) {
							if (fnIsTitleOrToolbar(oField, oModifier)) {
								if (iStart === 0) {
									oModifier.removeAggregation(oControl, "content", oField, oView);
									oModifier.insertAggregation(oControl, "content", oField, 0, oView);
								}
								return true;
							} else {
								oModifier.setVisible(oField, false);
							}
						}
					}
				});
				if (oRemovedElement) {
					oModifier.removeAggregation(oControl, "content", oRemovedElement, oView);
					oModifier.insertAggregation(oControl, "dependents", oRemovedElement, 0, oView);
				}
			}

			return true;
		} catch (oError) {
			oChange.resetRevertData();
			Log.error(oError.message || oError.name);
		}
	};

	/**
	 * @param {object} oElement - removedElement
	 * @returns {object} stable element
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
	 * @param {sap.ui.fl.oChangeWrapper} oChangeWrapper change object to be completed
	 * @param {object} oSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @param {object} mPropertyBag - map of properties
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent component in which the change should be applied
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

	HideForm._getState = function (oControl, oModifier, oAppComponent) {
		var aContent = oModifier.getAggregation(oControl, "content");
		return {
			content : aContent.map(function(oElement) {
				return {
					elementSelector : oModifier.getSelector(oModifier.getId(oElement), oAppComponent),
					visible : oElement.getVisible ? oElement.getVisible() : undefined,
					index : aContent.indexOf(oElement)
				};
			})
		};
	};

	HideForm.revertChange = function (oChange, oControl, mPropertyBag) {
		var mState = oChange.getRevertData();
		var oAppComponent = mPropertyBag.appComponent;
		var oModifier = mPropertyBag.modifier;
		oModifier.removeAllAggregation(oControl, "content");
		mState.content.forEach(function(oElementState) {
			var oElement = oModifier.bySelector(oElementState.elementSelector, oAppComponent, mPropertyBag.view);
			var aDependents = oModifier.getAggregation(oControl, "dependents");
			aDependents.some(function(oDependent) {
				if (oModifier.getProperty(oDependent, "id") === oModifier.getProperty(oElement, "id")) {
					oModifier.removeAggregation(oControl, "dependents", oDependent, mPropertyBag.view);
					return true;
				}
			});
			oModifier.insertAggregation(oControl, "content", oElement, oElementState.index, mPropertyBag.view);
			oModifier.setProperty(oElement, "visible", oElementState.visible);
		});
		oChange.resetRevertData();
		return true;
	};

	return HideForm;
},
/* bExport= */true);
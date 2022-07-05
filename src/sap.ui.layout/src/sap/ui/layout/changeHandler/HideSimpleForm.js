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
		return undefined;
	};

	function _isXmlModifier(mPropertyBag) {
		return mPropertyBag.modifier.targets === "xmlTree";
	}

	/**
	 * Hides a control.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - map of properties
	 * @returns {Promise} Promise resolving when change is successfully applied
	 * @public
	 */
	HideForm.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;


		// in case of custom fields the application needs to be on JS.
		// In the other case the visuality of the hidden control will be overriden by the custom field binding afterwards
		if (_isXmlModifier(mPropertyBag)) {
			return Promise.reject(Error("Change cannot be applied in XML. Retrying in JS."));
		}

		var oContent = oChange.getContent();
		// !important : sHideId was used in 1.40, do not remove for compatibility!
		var oRemovedElement = oModifier.bySelector(oContent.elementSelector || oContent.sHideId, oAppComponent, oView);
		var aContent;

		return this._getState(oControl, oModifier, oAppComponent)
			.then(function(mState) {
				oChange.setRevertData(mState);
				return oModifier.getAggregation(oControl, "content");
			})
			.then(function(aAggregationContent) {
				aContent = aAggregationContent;
				// this is needed to trigger a refresh of a simpleform! Otherwise simpleForm content and visualization are not in sync
				return oModifier.removeAllAggregation(oControl, "content");
			})
			.then(function() {
				return aContent.reduce(function(oPreviousPromise, oContent, i) {
					return oPreviousPromise
						.then(oModifier.insertAggregation.bind(oModifier, oControl, "content", oContent, i, oView));
				}, Promise.resolve());
			})
			.then(function() {
				var iStart = -1;
				var sChangeType = oChange.getChangeType();
				if (sChangeType === "hideSimpleFormField") {
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
				} else if (sChangeType === "removeSimpleFormGroup") {
					var aPromises = [];
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
										aPromises.push(function() {
											return Promise.resolve()
												.then(oModifier.removeAggregation.bind(oModifier, oControl, "content", oField, oView));
										});
										aPromises.push(function() {
											return Promise.resolve()
												.then(oModifier.insertAggregation.bind(oModifier, oControl, "content", oField, 0, oView));
										});
									}
									return true;
								} else {
									oModifier.setVisible(oField, false);
								}
							}
						}
					});
					if (oRemovedElement) {
						aPromises.push(function() {
							return Promise.resolve()
								.then(oModifier.removeAggregation.bind(oModifier, oControl, "content", oRemovedElement, oView));
						});
						aPromises.push(function() {
							return Promise.resolve()
								.then(oModifier.insertAggregation.bind(oModifier, oControl, "dependents", oRemovedElement, 0, oView));
						});
					}
					if (aPromises.length > 0) {
						return aPromises.reduce(function(oPreviousPromise, oCurrentPromise) {
							return oPreviousPromise.then(oCurrentPromise);
						}, Promise.resolve());
					}
				}
				return Promise.resolve();
			})
			.catch(function(oError) {
				oChange.resetRevertData();
				Log.error(oError.message || oError.name);
			});
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
		if (oSpecificChangeInfo.removedElement && oSpecificChangeInfo.removedElement.id) {
			var oStableElement = this._getStableElement(sap.ui.getCore().byId(oSpecificChangeInfo.removedElement.id));
			oChangeWrapper.setContent({
				elementSelector: JsControlTreeModifier.getSelector(oStableElement, mPropertyBag.appComponent)
			});
			oChangeWrapper.addDependentControl(oStableElement, "elementSelector", mPropertyBag);
		} else {
			throw new Error("oSpecificChangeInfo.removedElement.id attribute required");
		}
	};

	HideForm._getState = function (oControl, oModifier, oAppComponent) {
		return Promise.resolve()
			.then(function(){
				return oModifier.getAggregation(oControl, "content");
			})
			.then(function(aContent){
				if (!aContent){
					return Promise.reject(new Error("Cannot get control state: 'content' aggregation doesn't exist"));
				}
				return {
					content : aContent.map(function(oElement) {
						return {
							elementSelector : oModifier.getSelector(oModifier.getId(oElement), oAppComponent),
							visible : oElement.getVisible ? oElement.getVisible() : undefined,
							index : aContent.indexOf(oElement)
						};
					})
				};
			});
	};

	/**
	 * Reverts the hide simple form change.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - map of properties
	 * @returns {Promise} Promise resolving when change is successfully reverted
	 * @public
	 */
	HideForm.revertChange = function (oChange, oControl, mPropertyBag) {
		var mState = oChange.getRevertData();
		var oAppComponent = mPropertyBag.appComponent;
		var oModifier = mPropertyBag.modifier;

		return Promise.resolve()
			.then(oModifier.removeAllAggregation.bind(oModifier, oControl, "content"))
			.then(function() {
				return mState.content.reduce(function(oPreviousPromise, oElementState) {
					var oElement = oModifier.bySelector(oElementState.elementSelector, oAppComponent, mPropertyBag.view);
					var sElementId = oModifier.getId(oElement);
					return oPreviousPromise
						.then(oModifier.getAggregation.bind(oModifier, oControl, "dependents"))
						.then(function(aDependents) {
							var oPromise = Promise.resolve();
							aDependents.some(function(oDependent) {
								var sDependentId = oModifier.getId(oDependent);
								if (sDependentId === sElementId) {
									oPromise = oPromise.then(oModifier.removeAggregation.bind(oModifier, oControl, "dependents", oDependent, mPropertyBag.view));
									return true;
								}
							});
							return oPromise;
						})
						.then(oModifier.insertAggregation.bind(oModifier, oControl, "content", oElement, oElementState.index, mPropertyBag.view))
						.then(function() {
							oModifier.setProperty(oElement, "visible", oElementState.visible);
						});
				}, Promise.resolve())
					.then(function() {
						oChange.resetRevertData();
					});
			});
	};

	HideForm.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oSelector = oChange.getContent().elementSelector;
		var oElement = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		var oDisplaySelector = oChange.getChangeType() === "removeSimpleFormGroup"
			? oElement.getParent().getId()
			: oElement.getParent().getParent().getId();
		return {
			affectedControls: [oSelector],
			displayControls: [oDisplaySelector]
		};
	};

	return HideForm;
},
/* bExport= */true);
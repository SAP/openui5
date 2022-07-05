/* eslint-disable max-nested-callbacks */
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/util/ManagedObjectModel" // used implicitly by oModifier.createControl() function
], function (
	JsControlTreeModifier,
	Component
) {
	"use strict";

	/**
	 * Change handler for splitting sap.m.MenuButton into sap.m.Button(s).
	 *
	 * @alias sap.m.changeHandler.SplitMenuButton
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.48
	 */
	var SplitMenuButton = {};

	var SOURCE_CONTROL = "sourceControl";

	/**
	 * Split a MenuButton into separate Buttons
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.IBar} oControl Bar control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @return {Promise} Promise resolving when change was applied
	 *
	 * @public
	 */
	SplitMenuButton.applyChange = function(oChange, oControl, mPropertyBag) {
		if (mPropertyBag.modifier.targets !== "jsControlTree") {
			return Promise.reject(new Error("Split change can't be applied on XML tree"));
		}

		var oChangeContent = oChange.getContent();
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oSourceControl = oChange.getDependentControl(SOURCE_CONTROL, mPropertyBag);
		var oMenu;
		var aMenuItems;
		var sParentAggregation;
		var iAggregationIndex;
		var aNewElementSelectors;
		var oRevertData;
		var sModelName;
		var oManagedObjectModel;
		var oParent;

		return Promise.resolve()
			.then(function() {
				return oModifier.getAggregation(oSourceControl, "menu");
			})
			.then(function(oRetrievedMenu) {
				oMenu = oRetrievedMenu;
				return oModifier.getAggregation(oMenu, "items");
			})
			.then(function(aReturnedMenuItems) {
				aMenuItems = aReturnedMenuItems;
				oParent = oModifier.getParent(oSourceControl);
				return oModifier.getParentAggregationName(oSourceControl, oParent);
			})
			.then(function(sRetrievedParentAggregation) {
				sParentAggregation = sRetrievedParentAggregation;
				return oModifier.findIndexInParentAggregation(oSourceControl);
			})
			.then(function(iRetrievedAggregationIndex) {
				iAggregationIndex = iRetrievedAggregationIndex;
				aNewElementSelectors = oChangeContent.newElementIds;
				oRevertData = {
					parentAggregation: sParentAggregation,
					insertIndex: iAggregationIndex,
					insertedButtons: []
				};
				return aMenuItems.reduce(function (oPreviousPromise, oMenuItem, index) {
					var oSelector;
					var iIndex;
					var oButton;

					return oPreviousPromise
						.then(function() {
							iIndex = index;
							oSelector = aNewElementSelectors[iIndex];
							return oModifier.createControl("sap.m.Button", oAppComponent, oView, oSelector);
						})
						.then(function(oCreatedButton){
							oButton = oCreatedButton;
							oRevertData.insertedButtons.push(oSelector);
							sModelName = "$sap.m.flexibility.SplitButtonsModel";
							return oModifier.createControl(
								"sap.ui.fl.util.ManagedObjectModel",
								oAppComponent,
								oView,
								Object.assign({}, oSelector, {
									id: oSelector.id + '-managedObjectModel'
								}),
								{
									object: oMenuItem,
									name: sModelName
								}
							);
						})
						.then(function(oCreatedManagedObjectModel) {
							oManagedObjectModel = oCreatedManagedObjectModel;
							// ManagedObjectModel should be placed in `dependents` aggregation of the Button
							return oModifier.insertAggregation(oButton, "dependents", oManagedObjectModel, 0, oView);
						})
						.then(function(){
							oModifier.bindProperty(oButton, "text", sModelName + ">/text");
							oModifier.bindProperty(oButton, "icon", sModelName + ">/icon");
							oModifier.bindProperty(oButton, "enabled", sModelName + ">/enabled");
							oModifier.bindProperty(oButton, "visible", sModelName + ">/visible");
							return oModifier.createControl(
									"sap.ui.core.CustomData",
									oAppComponent,
									oView,
									Object.assign({}, oSelector, {
										id: oSelector.id + '-customData'
									}),
									{
										key: {
											path: sModelName + ">key"
										},
										value: {
											path: sModelName + ">value"
										}
									}
								);
						})
						.then(function(oTemplate){
							return oModifier.bindAggregation(oButton, "customData", {
								path: sModelName + ">/customData",
								template: oTemplate,
								templateShareable: false
							});
						})
						.then(function(){
							return oModifier.attachEvent(
								oButton,
								"press",
								"sap.m.changeHandler.SplitMenuButton.pressHandler",
								{
									selector: oModifier.getSelector(oMenuItem, oAppComponent),
									appComponentId: oAppComponent.getId(),
									menu: oMenu
								}
							);
						})
						.then(function(){
							return oModifier.insertAggregation(oParent, sParentAggregation, oButton, iAggregationIndex + iIndex, oView);
						});
				}, Promise.resolve());
			})
			.then(function() {
				return Promise.resolve()
					.then(oModifier.removeAggregation.bind(oModifier, oParent, sParentAggregation, oSourceControl))
					.then(oModifier.insertAggregation.bind(oModifier, oParent, "dependents", oSourceControl, 0, oView))
					.then(function() {
						oChange.setRevertData(oRevertData);
					});
				});
	};

	/**
	 * Reverts applied change
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.IBar} oControl Bar control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @return {Promise} Promise resolving when change was reverted
	 *
	 * @public
	 */
	SplitMenuButton.revertChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oRevertData =  oChange.getRevertData();
		var oSourceControl = oChange.getDependentControl(SOURCE_CONTROL, mPropertyBag);
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oParent = oModifier.getParent(oSourceControl);
		var sParentAggregation = oRevertData.parentAggregation;
		var iAggregationIndex = oRevertData.insertIndex;

		var aInsertedButtons = [];

		return Promise.resolve()
			.then(function() {
				oRevertData.insertedButtons.forEach(function(oSelector) {
					aInsertedButtons.push(oModifier.bySelector(oSelector, oAppComponent, oView));
				});
				return aInsertedButtons.reduce(function(oPreviousPromise, oButton) {
					return oPreviousPromise
						.then(function() {
							return oModifier.removeAggregation(oParent, sParentAggregation, oButton);
						})
						.then(function() {
							return oModifier.destroy(oButton);
						});
				}, Promise.resolve());
			})
			.then(oModifier.insertAggregation.bind(oModifier, oParent, sParentAggregation, oSourceControl, iAggregationIndex, oView))
			.then(function() {
				oChange.resetRevertData();
			});
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo Specific change info containing parentId
	 * @param {object} mPropertyBag Map of properties
	 *
	 * @public
	 */
	SplitMenuButton.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;

		if (!oSpecificChangeInfo.newElementIds) {
			throw new Error("Split of MenuButton cannot be applied : oSpecificChangeInfo.newElementIds attribute required");
		}

		if (!oSpecificChangeInfo.sourceControlId) {
			throw new Error("Split of MenuButton cannot be applied : oSpecificChangeInfo.sourceControlId attribute required");
		}

		oChange.addDependentControl(oSpecificChangeInfo.sourceControlId, SOURCE_CONTROL, mPropertyBag);
		var oContent = {};
		oContent.sourceSelector = oModifier.getSelector(oSpecificChangeInfo.sourceControlId, oAppComponent);
		oContent.newElementIds = oSpecificChangeInfo.newElementIds.map(function (sElementId) {
			return oModifier.getSelector(sElementId, oAppComponent);
		});
		oChange.setContent(oContent);
	};

	/**
	 * Callback function which is attached via modifier in applyChange
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @param {object} mParameters
	 * @param {{id: string, idIsLocal: boolean}} mParameters.selector Selector describing the target of the flexibility change
	 * @param {sap.ui.core.ID} mParameters.appComponentId
	 * @param {sap.ui.core.Control} mParameters.menu
	 */
	SplitMenuButton.pressHandler = function (oEvent, mParameters) {
		var oMenuItem = JsControlTreeModifier.bySelector(mParameters.selector, Component.get(mParameters.appComponentId));
		oMenuItem.firePress();

		mParameters.menu.fireItemSelected({ item: oMenuItem });
	};

	return SplitMenuButton;
}, /* bExport= */true);

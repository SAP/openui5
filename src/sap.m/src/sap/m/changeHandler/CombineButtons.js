/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/Configuration",
	"sap/ui/fl/util/ManagedObjectModel" // used implicitly by oModifier.createControl() function
], function (
	uid, Configuration
) {
	"use strict";

	/**
	 * Change handler for combining sap.m.Button(s) in a sap.m.MenuButton inside sap.m.Bar
	 *
	 * @alias sap.m.changeHandler.CombineButtons
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.48
	 */
	var CombineButtons = {};

	var sCombineButtonsModelName = "$sap.m.flexibility.CombineButtonsModel";

	function fnHandleMenuItems(aButtons, oModifier, oAppComponent, oMenu, oParent, sParentAggregation, oView, oChangeContent, oRevertData) {
		var sPropertyEnabled = "";
		var sPropertyVisible = "";
		var sOR = "";
		var aMenuButtonModels = [];
		var bIsRtl = Configuration.getRTL();
		var aMenuButtonName = [];

		return aButtons.reduce(function(oPreviousPromise, oButton, index) {
			var oIdToSave;
			var iIndex = index;
			var oMenuItem;
			var oManagedObjectModel;
			var oSelector = oChangeContent.buttonsIdForSave[iIndex];
			var sButtonText;
			var sModelName = "$sap.m.flexibility.MenuButtonModel" + iIndex;
			return oPreviousPromise
				.then(oModifier.getProperty.bind(oModifier, oButton, "text"))
				.then(function(sRetrievedButtonText) {
					sButtonText = sRetrievedButtonText;
					return oModifier.createControl("sap.m.MenuItem", oAppComponent, oView, oSelector);
				})
				.then(function(oCreatedMenuItem) {
					oMenuItem = oCreatedMenuItem;
					// Save the original position of the button
					return oModifier.findIndexInParentAggregation(oButton);
				})
				.then(function(iIndexInParentAggregation) {
					oRevertData.insertIndexes[iIndex] = iIndexInParentAggregation;
					return oModifier.createControl(
						"sap.ui.fl.util.ManagedObjectModel",
						oAppComponent,
						oView,
						Object.assign({}, oSelector, {
							id: oSelector.id + '-managedObjectModel'
						}),
						{
							object: oButton,
							name: sCombineButtonsModelName
						}
					);
				})
				.then(function(oCreatedManagedObjectModel) {
					oManagedObjectModel = oCreatedManagedObjectModel;
					// ManagedObjectModel should be placed in `dependents` aggregation of MenuItem
					return oModifier.insertAggregation(oMenuItem, "dependents", oManagedObjectModel, 0, oView);
				})
				.then(function () {
					return oModifier.createControl(
						"sap.ui.core.CustomData",
						oAppComponent,
						oView,
						Object.assign({}, oSelector, {
							id: oSelector.id + '-customData'
						}),
						{
							key: "{ path: '" + sCombineButtonsModelName + ">key' }",
							value: "{ path: '" + sCombineButtonsModelName + ">value' }"
						}
					);
				})
				.then(function(oCustomData) {
					oModifier.bindProperty(oMenuItem, "text", sCombineButtonsModelName + ">/text");
					oModifier.bindProperty(oMenuItem, "icon", sCombineButtonsModelName + ">/icon");
					oModifier.bindProperty(oMenuItem, "enabled", sCombineButtonsModelName + ">/enabled");
					oModifier.bindProperty(oMenuItem, "visible", sCombineButtonsModelName + ">/visible");
					return oModifier.bindAggregation(oMenuItem, "customData", {
						path: sCombineButtonsModelName + ">/customData",
						template: oCustomData,
						templateShareable: false
					}, oView);
				})
				.then(function() {
					// FIXME: will not work in XML in case original button has a binding on `text` property
					if (sButtonText) {
						bIsRtl ? aMenuButtonName.unshift(sButtonText) : aMenuButtonName.push(sButtonText);
					}
					// Add suffix to the id, so we can get the original ids of the combined buttons
					// when we want to split the menu. The suffix is used in SplitMenuButton change handler.
					var oNewSelector = Object.assign({}, oSelector, {
						id: oSelector.id + '-originalButtonId'
					});

					// Create CustomData, holding the original ids of the combined buttons
					return oModifier.createControl("sap.ui.core.CustomData", oAppComponent, oView, oNewSelector);
				})
				.then(function(oRetrievedId) {
					oIdToSave = oRetrievedId;
					oModifier.setProperty(oIdToSave, "key", "originalButtonId");
					oModifier.setProperty(oIdToSave, "value", oModifier.getId(oButton));
					// FIXME: fix implementation of ObjectPageDynamicHeaderTitle and remove next line
					return oModifier.removeAggregation(oParent, sParentAggregation, oButton);
				})

				// Adding each button control to the container's dependents aggregation
				.then(function() {
					return oModifier.insertAggregation(oParent, "dependents", oButton, 0, oView);
				})

				// Saving original ID to original button to avoid conflict with aggregation binding for customData aggregation.
				// The new MenuItem will receive this data via ManagedObjectModel synchronization.
				.then(function() {
					oModifier.insertAggregation(oButton, "customData", oIdToSave, 0, oView);
				})
				.then(function() {
					oModifier.insertAggregation(oMenu, "items", oMenuItem, iIndex, oView);
				})

				// Create ManagedObjectModel for every MenuItem
				// later it will be placed in dependents aggregation of the MenuButton
				// and enabled and visibility properties of each item will be bound to the enabled and visibility property of the MenuButton
				.then(function() {
					return oModifier.createControl(
						"sap.ui.fl.util.ManagedObjectModel",
						oAppComponent,
						oView,
						Object.assign({}, oSelector, {
							id: oSelector.id + '-managedObjectModelMenuItem'
						}),
						{
							object: oMenuItem,
							name: sModelName
						}
					);
				})
				.then(function(oCreatedMenuButtonModel) {
					aMenuButtonModels[iIndex] = oCreatedMenuButtonModel;
					// create binding expression for the visibility and enabled property of the MenuButton
					sPropertyEnabled = sPropertyEnabled + sOR + "${" + sModelName + ">/enabled}";
					sPropertyVisible = sPropertyVisible + sOR + "${" + sModelName + ">/visible}";
					sOR = " || ";
					return {
						menuButtonModels: aMenuButtonModels,
						menuButtonName: aMenuButtonName,
						propertyEnabled: sPropertyEnabled,
						propertyVisible: sPropertyVisible
					};
				});
			}, Promise.resolve());
	}

	/**
	 * Combines sap.m.Button(s) into a sap.m.MenuButton
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.Bar} oControl - Control containing the buttons
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @return {Promise} Promise resolving when the change was applied
	 *
	 * @public
	 */
	CombineButtons.applyChange = function(oChange, oControl, mPropertyBag) {
		if (mPropertyBag.modifier.targets !== "jsControlTree") {
			return Promise.reject(new Error("Combine buttons change can't be applied on XML tree"));
		}

		var oChangeContent = oChange.getContent();
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oParent;
		var oSourceControl;
		var iAggregationIndex;
		var sParentAggregation;
		var aButtons;
		var oMenu;
		var oMenuButton;
		var oRevertData = {
			parentAggregation: "",
			insertIndexes: []
		};
		var aMenuButtonModels = [];
		var aMenuButtonName = [];

		return Promise.resolve()
			.then(oModifier.bySelector.bind(oModifier, oChangeContent.combineButtonSelectors[0], oAppComponent, oView))
			.then(function(oReturnedSourceControl) {
				oSourceControl = oReturnedSourceControl;
				oParent = oModifier.getParent(oSourceControl); // === oControl
				var aPromises = [];
				oChangeContent.combineButtonSelectors.forEach(function(oCombineButtonSelector) {
					var oPromise = Promise.resolve()
						.then(oModifier.bySelector.bind(oModifier, oCombineButtonSelector, oAppComponent, oView));
					aPromises.push(oPromise);
				});
				return Promise.all(aPromises);
			})
			.then(function(aCombineButtons){
				aButtons = aCombineButtons;
				return oModifier.getParentAggregationName(aButtons[0], oParent);
			})
			.then(function(sRetrievedParentAggregation){
				sParentAggregation = sRetrievedParentAggregation;
				oRevertData.parentAggregation = sParentAggregation;
				return oModifier.findIndexInParentAggregation(oSourceControl);
			})
			.then(function(iAggrIndex){
				iAggregationIndex = iAggrIndex;
				return oModifier.createControl("sap.m.Menu", oAppComponent, oView, oChangeContent.menuIdSelector);
			})
			.then(function(oCreatedMenu){
				oMenu = oCreatedMenu;
				return oModifier.attachEvent(
					oMenu,
					"itemSelected",
					"sap.m.changeHandler.CombineButtons.pressHandler"
				);
			})
			.then(function(){
				return fnHandleMenuItems(
					aButtons,
					oModifier,
					oAppComponent,
					oMenu,
					oParent,
					sParentAggregation,
					oView,
					oChangeContent,
					oRevertData);
			})
			// Create MenuButton
			.then(function(mMenuItemsInfo) {
				aMenuButtonModels = mMenuItemsInfo.menuButtonModels;
				aMenuButtonName = mMenuItemsInfo.menuButtonName;
				var sPropertyVisible = mMenuItemsInfo.propertyVisible;
				var sPropertyEnabled = mMenuItemsInfo.propertyEnabled;
				return oModifier.createControl(
					"sap.m.MenuButton",
					oAppComponent,
					oView,
					oChangeContent.menuButtonIdSelector,
					{
						visible: "{= " + sPropertyVisible + "}",
						enabled: "{= " + sPropertyEnabled + "}"
					}
				);
			})
			.then(function(oCreatedMenuButton){
				oMenuButton = oCreatedMenuButton;
				// ManagedObjectModel should be placed in `dependents` aggregation of the MenuButton
				return aMenuButtonModels.reduce(function (oPreviousPromise, oModel) {
					return oPreviousPromise
						.then(oModifier.insertAggregation.bind(oModifier, oMenuButton, "dependents", oModel, 0, oView));
				}, Promise.resolve());
			})
			.then(function() {
				oModifier.setProperty(oMenuButton, "text", aMenuButtonName.join("/"));
				return Promise.resolve()
					.then(oModifier.insertAggregation.bind(oModifier, oMenuButton, "menu", oMenu, 0, oView))
					.then(oModifier.insertAggregation.bind(oModifier, oParent, sParentAggregation, oMenuButton, iAggregationIndex, oView))
					.then(function(){
						oChange.setRevertData(oRevertData);
					});
			});
	};

	function fnDestroyControls(aCustomData, oModifier) {
		return aCustomData.reduce(function(oPreviousInnerPromise, oCustomData) {
			return oPreviousInnerPromise
				.then(function(){
					return oModifier.getProperty(oCustomData, "key");
				})
				.then(function(sKey) {
					if (sKey === "originalButtonId"){
						return oModifier.destroy(oCustomData);
					}
					return undefined;
				});
		}, Promise.resolve());
	}

	/**
	 * Reverts applied change
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.IBar} oControl - Bar that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Property bag containing the modifier and the view
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @param {object} mPropertyBag.view - Application view
	 * @return {Promise} Promise resolving when change is reverted
	 * @public
	 */
	CombineButtons.revertChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oRevertData = oChange.getRevertData();
		var oChangeContent = oChange.getContent();
		var sParentAggregation = oRevertData.parentAggregation;
		var oMenuButton, oParent, aButtonsIdsReversed;

		return Promise.resolve()
			.then(function(){
				return oModifier.bySelector(oChangeContent.menuButtonIdSelector, mPropertyBag.appComponent, oView);
			})
			.then(function(oRetrievedButton) {
				oMenuButton = oRetrievedButton;
				oParent = oModifier.getParent(oMenuButton);
				aButtonsIdsReversed = oChangeContent.combineButtonSelectors.slice().reverse();
				// FIXME: fix implementation of ObjectPageDynamicHeaderTitle and remove next line
				return oModifier.removeAggregation(oParent, sParentAggregation, oMenuButton);
			})
			.then(function(){
				return oModifier.destroy(oMenuButton);
			})
			.then(function() {
				var iLength = aButtonsIdsReversed.length;
				return aButtonsIdsReversed.reduce(function(oPreviousPromise, oButtonIdReversed, index){
					var iIndex = index;
					var oButton;
					return oPreviousPromise
						.then(function() {
							return oModifier.bySelector(oButtonIdReversed, mPropertyBag.appComponent, oView);
						})
						// Custom data clean up
						.then(function(oRetrievedButton) {
							oButton = oRetrievedButton;
							return oModifier.getAggregation(oButton, "customData");
						})
						.then(function(aControls) {
							return fnDestroyControls(aControls, oModifier);
						})
						.then(function() {
							return oModifier.insertAggregation(oParent, sParentAggregation, oButton, oRevertData.insertIndexes[iLength - iIndex - 1], oView);
						});
				}, Promise.resolve())
					.then(function() {
						oChange.resetRevertData();
					});
			});
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object to be completed
	 * @param {object} oSpecificChangeInfo - Specific info object
	 * @param {object} oSpecificChangeInfo.combineElementIds - IDs of selected buttons to be combined
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 *
	 * @public
	 */
	CombineButtons.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var aCombineButtonIds = oSpecificChangeInfo.combineElementIds;

		if (aCombineButtonIds && aCombineButtonIds.length > 1) {
			var oContent = {};
			oChange.addDependentControl(aCombineButtonIds, "combinedButtons", mPropertyBag);
			oContent.combineButtonSelectors = aCombineButtonIds.map(function (sCombineButtonId) {
				return oModifier.getSelector(sCombineButtonId, oAppComponent);
			});

			// generate ids for Menu and MenuButton
			oContent.menuButtonIdSelector = oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);
			oContent.menuIdSelector = oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);

			// generate id for menu button items
			oContent.buttonsIdForSave = aCombineButtonIds.map(function() {
				return oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);
			});
			oChange.setContent(oContent);
		} else {
			throw new Error("Combine buttons action cannot be completed: oSpecificChangeInfo.combineElementIds attribute required");
		}
	};

	/**
	 * Callback function which is attached via modifier in applyChange
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @param {object} mParameters - parameters containing the selector and appComponentId
	 * while applying the change.
	 */
	CombineButtons.pressHandler = function(oEvent) {
		var oButton = oEvent.getParameter("item").getModel(sCombineButtonsModelName).getObject();
		oButton.firePress();
	};

	return CombineButtons;
}, /* bExport= */true);
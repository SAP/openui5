/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/util/ManagedObjectModel" // used implicitly by oModifier.createControl() function
], function (
	uid,
	JsControlTreeModifier,
	Component
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

	/**
	 * Combines sap.m.Button(s) into a sap.m.MenuButton
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.Bar} oControl - Control containing the buttons
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @return {boolean} true if change could be applied
	 *
	 * @public
	 */
	CombineButtons.applyChange = function(oChange, oControl, mPropertyBag) {
		if (mPropertyBag.modifier.targets !== "jsControlTree") {
			throw new Error("Combine buttons change can't be applied on XML tree");
		}

		var oChangeDefinition = oChange.getDefinition();
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oSourceControl = oModifier.bySelector(oChangeDefinition.content.combineButtonSelectors[0], oAppComponent, oView);
		var oParent = oModifier.getParent(oSourceControl); // === oControl
		var iAggregationIndex;
		var sParentAggregation;
		var aButtons;
		var bIsRtl = sap.ui.getCore().getConfiguration().getRTL();
		var oMenu;
		var oMenuButton;
		var aMenuButtonName = [];
		var sPropertyEnabled = "";
		var sPropertyVisible = "";
		var sOR = "";
		var oRevertData = {
			parentAggregation: "",
			insertIndexes: []
		};
		var aMenuButtonModels = [];

		aButtons = oChangeDefinition.content.combineButtonSelectors.map(function (oCombineButtonSelector) {
			return oModifier.bySelector(oCombineButtonSelector, oAppComponent, oView);
		});

		sParentAggregation = oModifier.getParentAggregationName(aButtons[0], oParent);
		oRevertData.parentAggregation = sParentAggregation;

		iAggregationIndex = oModifier.findIndexInParentAggregation(oSourceControl);

		oMenu = oModifier.createControl("sap.m.Menu", oAppComponent, oView, oChangeDefinition.content.menuIdSelector);

		aButtons.forEach(function (oButton, iIndex) {
			var oIdToSave;
			var oMenuItem;
			var oSelector = oChangeDefinition.content.buttonsIdForSave[iIndex];
			var sButtonText = oModifier.getProperty(oButton, "text");

			oMenuItem = oModifier.createControl("sap.m.MenuItem", oAppComponent, oView, oSelector);

			// Save the original position of the button
			oRevertData.insertIndexes[iIndex] = oModifier.findIndexInParentAggregation(oButton);

			oModifier.attachEvent(
				oMenuItem,
				"press",
				"sap.m.changeHandler.CombineButtons.pressHandler",
				{
					selector: oModifier.getSelector(oButton, oAppComponent),
					appComponentId: oAppComponent.getId()
				}
			);

			var sModelName = "$sap.m.flexibility.CombineButtonsModel";
			var oManagedObjectModel = oModifier.createControl(
				"sap.ui.fl.util.ManagedObjectModel",
				oAppComponent,
				oView,
				Object.assign({}, oSelector, {
					id: oSelector.id + '-managedObjectModel'
				}),
				{
					object: oButton,
					name: sModelName
				}
			);
			// ManagedObjectModel should be placed in `dependents` aggregation of MenuItem
			oModifier.insertAggregation(oMenuItem, "dependents", oManagedObjectModel, 0, oView);

			oModifier.bindProperty(oMenuItem, "text", sModelName + ">/text");
			oModifier.bindProperty(oMenuItem, "icon", sModelName + ">/icon");
			oModifier.bindProperty(oMenuItem, "enabled", sModelName + ">/enabled");
			oModifier.bindProperty(oMenuItem, "visible", sModelName + ">/visible");
			oModifier.bindAggregation(oMenuItem, "customData", {
				path: sModelName + ">/customData",
				template: oModifier.createControl(
					"sap.ui.core.CustomData",
					oAppComponent,
					oView,
					Object.assign({}, oSelector, {
						id: oSelector.id + '-customData'
					}),
					{
						key: "{ path: '" + sModelName + ">key' }",
						value: "{ path: '" + sModelName + ">value' }"
					}
				),
				templateShareable: false
			}, oView);

			// FIXME: will not work in XML in case original button has a binding on `text` property
			if (sButtonText) {
				bIsRtl ? aMenuButtonName.unshift(sButtonText) : aMenuButtonName.push(sButtonText);
			}

			// Add suffix to the id, so we can get the original ids of the combined buttons
			// when we want to split the menu. The suffix is used in SplitMenuButton change handler.
			oSelector.id = oSelector.id + "-originalButtonId"; // FIXME: do not mutate original object!

			// Create CustomData, holding the original ids of the combined buttons
			oIdToSave = oModifier.createControl("sap.ui.core.CustomData", oAppComponent, oView, oSelector);
			oModifier.setProperty(oIdToSave, "key", "originalButtonId");
			oModifier.setProperty(oIdToSave, "value", oModifier.getId(oButton));

			// FIXME: fix implementation of ObjectPageDynamicHeaderTitle and remove next line
			oModifier.removeAggregation(oParent, sParentAggregation, oButton);

			// Adding each button control to the container's dependents aggregation
			oModifier.insertAggregation(oParent, "dependents", oButton, 0, oView);

			// Saving original ID to original button to avoid conflict with aggregation binding for customData aggregation.
			// The new MenuItem will receive this data via ManagedObjectModel synchronization.
			oModifier.insertAggregation(oButton, "customData", oIdToSave, 0, oView);

			oModifier.insertAggregation(oMenu, "items", oMenuItem, iIndex, oView);

			// Create ManagedObjectModel for every MenuItem
			// later it will be placed in dependents aggregation of the MenuButton
			// and enabled and visibility properties of each item will be bound to the enabled and visibility property of the MenuButton
			var sModelName = "$sap.m.flexibility.MenuButtonModel" + iIndex;
			aMenuButtonModels[iIndex] = oModifier.createControl(
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

			// create binding expression for the visibility and enabled property of the MenuButton
			sPropertyEnabled = sPropertyEnabled + sOR + "${" + sModelName + ">/enabled}";
			sPropertyVisible = sPropertyVisible + sOR + "${" + sModelName + ">/visible}";
			sOR = " || ";
		});

		// Create MenuButton
		oMenuButton = oModifier.createControl(
				"sap.m.MenuButton",
				oAppComponent,
				oView,
				oChangeDefinition.content.menuButtonIdSelector,
				{
					visible: "{= " + sPropertyVisible + "}",
					enabled: "{= " + sPropertyEnabled + "}"
				}
		);

		// ManagedObjectModel should be placed in `dependents` aggregation of the MenuButton
		aMenuButtonModels.forEach(function (oModel) {
			oModifier.insertAggregation(oMenuButton, "dependents", oModel, 0, oView);
		});

		oModifier.setProperty(oMenuButton, "text", aMenuButtonName.join("/"));
		oModifier.insertAggregation(oMenuButton, "menu", oMenu, 0, oView);
		oModifier.insertAggregation(oParent, sParentAggregation, oMenuButton, iAggregationIndex, oView);
		oChange.setRevertData(oRevertData);

		return true;
	};

	/**
	 * Reverts applied change
	 *
	 * @param {sap.ui.fl.Change} oChange - Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.IBar} oControl - Bar that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Property bag containing the modifier and the view
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @param {object} mPropertyBag.view - Application view
	 * @return {boolean} true if successful
	 * @public
	 */
	CombineButtons.revertChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oRevertData = oChange.getRevertData();
		var oChangeDefinition = oChange.getDefinition();
		var sParentAggregation = oRevertData.parentAggregation;
		var oMenuButton = oModifier.bySelector(oChangeDefinition.content.menuButtonIdSelector, mPropertyBag.appComponent, oView);
		var oParent = oModifier.getParent(oMenuButton);
		var aButtonsIdsReversed = oChangeDefinition.content.combineButtonSelectors.slice().reverse();
		var oButton;

		// FIXME: fix implementation of ObjectPageDynamicHeaderTitle and remove next line
		oModifier.removeAggregation(oParent, sParentAggregation, oMenuButton);
		oModifier.destroy(oMenuButton);

		for (var i = 0, l = aButtonsIdsReversed.length; i < l; i++) {
			oButton = oModifier.bySelector(aButtonsIdsReversed[i], mPropertyBag.appComponent, oView);

			// Custom data clean up
			oModifier.getAggregation(oButton, "customData").some(function (oCustomData) { // eslint-disable-line no-loop-func
				if (oModifier.getProperty(oCustomData, "key") === "originalButtonId") {
					oModifier.destroy(oCustomData);
					return true;
				}
			});

			oModifier.insertAggregation(oParent, sParentAggregation, oButton, oRevertData.insertIndexes[l - i - 1], oView);
		}

		oChange.resetRevertData();

		return true;
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
		var oChangeDefinition = oChange.getDefinition();
		var aCombineButtonIds = oSpecificChangeInfo.combineElementIds;

		if (aCombineButtonIds && aCombineButtonIds.length > 1) {
			oChange.addDependentControl(aCombineButtonIds, "combinedButtons", mPropertyBag);
			oChangeDefinition.content.combineButtonSelectors = aCombineButtonIds.map(function (sCombineButtonId) {
				return oModifier.getSelector(sCombineButtonId, oAppComponent);
			});

			// generate ids for Menu and MenuButton
			oChangeDefinition.content.menuButtonIdSelector = oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);
			oChangeDefinition.content.menuIdSelector = oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);

			// generate id for menu button items
			oChangeDefinition.content.buttonsIdForSave = aCombineButtonIds.map(function() {
				return oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);
			});
		} else {
			throw new Error("Combine buttons action cannot be completed: oSpecificChangeInfo.combineElementIds attribute required");
		}
	};

	/**
	 * Callback function which is attached via modifier in applyChange
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @param {object} mSelector - Selector object
	 * @param {string} mSelector.id - ID used for determination of the flexibility target
	 * @param {boolean} mSelector.idIsLocal - Flag if the selector.id has to be concatenated with the application component ID
	 * while applying the change.
	 */
	CombineButtons.pressHandler = function (oEvent, mParameters) {
		var oButton = JsControlTreeModifier.bySelector(mParameters.selector, Component.get(mParameters.appComponentId));
		oButton.firePress();
	};

	return CombineButtons;
}, /* bExport= */true);
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/base/util/uid",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/util/ManagedObjectModel" // used implicitly by oModifier.createControl() function
], function (
	FlexUtils,
	uid,
	JsControlTreeModifier
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
		var oView = FlexUtils.getViewForControl(oControl);
		var oAppComponent = mPropertyBag.appComponent;
		var oSourceControl = oModifier.bySelector(oChangeDefinition.content.combineButtonSelectors[0], oAppComponent);
		var oParent = oModifier.getParent(oSourceControl);
		var iAggregationIndex;
		var sParentAggregation;
		var aButtons;
		var bIsRtl = sap.ui.getCore().getConfiguration().getRTL();
		var oMenu;
		var oMenuButton;
		var aMenuButtonName = [];
		var oRevertData = {
			parentAggregation: "",
			insertIndex: 0
		};

		aButtons = oChangeDefinition.content.combineButtonSelectors.map(function (oCombineButtonSelector) {
			return oModifier.bySelector(oCombineButtonSelector, oAppComponent);
		});

		sParentAggregation = aButtons[0].sParentAggregationName;
		oRevertData.parentAggregation = sParentAggregation;

		iAggregationIndex = oModifier.findIndexInParentAggregation(oSourceControl);

		oMenu = oModifier.createControl("sap.m.Menu", oAppComponent, oView, oChangeDefinition.content.menuIdSelector);

		oRevertData.insertIndex = iAggregationIndex;
		oRevertData.insertIndexes = [];

		aButtons.forEach(function (oButton, iIndex) {
			var oIdToSave;
			var oMenuItem;
			var oSelector = oChangeDefinition.content.buttonsIdForSave[iIndex];
			var sButtonText = oModifier.getProperty(oButton, "text");

			// Save indexes of all buttons in revert data, so then revertChange can place them into correct positions.
			var iAggregationItemIndex = oChangeDefinition.content.aggregationItemsIndex[iIndex];
			oRevertData.insertIndexes[iIndex] = iAggregationItemIndex;

			oMenuItem = oModifier.createControl("sap.m.MenuItem", oAppComponent, oView, oSelector);

			oModifier.attachEvent(oMenuItem, "press", "sap.m.changeHandler.CombineButtons.pressHandler", oModifier.getSelector(oButton, oAppComponent));

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
			oModifier.insertAggregation(oMenuItem, "dependents", oManagedObjectModel);

			oModifier.bindProperty(oMenuItem, "text", sModelName + ">/text");
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
						key: {
							path: sModelName + ">key"
						},
						value: {
							path: sModelName + ">value"
						}
					}
				)
			});

			// FIXME: will not work in XML in case original button has a binding on `text` property
			if (sButtonText) {
				bIsRtl ? aMenuButtonName.unshift(sButtonText) : aMenuButtonName.push(sButtonText);
			}

			// Add suffix to the id, so we can get the original ids of the combined buttons
			// when we want to split the menu. The suffix is used in SplitMenuButton change handler.
			oSelector.id = oSelector.id + "-originalButtonId";

			// Create CustomData, holding the original ids of the combined buttons
			oIdToSave = oModifier.createControl("sap.ui.core.CustomData", oAppComponent, oView, oSelector);
			oModifier.setProperty(oIdToSave, "key", "originalButtonId");
			oModifier.setProperty(oIdToSave, "value", oModifier.getId(oButton));

			// FIXME: fix implementation of ObjectPageDynamicHeaderTitle and remove next line
			oModifier.removeAggregation(oParent, sParentAggregation, oButton);

			// Adding each button control to the container's dependents aggregation
			oModifier.insertAggregation(oParent, "dependents", oButton);
			oModifier.insertAggregation(oMenuItem, "customData", oIdToSave, 0);
			oModifier.insertAggregation(oMenu, "items", oMenuItem, iIndex);
		});

		oMenuButton = oModifier.createControl("sap.m.MenuButton", oAppComponent, oView, oChangeDefinition.content.menuButtonIdSelector);

		oModifier.setProperty(oMenuButton, "text", aMenuButtonName.join("/"));
		oModifier.insertAggregation(oMenuButton, "menu", oMenu, 0);
		oModifier.insertAggregation(oParent, sParentAggregation, oMenuButton, iAggregationIndex);
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
		var oView = FlexUtils.getViewForControl(oControl);
		var oRevertData = oChange.getRevertData();
		var oChangeDefinition = oChange.getDefinition();
		var sParentAggregation = oRevertData.parentAggregation;
		var iAggregationIndex = oRevertData.insertIndex;
		var oMenuButton = oModifier.bySelector(oChangeDefinition.content.menuButtonIdSelector, mPropertyBag.appComponent, oView);
		var oParent = oModifier.getParent(oMenuButton);
		var aButtonsIds = oChangeDefinition.content.combineButtonSelectors;
		var oButton;

		for (var i = 0; i < aButtonsIds.length; i++) {
			oButton = oModifier.bySelector(aButtonsIds[i], mPropertyBag.appComponent);
			oModifier.insertAggregation(oParent, sParentAggregation, oButton, iAggregationIndex);
		}

		// FIXME: fix implementation of ObjectPageDynamicHeaderTitle and remove next line
		oModifier.removeAggregation(oParent, sParentAggregation, oMenuButton);
		oModifier.destroy(oMenuButton);


		// we need to sort positions where the buttons were before in order first to insert on correct places
		// those with lower value so not to mess up the one with higher
		// make list with indices and values so after sorting the values we need indices for getting correct Button id
		var sortInsertIndexes = oRevertData.insertIndexes.map(function(e,i) {
			return {ind: i, val: e};
		});
		// sort index/value couples, based on values
		sortInsertIndexes.sort(function(x, y) {
			return x.val - y.val;
		});

		for (var i = 0; i < aButtonsIds.length; i++) {
			var iIndex = sortInsertIndexes[i].ind;
			var iPosition = sortInsertIndexes[i].val;
			oButton = oModifier.bySelector(aButtonsIds[iIndex], mPropertyBag.appComponent);
			oModifier.insertAggregation(oParent, sParentAggregation, oButton, iPosition);
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

			oChangeDefinition.content.aggregationItemsIndex = aCombineButtonIds.map(function (sCombineButtonId) {
				var oSourceBtn = oModifier.bySelector(sCombineButtonId, oAppComponent);

				// Save indexes of all buttons in revert data, so then revertChange can place them into correct positions.
				return oModifier.findIndexInParentAggregation(oSourceBtn);
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
	CombineButtons.pressHandler = function (oEvent, mSelector) {
		var oButton = JsControlTreeModifier.bySelector(mSelector);
		oButton.firePress();
	};

	return CombineButtons;
}, /* bExport= */true);
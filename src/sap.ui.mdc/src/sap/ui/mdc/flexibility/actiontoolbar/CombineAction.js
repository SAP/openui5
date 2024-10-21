/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/m/changeHandler/CombineButtons"
], (
	Localization,
	CombineButtonsHandler
) => {
	"use strict";

	/**
	 * Change handler for splitting sap.ui.mdc.actiontoolbar.ActionToolbarAction with sap.m.MenuButton into actions containing sap.m.Button(s).
	 *
	 * @alias sap.ui.mdc.flexibility.actiontoolbar.CombineAction
	 * @author SAP SE
	 * @version ${version}
	 */
	const CombineAction = {
		...CombineButtonsHandler
	};

	const sCombineButtonsModelName = "$sap.m.flexibility.CombineButtonsModel";

	function fnHandleMenuItems(mPropertyBag) {
		const {
			buttons: aButtons,
			modifier: oModifier,
			appComponent: oAppComponent,
			menu: oMenu,
			actionToolbar: oActionToolbar,
			actionToolbarAggregation: sActionToolbarAggregation,
			view: oView,
			changeContent: oChangeContent,
			revertData: oRevertData
		} = mPropertyBag;

		let sPropertyEnabled = "";
		let sPropertyVisible = "";
		let sOR = "";
		const aMenuButtonModels = [];
		const bIsRtl = Localization.getRTL();
		const aMenuButtonName = [];

		return aButtons.reduce(async (oPreviousPromise, oButton, index) => {
			const iIndex = index;
			const oSelector = oChangeContent.buttonsIdForSave[iIndex];
			const sModelName = "$sap.m.flexibility.MenuButtonModel" + iIndex;
			const oActionToolbarAction = oModifier.getParent(oButton);

			await oPreviousPromise;

			const sButtonText = await oModifier.getProperty(oButton, "text");
			const oMenuItem = await oModifier.createControl("sap.m.MenuItem", oAppComponent, oView, oSelector);

			// Save the original position of the button
			const iIndexInParentAggregation = await oModifier.findIndexInParentAggregation(oActionToolbarAction);
			oRevertData.insertIndexes[iIndex] = iIndexInParentAggregation;

			const oManagedObjectModel = await oModifier.createControl(
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
			// ManagedObjectModel should be placed in `dependents` aggregation of MenuItem
			await oModifier.insertAggregation(oMenuItem, "dependents", oManagedObjectModel, 0, oView);
			const oCustomData = await oModifier.createControl(
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

			oModifier.bindProperty(oMenuItem, "text", sCombineButtonsModelName + ">/text");
			oModifier.bindProperty(oMenuItem, "icon", sCombineButtonsModelName + ">/icon");
			oModifier.bindProperty(oMenuItem, "enabled", sCombineButtonsModelName + ">/enabled");
			oModifier.bindProperty(oMenuItem, "visible", sCombineButtonsModelName + ">/visible");
			await oModifier.bindAggregation(oMenuItem, "customData", {
				path: sCombineButtonsModelName + ">/customData",
				template: oCustomData,
				templateShareable: false
			}, oView);

			// FIXME: will not work in XML in case original button has a binding on `text` property
			if (sButtonText) {
				if (bIsRtl) {
					aMenuButtonName.unshift(sButtonText);
				} else {
					aMenuButtonName.push(sButtonText);
				}
			}
			// Add suffix to the id, so we can get the original ids of the combined buttons
			// when we want to split the menu. The suffix is used in SplitMenuButton change handler.
			const oNewSelector = Object.assign({}, oSelector, {
				id: oSelector.id + '-originalButtonId'
			});

			// Create CustomData, holding the original ids of the combined buttons
			const oIdToSave = await oModifier.createControl("sap.ui.core.CustomData", oAppComponent, oView, oNewSelector);
			oModifier.setProperty(oIdToSave, "key", "originalButtonId");
			oModifier.setProperty(oIdToSave, "value", oModifier.getId(oButton));

			await oModifier.removeAggregation(oActionToolbar, sActionToolbarAggregation, oActionToolbarAction);

			// Adding each button control to the container's dependents aggregation
			await oModifier.insertAggregation(oActionToolbar, "dependents", oActionToolbarAction, 0, oView);

			// Saving original ID to original button to avoid conflict with aggregation binding for customData aggregation.
			// The new MenuItem will receive this data via ManagedObjectModel synchronization.
			await oModifier.insertAggregation(oButton, "customData", oIdToSave, 0, oView);
			await oModifier.insertAggregation(oMenu, "items", oMenuItem, iIndex, oView);

			// Create ManagedObjectModel for every MenuItem
			// later it will be placed in dependents aggregation of the MenuButton
			// and enabled and visibility properties of each item will be bound to the enabled and visibility property of the MenuButton
			aMenuButtonModels[iIndex] = await oModifier.createControl(
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

			return {
				menuButtonModels: aMenuButtonModels,
				menuButtonName: aMenuButtonName,
				propertyEnabled: sPropertyEnabled,
				propertyVisible: sPropertyVisible
			};
		}, Promise.resolve());
	}

	CombineAction.applyChange = async function(oChange, oControl, mPropertyBag) {
		if (mPropertyBag.modifier.targets !== "jsControlTree") {
			return Promise.reject(new Error("Combine buttons change can't be applied on XML tree"));
		}

		const oChangeContent = oChange.getContent();
		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oAppComponent = mPropertyBag.appComponent;

		const oRevertData = {
			parentAggregation: "",
			insertIndexes: []
		};

		const aButtonsToCombine = await Promise.all(oChangeContent.combineButtonSelectors.map((oCombineButtonSelector) => {
			return oModifier.bySelector(oCombineButtonSelector, oAppComponent, oView);
		}));
		const sActionToolbarActionAggregation = await oModifier.getParentAggregationName(aButtonsToCombine[0], oModifier.getParent(aButtonsToCombine[0]));

		const oSourceControl = await oModifier.bySelector(oChangeContent.combineButtonSelectors[0], oAppComponent, oView);
		const oActionToolbarAction = oModifier.getParent(oSourceControl); // === oControl
		const oActionToolbar = oModifier.getParent(oActionToolbarAction);
		const sActionToolbarAggregation = await oModifier.getParentAggregationName(oActionToolbarAction, oActionToolbar);
		oRevertData.parentAggregation = sActionToolbarAggregation;

		const iAggregationIndex = await oModifier.findIndexInParentAggregation(oActionToolbarAction);
		const oCreatedMenu = await oModifier.createControl("sap.m.Menu", oAppComponent, oView, oChangeContent.menuIdSelector);
		oCreatedMenu.attachEvent(
			"itemSelected",
			"sap.m.changeHandler.CombineButtons.pressHandler",
			CombineButtonsHandler.pressHandler
		);
		const mMenuItemsInfo = await fnHandleMenuItems({
			buttons: aButtonsToCombine,
			modifier: oModifier,
			appComponent: oAppComponent,
			menu: oCreatedMenu,
			actionToolbar: oActionToolbar,
			actionToolbarAggregation: sActionToolbarAggregation,
			view: oView,
			changeContent: oChangeContent,
			revertData: oRevertData
		});

		const aMenuButtonModels = mMenuItemsInfo.menuButtonModels;
		const aMenuButtonName = mMenuItemsInfo.menuButtonName;
		const sPropertyVisible = mMenuItemsInfo.propertyVisible;
		const sPropertyEnabled = mMenuItemsInfo.propertyEnabled;

		const oMenuButton = await oModifier.createControl(
			"sap.m.MenuButton",
			oAppComponent,
			oView,
			oChangeContent.menuButtonIdSelector,
			{
				visible: "{= " + sPropertyVisible + "}",
				enabled: "{= " + sPropertyEnabled + "}"
			}
		);
		await aMenuButtonModels.reduce(async (oPreviousPromise, oModel) => {
			await oPreviousPromise;
			return oModifier.insertAggregation(oMenuButton, "dependents", oModel, 0, oView);
		}, Promise.resolve());

		oModifier.setProperty(oMenuButton, "text", aMenuButtonName.join("/"));
		await oModifier.insertAggregation(oMenuButton, "menu", oCreatedMenu, 0, oView);

		const oCreatedAction = await oModifier.createControl(
			"sap.ui.mdc.actiontoolbar.ActionToolbarAction",
			oAppComponent,
			oView,
			{ ...oChangeContent.menuButtonIdSelector, id: oChangeContent.menuButtonIdSelector.id + '--action' });
		await oModifier.insertAggregation(oCreatedAction, sActionToolbarActionAggregation, oMenuButton, 0, oView);
		await oModifier.insertAggregation(oActionToolbar, sActionToolbarAggregation, oCreatedAction, iAggregationIndex, oView);

		oChange.setRevertData(oRevertData);

		return Promise.resolve();
	};

	function fnDestroyControls(aCustomData, oModifier) {
		return aCustomData.reduce(async (oPreviousInnerPromise, oCustomData) => {
			await oPreviousInnerPromise;

			const sKey = await oModifier.getProperty(oCustomData, "key");
			if (sKey === "originalButtonId") {
				return oModifier.destroy(oCustomData);
			}
			return undefined;
		}, Promise.resolve());
	}

	CombineAction.revertChange = async function(oChange, oControl, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oRevertData = oChange.getRevertData();
		const oChangeContent = oChange.getContent();
		const sParentAggregation = oRevertData.parentAggregation;

		const oMenuButton = await oModifier.bySelector(oChangeContent.menuButtonIdSelector, mPropertyBag.appComponent, oView);
		const oActionToolbarAction = oModifier.getParent(oMenuButton);
		const oActionToolbar = oModifier.getParent(oActionToolbarAction);
		const aButtonsIdsReversed = oChangeContent.combineButtonSelectors.slice().reverse();

		// FIXME: fix implementation of ObjectPageDynamicHeaderTitle and remove next line
		await oModifier.removeAggregation(oActionToolbar, sParentAggregation, oActionToolbarAction);
		await oModifier.destroy(oActionToolbarAction);

		const iLength = aButtonsIdsReversed.length;

		await aButtonsIdsReversed.reduce(async (oPreviousPromise, oButtonIdReversed, index) => {
			const iIndex = index;
			await oPreviousPromise;

			// Custom data clean up
			const oButton = oModifier.bySelector(oButtonIdReversed, mPropertyBag.appComponent, oView);
			const aCustomData = await oModifier.getAggregation(oButton, "customData");
			await fnDestroyControls(aCustomData, oModifier);

			const oActionToolbarAction = oModifier.getParent(oButton);

			return oModifier.insertAggregation(oActionToolbar, sParentAggregation, oActionToolbarAction, oRevertData.insertIndexes[iLength - iIndex - 1], oView);
		}, Promise.resolve());
		oChange.resetRevertData();
	};

	return CombineAction;

}, /* bExport= */true);
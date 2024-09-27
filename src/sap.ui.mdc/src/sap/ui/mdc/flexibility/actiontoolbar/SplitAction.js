/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/changeHandler/SplitMenuButton"
], (
	SplitMenuButtonHandler
) => {
	"use strict";

	const SOURCE_CONTROL = "sourceControl";

	/**
	 * Change handler for splitting sap.ui.mdc.actiontoolbar.ActionToolbarAction with sap.m.MenuButton into actions containing sap.m.Button(s).
	 *
	 * @alias sap.ui.mdc.flexibility.actiontoolbar.SplitAction
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.129
	 */
	const SplitAction = {
		...SplitMenuButtonHandler,
		applyChange: async function(oChange, oControl, mPropertyBag) {
			if (mPropertyBag.modifier.targets !== "jsControlTree") {
				return Promise.reject(new Error("Split change can't be applied on XML tree"));
			}

			const oChangeContent = oChange.getContent();
			const oModifier = mPropertyBag.modifier;
			const oView = mPropertyBag.view;
			const oAppComponent = mPropertyBag.appComponent;
			const oMenuButton = oChange.getDependentControl(SOURCE_CONTROL, mPropertyBag);

			const oMenu = await oModifier.getAggregation(oMenuButton, "menu");
			const aMenuItems = await oModifier.getAggregation(oMenu, "items");
			const oActionToolbarAction = oModifier.getParent(oMenuButton);
			const oActionToolbar = oModifier.getParent(oActionToolbarAction);
			const sActionToolbarAggregation = await oModifier.getParentAggregationName(oActionToolbarAction, oActionToolbar);
			// const sParentAggregation = await oModifier.getParentAggregationName(oMenuButton, oActionToolbarAction);
			const iAggregationIndex = await oModifier.findIndexInParentAggregation(oActionToolbarAction);

			const oRevertData = {
				parentAggregation: sActionToolbarAggregation,
				insertIndex: iAggregationIndex,
				insertedActions: []
			};
			const aNewElementSelectors = oChangeContent.newElementIds;

			await aMenuItems.reduce(async (oPreviousPromise, oMenuItem, index) => {
				await oPreviousPromise;

				const iIndex = index;
				const oSelector = aNewElementSelectors[iIndex];

				const oCreatedAction = await oModifier.createControl("sap.ui.mdc.actiontoolbar.ActionToolbarAction", oAppComponent, oView, oSelector);
				const oButton = await oModifier.createControl("sap.m.Button", oAppComponent, oView, { ...oSelector, id: oSelector.id + '--button' });
				await oModifier.insertAggregation(oCreatedAction, "action", oButton, 0);

				oRevertData.insertedActions.push(oSelector);
				const sModelName = "$sap.m.flexibility.SplitButtonsModel";
				const oManagedObjectModel = await oModifier.createControl(
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

				await oModifier.insertAggregation(oButton, "dependents", oManagedObjectModel, 0, oView);
				oModifier.bindProperty(oButton, "text", sModelName + ">/text");
				oModifier.bindProperty(oButton, "icon", sModelName + ">/icon");
				oModifier.bindProperty(oButton, "enabled", sModelName + ">/enabled");
				oModifier.bindProperty(oButton, "visible", sModelName + ">/visible");

				const oTemplate = await oModifier.createControl(
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

				await oModifier.bindAggregation(oButton, "customData", {
					path: sModelName + ">/customData",
					template: oTemplate,
					templateShareable: false
				});
				oButton.attachEvent(
					"press",
					{
						selector: oModifier.getSelector(oMenuItem, oAppComponent),
						appComponentId: oAppComponent.getId(),
						menu: oMenu
					},
					SplitMenuButtonHandler.pressHandler
				);

				return oModifier.insertAggregation(oActionToolbar, sActionToolbarAggregation, oCreatedAction, iAggregationIndex + iIndex, oView);
			}, Promise.resolve());

			await oModifier.removeAggregation(oActionToolbar, sActionToolbarAggregation, oActionToolbarAction);
			await oModifier.insertAggregation(oActionToolbar, "dependents", oActionToolbarAction, 0, oView);
			oChange.setRevertData(oRevertData);

			return Promise.resolve();
		},
		revertChange: async function(oChange, oControl, mPropertyBag) {
			const oModifier = mPropertyBag.modifier;
			const oRevertData = oChange.getRevertData();
			const oMenuButton = oChange.getDependentControl(SOURCE_CONTROL, mPropertyBag);
			const oAppComponent = mPropertyBag.appComponent;
			const oView = mPropertyBag.view;
			const oActionToolbarAction = oModifier.getParent(oMenuButton);
			const oActionToolbar = oModifier.getParent(oActionToolbarAction);
			const sParentAggregation = oRevertData.parentAggregation;
			const iAggregationIndex = oRevertData.insertIndex;

			const aInsertedActions = [];
			oRevertData.insertedActions.forEach((oSelector) => {
				aInsertedActions.push(oModifier.bySelector(oSelector, oAppComponent, oView));
			});
			await aInsertedActions.reduce(async (oPreviousPromise, oAction) => {
				await oPreviousPromise;

				await oModifier.removeAggregation(oActionToolbar, sParentAggregation, oAction);
				return oModifier.destroy(oAction);
			}, Promise.resolve());
			await oModifier.insertAggregation(oActionToolbar, sParentAggregation, oActionToolbarAction, iAggregationIndex, oView);
			oChange.resetRevertData();
		}
	};

	return SplitAction;

});
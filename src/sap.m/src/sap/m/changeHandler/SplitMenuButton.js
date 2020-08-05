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
	 * @return {boolean} true if change could be applied
	 *
	 * @public
	 */
	SplitMenuButton.applyChange = function(oChange, oControl, mPropertyBag) {
		if (mPropertyBag.modifier.targets !== "jsControlTree") {
			throw new Error("Split change can't be applied on XML tree");
		}

		var oChangeDefinition = oChange.getDefinition();
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oSourceControl = oChange.getDependentControl(SOURCE_CONTROL, mPropertyBag);
		var oMenu = oModifier.getAggregation(oSourceControl, "menu");
		var aMenuItems = oModifier.getAggregation(oMenu, "items");
		var oParent = oModifier.getParent(oSourceControl);
		var sParentAggregation = oModifier.getParentAggregationName(oSourceControl, oParent);
		var iAggregationIndex = oModifier.findIndexInParentAggregation(oSourceControl);
		var aNewElementSelectors = oChangeDefinition.content.newElementIds;
		var oRevertData = {
			parentAggregation: sParentAggregation,
			insertIndex: iAggregationIndex,
			insertedButtons: []
		};

		aMenuItems.forEach(function (oMenuItem, index) {
			var oSelector = aNewElementSelectors[index];
			var oButton = oModifier.createControl("sap.m.Button", oAppComponent, oView, oSelector);

			oRevertData.insertedButtons.push(oSelector);

			var sModelName = "$sap.m.flexibility.SplitButtonsModel";
			var oManagedObjectModel = oModifier.createControl(
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

			// ManagedObjectModel should be placed in `dependents` aggregation of the Button
			oModifier.insertAggregation(oButton, "dependents", oManagedObjectModel, 0, oView);

			oModifier.bindProperty(oButton, "text", sModelName + ">/text");
			oModifier.bindProperty(oButton, "icon", sModelName + ">/icon");
			oModifier.bindProperty(oButton, "enabled", sModelName + ">/enabled");
			oModifier.bindProperty(oButton, "visible", sModelName + ">/visible");
			oModifier.bindAggregation(oButton, "customData", {
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
				),
				templateShareable: false
			});

			oModifier.attachEvent(
				oButton,
				"press",
				"sap.m.changeHandler.SplitMenuButton.pressHandler",
				{
					selector: oModifier.getSelector(oMenuItem, oAppComponent),
					appComponentId: oAppComponent.getId()
				}
			);

			oModifier.insertAggregation(oParent, sParentAggregation, oButton, iAggregationIndex + index, oView);
		});

		oModifier.removeAggregation(oParent, sParentAggregation, oSourceControl);
		oModifier.insertAggregation(oParent, "dependents", oSourceControl, 0, oView);

		oChange.setRevertData(oRevertData);

		return true;
	};

	/**
	 * Reverts applied change
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
	 * @param {sap.m.IBar} oControl Bar control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @return {boolean} true if change could be applied
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
		var aInsertedButtons = oRevertData.insertedButtons.map(function (oSelector) {
			return oModifier.bySelector(oSelector, oAppComponent, oView);
		});

		aInsertedButtons.forEach(function (oButton) {
			oModifier.removeAggregation(oParent, sParentAggregation, oButton);
			oModifier.destroy(oButton);
		});

		oModifier.insertAggregation(oParent, sParentAggregation, oSourceControl, iAggregationIndex, oView);

		oChange.resetRevertData();

		return true;
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
		var oChangeDefinition = oChange.getDefinition();

		if (!oSpecificChangeInfo.newElementIds) {
			throw new Error("Split of MenuButton cannot be applied : oSpecificChangeInfo.newElementIds attribute required");
		}

		if (!oSpecificChangeInfo.sourceControlId) {
			throw new Error("Split of MenuButton cannot be applied : oSpecificChangeInfo.sourceControlId attribute required");
		}

		oChange.addDependentControl(oSpecificChangeInfo.sourceControlId, SOURCE_CONTROL, mPropertyBag);
		oChangeDefinition.content.sourceSelector = oModifier.getSelector(oSpecificChangeInfo.sourceControlId, oAppComponent);
		oChangeDefinition.content.newElementIds = oSpecificChangeInfo.newElementIds.map(function (sElementId) {
			return oModifier.getSelector(sElementId, oAppComponent);
		});
	};

	/**
	 * Callback function which is attached via modifier in applyChange
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @param {object} mSelector Selector object
	 * @param {string} mSelector.id ID used for determination of the flexibility target
	 * @param {boolean} mSelector.idIsLocal flag if the selector.id has to be concatenated with the application component ID
	 * while applying the change.
	 */
	SplitMenuButton.pressHandler = function (oEvent, mParameters) {
		var oMenuItem = JsControlTreeModifier.bySelector(mParameters.selector, Component.get(mParameters.appComponentId));
		oMenuItem.firePress();
	};

	return SplitMenuButton;
}, /* bExport= */true);

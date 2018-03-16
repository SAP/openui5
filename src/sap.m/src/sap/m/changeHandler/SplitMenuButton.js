/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils", "jquery.sap.strings"], function(FlexUtils, jQuery) {
		"use strict";

		/**
		 * Change handler for splitting sap.m.MenuButton into sap.m.Button(s).
		 *
		 * @alias sap.m.changeHandler.SplitMenuButton
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.48
		 */
		var SplitMenuButton = { };

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

			var oChangeDefinition = oChange.getDefinition(),
				oModifier = mPropertyBag.modifier,
				oView = FlexUtils.getViewForControl(oControl),
				oSourceControl = oChange.getDependentControl(SOURCE_CONTROL, mPropertyBag),
				oMenu = oModifier.getAggregation(oSourceControl, "menu"),
				aMenuItems = oModifier.getAggregation(oMenu, "items"),
				sParentAggregation = oSourceControl.sParentAggregationName,
				oParent = oModifier.getParent(oSourceControl),
				iAggregationIndex = oModifier.findIndexInParentAggregation(oSourceControl),
				aNewElementIds = oChangeDefinition.content.newElementIds.slice(),
				oRevertData = {
					sParentAggregation : sParentAggregation,
					insertIndex: iAggregationIndex,
					insertedButtons: []
				};

			aMenuItems.forEach(function (oMenuItem, index) {
				var aMenuItemCustomData = oModifier.getAggregation(oMenuItem, "customData"),
					aMenuItemDependents = oModifier.getAggregation(oMenuItem, "dependents"),
					sMenuItemId = oModifier.getId(oMenuItem),
					oButton, sSavedId;

				// getting the id of the button before the combine action
				if (aMenuItemCustomData && aMenuItemCustomData.length > 0) {
					var sCheckForId = sMenuItemId + "-originalButtonId";
					aMenuItemCustomData.some(function(oData) {
						if (oModifier.getId(oData) === sCheckForId) {
							sSavedId = oModifier.getProperty(oData, "value");
							return true;
						}
					});
				}

				// If there is id which corresponds to control from before the combine action
				// we need to simply extract the button with the right Id
				// from the dependents aggregation of the MenuItem
				if (sSavedId && aMenuItemDependents.length > 0) {
					aMenuItemDependents.some(function(oMenuItemDependentControl) {
						if (sSavedId === oModifier.getId(oMenuItemDependentControl)) {
							oButton = oMenuItemDependentControl;
							oRevertData.insertedButtons.push({
								id: oModifier.getId(oButton),
								menuItemId: sMenuItemId
							});

							return true;
						}
					});

					// if such button exists - remove it from the dependents aggregation
					// as it will be no longer dependent of the MenuItem.
					if (oButton) {
						oModifier.removeAggregation(oMenuItem, "dependents", oButton);
					}
				} else {
					// Else - create new button
					var sId = aNewElementIds[index];

					oButton = oModifier.createControl("sap.m.Button", mPropertyBag.appComponent, oView, sId);
					oRevertData.insertedButtons.push({
						id: oModifier.getId(oButton)
					});

					oModifier.setProperty(oButton, "text", oModifier.getProperty(oMenuItem, "text"));
					oModifier.setProperty(oButton, "icon",  oModifier.getProperty(oMenuItem, "icon"));

					oButton.attachPress(function(oEvent) {
						return oMenuItem.firePress(oEvent);
					});
				}
				oModifier.insertAggregation(oParent, sParentAggregation, oButton, iAggregationIndex + index);
			});

			oModifier.removeAggregation(oParent, sParentAggregation, oSourceControl);
			oModifier.insertAggregation(oParent, "dependents", oSourceControl);

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

			var oModifier = mPropertyBag.modifier,
				oRevertData =  oChange.getRevertData(),
				oSourceControl = oChange.getDependentControl(SOURCE_CONTROL, mPropertyBag),
				oAppComponent = mPropertyBag.appComponent,
				oParent = oModifier.getParent(oSourceControl),
				sParentAggregation = oRevertData.sParentAggregation,
				iAggregationIndex = oRevertData.insertIndex,
				aButtonInfo = oRevertData.insertedButtons,
				oMenu = oModifier.getAggregation(oSourceControl, "menu"),
				aMenuItems = oModifier.getAggregation(oMenu, "items"),
				aButtons = aButtonInfo.map(function(oButtonInfo){
					return oModifier.bySelector(oButtonInfo.id, oAppComponent);
				});

			aButtonInfo.forEach(function(oButtonInfo, index){
				oModifier.removeAggregation(oParent, sParentAggregation, aButtons[index]);
				if (oButtonInfo.menuItemId) {
					aMenuItems.some(function (oMenuItem) {
						if (oModifier.getId(oMenuItem) === oButtonInfo.menuItemId) {
							oModifier.insertAggregation(oMenuItem, "dependents", aButtons[index]);
							return true;
						}
					});
				} else {
					aButtons[index].destroy();
				}
			});

			oModifier.insertAggregation(oParent, sParentAggregation, oSourceControl, iAggregationIndex);

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

			var oModifier = mPropertyBag.modifier,
				oAppComponent = mPropertyBag.appComponent,
				oChangeDefinition = oChange.getDefinition();

			if (!oSpecificChangeInfo.newElementIds) {
				throw new Error("Split of MenuButton cannot be applied : oSpecificChangeInfo.newElementIds attribute required");
			}

			if (!oSpecificChangeInfo.sourceControlId) {
				throw new Error("Split of MenuButton cannot be applied : oSpecificChangeInfo.sourceControlId attribute required");
			}

			oChangeDefinition.content.newElementIds = oSpecificChangeInfo.newElementIds;
			oChange.addDependentControl(oSpecificChangeInfo.sourceControlId, SOURCE_CONTROL, mPropertyBag);
			oChangeDefinition.content.sourceSelector = oModifier.getSelector(oSpecificChangeInfo.sourceControlId, oAppComponent);
		};

		return SplitMenuButton;
	},
	/* bExport= */true);
/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils", "jquery.sap.global"],
	function(FlexUtils, jQuery) {
		"use strict";

		/**
		 * Change handler for combining sap.m.Button(s) in a sap.m.MenuButton inside sap.m.Bar
		 *
		 * @alias sap.m.changeHandler.CombineButtons
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.48
		 */
		var CombineButtons = { };

		CombineButtons.ADD_HELPER_FUNCTIONS = {
			_fnFindIndexInAggregation : function(oParent, oSourceControl, sParentAggregation) {
				var oParentAggregation,
					bMultipleAggregation = false,
					sParentAggregationSingularName,
					sAggregationNameToUpper;

				// We need to check the aggregation name and if it is multiple or not.
				// There are cases when the control's parent method is overwritten and
				// this leads to differences in the result given by oParent.indexOfAggregation
				// method. Having this in mind:
				// 1. We get the aggregation from the Parent's metadata
				oParentAggregation = oParent.getMetadata().getAllAggregations()[sParentAggregation];

				// 2. Then we check if it is multiple
				bMultipleAggregation = oParentAggregation.multiple;

				// 3. We get the its name or its singular name if it is multiple
				sParentAggregationSingularName = bMultipleAggregation ? oParentAggregation.singularName : oParentAggregation.name;

				// 4. We change it to upper case in order to be able to create the method
				// which is potentially overwritten and/or has additional logic to it
				sAggregationNameToUpper = jQuery.sap.charToUpperCase(sParentAggregationSingularName);

				// 5. We return the correct index of the control in its Parent aggregation
				return oParent["indexOf" + sAggregationNameToUpper](oSourceControl);
			}
		};

		/**
		 * Combines sap.m.Button(s) in a sap.m.MenuButton
		 *
		 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
		 * @param {sap.m.Bar} oControl Containing the buttons
		 * @param {object} mPropertyBag Map of properties
		 * @param {object} mPropertyBag.modifier Modifier for the controls
		 * @return {boolean} true if change could be applied
		 *
		 * @public
		 */
		CombineButtons.applyChange = function(oChange, oControl, mPropertyBag) {

			if (mPropertyBag.modifier.targets !== "jsControlTree") {
				throw new Error("Combine buttons change can't be applied on XML tree");
			}

			var oChangeDefinition = oChange.getDefinition(),
				oModifier = mPropertyBag.modifier,
				oView = FlexUtils.getViewForControl(oControl),
				oSourceControl = oModifier.bySelector(oChangeDefinition.content.combineButtonSelectors[0], mPropertyBag.appComponent),
				oAppComponent = mPropertyBag.appComponent,
				oParent = oModifier.getParent(oSourceControl),
				iAggregationIndex, sParentAggregation, aButtons,
				bIsRtl = sap.ui.getCore().getConfiguration().getRTL(),
				oMenu, oMenuButton, aMenuButtonName = [];

			aButtons = oChangeDefinition.content.combineButtonSelectors.map(function (oCombineButtonSelector) {
				return oModifier.bySelector(oCombineButtonSelector, oAppComponent);
			});

			sParentAggregation = aButtons[0].sParentAggregationName;
			iAggregationIndex = this.ADD_HELPER_FUNCTIONS._fnFindIndexInAggregation(oParent, oSourceControl, sParentAggregation);

			oMenu = oModifier.createControl("sap.m.Menu", mPropertyBag.appComponent, oView);

			aButtons.forEach(function (oButton, index) {
				var oIdToSave,
					oMenuItem,
					oSelector = oChangeDefinition.content.buttonsIdForSave[index],
					sButtonText = oModifier.getProperty(oButton, "text");

				oMenuItem = oModifier.createControl("sap.m.MenuItem", mPropertyBag.appComponent, oView, oSelector);
				oModifier.setProperty(oMenuItem, "text", oButton.mProperties.text);
				oModifier.setProperty(oMenuItem, "icon", oButton.mProperties.icon);
				oMenuItem.attachPress(function(oEvent) {
					return oButton.firePress(oEvent);
				});

				if (sButtonText) {
					bIsRtl ? aMenuButtonName.unshift(sButtonText) : aMenuButtonName.push(sButtonText);
				}

				// add suffix to the id, so we can get the original ids of the combined buttons
				// when we want to split the menu
				// the suffix is used in SplitMenuButton file
				oSelector.id = oSelector.id + "-originalButtonId";
				// create CustomData, holding the original ids of the combined buttons
				oIdToSave = oModifier.createControl("sap.ui.core.CustomData", mPropertyBag.appComponent, oView, oSelector);
				oModifier.setProperty(oIdToSave, "key", "originalButtonId");
				oModifier.setProperty(oIdToSave, "value", oModifier.getId(oButton));

				oModifier.removeAggregation(oParent, sParentAggregation, oButton);
				// adding each button control to the menuItem's dependents aggregation
				// this way we can save all relevant information it may have
				oModifier.insertAggregation(oMenuItem, "dependents", oButton);
				oModifier.insertAggregation(oMenuItem, "customData", oIdToSave);
				oModifier.insertAggregation(oMenu, "items", oMenuItem, index);
			});

			oMenuButton = oModifier.createControl("sap.m.MenuButton", mPropertyBag.appComponent, oView, oChangeDefinition.content.menuButtonIdSelector);
			oModifier.setProperty(oMenuButton, "text", aMenuButtonName.join("/"));
			oModifier.insertAggregation(oMenuButton, "menu", oMenu, 0);

			oModifier.insertAggregation(oParent, sParentAggregation, oMenuButton, iAggregationIndex);

		};

		/**
		 * Completes the change by adding change handler specific content
		 *
		 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
		 * @param {object} oSpecificChangeInfo Specific info object
		 * @param {object} oSpecificChangeInfo.combineFieldIds Ids of selected buttons
		 *                                                     to be combined
		 * @param {object} mPropertyBag Map of properties
		 * @param {object} mPropertyBag.modifier Modifier for the controls
		 *
		 * @public
		 */
		CombineButtons.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {

			var oModifier = mPropertyBag.modifier,
				oAppComponent = mPropertyBag.appComponent,
				oChangeDefinition = oChange.getDefinition(),
				aCombineButtonIds = oSpecificChangeInfo.combineFieldIds;

			if (aCombineButtonIds && aCombineButtonIds.length >= 2) {
				oChange.addDependentControl(aCombineButtonIds, "combinedButtons", mPropertyBag);
				oChangeDefinition.content.combineButtonSelectors = aCombineButtonIds.map(function(sCombineButtonId) {
					return oModifier.getSelector(sCombineButtonId, oAppComponent);
				});


				// generate ids for Menu and MenuButton
				oChangeDefinition.content.menuButtonIdSelector = oModifier.getSelector(oAppComponent.createId(jQuery.sap.uid()), oAppComponent);
				oChangeDefinition.content.menuIdSelector = oModifier.getSelector(oAppComponent.createId(jQuery.sap.uid()), oAppComponent);

				// generate id for menu button items
				oChangeDefinition.content.buttonsIdForSave = aCombineButtonIds.map(function() {
					return oModifier.getSelector(oAppComponent.createId(jQuery.sap.uid()), oAppComponent);
				});
			} else {
				throw new Error("Combine buttons action cannot be completed: oSpecificChangeInfo.combineFieldIds attribute required");
			}
		};

		return CombineButtons;
	},
	/* bExport= */true);
/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils", "sap/base/util/uid", 'sap/ui/base/ManagedObjectObserver', 'sap/ui/base/ManagedObject'],
	function(FlexUtils, uid, ManagedObjectObserver, ManagedObject) {
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
				oMenu, oMenuButton, aMenuButtonName = [],
				oRevertData = {
					menuButtonId: "",
					parentAggregation: "",
					insertIndex: 0
				};

			aButtons = oChangeDefinition.content.combineButtonSelectors.map(function (oCombineButtonSelector) {
				return oModifier.bySelector(oCombineButtonSelector, oAppComponent);
			});

			sParentAggregation = aButtons[0].sParentAggregationName;
			oRevertData.parentAggregation = sParentAggregation;

			iAggregationIndex = oModifier.findIndexInParentAggregation(oSourceControl);
			oRevertData.insertIndex = iAggregationIndex;

			oMenu = oModifier.createControl("sap.m.Menu", mPropertyBag.appComponent, oView, oChangeDefinition.content.menuIdSelector);

			aButtons.forEach(function (oButton, index) {
				var oIdToSave,
					oMenuItem,
					oBindingInfo = oButton.getBindingInfo("enabled"),
					aCustomData = oButton.getAggregation("customData"),
					oSelector = oChangeDefinition.content.buttonsIdForSave[index],
					sButtonText = oModifier.getProperty(oButton, "text");

				oMenuItem = oModifier.createControl("sap.m.MenuItem", mPropertyBag.appComponent, oView, oSelector);
				oModifier.setProperty(oMenuItem, "text", oButton.mProperties.text);
				oModifier.setProperty(oMenuItem, "icon", oButton.mProperties.icon);
				oModifier.setProperty(oMenuItem, "enabled", oButton.mProperties.enabled);
				oMenuItem.attachPress(function(oEvent) {
					return oButton.firePress(oEvent);
				});

				oButton.getAggregation = function (sAggregationName, oDefaultForCreation) {
					if (sAggregationName === "customData") {
						var oCustomData = ManagedObject.prototype.getAggregation.call(oButton, "customData"),
							oMenuItemCustomData = oMenuItem ? ManagedObject.prototype.getAggregation.call(oMenuItem, "customData") : [];

						// in case oMenuItemCustomData is null return empty object
						oMenuItemCustomData = (oMenuItemCustomData) ? oMenuItemCustomData : [];

						return (oCustomData && oCustomData.length) ? oCustomData : oMenuItemCustomData;
					} else {
						return ManagedObject.prototype.getAggregation.apply(this, arguments);
					}
				};

				// observe the Button enabled property so in case it is changed the new value should be applied to the MenuItem also
				new ManagedObjectObserver(function (oChanges) {
					oModifier.setProperty(oMenuItem, "enabled", oChanges.current);
					if (oBindingInfo) {
						oMenuItem.bindProperty("enabled", oBindingInfo);
					}
				}).observe(oButton, {
					properties: ["enabled"]
				});

				if (oBindingInfo) {
					oMenuItem.bindProperty("enabled", oBindingInfo);
				}

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

				if (aCustomData && aCustomData.length > 0) {
					aCustomData.forEach(function (oCustomData, index) {
						oModifier.insertAggregation(oMenuItem, "customData", oCustomData, index);
					});
				}

				oModifier.removeAggregation(oParent, sParentAggregation, oButton);
				// adding each button control to the menuItem's dependents aggregation
				// this way we can save all relevant information it may have
				oModifier.insertAggregation(oMenuItem, "dependents", oButton);
				oModifier.insertAggregation(oMenuItem, "customData", oIdToSave, 0);
				oModifier.insertAggregation(oMenu, "items", oMenuItem, index);
			});

			oMenuButton = oModifier.createControl("sap.m.MenuButton", mPropertyBag.appComponent, oView, oChangeDefinition.content.menuButtonIdSelector);
			oRevertData.menuButtonId = oModifier.getId(oMenuButton);

			oModifier.setProperty(oMenuButton, "text", aMenuButtonName.join("/"));
			oModifier.insertAggregation(oMenuButton, "menu", oMenu, 0);

			oModifier.insertAggregation(oParent, sParentAggregation, oMenuButton, iAggregationIndex);
			oChange.setRevertData(oRevertData);

			return true;

		};

		/**
		 * Reverts applied change
		 *
		 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
		 * @param {sap.m.IBar} oControl Bar - Bar that matches the change selector for applying the change
		 * @param {object} mPropertyBag - Property bag containing the modifier and the view
		 * @param {object} mPropertyBag.modifier - modifier for the controls
		 * @param {object} mPropertyBag.view - application view
		 * @return {boolean} True if successful
		 * @public
		 */
		CombineButtons.revertChange = function(oChange, oControl, mPropertyBag) {

			var oModifier = mPropertyBag.modifier,
				oRevertData =  oChange.getRevertData(),
				oChangeDefinition = oChange.getDefinition(),
				sParentAggregation = oRevertData.parentAggregation,
				iAggregationIndex = oRevertData.insertIndex,
				oMenuButton =  oModifier.bySelector(oRevertData.menuButtonId, mPropertyBag.appComponent),
				oParent = oModifier.getParent(oMenuButton),
				aButtonsIds = oChangeDefinition.content.combineButtonSelectors;

			for (var i = 0; i < aButtonsIds.length; i++) {
				var oButton = oModifier.bySelector(aButtonsIds[i], mPropertyBag.appComponent);
				oModifier.insertAggregation(oParent, sParentAggregation, oButton, iAggregationIndex + i);
			}

			oModifier.removeAggregation(oParent, sParentAggregation, oMenuButton);
			oMenuButton.destroy();

			oChange.resetRevertData();

			return true;
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
				oChangeDefinition.content.menuButtonIdSelector = oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);
				oChangeDefinition.content.menuIdSelector = oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);

				// generate id for menu button items
				oChangeDefinition.content.buttonsIdForSave = aCombineButtonIds.map(function() {
					return oModifier.getSelector(oAppComponent.createId(uid()), oAppComponent);
				});
			} else {
				throw new Error("Combine buttons action cannot be completed: oSpecificChangeInfo.combineFieldIds attribute required");
			}
		};

		return CombineButtons;
	},
	/* bExport= */true);
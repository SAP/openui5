/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils"], function(FlexUtils) {
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

		/**
		 * Split a MenuButton into separate Buttons
		 *
		 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
		 * @param {sap.m.MenuButton} oControl Menubutton control that matches the change selector for applying the change
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
				oAppComponent = mPropertyBag.appComponent,
				oView = FlexUtils.getViewForControl(oControl),
				oSourceControl = oModifier.bySelector(oChangeDefinition.content.sourceSelector, oAppComponent),
				oMenu = oModifier.getAggregation(oSourceControl, "menu"),
				aMenuItems = oModifier.getAggregation(oMenu, "items"),
				oBarAggregation = oSourceControl.sParentAggregationName,
				oParent = oModifier.getParent(oSourceControl),
				iAggregationIndex = oParent.indexOfAggregation(oBarAggregation, oSourceControl),
				aNewElementIds = oChangeDefinition.content.newElementIds.slice();

			aMenuItems.forEach(function (oMenuItem, index) {
				var sId = aNewElementIds[index],
				    oButton = oModifier.createControl("sap.m.Button", mPropertyBag.appComponent, oView, sId);

				oModifier.setProperty(oButton, "text", oModifier.getProperty(oMenuItem, "text"));
				oModifier.setProperty(oButton, "icon",  oModifier.getProperty(oMenuItem, "icon"));

				oButton.attachPress(function() {
					return oMenuItem.firePress();
				});

				oModifier.insertAggregation(oControl, oBarAggregation, oButton, iAggregationIndex + index);
			});

			oModifier.removeAggregation(oControl, oBarAggregation, oSourceControl);
			oModifier.insertAggregation(oControl, "dependents", oSourceControl);

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
			oChangeDefinition.content.sourceSelector = oModifier.getSelector(oSpecificChangeInfo.sourceControlId, oAppComponent);
		};

		return SplitMenuButton;
	},
	/* bExport= */true);
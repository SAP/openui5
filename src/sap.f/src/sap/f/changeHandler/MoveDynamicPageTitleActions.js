/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Utils"], function(FlexUtils) {
	"use strict";

		/**
		 * Change handler for moving the buttons in aggregation actions of sap.f.DynamicPageTitle
		 *
		 * @alias sap.f.changeHandler.MoveDynamicPageTitleActions
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.52
		 */
		var MoveActions = { };
		var ACTION_AGGREGATION_NAME = "actions";

		/**
		 * Moves the buttons inside actions aggregation of sap.f.DynamicPageTitle
		 *
		 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
		 * @param {sap.f.DynamicPageTitle} oControl Containing the buttons
		 * @param {object} mPropertyBag Map of properties
		 * @param {object} mPropertyBag.modifier Modifier for the controls
		 * @return {boolean} true if change could be applied
		 *
		 * @public
		 */
		MoveActions.applyChange = function(oChange, oControl, mPropertyBag) {
			var oModifier = mPropertyBag.modifier,
				oView = mPropertyBag.view,
				oAppComponent = mPropertyBag.appComponent,
				oMovedElementInfo = oChange.getDefinition().content.movedElements[0];

			var oMovedElement = oModifier.bySelector(oMovedElementInfo.selector, oAppComponent, oView),
				iTargetIndex = oMovedElementInfo.targetIndex;

			oModifier.getAggregation(oControl, ACTION_AGGREGATION_NAME).forEach(function(oButton, iIndex) {
				if (oModifier.getId(oButton) === oModifier.getId(oMovedElement)) {
					oModifier.removeAggregation(oControl, ACTION_AGGREGATION_NAME, oButton);
					oModifier.insertAggregation(oControl, "dependents", oButton, undefined, oView);

					oChange.setRevertData({
						index: iIndex
					});
				}
			});

			oModifier.insertAggregation(oControl, ACTION_AGGREGATION_NAME, oMovedElement, iTargetIndex, oView);

			return true;
		};

		/**
		 * Reverts the change
		 *
		 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control
		 * @param {sap.ui.core.Control} oRelevantContainer Control that matches the change selector for applying the change, which is the source of the move
		 * @param {object} mPropertyBag Map of properties
		 * @return {boolean} true Indicates whether the change can be applied
		 * @public
		 */
		MoveActions.revertChange = function(oChange, oControl, mPropertyBag) {
			var oModifier = mPropertyBag.modifier,
				oView = mPropertyBag.view,
				oAppComponent = mPropertyBag.appComponent,
				oMovedElementInfo = oChange.getDefinition().content.movedElements[0],
				oRevertData = oChange.getRevertData();

			var oMovedElement = oModifier.bySelector(oMovedElementInfo.selector, oAppComponent, oView),
				iTargetIndex = oRevertData ? oRevertData.index : oMovedElementInfo.targetIndex,
				iSourceIndex = oMovedElementInfo.sourceIndex;

			oModifier.removeAggregation(oControl, ACTION_AGGREGATION_NAME, oMovedElement, iTargetIndex, oView);
			oModifier.insertAggregation(oControl, ACTION_AGGREGATION_NAME, oMovedElement, iSourceIndex, oView);

			return true;
		};

		/**
		 * Completes the change by adding change handler specific content
		 *
		 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
		 * @param {object} oSpecificChangeInfo Specific info object
		 * @param {object} mPropertyBag Map of properties
		 * @param {object} mPropertyBag.modifier Modifier for the controls
		 *
		 * @public
		 */
		MoveActions.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
			var oModifier = mPropertyBag.modifier,
				oAppComponent = mPropertyBag.appComponent,
				oChangeData = oChange.getDefinition();

			// We need to add the information about the movedElements together with the source and target index
			oChangeData.content = {movedElements: []};
			oSpecificChangeInfo.movedElements.forEach(function (mElement) {
				var oElement = mElement.element || oModifier.bySelector(mElement.id, oAppComponent);
				oChangeData.content.movedElements.push({
					selector: oModifier.getSelector(oElement, oAppComponent),
					sourceIndex: mElement.sourceIndex,
					targetIndex: mElement.targetIndex
				});
			});
		};

		return MoveActions;
	},
	/* bExport= */true);
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/condenser/Classification"
	], function(
		Condenser
	) {
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
		 * @return {Promise} Promise resolving when change is successfully applied
		 *
		 * @public
		 */
		MoveActions.applyChange = function(oChange, oControl, mPropertyBag) {
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var oAppComponent = mPropertyBag.appComponent;
			var oMovedElementInfo = oChange.getContent().movedElements[0];
			var iTargetIndex = oMovedElementInfo.targetIndex;
			var oMovedElement;
			var iOriginalIndex;

			return Promise.resolve()
				.then(oModifier.bySelector.bind(oModifier, oMovedElementInfo.selector, oAppComponent, oView))
				.then(function(oElement) {
					oMovedElement = oElement;
					return oModifier.getAggregation(oControl, ACTION_AGGREGATION_NAME);
				})
				.then(function(aButtons) {
					var oPromise;
					aButtons.some(function(oButton, iButtonIndex) {
						if (oModifier.getId(oButton) === oModifier.getId(oMovedElement)) {
							iOriginalIndex = iButtonIndex;
							oPromise = Promise.resolve()
								.then(oModifier.removeAggregation.bind(oModifier, oControl, ACTION_AGGREGATION_NAME, oButton))
								.then(oModifier.insertAggregation.bind(oModifier, oControl, "dependents", oButton, undefined, oView));
							return true;
						}
						return false;
					});
					return oPromise
						.then(function() {
							oChange.setRevertData({
								index: iOriginalIndex,
								sourceParent: oModifier.getSelector(oControl, oAppComponent),
								aggregation: ACTION_AGGREGATION_NAME
							});
							return oModifier.insertAggregation(oControl, ACTION_AGGREGATION_NAME, oMovedElement, iTargetIndex, oView);
						});
				});
		};

		/**
		 * Reverts the change
		 *
		 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control
		 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change, which is the source of the move
		 * @param {object} mPropertyBag Map of properties
		 * @return {Promise} Promise resolving when the change is reverted
		 * @public
		 */
		MoveActions.revertChange = function(oChange, oControl, mPropertyBag) {
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var oAppComponent = mPropertyBag.appComponent;
			var oMovedElementInfo = oChange.getContent().movedElements[0];
			var oRevertData = oChange.getRevertData();
			var oMovedElement;
			var iTargetIndex;
			var iSourceIndex;

			oMovedElement = oModifier.bySelector(oMovedElementInfo.selector, oAppComponent, oView);
			iTargetIndex = oRevertData ? oRevertData.index : oMovedElementInfo.targetIndex;
			iSourceIndex = oMovedElementInfo.sourceIndex;
			return Promise.resolve()
				.then(oModifier.removeAggregation.bind(oModifier, oControl, ACTION_AGGREGATION_NAME, oMovedElement, iTargetIndex, oView))
				.then(oModifier.insertAggregation.bind(oModifier, oControl, ACTION_AGGREGATION_NAME, oMovedElement, iSourceIndex, oView));

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
				oAppComponent = mPropertyBag.appComponent;

			// We need to add the information about the movedElements together with the source and target index
			var oContent = {
				movedElements: [],
				targetAggregation: oSpecificChangeInfo.target.aggregation,
				targetContainer: oSpecificChangeInfo.selector
			};

			oSpecificChangeInfo.movedElements.forEach(function (mElement) {
				var oElement = mElement.element || oModifier.bySelector(mElement.id, oAppComponent);
				oContent.movedElements.push({
					selector: oModifier.getSelector(oElement, oAppComponent),
					sourceIndex: mElement.sourceIndex,
					targetIndex: mElement.targetIndex
				});
			});
			oChange.setContent(oContent);
		};

		MoveActions.getCondenserInfo = function(oChange) {
			var oChangeContent = oChange.getContent();
			var oRevertData = oChange.getRevertData();
			return {
				affectedControl: oChangeContent.movedElements[0].selector,
				classification: Condenser.Move,
				sourceContainer: oRevertData.sourceParent,
				targetContainer: oChangeContent.targetContainer,
				sourceIndex: oRevertData.index,
				sourceAggregation: oRevertData.aggregation,
				targetAggregation: oChangeContent.targetAggregation,
				setTargetIndex: function(oChange, iNewTargetIndex) {
					oChange.getContent().movedElements[0].targetIndex = iNewTargetIndex;
				},
				getTargetIndex: function(oChange) {
					return oChange.getContent().movedElements[0].targetIndex;
				}
			};
		};

		return MoveActions;
	},
	/* bExport= */true);
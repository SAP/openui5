/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global"
], function (jQuery) {
	"use strict";

	/**
	 * Change handler for moving table columns.
	 *
	 * @alias sap.m.changeHandler.MoveTableColumns
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.48
	 */
	var MoveTableColumns = {};

	// Defines object which contains constants used in the handler
	var _CONSTANTS = {
		CHANGE_TYPE: "moveTableColumns",
		SOURCE_ALIAS: "source",
		TARGET_ALIAS: "target",
		MOVED_ELEMENTS_ALIAS: "movedElements"
	};

	/**
	 * Moves a column from one index to another.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control
	 * @param {sap.ui.core.Control} oRelevantContainer Control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.view XML node representing a ui5 view
	 * @param {sap.ui.fl.changeHandler.BaseTreeModifier} mPropertyBag.modifier Modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent AppComponent
	 * @return {boolean} true Indicates whether the change can be applied
	 * @public
	 * @function
	 * @name sap.m.changeHandler.MoveTableColumns#applyChange
	 */
	MoveTableColumns.applyChange = function (oChange, oRelevantContainer, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			oView = mPropertyBag.view,
			oAppComponent = mPropertyBag.appComponent,
			sColumnsAggregationName = "columns",
			sCellsAggregationName = "cells",
			sItemsAggregationName = "items",
			oChangeContent = oChange.getContent(),
			oTargetSource = oChange.getDependentControl(_CONSTANTS.SOURCE_ALIAS, mPropertyBag),
			oTable = oChange.getDependentControl(_CONSTANTS.TARGET_ALIAS, mPropertyBag),
			aColumns = oModifier.getAggregation(oTable, sColumnsAggregationName);

		if (oTargetSource !== oTable) {
			jQuery.sap.log.warning("Moving columns between different tables is not yet supported.");
			return false;
		}

		// Fetch the information about the movedElements together with the source and target index.
		oChangeContent.movedElements.forEach(function (mMovedElement) {
			var oMovedElement = oModifier.bySelector(mMovedElement.selector, oAppComponent, oView),
				iSourceIndex, iTargetIndex, iCurrentIndexInAggregation, iStoredSourceIndexInChange, sMovedElementId;

			if (!oMovedElement) {
				sMovedElementId = mMovedElement.selector && mMovedElement.selector.id;
				jQuery.sap.log.warning("The table column with id: '" + sMovedElementId + "' stored in the change is not found and the move operation cannot be applied");
				return;
			}

			iCurrentIndexInAggregation = aColumns.indexOf(oMovedElement);
			iStoredSourceIndexInChange = mMovedElement.sourceIndex;
			iTargetIndex = mMovedElement.targetIndex;

			if (iCurrentIndexInAggregation !== iTargetIndex) {
				// By default we are getting the index from the aggregation, because it is possible that the order is already modified and the column that we want to move is not on the passed source index
				iSourceIndex = iCurrentIndexInAggregation;
			} else {
				// In RTA edit mode, the condition will be false, because the aggregation is modified by the drag and drop action. Therefore, we need to use the passed source index
				iSourceIndex = iStoredSourceIndexInChange;
			}

			oModifier.removeAggregation(oTable, sColumnsAggregationName, oMovedElement);
			oModifier.insertAggregation(oTable, sColumnsAggregationName, oMovedElement, iTargetIndex);

			oModifier.getAggregation(oTable, sItemsAggregationName).forEach(function (oItem) {
				var aCells = oModifier.getAggregation(oItem, sCellsAggregationName),
					oMovedCell;

				// We are skipping the GroupHeaderListItems, because they are valid for the whole row and does not have cells to move.
				if (oModifier.getControlType(oItem) === "sap.m.GroupHeaderListItem") {
					return;
				}

				// ColumnListItem and GroupHeaderListItem are only allowed for the tables items aggregation.
				if (!aCells) {
					jQuery.sap.log.warning("Aggregation cells to move not found");
					return;
				}

				if (iSourceIndex < 0 || iSourceIndex >= aCells.length) {
					jQuery.sap.log.warning("Move cells in table item called with invalid index: " + iSourceIndex);
					return;
				}

				oMovedCell = aCells[iSourceIndex];
				oModifier.removeAggregation(oItem, sCellsAggregationName, oMovedCell);
				oModifier.insertAggregation(oItem, sCellsAggregationName, oMovedCell, iTargetIndex);
			});
		}, this);

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object to be completed
	 * @param {object} mSpecificChangeInfo Determines the attributes <code>source</code>, <code>target</code> and <code>movedElements</code> which are included in the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent Component in which the change should be applied
	 * @public
	 * @function
	 * @name sap.m.changeHandler.MoveTableColumns#completeChangeContent
	 */
	MoveTableColumns.completeChangeContent = function (oChange, mSpecificChangeInfo, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			oAppComponent = mPropertyBag.appComponent,
			mChangeData = oChange.getDefinition(),
			oSourceControl = oModifier.bySelector(mSpecificChangeInfo.source.id, oAppComponent),
			oTargetControl = oModifier.bySelector(mSpecificChangeInfo.target.id, oAppComponent),
			mAdditionalSourceInfo = {
				aggregation: mSpecificChangeInfo.source.aggregation,
				type: oModifier.getControlType(oSourceControl)
			},
			mAdditionalTargetInfo = {
				aggregation: mSpecificChangeInfo.target.aggregation,
				type: oModifier.getControlType(oTargetControl)
			};

		// We need to add the information about the movedElements together with the source and target index
		mChangeData.content = {movedElements: []};
		mSpecificChangeInfo.movedElements.forEach(function (mElement) {
			var oElement = mElement.element || oModifier.bySelector(mElement.id, oAppComponent);

			mChangeData.content.movedElements.push({
				selector: oModifier.getSelector(oElement, oAppComponent),
				sourceIndex: mElement.sourceIndex,
				targetIndex: mElement.targetIndex
			});
		});

		mChangeData.changeType = _CONSTANTS.CHANGE_TYPE;
		oChange.addDependentControl(mSpecificChangeInfo.source.id, _CONSTANTS.SOURCE_ALIAS, mPropertyBag, mAdditionalSourceInfo);
		oChange.addDependentControl(mSpecificChangeInfo.target.id, _CONSTANTS.TARGET_ALIAS, mPropertyBag, mAdditionalTargetInfo);
		oChange.addDependentControl(mSpecificChangeInfo.movedElements.map(function (element) {
			return element.id;
		}), _CONSTANTS.MOVED_ELEMENTS_ALIAS, mPropertyBag);
	};

	return MoveTableColumns;
}, /* bExport= */ true);

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

	var CHANGE_TYPE = "moveTableColumns";
	var SOURCE_ALIAS = "source";
	var TARGET_ALIAS = "target";
	var MOVED_ELEMENTS_ALIAS = "movedElements";
	var COLUMNS_AGGREGATION_NAME = "columns";
	var CELLS_AGGREGATION_NAME = "cells";
	var ITEMS_AGGREGATION_NAME = "items";

	/**
	 * Moves a column from one index to another.
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control
	 * @param {sap.ui.core.Control} oRelevantContainer Control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.view XML node representing a ui5 view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier Modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent AppComponent
	 * @param {function} fnIterator - Iterator function which is called on each movedElement, as an argument it gets CurrentIndex
	 *  of the element and may return TargetIndex as a result.
	 * @return {boolean} true Indicates whether the change can be applied
	 */
	function _applyChange(oChange, oRelevantContainer, mPropertyBag, fnIterator) {
		var oModifier = mPropertyBag.modifier,
			oView = mPropertyBag.view,
			oAppComponent = mPropertyBag.appComponent,
			oChangeContent = oChange.getContent(),
			oTargetSource = oChange.getDependentControl(SOURCE_ALIAS, mPropertyBag),
			oTable = oChange.getDependentControl(TARGET_ALIAS, mPropertyBag),
			aColumns = oModifier.getAggregation(oTable, COLUMNS_AGGREGATION_NAME),
			switchCells = function (oRow, iSourceIndex, iTargetIndex) {
				var aCells = oModifier.getAggregation(oRow, CELLS_AGGREGATION_NAME);

				// ColumnListItem and GroupHeaderListItem are only allowed for the tables items aggregation.
				if (!aCells) {
					jQuery.sap.log.warning("Aggregation cells to move not found");
					return;
				}

				if (iSourceIndex < 0 || iSourceIndex >= aCells.length) {
					jQuery.sap.log.warning("Move cells in table item called with invalid index: " + iSourceIndex);
					return;
				}

				var oMovedCell = aCells[iSourceIndex];
				oModifier.removeAggregation(oRow, CELLS_AGGREGATION_NAME, oMovedCell);
				oModifier.insertAggregation(oRow, CELLS_AGGREGATION_NAME, oMovedCell, iTargetIndex, oView);
			},
			moveColumns = function (iSourceIndex, iTargetIndex) {
				oModifier.getAggregation(oTable, ITEMS_AGGREGATION_NAME).forEach(function (oItem) {
					// We are skipping the GroupHeaderListItems, because they are valid for the whole row and does not have cells to move.
					if (oModifier.getControlType(oItem) === "sap.m.GroupHeaderListItem") {
						return;
					}

					switchCells(oItem, iSourceIndex, iTargetIndex);
				});
			};

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
			iTargetIndex = jQuery.isFunction(fnIterator) && fnIterator(iCurrentIndexInAggregation);
			iTargetIndex = jQuery.isNumeric(iTargetIndex) ? iTargetIndex : mMovedElement.targetIndex;

			if (iCurrentIndexInAggregation !== iTargetIndex) {
				// By default we are getting the index from the aggregation, because it is possible that the order is
				// already modified and the column that we want to move is not on the passed source index
				iSourceIndex = iCurrentIndexInAggregation;
			} else {
				// In RTA edit mode, the condition will be false, because the aggregation is modified by the drag and drop action.
				// Therefore, we need to use the passed source index
				iSourceIndex = iStoredSourceIndexInChange;
			}

			// move children in `columns` aggregation
			oModifier.removeAggregation(oTable, COLUMNS_AGGREGATION_NAME, oMovedElement);
			oModifier.insertAggregation(oTable, COLUMNS_AGGREGATION_NAME, oMovedElement, iTargetIndex, oView);

			// move children in `items` aggregation (actual content)
			var oTemplate = oModifier.getBindingTemplate(oTable, ITEMS_AGGREGATION_NAME);

			if (oTemplate) {
				switchCells(oTemplate, iSourceIndex, iTargetIndex);
				oModifier.updateAggregation(oTable, ITEMS_AGGREGATION_NAME);
			} else {
				moveColumns(iSourceIndex, iTargetIndex);
			}
		}, this);

		return true;
	}

	/**
	 * Moves a column from one index to another.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control
	 * @param {sap.ui.core.Control} oRelevantContainer Control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.view XML node representing a ui5 view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier Modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent AppComponent
	 * @return {boolean} true Indicates whether the change can be applied
	 * @public
	 */
	MoveTableColumns.applyChange = function (oChange, oRelevantContainer, mPropertyBag) {
		var aRevertData = [];

		_applyChange(oChange, oRelevantContainer, mPropertyBag, function (iCurrentIndexInAggregation) {
			aRevertData.unshift({
				index: iCurrentIndexInAggregation
			});
		});

		oChange.setRevertData(aRevertData);
	};

	/**
	 * Reverts the change
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control
	 * @param {sap.ui.core.Control} oRelevantContainer Control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.view XML node representing a ui5 view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier Modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent AppComponent
	 * @return {boolean} true Indicates whether the change can be applied
	 * @public
	 */
	MoveTableColumns.revertChange = function (oChange, oRelevantContainer, mPropertyBag) {
		var aRevertData = oChange.getRevertData();

		_applyChange(oChange, oRelevantContainer, mPropertyBag, function () {
			var mItem = aRevertData.shift();
			return mItem && mItem.index;
		});

		oChange.resetRevertData();
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object to be completed
	 * @param {object} mSpecificChangeInfo Determines the attributes <code>source</code>, <code>target</code> and <code>movedElements</code> which are included in the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent Component in which the change should be applied
	 * @public
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

		mChangeData.changeType = CHANGE_TYPE;
		oChange.addDependentControl(mSpecificChangeInfo.source.id, SOURCE_ALIAS, mPropertyBag, mAdditionalSourceInfo);
		oChange.addDependentControl(mSpecificChangeInfo.target.id, TARGET_ALIAS, mPropertyBag, mAdditionalTargetInfo);
		oChange.addDependentControl(mSpecificChangeInfo.movedElements.map(function (element) {
			return element.id;
		}), MOVED_ELEMENTS_ALIAS, mPropertyBag);
	};

	return MoveTableColumns;
}, /* bExport= */ true);

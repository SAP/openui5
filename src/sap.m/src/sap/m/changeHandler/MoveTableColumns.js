/* eslint-disable max-nested-callbacks */
/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/Log"], function(Log) {
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

	var SOURCE_ALIAS = "source";
	var TARGET_ALIAS = "target";
	var MOVED_ELEMENTS_ALIAS = "movedElements";
	var COLUMNS_AGGREGATION_NAME = "columns";
	var CELLS_AGGREGATION_NAME = "cells";
	var ITEMS_AGGREGATION_NAME = "items";

	function fnSwitchCells(oModifier, oView, oRow, iSourceIndex, iTargetIndex) {
		return Promise.resolve()
			.then(oModifier.getAggregation.bind(oModifier, oRow, CELLS_AGGREGATION_NAME))
			.then(function(aCells) {
				// ColumnListItem and GroupHeaderListItem are only allowed for the tables items aggregation.
				if (!aCells) {
					Log.warning("Aggregation cells to move not found");
					return Promise.reject();
				}

				if (iSourceIndex < 0 || iSourceIndex >= aCells.length) {
					Log.warning("Move cells in table item called with invalid index: " + iSourceIndex);
					return Promise.reject();
				}

				var oMovedCell = aCells[iSourceIndex];
				return Promise.resolve()
					.then(oModifier.removeAggregation.bind(oModifier,oRow, CELLS_AGGREGATION_NAME, oMovedCell))
					.then(oModifier.insertAggregation.bind(oModifier, oRow, CELLS_AGGREGATION_NAME, oMovedCell, iTargetIndex, oView));
			});
	}

	function fnMoveColumns(oModifier, oView, oTable, iSourceIndex, iTargetIndex) {
		return Promise.resolve()
			.then(oModifier.getAggregation.bind(oModifier, oTable, ITEMS_AGGREGATION_NAME))
			.then(function(aItems) {
				return aItems.reduce(function(oPreviousPromise, oItem) {
					return oPreviousPromise
						.then(function() {
							if (oModifier.getControlType(oItem) !== "sap.m.GroupHeaderListItem") {
								return fnSwitchCells(oModifier, oView, oItem, iSourceIndex, iTargetIndex);
							}
							return undefined;
						});
				}, Promise.resolve());
			});
	}

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
	 * @return {Promise} Promise resolving when change was applied
	 */
	function _applyChange(oChange, oRelevantContainer, mPropertyBag, fnIterator) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeContent = oChange.getContent();
		var oTargetSource = oChange.getDependentControl(SOURCE_ALIAS, mPropertyBag);
		var oTable = oChange.getDependentControl(TARGET_ALIAS, mPropertyBag);
		var aColumns;
		var oMovedElement;

		return Promise.resolve()
			.then(function() {
				return oModifier.getAggregation(oTable, COLUMNS_AGGREGATION_NAME);
			})
			.then(function(aRetrievedColumns){
				aColumns = aRetrievedColumns;
				if (oTargetSource !== oTable) {
					Log.warning("Moving columns between different tables is not yet supported.");
					return Promise.reject(false);
				}
				// Fetch the information about the movedElements together with the source and target index.
				return oChangeContent.movedElements.reduce(function (oPreviousPromise, mMovedElement) {
					var iSourceIndex;
					var iTargetIndex;
					var iCurrentIndexInAggregation;
					var iStoredSourceIndexInChange;
					var sMovedElementId;

					return oPreviousPromise.then(function() {
							oMovedElement = oModifier.bySelector(mMovedElement.selector, oAppComponent, oView);
							if (!oMovedElement) {
								sMovedElementId = mMovedElement.selector && mMovedElement.selector.id;
								Log.warning("The table column with id: '" + sMovedElementId + "' stored in the change is not found and the move operation cannot be applied");
								return Promise.reject();
							}
							iCurrentIndexInAggregation = aColumns.indexOf(oMovedElement);
							iStoredSourceIndexInChange = mMovedElement.sourceIndex;
							iTargetIndex = typeof fnIterator === "function" && fnIterator(iStoredSourceIndexInChange);
							iTargetIndex = typeof iTargetIndex === "number" ? iTargetIndex : mMovedElement.targetIndex;

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
							return oModifier.removeAggregation(oTable, COLUMNS_AGGREGATION_NAME, oMovedElement);
						})
						.then(function(){
							return oModifier.insertAggregation(oTable, COLUMNS_AGGREGATION_NAME, oMovedElement, iTargetIndex, oView);
						})
						// move children in `items` aggregation (actual content)
						.then(function() {
							return oModifier.getBindingTemplate(oTable, ITEMS_AGGREGATION_NAME);
						})
						.then(function(oTemplate) {
							if (oTemplate) {
								return fnSwitchCells(oModifier, oView, oTemplate, iSourceIndex, iTargetIndex)
									.then(oModifier.updateAggregation.bind(oModifier, oTable, ITEMS_AGGREGATION_NAME));
							} else {
								return fnMoveColumns(oModifier, oView, oTable, iSourceIndex, iTargetIndex);
							}
						});
				}, Promise.resolve());
			});
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
	 * @return {Promise} Promise resolving when change was applied
	 * @public
	 */
	MoveTableColumns.applyChange = function (oChange, oRelevantContainer, mPropertyBag) {
		var aRevertData = [];

		return Promise.resolve()
			.then(function(){
				return _applyChange(oChange, oRelevantContainer, mPropertyBag, function (iStoredSourceIndexInChange) {
					aRevertData.unshift({
						index: iStoredSourceIndexInChange
					});
				});
			})
			.then(function() {
				oChange.setRevertData(aRevertData);
			});
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
	 * @return {Promise} Promise resolving when change was reverted
	 * @public
	 */
	MoveTableColumns.revertChange = function (oChange, oRelevantContainer, mPropertyBag) {
		var aRevertData = oChange.getRevertData();

		return Promise.resolve()
			.then(function(){
				return _applyChange(oChange, oRelevantContainer, mPropertyBag, function () {
					var mItem = aRevertData.shift();
					return mItem && mItem.index;
				});
			})
			.then(function() {
				oChange.resetRevertData();
			});
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
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var mChangeData = oChange.getDefinition();
		var oSourceControl = oModifier.bySelector(mSpecificChangeInfo.source.id, oAppComponent);
		var oTargetControl = oModifier.bySelector(mSpecificChangeInfo.target.id, oAppComponent);
		var mAdditionalSourceInfo = {
			aggregation: mSpecificChangeInfo.source.aggregation,
			type: oModifier.getControlType(oSourceControl)
		};
		var	mAdditionalTargetInfo = {
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

		oChange.addDependentControl(mSpecificChangeInfo.source.id, SOURCE_ALIAS, mPropertyBag, mAdditionalSourceInfo);
		oChange.addDependentControl(mSpecificChangeInfo.target.id, TARGET_ALIAS, mPropertyBag, mAdditionalTargetInfo);
		oChange.addDependentControl(mSpecificChangeInfo.movedElements.map(function (element) {
			return element.id;
		}), MOVED_ELEMENTS_ALIAS, mPropertyBag);
	};

	return MoveTableColumns;
}, /* bExport= */ true);
/*
 * ! ${copyright}
 */

sap.ui.define([
	'./SortFlex', './ColumnFlex', './ConditionFlex'
], function(SortFlex, ColumnFlex, ConditionFlex) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		addColumn: ColumnFlex.createAddChangeHandler(),
		removeColumn: ColumnFlex.createRemoveChangeHandler(),
		moveColumn: ColumnFlex.createMoveChangeHandler(),
		removeSort: SortFlex.removeSort,
		addSort: SortFlex.addSort,
		moveSort: SortFlex.moveSort,
		addCondition: ConditionFlex.addCondition,
		removeCondition: ConditionFlex.removeCondition
	};

});

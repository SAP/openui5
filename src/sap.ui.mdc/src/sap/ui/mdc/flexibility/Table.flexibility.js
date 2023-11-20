/*!
 * ${copyright}
 */

sap.ui.define([
	'./SortFlex', './ColumnFlex', './ConditionFlex', './GroupFlex', './AggregateFlex', './xConfigFlex'
], function(SortFlex, ColumnFlex, ConditionFlex, GroupFlex, AggregateFlex, xConfigFlex) {
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
		removeCondition: ConditionFlex.removeCondition,
		removeGroup: GroupFlex.removeGroup,
		addGroup: GroupFlex.addGroup,
		moveGroup: GroupFlex.moveGroup,
		removeAggregate: AggregateFlex.removeAggregate,
		addAggregate: AggregateFlex.addAggregate,
		setColumnWidth: xConfigFlex.createSetChangeHandler({
			aggregation: "columns",
			property: "width"
		})
	};

});
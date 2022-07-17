/*!
 * ${copyright}
 */
sap.ui.define([
	'./SortFlex', './ChartItemFlex', './ConditionFlex', './ChartTypeFlex'
], function(SortFlex, ChartItemFlex, ConditionFlex, ChartTypeFlex) {
	"use strict";
	/**
	 * Chart-control-specific change handler that enables the storing of changes in the layered repository of the flexibility services.
	 *
	 * @alias sap.ui.mdc.flexibility.Chart
	 * @author SAP SE
	 * @version ${version}
	 */
	return {
		addItem: ChartItemFlex.addItem,
		removeItem: ChartItemFlex.removeItem,
		moveItem: ChartItemFlex.moveItem,
		setChartType: ChartTypeFlex.setChartType,
		removeSort: SortFlex.removeSort,
		addSort: SortFlex.addSort,
		moveSort: SortFlex.moveSort,
		addCondition: ConditionFlex.addCondition,
		removeCondition: ConditionFlex.removeCondition
	};
}, /* bExport= */true);

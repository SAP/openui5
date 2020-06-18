/*
 * ! ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex'
], function(ItemBaseFlex) {
	"use strict";

	var oChartItemFlex = Object.assign({}, ItemBaseFlex);

	oChartItemFlex.beforeAddItem = function(Delegate, sDataPropertyName, oControl, mPropertyBag, oChangeContent) {
		return Delegate.beforeAddItem(sDataPropertyName, oControl, mPropertyBag, oChangeContent.role);
	};

	oChartItemFlex.afterRemoveItem = function(Delegate, oItem, oControl, mPropertyBag) {
		return Delegate.afterRemoveItem(oItem, oControl, mPropertyBag);
	};

	oChartItemFlex.findItem = function(oModifier, aItems, sName) {
		return aItems.find(function(oItem) {
			var sKey = oModifier.getProperty(oItem, "key");
			return sKey === sName;
		});
	};

	oChartItemFlex.addItem = oChartItemFlex.createAddChangeHandler();
	oChartItemFlex.removeItem = oChartItemFlex.createRemoveChangeHandler();
	oChartItemFlex.moveItem = oChartItemFlex.createMoveChangeHandler();

	return oChartItemFlex;

});
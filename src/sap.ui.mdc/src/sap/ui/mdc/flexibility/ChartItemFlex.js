/*
 * ! ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex'
], function(ItemBaseFlex) {
	"use strict";

	var oChartItemFlex = Object.assign({}, ItemBaseFlex);

	oChartItemFlex.beforeAddItem = function(Delegate, sDataPropertyName, oControl, mPropertyBag, oChangeContent) {
		return Delegate.addItem.call(Delegate, sDataPropertyName, oControl, mPropertyBag, oChangeContent.role);
	};

	oChartItemFlex.findItem = function(oModifier, aItems, sName) {
		return aItems.find(function(oItem) {
			var sKey = oModifier.getProperty(oItem, "key");
			var sKeyNew = oModifier.getProperty(oItem, "name"); // for chart remake
			return (sKey === sName || sKeyNew === sName);
		});
	};

	oChartItemFlex.addItem = oChartItemFlex.createAddChangeHandler();
	oChartItemFlex.removeItem = oChartItemFlex.createRemoveChangeHandler();
	oChartItemFlex.moveItem = oChartItemFlex.createMoveChangeHandler();

	return oChartItemFlex;

});

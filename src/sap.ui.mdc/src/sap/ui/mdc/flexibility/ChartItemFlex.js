/*!
 * ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex'
], function(ItemBaseFlex) {
	"use strict";

	const oChartItemFlex = Object.assign({}, ItemBaseFlex);

	oChartItemFlex.beforeAddItem = function(Delegate, sPropertyKey, oControl, mPropertyBag, oChangeContent) {
		return Delegate.addItem.call(Delegate, oControl, sPropertyKey, mPropertyBag, oChangeContent.role);
	};

	oChartItemFlex.findItem = function(oModifier, aItems, sName) {
		return aItems.reduce(function(oPreviousPromise, oItem) {
			return oPreviousPromise
				.then(function(oFoundItem) {
					if (!oFoundItem) {
						return Promise.all([
							oModifier.getProperty(oItem, "propertyKey"),
							oModifier.getProperty(oItem, "key")
						])
						.then(function(aProperties) {
							if (aProperties[0] === sName || aProperties[1] === sName) {
								return oItem;
							}
						});
					}
					return oFoundItem;
				});
		}, Promise.resolve());
	};

	oChartItemFlex.addItem = oChartItemFlex.createAddChangeHandler();
	oChartItemFlex.removeItem = oChartItemFlex.createRemoveChangeHandler();
	oChartItemFlex.moveItem = oChartItemFlex.createMoveChangeHandler();

	return oChartItemFlex;

});
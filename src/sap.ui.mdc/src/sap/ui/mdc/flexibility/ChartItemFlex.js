/*!
 * ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex'
], function(ItemBaseFlex) {
	"use strict";

	var oChartItemFlex = Object.assign({}, ItemBaseFlex);

	/* Disabled until clarified with flex
	var fnQueueChange = function(oControl, fTask) {
		var fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pQueue === pOriginalPromise){
				delete oControl._pQueue;
			}
		};

		oControl._pQueue = oControl._pQueue instanceof Promise ? oControl._pQueue.then(fTask) : fTask();
		oControl._pQueue.then(fCleanupPromiseQueue.bind(null, oControl._pQueue));

		return oControl._pQueue;
	};*/

	oChartItemFlex.beforeAddItem = function(Delegate, sDataPropertyName, oControl, mPropertyBag, oChangeContent) {

		return Delegate.addItem.call(Delegate, sDataPropertyName, oControl, mPropertyBag, oChangeContent.role);

	};

	oChartItemFlex.findItem = function(oModifier, aItems, sName) {
		return aItems.reduce(function(oPreviousPromise, oItem) {
			return oPreviousPromise
				.then(function(oFoundItem) {
					if (!oFoundItem) {
						return Promise.all([
							oModifier.getProperty(oItem, "key"),
							oModifier.getProperty(oItem, "name") // for chart remake
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

	/* Disabled until clarified with flex
	oChartItemFlex.createChangeHandler = function(fApply, fComplete, fRevert) {
		return {
			"changeHandler": {
				applyChange: function(oChange, oControl, mPropertyBag) {
					return fnQueueChange(oControl, function(){return fApply(oChange, oControl, mPropertyBag);});
				},
				completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
					fComplete(oChange, mChangeSpecificInfo, mPropertyBag);
				},
				revertChange: function(oChange, oControl, mPropertyBag) {
					return fnQueueChange(fRevert(oChange, oControl, mPropertyBag, true));
				}
			},
			"layers": {
				"USER": true
			}
		};
	};*/

	oChartItemFlex.addItem = oChartItemFlex.createAddChangeHandler();
	oChartItemFlex.removeItem = oChartItemFlex.createRemoveChangeHandler();
	oChartItemFlex.moveItem = oChartItemFlex.createMoveChangeHandler();

	return oChartItemFlex;

});
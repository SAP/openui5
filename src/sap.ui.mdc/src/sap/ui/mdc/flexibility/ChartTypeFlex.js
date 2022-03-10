/*
 * ! ${copyright}
 */
sap.ui.define([
], function() {
	"use strict";



	var oChartTypeFlex = {};

	oChartTypeFlex.setChartType = {
		layers: {
			USER: true
		},
		changeHandler: {
			createChange: function(mPropertyBag) {
				if (!mPropertyBag.control) {
					throw new Error("Invalid control. The existing control object is mandatory");
				}
				return {
					selectorElement: mPropertyBag.control,
					changeSpecificData: {
						changeType: "setChartType",
						content: {
							chartType: mPropertyBag.chartType
						}
					}
				};
			},
			completeChangeContent: function(oChange, mSpecificChangeInfo) {
			},
			applyChange: function(oChange, oChart, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				return Promise.resolve()
					.then(oModifier.getProperty.bind(oModifier, oChart, "chartType"))
					.then(function(vOldValue) {
						// First store the old value for revert
						oChange.setRevertData(vOldValue);
						// Then set the new value
						oModifier.setProperty(oChart, "chartType", oChange.getContent().chartType);
					});
			},
			revertChange: function(oChange, oChart, mPropertyBag) {
				mPropertyBag.modifier.setProperty(oChart, "chartType", oChange.getRevertData());
				oChange.resetRevertData();
			}
		}
	};

	return oChartTypeFlex;
});
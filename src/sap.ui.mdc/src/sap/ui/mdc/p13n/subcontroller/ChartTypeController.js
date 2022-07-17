/*!
 * ${copyright}
 */

sap.ui.define([
	'./BaseController'
], function (BaseController) {
	"use strict";

    var ChartTypeController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ChartTypeController", {
        constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
    });

    ChartTypeController.prototype.getCurrentState = function() {
		return {properties: {chartType: this.getAdaptationControl().getChartType()}};
	};

    ChartTypeController.prototype.getStateKey = function() {
		return "supplementaryConfig";
	};

    ChartTypeController.prototype.getDelta = function(mPropertyBag) {

        var sType = mPropertyBag.changedState.type ? mPropertyBag.changedState.type : mPropertyBag.changedState.properties.chartType;

        var oConditionChange = {
            selectorElement: mPropertyBag.control,
            changeSpecificData: {
                changeType: "setChartType",
                content: {
                    chartType: sType
                }
            }
        };

        return [oConditionChange];
	};

	return ChartTypeController;

});

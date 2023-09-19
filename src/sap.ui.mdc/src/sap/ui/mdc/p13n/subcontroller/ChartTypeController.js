/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController"
], function (BaseController) {
	"use strict";

    const ChartTypeController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ChartTypeController", {
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

        let sNewType;
        if (mPropertyBag.changedState && mPropertyBag.changedState.properties) {
            sNewType = mPropertyBag.changedState.properties.chartType;
        }

        const sOldType = this.getAdaptationControl().getChartType();

        let aChartTypeChanges = [];

        if (sNewType && sNewType !== sOldType) {
            aChartTypeChanges = [{
                selectorElement: mPropertyBag.control,
                changeSpecificData: {
                    changeType: "setChartType",
                    content: {
                        chartType: sNewType
                    }
                }
            }];
        }

        return aChartTypeChanges;
	};

	return ChartTypeController;

});

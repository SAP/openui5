sap.ui.define([
    "./ActionsBase",
    "sap/ui/thirdparty/jquery"
], function (ActionsBase, jQuery) {
	"use strict";

    var oActions = {
        /**
         * Selects given datapoints on given chart.
         * <b>Note:</b> The API used on the inner chart for this seems unstable. Ensure the chart is 100% correctly set up, otherwise the call won't work and no error will be thrown
         * @param {array} aDataPoints Datapoint objects to select (see sap.chart.Chart#setSelectedDataPoints)
         * @param {string} sId Id of the mdc chart
         */
        iSelectTheDatapointOnTheChart: function (aDataPoints, sId){
            return this.waitFor({
                id: sId,
                success: function(oMDCChart){
                    oMDCChart._getInnerChart().setSelectedDataPoints(aDataPoints);
                }
            });
        }
    };

	return jQuery.extend(ActionsBase, oActions);
});

/*
 * ! ${copyright}
 */
sap.ui.define([
    './BaseController', 'sap/ui/mdc/p13n/P13nBuilder', 'sap/base/util/merge'
], function (BaseController, P13nBuilder, merge) {
    "use strict";

    var AggregateController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.AggregateController");

    AggregateController.prototype.getCurrentState = function () {
        return this.getAdaptationControl().getCurrentState().aggregations;
    };

    AggregateController.prototype.validateState = function(change) {
        var aAggregations = [];
        Object.keys(change).forEach(function(item) {
            var oAggregate = {
                name: item
            };
            if (change[item].hasOwnProperty("aggregated")) {
                oAggregate["aggregated"] = change[item].aggregated;
            }
            aAggregations.push(oAggregate);
        });
        return aAggregations;
    };

    AggregateController.prototype.getDelta = function (mPropertyBag) {
        mPropertyBag.existingState = this.validateState(mPropertyBag.existingState);
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    AggregateController.prototype.getChangeOperations = function () {
        return {
            add: "addAggregate",
            remove: "removeAggregate"
        };
    };

    AggregateController.prototype._getPresenceAttribute = function () {
        return "aggregated";
    };

    AggregateController.prototype.setP13nData = function(oPropertyHelper) {

        var mExistingAggregations = this.getCurrentState();

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mExistingAggregations[oProperty.name];
            mItem.aggregated = !!oExisting;
            return oProperty.isAggregatable();
        });

        this.oP13nData = oP13nData;
    };

    AggregateController.prototype.getP13nData = function () {
        return this.oP13nData;
    };

    return AggregateController;

});
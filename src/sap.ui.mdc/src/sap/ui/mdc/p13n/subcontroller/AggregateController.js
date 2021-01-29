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

    AggregateController.prototype.mapState = function(change) {
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
        mPropertyBag.existingState = this.mapState(mPropertyBag.existingState);
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    AggregateController.prototype.getChangeOperations = function () {
        return {
            add: "addAggregate",
            remove: "removeAggregate"
        };
    };

    AggregateController.prototype._getPresenceAttribute = function (bExternalStateAppliance) {
        return "aggregated";
    };

    AggregateController.prototype.setP13nData = function (oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mExistingAggregations = aItemState;

        var fnEnhancer = function(oItem, oProperty){

            var sName = oProperty.name;
            if (oProperty.isAggregatable() === false) {
                return false;
            }

            oItem.aggregated = mExistingAggregations[sName] ? true : false;
            oItem.aggregatePosition = mExistingAggregations[sName] ? mExistingAggregations[sName].position : -1;

            return true;
        };

        var oP13nData = P13nBuilder.prepareP13nData({}, oPropertyHelper, fnEnhancer);

        this.oP13nData = oP13nData;
    };

    AggregateController.prototype.getP13nData = function () {
        return this.oP13nData;
    };

    return AggregateController;

});
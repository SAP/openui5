/*
 * ! ${copyright}
 */

sap.ui.define([
	'./BaseController', 'sap/ui/mdc/p13n/P13nBuilder'
], function (BaseController, P13nBuilder) {
	"use strict";

    var SortController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.SortController");

    SortController.prototype.getCurrentState = function() {
        return this.getAdaptationControl().getCurrentState().sorters;
    };

    SortController.prototype.getContainerSettings = function() {
        return {
            title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("sort.PERSONALIZATION_DIALOG_TITLE")
        };
    };

    SortController.prototype.getDelta = function(mPropertyBag) {
        mPropertyBag.deltaAttributes.push("descending");
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    SortController.prototype.getAdaptationUI = function() {
        return "sap/ui/mdc/p13n/panels/SortPanel";
    };

    SortController.prototype.getChangeOperations = function() {
        return {
            add: "addSort",
            remove: "removeSort",
            move: "moveSort"
        };
    };

    SortController.prototype._getPresenceAttribute = function(bexternalAppliance){
        return bexternalAppliance ? "sorted" : "isSorted";
    };

    SortController.prototype.setP13nData = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mExistingSorters = P13nBuilder.arrayToMap(aItemState);

        var fnEnhancer = function(oItem, oProperty){

            var sName = oProperty.name;

            if (oProperty.sortable === false) {
                return false;
            }

            oItem.isSorted = mExistingSorters[sName] ? true : false;
            oItem.sortPosition = mExistingSorters[sName] ? mExistingSorters[sName].position : -1;
            oItem.descending = mExistingSorters[sName] ? !!mExistingSorters[sName].descending : false;

            return true;
        };

        var oP13nData = P13nBuilder.prepareP13nData({}, oPropertyHelper, fnEnhancer);

        P13nBuilder.sortP13nData({
            visible: "isSorted",
            position: "sortPosition"
        }, oP13nData.items);

        this.oP13nData = oP13nData;
    };


	return SortController;

});

/*
 * ! ${copyright}
 */

sap.ui.define([
    "./BaseController",
    "sap/ui/mdc/p13n/P13nBuilder"
], function (BaseController, P13nBuilder) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

    var ChartItemController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ChartItemController");

    ChartItemController.prototype.getAdaptationUI = function() {
        return "sap/ui/mdc/p13n/panels/ChartItemPanel";
    };

    ChartItemController.prototype.getDelta = function(mPropertyBag) {
        mPropertyBag.deltaAttributes.push("role");
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    ChartItemController.prototype.getContainerSettings = function() {
        return {
            title: oResourceBundle.getText("chart.PERSONALIZATION_DIALOG_TITLE")
        };
    };

    ChartItemController.prototype.setP13nData = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mItemState = P13nBuilder.arrayToMap(aItemState);

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mItemState[oProperty.name];
            mItem.visible = !!oExisting;
            mItem.position =  oExisting ? oExisting.position : -1;
            mItem.role =  oExisting ? oExisting.role : oProperty.role;
            mItem.kind = oProperty.kind;

            if (oProperty.availableRoles) {
                mItem.availableRoles = oProperty.availableRoles;
            }

            return oProperty.visible;
        });


        P13nBuilder.sortP13nData({
            visible: "visible",
            position: "position"
        }, oP13nData.items);

        oP13nData.items.forEach(function(oItem){delete oItem.position;});

        this.oP13nData = oP13nData;
    };

    ChartItemController.prototype.getChangeOperations = function() {
        return {
            add: "addItem",
            remove: "removeItem",
            move: "moveItem"
        };
    };

	return ChartItemController;

});
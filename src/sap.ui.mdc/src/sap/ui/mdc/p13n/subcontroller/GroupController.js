/*
 * ! ${copyright}
 */
sap.ui.define([
    './BaseController', 'sap/ui/mdc/p13n/P13nBuilder', 'sap/base/util/merge'
], function (BaseController, P13nBuilder, merge) {
    "use strict";

    var GroupController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.GroupController");

    GroupController.prototype.getCurrentState = function () {
        return this.getAdaptationControl().getCurrentState().groupLevels;
    };

    GroupController.prototype.getContainerSettings = function () {
        return {
            title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("group.PERSONALIZATION_DIALOG_TITLE")
        };
    };

    GroupController.prototype.getDelta = function (mPropertyBag) {
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    GroupController.prototype.getChangeOperations = function () {
        return {
            add: "addGroup",
            remove: "removeGroup",
            move: "moveGroup"
        };
    };

    GroupController.prototype._getPresenceAttribute = function () {
        return "grouped";
    };

    GroupController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mItemState = P13nBuilder.arrayToMap(aItemState);

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mItemState[oProperty.name];
            mItem.grouped = !!oExisting;
            mItem.groupPosition =  oExisting ? oExisting.position : -1;

            return !(oProperty.groupable === false);
        });

        P13nBuilder.sortP13nData({
            visible: "grouped",
            position: "groupPosition"
        }, oP13nData.items);
        oP13nData.presenceAttribute = this._getPresenceAttribute();
        oP13nData.items.forEach(function(oItem){delete oItem.groupPosition;});

        return oP13nData;
    };

    return GroupController;

});

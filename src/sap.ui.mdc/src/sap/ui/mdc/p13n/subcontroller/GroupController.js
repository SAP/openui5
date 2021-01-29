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

    GroupController.prototype.getAdaptationUI = function () {
        return "sap/ui/mdc/p13n/panels/SelectionPanel";
    };

    GroupController.prototype.getChangeOperations = function () {
        return {
            add: "addGroup",
            remove: "removeGroup",
            move: "moveGroup"
        };
    };

    GroupController.prototype._getPresenceAttribute = function (bExternalStateAppliance) {
        return bExternalStateAppliance ? "grouped" : "selected";
    };

    GroupController.prototype.setP13nData = function (oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mExistingGroupLevels = P13nBuilder.arrayToMap(aItemState);

        var fnEnhancer = function(oItem, oProperty){

            var sName = oProperty.name;
            if (oProperty.isGroupable() === false) {
                return false;
            }

            oItem.selected = mExistingGroupLevels[sName] ? true : false;
            oItem.groupPosition = mExistingGroupLevels[sName] ? mExistingGroupLevels[sName].position : -1;

            return true;
        };

        var oP13nData = P13nBuilder.prepareP13nData({}, oPropertyHelper, fnEnhancer);

        P13nBuilder.sortP13nData({
            visible: "selected",
            position: "groupPosition"
        }, oP13nData.items);

        this.oP13nData = oP13nData;
    };

    GroupController.prototype.getP13nData = function () {
        return this.oP13nData;
    };

    return GroupController;

});

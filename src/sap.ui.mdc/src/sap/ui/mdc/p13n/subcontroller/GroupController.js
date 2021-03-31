/*
 * ! ${copyright}
 */
sap.ui.define([
    './BaseController', 'sap/ui/mdc/p13n/P13nBuilder', 'sap/base/util/merge', 'sap/ui/mdc/p13n/panels/GroupPanel', 'sap/ui/mdc/p13n/panels/SelectionPanel'
], function (BaseController, P13nBuilder, merge, GroupPanel, SelectionPanel) {
    "use strict";

    var GroupController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.GroupController");

    GroupController.prototype.getCurrentState = function () {
        return this.getAdaptationControl().getCurrentState().groupLevels;
    };

    GroupController.prototype.getUISettings = function () {
        return {
            tabText: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("p13nDialog.TAB_Group"),
            title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("group.PERSONALIZATION_DIALOG_TITLE")
        };
    };

    GroupController.prototype.getDelta = function (mPropertyBag) {
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    GroupController.prototype.getAdaptationUI = function(oPropertyHelper){

        var oGroupPanel = this.getAdaptationControl()._bNewP13n ? new GroupPanel() : new SelectionPanel();
        this._oPanel = oGroupPanel;
        var oAdaptationModel = this._getP13nModel(oPropertyHelper);
        oGroupPanel.setP13nModel(oAdaptationModel);

        return Promise.resolve(oGroupPanel);
    };

    GroupController.prototype.model2State = function() {
        var aItems = [];
        this._oAdaptationModel.getProperty("/items").forEach(function(oItem){
            if (oItem.grouped){
                aItems.push({
                    name: oItem.name
                });
            }
        });
        return aItems;
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

    GroupController.prototype.update = function(){
        BaseController.prototype.update.apply(this, arguments);
        this._oPanel.setP13nModel(this._oAdaptationModel);
    };

    GroupController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mItemState = P13nBuilder.arrayToMap(aItemState);
        var oController = this.getAdaptationControl();
        var oAggregations = oController.getAggregateConditions ? oController.getAggregateConditions() || {} : {};

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mItemState[oProperty.name];
            mItem.grouped = !!oExisting;
            mItem.position =  oExisting ? oExisting.position : -1;
            return !(oProperty.groupable === false || !!oAggregations[oProperty.name]);
        });

        P13nBuilder.sortP13nData({
            visible: "grouped",
            position: "position"
        }, oP13nData.items);

        oP13nData.presenceAttribute = this._getPresenceAttribute();
        oP13nData.items.forEach(function(oItem){delete oItem.position;});

        return oP13nData;
    };

    return GroupController;

});

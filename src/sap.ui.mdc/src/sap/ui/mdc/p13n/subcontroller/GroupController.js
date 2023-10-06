/*!
 * ${copyright}
 */
sap.ui.define([
    "./SelectionController", 'sap/ui/mdc/p13n/P13nBuilder', 'sap/m/p13n/GroupPanel'
], function (BaseController, P13nBuilder, GroupPanel) {
    "use strict";

    const GroupController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.GroupController");

    GroupController.prototype.getStateKey = function () {
        return "groupLevels";
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

    GroupController.prototype.initAdaptationUI = function(oPropertyHelper){
        const oGroupPanel = new GroupPanel();
        const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
		const oAdaptationControl = this.getAdaptationControl();

		if (oAdaptationControl.isA("sap.ui.mdc.Table") && oAdaptationControl._isOfType("ResponsiveTable")) {
			oGroupPanel.setQueryLimit(1);
		}

        oGroupPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oGroupPanel;

        return Promise.resolve(oGroupPanel);
    };

    GroupController.prototype.model2State = function() {
        const aItems = [];
        this._oPanel.getP13nData(true).forEach(function(oItem){
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

    GroupController.prototype.mixInfoAndState = function(oPropertyHelper) {

        const aItemState = this.getCurrentState();
        const mItemState = P13nBuilder.arrayToMap(aItemState);
        const oController = this.getAdaptationControl();
        const oAggregations = oController.getAggregateConditions ? oController.getAggregateConditions() || {} : {};

        const oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            const oExisting = mItemState[oProperty.name];
            mItem.grouped = !!oExisting;
            mItem.position =  oExisting ? oExisting.position : -1;
            return !(oProperty.groupable === false || oAggregations[oProperty.name]);
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

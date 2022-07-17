/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController",
    "sap/ui/mdc/p13n/panels/ActionToolbarPanel",
    "sap/m/Column",
    "sap/ui/mdc/p13n/P13nBuilder"
], function (BaseController, ActionToolbarPanel, Column, P13nBuilder) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
    var ActionToolbarController = BaseController.extend("saps.ui.mdc.p13n.subcontroller.ActionToolbarController");

    ActionToolbarController.prototype.getUISettings = function() {
        return {
            title: oResourceBundle.getText("actiontoolbar.RTA_TITLE")
        };
    };

    ActionToolbarController.prototype.getAdaptationUI = function(oPropertyHelper){

        var oSelectionPanel = new ActionToolbarPanel({
            showHeader: true
        });
        //oSelectionPanel.setEnableReorder(false);
        oSelectionPanel.setFieldColumn(oResourceBundle.getText("actiontoolbar.RTA_COLUMN_HEADER"));

        var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        oSelectionPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oSelectionPanel;
        return Promise.resolve(oSelectionPanel);
    };

    ActionToolbarController.prototype.getDelta = function(mPropertyBag) {
        var aChanges = BaseController.prototype.getDelta.apply(this, arguments);
        aChanges.forEach(function(oChange){
            var sChangeType = oChange.changeSpecificData.changeType;
            if (sChangeType === "hideControl" || sChangeType === "unhideControl") {
                oChange.selectorElement = sap.ui.getCore().byId(oChange.changeSpecificData.content.name);
                delete oChange.changeSpecificData.content;
            }
        });
        return aChanges;
    };

    /**
     * Initialized the inner model for the Personalization.
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The propertyhelper that should be utilized for property determination.
     */
     ActionToolbarController.prototype.mixInfoAndState = function(oPropertyHelper) {
        var aItemState = this.getCurrentState();
        var mItemState = P13nBuilder.arrayToMap(aItemState);

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mItemState[oProperty.name];
            mItem.visible = !!oExisting;
            mItem.position = oExisting ? oExisting.position : -1;
            mItem.alignment = oProperty.alignment;
            return oProperty.visible;
        });

        P13nBuilder.sortP13nData({
            visible: "visible",
            position: "position"
        }, oP13nData.items);

        oP13nData.items.forEach(function(oItem){delete oItem.position;});
        return oP13nData;
    };

    ActionToolbarController.prototype.getChangeOperations = function() {
        return {
            add: "unhideControl",
            remove: "hideControl",
            move: "moveAction"
        };
    };

	return ActionToolbarController;

});
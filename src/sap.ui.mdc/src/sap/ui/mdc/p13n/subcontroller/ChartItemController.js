/*!
 * ${copyright}
 */

sap.ui.define([
    "./BaseController",
    "sap/ui/mdc/p13n/P13nBuilder"
], function (BaseController, P13nBuilder) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

    var ChartItemController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ChartItemController");

    ChartItemController.prototype.getAdaptationUI = function(oPropertyHelper) {

        var fnResolve;

        this._oAdaptationControl.getAdaptationUI().then(function(oPanel){
            this._oPanel = oPanel;
            this._oPropHelper = oPropertyHelper;
            var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
            oPanel.setP13nData(oAdaptationData.items);
            fnResolve(oPanel);
        }.bind(this));

        return new Promise(function (resolve, reject) {
            fnResolve = resolve;
        });

    };

    ChartItemController.prototype.update = function(){
        BaseController.prototype.update.apply(this, arguments);

        this._oPanel.setP13nData(this.mixInfoAndState(this._oPropHelper).items);

    };

    ChartItemController.prototype.getDelta = function(mPropertyBag) {
        mPropertyBag.deltaAttributes.push("role");
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    ChartItemController.prototype.getUISettings = function() {
        return {
            title: oResourceBundle.getText("chart.PERSONALIZATION_DIALOG_TITLE"),
            tabText: oResourceBundle.getText("p13nDialog.TAB_Chart")
        };
    };

    ChartItemController.prototype.mixInfoAndState = function(oPropertyHelper) {

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

        return oP13nData;
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
/*!
 * ${copyright}
 */

sap.ui.define([
    "./SelectionController",
    "sap/ui/core/Lib"
], function(BaseController, Lib) {
    "use strict";

    const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

    const ChartItemController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ChartItemController");

    ChartItemController.prototype.initAdaptationUI = function(oPropertyHelper) {

        return this.getAdaptationControl().getAdaptationUI().then(function(oPanel){
            this._oPanel = oPanel;
            oPanel.setTitle(oResourceBundle.getText("p13nDialog.TAB_Chart"));
            const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
            oPanel.setP13nData(oAdaptationData.items);
            return oPanel;
        }.bind(this));

    };

    ChartItemController.prototype.update = function(oPropertyHelper){
        BaseController.prototype.update.apply(this, arguments);
        //this._oPanel.setP13nData(this.mixInfoAndState(oPropertyHelper).items);
    };

    ChartItemController.prototype.getDelta = function(mPropertyBag) {
        mPropertyBag.deltaAttributes.push("role");
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    ChartItemController.prototype.mixInfoAndState = function(oPropertyHelper) {

        const aItemState = this.getCurrentState();
        const mItemState = this.arrayToMap(aItemState);

        const oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            const oExisting = mItemState[oProperty.name];
            mItem.visible = !!oExisting;
            mItem.position =  oExisting ? oExisting.position : -1;
            mItem.role =  oExisting ? oExisting.role : oProperty.role;
            mItem.kind = oProperty.kind;

            if (oProperty.availableRoles) {
                mItem.availableRoles = oProperty.availableRoles;
            }

            return oProperty.visible;
        });


        this.sortP13nData({
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
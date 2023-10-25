/*!
 * ${copyright}
 */

sap.ui.define([
    "./SelectionController",
    "sap/ui/core/Lib",
    'sap/ui/mdc/p13n/P13nBuilder',
    'sap/m/p13n/SortPanel'
], function(BaseController, Library, P13nBuilder, SortPanel) {
	"use strict";

    const SortController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.SortController", {
        constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
    });

    SortController.prototype.getStateKey = function() {
        return "sorters";
    };

    SortController.prototype.getUISettings = function() {
        return {
            tabText: Library.getResourceBundleFor("sap.ui.mdc").getText("p13nDialog.TAB_Sort"),
            title: Library.getResourceBundleFor("sap.ui.mdc").getText("sort.PERSONALIZATION_DIALOG_TITLE")
        };
    };

    SortController.prototype.getDelta = function(mPropertyBag) {
        mPropertyBag.deltaAttributes.push("descending");
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    SortController.prototype.initAdaptationUI = function(oPropertyHelper){
        const oSortPanel = new SortPanel();
        const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        oSortPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oSortPanel;

        return Promise.resolve(oSortPanel);
    };

    SortController.prototype.model2State = function() {
        const aItems = [];
        if (this._oPanel) {
            this._oPanel.getP13nData(true).forEach(function(oItem){
                if (oItem.sorted){
                    aItems.push({
                        name: oItem.name
                    });
                }
            });
            return aItems;
        }
    };

    SortController.prototype.getChangeOperations = function() {
        return {
            add: "addSort",
            remove: "removeSort",
            move: "moveSort"
        };
    };

    SortController.prototype._getPresenceAttribute = function(bexternalAppliance){
        return "sorted";
    };

    SortController.prototype.mixInfoAndState = function(oPropertyHelper) {

        const aItemState = this.getCurrentState();
        const mExistingSorters = P13nBuilder.arrayToMap(aItemState);

        const oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){

            const oExistingSorter = mExistingSorters[oProperty.name];

            mItem.sorted = oExistingSorter ? true : false;
            mItem.sortPosition = oExistingSorter ? oExistingSorter.position : -1;
            mItem.descending = oExistingSorter ? !!oExistingSorter.descending : false;

            return !(oProperty.sortable === false);
        });

        this.sortP13nData({
            visible: "sorted",
            position: "sortPosition"
        }, oP13nData.items);

        oP13nData.presenceAttribute = this._getPresenceAttribute();

        oP13nData.items.forEach(function(oItem){delete oItem.sortPosition;});

        return oP13nData;
    };

	return SortController;

});

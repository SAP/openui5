/*
 * ! ${copyright}
 */

sap.ui.define([
	'./BaseController', 'sap/ui/mdc/p13n/P13nBuilder', 'sap/ui/mdc/p13n/FlexUtil'
], function (BaseController, P13nBuilder, FlexUtil) {
	"use strict";

    var FilterController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.FilterController");

    FilterController.prototype.getCurrentState = function() {
        var oControlState = this.getAdaptationControl().getCurrentState();
        return oControlState.hasOwnProperty("filter") ? oControlState.filter : {};
    };

    FilterController.prototype.getContainerSettings = function() {
        return {
            title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("filter.PERSONALIZATION_DIALOG_TITLE"),
            afterClose: function(oEvt) {
                var oDialog = oEvt.getSource();
                if (oDialog) {
                    oDialog.removeAllContent();
                    oDialog.destroy();
                }
            }
        };
    };

    FilterController.prototype.getChangeOperations = function() {
        return {
            add: "addCondition",
            remove: "removeCondition"
        };
    };

    FilterController.prototype.getBeforeApply = function(oAdaptationUI) {
        var pConditionPromise = oAdaptationUI ? oAdaptationUI.createConditionChanges() : Promise.resolve([]);
        return pConditionPromise;
    };

    FilterController.prototype.getFilterControl = function() {
        return this.getAdaptationControl().isA("sap.ui.mdc.IFilter") ? this.getAdaptationControl() : this.getAdaptationControl()._oP13nFilter;
    };

    FilterController.prototype.initializeUI = function() {
        return this.getAdaptationUI().then(function(oAdaptationFilterBar){
            return oAdaptationFilterBar.createFilterFields();
        });
    };

    FilterController.prototype.getAdaptationUI = function (fnRegister) {
        return this.getAdaptationControl().retrieveInbuiltFilter();
    };

    FilterController.prototype.getDelta = function(mPropertyBag) {
        return FlexUtil.getConditionDeltaChanges(mPropertyBag);
    };

    FilterController.prototype.setP13nData = function(oPropertyHelper) {

        var mExistingFilters = this.getCurrentState() || {};

        var fnEnhancer = function(oItem, oProperty){

            var sName = oProperty.name;

            if (oProperty.filterable === false) {
                return false;
            }

            var aExistingFilters = mExistingFilters[sName];
            oItem.isFiltered = aExistingFilters && aExistingFilters.length > 0 ? true : false;

            return true;
        };

        var oP13nData = P13nBuilder.prepareP13nData({}, oPropertyHelper, fnEnhancer);

        P13nBuilder.sortP13nData({
            visible: "selected",
            position: "position"
        }, oP13nData.items);

        this.oP13nData = oP13nData;
    };

	return FilterController;

});

/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/condition/FilterOperatorUtil', './BaseController', 'sap/ui/mdc/p13n/P13nBuilder', 'sap/ui/mdc/p13n/FlexUtil', 'sap/base/Log'
], function (FilterOperatorUtil, BaseController, P13nBuilder, FlexUtil, Log) {
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

    FilterController.prototype.getBeforeApply = function() {
        var oAdaptationFilterBar = this.getAdaptationControl().getInbuiltFilter();
        var pConditionPromise = oAdaptationFilterBar ? oAdaptationFilterBar.createConditionChanges() : Promise.resolve([]);
        return pConditionPromise;
    };

    FilterController.prototype.getFilterControl = function() {
        return this.getAdaptationControl().isA("sap.ui.mdc.IFilter") ? this.getAdaptationControl() : this.getAdaptationControl()._oP13nFilter;
    };

    FilterController.prototype.sanityCheck = function(oState) {
        FilterController.checkConditionOperatorSanity(oState);
        return oState;
    };

    /**
     * @private
     * @ui5-restricted sap.ui.mdc
     *
     * A sanity check that can be used for conditions by utilizing the FilterOperatorUtil.
     * This is being used to remove conditions that are using unknown operators.
     *
     * @param {object} mConditions The condition map.
     */
    FilterController.checkConditionOperatorSanity = function(mConditions) {
        //TODO: consider to harmonize this sanity check with 'getCurrentState' cleanups
        for (var sFieldPath in mConditions) {
            var aConditions = mConditions[sFieldPath];
            for (var i = 0; i < aConditions.length; i++) {
                var oCondition = aConditions[i];
                var sOperator = oCondition.operator;
                if (!FilterOperatorUtil.getOperator(sOperator)){
                    aConditions.splice(i, 1);
                    /*
                        * in case the unknown operator has been removed, we need to check
                        * if this caused the object to be empty to not create unnecessary remove changes
                        * this should only be done within this check, as empty objects have a special meaning in the 'filter'
                        * object within the external state to reset the given conditions for a single property
                        */
                    if (mConditions[sFieldPath].length == 0) {
                        delete mConditions[sFieldPath];
                    }
                    Log.warning("The provided conditions for field '" + sFieldPath + "' contain unsupported operators - these conditions will be neglected.");
                }
            }
        }
    };

    FilterController.prototype.getAdaptationUI = function (oPropertyHelper, oWrapper) {
        var oAdaptationModel = this._getP13nModel(oPropertyHelper);

        return this.getAdaptationControl().retrieveInbuiltFilter().then(function(oAdaptationFilterBar){
            oAdaptationFilterBar.setP13nModel(oAdaptationModel);
            oAdaptationFilterBar.setLiveMode(false);
            this._oAdaptationFB = oAdaptationFilterBar;
            return oAdaptationFilterBar.createFilterFields().then(function(){
                return oAdaptationFilterBar;
            });
        }.bind(this));
    };


    FilterController.prototype.getDelta = function(mPropertyBag) {
        return FlexUtil.getConditionDeltaChanges(mPropertyBag);
    };

    FilterController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var mExistingFilters = this.getCurrentState() || {};

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){

            var sName = oProperty.name;

            var aExistingFilters = mExistingFilters[sName];
            mItem.isFiltered = aExistingFilters && aExistingFilters.length > 0 ? true : false;

            return !(oProperty.filterable === false);
        });

        P13nBuilder.sortP13nData({
            visible: undefined,
            position: undefined
        }, oP13nData.items);

        return oP13nData;
    };

	return FilterController;

});

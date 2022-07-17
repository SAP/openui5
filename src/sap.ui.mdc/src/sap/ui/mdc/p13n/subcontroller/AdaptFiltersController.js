/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController", "sap/ui/mdc/p13n/P13nBuilder", "sap/base/util/merge"
], function (BaseController, P13nBuilder, merge) {
    "use strict";

    var AdaptFiltersController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.AdaptFiltersController", {
        constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
    });

    AdaptFiltersController.prototype.getUISettings = function() {
        return {
            verticalScrolling: false,
            title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("filterbar.ADAPT_TITLE"),
            afterClose: function(oEvt) {
                var oDialog = oEvt.getSource();
                if (oDialog) {
                    oDialog.getContent()[0].executeRemoves();
                    oDialog.removeAllContent();
                    oDialog.destroy();
                }
            }
        };
    };

    AdaptFiltersController.prototype.getBeforeApply = function() {
        var oAdaptationFilterBar = this.getAdaptationControl().getInbuiltFilter();
        var pConditionPromise = oAdaptationFilterBar ? oAdaptationFilterBar.createConditionChanges() : Promise.resolve([]);
        return pConditionPromise;
    };

    AdaptFiltersController.prototype.getFilterControl = function() {
        return this.getAdaptationControl();
    };

    AdaptFiltersController.prototype.getChangeOperations = function() {
        return {
            add: "addFilter",
            remove: "removeFilter",
            move: "moveFilter"
        };
    };

    AdaptFiltersController.prototype.getAdaptationUI = function (oPropertyHelper) {

        return this.getAdaptationControl().retrieveInbuiltFilter().then(function(oAdaptationFilterBar){
            var oAdaptationModel = this._getP13nModel(oPropertyHelper);
            oAdaptationFilterBar.setP13nData(oAdaptationModel.oData);
            oAdaptationFilterBar.setLiveMode(false);
            return oAdaptationFilterBar.createFilterFields().then(function(){
                return oAdaptationFilterBar;
            });
        }.bind(this));
    };

    AdaptFiltersController.prototype.update = function(){
        BaseController.prototype.update.apply(this, arguments);
        this.getAdaptationControl().getInbuiltFilter().createFilterFields();
    };

    AdaptFiltersController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var mExistingFilters = this.getAdaptationControl().getCurrentState().filter || {};

        var aItemState = this.getCurrentState();
        var mExistingProperties = P13nBuilder.arrayToMap(aItemState);

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(oItem, oProperty){

            var oExistingProperty = mExistingProperties[oProperty.name];
            var aExistingFilters = mExistingFilters[oProperty.name];
            oItem.visible = oExistingProperty ? true : false;
            oItem.visibleInDialog = true;
            oItem.position = oExistingProperty ? oExistingProperty.position : -1;
            oItem.isFiltered = aExistingFilters && aExistingFilters.length > 0 ? true : false;
            oItem.required = oProperty.required;

            return !(oProperty.hiddenFilter === true ||  oProperty.name == "$search");
        }, true);

        P13nBuilder.sortP13nData({
            visible: "visible",
            position: "position"
        }, oP13nData.items);

        return oP13nData;
    };

	return AdaptFiltersController;

});
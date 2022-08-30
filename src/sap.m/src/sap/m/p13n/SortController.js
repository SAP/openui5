/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/p13n/SelectionController',  'sap/m/p13n/SortPanel', 'sap/m/p13n/modules/xConfigAPI'
], function (BaseController, SortPanel, xConfigAPI) {
	"use strict";

     /**
	 * Constructor for a new <code>SortController</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
     * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this controller
	 *
	 * @class
	 * The <code>SortController</code> entity serves as a base class to create personalization implementations that are specific to sorting.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 * @alias sap.m.p13n.SortController
	 */
    var SortController = BaseController.extend("sap.m.p13n.SortController", {
        constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
    });

    SortController.prototype.getStateKey = function() {
        return "sorters";
    };

    SortController.prototype.getDelta = function(mPropertyBag) {
        mPropertyBag.deltaAttributes.push("descending");
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    SortController.prototype.initAdaptationUI = function(oPropertyHelper){

        var oSortPanel;

        oSortPanel = new SortPanel();

        var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        oSortPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oSortPanel;

        return Promise.resolve(oSortPanel);
    };

    SortController.prototype.model2State = function() {
        var aItems = [];
        if (this._oPanel) {
            this._oPanel.getP13nData(true).forEach(function(oItem){
                if (oItem.sorted){
                    aItems.push({
                        key: oItem.key
                    });
                }
            });
            return aItems;
        }
    };

    SortController.prototype.getChangeOperations = function() {
        return {
            add: "addSort",
            remove: "removeSort"
        };
    };

    SortController.prototype.getCurrentState = function(bExternalize) {
        var oXConfig = xConfigAPI.readConfig(this.getAdaptationControl()) || {};
        var aSortConditions = oXConfig.hasOwnProperty("properties") ? oXConfig.properties.sortConditions : [];

        return aSortConditions || [];
    };

    SortController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent){
        var oAddRemoveChange = {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sOperation,
                content: oContent
            }
        };
        return oAddRemoveChange;
    };

    SortController.prototype._createMoveChange = function(sId, sPropertykey, iNewIndex, sMoveOperation, oControl, bPersistId){
        var oMoveChange =  {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sMoveOperation,
                content: {
                    id: sId,
                    key: sPropertykey,
                    index: iNewIndex
                }
            }
        };

        if (!bPersistId) {
            delete oMoveChange.changeSpecificData.content.id;
        }

        return oMoveChange;
    };

    SortController.prototype._getPresenceAttribute = function(bexternalAppliance){
        return "sorted";
    };

    SortController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mExistingSorters = this.arrayToMap(aItemState);

        var oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){

            var oExistingSorter = mExistingSorters[oProperty.key];

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
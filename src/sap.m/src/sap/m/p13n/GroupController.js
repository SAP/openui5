/*
 * ! ${copyright}
 */
sap.ui.define([
    'sap/m/p13n/SelectionController', 'sap/m/p13n/GroupPanel', 'sap/m/p13n/modules/xConfigAPI'
], function (BaseController, GroupPanel, xConfigAPI) {
    "use strict";

     /**
	 * Constructor for a new <code>GroupController</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
     * @param {sap.ui.core.Control} mSettings.control The control instance to be personalized by this controller
	 *
	 * @class
	 * The <code>GroupController</code> serves as base class to create sort specific personalization implementations.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental
	 * @since 1.104
	 * @alias sap.m.p13n.GroupController
	 */
    var GroupController = BaseController.extend("sap.m.p13n.subcontroller.GroupController");

    GroupController.prototype.getStateKey = function () {
        return "groupLevels";
    };

    GroupController.prototype.getCurrentState = function(bExternalize) {
        var oXConfig = xConfigAPI.readConfig(this.getAdaptationControl()) || {};
        var aSortConditions = oXConfig.hasOwnProperty("properties") ? oXConfig.properties.groupConditions : [];

        return aSortConditions || [];
    };

    GroupController.prototype.initAdaptationUI = function(oPropertyHelper){
        var oGroupPanel = new GroupPanel();
        var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
		var oAdaptationControl = this.getAdaptationControl();

		if (oAdaptationControl.isA("sap.m.Table")) {
			oGroupPanel.setQueryLimit(1);
		}

        oGroupPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oGroupPanel;

        return Promise.resolve(oGroupPanel);
    };

    GroupController.prototype.model2State = function() {
        var aItems = [];
        this._oPanel.getP13nData(true).forEach(function(oItem){
            if (oItem.grouped){
                aItems.push({
                    key: oItem.key
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

    GroupController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent){
        var oAddRemoveChange = {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sOperation,
                content: oContent
            }
        };
        return oAddRemoveChange;
    };

    GroupController.prototype._createMoveChange = function(sId, sPropertykey, iNewIndex, sMoveOperation, oControl, bPersistId){
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

    GroupController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mItemState = this.arrayToMap(aItemState);
        var oController = this.getAdaptationControl();
        var oAggregations = oController.getAggregateConditions ? oController.getAggregateConditions() || {} : {};

        var oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mItemState[oProperty.key];
            mItem.grouped = !!oExisting;
            mItem.position =  oExisting ? oExisting.position : -1;
            return !(oProperty.groupable === false || oAggregations[oProperty.key]);
        });

        this.sortP13nData({
            visible: "grouped",
            position: "position"
        }, oP13nData.items);

        oP13nData.presenceAttribute = this._getPresenceAttribute();
        oP13nData.items.forEach(function(oItem){delete oItem.position;});

        return oP13nData;
    };

    GroupController.prototype.applyChange = function(aSortState){
        return Promise.resolve();
    };

    return GroupController;

});

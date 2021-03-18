/*
 * ! ${copyright}
 */

sap.ui.define([
    'sap/ui/base/Object',
    'sap/ui/mdc/p13n/FlexUtil',
    'sap/ui/mdc/p13n/P13nBuilder',
    'sap/base/util/merge',
    'sap/base/util/deepEqual',
    'sap/ui/model/json/JSONModel',
    'sap/ui/mdc/p13n/panels/SelectionPanel'
], function (BaseObject, FlexUtil, P13nBuilder, merge, deepEqual, JSONModel, SelectionPanel) {
	"use strict";

	/**
	 * Constructor for a new BaseController. The BaseController serves as
     * base class to create control specific personalization implementations.
	 *
	 * @class
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental
	 * @since 1.87
	 * @alias sap.ui.mdc.p13n.subcontroller.BaseController
	 */
	var BaseController = BaseObject.extend("sap.ui.mdc.p13n.subcontroller.BaseController",{
        constructor: function(oControl) {
            BaseObject.call(this);

            this._oAdaptationControl = oControl;
            this._oP13nData = null;
            this._bLiveMode = false;
            this._bResetEnabled = false;
        }
    });

    /**
     * Customize the p13n container UI.
     *
     * @returns {object} The configuration for the Dialog/Popover
     */
    BaseController.prototype.getContainerSettings = function() {
        //Should always be overruled
        return {
            title: "Adaptation Dialog"
        };
    };

    /**
     * The control that is being personalized via this controller.
     *
     * @returns {sap.ui.mdc.Control} The control which is being adapted.
     */
    BaseController.prototype.getAdaptationControl = function(){
        return this._oAdaptationControl;
    };

    /**
     * Defines whether a Dialog (Change creation on 'OK') or a Popover (liveChanges) should be used.
     *
     * @returns {boolean}
     */
    BaseController.prototype.getLiveMode = function(){
        return this._bLiveMode;
    };

    /**
     * Defines the available ChangeTypes (should be in sync with 'getDelta').
     *
     * @returns {object} A map of legal change types.
     */
    BaseController.prototype.getChangeOperations = function(){
        return {
            add: null,
            remove: null,
            move: null
        };
    };

    /**
     * Defines whether the container should include a reset.
     *
     * @returns {boolean}
     */
    BaseController.prototype.getResetEnabled = function() {
        return this._bResetEnabled;
    };

    BaseController.prototype.sanityCheck = function(oState) {
        return oState;
    };

    /**
     * The actual UI used for personalization.
     *
     * @returns {sap.ui.core.Control|string|Promise} The control which is going to be used in the p13n container.
     */
    BaseController.prototype.getAdaptationUI = function(oPropertyHelper){

        var oSelectionPanel = new SelectionPanel();
        var oAdaptationModel = this._getP13nModel(oPropertyHelper);
        oSelectionPanel.setP13nModel(oAdaptationModel);

        return Promise.resolve(oSelectionPanel);
    };

    BaseController.prototype.getCurrentState = function(){
        return this._oAdaptationControl.getCurrentState().items;
    };

    BaseController.prototype.getDelta = function(mPropertyBag) {
        var sPresenceAttribute = this._getPresenceAttribute(mPropertyBag.externalAppliance);
        var aNewStatePrepared;

        var fnFilterUnselected = function (oItem) {
            return oItem.hasOwnProperty(sPresenceAttribute) && oItem[sPresenceAttribute] === false ? false : true;
        };
        aNewStatePrepared = mPropertyBag.applyAbsolute
            ? mPropertyBag.changedState.filter(fnFilterUnselected) :
            this._getFilledArray(mPropertyBag.existingState, mPropertyBag.changedState, sPresenceAttribute).filter(fnFilterUnselected);

        mPropertyBag.changedState = aNewStatePrepared;

        //Example: Dialog Ok --> don't trigger unnecessary flex change processing
        if (deepEqual(mPropertyBag.existingState, aNewStatePrepared)){
            return [];
        } else {
            return FlexUtil.getArrayDeltaChanges(mPropertyBag);
        }

    };

    //TODO: check if this can be avoided
    BaseController.prototype._getPresenceAttribute = function(bexternalAppliance){
        return "visible";
    };

    /**
     * Allows calculations prior to applying a set of changes.
     * This can be used to mix additional changes to auto-created changes.
     *
     * @returns {Promise} A Promise that should resolve with an array of additional changes.
     */
    BaseController.prototype.getBeforeApply = function(){
        return Promise.resolve();
    };

    /**
     * Initialized the inner model for the Personalization.
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The propertyhelper that should be utilized for property determination.
     */
    BaseController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mItemState = P13nBuilder.arrayToMap(aItemState);

        var oP13nData = P13nBuilder.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mItemState[oProperty.name];
            mItem.visible = !!oExisting;
            mItem.position =  oExisting ? oExisting.position : -1;
            return oProperty.visible;
        });

        P13nBuilder.sortP13nData({
            visible: "visible",
            position: "position"
        }, oP13nData.items);

        oP13nData.items.forEach(function(oItem){delete oItem.position;});
        return oP13nData;
    };

    /**
     * @returns {object} The personalization data.
     *
     */
    BaseController.prototype.getP13nData = function() {
        return this._oAdaptationModel.getProperty("/items");
    };

    BaseController.prototype.model2State = false;

    /**
     * Can be used to trigger update after UI interactions such as "Ok" and "Reset"
     */
    BaseController.prototype.update = function(oPropertyHelper) {
        if (this._oAdaptationModel) {
            //'setData' causes unnecessary rerendering in some cases
            var oP13nData = this.mixInfoAndState(oPropertyHelper);
            this._oAdaptationModel.setProperty("/items", oP13nData.items);
            this._oAdaptationModel.setProperty("/itemsGrouped", oP13nData.itemsGrouped);
        }
    };


    //TODO: move to FlexUtil? --> Split FlexUtil<>DeltaUtil
    BaseController.prototype._getFilledArray = function(aPreviousItems, aNewItems, sRemoveProperty) {
		var aNewItemsPrepared = merge([], aPreviousItems);
		var aNewItemState = merge([], aNewItems);

		var mExistingItems = P13nBuilder.arrayToMap(aPreviousItems);

		aNewItemState.forEach(function (oItem) {
			var oExistingItem = mExistingItems[oItem.name];
			if (!oItem.hasOwnProperty(sRemoveProperty) || oItem[sRemoveProperty]) {
				var iNewPosition = oItem.position;
				if (oExistingItem){//move if it exists
					// do not reorder it in case it exists and no position is provided
					iNewPosition = iNewPosition > -1  ? iNewPosition : oExistingItem.position;
					var iOldPosition = oExistingItem.position;
					aNewItemsPrepared.splice(iNewPosition, 0, aNewItemsPrepared.splice(iOldPosition, 1)[0]);
				} else {//add if it does not exist the item will be inserted at the end
					iNewPosition = iNewPosition > -1 ? iNewPosition : aNewItemsPrepared.length;
					aNewItemsPrepared.splice(iNewPosition, 0, oItem);
				}
				aNewItemsPrepared[iNewPosition] = oItem;//overwrite existing item with new item (for correct values such as 'descending')
			} else if (oExistingItem) {//check if exists before delete
				aNewItemsPrepared[oExistingItem.position][sRemoveProperty] = false;
			}
		});

		return aNewItemsPrepared;
	};

    /**
     * @returns {sap.ui.model.json.JSONModel} The personalization model.
     *
     */
    BaseController.prototype._getP13nModel = function(oPropertyHelper) {
        if (!this._oAdaptationModel) {
            this._oAdaptationModel = new JSONModel(this.mixInfoAndState(oPropertyHelper));
            this._oP13nData = this._oAdaptationModel.getData();
            this._oAdaptationModel.setSizeLimit(10000);
        } else {
            this.update(oPropertyHelper);
        }

        return this._oAdaptationModel;
    };


    BaseController.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
        this._oAdaptationControl = null;
        this._bLiveMode = null;
        this._bResetEnabled = null;
        this._oAdaptationModel = null;
    };

	return BaseController;

});
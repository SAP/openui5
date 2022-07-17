/*!
 * ${copyright}
 */

sap.ui.define([
    'sap/base/util/array/diff',
    'sap/ui/base/Object',
    'sap/ui/mdc/p13n/FlexUtil',
    'sap/ui/mdc/p13n/P13nBuilder',
    'sap/base/util/merge',
    'sap/base/util/deepEqual',
    'sap/ui/model/json/JSONModel',
    'sap/m/p13n/SelectionPanel'
], function (diff, BaseObject, FlexUtil, P13nBuilder, merge, deepEqual, JSONModel, SelectionPanel) {
	"use strict";

    /**
	 * Constructor for a new <code>BaseController</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>BaseController</code> serves as base class to create control specific personalization implementations.
	 *
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
    BaseController.prototype.getUISettings = function() {
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
     * @returns {boolean} Determines if the livemode should be enabled
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
     * @returns {boolean} Determines if the reset should be enabled
     */
    BaseController.prototype.getResetEnabled = function() {
        return this._bResetEnabled;
    };

     /**
     * Defines which control(s) are considered for the reset.
     *
     * @returns {sap.ui.core.Control|sap.ui.core.Control[]}
     */
    BaseController.prototype.getSelectorForReset = function() {
        return this._oAdaptationControl;
    };

    BaseController.prototype.sanityCheck = function(oState) {
        return oState;
    };

    /**
     * The actual UI used for personalization.
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The property helper instance
     * @returns {sap.ui.core.Control|string|Promise} The control which is going to be used in the p13n container.
     */
    BaseController.prototype.getAdaptationUI = function(oPropertyHelper){

        var oSelectionPanel = new SelectionPanel();
        var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        oSelectionPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oSelectionPanel;
        return Promise.resolve(oSelectionPanel);
    };

    BaseController.prototype.getCurrentState = function(){
        return this._oAdaptationControl.getCurrentState()[this.getStateKey()];
    };

	BaseController.prototype.getStateKey = function(){
		return "items";
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
            return this.getArrayDeltaChanges(mPropertyBag);
        }

    };

    /**
    * Generates a set of changes based on the given arrays for a specified control
    *
    * @public
    *
    * @param {object} mDeltaInfo Map containing the necessary information to calculate the diff as change objects
    * @param {array} mDeltaInfo.existingState An array describing the control state before a adaptation
    * @param {array} mDeltaInfo.changedState An array describing the control state after a certain adaptation
    * @param {object} mDeltaInfo.control Control instance which is being used to generate the changes
    * @param {object} mDeltaInfo.changeOperations Map containing the changeOperations for the given Control instance
    * @param {string} mDeltaInfo.changeOperations.add Name of the control specific 'add' changehandler
    * @param {string} mDeltaInfo.changeOperations.remove Name of the control specific 'remove' changehandler
    * @param {string} [mDeltaInfo.changeOperations.move] Name of the control specific 'move' changehandler
    * @param {string} [mDeltaInfo.generator] Name of the change generator (E.g. the namespace of the UI creating the change object)
    *
    * @returns {array} Array containing the delta based created changes
    */
    BaseController.prototype.getArrayDeltaChanges = function (mDeltaInfo) {

        var aExistingArray = mDeltaInfo.existingState;
        var aChangedArray = mDeltaInfo.changedState;
        var oControl = mDeltaInfo.control;
        var sInsertOperation = mDeltaInfo.changeOperations.add;
        var sRemoveOperation = mDeltaInfo.changeOperations.remove;
        var sMoveOperation = mDeltaInfo.changeOperations.move;
        var sGenerator = mDeltaInfo.generator;

        var aDeltaAttributes = mDeltaInfo.deltaAttributes || [];

        var fnSymbol = function(o) {
            var sDiff = "";
            aDeltaAttributes.forEach(function(sAttribute){
                sDiff = sDiff + o[sAttribute];
            });
            return sDiff;
        };

        var aResults = diff(aExistingArray, aChangedArray, fnSymbol);
        // Function to match field with exising field in the given array
        var fMatch = function (oField, aArray) {
            return aArray.filter(function (oExistingField) {
                return oExistingField && (oExistingField.name === oField.name);
            })[0];
        };

        var aChanges = [];
        var aProcessedArray = aExistingArray.slice(0);

        aResults.forEach(function (oResult) {
            // Begin --> hack for handling result returned by diff
            if (oResult.type === "delete" && aProcessedArray[oResult.index] === undefined) {
                aProcessedArray.splice(oResult.index, 1);
                return;
            }

            var oProp, oExistingProp, iLength;
            if (oResult.type === "insert") {
                oExistingProp = fMatch(aChangedArray[oResult.index], aProcessedArray);
                if (oExistingProp) {
                    oExistingProp.index = aProcessedArray.indexOf(oExistingProp);
                    aProcessedArray.splice(oExistingProp.index, 1, undefined);
                    aChanges = aChanges.concat(this._createAddRemoveChange(oControl, sRemoveOperation, FlexUtil._getChangeContent(oExistingProp, aDeltaAttributes), sGenerator));
                }
            }
            // End hack
            oProp = oResult.type === "delete" ? aProcessedArray[oResult.index] : aChangedArray[oResult.index];
            oProp.index = oResult.index;
            if (oResult.type === "delete") {
                aProcessedArray.splice(oProp.index, 1);
            } else {
                aProcessedArray.splice(oProp.index, 0, oProp);
            }
            // Move operation shows up as insert followed by delete OR delete followed by insert
            if (sMoveOperation) {
                iLength = aChanges.length;
                // Get the last added change
                if (iLength) {
                    oExistingProp = aChanges[iLength - 1];
                    oExistingProp = oExistingProp ? oExistingProp.changeSpecificData.content : undefined;
                }
                // Matching property exists with a different index --> then this is a move operation
                if (oExistingProp && oExistingProp.name === oProp.name && oResult.index != oExistingProp.index) {
                    // remove the last insert/delete operation
                    aChanges.pop();
                    aChanges = aChanges.concat(this._createMoveChange(oExistingProp.id, oExistingProp.name, oResult.index, sMoveOperation, oControl, sMoveOperation !== "moveSort", sGenerator));
                    return;
                }
            }

            aChanges = aChanges.concat(this._createAddRemoveChange(oControl, oResult.type === "delete" ? sRemoveOperation : sInsertOperation, FlexUtil._getChangeContent(oProp, aDeltaAttributes), sGenerator));

        }.bind(this));
        return aChanges;
    };

    BaseController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent){
        var oAddRemoveChange = {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sOperation,
                content: oContent
            }
        };
        return oAddRemoveChange;
    };

    BaseController.prototype._createMoveChange = function(sId, sPropertyName, iNewIndex, sMoveOperation, oControl, bPersistId){
        var oMoveChange =  {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sMoveOperation,
                content: {
                    id: sId,
                    name: sPropertyName,
                    index: iNewIndex
                }
            }
        };

        if (!bPersistId) {
            delete oMoveChange.changeSpecificData.content.id;
        }

        return oMoveChange;
    };

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
     * @returns {object} The personalization model data
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
        return this._oPanel ? this._oPanel.getP13nData() : this._oAdaptationModel.getProperty("/items");
    };

    BaseController.prototype.model2State = false;

    /**
     * Can be used to trigger update after UI interactions such as "Ok" and "Reset"
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The property helper instance
     */
    BaseController.prototype.update = function(oPropertyHelper) {
        if (this._oPanel) {
            var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
            this._oPanel.setP13nData(oAdaptationData.items);
        } else if (this._oAdaptationModel){
            //'setData' causes unnecessary rerendering in some cases
            var oP13nData = this.mixInfoAndState(oPropertyHelper);
            this._oAdaptationModel.setProperty("/items", oP13nData.items);
            this._oAdaptationModel.setProperty("/itemsGrouped", oP13nData.itemsGrouped);
        }
    };

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
     *
     * Getter for the personalization model
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The property helper instance
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

    BaseController.prototype.changesToState = function(aChanges) {

        var aState = [];

        aChanges.forEach(function(oChange){
            var oStateDiffContent = merge({}, oChange.changeSpecificData.content);
            var iIndex = oStateDiffContent.index;
            delete oStateDiffContent.index;

            //set the position attribute in case to an explicit move
            if (oChange.changeSpecificData.changeType === this.getChangeOperations()["move"]) {
                oStateDiffContent.position = iIndex;
            }

            //set the presence attribute to false in case of an explicit remove
            if (oChange.changeSpecificData.changeType === this.getChangeOperations()["remove"]) {
                oStateDiffContent[this._getPresenceAttribute()] = false;
            }

            aState.push(oStateDiffContent);
        }.bind(this));

        return aState;
    };

    BaseController.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
        this._oAdaptationControl = null;
        this._bLiveMode = null;
        this._oPanel = null;
        this._bResetEnabled = null;
        this._oAdaptationModel = null;
    };

	return BaseController;

});
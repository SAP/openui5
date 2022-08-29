/*!
 * ${copyright}
 */

sap.ui.define([
    'sap/base/util/array/diff',
    'sap/ui/base/Object',
    'sap/base/util/merge',
    'sap/base/util/deepEqual',
    'sap/m/p13n/SelectionPanel',
    'sap/m/p13n/modules/xConfigAPI',
    'sap/ui/core/Configuration'
], function (diff, BaseObject, merge, deepEqual, SelectionPanel, xConfigAPI, Configuration) {
	"use strict";

    /**
	 * Constructor for a new <code>SelectionController</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
     * @param {sap.ui.core.Control} mSettings.control The control instance to be personalized by this controller
     * @param {string} mSettings.targetAggregation The name of the personalized aggregation
	 *
	 * @class
	 * The <code>SelectionController</code> serves as base class to create control specific personalization implementations.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental Since 1.104. Please note that the API of this control is not yet finalized!
	 * @alias sap.m.p13n.SelectionController
	 */
	var SelectionController = BaseObject.extend("sap.m.p13n.SelectionController",{
        constructor: function(mSettings) {
            BaseObject.call(this);

            this._oAdaptationControl = mSettings.control;

            if (!this._oAdaptationControl) {
                throw new Error("Always provide atleast a 'control' configuration when creating a new p13n controller!");
            }

            this._sTargetAggregation = mSettings.targetAggregation;
            this._fSelector = mSettings.selector;

            this._oP13nData = null;
            this._bLiveMode = false;
            this._bResetEnabled = false;
            this._bReorderingEnabled = mSettings.hasOwnProperty("enableReorder") ? mSettings.enableReorder : true;

        }
    });

    /**
     * The control that is being personalized via this controller.
     *
     * @returns {sap.ui.mdc.Control} The control which is being adapted.
     */
    SelectionController.prototype.getAdaptationControl = function(){
        return this._oAdaptationControl;
    };

    SelectionController.prototype.getTargetAggregation = function(){
        return this._sTargetAggregation;
    };


    /**
     * Defines the available ChangeTypes (should be in sync with 'getDelta').
     *
     * @returns {object} A map of legal change types.
     */
    SelectionController.prototype.getChangeOperations = function() {
        return {
            add: "addItem",
            remove: "removeItem",
            move: "moveItem"
        };
    };

     /**
     * Defines which control(s) are considered for the reset.
     *
     * @returns {sap.ui.core.Control|sap.ui.core.Control[]}
     */
    SelectionController.prototype.getSelectorForReset = function() {
        return this._oAdaptationControl;
    };

    SelectionController.prototype.sanityCheck = function(oState) {
        return oState;
    };

    /**
     * The actual UI used for personalization.
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The property helper instance
     * @returns {sap.ui.core.Control|string|Promise} The control which is going to be used in the p13n container.
     */
    SelectionController.prototype.initAdaptationUI = function(oPropertyHelper){
        var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        this._oPanel = this.createUI(oAdaptationData);
        return Promise.resolve(this._oPanel);
    };

    SelectionController.prototype.createUI = function(oAdaptationData) {
        var oSelectionPanel = new SelectionPanel({
            showHeader: true,
            enableCount: true
        });
        oSelectionPanel.setEnableReorder(this._bReorderingEnabled);
        return oSelectionPanel.setP13nData(oAdaptationData.items);
    };

    SelectionController.prototype.getCurrentState = function(){
        var aState = [], aAggregationItems = this.getAdaptationControl().getAggregation(this.getTargetAggregation()) || [];
        aAggregationItems.forEach(function(oItem, iIndex) {
            var bRelevant = this._fSelector ? this._fSelector({key: oItem.getId()}) : oItem.getVisible();
            if (bRelevant) {
                aState.push({
                    key: oItem.getId()
                });
            }
		}.bind(this));

        var oXConfig = xConfigAPI.readConfig(this.getAdaptationControl()) || {};
        var oItemXConfig = oXConfig.hasOwnProperty("aggregations") ? oXConfig.aggregations[this._sTargetAggregation] : {};

        for (var sKey in oItemXConfig) {
            var aStateKeys = aState.map(function(o){return o.key;});
            var iCurrentIndex = aStateKeys.indexOf(sKey);
            var iNewIndex = oItemXConfig[sKey].position;
            var bVisible = oItemXConfig[sKey].visible !== false;
            var bReordered = iNewIndex !== undefined;

            if (bVisible && iCurrentIndex === -1) {
                aState.push({
                    key: sKey
                });
            }

            if (bVisible && bReordered && aState.length > 0) {
                var oItem = aState.splice(iCurrentIndex, 1)[0];
                aState.splice(iNewIndex, 0, oItem);
                iCurrentIndex = iNewIndex;
            }
            if (oItemXConfig[sKey].visible === false && iCurrentIndex > -1) {
                aState.splice(iCurrentIndex, 1);
            }


        }
        return aState;
    };

	SelectionController.prototype.getStateKey = function(){
		return "items";
	};

    SelectionController.prototype.getDelta = function(mPropertyBag) {
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
    SelectionController.prototype.getArrayDeltaChanges = function (mDeltaInfo) {

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
                return oExistingField && (oExistingField.key === oField.key);
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
                    aChanges = aChanges.concat(this._createAddRemoveChange(oControl, sRemoveOperation, this._getChangeContent(oExistingProp, aDeltaAttributes), sGenerator));
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
                if (oExistingProp && oExistingProp.key === oProp.key && oResult.index != oExistingProp.index) {
                    // remove the last insert/delete operation
                    aChanges.pop();
                    aChanges = aChanges.concat(this._createMoveChange(oExistingProp.id, oExistingProp.key, oResult.index, sMoveOperation, oControl, sMoveOperation !== "moveSort", sGenerator));
                    return;
                }
            }

            aChanges = aChanges.concat(this._createAddRemoveChange(oControl, oResult.type === "delete" ? sRemoveOperation : sInsertOperation, this._getChangeContent(oProp, aDeltaAttributes), sGenerator));

        }.bind(this));
        return aChanges;
    };

     /**
     * Method which reduces a propertyinfo map to changecontent relevant attributes.
     * <b>Note:</b> This method determines the attributes stored in the changeContent.
     *
     * @param {object} oProperty Object containing all values prior to change creation
     * @param {array} aDeltaAttributes Array containing all attributes that are necessary for the delta calculation
     *
     * @returns {object} Object containing reduced content
     */
    SelectionController.prototype._getChangeContent = function (oProperty, aDeltaAttributes) {

        var oChangeContent = {};

        // Index
        if (oProperty.index >= 0) {
            oChangeContent.index = oProperty.index;
        }

        aDeltaAttributes.forEach(function(sAttribute) {
            if (oProperty.hasOwnProperty(sAttribute)){
                oChangeContent[sAttribute] = oProperty[sAttribute];
            }
        });

        return oChangeContent;
    };

    SelectionController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent){
        var oAddRemoveChange = {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sOperation,
                content: {
                    key: oContent.key,
                    targetAggregation: this.getTargetAggregation(),
                    index: oContent.index,
                    value: sOperation === this.getChangeOperations()["add"]
                }
            }
        };
        return oAddRemoveChange;
    };

    SelectionController.prototype._createMoveChange = function(sId, sPropertykey, iNewIndex, sMoveOperation, oControl, bPersistId){
        var oMoveChange =  {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sMoveOperation,
                content: {
                    key: sPropertykey,
                    targetAggregation: this.getTargetAggregation(),
                    index: iNewIndex
                }
            }
        };
        return oMoveChange;
    };
    SelectionController.prototype._getPresenceAttribute = function(bexternalAppliance){
        return "visible";
    };

    /**
     * Allows calculations prior to applying a set of changes.
     * This can be used to mix additional changes to auto-created changes.
     *
     * @returns {Promise} A Promise that should resolve with an array of additional changes.
     */
    SelectionController.prototype.getBeforeApply = function(){
        return Promise.resolve();
    };

    /**
     * Initialized the inner model for the Personalization.
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The propertyhelper that should be utilized for property determination.
     * @returns {object} The personalization model data
     */
    SelectionController.prototype.mixInfoAndState = function(oPropertyHelper) {

        var aItemState = this.getCurrentState();
        var mItemState = this.arrayToMap(aItemState);

        var oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){
            var oExisting = mItemState[oProperty.key];
            mItem.visible = this._fSelector ? this._fSelector(oProperty) : (!!oExisting);
            mItem.position =  oExisting ? oExisting.position : -1;
            return !(oProperty.visible === false);
        }.bind(this));

        this.sortP13nData({
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
    SelectionController.prototype.getP13nData = function() {
        return this._oPanel ? this._oPanel.getP13nData() : this._oAdaptationModel.getProperty("/items");
    };

    SelectionController.prototype.model2State = false;

    /**
     * Can be used to trigger update after UI interactions such as "Ok" and "Reset"
     *
     * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The property helper instance
     */
    SelectionController.prototype.update = function(oPropertyHelper) {
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

    SelectionController.prototype._getFilledArray = function(aPreviousItems, aNewItems, sRemoveProperty) {
		var aNewItemsPrepared = merge([], aPreviousItems);
		var aNewItemState = merge([], aNewItems);

		var mExistingItems = this.arrayToMap(aPreviousItems);

		aNewItemState.forEach(function (oItem) {
			var oExistingItem = mExistingItems[oItem.key];
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

    SelectionController.prototype.changesToState = function(aChanges) {

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

    SelectionController.prototype.prepareAdaptationData = function(oPropertyHelper, fnEnhace, bGroupData) {

        var aItems = [];
        var mItemsGrouped = bGroupData ? {} : null;

        var bEnhance = fnEnhace instanceof Function;

        oPropertyHelper.getProperties().forEach(function(oProperty) {

            var mItem = {};

            if (bEnhance) {
                var bIsValid = fnEnhace(mItem, oProperty);
                if (!bIsValid) {
                    return;
                }
            }

            mItem.key = oProperty.key;
            mItem.name = oProperty.key;
            mItem.label = oProperty.label || oProperty.key;
            mItem.tooltip = oProperty.tooltip;

            if (mItemsGrouped) {
                mItem.group = oProperty.group ? oProperty.group : "BASIC";
                mItem.groupLabel = oProperty.groupLabel;
                mItemsGrouped[mItem.group] = mItemsGrouped[mItem.group] ? mItemsGrouped[mItem.group] : [];
                mItemsGrouped[mItem.group].push(mItem);
            }

            aItems.push(mItem);

        });

        var oAdaptationData = {
            items: aItems
        };

        if (mItemsGrouped) {
            oAdaptationData.itemsGrouped = this._buildGroupStructure(mItemsGrouped);
        }

        return oAdaptationData;

    };

    //TODO: generify
    SelectionController.prototype.sortP13nData = function (oSorting, aItems) {

        var mP13nTypeSorting = oSorting;

        var sPositionAttribute = mP13nTypeSorting.position;
        var sSelectedAttribute = mP13nTypeSorting.visible;

        var sLocale = Configuration.getLocale().toString();

        var oCollator = window.Intl.Collator(sLocale, {});

        // group selected / unselected --> sort alphabetically in each group
        aItems.sort(function (mField1, mField2) {
            if (mField1[sSelectedAttribute] && mField2[sSelectedAttribute]) {
                return (mField1[sPositionAttribute] || 0) - (mField2[sPositionAttribute] || 0);
            } else if (mField1[sSelectedAttribute]) {
                return -1;
            } else if (mField2[sSelectedAttribute]) {
                return 1;
            } else if (!mField1[sSelectedAttribute] && !mField2[sSelectedAttribute]) {
                return oCollator.compare(mField1.label, mField2.label);
            }
        });
    };

    SelectionController.prototype.arrayToMap = function(aArray) {
        return aArray.reduce(function(mMap, oProp, iIndex){
            mMap[oProp.key] = oProp;
            mMap[oProp.key].position = iIndex;
            return mMap;
        }, {});
    };

    SelectionController.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
        this._oAdaptationControl = null;
        this._bLiveMode = null;
        this._oPanel = null;
        this._bResetEnabled = null;
        this._oAdaptationModel = null;
    };

	return SelectionController;

});
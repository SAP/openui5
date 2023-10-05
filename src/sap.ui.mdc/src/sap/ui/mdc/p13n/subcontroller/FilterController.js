/*!
 * ${copyright}
 */

sap.ui.define([
    'sap/ui/mdc/enums/ProcessingStrategy',
    'sap/ui/mdc/condition/FilterOperatorUtil',
    './SelectionController',
    'sap/ui/mdc/p13n/P13nBuilder',
    'sap/base/Log',
    'sap/base/util/merge',
    'sap/base/util/deepEqual',
    "sap/ui/core/Lib"
], function(ProcessingStrategy, FilterOperatorUtil, BaseController, P13nBuilder, Log, merge, deepEqual, Lib) {
	"use strict";

    const FilterController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.FilterController", {
        constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
    });

    FilterController.prototype.getStateKey = function() {
        return "filter";
    };

    FilterController.prototype.getUISettings = function() {
        return {
            title: Lib.getResourceBundleFor("sap.ui.mdc").getText("filter.PERSONALIZATION_DIALOG_TITLE"),
            tabText: Lib.getResourceBundleFor("sap.ui.mdc").getText("p13nDialog.TAB_Filter"),
            afterClose: function(oEvt) {
                const oDialog = oEvt.getSource();
                if (oDialog) {
                    const oDialogContent = oDialog.getContent()[0];
                    if (oDialogContent.isA("sap.m.p13n.Container")) {
                        oDialogContent.removeView("Filter");
                    } else {
                        oDialog.removeAllContent();
                    }
                }

                oDialog.destroy();
            }
        };
    };

    FilterController.prototype.getCurrentState = function(){
        return this.getAdaptationControl().getCurrentState()[this.getStateKey()];
    };

    FilterController.prototype.getChangeOperations = function() {
        return {
            add: "addCondition",
            remove: "removeCondition"
        };
    };

    FilterController.prototype.getBeforeApply = function() {
        const oAdaptationFilterBar = this.getAdaptationControl().getInbuiltFilter();
        const pConditionPromise = oAdaptationFilterBar ? oAdaptationFilterBar.createConditionChanges() : Promise.resolve([]);
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
        for (const sFieldPath in mConditions) {
            const aConditions = mConditions[sFieldPath];
            for (let i = 0; i < aConditions.length; i++) {
                const oCondition = aConditions[i];
                const sOperator = oCondition.operator;
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

    FilterController.prototype._getPresenceAttribute = function(bexternalAppliance){
        return "active";
    };

    FilterController.prototype.initAdaptationUI = function (oPropertyHelper, oWrapper) {
        const oAdaptationData = this.mixInfoAndState(oPropertyHelper);

        return this.getAdaptationControl().retrieveInbuiltFilter().then(function(oAdaptationFilterBar){
            oAdaptationFilterBar.setP13nData(oAdaptationData);
            oAdaptationFilterBar.setLiveMode(false);
            oAdaptationFilterBar.setProperty("_useFixedWidth", false);
            oAdaptationFilterBar.getTitle = function() {
                return Lib.getResourceBundleFor("sap.ui.mdc").getText("filter.PERSONALIZATION_DIALOG_TITLE");
            };
            this._oAdaptationFB = oAdaptationFilterBar;
            return oAdaptationFilterBar.createFilterFields().then(function(){
                this._oPanel = oAdaptationFilterBar;
                return oAdaptationFilterBar;
            }.bind(this));
        }.bind(this));
    };

    FilterController.prototype.update = function(oPropertyHelper){
        if (this._oPanel) {
            const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
            this._oPanel.setP13nData(oAdaptationData);
            const oAdaptationControl = this.getAdaptationControl();
            const oInbuiltFilter = oAdaptationControl && oAdaptationControl.getInbuiltFilter();
            if (oInbuiltFilter) {
                oInbuiltFilter.createFilterFields();
            }
        }

    };

    FilterController.prototype.getDelta = function(mPropertyBag) {
        if (mPropertyBag.applyAbsolute === ProcessingStrategy.FullReplace) {
            Object.keys(mPropertyBag.existingState).forEach(function(sKey){
                if (!mPropertyBag.changedState.hasOwnProperty(sKey)) {
                    mPropertyBag.changedState[sKey] = [];
                }
            });
        }
        return getConditionDeltaChanges(mPropertyBag);
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
    * @param {boolean} mDeltaInfo.applyAbsolute Indicates whether the appliance should also implicitly remove entries in case they are not provided in the new state
    * @param {string} mDeltaInfo.changeOperations.remove Name of the control specific 'remove' changehandler
    * @param {string} [mDeltaInfo.changeOperations.move] Name of the control specific 'move' changehandler
    * @param {string} [mDeltaInfo.generator] Name of the change generator (E.g. the namespace of the UI creating the change object)
    *
    * @returns {array} Array containing the delta based created changes
    */
    const getConditionDeltaChanges = function(mDeltaInfo) {
        let aConditionChanges = [];

        const mNewConditionState = mDeltaInfo.changedState;
        const mPreviousConditionState = mDeltaInfo.existingState;
        const oAdaptationControl = mDeltaInfo.control;
        const bAbsoluteAppliance = mDeltaInfo.hasOwnProperty("applyAbsolute") ? mDeltaInfo.applyAbsolute : true;
        const aPropertyInfo = mDeltaInfo.propertyInfo;

        for (const sFieldPath in mNewConditionState) {
            const bValidProperty = _hasProperty(aPropertyInfo, sFieldPath);
            if (!bValidProperty && oAdaptationControl.isA("sap.ui.mdc.Control") && oAdaptationControl.isPropertyHelperFinal()) {
                Log.warning("property '" + sFieldPath + "' not supported");
                continue;
            }

            const aFilterConditionChanges = _diffConditionPath(sFieldPath, mNewConditionState[sFieldPath], mPreviousConditionState[sFieldPath], oAdaptationControl, bAbsoluteAppliance);
            aConditionChanges = aConditionChanges.concat(aFilterConditionChanges);
        }

        return aConditionChanges;
    };

    const _hasProperty = function(aPropertyInfo, sName) {
        return aPropertyInfo.some(function(oProperty){
            //First check unique name
            let bValid = oProperty.name === sName || sName == "$search";

            //Use path as Fallback
            bValid = bValid ? bValid : oProperty.path === sName;

            return bValid;
        });
    };

    const createConditionChange = function(sChangeType, oControl, sFieldPath, oCondition) {
        delete oCondition.filtered;
        const oConditionChange = {
            selectorElement: oControl,
            changeSpecificData: {
                changeType: sChangeType,
                content: {
                    name: sFieldPath,
                    condition: oCondition
                }
            }
        };

        return oConditionChange;
    };

    /**
    * Generates a set of changes based on the given conditions
    *
    * @public
    * @param {array} sFieldPath The relevant fieldPath
    * @param {array} aConditions The conditions after they have been changed
    * @param {function} aOrigShadowConditions The conditions before they have been changed
    * @param {object} oControl Control instance which is being used to generate the changes
    * @param {boolean} [bAbsoluteAppliance] Indicates whether the appliance should also implicitly remove entries in case they are not provided in the new state
    *
    * @returns {array} Array containing the delta based created changes
    */
    const _diffConditionPath = function(sFieldPath, aConditions, aOrigShadowConditions, oControl, bAbsoluteAppliance){
        let oChange;
        const aChanges = [];
        const aOrigConditions = merge([], aConditions);
        const aShadowConditions = aOrigShadowConditions ? merge([], aOrigShadowConditions) : [];


        if (deepEqual(aConditions, aShadowConditions)) {
            return aChanges;
        }

        const fnRemoveSameConditions = function(aConditions, aShadowConditions){
            let bRunAgain;

            do  {
                bRunAgain = false;

                for (let i = 0; i < aConditions.length; i++) {

                    const oNewCondition = aConditions[i];
                    const nConditionIdx = FilterOperatorUtil.indexOfCondition(oNewCondition, aShadowConditions);
                    if (nConditionIdx > -1) {

                        aConditions.splice(i, 1);

                        if (bAbsoluteAppliance) {
                            aShadowConditions.splice(nConditionIdx, 1);
                        }

                        bRunAgain = true;
                        break;
                    }
                }
            }  while (bRunAgain);
        };

        fnRemoveSameConditions(aConditions, aShadowConditions);

        if ((aConditions.length > 0) || (aShadowConditions.length > 0)) {

            aShadowConditions.forEach(function(oCondition) {
                //In case of absolute appliance always remove, in case of explicit appliance only remove if explicitly given in the new state via filtered=false
                const iNewCondition = FilterOperatorUtil.indexOfCondition(oCondition, aOrigConditions);
                const bNewConditionExplicitlyRemoved = iNewCondition > -1 && aOrigConditions[iNewCondition].filtered === false;
                if (bAbsoluteAppliance || bNewConditionExplicitlyRemoved) {
                    oChange = createConditionChange("removeCondition", oControl, sFieldPath, oCondition);
                    aChanges.push(oChange);
                }
            });

            aConditions.forEach(function(oCondition) {
                if (bAbsoluteAppliance || (!oCondition.hasOwnProperty("filtered") || oCondition.filtered !== false)) {
                    oChange = createConditionChange("addCondition", oControl, sFieldPath, oCondition);
                    aChanges.push(oChange);
                }
            });

        }

        return aChanges;
    };



    FilterController.prototype.model2State = function() {
        const oItems = {},
            oFilter = this.getCurrentState();
            this.getP13nData().items.forEach(function(oItem) {
            if (oItem.active && Object.keys(oFilter).includes(oItem.name)) {
                oItems[oItem.name] = oFilter[oItem.name];
            }
        });

        return oItems;
    };

    FilterController.prototype.mixInfoAndState = function(oPropertyHelper) {

        const mExistingFilters = this.getCurrentState() || {};

        const oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){

            const aExistingFilters = mExistingFilters[mItem.name];
            mItem.active = aExistingFilters && aExistingFilters.length > 0 ? true : false;

            return !(oProperty.filterable === false);
        });

        P13nBuilder.sortP13nData({
            visible: "active",
            position: undefined
        }, oP13nData.items);

        return oP13nData;
    };

    FilterController.prototype.changesToState = function(aChanges, mOld, mNew) {

        const mStateDiff = {};

        aChanges.forEach(function(oChange){
            const oStateDiffContent = merge({}, oChange.changeSpecificData.content);
            const sName = oStateDiffContent.name;

            if (!mStateDiff[sName]) {
                mStateDiff[sName] = [];
            }

            //set the presence attribute to false in case of an explicit remove
            if (oChange.changeSpecificData.changeType === this.getChangeOperations()["remove"]) {
                oStateDiffContent.condition.filtered = false;
            }
            mStateDiff[sName].push(oStateDiffContent.condition);
        }.bind(this));

        return mStateDiff;
    };

	return FilterController;

});

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/p13n/FilterController",
	"sap/ui/core/Lib",
	'sap/ui/mdc/enums/ProcessingStrategy',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/base/Log',
	'sap/base/util/merge',
	'sap/base/util/deepEqual'
], (BaseFilterController, Library, ProcessingStrategy, FilterOperatorUtil, Log, merge) => {
	"use strict";

	const FilterController = BaseFilterController.extend("sap.ui.mdc.p13n.subcontroller.FilterController");

	FilterController.prototype.getStateKey = function() {
		return "filter";
	};

	FilterController.prototype.getUISettings = function() {
		return {
			title: Library.getResourceBundleFor("sap.ui.mdc").getText("filter.PERSONALIZATION_DIALOG_TITLE"),
			tabText: Library.getResourceBundleFor("sap.ui.mdc").getText("p13nDialog.TAB_Filter"),
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

	FilterController.prototype.getCurrentState = function() {
		return this.getAdaptationControl().getCurrentState()[this.getStateKey()];
	};

	FilterController.prototype.getSelectorForReset = function () {
		const oAdaptationControl = this.getAdaptationControl(), oInbuiltFilter = oAdaptationControl.getInbuiltFilter();
		let selectors = [oAdaptationControl];
		if (oInbuiltFilter) {
			selectors = selectors.concat(oInbuiltFilter);
		}
		return selectors;
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

	FilterController.prototype._indexOfCondition = function(oCondition, aConditions) {
		return FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
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

	FilterController.prototype.initAdaptationUI = function(oPropertyHelper, oWrapper) {
		const oAdaptationData = this.mixInfoAndState(oPropertyHelper);

		return this.getAdaptationControl().retrieveInbuiltFilter().then((oAdaptationFilterBar) => {
			oAdaptationFilterBar.setP13nData(oAdaptationData);
			oAdaptationFilterBar.setLiveMode(false);
			oAdaptationFilterBar.setProperty("_useFixedWidth", false);
			oAdaptationFilterBar.getTitle = function() {
				return Library.getResourceBundleFor("sap.ui.mdc").getText("filter.PERSONALIZATION_DIALOG_TITLE");
			};
			this._oAdaptationFB = oAdaptationFilterBar;
			return oAdaptationFilterBar.createFilterFields().then(() => {
				this._oPanel = oAdaptationFilterBar;
				return oAdaptationFilterBar;
			});
		});
	};

	FilterController.prototype.update = function(oPropertyHelper) {
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
		return this.getConditionDeltaChanges(mPropertyBag);
	};

	FilterController.prototype._createConditionChangeContent = function(sFieldPath, oCondition) {
		return {
			name: sFieldPath,
			condition: oCondition
		};
	};

	FilterController.prototype.model2State = function() {
		const oItems = {},
			oFilter = this.getCurrentState();
		this.getP13nData().items.forEach((oItem) => {
			if (oItem.active && Object.keys(oFilter).includes(oItem.name)) {
				oItems[oItem.name] = oFilter[oItem.name];
			}
		});

		return oItems;
	};

	FilterController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const mExistingFilters = this.getCurrentState() || {};

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {

			const aExistingFilters = mExistingFilters[mItem.name];
			mItem.active = aExistingFilters && aExistingFilters.length > 0 ? true : false;

			return !(oProperty.filterable === false);
		});

		this.sortP13nData({
			visible: "active",
			position: undefined
		}, oP13nData.items);

		return oP13nData;
	};

	FilterController.prototype.changesToState = function(aChanges, mOld, mNew) {

		const mStateDiff = {};

		aChanges.forEach((oChange) => {
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
		});

		return mStateDiff;
	};

	return FilterController;

});
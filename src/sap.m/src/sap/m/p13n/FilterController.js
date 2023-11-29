	/*!
 * ${copyright}
 */

sap.ui.define([
	'./SelectionController',
	'sap/m/p13n/modules/xConfigAPI',
	'sap/base/Log',
	'sap/base/util/merge',
	'sap/base/util/deepEqual'
], function (BaseController, xConfigAPI, Log, merge, deepEqual) {
	"use strict";

	/**
	 * Personalization <code>FilterState</code> object type. This object describes the state processed by this controller when accessing it through the {@link sap.m.p13n.Engine Engine}.
	 *
	 * @public
	 * @typedef {object} sap.m.p13n.FilterState
	 * @property {{string, sap.m.p13n.FilterStateItem[]}} filterState The filter state items for a provided key
	 *
	 */

	/**
	 * Personalization <code>FilterStateItem</code> object type. This object describes a single filter condition.
	 *
	 * @public
	 * @typedef {object} sap.m.p13n.FilterStateItem
	 * @property {string} operator The operator of the condition
	 * @property {string[]} values The values of the condition
	 *
	 */

	/**
	 * Constructor for a new <code>FilterController</code>.
	 *
	 * @param {object} mSettings Initial settings for the new controller
	 * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this controller
	 * @param {Function} [mSettings.itemFactory] A factory function that will be called whenever the user selects a new entry from the <code>ComboBox</code>.
	 * The factory must return a single control instance of an input based control to provide custom filter capabilities.
	 * This control is then going to be added in the layout provided by the <code>FilterPanel</code>.
	 * <b>Note:</b>: The Panel will not handle the lifecylce of the provided factory control instance, in case the row is going to be
	 * removed, the according consumer needs to decide about destroying or keeping the control instance. In addition, the <code>getIdForLabel</code>
	 * method can be used to return a focusable children control to provide the <code>labelFor</code> reference.
	 *
	 * @class
	 * The <code>FilterController</code> entity serves as a base class to create personalization implementations that are specific to filtering.
	 *
	 * @extends sap.m.p13n.SelectionController
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.121
	 * @public
	 * @alias sap.m.p13n.FilterController
	 */
	const FilterController = BaseController.extend("sap.m.p13n.FilterController", {
		constructor: function(mSettings) {
			BaseController.apply(this, arguments);
			this._itemFactory = mSettings?.itemFactory;
			this._bResetEnabled = true;
		}
	});

	FilterController.prototype.getCurrentState = function(){
		const oXConfig = xConfigAPI.readConfig(this.getAdaptationControl()) || {};
		const aConditions = oXConfig.hasOwnProperty("properties") ? oXConfig.properties.filterConditions : [];

		return aConditions?.reduce((mConditions, oState) => {
			const sKey = oState.key;
			mConditions[sKey] = mConditions[sKey] || [];
			mConditions[sKey].push(oState.condition);
			return mConditions;
		}, {}) || {};
	};

	FilterController.prototype.getChangeOperations = function() {
		return {
			add: "addCondition",
			remove: "removeCondition"
		};
	};

	FilterController.prototype._getPresenceAttribute = function(bexternalAppliance){
		return "active";
	};

	FilterController.prototype.initAdaptationUI = function (oPropertyHelper, oWrapper) {

		 return new Promise(function(resolve, reject){
			sap.ui.require(["sap/m/p13n/FilterPanel", "sap/m/Input"], function(FilterPanel, Input){

				const oAdaptationData = this.mixInfoAndState(oPropertyHelper);

				const oFilterPanel = new FilterPanel({
					enableReorder: false,
					itemFactory: (oItem) => {
						return this._itemFactory instanceof Function ? this._itemFactory(oItem, oFilterPanel) : new Input({
							value: "{$p13n>conditions/0/values/0}"
						});
					}
				});

				oFilterPanel.setP13nData(oAdaptationData.items);
				this._oPanel = oFilterPanel;

				resolve(oFilterPanel);
			}.bind(this));
		}.bind(this));

	};

	const _hasProperty = function(aPropertyInfo, sName) {
		return aPropertyInfo.some(function(oProperty){
			//First check unique name
			let bValid = oProperty.key === sName || oProperty.name === sName || sName == "$search";

			//Use path as Fallback
			bValid = bValid ? bValid : oProperty.path === sName;

			return bValid;
		});
	};

	FilterController.prototype._indexOfCondition = function(oCondition, aConditions) {
		const oExisitingCondition = aConditions.find((oExisitingCondition) => oExisitingCondition.operator == oCondition.operator && oExisitingCondition.values[0] == oCondition.values[0]);
		return aConditions.indexOf(oExisitingCondition);
	};

	FilterController.prototype._createConditionChange = function(sChangeType, oControl, sFieldPath, oCondition) {
		delete oCondition.filtered; //Consider moving this to the delta calculation instead

		const oConditionChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sChangeType,
				content: this._createConditionChangeContent(sFieldPath, oCondition)
			}
		};

		return oConditionChange;
	};

	FilterController.prototype._createConditionChangeContent = function(sFieldPath, oCondition) {
		return {
			key: sFieldPath,
			condition: oCondition
		};
	};

	/**
	* Generates a set of changes based on the given conditions
	*
	* @param {array} sFieldPath The relevant fieldPath
	* @param {array} aConditions The conditions after they have been changed
	* @param {function} aOrigShadowConditions The conditions before they have been changed
	* @param {object} oControl Control instance which is being used to generate the changes
	* @param {boolean} [bAbsoluteAppliance] Indicates whether the appliance should also implicitly remove entries in case they are not provided in the new state
	*
	* @returns {array} Array containing the delta based created changes
	*/
	FilterController.prototype._diffConditionPath = function(sFieldPath, aConditions, aOrigShadowConditions, oControl, bAbsoluteAppliance){
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
					const nConditionIdx = this._indexOfCondition(oNewCondition, aShadowConditions);
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
		}.bind(this);

		fnRemoveSameConditions(aConditions, aShadowConditions);

		if ((aConditions.length > 0) || (aShadowConditions.length > 0)) {

			aShadowConditions.forEach((oCondition) => {
				//In case of absolute appliance always remove, in case of explicit appliance only remove if explicitly given in the new state via filtered=false
				const iNewCondition = this._indexOfCondition(oCondition, aOrigConditions);
				const bNewConditionExplicitlyRemoved = iNewCondition > -1 && aOrigConditions[iNewCondition].filtered === false;
				if (bAbsoluteAppliance || bNewConditionExplicitlyRemoved) {
					oChange = this._createConditionChange("removeCondition", oControl, sFieldPath, oCondition);
					aChanges.push(oChange);
				}
			});

			aConditions.forEach((oCondition) => {
				if (bAbsoluteAppliance || (!oCondition.hasOwnProperty("filtered") || oCondition.filtered !== false)) {
					oChange = this._createConditionChange("addCondition", oControl, sFieldPath, oCondition);
					aChanges.push(oChange);
				}
			});

		}

		return aChanges;
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
	* @param {boolean} mDeltaInfo.applyAbsolute Indicates whether the appliance should also implicitly remove entries in case they are not provided in the new state
	* @param {string} mDeltaInfo.changeOperations.remove Name of the control specific 'remove' changehandler
	* @param {string} [mDeltaInfo.changeOperations.move] Name of the control specific 'move' changehandler
	* @param {string} [mDeltaInfo.generator] Name of the change generator (E.g. the namespace of the UI creating the change object)
	*
	* @returns {array} Array containing the delta based created changes
	*/
	FilterController.prototype.getConditionDeltaChanges = function(mDeltaInfo) {
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

			const aFilterConditionChanges = this._diffConditionPath(sFieldPath, mNewConditionState[sFieldPath], mPreviousConditionState[sFieldPath], oAdaptationControl, bAbsoluteAppliance);
			aConditionChanges = aConditionChanges.concat(aFilterConditionChanges);
		}

		return aConditionChanges;
	};

	FilterController.prototype.getDelta = function(mPropertyBag) {
		const existingState = mPropertyBag.existingState;
		let changedState = mPropertyBag.changedState;

		if (deepEqual(existingState, changedState)) {
			return [];
		}

		changedState = changedState.reduce((mConditions, oState) => {
			const sKey = oState.key;
			mConditions[sKey] = mConditions[sKey] || [];
			oState.conditions.forEach(function(oConditionForKey){
				if (oConditionForKey && oConditionForKey.values && oConditionForKey.values[0] !== undefined) {
					mConditions[sKey].push(oConditionForKey);
				}
			});
			return mConditions;
		}, {});

		return this.getConditionDeltaChanges({...mPropertyBag, changedState});
	};


	FilterController.prototype._getChangeContent = function(oProperty, aDeltaAttributes) {
		const oChangeContent = {};

		aDeltaAttributes.forEach(function(sAttribute) {
			if (oProperty.hasOwnProperty(sAttribute)){
				oChangeContent[sAttribute] = oProperty[sAttribute];
			}
		});

		return oChangeContent;
	};

	FilterController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const mExistingFilters = this.getCurrentState() || {};

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, function(mItem, oProperty){

			const aExistingFilters = mExistingFilters[mItem.name];
			mItem.conditions = aExistingFilters || (this._itemFactory ? [] : [{operator: "Contains", values: []}]);
			mItem.active = aExistingFilters && aExistingFilters.length > 0;

			return !(oProperty.filterable === false);
		}.bind(this));

		this.sortP13nData({
			visible: "active",
			position: undefined
		}, oP13nData.items);

		return oP13nData;
	};

	return FilterController;

});

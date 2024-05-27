/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	'sap/base/util/array/diff',
	'sap/ui/base/Object',
	'sap/base/util/merge',
	'sap/base/util/deepEqual',
	'sap/m/p13n/SelectionPanel',
	'sap/m/p13n/modules/xConfigAPI',
	"sap/ui/core/Locale",
	"sap/ui/core/Lib",
	'sap/ui/core/mvc/View'
], (
	Localization,
	diff,
	BaseObject,
	merge,
	deepEqual,
	SelectionPanel,
	xConfigAPI,
	Locale,
	Library,
	View
) => {
	"use strict";

	/**
	 * Personalization <code>SelectionState</code> object type. This object describes the state processed by this controller when accessing it through the {@link sap.m.p13n.Engine Engine}.
	 *
	 * @public
	 * @typedef {object} sap.m.p13n.SelectionState
	 * @property {string} key The key for the group state
	 * @property {boolean} [visible] Defines whether the item is selected (if a selection state is provided, it's selected automatically)
	 * @property {int} [index] Describes the index of the selection item
	 *
	 */

	/**
	 * Constructor for a new <code>SelectionController</code>.
	 *
	 * @param {object} mSettings Initial settings for the new controller
	 * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this controller
	 * @param {function(sap.ui.core.Element):string} [mSettings.getKeyForItem] By default the SelectionController tries to identify the existing item through the
	 * key by checking if there is an existing item with this id. This behaviour can be overruled by implementing this method which will
	 * provide the according item of the <code>targetAggregation</code> to return the according key associated to this item.
	 * @param {string} mSettings.targetAggregation The name of the aggregation that is now managed by this controller
	 * @param {string} [mSettings.persistenceIdentifier] If multiple <code>SelectionController</code> controls exist for a personalization use case, the <code>persistenceIdentifier</code> property must be added to uniquely identify a <code>SelectionController</code> control
	 * @param {sap.m.p13n.MetadataHelper} [mSettings.helper] The <code>{@link sap.m.p13n.MetadataHelper MetadataHelper}</code> to provide metadata-specific information. It may be used to define more granular information for the selection of items.
	 *
	 * @class
	 * The <code>SelectionController</code> entity serves as a base class to create control-specific personalization implementations.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.m.p13n.SelectionController
	 */
	const SelectionController = BaseObject.extend("sap.m.p13n.SelectionController", {
		constructor: function(mSettings) {
			BaseObject.call(this);

			this._oAdaptationControl = mSettings.control;
			this._sPersistenceIdentifier = mSettings.persistenceIdentifier ? mSettings.persistenceIdentifier : null;
			this._oMetadataHelper = mSettings.helper ? mSettings.helper : null;

			/**
			 * The 'stableKeys' can be provided in the constructor to exclude the keys from the p13n UI, while still respecting them in the
			 * delta logic. For instance by ignoring the first column of a TreeTable in the p13n dialog while still not removing this column
			 * on closing the dialog.
			 */
			this._aStableKeys = mSettings.stableKeys || [];

			if (!this._oAdaptationControl) {
				throw new Error("Always provide atleast a 'control' configuration when creating a new p13n controller!");
			}

			this._sTargetAggregation = mSettings.targetAggregation;
			this._fSelector = mSettings.getKeyForItem;

			this._oP13nData = null;
			this._bLiveMode = false;
			this._bResetEnabled = false;
			this._bReorderingEnabled = mSettings.hasOwnProperty("enableReorder") ? mSettings.enableReorder : true;

		}
	});

	/**
	 * Gets defined <code>persistenceIdentifier</code> of the controller.
	 * @returns {string|null} String if <code>_sPersistenceIdentifier</code> is defined, otherwise null.
	 */
	SelectionController.prototype.getPersistenceIdentifier = function() {
		return this._sPersistenceIdentifier;
	};

	/**
	 * Gets defined {@link sap.m.p13n.MetadataHelper MetadataHelper} of the controller.
	 * @returns {sap.m.p13n.MetadataHelper|null} Instance of {@link sap.m.p13n.MetadataHelper} if defined, otherwise null.
	 */
	SelectionController.prototype.getMetadataHelper = function() {
		return this._oMetadataHelper;
	};

	/**
	 * The control that is being personalized via this controller.
	 *
	 * @returns {sap.ui.mdc.Control} The control which is being adapted.
	 */
	SelectionController.prototype.getAdaptationControl = function() {
		return this._oAdaptationControl;
	};

	SelectionController.prototype.getTargetAggregation = function() {
		return this._sTargetAggregation;
	};


	/**
	 * Defines the available ChangeTypes (should be in sync with 'getDelta').
	 *
	 * @returns {object} A map of legal change types.
	 */
	SelectionController.prototype.getChangeOperations = () => {
		return {
			add: "addItem",
			remove: "removeItem",
			move: "moveItem"
		};
	};

	/**
	 * Defines which control(s) are considered for the reset.
	 *
	 * @returns {sap.ui.core.Control | sap.ui.core.Control[]}
	 **/
	SelectionController.prototype.getSelectorForReset = function() {
		return this._oAdaptationControl;
	};

	SelectionController.prototype.sanityCheck = (oState) => {
		return oState;
	};

	/**
	 * The actual UI used for personalization.
	 *
	 * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The property helper instance
	 * @returns {sap.ui.core.Control|string|Promise} The control which is going to be used in the p13n container.
	 */
	SelectionController.prototype.initAdaptationUI = function(oPropertyHelper) {
		const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
		this._oPanel = this.createUI(oAdaptationData);
		return Promise.resolve(this._oPanel);
	};

	SelectionController.prototype.createUI = function(oAdaptationData) {
		const oSelectionPanel = new SelectionPanel({
			showHeader: true,
			enableCount: true
		});
		oSelectionPanel.setEnableReorder(this._bReorderingEnabled);
		return oSelectionPanel.setP13nData(oAdaptationData.items);
	};

	const getViewForControl = (oControl) => {
		if (oControl instanceof View) {
			return oControl;
		}

		if (oControl && typeof oControl.getParent === "function") {
			oControl = oControl.getParent();
			return getViewForControl(oControl);
		}
	};

	SelectionController.prototype.getCurrentState = function() {
		const aState = [],
			aAggregationItems = this.getAdaptationControl().getAggregation(this.getTargetAggregation()) || [];
		const oView = getViewForControl(this.getAdaptationControl());
		aAggregationItems.forEach((oItem, iIndex) => {
			const sId = oView ? oView.getLocalId(oItem.getId()) : oItem.getId();
			const vRelevant = this._fSelector ? this._fSelector(oItem) : oItem.getVisible();
			if (vRelevant) {
				aState.push({
					key: typeof vRelevant === "boolean" ? sId : vRelevant
				});
			}
		});

		const oXConfig = xConfigAPI.readConfig(this.getAdaptationControl()) || {};
		const oItemXConfig = oXConfig.hasOwnProperty("aggregations") ? oXConfig.aggregations[this._sTargetAggregation] : {};
		const aItemXConfig = [];
		if (oItemXConfig) {
			Object.entries(oItemXConfig).forEach(([sKey, oConfig]) => {
				aItemXConfig.push({key: sKey, position: oConfig.position, visible: oConfig.visible});
			});
			aItemXConfig.sort((a, b) => a.position - b.position);
		}
		aItemXConfig.sort((a,b) => a.position - b.position);

		aItemXConfig.forEach(({key}) => {
			const aStateKeys = aState.map((o) => {
				return o.key;
			});
			let iCurrentIndex = aStateKeys.indexOf(key);
			const iNewIndex = oItemXConfig[key].position;
			const bVisible = oItemXConfig[key].visible !== false;
			const bReordered = iNewIndex !== undefined;

			if (bVisible && iCurrentIndex === -1) {
				aState.push({
					key: key
				});
			}

			if (bVisible && bReordered && aState.length > 0) {
				const oItem = aState.splice(iCurrentIndex, 1)[0];
				aState.splice(iNewIndex, 0, oItem);
				iCurrentIndex = iNewIndex;
			}
			if (oItemXConfig[key].visible === false && iCurrentIndex > -1) {
				aState.splice(iCurrentIndex, 1);
			}

		});
		return aState;
	};

	SelectionController.prototype.getStateKey = () => {
		return "items";
	};

	SelectionController.prototype.getDelta = function(mPropertyBag) {
		const sPresenceAttribute = this._getPresenceAttribute(mPropertyBag.externalAppliance);

		const fnFilterUnselected = (oItem) => {
			return oItem.hasOwnProperty(sPresenceAttribute) && oItem[sPresenceAttribute] === false ? false : true;
		};
		const aNewStatePrepared = mPropertyBag.applyAbsolute ?
			mPropertyBag.changedState.filter(fnFilterUnselected) :
			this._getFilledArray(mPropertyBag.existingState, mPropertyBag.changedState, sPresenceAttribute).filter(fnFilterUnselected);

		this._aStableKeys.forEach((sKey, iIndex) => {
			const mExistingState = this.arrayToMap(this.getCurrentState());
			const mNewState = this.arrayToMap(aNewStatePrepared);
			const iStableIndex = mExistingState[sKey] || (iIndex - 1);

			if (!mNewState.hasOwnProperty(sKey)) {
				aNewStatePrepared.splice(iStableIndex, 0, mExistingState[sKey]);
			}
		});
		mPropertyBag.changedState = aNewStatePrepared;

		//Example: Dialog Ok --> don't trigger unnecessary flex change processing
		if (deepEqual(mPropertyBag.existingState, aNewStatePrepared)) {
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
	SelectionController.prototype.getArrayDeltaChanges = function(mDeltaInfo) {
		const aExistingArray = mDeltaInfo.existingState;
		const aChangedArray = mDeltaInfo.changedState;
		const oControl = mDeltaInfo.control;
		const sInsertOperation = mDeltaInfo.changeOperations.add;
		const sRemoveOperation = mDeltaInfo.changeOperations.remove;
		const sMoveOperation = mDeltaInfo.changeOperations.move;
		const aDeltaAttributes = mDeltaInfo.deltaAttributes || [];

		const mDeleteInsert = this._calculateDeleteInserts(aExistingArray, aChangedArray, aDeltaAttributes);
		let aChanges = this._createAddRemoveChanges(mDeleteInsert.deletes, oControl, sRemoveOperation, aDeltaAttributes);

		if (sMoveOperation) {
			const aExistingArrayWithoutDeletes = this._removeItems(aExistingArray, mDeleteInsert.deletes);
			const aChangedArrayWithoutInserts = this._removeItems(aChangedArray, mDeleteInsert.inserts);
			const aMoveChanges = this._createMoveChanges(aExistingArrayWithoutDeletes, aChangedArrayWithoutInserts, oControl, sMoveOperation, aDeltaAttributes);
			aChanges = aChanges.concat(aMoveChanges);
		}

		const aInsertChanges = this._createAddRemoveChanges(mDeleteInsert.inserts, oControl, sInsertOperation, aDeltaAttributes);
		aChanges = aChanges.concat(aInsertChanges);

		return aChanges;
	};

	SelectionController.prototype._createMoveChanges = function(aExistingItems, aChangedItems, oControl, sOperation, aDeltaAttributes) {
		let sKey;
		let nIndex;
		let oItem;
		const aChanges = [];

		if (aExistingItems.length === aChangedItems.length) {

			const fnSymbol = (o) => {
				let sDiff = "";
				aDeltaAttributes.forEach((sAttribute) => {
					sDiff = sDiff + o[sAttribute];
				});
				return sDiff;
			};

			const aDiff = diff(aExistingItems, aChangedItems, fnSymbol);
			const aDeleted = [];
			for (let i = 0; i < aDiff.length; i++) {
				if (aDiff[i].type === "delete") {
					oItem = aExistingItems[aDiff[i].index];
					aDeleted.push(oItem);
				} else if (aDiff[i].type === "insert") {
					sKey = aChangedItems[aDiff[i].index].key || aChangedItems[aDiff[i].index].name;

					nIndex = aDiff[i].index;
					// eslint-disable-next-line no-loop-func
					aDeleted.forEach((oItem) => {
						if (sKey != oItem.key) {
							const nDelIndex = this._indexOfByKeyName(aExistingItems, oItem.key || oItem.name);
							if (nDelIndex < aDiff[i].index) {
								nIndex++;
							}
						}
					});
					// eslint-enable-next-line no-loop-func
					aChanges.push(this._createMoveChange(sKey, Math.min(nIndex, aChangedItems.length), sOperation, oControl));
				}
			}
		}

		return aChanges;
	};

	SelectionController.prototype._createAddRemoveChanges = function(aItems, oControl, sOperation, aDeltaAttributes) {
		const aChanges = [];
		for (let i = 0; i < aItems.length; i++) {
			aChanges.push(this._createAddRemoveChange(oControl, sOperation, this._getChangeContent(aItems[i], aDeltaAttributes)));
		}
		return aChanges;
	};

	SelectionController.prototype._removeItems = function(aTarget, aItems) {
		let sKey;
		const aResultingTarget = [];

		for (let i = 0; i < aTarget.length; i++) {
			sKey = aTarget[i].key || aTarget[i].name;
			if (this._indexOfByKeyName(aItems, sKey) === -1) {
				aResultingTarget.push(aTarget[i]);
			}
		}

		return aResultingTarget;
	};

	SelectionController.prototype._indexOfByKeyName = (aArray, sKey) => {
		let nIndex = -1;
		aArray.some((oItem, nIdx) => {
			if ((oItem.key === sKey) || (oItem.name === sKey)) {
				nIndex = nIdx;
			}
			return (nIndex != -1);
		});

		return nIndex;
	};

	SelectionController.prototype._calculateDeleteInserts = function(aSource, aTarget, aDeltaAttributes) {
		let i, sKey, oItem, nIdx;
		const mDeleteInserts = {
			deletes: [],
			inserts: []
		};

		for (i = 0; i < aSource.length; i++) {
			sKey = aSource[i].key || aSource[i].name;
			nIdx = this._indexOfByKeyName(aTarget, sKey);
			if (nIdx === -1) {
				oItem = merge({}, aSource[i]);
				mDeleteInserts.deletes.push(oItem);
			} else if (aDeltaAttributes.length) {
				if (this._verifyDeltaAttributes(aSource[i], aTarget[nIdx], aDeltaAttributes)) {
					mDeleteInserts.deletes.push(aSource[i]);

					oItem = merge({}, aTarget[nIdx]);
					oItem.index = nIdx;
					mDeleteInserts.inserts.push(oItem);
				}
			}
		}
		for (i = 0; i < aTarget.length; i++) {
			sKey = aTarget[i].key || aTarget[i].name;
			if (this._indexOfByKeyName(aSource, sKey) === -1) {
				oItem = merge({}, aTarget[i]);
				oItem.index = i;
				mDeleteInserts.inserts.push(oItem);
			}
		}

		return mDeleteInserts;
	};
	SelectionController.prototype._verifyDeltaAttributes = (oSource, oTarget, aDeltaAttributes) => {
		let bReturn = false;

		aDeltaAttributes.some((sAttr) => {
			if (!oSource.hasOwnProperty(sAttr) && oTarget.hasOwnProperty(sAttr) ||
				oSource.hasOwnProperty(sAttr) && !oTarget.hasOwnProperty(sAttr) ||
				(oSource[sAttr] != oTarget[sAttr])) {
				bReturn = true;
			}

			return bReturn;
		});
		return bReturn;

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
	SelectionController.prototype._getChangeContent = (oProperty, aDeltaAttributes) => {

		const oChangeContent = {};

		// Index
		if (oProperty.hasOwnProperty("index") && oProperty.index >= 0) {
			oChangeContent.index = oProperty.index;
		}

		aDeltaAttributes.forEach((sAttribute) => {
			if (oProperty.hasOwnProperty(sAttribute)) {
				oChangeContent[sAttribute] = oProperty[sAttribute];
			}
		});

		return oChangeContent;
	};

	SelectionController.prototype._createAddRemoveChange = function(oControl, sOperation, oContent) {

		const oChangeContent = oContent;

		if (sOperation.indexOf("set") !== 0) {
			oChangeContent.value = (sOperation == this.getChangeOperations()["add"]);
		}

		if (this.getTargetAggregation()) {
			oChangeContent.targetAggregation = this.getTargetAggregation();
		}

		if (this._sPersistenceIdentifier) {
			oChangeContent.persistenceIdentifier = this._sPersistenceIdentifier;
		}

		const oAddRemoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sOperation,
				content: oChangeContent
			}
		};
		return oAddRemoveChange;
	};

	SelectionController.prototype._createMoveChange = function(sPropertykey, iNewIndex, sMoveOperation, oControl) {
		const oContent = {
			key: sPropertykey,
			targetAggregation: this.getTargetAggregation(),
			index: iNewIndex
		};

		if (this._sPersistenceIdentifier) {
			oContent.persistenceIdentifier = this._sPersistenceIdentifier;
		}

		const oMoveChange = {
			selectorElement: oControl,
			changeSpecificData: {
				changeType: sMoveOperation,
				content: oContent
			}
		};
		return oMoveChange;
	};
	SelectionController.prototype._getPresenceAttribute = (bexternalAppliance) => {
		return "visible";
	};

	/**
	 * Allows calculations prior to applying a set of changes.
	 * This can be used to mix additional changes to auto-created changes.
	 *
	 * @returns {Promise} A Promise that should resolve with an array of additional changes.
	 */
	SelectionController.prototype.getBeforeApply = () => {
		return Promise.resolve();
	};

	/**
	 * Initialized the inner model for the Personalization.
	 *
	 * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The propertyhelper that should be utilized for property determination.
	 * @returns {object} The personalization model data
	 */
	SelectionController.prototype.mixInfoAndState = function(oPropertyHelper) {

		const aItemState = this.getCurrentState();
		const mItemState = this.arrayToMap(aItemState);

		const oP13nData = this.prepareAdaptationData(oPropertyHelper, (mItem, oProperty) => {
			const oExisting = mItemState[oProperty.name || oProperty.key];
			mItem.visible = !!oExisting;
			mItem.position = oExisting ? oExisting.position : -1;
			return !(oProperty.visible === false || (this._aStableKeys.indexOf(oProperty.name || oProperty.key) > -1));
		});

		this.sortP13nData({
			visible: "visible",
			position: "position"
		}, oP13nData.items);

		oP13nData.items.forEach((oItem) => {
			delete oItem.position;
		});
		return oP13nData;
	};

	/**
	 * @returns {object} The personalization data.
	 *
	 */
	SelectionController.prototype.getP13nData = function() {
		return this._oPanel ? this._oPanel.getP13nData() : this._oAdaptationModel && this._oAdaptationModel.getProperty("/items");
	};

	SelectionController.prototype.model2State = false;

	/**
	 * Can be used to trigger update after UI interactions such as "Ok" and "Reset"
	 *
	 * @param {sap.ui.mdc.util.PropertyHelper} oPropertyHelper The property helper instance
	 */
	SelectionController.prototype.update = function(oPropertyHelper) {
		if (this._oPanel) {
			if (!this._oPanel.isDestroyed()) {
				const oAdaptationData = this.mixInfoAndState(oPropertyHelper);
				this._oPanel.setP13nData(oAdaptationData.items);
			}
		} else if (this._oAdaptationModel) {
			//'setData' causes unnecessary rerendering in some cases
			const oP13nData = this.mixInfoAndState(oPropertyHelper);
			this._oAdaptationModel.setProperty("/items", oP13nData.items);
			this._oAdaptationModel.setProperty("/itemsGrouped", oP13nData.itemsGrouped);
		}
	};

	SelectionController.prototype._getFilledArray = function(aPreviousItems, aNewItems, sRemoveProperty) {
		const aNewItemsPrepared = merge([], aPreviousItems);
		const aNewItemState = merge([], aNewItems);

		aNewItemState.forEach((oItem) => {
			const mExistingItems = this.arrayToMap(aNewItemsPrepared);
			const oExistingItem = mExistingItems[oItem.key];
			if (!oItem.hasOwnProperty(sRemoveProperty) || oItem[sRemoveProperty]) {
				let iNewPosition = oItem.position;
				if (oExistingItem) { //move if it exists
					// do not reorder it in case it exists and no position is provided
					iNewPosition = iNewPosition > -1 ? iNewPosition : oExistingItem.position;
					const iOldPosition = oExistingItem.position;
					aNewItemsPrepared.splice(iNewPosition, 0, aNewItemsPrepared.splice(iOldPosition, 1)[0]);
				} else { //add if it does not exist the item will be inserted at the end
					iNewPosition = iNewPosition > -1 ? iNewPosition : aNewItemsPrepared.length;
					aNewItemsPrepared.splice(iNewPosition, 0, oItem);
				}
				aNewItemsPrepared[iNewPosition] = oItem; //overwrite existing item with new item (for correct values such as 'descending')
			} else if (oExistingItem) { //check if exists before delete
				aNewItemsPrepared[oExistingItem.position][sRemoveProperty] = false;
			}
		});

		return aNewItemsPrepared;
	};

	SelectionController.prototype.getPropertySetterChanges = function(mDeltaInfo) {
		const oControl = mDeltaInfo.control;
		const aExistingState = mDeltaInfo.existingState;
		const aChangedState = mDeltaInfo.changedState;
		const sOperation = mDeltaInfo.operation;
		const sSetAttribute = mDeltaInfo.deltaAttribute;

		const aSetterChanges = [];

		aChangedState.forEach((oItem) => {
			//check if the provided state item holds the value to check for
			if (oItem.hasOwnProperty(sSetAttribute)) {
				const oExistingItem = aExistingState.find((oExisting) => {
					return oExisting.name == oItem.name;
				});

				//compare to identify delta (only create a change if really necessary)
				const vOldValue = oExistingItem && oExistingItem.hasOwnProperty(sSetAttribute) && oExistingItem[sSetAttribute];
				const vNewValue = oItem[sSetAttribute];
				const bValueChanged = vOldValue !== vNewValue;
				if (bValueChanged) {
					aSetterChanges.push(this._createAddRemoveChange(oControl, sOperation, {
						[oItem.hasOwnProperty("key") ? "key" : "name"]: oItem.key || oItem.name,
						targetAggregation: this.getTargetAggregation(),
						value: oItem[sSetAttribute]
					}));
				}
			}
		});

		return aSetterChanges;
	};

	SelectionController.prototype.changesToState = function(aChanges) {

		const aState = [];

		aChanges.forEach((oChange) => {
			const oStateDiffContent = merge({}, oChange.changeSpecificData.content);
			const iIndex = oStateDiffContent.index;
			delete oStateDiffContent.index;

			//set the position in case its explicitly provided and different to the current position
			if (iIndex !== undefined) {
				oStateDiffContent.position = iIndex;
			}

			//set the presence attribute to false in case of an explicit remove
			if (oChange.changeSpecificData.changeType === this.getChangeOperations()["remove"]) {
				oStateDiffContent[this._getPresenceAttribute()] = false;
			}

			aState.push(oStateDiffContent);
		});

		return aState;
	};

	SelectionController.prototype.prepareAdaptationData = function(oPropertyHelper, fnEnhace, bGroupData) {

		const aItems = [];
		const mItemsGrouped = bGroupData ? {} : null;

		const bEnhance = fnEnhace instanceof Function;

		const oControllerHelper = this.getMetadataHelper();
		const oHelper = oControllerHelper ? oControllerHelper : oPropertyHelper;
		oHelper.getProperties().forEach((oProperty) => {

			const mItem = {};
			mItem.key = oProperty.name || oProperty.key;
			mItem.name = oProperty.name || oProperty.key;

			if (bEnhance) {
				const bIsValid = fnEnhace(mItem, oProperty);
				if (!bIsValid) {
					return;
				}
			}

			mItem.label = oProperty.label || mItem.key;
			mItem.tooltip = oProperty.tooltip;

			if (mItemsGrouped) {
				mItem.group = oProperty.group ? oProperty.group : "BASIC";
				mItem.groupLabel = oProperty.groupLabel;
				mItemsGrouped[mItem.group] = mItemsGrouped[mItem.group] ? mItemsGrouped[mItem.group] : [];
				mItemsGrouped[mItem.group].push(mItem);
			}

			aItems.push(mItem);

		});

		const oAdaptationData = {
			items: aItems
		};

		if (mItemsGrouped) {
			oAdaptationData.itemsGrouped = this._buildGroupStructure(mItemsGrouped);
		}

		return oAdaptationData;

	};


	SelectionController.prototype._buildGroupStructure = function(mItemsGrouped) {
		const aGroupedItems = [];
		Object.keys(mItemsGrouped).forEach((sGroupKey) => {
			this.sortP13nData("generic", mItemsGrouped[sGroupKey]);
			aGroupedItems.push({
				group: sGroupKey,
				groupLabel: mItemsGrouped[sGroupKey][0].groupLabel || Library.getResourceBundleFor("sap.m").getText("p13n.BASIC_DEFAULT_GROUP"), //Grouplabel might not be necessarily be propagated to every item
				groupVisible: true,
				items: mItemsGrouped[sGroupKey]
			});
		});
		return aGroupedItems;

	};

	SelectionController.prototype.sortP13nData = (oSorting, aItems) => {

		const mP13nTypeSorting = oSorting;

		const sPositionAttribute = mP13nTypeSorting.position;
		const sSelectedAttribute = mP13nTypeSorting.visible;

		const sLocale = new Locale(Localization.getLanguageTag()).toString();

		const oCollator = window.Intl.Collator(sLocale, {});

		// group selected / unselected --> sort alphabetically in each group
		aItems.sort((mField1, mField2) => {
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

	SelectionController.prototype.arrayToMap = (aArray) => {
		return aArray.reduce((mMap, oProp, iIndex) => {
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
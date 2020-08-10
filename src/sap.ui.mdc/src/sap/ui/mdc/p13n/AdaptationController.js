/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/base/ManagedObject",
	"sap/ui/mdc/p13n/FlexUtil",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/merge",
	"sap/base/Log",
	"./P13nBuilder"
], function (SAPUriParameters, ManagedObject, FlexUtil, JSONModel, merge, Log, P13nBuilder) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	//EXPERIMENTAL API -- only for internal testing purposes
	var oURLParams = new SAPUriParameters(window.location.search);

	var AdaptationController = ManagedObject.extend("sap.ui.mdc.AdaptationController", {
		library: "sap.ui.mdc",
		metadata: {
			properties: {
				/**
				 * Control on which adaptation changes are going to be applied on
				 */
				adaptationControl: {
					type: "object"
				},
				/**
				 * Indicates whether a popover or modal dialog is going to be displayed
				 */
				liveMode: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Control specific information which is being used to define the UI elements and specify additional information
				 */
				itemConfig: {
					type: "object"
				},
				/**
				 * Control specific information which is being used to define the UI elements and specify additional information
				 */
				sortConfig: {
					type: "object",
					defaultValue: {
						changeOperations: {
							add: "addSort",
							remove: "removeSort",
							move: "moveSort"
						},
						adaptationUI: "sap/ui/mdc/p13n/panels/SortPanel",
						title: oResourceBundle.getText("sort.PERSONALIZATION_DIALOG_TITLE")
					}
				},
				/*
				* Control specific information which is being used to define the UI elements and specify additional information
				*/
			   filterConfig: {
				   type: "object",
				   defaultValue: {
					   adaptationUI: null,
					   initializeControl: null, //Will be called after the personalization model structure has been bound to the UI
					   title: oResourceBundle.getText("filter.PERSONALIZATION_DIALOG_TITLE")
				   }
			   },
				/**
				 * Callback which should be used to return the corresponding dataProperty/key of the item
				 */
				stateRetriever: {
					type: "function"
				},
				/**
				 * Callback which can be used to return a Promise which should resolve with
				 * the PropertyInfo in case the default "fetchProperties" is not sufficient
				 */
				retrievePropertyInfo: {
					type: "function"
				},
				/**
				 * Callback which will be executed after the changes have been created with an array of all calculated UI changes
				 */
				afterChangesCreated: {
					type: "function"
				}
			},
			events: {
				/**
				 * This event is being fired before the p13n container has been opened, this can be used to customize the p13n container
				 */
				beforeP13nContainerOpens: {
					container: {
						type: "object"
					}
				},
				/**
				 * This event is being fired after the p13n container has been closed, this can be used to implement custom logic after p13n
				 */
				afterP13nContainerCloses: {
					container: {
						type: "object"
					},
					reason: {
						type: "string"
					}
				}
			}
		}
	});

	AdaptationController.prototype.init = function(){
		//initialize housekeeping
		this.oAdaptationModel = new JSONModel();
		this.oAdaptationModel.setSizeLimit(10000);
		this.oState = {};
		this.bIsDialogOpen = false;
	};

	/************************************************ Public Methods *************************************************/

	/**
	 * @public
	 * @param {object} oSource Control which is being used as reference for the popover
	 * @param {string} sP13nType String which describes which config should be used,
	 * currently available options are: "Item" and "Sort"
	 * @returns {Promise} returns a Promise resolving in the P13nContainer
	 *
	 */
	AdaptationController.prototype.showP13n = function(oSource, sP13nType) {

		//TODO: experimental and only for testing purposes
		if (oURLParams.getAll("sap-ui-xx-p13nLiveMode")[0] === "true"){
			this.setLiveMode(true);
			Log.warning("Please note that the p13n liveMode is experimental");
		}

		if (!this.bIsDialogOpen){
			return this._retrievePropertyInfo().then(function(aPropertyInfo){
				return this.createP13n(sP13nType, aPropertyInfo).then(function(oP13nDialog){
					this._openP13nControl(oP13nDialog, oSource);
					return oP13nDialog;
				}.bind(this));
			}.bind(this));
		}
	};

	/**
	 * @public
	 * @param {string} sP13nType String which describes which config should be used,
	 * currently available options are: "Item" and "Sort"
	 * @param {Array} aPropertyInfo String which describes which config should be used,
	 * currently available options are: "Item" and "Sort"
	 * @returns {Promise} returns a Promise resolving in the P13nContainer
	 *
	 */
	AdaptationController.prototype.createP13n = function(sP13nType, aPropertyInfo) {
		return new Promise(function(resolve, reject){
			this.aPropertyInfo = aPropertyInfo;
			this._retrieveControl(this.getAdaptationControl().getDelegate().name).then(function(oDelegate){

				if (!(aPropertyInfo instanceof Array)) {
					reject("Please provide a property info array to create a p13n control");
				}

				this.oAdaptationControlDelegate = oDelegate;
				this.sP13nType = sP13nType;

				this._retrieveP13nContainer(this.getTypeConfig(sP13nType).title).then(function(oContainer){
					var oP13nUI = oContainer.getContent()[0];

					var oP13nData = this._prepareAdaptationData(aPropertyInfo);
					this._setP13nModelData(oP13nData);

					oP13nUI.setP13nModel(this.oAdaptationModel);

					if (oP13nUI.setLiveMode){
						oP13nUI.setLiveMode(this.getLiveMode());
					}

					var oFnInitPromise = this.getTypeConfig(sP13nType).initializeControl;
					oFnInitPromise.call(oP13nUI).then(function(){
						this.getAdaptationControl().addDependent(oContainer);
						resolve(oContainer);
					}.bind(this));

				}.bind(this));
			}.bind(this), reject);
		}.bind(this));
	};

	/**
	 * @public
	 * @param {array} aNewSorters array containing the information aobut the sorters
	 * @param {boolean} bApplyAbsolute if set to true the logic will remove existing sorters that are not present in the new state
	 * which should be used to create set of delta based changes
	 *
	 * aNewSorters = [
	 * 		{name: "Country", descending: true},
	 * 		{name: "Category", descending: false}
	 * ]
	 *
	 * @returns {array} In case no callback is provided, this function will return the set of changes
	 *
	 */
	AdaptationController.prototype.createSortChanges = function(aNewSorters, bApplyAbsolute){
		return this._executeAfterAsyncActions(function(){
			//create clones as the original might be modified for delta calculation
			var oCurrentState = merge({},this.getStateRetriever().call(this.getAdaptationControl(), this.oAdaptationControlDelegate));
			var aPreviousSorters = oCurrentState.sorters || [];

			var oSortConfig = this.getSortConfig();
			var fnSymbol = function(o){
				return o.name + o.descending;
			};

			var fFilter = function (oItem) {
				return oItem.hasOwnProperty("sorted") && oItem.sorted === false ? false : true;
			};

			var aNewSortersPrepared = bApplyAbsolute ? aNewSorters : this._getFilledArray(aPreviousSorters, aNewSorters, "sorted").filter(fFilter);

			var aSortChanges = FlexUtil.getArrayDeltaChanges(aPreviousSorters, aNewSortersPrepared, fnSymbol, this.getAdaptationControl(), oSortConfig.changeOperations);
			if (this.getAfterChangesCreated()){
				this.getAfterChangesCreated()(this, aSortChanges);
			}
			return aSortChanges;
		}.bind(this));
	};

	/**
	/**
	 * @public
	 * @param {array} aNewItems array containing the information aobut the sorters
	 * which should be used to create set of delta based changes
	 *
	 * aNewItems = [
	 * 		{name: "Country", position: 0},
	 * 		{name: "Category", position: 1},
	 * 		{name: "Region", position: -1}
	 * ]
	 *
	 * @returns {array} In case no callback is provided, this function will return the set of changes
	 *
	 */
	AdaptationController.prototype.createItemChanges = function(aNewItems){
		return this._executeAfterAsyncActions(function(){
			var oAdaptationControl = this.getAdaptationControl();
			//create clones as the original might be modified for delta calculation
			var oCurrentState = merge({}, this.getStateRetriever().call(oAdaptationControl, this.oAdaptationControlDelegate));
			var aPreviousItems = oCurrentState.items;

			var oItemConfig = this.getItemConfig();

			var fnSymbol = function (o) {

				var sDiffRelevant = o.name;

				//TODO: reconsider 'deltaRelevantAttributes' approach
				if (oItemConfig && oItemConfig.additionalDeltaAttributes && oItemConfig.additionalDeltaAttributes instanceof Array) {
					oItemConfig.additionalDeltaAttributes.forEach(function(sAttribute){
						sDiffRelevant += o[sAttribute];
					});
				}

				return sDiffRelevant;
			};

			var fFilter = function (oItem) {
				return oItem.hasOwnProperty("visible") && oItem.visible === false ? false : true;
			};

			var aNewItemsPrepared = this._getFilledArray(aPreviousItems, aNewItems, "visible").filter(fFilter);
			var aItemChanges = FlexUtil.getArrayDeltaChanges(aPreviousItems, aNewItemsPrepared, fnSymbol, this.getAdaptationControl(), oItemConfig.changeOperations);
			if (this.getAfterChangesCreated()) {
				this.getAfterChangesCreated()(this, aItemChanges);
			}
			return aItemChanges;
		}.bind(this));
	};

	/**
	 * @public
	 * @param {map} mNewConditionState array containing the information aobut the sorters
	 * which should be used to create set of delta based changes
	 *
	 * mNewConditionState = {
	 * 		"Category": [
	 * 			{
	 * 				"operator": EQ,
	 * 				"values": [
	 * 					"Books"
	 * 				]
	 * 			}
	 * 		]
	 * }
	 *
	 * @returns {array} In case no callback is provided, this function will return the set of changes
	 *
	 */
	AdaptationController.prototype.createConditionChanges = function(mNewConditionState) {
		return this._executeAfterAsyncActions(function(){
			var aConditionChanges = [];
			var oCurrentState = merge({}, this.getStateRetriever().call(this.getAdaptationControl(), this.oAdaptationControlDelegate));
			var mPreviousConditionState = oCurrentState.filter;
			var oAdaptationControl = this.getAdaptationControl();
			for (var sFieldPath in mNewConditionState) {
				var bValidProperty = this._hasProperty(sFieldPath).valid;
				if (!bValidProperty) {
					Log.warning("property '" + sFieldPath + "' not supported");
					continue;
				}
				aConditionChanges = aConditionChanges.concat(FlexUtil.getConditionDeltaChanges(sFieldPath, mNewConditionState[sFieldPath], mPreviousConditionState[sFieldPath], oAdaptationControl));
			}
			if (this.getAfterChangesCreated()){
				this.getAfterChangesCreated()(this, aConditionChanges);
			}
			return aConditionChanges;
		}.bind(this));
	};

	/************************************************ Async loading *************************************************/

	AdaptationController.prototype._retrievePropertyInfo = function(){

		//!TODO!: once every control is deriving from 'sap.ui.mdc.Control' we should check for mdc control

		//by default the "fetchProperties" call is being used to retrieve the property
		return new Promise(function(resolve,reject){

			//in case properties have already been fetched, return them
			if (this.aPropertyInfo) {
				resolve(this.aPropertyInfo);
			} else if (this.getRetrievePropertyInfo()){ //in case callback is provided, use it
					this.aPropertyInfo = this.getRetrievePropertyInfo().call(this.getAdaptationControl());
					resolve(this.aPropertyInfo);
			}else {// in case no properties are fetched or callback is provided, use general "fetchProperties"
				this._retrieveControl(this.getAdaptationControl().getDelegate().name).then(function(oDelegate){
					this.oAdaptationControlDelegate = oDelegate;
					oDelegate.fetchProperties(this.getAdaptationControl()).then(function (aPropertyInfo) {
						this.aPropertyInfo = aPropertyInfo;
						resolve(this.aPropertyInfo);
					}.bind(this));
				}.bind(this));
			}
		}.bind(this));
	};

	AdaptationController.prototype._executeAfterAsyncActions = function(fnCreate) {
		return new Promise(function (resolve, reject) {
			this._retrievePropertyInfo().then(function (aPropertyInfo) {
				resolve(fnCreate());
			});
		}.bind(this));
	};

	/************************************************ P13n related *************************************************/

	AdaptationController.prototype.getTypeConfig = function(sP13nType) {

		var oP13nConfig = this["get" + sP13nType + "Config"] ? this["get" + sP13nType + "Config"]() : undefined;

		return {
			changeOperations:  oP13nConfig ? oP13nConfig.changeOperations : {},
			ignoreIndex: oP13nConfig ? oP13nConfig.ignoreIndex : false,
			adaptationUI: oP13nConfig ? oP13nConfig.adaptationUI : undefined,
			initializeControl: oP13nConfig && oP13nConfig.initializeControl ? oP13nConfig.initializeControl : function(){ return Promise.resolve();},
			title: oP13nConfig ? oP13nConfig.title : undefined
		};
	};

	AdaptationController.prototype._openP13nControl = function(oP13nControl, oSource){
		this.fireBeforeP13nContainerOpens({
			container: oP13nControl
		});
		if (this.getLiveMode()) {
			oP13nControl.openBy(oSource);
		} else {
			oP13nControl.open();
		}
		this.bIsDialogOpen = true;
	};

	AdaptationController.prototype._getFilledArray = function(aPreviousItems, aNewItems, sRemoveProperty) {
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

	AdaptationController.prototype._prepareAdaptationData = function(aPropertyInfo){

		var oAdaptationControl = this.getAdaptationControl();
		var oControlState = merge({}, this.getStateRetriever().call(oAdaptationControl, this.oAdaptationControlDelegate));

		var aIgnoreValues = this._getTypeIgnoreValues(this.sP13nType);

		return P13nBuilder.prepareP13nData(oControlState, aPropertyInfo, aIgnoreValues, this.sP13nType);

	};

	AdaptationController.prototype._getTypeIgnoreValues = function(sP13nType) {
		var aIgnoreValues;

		if (this.sP13nType == "Sort") {
			aIgnoreValues = [{
				ignoreKey: "sortable",
				ignoreValue: false
			}];
		}

		if (this.sP13nType == "Filter") {
			aIgnoreValues = [{
				ignoreKey: "filterable",
				ignoreValue: false
			}];
		}

		return aIgnoreValues;
	};

	AdaptationController.prototype._setP13nModelData = function(oP13nData){
		this.oAdaptationModel.setProperty("/items", oP13nData.items);
		this.oAdaptationModel.setProperty("/itemsGrouped", oP13nData.itemsGrouped);

		this.oState = merge({}, oP13nData);
	};

	AdaptationController.prototype._retrieveP13nContainer = function (sTitle) {
		return new Promise(function (resolve, reject) {

			var bLiveMode = this.getLiveMode();
			var vAdaptationUI = this.getTypeConfig(this.sP13nType).adaptationUI;

			var fnPrepareP13nUI = function(oP13nUI) {
				if (bLiveMode && !this.bInitialized && oP13nUI.attachChange) {
					oP13nUI.attachChange(function(){
						this._handleChange();
					}.bind(this));
				}

				this._createP13nContainer(oP13nUI, sTitle).then(function(oDialog){
					resolve(oDialog);
				});
			}.bind(this);

			if (typeof vAdaptationUI === "string") {
				var sPath = vAdaptationUI;
				this._retrieveControl(sPath).then(function(Panel){
					var oPanel = new Panel();
					fnPrepareP13nUI(oPanel);
				});
			} else if (vAdaptationUI instanceof Function) {

				var oCreatedUI = vAdaptationUI.call(this.getAdaptationControl());

				if (oCreatedUI instanceof Promise) {
					oCreatedUI.then(function(oP13nUI){
						fnPrepareP13nUI(oP13nUI);
					});
				} else {
					fnPrepareP13nUI(oCreatedUI);
				}

			}else if (vAdaptationUI.isA("sap.ui.core.Control")) {
				var oP13nUI = vAdaptationUI;
				fnPrepareP13nUI(oP13nUI);
			} else {
				reject(new Error("Please provide either a BasePanel derivation or a custom Control as personalization UI for AdaptationController"));
			}

		}.bind(this));
	};

	AdaptationController.prototype._retrieveControl = function(sPath) {
		return new Promise(function(resolve,reject){
			sap.ui.require([
				sPath
			], function (Class) {
				resolve(Class);
			}, reject);
		});
	};

	AdaptationController.prototype._createP13nContainer = function (oPanel, sTitle) {

		var oContainerPromise;

		if (this.getLiveMode()) {
			oContainerPromise = this._createPopover(oPanel, sTitle);
		} else {
			oContainerPromise = this._createModalDialog(oPanel, sTitle);
		}

		return oContainerPromise.then(function(oContainer){
			// Add custom style class in order to display marked items accordingly
			oContainer.addStyleClass("sapUiMdcPersonalizationDialog");
			// Set compact style class if the table is compact too
			oContainer.toggleStyleClass("sapUiSizeCompact", !!jQuery(this.getAdaptationControl()).closest(".sapUiSizeCompact").length);
			return oContainer;
		}.bind(this));

	};

	AdaptationController.prototype._createPopover = function(oPanel, sTitle){

		var fnAfterDialogClose = function (oEvt) {
			var oPopover = oEvt.getSource();
			this.fireAfterP13nContainerCloses({
				reason: "autoclose",
				container: oPopover
			});
			oPopover.destroy();
			this.bIsDialogOpen = false;
		}.bind(this);

		var mSettings = {
			title: sTitle,
			verticalScrolling: true,
			afterClose: fnAfterDialogClose
		};

		return P13nBuilder.createP13nPopover(oPanel, mSettings);

	};

	AdaptationController.prototype._createModalDialog = function(oPanel, sTitle){

		var fnDialogOk = function (oEvt) {
			var oDialog = oEvt.getSource().getParent();
			// Apply a diff to create changes for flex
			this._handleChange();
			oDialog.close();
			this.bIsDialogOpen = false;
			this.fireAfterP13nContainerCloses({
				reason: "Ok",
				container: oDialog
			});
			oDialog.destroy();
		}.bind(this);

		var fnDialogCancel = function(oEvt) {
			var oDialog = oEvt.getSource().getParent();
			// Discard the collected changes
			oDialog.close();
			this.bIsDialogOpen = false;
			this.fireAfterP13nContainerCloses({
				reason: "Cancel",
				container: oDialog
			});
			oDialog.destroy();
		}.bind(this);

		var mSettings = {
			verticalScrolling: false,
			title: sTitle,
			confirm: {
				handler: fnDialogOk
			},
			cancel: fnDialogCancel
		};

		return P13nBuilder.createP13nDialog(oPanel, mSettings);
	};

	/************************************************ delta calculation *************************************************/

	AdaptationController.prototype._handleChange = function(){
		var aChanges = [], aInitialState = [], aCurrentState = [];

		//TODO: generify
		var fFilter = function (oItem) {
			return this.sP13nType == "Sort" ? oItem.isSorted : oItem.selected;
		}.bind(this);

		aInitialState = this.oState.items.filter(fFilter);
		aCurrentState = this.oAdaptationModel.getData().items.filter(fFilter);

		var fnSymbol = function (o) {
			var sDiff = o.name;
			//TODO: needs to be generified here and in FlexUtil
			if (o.hasOwnProperty("descending")) {
				sDiff = sDiff + o.descending;
			}
			if (o.role) {
				sDiff = sDiff + o.role;
			}
			return sDiff;
		};

		var mChangeOperations = this.getTypeConfig(this.sP13nType).changeOperations;
		var bIgnoreIndex = this.getTypeConfig(this.sP13nType).ignoreIndex;

		if (mChangeOperations) {
			aChanges = FlexUtil.getArrayDeltaChanges(aInitialState, aCurrentState, fnSymbol, this.getAdaptationControl(), mChangeOperations, bIgnoreIndex);
		} else {
			aChanges = [];
		}

		this.oState = merge({}, this.oAdaptationModel.getData());

		//execute callback
		this.getAfterChangesCreated()(this, aChanges);
	};

	AdaptationController.prototype._hasProperty = function(sName) {
		var oInfo = {
			valid: false,
			property: undefined
		};
		this.aPropertyInfo.some(function(oProperty){
			//First check unique name
			var bValid = oProperty.name === sName || sName == "$search";

			//Use path as Fallback
			bValid = bValid ? bValid : oProperty.path === sName;

			if (bValid){
				oInfo.valid = true;
				oInfo.property = oProperty;
			}
			return bValid;
		});
		return oInfo;
	};

	AdaptationController.prototype.destroy = function(bSuppressInvalidate){

		ManagedObject.prototype.destroy.apply(this, arguments);

		if (this.oAdaptationModel){
			this.oAdaptationModel.destroy();
		}	this.oAdaptationModel = null;

		this.aPropertyInfo = null;
		this.oAdaptationModel = null;
		this.oState = null;
		this.bIsDialogOpen = null;
		this.sP13nType = null;
		this.oAdaptationControlDelegate = null;
		this.mChangeOperations = null;
	};

	return AdaptationController;

});

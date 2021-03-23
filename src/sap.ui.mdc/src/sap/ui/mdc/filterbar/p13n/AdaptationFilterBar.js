/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/filterbar/p13n/GroupContainer", "sap/ui/mdc/filterbar/p13n/FilterGroupLayout","sap/ui/mdc/filterbar/p13n/TableContainer", "sap/ui/mdc/filterbar/p13n/FilterColumnLayout", "sap/ui/mdc/filterbar/FilterBarBase", "sap/ui/mdc/filterbar/FilterBarBaseRenderer"
], function( GroupContainer, FilterGroupLayout, TableContainer, FilterColumnLayout, FilterBarBase, FilterBarBaseRenderer) {
	"use strict";

	/**
	 * Constructor for a new AdaptationFilterBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>AdaptationFilterBar</code> control is used for a lightweight FilterBar implementation for p13n use cases.
	 * The <code>AdaptationFilterBar</code> should only be used if the consuming control implements atleast the <code>IFilterSource</code>
	 * interface to provide basic filter functionality.
	 *
	 * @extends sap.ui.mdc.filterbar.FilterBarBase
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.80.0
	 * @alias sap.ui.mdc.filterbar.p13n.AdaptationFilterBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AdaptationFilterBar = FilterBarBase.extend("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Determines the parent on which the condition changes should be applied on.
				 */
				adaptationControl: {
					type: "object"
				}
			},
			events: {
				/**
				 * Event which is only being thrown if the inner layout has a <code>change</code> event.
				 * This depends whether the inner layout supports the selection of FilterFields.
				 */
				change: {}
			}
		},
		renderer: FilterBarBaseRenderer
	});

	AdaptationFilterBar.prototype.init = function() {
		FilterBarBase.prototype.init.apply(this,arguments);
		this._bPersistValues = true;
	};

	AdaptationFilterBar.prototype.setLiveMode = function(bLive, bSuppressInvalidate) {
		FilterBarBase.prototype.setLiveMode.apply(this, arguments);

		//Dialog
		if (!bLive) {
			this._oConditionModel.detachPropertyChange(this._handleConditionModelPropertyChange, this);
		}

		//update adaptationModel while dialog is open
		this._oConditionModel.attachPropertyChange(function(oEvt){
			var sKey = oEvt.getParameter("path").substring(12);
			if (this.oAdaptationModel){
				var aItems = this.oAdaptationModel.getProperty("/items");
				var oItem = aItems.find(function(o){
					return o.name == sKey;
				});
				if (oItem) {
					oItem.isFiltered = this._getConditionModel().getConditions(sKey).length > 0 ? true : false;
					this.oAdaptationModel.setProperty("/items", aItems);
				}
			}
		}.bind(this));

		return this;
	};

	AdaptationFilterBar.prototype.createConditionChanges = function() {
		var mConditions = this._getModelConditions(this._getConditionModel(), false, true);
		if (this._bPersistValues) {
			//this.getAdaptationControl(), "Filter", mConditions, true, true
			return this.getEngine().createChanges({
				control: this.getAdaptationControl(),
				key: "Filter",
				state: mConditions,
				suppressAppliance: true
			});
		} else {
			//TODO: currently only required once the parent FilterBar has p13nMode 'value' disabled.
			this.getAdaptationControl()._setXConditions(mConditions, true);
			return Promise.resolve(null);
		}
	};

	/**
	 *
	 * Please note that the provided model should be created with sap.ui.mdc.p13n.P13nBuilder
	 *
	 * @param {object} oP13nModel Model providing the necessary data to display and create <code>FilterColumnLayout</code> instances.
	 *
	 */
	AdaptationFilterBar.prototype.setP13nModel = function(oP13nModel) {
		this.oAdaptationModel = oP13nModel;
		this._oFilterBarLayout.update();
	};

	AdaptationFilterBar.prototype.getP13nModel = function(oP13nModel) {
		return this.oAdaptationModel;
	};

	AdaptationFilterBar.prototype._handleFilterItemSubmit = function() {
		return;
	};

	AdaptationFilterBar.prototype._getWaitForChangesPromise = function() {
		//Change is applied on parent --> wait for the parent promise not the child
		return this.getEngine().waitForChanges(this.getAdaptationControl());
	};

	AdaptationFilterBar.prototype.applyConditionsAfterChangesApplied = function() {
		FilterBarBase.prototype.applyConditionsAfterChangesApplied.apply(this, arguments);
		this.triggerSearch();
	};

	/**
	 * Method which will initialize the <code>AdaptationFilterBar</code> to retrieve the propertyinfo based on its parent
	 *
	 * @returns {Promise} A Promise which resolves once the propertyinfo has been propagated
	 */
	AdaptationFilterBar.prototype.initialized = function(){

		var oParentPropertyInfoPromise = this.getAdaptationControl().awaitControlDelegate().then(function(oParentControl) {
			return oParentControl.fetchProperties(this.getAdaptationControl()).then(function(aPropertyInfo){
				return aPropertyInfo;
			});
		}.bind(this));

		return Promise.all([
			oParentPropertyInfoPromise,
			FilterBarBase.prototype.initialized.apply(this, arguments)
		]).then(function(aResolvedValues){
			var aPropertyInfo = aResolvedValues[0];
			this._aProperties = aPropertyInfo;
		}.bind(this));

	};

	/**
	 * Method which will initialize the <code>AdaptationFilterBar</code> and create the required FilterFields
	 *
	 * @returns {Promise} A Promise which resolves once all FilterFields are ready and added to the <code>filterItems</code> aggregation
	 */
	AdaptationFilterBar.prototype.createFilterFields = function(){
		return this.initialized().then(function(){
			var mConditions = this._bPersistValues ? this.getAdaptationControl().getFilterConditions() : this.getAdaptationControl()._getXConditions();
			this._setXConditions(mConditions, true);

			if (this._bFilterFieldsCreated) {
				return this;
			}

			var oAdaptationControl = this.getAdaptationControl();
			var oDelegate = oAdaptationControl.getControlDelegate();
			var oFilterDelegate = this._checkAdvancedParent(oAdaptationControl) ? oDelegate : oDelegate.getFilterDelegate();

			//used to store the originals
			this._mOriginalsForClone = {};

			var aFieldPromises = [];

			this.oAdaptationModel.getProperty("/items").forEach(function(oItem, iIndex){
				var oFilterFieldPromise;

				oFilterFieldPromise = this._checkExisting(oItem, oFilterDelegate);

				oFilterFieldPromise.then(function(oFilterField){

					var oFieldForDialog;

					//Important: always use clones for the personalization dialog. The "originals" should never be shown in the P13n UI
					//Currently the IFilter interface is being used to identify if a more complex personalization is required, this is
					//as of now only part for the sap.ui.mdc.FilterBar, as the AdaptationFilterBar will allow to select FilterFields in advance.
					//This logic requires a cloning logic, as there is a mix of parent/child filterFields which is not the case if the adaptaitonControl
					//does only provide Filter capabilities via an inenr FilterBar (such as the Table inbuilt filtering)
					if (this._checkAdvancedParent(oAdaptationControl)) {
						if (oFilterField._bTemporaryOriginal) {
							delete oFilterFieldPromise._bTemporaryOriginal;
							this._mOriginalsForClone[oFilterField.getFieldPath()] = oFilterField;
						}
						oFieldForDialog = oFilterField.clone();
					} else {
						oFieldForDialog = oFilterField;
					}

					oItem.filterfield = oFieldForDialog;

				}.bind(this));

				aFieldPromises.push(oFilterFieldPromise);

			}.bind(this));

			return Promise.all(aFieldPromises).then(function(){
				this.oAdaptationModel.getProperty("/items").forEach(function(oItem){
					this.addAggregation("filterItems", oItem.filterfield);
					delete oItem.filterfield;
				}.bind(this));

				if (this._oFilterBarLayout.getInner().setP13nModel){
					this._oFilterBarLayout.getInner().setP13nModel(this.oAdaptationModel);
				}
				this._bFilterFieldsCreated = true;

				return this;
			}.bind(this));

		}.bind(this));
	};

	/**
	 * This method checks whether a FilterField is already present on the parent and will return this
	 * instead of requesting a new one.
	 *
	 * @param {object} oItem Corresponding item in the AdaptaitonModel
	 * @param {object} oFilterDelegate Parent filter delegate
	 *
	 * @returns {Promise} A Promise resolving in the corresponding FilterField
	 */
	AdaptationFilterBar.prototype._checkExisting = function(oItem, oFilterDelegate) {
		var oFilterFieldPromise;

		var oAdaptationControl = this.getAdaptationControl();
		var aExistingItems = this._checkAdvancedParent(oAdaptationControl) ? oAdaptationControl.getFilterItems() : [];

		var mExistingFilterItems = aExistingItems.reduce(function(mMap, oField){
			mMap[oField.getFieldPath()] = oField;
			return mMap;
		},{});

		if (mExistingFilterItems[oItem.name]){
			oFilterFieldPromise = Promise.resolve(mExistingFilterItems[oItem.name]);
		}else {

			oFilterFieldPromise = oFilterDelegate.addItem(oItem.name, this.getAdaptationControl());

			oFilterFieldPromise = oFilterFieldPromise.then(function(oFilterField){

				if (!oFilterField) {
					throw new Error("No FilterField could be created for property: '" + oItem.name + "'.");
				}

				oFilterField._bTemporaryOriginal = true;
				return oFilterField;
			});
		}

		return oFilterFieldPromise;
	};

	AdaptationFilterBar.prototype._executeRequestedRemoves = function() {

		var aExistingItems = this._oFilterBarLayout.getInner().getSelectedFields();
		var aOriginalsToRemove = [];

		Object.keys(this._mOriginalsForClone).forEach(function(sKey){
			var oDelegate = this.getAdaptationControl().getControlDelegate();


			if (aExistingItems.indexOf(sKey) < 0) {//Originals that have not been selected --> use continue similar to 'ItemBaseFlex'
				var oRemovePromise = oDelegate.removeItem.call(oDelegate, sKey, this.getAdaptationControl()).then(function(bContinue){
					if (bContinue && this._mOriginalsForClone[sKey]) {
						// destroy the item
						this._mOriginalsForClone[sKey].destroy();
						delete this._mOriginalsForClone[sKey];
					}
				}.bind(this));
				aOriginalsToRemove.push(oRemovePromise);
			} else { //Originals that have been selected --> keep
				delete this._mOriginalsForClone[sKey];
			}

		}.bind(this));

		return Promise.all(aOriginalsToRemove);
	};

	AdaptationFilterBar.prototype._checkAdvancedParent = function(oControl) {
		if (!oControl.isA("sap.ui.mdc.IFilterSource") && !oControl.isA("sap.ui.mdc.IFilter")) {
			throw new Error("The 'adaptationControl' needs to implement the IFilterSource or IFilter interface");
		}

		return oControl.isA("sap.ui.mdc.IFilter");
	};

	/**
	 *
	 * @param {sap.ui.mdc.Control} oControl the mdc control instance
	 * @param {boolean} bSuppressInvalidate suppress invalidation
	 */
	AdaptationFilterBar.prototype.setAdaptationControl = function(oControl, bSuppressInvalidate) {
		this.setProperty("adaptationControl", oControl, bSuppressInvalidate);

		this._checkAdvancedParent(oControl);

		//TODO: use 'GroupView' for inbuilt filtering enabled Controls
		this._cLayoutItem = this._checkAdvancedParent(oControl) ? FilterGroupLayout : FilterColumnLayout;
		this._oFilterBarLayout = this._checkAdvancedParent(oControl) ? new GroupContainer() : new TableContainer();
		this._oFilterBarLayout.getInner().setParent(this);
		this.setAggregation("layout", this._oFilterBarLayout, true);
		this.addStyleClass("sapUIAdaptationFilterBar");

		if (this._oFilterBarLayout.getInner().attachChange) {
			this._oFilterBarLayout.getInner().attachChange(function(){
				this.fireChange();
			}.bind(this));
		}
		return this;
	};

	AdaptationFilterBar.prototype.exit = function() {
		FilterBarBase.prototype.exit.apply(this, arguments);
		this.oAdaptationModel = null;
		this._mOriginalsForClone = null;
	};

	return AdaptationFilterBar;

});

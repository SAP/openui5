/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/filterbar/p13n/GroupContainer", "sap/ui/mdc/filterbar/p13n/FilterGroupLayout","sap/ui/mdc/filterbar/p13n/TableContainer", "sap/ui/mdc/filterbar/p13n/FilterColumnLayout", "sap/ui/mdc/filterbar/FilterBarBase", "sap/ui/mdc/filterbar/FilterBarBaseRenderer", "sap/ui/fl/apply/api/FlexRuntimeInfoAPI", "sap/m/Toolbar", "sap/m/ToolbarSpacer"
], function(GroupContainer, FilterGroupLayout, TableContainer, FilterColumnLayout, FilterBarBase, FilterBarBaseRenderer, FlexRuntimeInfoAPI, Toolbar, ToolbarSpacer) {
	"use strict";

	/**
	 * Constructor for a new AdaptationFilterBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>AdaptationFilterBar</code> control is used for a lightweight FilterBar implementation in p13n panels
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
			properties: {
				/**
				 * Determines the parent on which the condition changes should be applied on.
				 */
				adaptationControl: {
					type: "object"
				},
				/**
				 * Determines whether the <code>AdaptationFilterBar</code> has selectable Fields and a <code>Select</code> Control to
				 * toggle between visible/all FilterItems
				 */
				advancedMode: {
					type: "boolean",
					defaultValue: true
				}
			},
			events: {
				/**
				 * Event which is only being thrown once the <code>advancedMode</code> property is set to true.
				 * The event will be thrown once an item has been selected/deselected.
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
		if (bLive) {
			this._createGoToolbar();
		} else {
			this._oConditionModel.detachPropertyChange(this._handleConditionModelPropertyChange, this);
		}

		var fnOnContainerClose = function(oEvt) {
			var oContainer = oEvt.getParameter("container");
			oContainer.removeAllContent();

			if (!bLive) {
				this._handleModal(oEvt.getParameter("reason"));
			}

			if (this.getAdvancedMode()) {
				this._executeRequestedRemoves();
			}

			this.getAdaptationController().detachAfterP13nContainerCloses(fnOnContainerClose);
		}.bind(this);

		//Cleanup after dialog close
		this.getAdaptationControl()._oAdaptationController.attachEvent("afterP13nContainerCloses", fnOnContainerClose);

		return this;
	};

	AdaptationFilterBar.prototype._handleModal = function(sCloseReason) {

		var bConfirm = sCloseReason === "Ok";

		//Confirm conditions --> create condition changes
		if (bConfirm) {
			var mConditions = this._getModelConditions(this._getConditionModel(), false, true);

			if (this._bPersistValues) {
				this.getAdaptationController().createConditionChanges(mConditions);
			} else {
				//TODO: currently only required once the parent FilterBar has p13nMode 'value' disabled.
				this.getAdaptationControl()._setXConditions(mConditions, true);
			}

		//Discard conditions --> set to state once the dialog has been opened
		} else {
			this._setXConditions(this.getAdaptationControl().getFilterConditions(), true);
		}
	};

	AdaptationFilterBar.prototype._createGoToolbar = function() {
		if (!this._btnSearch) {
			var oSearchButton = this._getSearchButton();
			oSearchButton.attachPress(function(){
				this.getAdaptationControl().triggerSearch();
			}.bind(this));
			this._oFilterBarLayout.getInner().setFooterToolbar(new Toolbar({
				content: [
					new ToolbarSpacer(),
					this._getSearchButton()
				]
			}));
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
	};

	AdaptationFilterBar.prototype._getWaitForChangesPromise = function() {
		//Change is applied on parent --> wait for the parent promise not the child
		return FlexRuntimeInfoAPI.waitForChanges({element: this.getAdaptationControl()});
	};

	AdaptationFilterBar.prototype.getAdaptationController = function(){
		return this.getAdaptationControl().getAdaptationController();
	};

	AdaptationFilterBar.prototype.retrieveAdaptationController = function(){
		return this.getAdaptationControl().retrieveAdaptationController();
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
		return new Promise(function(resolve, reject){
			this.initialized().then(function(){
				var mConditions = this._bPersistValues ? this.getAdaptationControl().getFilterConditions() : this.getAdaptationControl()._getXConditions();
				this._setXConditions(mConditions, true);

				if (this._bFilterFieldsCreated) {
					resolve(this);
					return;
				}

				var oDelegate = this.getAdaptationControl().getControlDelegate();

				//used to store the originals
				this.mOriginalsForClone = {};

				this.oAdaptationModel.getProperty("/items").forEach(function(oItem, iIndex){
					var oFilterFieldPromise;

					if (this.getAdvancedMode()) {
						oFilterFieldPromise = this._checkExisting(oItem, oDelegate);
					} else {
						oFilterFieldPromise = oDelegate.getFilterDelegate().addFilterItem(oItem, this.getAdaptationControl());
					}

					oFilterFieldPromise.then(function(oFilterField){

						var oFieldForDialog;

						//Important: always use clones for the personalization dialog. The "originals" should never be shown in the P13n UI
						//Currently the advancedMode property is being used in case a more complex personalization is required, this is
						//as of now only part for the sap.ui.mdc.FilterBar, as the AdaptationFilterBar will allow to select FilterFields in advance.
						//This logic requires a cloning logic, as there is a mix of parent/child filterFields which is not the case if the advancedMode
						//is configured to false.
						if (this.getAdvancedMode()) {
							if (oFilterField._bTemporaryOriginal) {
								delete oFilterFieldPromise._bTemporaryOriginal;
								this.mOriginalsForClone[oFilterField.getFieldPath()] = oFilterField;
							}
							oFieldForDialog = oFilterField.clone();
						} else {
							oFieldForDialog = oFilterField;
						}

						this.addAggregation("filterItems", oFieldForDialog);
						if (iIndex == this.oAdaptationModel.getProperty("/items").length - 1) {
							if (this._oFilterBarLayout.getInner().setP13nModel){
								this._oFilterBarLayout.getInner().setP13nModel(this.oAdaptationModel);
							}
							this._bFilterFieldsCreated = true;
							resolve(this);
						}
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	/**
	 * This method checks whether a FilterField is already present on the parent and will return this
	 * instead of requesting a new one.
	 *
	 * @param {object} oItem Corresponding item in the AdaptaitonModel
	 * @param {object} oDelegate Parent delegate
	 *
	 * @returns {Promise} A Promise resolving in the corresponding FilterField
	 */
	AdaptationFilterBar.prototype._checkExisting = function(oItem, oDelegate) {
		var oFilterFieldPromise;

		var mExistingFilterItems = this.getAdaptationControl().getFilterItems().reduce(function(mMap, oField){
			mMap[oField.getFieldPath()] = oField;
			return mMap;
		},{});

		if (mExistingFilterItems[oItem.name]){
			oFilterFieldPromise = Promise.resolve(mExistingFilterItems[oItem.name]);
		}else {
			oFilterFieldPromise = oDelegate.addItem(oItem.name, this.getAdaptationControl()).then(function(oFilterField){
				oFilterField._bTemporaryOriginal = true;
				return oFilterField;
			});
		}

		return oFilterFieldPromise;
	};

	AdaptationFilterBar.prototype._executeRequestedRemoves = function() {

		var aExistingItems = this._oFilterBarLayout.getInner().getSelectedFields();

		Object.keys(this.mOriginalsForClone).forEach(function(sKey){
			var oDelegate = this.getAdaptationControl().getControlDelegate();

			if (aExistingItems.indexOf(sKey) < 0) {
				oDelegate.afterRemoveFilterFlex.call(oDelegate, sKey, this.getAdaptationControl());
			}

			delete this.mOriginalsForClone[sKey];

		}.bind(this));
	};

	AdaptationFilterBar.prototype.setAdvancedMode = function(bAdvancedUI, bSuppressInvalidate) {
		this.setProperty("advancedMode", bAdvancedUI, bSuppressInvalidate);
		this._createInnerLayout();
		//this._oFilterBarLayout.getInner().setAllowSelection(bAdvancedUI);
		//this._oFilterBarLayout.getInner().setGrouping(bAdvancedUI);
		return this;
	};

	AdaptationFilterBar.prototype._createInnerLayout = function() {
		//TODO: check if Table can use new layout
		this._cLayoutItem = this.getAdvancedMode() ? FilterGroupLayout : FilterColumnLayout;
		this._oFilterBarLayout = this.getAdvancedMode() ? new GroupContainer() : new TableContainer();
		this._oFilterBarLayout.getInner().setParent(this);
		this.setAggregation("layout", this._oFilterBarLayout, true);
		this.addStyleClass("sapUIAdaptationFilterBar");
		if (this._oFilterBarLayout.getInner().attachChange) {
			this._oFilterBarLayout.getInner().attachChange(function(){
				this.fireChange();
			}.bind(this));
		}
	};

	AdaptationFilterBar.prototype.exit = function() {
		FilterBarBase.prototype.exit.apply(this, arguments);
		this.oAdaptationModel = null;
	};

	return AdaptationFilterBar;

});

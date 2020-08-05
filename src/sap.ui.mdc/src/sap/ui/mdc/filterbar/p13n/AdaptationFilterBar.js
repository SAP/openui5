/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/p13n/P13nBuilder", "sap/ui/mdc/filterbar/p13n/TableContainer", "sap/ui/mdc/filterbar/p13n/FilterColumnLayout", "sap/ui/mdc/filterbar/FilterBarBase", "sap/ui/mdc/filterbar/FilterBarBaseRenderer", "sap/ui/mdc/p13n/FlexUtil", "sap/ui/fl/apply/api/FlexRuntimeInfoAPI", "sap/base/util/merge"
], function(P13nBuilder, TableContainer, FilterColumnLayout, FilterBarBase, FilterBarBaseRenderer, FlexUtil, FlexRuntimeInfoAPI, merge) {
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
				adaptationControl: {
					type: "object"
				}
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
		if (bLive === false) {
			this._oConditionModel.detachPropertyChange(this._handleConditionModelPropertyChange, this);

			//TODO: do not rely on parent control structure (e.g. Dialog)
			this.getParent().getButtons()[0].attachPress(function(){
			var mConditions = this._getModelConditions(this._getConditionModel(), false, true);
			this.retrieveAdaptationController().then(function (oAdaptationController) {
				oAdaptationController.createConditionChanges(mConditions);
			});
			}.bind(this));

			//TODO: do not rely on parent control structure (e.g. Dialog)
			this.getParent().getButtons()[1].attachPress(function(){
				this._setXConditions(this.getAdaptationControl().getFilterConditions(), true);
			}.bind(this));
		}
		return this;
	};

	AdaptationFilterBar.prototype._getWaitForChangesPromise = function() {
		return FlexRuntimeInfoAPI.waitForChanges({element: this.getAdaptationControl()});
	};

	AdaptationFilterBar.prototype.retrieveAdaptationController = function(){
		return FilterBarBase.prototype.retrieveAdaptationController.apply(this, arguments).then(function (oAdaptationController) {
			this._oAdaptationController = oAdaptationController;
			this._oAdaptationController.setLiveMode(this.getLiveMode());
			this._oAdaptationController.setAfterChangesCreated(function(oAC, aChanges){
				this.rerouteChangesBeforeAppliance(aChanges);
				FlexUtil.handleChanges(aChanges);
			}.bind(this));
			return this._oAdaptationController;
		}.bind(this));
	};

	AdaptationFilterBar.prototype.applyConditionsAfterChangesApplied = function() {
		FilterBarBase.prototype.applyConditionsAfterChangesApplied.apply(this, arguments);
		this.triggerSearch();
	};

	AdaptationFilterBar.prototype.rerouteChangesBeforeAppliance = function(aChanges){
		aChanges.forEach(function(aChange){
			aChange.selectorElement = this.getAdaptationControl();
		}.bind(this));
	};

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
			this._setXConditions(this.getAdaptationControl().getFilterConditions(), true);
			this._aProperties = aPropertyInfo;
		}.bind(this));

	};

	AdaptationFilterBar.prototype.createFilterFields = function(oAdaptationModel){
		return this.initialized().then(function(){
			var mProperties = P13nBuilder.arrayToMap(this._aProperties);
			oAdaptationModel.getProperty("/items").forEach(function(oItem){
				var oProperty = mProperties[oItem.name];
				var oAdaptationControl = this.getAdaptationControl();
				var mFilterHandler = this.getAdaptationControl().getControlDelegate().getFilterDelegate();
				if (oProperty && oProperty.filterable !== false) {
					var oFilterFieldPromise = mFilterHandler.addFilterItem(oProperty, oAdaptationControl);
					oFilterFieldPromise.then(function(oFilterField){
						this.addAggregation("filterItems", oFilterField);
					}.bind(this));
				}
			}, this);
		}.bind(this));
	};

	AdaptationFilterBar.prototype._createInnerLayout = function() {
		this._cLayoutItem = FilterColumnLayout;
		this._oFilterBarLayout = new TableContainer();
		this._oFilterBarLayout.getInner().addStyleClass("sapUiMdcFilterBarBaseAFLayout");
		this.setAggregation("layout", this._oFilterBarLayout, true);
	};

	return AdaptationFilterBar;

});

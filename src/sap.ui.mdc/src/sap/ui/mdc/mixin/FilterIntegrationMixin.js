/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/base/Log"
], function (Core, Log) {
	"use strict";

	/**
	 * @namespace
	 * @name sap.ui.mdc.mixin
	 * @private
	 * @experimental
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Enhances a given control prototype with consolidated handling for external IFilter integration
	 *
	 * The following methods are available:
	 *
	 * <ul>
	 * <li><code>setFilter</code> - The setter for the <code>filter</code> association</li>
	 * <li><code>_registerFilter</code> - Registers the control instance to the external provided IFilter events <code>search</code> and <code>filtersChanged</code></li>
	 * <li><code>_deregisterFilter</code> - Deregisters the control instance from the external provided IFilter events</li>
	 * <li><code>_validateFilter</code> - Validates the provided <code>IFilter</code> control instance and may return an error</li>
	 * <li><code>_onFilterProvided</code> - Notifies the Control that the <code>filter</code> association has been validated and provided</li>
	 * <li><code>checkAndRebind</code> - Executes a the <code>rebind</code> method for the given control instance.</li>
	 * </ul>
	 *
	 * To use the FilterIntegrationMixin, the implementing Control requires the <code>filter</code> associaton.
	 *
	 * Additionally, the following methods are necessary to be implemented:
	 *
	 * <ul>
	 * <li><code>rebind</code></li>
	 * <li><code>isFilteringEnabled</code></li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.FilterIntegrationMixin
	 * @namespace
	 * @since 1.82.0
	 * @private
	 * @experimental
	 * @ui5-restricted sap.ui.mdc
	*/
    var FilterIntegrationMixin = {};

    var IFILTER = "sap.ui.mdc.IFilter";

	/**
	 * Set an external IFilter source to connect it with the given control instane.
	 *
	 * @param {sap.ui.mdc.filterbar.FilterBarBase} vFilter IFilter implementing control instance.
	 * @returns {sap.ui.mdc.Control} The MDC Control instance.
	 */
	FilterIntegrationMixin.setFilter = function (vFilter) {

		if (this._validateFilter(vFilter)) {
			this._deregisterFilter();

			this.setAssociation("filter", vFilter, true);

			this._registerFilter();

			this._onFilterProvided();
		}

		return this;
	};

	/**
	 * Hook which can be used after a valid filter association has been set via <code>FilterIntegrationMixin</code>.
	 */
	FilterIntegrationMixin._onFilterProvided = function() {
		return;
	};

	/**
	 * Registers the MDC Control to the provided IFilter control instance
	 * events <code>search</code> and <code>filtersChanged</code>.
	 */
    FilterIntegrationMixin._registerFilter = function() {
		var oFilter = Core.byId(this.getFilter());
		if (oFilter) {
			oFilter.attachSearch(this.rebind, this);
			oFilter.attachFiltersChanged(this._onFiltersChanged, this);
		}
	};

	/**
	 * Deregisters the MDC Control to the provided IFilter control instance.
	 * events <code>search</code> and <code>filtersChanged</code>.
	 */
    FilterIntegrationMixin._deregisterFilter = function() {
		var oFilter = Core.byId(this.getFilter());
		if (oFilter) {
			oFilter.detachSearch(this.rebind, this);
			oFilter.detachFiltersChanged(this._onFiltersChanged, this);
		}
	};


	/**
	 * Sanity check if the inheriting control fulfills the FilterIntegrationMixin requirements
	 */
	var _checkFISanity = function(oControl) {

		//TODO: consider to dynamically add properties/associations in the MDC mixins
		if (!(oControl && oControl.getMetadata() && oControl.getMetadata().hasAssociation("filter"))) {
			throw new Error("Please add the 'filter' association to your control metadata" + oControl);
		}

		if (!(oControl.rebind instanceof Function)) {
			throw new Error("Please implement the method 'rebind' for the control " + oControl);
		}

		if (!(oControl.isFilteringEnabled instanceof Function)) {
			throw new Error("Please implement the method isFilteringEnabled for the control " + oControl);
		}

	};

	/**
	 * Set an external IFilter source to connect it with the given control instane.
	 *
	 * @param {sap.ui.mdc.filterbar.FilterBarBase} vFilter IFilter implementing control instance.
	 * @throws {Error} An error is being raised in case the provided Control instance does not implement IFilter.
	 */
	FilterIntegrationMixin._validateFilter = function(vFilter) {
		_checkFISanity(this);

		var oFilter = typeof vFilter === "object" ? vFilter : Core.byId(vFilter);
		if (!oFilter || oFilter.isA(IFILTER)) {
			return true;
		}
		throw new Error("\"" + vFilter + "\" is not valid for association \"filter\" of mdc.Table. Please use an object that implements \"" + IFILTER + "\" interface");
	};

	/**
	 * Executes a rebind considering the provided external and inbuilt filtering.
	 */
	FilterIntegrationMixin.checkAndRebind = function() {

		//check for internal and external filtering before triggering a rebind
		var pOuterFilterSearch;
		var pInnerFilterSearch;
		var oFilter = Core.byId(this.getFilter()), bInbuiltEnabled = this.isFilteringEnabled();

		//check if there is any external/internal filter source
		if (bInbuiltEnabled || oFilter) {

			if (oFilter) {
				pOuterFilterSearch = oFilter.valid(false);
			}

			if (bInbuiltEnabled) {
				pInnerFilterSearch = this.retrieveInbuiltFilter().then(function(oInnerFilter){
					return oInnerFilter.valid(false);
				});
			}

			Promise.all([
				pOuterFilterSearch,
				pInnerFilterSearch
			]).then(function() {
				this.rebind();
			}.bind(this), function(){

				//TODO:
				//Do some stuff in case something gets rejected

			});
		} else {

			//No Filter source provided --> rebind immediately
			this.rebind();
		}

	};

	return function () {

        this.setFilter = FilterIntegrationMixin.setFilter;
        this._registerFilter = FilterIntegrationMixin._registerFilter;
        this._deregisterFilter = FilterIntegrationMixin._deregisterFilter;
		this._validateFilter = FilterIntegrationMixin._validateFilter;
		this._onFilterProvided = FilterIntegrationMixin._onFilterProvided;
        this.checkAndRebind = FilterIntegrationMixin.checkAndRebind;
	};

}, /* bExport= */ true);

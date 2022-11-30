/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core"
], function (Core) {
	"use strict";

	/**
	 * Enhances a given control prototype with consolidated handling for external IFilter integration
	 *
	 * The following methods are available:
	 *
	 * <ul>
	 * <li><code>setFilter</code> - The setter for the <code>filter</code> association</li>
	 * <li><code>_validateFilter</code> - Validates the provided <code>IFilter</code> control instance and may return an error</li>
	 * <li><code>rebind</code> - Executes a the <code>rebind</code> method for the given control instance.</li>
	 * </ul>
	 *
	 * To use the FilterIntegrationMixin, the implementing Control requires the <code>filter</code> associaton.
	 *
	 * Additionally, the following methods are necessary to be implemented:
	 *
	 * <ul>
	 * <li><code>_rebind</code></li>
	 * <li><code>isFilteringEnabled</code></li>
	 * </ul>
	 *
	 * Hooks that are called by the FilterIntegrationMixin if implemented in the control.
	 *
	 * <ul>
	 * <li><code>_onFilterProvided(oFilter: sap.ui.mdc.IFilter)</code>
	 *     - Notifies the control that a valid <code>filter</code> association has been provided. The provided filter instance is passed.</li>
	 * <li><code>_onFilterRemoved(oFilter: sap.ui.mdc.IFilter)</code>
	 *     - Notifies the control that the <code>filter</code> association has been removed. The removed filter instance is passed.</li>
	 * <li><code>_onFiltersChanged(oEvent)</code>
	 *     - Called when the <code>search</code> event of the filter is fired. The event object is passed.</li>
	 * <li><code>_onFilterSearch(oEvent)</code>
	 *     - Called when the <code>filtersChanged</code> event of the filter is fired. The event object is passed.</li>
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
	 * Set an external IFilter source to connect it with the given control instance.
	 *
	 * @param {sap.ui.mdc.IFilter} vFilter IFilter implementing instance.
	 * @returns {sap.ui.mdc.Control} The MDC Control instance.
	 */
	FilterIntegrationMixin.setFilter = function (vFilter) {

		var sNewFilter = typeof vFilter === "object" ? vFilter.getId() : vFilter;
		var sOldFilter = this.getFilter();

		if (sOldFilter !== sNewFilter) {
			this._validateFilter(vFilter);

			var oOldFilter = Core.byId(this.getFilter());
			if (oOldFilter) {
				deregisterFilter(this, oOldFilter);
			}

			this.setAssociation("filter", vFilter, true);

			var oNewFilter = Core.byId(this.getFilter());
			if (oNewFilter) {
				registerFilter(this, oNewFilter);
			}
		}

		return this;
	};

	function onSearch(oEvent) {
		this._rebind();
		if (this._onFilterSearch) {
			this._onFilterSearch(oEvent);
		}
	}

	function onFiltersChanged(oEvent) {
		if (this._onFiltersChanged) {
			this._onFiltersChanged(oEvent);
		}
	}

	/**
	 * Registers the control instance to the provided IFilter.
	 *
	 * @param {sap.ui.mdc.Control} oControl Control instance.
	 * @param {sap.ui.mdc.IFilter} oFilter IFilter implementing instance.
	 */
    function registerFilter(oControl, oFilter) {
		oFilter.attachSearch(onSearch, oControl);

		if (oFilter.attachFiltersChanged instanceof Function) {
			oFilter.attachFiltersChanged(onFiltersChanged, oControl);
		}

		if (oControl._onFilterProvided instanceof Function) {
			oControl._onFilterProvided(oFilter);
		}
	}

	/**
	 * Deregisters the control instance from the provided IFilter.
	 *
	 * @param {sap.ui.mdc.Control} oControl Control instance.
	 * @param {sap.ui.mdc.IFilter} oFilter IFilter implementing instance.
	 */
    function deregisterFilter(oControl, oFilter) {
		oFilter.detachSearch(onSearch, oControl);

		if (oFilter.detachFiltersChanged instanceof Function) {
			oFilter.detachFiltersChanged(onFiltersChanged, oControl);
		}

		if (oControl._onFilterRemoved instanceof Function) {
			oControl._onFilterRemoved(oFilter);
		}
	}

	/**
	 * Sanity check if the inheriting control fulfills the FilterIntegrationMixin requirements
	 */
	function _checkFISanity(oControl) {

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

	}

	/**
	 * Validates the provided <code>IFilter</code> instance.
	 *
	 * @param {sap.ui.mdc.IFilter|string} vFilter IFilter implementing instance or its ID.
	 * @throws {Error} An error is being raised in case the provided control instance does not implement IFilter.
	 */
	FilterIntegrationMixin._validateFilter = function(vFilter) {
		_checkFISanity(this);

		var oFilter = typeof vFilter === "object" ? vFilter : Core.byId(vFilter);
		if (oFilter && !oFilter.isA(IFILTER)) {
			throw new Error("\"" + vFilter + "\" is not valid for association \"filter\"."
							+ " Please use an object that implements the \"" + IFILTER + "\" interface");
		}
	};

	/**
	 * Executes a rebind considering the provided external and inbuilt filtering.
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.98
	 */
	FilterIntegrationMixin.rebind = function() {

		if (this.bIsDestroyed) {
			return;
		}

		//check for internal and external filtering before triggering a rebind
		var pOuterFilterSearch;
		var pInnerFilterSearch;
		var oFilter = Core.byId(this.getFilter()), bInbuiltEnabled = this.isFilteringEnabled();

		//check if there is any external/internal filter source
		if (bInbuiltEnabled || oFilter) {

			if (oFilter) {
				pOuterFilterSearch = oFilter.validate(true);
			}

			if (bInbuiltEnabled) {
				pInnerFilterSearch = this.retrieveInbuiltFilter().then(function(oInnerFilter){
					return oInnerFilter.validate(true);
				});
			}

			Promise.all([
				pOuterFilterSearch,
				pInnerFilterSearch
			]).then(function() {
				this._rebind();
			}.bind(this), function(){

				//TODO:
				//Do some stuff in case something gets rejected

			});
		} else {

			//No Filter source provided --> rebind immediately
			this._rebind();
		}

	};

	return function () {

        this.setFilter = FilterIntegrationMixin.setFilter;
		this._validateFilter = FilterIntegrationMixin._validateFilter;
        this.rebind = FilterIntegrationMixin.rebind;
	};

});

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log", "sap/ui/core/Element", "sap/ui/mdc/enums/ReasonMode"
], (Log, Element, ReasonMode) => {
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
	 * <li><code>_onFilterSearch(oEvent)</code>
	 *     - Called when the <code>search</code> event of the filter is fired. The event object is passed.</li>
	 * <li><code>_onFiltersChanged(oEvent)</code>
	 *     - Called when the <code>filtersChanged</code> event of the filter is fired. The event object is passed.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.FilterIntegrationMixin
	 * @namespace
	 * @since 1.82.0
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const FilterIntegrationMixin = {};

	const IFILTER = "sap.ui.mdc.IFilter";

	/**
	 * Set an external IFilter source to connect it with the given control instance.
	 * @public
	 * @param {sap.ui.mdc.IFilter|string} vFilter IFilter implementing instance or its id.
	 * @returns {sap.ui.mdc.Control} The MDC Control instance.
	 */
	FilterIntegrationMixin.setFilter = function(vFilter) {

		const sNewFilter = typeof vFilter === "object" ? vFilter.getId() : vFilter;
		const sOldFilter = this.getFilter();

		if (sOldFilter !== sNewFilter) {
			this._validateFilter(vFilter);

			const oOldFilter = Element.getElementById(this.getFilter());
			if (oOldFilter) {
				deregisterFilter(this, oOldFilter);
			}

			this.setAssociation("filter", vFilter, true);

			const oNewFilter = Element.getElementById(this.getFilter());
			if (oNewFilter) {
				registerFilter(this, oNewFilter);
			}
		}

		return this;
	};

	/**
	 * Event handler that is attached to the <code>search</code>
	 * event of the IFilter implementing instance. The handler
	 * triggers rebind and calls the _onFilterSearch hook.
	 *
	 * @param {object} oEvent Event object
	 */
	function onSearch(oEvent) {
		const sReason = oEvent.getParameter('reason');
		const oFilter = oEvent.getSource();
		const bForceRefresh = oFilter.getLiveMode && (oFilter.getLiveMode() ? sReason === ReasonMode.Enter : sReason === ReasonMode.Go);

		this._rebind(bForceRefresh);
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

		const oFilter = typeof vFilter === "object" ? vFilter : Element.getElementById(vFilter);
		if (oFilter && !oFilter.isA(IFILTER)) {
			throw new Error("\"" + vFilter + "\" is not valid for association \"filter\"." +
				" Please use an object that implements the \"" + IFILTER + "\" interface");
		}
	};

	/**
	 * Executes a rebind considering the provided external and inbuilt filtering.
	 *
	 * @returns {Promise}
	 *     A <code>Promise</code> that resolves after rebind is executed, and rejects if
	 *     rebind cannot be executed, for example because there are invalid filters.
	 * @public
	 * @since 1.98
	 */
	FilterIntegrationMixin.rebind = function() {

		if (this.bIsDestroyed) {
			return Promise.reject("Destroyed");
		}

		//check for internal and external filtering before triggering a rebind
		let pOuterFilterSearch;
		let pInnerFilterSearch;
		const oFilter = Element.getElementById(this.getFilter()),
			bInbuiltEnabled = this.isFilteringEnabled();

		//check if there is any external/internal filter source
		if (bInbuiltEnabled || oFilter) {

			if (oFilter) {
				pOuterFilterSearch = oFilter.validate(true);
			}

			if (bInbuiltEnabled) {
				pInnerFilterSearch = this.retrieveInbuiltFilter().then((oInnerFilter) => {
					return oInnerFilter.validate(true);
				});
			}

			return Promise.all([
				pOuterFilterSearch, pInnerFilterSearch
			]).then(() => {
				return this._rebind();
			});
		} else {

			//No Filter source provided --> rebind immediately
			return this._rebind();
		}

	};

	FilterIntegrationMixin._getLabelsFromFilterConditions = function() {
		const aLabels = [];

		if (this.getFilterConditions) {
			const aFilterConditions = this.getFilterConditions();
			Object.keys(aFilterConditions).forEach((oConditionKey) => {

				if (!aFilterConditions[oConditionKey] || aFilterConditions[oConditionKey].length < 1) {
					return;
				}

				const sLabel = this.getPropertyHelper().getProperty(oConditionKey) ? this.getPropertyHelper().getProperty(oConditionKey).label : oConditionKey; //TODO the property for the filter might not exitst when you select a variant

				if (sLabel) {
					aLabels.push(sLabel);
				}
				if (!sLabel || sLabel === oConditionKey) {
					Log.error("No valid property found for filter with key " + oConditionKey + ". Check your metadata.");
				}
			});
		}

		return aLabels;
	};

	return function() {

		this.setFilter = FilterIntegrationMixin.setFilter;
		this._validateFilter = FilterIntegrationMixin._validateFilter;
		this.rebind = FilterIntegrationMixin.rebind;
		this._getLabelsFromFilterConditions = FilterIntegrationMixin._getLabelsFromFilterConditions;
	};

});
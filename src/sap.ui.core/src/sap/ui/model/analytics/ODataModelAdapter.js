/*!
 * ${copyright}
 */
/*eslint-disable max-len */
/**
 * Analytical Adapter for ODataModels
 *
 * @namespace
 * @name sap.ui.model.analytics
 * @public
 */

// Provides class ODataModelAdapter
sap.ui.define(['./AnalyticalBinding', "./AnalyticalTreeBindingAdapter", './odata4analytics'], function(AnalyticalBinding, AnalyticalTreeBindingAdapter, odata4analytics) {
"use strict";

/**
 * If called on an instance of an (v1/v2) ODataModel it will enrich it with analytics capabilities.
 *
 * @alias sap.ui.model.analytics.ODataModelAdapter
 * @function
 * @deprecated As of version 2.0, will be replaced by OData V4 data aggregation, see
 *   {@link topic:7d914317c0b64c23824bf932cc8a4ae1 Extension for Data Aggregation}
 * @protected
 */
var ODataModelAdapter = function() {
	// "this" is the prototype now when called with apply()

	// make sure the version is set correctly, depending on the used ODataModel
	const iModelVersion = AnalyticalBinding._getModelVersion(this);
	// ensure only ODataModel are enhanced which have not been enhanced yet
	if (iModelVersion === null || this.getAnalyticalExtensions) {
		return;
	}

	// Keep a reference on the bindList and bindTree function before applying the Adapter-Functions,
	// this way the old functions do not get lost and the correct one is used for "prototype" calls.
	// Previously only the ODataModel V1 prototype functions would get called
	this._mPreadapterFunctions = {
		bindList: this.bindList,
		bindTree: this.bindTree
	};

	// apply the methods of the adapters prototype to the ODataModelAdapter instance
	for (var fn in ODataModelAdapter.prototype) {
		if (ODataModelAdapter.prototype.hasOwnProperty(fn)) {
			this[fn] = ODataModelAdapter.prototype[fn];
		}
	}
};

/*
 * @see sap.ui.model.odata.ODataModel#bindList
 * @see sap.ui.model.odata.v2.ODataModel#bindList
 */
ODataModelAdapter.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
	// detection for usage of AnalyticalBinding (aligned with AnalyticalTable#bindRows)
	if (mParameters && mParameters.analyticalInfo) {
		var oBinding = new AnalyticalBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		AnalyticalTreeBindingAdapter.apply(oBinding); // enhance the TreeBinding wit an adapter for the ListBinding
		return oBinding;
	} else {
		// calling the preadapter functions makes sure, that v1 or v2 ODataListBindings get instantiated, depending on the model
		return this._mPreadapterFunctions.bindList.apply(this, arguments);
	}
};

/*
 * @see sap.ui.model.odata.ODataModel#bindTree
 * @see sap.ui.model.odata.v2.ODataModel#bindTree
 */
ODataModelAdapter.prototype.bindTree = function(sPath, oContext, aFilters, mParameters) {
	// detection for usage of AnalyticalBinding (aligned with AnalyticalTable#bindRows)
	if (mParameters && mParameters.analyticalInfo) {
		var oBinding = new AnalyticalBinding(this, sPath, oContext, [], aFilters, mParameters);
		return oBinding;
	} else {
		// calling the preadapter functions makes sure, that v1 or v2 ODataTreeBindings get instantiated, depending on the model
		return this._mPreadapterFunctions.bindTree.apply(this, arguments);
	}
};

/**
 * @return {sap.ui.model.analytics.odata4analytics.Model} Model providing access to analytical
 *         extensions of the OData model or null if the services does not
 *         include analytical extensions
 * @public
 */
ODataModelAdapter.prototype.getAnalyticalExtensions = function() {
	// initialize API by loading the analytical OData model
	if (this.oOData4SAPAnalyticsModel != undefined && this.oOData4SAPAnalyticsModel != null) {
		return this.oOData4SAPAnalyticsModel;
	}

	const iModelVersion = AnalyticalBinding._getModelVersion(this);
	// Throw Error if metadata was not loaded
	if (iModelVersion === 2 && !(this.oMetadata && this.oMetadata.isLoaded())) {
		throw new Error("Failed to get the analytical extensions. The metadata have not been loaded by the model"
			+ " yet. Register for the 'metadataLoaded' event of the ODataModel(v2) to know when the analytical"
			+ " extensions can be retrieved.");
	}

	// initialize API by loading the analytical OData model
	try {
		this.oOData4SAPAnalyticsModel = new odata4analytics.Model(
			new odata4analytics.Model.ReferenceByModel(this));
	} catch (exception) {
		throw new Error("Failed to instantiate analytical extensions for given OData model: "
			+ (exception.message || exception));
	}
	return this.oOData4SAPAnalyticsModel;
};

/**
 * Set the model to be used by the ODataModelAdapter for providing access to analytical
 * extensions of the OData model.
 *
 * @param {sap.ui.model.analytics.odata4analytics.Model} oOData4SAPAnalyticsModel The model to be used
 * @public
 */
ODataModelAdapter.prototype.setAnalyticalExtensions = function(oOData4SAPAnalyticsModel) {
	this.oOData4SAPAnalyticsModel = oOData4SAPAnalyticsModel;
};

return ODataModelAdapter;
});
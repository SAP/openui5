/*!
 * ${copyright}
 */

/**
 * Analytical Adapter for ODataModels
 * 
 * @namespace
 * @name sap.ui.model.analytics
 * @public
 */

// Provides class ODataModelAdapter
sap.ui.define(['jquery.sap.global', './AnalyticalBinding', "./TreeBindingAdapter", 'sap/ui/model/odata/ODataModel', './odata4analytics'],
	function(jQuery, AnalyticalBinding, TreeBindingAdapter, ODataModel, odata4analytics) {
	"use strict";
	
	
	/**
	 * If called on an instance of an ODataModel it will enrich it with analytics capabilities.
	 *
	 * @name sap.ui.model.analytics.ODataModelAdapter
	 * @function
	 * @experimental This module is only for experimental use!
	 * @protected
	 */
	var ODataModelAdapter = function() {
		// "this" is the prototype now when called with apply()
	
		// ensure only ODataModel are enhanced which have not been enhanced yet
		if (!(this instanceof ODataModel && this.getAnalyticalExtensions === undefined)) {
			return;
		}
	
		// apply the methods of the adapters prototype to the ODataModelAdapter instance
		for (var fn in ODataModelAdapter.prototype) {
			if (ODataModelAdapter.prototype.hasOwnProperty(fn)) {
				this[fn] = ODataModelAdapter.prototype[fn];
			}
		}
		
		// disable the count support (inline count is required for AnalyticalBinding)
		if (this.isCountSupported()) {
			jQuery.sap.log.info("ODataModelAdapter: switched ODataModel to use inlinecount (mandatory for analytical bindings)");
			this.setCountSupported(false);
		}
		
	};
	
	/**
	 * @see sap.ui.model.odata.ODataModel#bindList
	 * @name sap.ui.model.odata.ODataModelAdapter#bindList
	 * @function
	 */
	ODataModelAdapter.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		// detection for usage of AnalyticalBinding (aligned with AnalyticalTable#bindRows)
		if (mParameters && mParameters.analyticalInfo) {
			var oBinding = new AnalyticalBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
			TreeBindingAdapter.apply(oBinding); // enhance the TreeBinding wit an adapter for the ListBinding
			return oBinding;
		} else {
			return ODataModel.prototype.bindList.apply(this, arguments);
		}
	};
	
	/**
	 * @see sap.ui.model.odata.ODataModel#bindTree
	 * @name sap.ui.model.odata.ODataModelAdapter#bindTree
	 * @function
	 */
	ODataModelAdapter.prototype.bindTree = function(sPath, oContext, aFilters, mParameters) {
		// detection for usage of AnalyticalBinding (aligned with AnalyticalTable#bindRows)
		if (mParameters && mParameters.analyticalInfo) {
			var oBinding = new AnalyticalBinding(this, sPath, oContext, [], aFilters, mParameters);
			return oBinding;
		} else {
			return ODataModel.prototype.bindTree.apply(this, arguments);
		}
	};
	
	/**
	 * @name sap.ui.model.odata.ODataModelAdapter#getAnalyticalExtensions
	 * @function
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
	
		var sAnnotationDoc = null;
	
		if (arguments.length == 1) {
			// hidden feature: load resource with additional analytical metadata
			// defined in a JSON format
			var sAnnotationDocURI = arguments[0];
	
			var oResult = jQuery.sap.syncGetText(sAnnotationDocURI);
			if (oResult.success) {
				sAnnotationDoc = oResult.data;
			}
		}
	
		// initialize API by loading the analytical OData model
		try {
			this.oOData4SAPAnalyticsModel = new odata4analytics.Model(new odata4analytics.Model.ReferenceByModel(this), {sAnnotationJSONDoc: sAnnotationDoc});
		} catch (exception) {
			throw "Failed to instantiate analytical extensions for given OData model: " + exception.message;
		}
		return this.oOData4SAPAnalyticsModel;
	};
	
	return ODataModelAdapter;

}, /* bExport= */ true);

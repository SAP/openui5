/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/View',
		'sap/ui/core/sample/common/Component',
		'sap/ui/model/odata/v4/ODataModel'
	], function (jQuery, View, BaseComponent, ODataModel) {
	"use strict";

	var Component = BaseComponent.extend("sap.ui.core.sample.odata.v4.PropertyBinding.Component", {
		metadata : "json",

		createContent : function () {
			var sServiceUri = this.proxy("/sap/opu/local_v4/IWBEP/TEA_BUSI/"),
				oModel = new ODataModel(sServiceUri, {useBatch : false});

			return sap.ui.view({
				type : sap.ui.core.mvc.ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.PropertyBinding.Main",
				models : oModel
			});
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
			// - ComplexType resolution; service is not yet able to resolve complex types
		}
	});

	return Component;
});

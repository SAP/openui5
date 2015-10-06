/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   V4_GW_SAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/View",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/odata/v4/ODataModel"
], function (jQuery, View, BaseComponent, ODataModel) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.SalesOrders.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var sServiceUri = this.proxy("/sap/opu/local_V4/IWBEP/V4_GW_SAMPLE_BASIC/"),
				oModel = new ODataModel({serviceUrl: sServiceUri});

			return sap.ui.view({
				type : sap.ui.core.mvc.ViewType.XML,
				id : "MainView",
				viewName : "sap.ui.core.sample.odata.v4.SalesOrders.Main",
				models : oModel
			});
			// TODO: enhance sample application after features are supported
			// - Error Handling; not yet implemented in model
		}
	});
});

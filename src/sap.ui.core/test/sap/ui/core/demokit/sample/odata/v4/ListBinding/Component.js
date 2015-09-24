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

	var Component = BaseComponent.extend("sap.ui.core.sample.odata.v4.ListBinding.Component", {
		metadata : "json",

		createContent : function () {
			var sServiceUri = this.proxy("/sap/opu/local_v4/IWBEP/TEA_BUSI/"),
				oModel = new ODataModel({
					serviceUrl: sServiceUri
				});

			return sap.ui.view({
				type : sap.ui.core.mvc.ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ListBinding.Main",
				models : oModel
			});
		}
	});

	return Component;
});

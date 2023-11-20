/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *  zui5_epm_sample OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (HBox, library, UIComponent, View, JSONModel, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return UIComponent.extend("sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel(),
				oMetaModel = oModel.getMetaModel(),
				bRealOData = TestUtils.isRealOData();

			oMetaModel.setDefaultBindingMode("OneWay");

			View.create({
				async : true,
				bindingContexts : {
					undefined : oModel.createBindingContext("/BusinessPartnerList")
				},
				models : {
					// Note: XML Templating creates bindings to default model only!
					undefined : oModel,
					metaModel : oMetaModel,
					ui : new JSONModel({
						sCode : "",
						bCodeVisible : false,
						bRealOData : bRealOData,
						icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
						iconTooltip : bRealOData ? "real OData service" : "mock OData service"
					})
				},
				preprocessors : {
					xml : {
						bindingContexts : {
							data : oModel.createBindingContext("/BusinessPartnerList")
						},
						models : {
							data : oModel,
							meta : oMetaModel
						}
					}
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		}
	});
});

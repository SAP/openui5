sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/demo/wt/controller/HelloDialog",
	"sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, JSONModel, ResourceModel, HelloDialog, ODataModel) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.wt.Component", {

		metadata : {
			name : "Hello World",
			rootView : "sap.ui.demo.wt.view.App",
			dependencies : {
				libs : [ "sap.m" ]
			},
			config : {
				messageBundle : "sap.ui.demo.wt.i18n.messageBundle",
				invoiceLocal : jQuery.sap.getModulePath("sap.ui.demo.wt", "/model/invoices.json"),
				//invoiceRemote : "/proxy/http/services.odata.org/V3/Northwind/Northwind.svc/"
				invoiceRemote : "my/service/url/"
			}
		},

		init : function () {

			// call the overridden init function
			UIComponent.prototype.init.apply(this, arguments);

			// set data model
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oDataModel = new JSONModel(oData);
			this.setModel(oDataModel);

			// set i18n model
			var config = this.getMetadata().getConfig();
			var i18nModel = new ResourceModel({
				bundleName : config.messageBundle
			});
			this.setModel(i18nModel, "i18n");

			// set invoice model - local
			//var oInvoiceModel = new JSONModel(config.invoiceLocal);
			//this.setModel(oInvoiceModel, "invoice");

			// set invoice model - remote
			var oInvoiceModel = new ODataModel(config.invoiceRemote, true);
			this.setModel(oInvoiceModel, "invoice");

			// set dialog
			this.helloDialog = new HelloDialog();
		}
	});

}, /* bExport= */ true);

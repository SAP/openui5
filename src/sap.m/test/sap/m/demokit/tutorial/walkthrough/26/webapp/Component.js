sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/controller/HelloDialog",
	"sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, JSONModel, HelloDialog, ODataModel) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.wt.Component", {

		metadata : {
			manifest: "json"
		},

		init : function () {

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set data model
			var oData = {
				recipient : {
					name : "World"
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			// set invoice model - remote
			var oConfig = this.getMetadata().getConfig();
			var oInvoiceModel = new ODataModel(oConfig.invoiceRemote);

			// debug code to show an alert for CORS issues in the tutorial
			oInvoiceModel.attachMetadataFailed(function(oEvent) {
				alert("Request to the remote service failed due to CORS issues - Read the tutorial (Walkthrough Step 26) to understand why no data is shown here.");
			});

			this.setModel(oInvoiceModel, "invoice");

			// set dialog
			this.helloDialog = new HelloDialog();
		}
	});

});

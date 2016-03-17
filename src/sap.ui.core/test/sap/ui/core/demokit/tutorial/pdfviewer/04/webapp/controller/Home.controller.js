sap.ui.define([
	"sap/ui/demo/pdf/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.pdf.controller.Home", {

		onNavToPdfEmbed : function (oEvent){
			this.getRouter().navTo("pdfembed");
		},

		onNavToPdfIframe : function () {
			this.getRouter().navTo("pdfiframe");
		},

		onNavToPdfIframeHtmlWrapper : function () {
			this.getRouter().navTo("pdfiframeHtmlWrapper");
		},

		onNavToPdfJs : function () {
			this.getRouter().navTo("pdfjs");
		}

	});

});

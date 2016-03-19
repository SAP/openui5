sap.ui.define([
	"sap/ui/demo/pdf/controller/BaseController",
	"sap/ui/core/HTML"
], function (BaseController, HTML) {
	"use strict";

	return BaseController.extend("sap.ui.demo.pdf.controller.PdfIframe", {

		onInit : function (){

			this._oHTML = new HTML();
			this.getView().byId("pdfIframePage").addContent(this._oHTML);

			this.getRouter().getRoute("pdfiframe").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent) {
			var sHtml = '<iframe src="./Scrum-Guide-US.pdf" height="100%" width="100%"></iframe>';
			this._oHTML.setContent(sHtml);
		}

	});

});

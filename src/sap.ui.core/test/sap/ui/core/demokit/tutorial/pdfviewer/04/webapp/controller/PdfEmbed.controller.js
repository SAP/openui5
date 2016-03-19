sap.ui.define([
	"sap/ui/demo/pdf/controller/BaseController",
	"sap/ui/core/HTML"
], function (BaseController, HTML) {
	"use strict";

	return BaseController.extend("sap.ui.demo.pdf.controller.PdfEmbed", {

		onInit : function (){

			this._oHTML = new HTML();
			this.getView().byId("pdfEmbedPage").addContent(this._oHTML);

			this.getRouter().getRoute("pdfembed").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent) {
			var sHtml = '<embed src="./Scrum-Guide-US.pdf" width="800" height="600" alt="pdf">';
			this._oHTML.setContent(sHtml);
		}

	});

});

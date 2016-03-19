sap.ui.define([
	"sap/ui/demo/pdf/controller/BaseController",
	"sap/ui/core/HTML"
], function (BaseController, HTML) {
	"use strict";

	return BaseController.extend("sap.ui.demo.pdf.controller.PdfIframeHtmlWrapper", {

		onInit : function (){

			this._oHTML = new HTML();
			this.getView().byId("pdfIframeHtmlWrapperPage").addContent(this._oHTML);

			this.getRouter().getRoute("pdfiframeHtmlWrapper").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent) {
			var sHtml = '<iframe src="./HtmlPdfWrapper.html" height="100%" width="100%" frameBorder="0" scrolling="no"></iframe>';
			this._oHTML.setContent(sHtml);
		}

	});

});

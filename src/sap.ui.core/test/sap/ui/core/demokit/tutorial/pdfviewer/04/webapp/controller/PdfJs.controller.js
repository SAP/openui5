sap.ui.define([
	"sap/ui/demo/pdf/controller/BaseController",
	"sap/ui/core/HTML"
], function (BaseController, HTML) {
	"use strict";

	return BaseController.extend("sap.ui.demo.pdf.controller.PdfJs", {

		onInit : function (){

			this._oHTML = new HTML();
			this.getView().byId("pdfJsPage").addContent(this._oHTML);

			this.getRouter().getRoute("pdfjs").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent) {
			var sHtml, sFilePath;
			sFilePath = encodeURIComponent("../../../Scrum-Guide-US.pdf");
			sHtml = '<iframe src="./lib/pdfjs/web/viewer.html?file=' + sFilePath +'" height="100%" width="100%"></iframe>';
			this._oHTML.setContent(sHtml);
		}

	});

});

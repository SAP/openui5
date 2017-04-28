sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/PDFViewer"
], function(jQuery, Controller, PDFViewer) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PDFViewerPopup.Page", {

		onInit : function () {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
		},

		onPress: function() {
			var sPath = jQuery.sap.getModulePath("sap.m.sample.PDFViewerEmbedded", "/sample.pdf");
			this._pdfViewer.setSource(sPath);
			this._pdfViewer.open();
		}
	});

	return PageController;

});

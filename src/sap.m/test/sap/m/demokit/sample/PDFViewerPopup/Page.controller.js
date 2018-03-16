sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel"
], function (jQuery, Controller, PDFViewer, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PDFViewerPopup.Page", {

		onInit: function () {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);

			var oSample1Model = new JSONModel({
				Source: jQuery.sap.getModulePath("sap.m.sample.PDFViewerPopup", "/sample1.pdf"),
				Preview: jQuery.sap.getModulePath("sap.m.sample.PDFViewerPopup", "/sample1.jpg")
			});
			var oSample2Model = new JSONModel({
				Source: jQuery.sap.getModulePath("sap.m.sample.PDFViewerPopup", "/sample2.pdf"),
				Preview: jQuery.sap.getModulePath("sap.m.sample.PDFViewerPopup", "/sample2.jpg")
			});

			this.byId('image1').setModel(oSample1Model);
			this.byId('image2').setModel(oSample2Model);
		},

		onPress: function (oEvent) {
			var sSource = oEvent.getSource().getModel().getData().Source;
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("My Custom Title");
			this._pdfViewer.open();
		}
	});

	return PageController;

});

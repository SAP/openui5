sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PDFViewerEmbedded.Page", {

		onInit : function () {
			this._sValidPath = jQuery.sap.getModulePath("sap.m.sample.PDFViewerEmbedded", "/sample.pdf");
			this._sInvalidPath = jQuery.sap.getModulePath("sap.m.sample.PDFViewerEmbedded", "/sample_nonexisting.pdf");
			this._oModel = new JSONModel({
				Source: this._sValidPath,
				Title: "My Custom Title",
				Height: "600px"
			});
			this.getView().setModel(this._oModel);
		},

		onCorrectPathClick: function() {
			this._oModel.setProperty("/Source", this._sValidPath);
		},

		onIncorrectPathClick: function() {
			this._oModel.setProperty("/Source", this._sInvalidPath);
		}
	});

	return PageController;

});

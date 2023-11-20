sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/library"
], function (Controller, JSONModel, integrationLibrary) {
	"use strict";

	var CardPreviewMode = integrationLibrary.CardPreviewMode;

	return Controller.extend("sap.f.cardsdemo.controller.Preview", {
		onInit: function () {
			this.getView().setModel(new JSONModel({
				allModes: Object.values(CardPreviewMode),
				selectedMode: CardPreviewMode.Abstract
			}), "previewModes");
		}
	});
});
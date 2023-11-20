sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/library"
], function(Controller, JSONModel, integrationLibrary) {
	"use strict";

	var CardPreviewMode = integrationLibrary.CardPreviewMode;

	return Controller.extend("sap.ui.integration.sample.preview.allModes.PreviewMode", {
		onInit: function () {
			this.getView().setModel(new JSONModel({
				allModes: Object.values(CardPreviewMode),
				selectedMode: CardPreviewMode.Off
			}), "previewModes");
		}
	});
});
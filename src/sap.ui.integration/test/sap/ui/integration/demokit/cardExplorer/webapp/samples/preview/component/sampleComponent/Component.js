sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/library"
], function(UIComponent, JSONModel, integrationLibrary) {
	"use strict";

	var CardPreviewMode = integrationLibrary.CardPreviewMode;

	var Component = UIComponent.extend("sap.ui.demo.cardExplorer.samples.preview.component.sampleComponent.Component", {
		metadata: {
			manifest: "json"
		},
		onCardReady: function (oCard) {
			var oModel;

			if (oCard.getPreviewMode() === CardPreviewMode.MockData) {
				oModel = new JSONModel({
					value: [
						{ ProductName: "Mocked Product 1" }
					]
				});
			} else {
				oModel = new JSONModel("https://services.odata.org/V4/Northwind/Northwind.svc/Products?$format=json&$top=1");
			}

			this.setModel(oModel, "products");
		}
	});

	return Component;

});

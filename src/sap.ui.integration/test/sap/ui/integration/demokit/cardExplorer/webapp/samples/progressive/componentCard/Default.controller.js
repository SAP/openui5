sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.Progressive.ComponentCard.Regular", {
		onInit: function () {
			const oComponent = this.getOwnerComponent();
			const oCard = oComponent.card;

			const oView = this.getView();
			oView.setModel(oCard.getModel("size"), "size");

			const oDefaultModel = new JSONModel({
				contentSize: oCard.sizeQuery({ small: "Small", standard: "Standard", large: "Large" }),
				widthSize: oCard.sizeQuery({ tiny: "Tiny", narrow: "Narrow", regular: "Regular", wide: "Wide", extraWide: "Extra Wide" })
			});
			oView.setModel(oDefaultModel);
		}
	});
});
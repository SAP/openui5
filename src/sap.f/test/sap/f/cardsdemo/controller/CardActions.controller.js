sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement",
	"sap/m/VBox",
	"sap/m/Title",
	"sap/ui/integration/widgets/Card",
	"sap/m/MessageToast"
], function (Controller,
			 JSONModel,
			 Measurement,
			 VBox,
			 Title,
			 Card,
			 MessageToast) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.CardActions", {
		onInit: function () {
		},
		onCardAction: function (oEvent) {
			oEvent.preventDefault();

			MessageToast.show(`Action Type: ${oEvent.getParameters().type}

			Action Parameters: ${JSON.stringify(oEvent.getParameters().parameters, null, 4)}

			Action Source: ${oEvent.getParameters().actionSource.getMetadata().getName()}`);
		},
		onFCardPress: function (oEvent) {
			MessageToast.show(`Card Pressed: ${oEvent.getSource().getMetadata().getName()}`);
		},
		onFCardHeaderPress: function (oEvent) {
			MessageToast.show(`Card Header Pressed: ${oEvent.getSource().getMetadata().getName()}`);
		}
	});
});
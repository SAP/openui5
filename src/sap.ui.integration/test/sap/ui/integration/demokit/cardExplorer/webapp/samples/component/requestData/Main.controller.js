sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/library"
], function (Controller, integrationLibrary) {
	"use strict";

	var CardBlockingMessageType = integrationLibrary.CardBlockingMessageType;

	return Controller.extend("my.component.sample.requestData.Main", {
		onInit: function () {
			var oCard = this.getOwnerComponent().oCard;
			var mCardParameters = oCard.getCombinedParameters();

			oCard.showLoadingPlaceholders();
			oCard.request({
				url: "{{destinations.ProductsMockServerWithCSRF}}/Products",
				parameters: {
					"$format": "json",
					"$top": mCardParameters.productsCount
				},
				method: "GET",
				headers: {
					"X-CSRF-Token": "{{csrfTokens.token1}}"
				}
			})
			.then(function (oRes) {
				this.getView().getModel("products").setData(oRes.data);
				oCard.hideLoadingPlaceholders();
			}.bind(this))
			.catch(function () {
				oCard.showBlockingMessage({
					type: CardBlockingMessageType.Error,
					title: "Unable to load data"
				});
				oCard.hideLoadingPlaceholders();
			});
		}
	});
});
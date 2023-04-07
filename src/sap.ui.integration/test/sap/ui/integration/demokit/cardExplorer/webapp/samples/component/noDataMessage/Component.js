sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/integration/library"
], function (UIComponent, integrationLibrary) {
	"use strict";

	var CardBlockingMessageType = integrationLibrary.CardBlockingMessageType;

	var Component = UIComponent.extend("my.component.sample.cardContent.Component", {
		onCardReady: function (oCard) {
			oCard.showLoadingPlaceholders();

			// simulate data loading
			setTimeout(function () {
				oCard.showBlockingMessage({
					type: CardBlockingMessageType.NoData,
					title: "This Card Doesn't Have Data"
				});
				oCard.hideLoadingPlaceholders();
			}, 1000);
		}
	});

	return Component;
});

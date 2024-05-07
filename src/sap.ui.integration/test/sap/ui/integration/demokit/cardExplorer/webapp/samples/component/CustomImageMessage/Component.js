sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/integration/library"
], function (UIComponent, integrationLibrary) {
	"use strict";

	var Component = UIComponent.extend("my.component.sample.CustomImageMessage", {
		onCardReady: function (oCard) {
			oCard.showLoadingPlaceholders();

			// simulate data loading
			setTimeout(function () {
				oCard.showBlockingMessage({
					title: "Authorization Required",
					description: "This application requires access to data from a third-party provider",
					imageSrc: "./AuthRequired.jpg"
				});
				oCard.hideLoadingPlaceholders();
			}, 1000);
		}
	});

	return Component;
});

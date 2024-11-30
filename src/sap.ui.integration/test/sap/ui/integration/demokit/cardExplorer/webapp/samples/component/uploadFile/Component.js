sap.ui.define([
	"sap/ui/core/UIComponent"
], (UIComponent) => {
	"use strict";

	return UIComponent.extend("my.component.sample.uploadFile.Component", {
		metadata: {
			manifest: "json"
		},
		onCardReady(oCard) {
			// Holds the card for use inside the controller
			this.card = oCard;
		}
	});
});

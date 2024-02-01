sap.ui.define([
	"sap/m/Text"
], (Text) => {
	"use strict";

	return {
		createContent(oController) {
			return new Text({
				id: oController.createId("textFromFragment"),
				text: "Some desktop content.."
			}).addStyleClass("sapUiSmallMarginTop");
		}

	};
});
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("my.component.sample.requestData.Component", {
		onCardReady: function (oCard) {
			this.oCard = oCard;
		}
	});

	return Component;
});

sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("my.component.sample.triggerAction.Component", {
		onCardReady: function (oCard) {
			this.oCard = oCard;
		}
	});
});

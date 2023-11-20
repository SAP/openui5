sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("test.manifest.component.cardAccess.Component", {
		onCardReady: function (oCard) {
			// Holds the card for use inside the controller
			this.card = oCard;
		}
	});

	return Component;

});

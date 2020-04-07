sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("my.component.sample.advanced.Component", {
		onCardReady: function (oCard) {
			// Holds the card for use inside the controller
			this.card = oCard;

			// Can get all parameters with method getCombinedParameters
			oCard.getCombinedParameters();

			// Get any section of the card manifest with method getManifestEntry
			oCard.getManifestEntry("/sap.card");

			// When in context of a Host, like in Work Zone you can use the following methods
			// oCard.getHostInstance();
			// oCard.resolveDestination("myDestination"); // check more in the destinations sample
		}
	});

	return Component;

});

sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var oExtension = new Extension({
		// Actions defined here will appear in the header of the card.
		actions: [
			{
				type: "Navigation",
				parameters: {
					url: "https://training.sap.com/"
				},
				icon: "sap-icon://learning-assistant",
				target: "_blank",
				text: "Book 3rd party training"
			}
		]
	});

	return oExtension;
});
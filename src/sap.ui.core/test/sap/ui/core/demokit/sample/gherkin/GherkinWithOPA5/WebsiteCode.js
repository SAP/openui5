sap.ui.require([
	"sap/ui/core/Core",
	"sap/m/Button",
	"sap/m/Label",
	"sap/ui/layout/VerticalLayout"
], function(Core, Button, Label, VerticalLayout) {
	"use strict";

	Core.ready().then(function() {
		var sText = "Number of lemmings saved: ";
		var iNumSavedLemmings = 0;

		var oTitle = new Label({
			id: "lemming-website-title",
			text: "Lemming Life Saving Machine"
		});

		var oLabel = new Label({
			id: "num-lemmings-saved",
			text: sText + iNumSavedLemmings
		});

		var aLemmingNames = ["Alice", "Bob", "Charlie", "David", "Elektra", "Felicia",
			"Georgia", "Holly", "Idris", "Julien", "Kevin", "Lucia", "Michael", "Nancy",
			"Oscar", "Peter", "Qubert", "Rascal", "Susan", "Terry", "Ursula", "Vicky",
			"Walter", "Xavier", "Yolanda", "Zelda"];

		var oLayout = new VerticalLayout({id: "layout"});

		var oButton = new Button({
			id: "life-saving-button",
			text: "Save a Lemming",
			press: function() {
				iNumSavedLemmings += 1;
				oLabel.setText(sText + iNumSavedLemmings);

				var oNewLabel = new Label({
					id: "lemming-name-" + iNumSavedLemmings,
					text: aLemmingNames[(iNumSavedLemmings - 1) % aLemmingNames.length]
				});
				oLayout.addContent(oNewLabel);
			}
		});

		oLayout.addContent(oTitle);
		oLayout.addContent(oButton);
		oLayout.addContent(oLabel);
		oLayout.placeAt("uiArea");

	});
});

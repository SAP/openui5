sap.ui.define(['sap/ui/core/UIComponent', "sap/ui/core/mvc/XMLView"],
	function(UIComponent, XMLView) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.integration.sample.Progressive.ComponentCard.Component", {
		metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },
		onCardReady: function (oCard) {
			this.card = oCard;
		},
        createContent: function() {
			const oCard = this.getComponentData().__sapUiIntegration_card;

            // Dynamically create a root view based on the size
			let sViewName;
			const mSize = oCard.getModel("size").getData();

			if (mSize.variant.indexOf("Tile") > -1) { // option 1 - size model
				sViewName = "Tile";
			} else if (oCard.sizeQuery("wide")) { // option 2 - sizeQuery
				sViewName = "Wide";
			} else {
				sViewName = "Default";
			}

            return XMLView.create({
				viewName: `sap.ui.integration.sample.Progressive.ComponentCard.${sViewName}`
			});
        }
	});

	return Component;

});

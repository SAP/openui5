sap.ui.define(['sap/ui/core/UIComponent', "sap/ui/core/mvc/XMLView"],
	function(UIComponent, XMLView) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.integration.sample.Progressive.ComponentCard.Component", {
		metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },
        createContent: function() {
			const oCard = this.getComponentData()["__sapUiIntegration_card"];
			this.card = oCard;

            // Dynamically create a root view based on the size
			let sViewName;

			// option 1 - use the size model
			const mSize = oCard.getModel("size").getData();
			if (mSize.variant.indexOf("Tile") > -1) {
				sViewName = "Tile";

			// option 2 - use the sizeQuery
			} else if (oCard.sizeQuery("wide")) {
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

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	return UIComponent.extend("sap.f.cardsdemo.Component", {
		metadata : {
			manifest: "json"
		},
		init: function () {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // create the views based on the url/hash
			this.getRouter().initialize();

			var oExamples = [
				{
					title: "No layout",
					description: "The cards are placed in a panel. They just wrap when not enough space. The size is calculated based on verticalSize & horizontalSize and 80px multiplier.",
					route: "nolayout",
					usage: "The cards height and width should always be dividable by 80 (e.g. 80, 160, 240, 320 etc...)"
				},
				{
					title: "Fit container",
					description: "The cards fit the whole container allowing it to define the sizes.",
					route: "splitter",
					usage: "The cards have no height and width (defined by the container control)"
				},
				{
					title: "Flexible height and CSSGrid",
					description: "A list card configured to automatically adjust its height when more items are added (verticalSize property increases).",
					route: "flexibleHeight",
					usage: "The chosen card container is a CSSGrid and flexible height is needed."
				},
				{
					title: "CSSGrid avoid shuffling",
					description: "A margin is added to avoid differences between L/XL breakpoints. Dimensions of certain cards are changed based on breakpoints to achiev a level of progressive disclosure and avoid shuffling of the cards.",
					route: "grid",
					usage: "The chosen card container is a CSSGrid and a stable UI is needed."
				},
				{
					title: "CSSGrid with Z-flow",
					description: "The cards don't change their dimensions based on breakpoints. They just wrap when not enough space",
					route: "zflow",
					usage: "The chosen card container is a CSSGrid and stable UI is NOT needed."
				}
			];

			var oModel = new JSONModel(oExamples);
			this.setModel(oModel);
        }
	});

});

sap.ui.define([
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/m/Label",
	"sap/m/RatingIndicator",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/App"
], function(CheckBox, Page, VBox, Label, RatingIndicator, Toolbar, ToolbarSpacer, App) {
	"use strict";

	var sActiveRI = "activeRating",
		sInactiveRI = "inactiveRating",
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		oPage = new Page("myPage", {
			title: "RatingIndicator Accessibility Test Page",
			content: [
				new VBox({
					items: [
						new Label({text: 'Active rating:', labelFor: sActiveRI}),
						new RatingIndicator(sActiveRI, {
							iconSize: "1.5rem",
							value: 2.5,
							tooltip: "This is a tooltip"
						}),
						new Label({text: 'Inactive rating:', labelFor: sInactiveRI}),
						new RatingIndicator(sInactiveRI, {
							iconSize: "1.5rem",
							enabled: false,
							value: 2.5,
							tooltip: "This is a tooltip"
						})
					]
				})
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		}).addStyleClass("sapUiContentPadding").placeAt("body"),

		oApp = new App("myApp", {
			initialPage: "myPage"
		});

	oApp.addPage(oPage);
	oApp.placeAt("content");
});

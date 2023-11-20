sap.ui.define([
	"sap/m/App",
	"sap/m/BusyIndicator",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(App, BusyIndicator, CheckBox, Page, Toolbar, ToolbarSpacer) {
	"use strict";

	var app = new App("myApp", {
			initialPage: "page1"
		}),
		busyCSSText = new BusyIndicator({
			text: 'Medium sized busy indicator'
		}),
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		oPage = new Page("page1", {
			title: "BusyIndicator Accessibility Test Page",
			content:[
				busyCSSText
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	app.addPage(oPage).placeAt("content");
});

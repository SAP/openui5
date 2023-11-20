sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(App, CheckBox, Input, Label, Page, PageAccessibleLandmarkInfo, Toolbar, ToolbarSpacer) {
	"use strict";

	var oApp = new App("myApp", {
			initialPage: "page"
		}),

		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),

		oInput = new Input("input0", {
			width: "300px"
		}),

		oLabel = new Label({
			text: "Please enter a value",
			labelFor: oInput
		}).addStyleClass("customLabel"),

		oPage = new Page("page", {
			landmarkInfo: new PageAccessibleLandmarkInfo(),
			title: "Page Accessibility Test Page",
			content: [
				oLabel,
				oInput
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	oApp.addPage(oPage).placeAt("content");
});

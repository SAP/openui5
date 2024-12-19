sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/ui/core/library"
], function(App, Page, Label, Button, Bar, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oApp = new App();
	var oPage = new Page({
		title: "Bar Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [
			new Bar("bar1", {
				contentLeft: [
					new Label({labelFor: "one", text: "one function", wrapping: true}),
					new Button("one", {text: "One"})
				]
			})
		]
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});

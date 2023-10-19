sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/Bar"
], function(App, Page, Button, Bar) {
	"use strict";

	var app = new App("myApp");

	var oPage = new Page("page1", {
		title: "Bar Test page",
		content: [
			new Button({text:'Button'}),
			new Bar("bar1", {
				contentLeft: [new Button({text: "One"})]
			})
		]
	});

	app.addPage(oPage);

	app.placeAt("body");
});

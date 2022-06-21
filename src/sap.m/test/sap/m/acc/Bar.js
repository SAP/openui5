sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/core/InvisibleText",
	"sap/m/Bar"
], function(App, Page, Button, InvisibleText, Bar) {
	"use strict";

	var app = new App("myApp");

	var oPage = new Page("page1", {
		title: "Bar Test page",
		content: [
			new Button({text:'Button'}),
			new InvisibleText("L1", { text: "This is invisible text" }).placeAt('body'),
			new Bar("bar1", {
				contentLeft: [new Button({text: "One"})],
				ariaLabelledBy: "L1"
			})
		]
	});

	app.addPage(oPage);

	app.placeAt("body");
});

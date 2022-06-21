sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/VBox",
	"sap/tnt/InfoLabel",
	"sap/ui/model/json/JSONModel"
], function(App, Page, VBox, InfoLabel, JSONModel) {
	"use strict";

	var oData = {
		infoLabels: [
			{text: "default color scheme"},
			{text: "color scheme 1", colorScheme: 1},
			{text: "color scheme 2", colorScheme: 2},
			{},
			{text: "color scheme 3", colorScheme: 3, icon: "sap-icon://add"},
			{text: "color scheme 4", colorScheme: 4, icon: "sap-icon://key"},
			{colorScheme: 6, icon: "sap-icon://add"},
			{colorScheme: 7, icon: "sap-icon://key", tooltip: "Custom tooltip of key icon"}

		]
	};

	var oModel = new JSONModel();
	oModel.setData(oData);

	sap.ui.getCore().setModel(oModel);

	var oInfoLabelTemplate = new InfoLabel({
		text: "{text}",
		colorScheme: "{colorScheme}",
		icon: "{icon}",
		tooltip: "{tooltip}"
	});

	var initialPage = new Page("infoLabelPage", {
		title: "sap.tnt.InfoLabel Control Test Page",
		content: [
			new VBox("vb1", {
				items: {
					path: "/infoLabels",
					template: oInfoLabelTemplate
				},
				width: "200px"
			}).addStyleClass("vBoxBorder")
		]
	});

	var app = new App("myApp", {initialPage: "infoLabelPage"});
	app.placeAt("body");
	app.addPage(initialPage);
});

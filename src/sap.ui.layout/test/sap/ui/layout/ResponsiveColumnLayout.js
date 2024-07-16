sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/core/HTML",
	"sap/ui/layout/cssgrid/CSSGrid",
	"sap/ui/layout/cssgrid/ResponsiveColumnLayout"
], function (
	App,
	Page,
	Panel,
	HTML,
	CSSGrid,
	ResponsiveColumnLayout
) {
	"use strict";

	var oCSSGrid = new CSSGrid({
		customLayout: new ResponsiveColumnLayout()
	});

	for (var i = 1; i <= 50; i++) {
		oCSSGrid.addItem(new HTML({ content: "<div class='grid-cell'></div>" }));
	}

	var oContainer = new Panel("panelContainer", {
		content: [oCSSGrid]
	});

	var oPage = new Page({
		title: "Test Page for sap.ui.layout.cssgrid.ResponsiveColumnLayout",
		content: [oContainer]
	});

	new App({
		pages: [oPage]
	}).placeAt("body");
});
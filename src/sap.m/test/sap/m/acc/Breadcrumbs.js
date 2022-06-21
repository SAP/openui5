sap.ui.define([
	"sap/m/App",
	"sap/m/Breadcrumbs",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/Slider",
	"sap/ui/core/InvisibleText",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel"
], function(
	App,
	Breadcrumbs,
	Button,
	Input,
	Label,
	Link,
	MessageToast,
	Page,
	Panel,
	Slider,
	InvisibleText,
	VerticalLayout,
	JSONModel
) {
	"use strict";

	new InvisibleText("BREADCRUMBS_NORMAL", {text: "Normal"}).toStatic();
	new InvisibleText("BREADCRUMBS_SELECT", {text: "Select"}).toStatic();

	var fnLinkPressHandler = function (oEvent) {
			MessageToast.show(oEvent.getSource().getText() + " has been activated");
		},
		fnGetLink = function (sLinkText) {
			return new Link({
				text: sLinkText,
				press: fnLinkPressHandler
			});
		},
		fnLinkGenerator = function (iNumberOfLinks, sLinkText) {
			var aListOfLinks = [];
			sLinkText = sLinkText || "Link";

			for (var i = 1; i <= iNumberOfLinks; i++) {
				aListOfLinks.push(fnGetLink(sLinkText + i));
			}

			return aListOfLinks;
		},
		fnUpdateBreadcrumbsWidth = function () {
			oBreadcrumbs.$().css("width", sBreadcrumbWidth);
		},
		sBreadcrumbWidth = "auto",

		oBreadcrumbs = new Breadcrumbs({
			ariaLabelledBy: "BREADCRUMBS_NORMAL",
			currentLocationText: "currentLocationText",
			links: fnLinkGenerator(10, "NormalLink")
		}).addEventDelegate({onAfterRendering: fnUpdateBreadcrumbsWidth}),

		oBreadcrumbsWithSelect = new Breadcrumbs("breadCrumbWithSelect", {
			ariaLabelledBy: "BREADCRUMBS_SELECT",
			currentLocationText: "currentLocationText",
			links: fnLinkGenerator(10, "NormalLink")
		}).addEventDelegate({
			onAfterRendering: function () {
				oBreadcrumbsWithSelect.$().css("width", "200px");
			}
		}),

		oApp = new App();


	oApp.addPage(new Page({
		title: "Breadcrumbs",
		titleLevel: "H1",
		content: [new Panel({
			content: [oBreadcrumbs, oBreadcrumbsWithSelect]
		})]
	})).placeAt("content");
});

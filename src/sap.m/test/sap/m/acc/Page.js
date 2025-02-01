sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/library"
], function(App, CheckBox, Input, Label, Page, PageAccessibleLandmarkInfo, Toolbar, ToolbarSpacer, library) {
	"use strict";

	// shortcut for sap.ui.core.AccessibleLandmarkRole
	const AccessibleLandmarkRole = library.AccessibleLandmarkRole;

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
			landmarkInfo: new PageAccessibleLandmarkInfo({
				headerRole: AccessibleLandmarkRole.Banner,
				headerLabel: "Header label from LandmarkInfo",
				rootRole: AccessibleLandmarkRole.Region,
				rootLabel: "Root label from LandmarkInfo",
				contentRole: AccessibleLandmarkRole.Main,
				contentLabel: "Content label from LandmarkInfo",
				footerRole: AccessibleLandmarkRole.ContentInfo,
				footerLabel: "Footer label from LandmarkInfo"
			}),
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

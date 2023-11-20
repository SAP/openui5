sap.ui.define([
	"sap/m/semantic/EditAction",
	"sap/m/semantic/AddAction",
	"sap/m/semantic/FlagAction",
	"sap/m/semantic/FavoriteAction",
	"sap/m/semantic/SendEmailAction",
	"sap/m/semantic/SendMessageAction",
	"sap/m/semantic/DiscussInJamAction",
	"sap/m/semantic/ShareInJamAction",
	"sap/m/semantic/PrintAction",
	"sap/m/App",
	"sap/m/semantic/FullscreenPage",
	"sap/m/PageAccessibleLandmarkInfo",
	"sap/ui/core/library"
], function(
	EditAction,
	AddAction,
	FlagAction,
	FavoriteAction,
	SendEmailAction,
	SendMessageAction,
	DiscussInJamAction,
	ShareInJamAction,
	PrintAction,
	App,
	FullscreenPage,
	PageAccessibleLandmarkInfo,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.AccessibleLandmarkRole
	var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

	var app = new App("myApp");

	var oPage = new FullscreenPage("testPage", {
			landmarkInfo: new PageAccessibleLandmarkInfo({
			headerRole: AccessibleLandmarkRole.Banner,
			headerLabel: "Header label from LandmarkInfo",
			subHeaderRole: AccessibleLandmarkRole.Banner,
			subHeaderLabel: "SubHeader label from LandmarkInfo",
			rootRole: AccessibleLandmarkRole.Region,
			rootLabel: "Root label from LandmarkInfo",
			contentRole: AccessibleLandmarkRole.Main,
			contentLabel: "Content label from LandmarkInfo",
			footerRole: AccessibleLandmarkRole.Banner,
			footerLabel: "Footer label from LandmarkInfo"
		}),
		title:"Fullscreen Test page",
		titleLevel: "H1",
		showNavButton: true,
		editAction: new EditAction(),
		addAction: new AddAction(),
		flagAction: new FlagAction(),
		favoriteAction: new FavoriteAction(),
		sendEmailAction: new SendEmailAction(),
		sendMessageAction: new SendMessageAction(),
		discussInJamAction: new DiscussInJamAction(),
		shareInJamAction: new ShareInJamAction(),
		printAction: new PrintAction()
	});

	app.addPage(oPage);

	app.placeAt("body");
});

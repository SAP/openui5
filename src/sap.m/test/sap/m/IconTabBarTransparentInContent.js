sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Text",
	"sap/m/Label",
	"sap/f/ShellBar",
	"sap/m/Avatar",
	"sap/m/OverflowToolbarButton",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/library"
], function(
	App,
	Page,
	Text,
	Label,
	ShellBar,
	Avatar,
	OverflowToolbarButton,
	IconTabBar,
	IconTabFilter,
	mobileLibrary
) {
	"use strict";

	// shortcuts
	const BackgroundDesign = mobileLibrary.BackgroundDesign,
		PageBackgroundDesign = mobileLibrary.PageBackgroundDesign;

	var oShellBar = new ShellBar({
		homeIcon: sap.ui.require.toUrl("sap/ui/documentation/sdk/images/logo_sap.png"),
		title: "Title",
		showCopilot: true,
		showSearch: true,
		showProductSwitcher: true,
		showNotifications: true,
		notificationsNumber: "2",
		profile: new Avatar({
			initials: "DN"
		}),
		additionalContent: [
			new OverflowToolbarButton({ icon: "sap-icon://home", text: "home", type: "Transparent" }),
			new OverflowToolbarButton({ icon: "sap-icon://action-settings", text: "Action settings", type: "Transparent" }),
			new OverflowToolbarButton({ icon: "sap-icon://add-photo", text: "Add photo", type: "Transparent" })
		]
	});

	var oIconTabBar = new IconTabBar({
		items: [
			new IconTabFilter({
				text: 'Tab 1',
				content: [
					new IconTabBar('ITBtransparentInContent',{
						backgroundDesign: BackgroundDesign.Transparent,
						headerBackgroundDesign: BackgroundDesign.Transparent,
						items: [
							new IconTabFilter({
								text: "Info",
								content: new Text({
									text: "Info content goes here ..."
								})
							}),
							new IconTabFilter({
								text: "Attachments",
								content: new Text({
									text: "Attachments go here ..."
								})
							})
						]
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 2',
				content: [
					new Label({
						text: 'Content'
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 3',
				content: [
					new Label({
						text: 'Content'
					})
				]
			}),
			new IconTabFilter({
				text: 'Tab 4',
				content: [
					new Label({
						text: 'Content'
					})
				]
			})
		]
	});

	var oPage = new Page("page", {
		showHeader: false,
		backgroundDesign: PageBackgroundDesign.Transparent,
		content: [
			oShellBar,
			oIconTabBar
		]
	});

	var oContent = oPage.getContent();
	oContent.forEach(function(oItem) {
		oItem.addStyleClass('sapUiContentPadding');
	});

	var oApp = new App("myApp", {
		initialPage: "page"
	});

	oApp.addPage(oPage).placeAt("body");

	oApp.addPage(oPage);
});

sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/ViewSettingsDialog",
	"sap/m/ViewSettingsItem",
	"sap/m/ViewSettingsFilterItem",
	"sap/m/ViewSettingsCustomTab",
	"sap/m/Button",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/library"
], function(MessageToast, ViewSettingsDialog, ViewSettingsItem, ViewSettingsFilterItem, ViewSettingsCustomTab, Button, App, Page, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleConfirm(oEvent) {
		if (oEvent.getParameters().filterString) {
			MessageToast.show(oEvent.getParameter("filterString"));
		}
	}

	function handleViewSettingsButtonPress() {
		if (!window.oViewSettingsDialog) {
			window.oViewSettingsDialog = new ViewSettingsDialog({
				title: "Some title",
				confirm: handleConfirm,
				sortItems: [
					new ViewSettingsItem({
						text: "Sort Field 1",
						key: "1",
						selected: true
					}),
					new ViewSettingsItem({
						text: "Sort Field 2",
						key: "2"
					}),
					new ViewSettingsItem({
						text: "Sort Field 3",
						key: "3"
					})
				],
				groupItems: [
					new ViewSettingsItem({
						text: "Group Field 1",
						key: "1",
						selected: true
					}),
					new ViewSettingsItem({
						text: "Group Field 2",
						key: "2"
					}),
					new ViewSettingsItem({
						text: "Group Field 3",
						key: "3"
					})
				],
				filterItems: [
					new ViewSettingsFilterItem({
						text: "Filter Field 1",
						key: "1",
						items: [
							new ViewSettingsItem({
								text: "Value A",
								key: "1a"
							}),
							new ViewSettingsItem({
								text: "Value B",
								key: "1b"
							}),
							new ViewSettingsItem({
								text: "Value C",
								key: "1c"
							})
						]
					}),
					new ViewSettingsFilterItem({
						text: "Filter Field 2",
						key: "2",
						items: [
							new ViewSettingsItem({
								text: "Value A",
								key: "2a"
							}),
							new ViewSettingsItem({
								text: "Value B",
								key: "2b"
							}),
							new ViewSettingsItem({
								text: "Value C",
								key: "2c"
							})
						]
					}),
					new ViewSettingsFilterItem({
						text: "Filter Field 3",
						key: "3",
						items: [
							new ViewSettingsItem({
								text: "Value A",
								key: "3a"
							}),
							new ViewSettingsItem({
								text: "Value B",
								key: "3b"
							}),
							new ViewSettingsItem({
								text: "Value C",
								key: "3c"
							})
						]
					})
				],
				customTabs: [
					new ViewSettingsCustomTab({
						tooltip: "Custom tab",
						content: [
							new Button({
								text: "Something random"
							})
						]
					})
				]

			});
		}

		window.oViewSettingsDialog.open();
	}

	var oViewSettingsDialogButton = new Button({
		text: "Open View Settings Dialog",
		press: handleViewSettingsButtonPress
	});

	var app = new App();
	var page = new Page({
		title: "ViewSettingsDialog",
		titleLevel: TitleLevel.H1,
		content: [
			oViewSettingsDialogButton
		]
	});
	app.setInitialPage(page.getId());
	app.addPage(page);

	app.placeAt('body');
});

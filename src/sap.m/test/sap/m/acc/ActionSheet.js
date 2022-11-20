sap.ui.define([
	"sap/m/App",
	"sap/m/ActionSheet",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(App, ActionSheet, Button, coreLibrary, CheckBox, Page, Toolbar, ToolbarSpacer) {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	var oApp = new App("myApp", {
			initialPage: "page"
		}),
		oActionSheet = new ActionSheet({
			title: "Choose your action",
			buttons: [
				new Button({ text: "Reject", icon: "sap-icon://decline" }),
				new Button({ text: "Accept", icon: "sap-icon://accept" }),
				new Button({ text: "Email", icon: "sap-icon://email" }),
				new Button({ text: "Forward", icon: "sap-icon://forward" }),
				new Button({ text: "Delete", icon: "sap-icon://delete" }),
				new Button({ text: "Other" })
			]
		}),
		oButton = new Button("actionSheetButton", {
			text: "Open ActionSheet",
			ariaHasPopup: HasPopup.Menu,
			press: function () {
				oActionSheet.openBy(this);
			}
		}),
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		oPage = new Page("page", {
			title: "ActionSheet Accessibility Test Page",
			content: [
				oButton
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

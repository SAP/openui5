sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(App, Button, CheckBox, MessageToast, Page, Toolbar, ToolbarSpacer) {
	"use strict";

	var oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		oPage = new Page("myPage", {
			title: "MessageToast Accessibility Test Page",
			content: [
				new Button("messageToastButton", {
					text: "Show",
					press: function () {
						MessageToast.show("The message to be displayed");
					}
				})
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		}),
		oApp = new App("myApp", {
			initialPage: "myPage"
		});

	oApp.addPage(oPage);
	oApp.placeAt("content");
});

sap.ui.define([
	"sap/m/App",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePopoverItem",
	"sap/m/MessagePopover",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(App, JSONModel, MessagePopoverItem, MessagePopover, Button, CheckBox, Page, Toolbar, ToolbarSpacer) {
	"use strict";

	var oApp = new App("myApp", {
			initialPage: "page"
		}),
		oData = [{
			title: "First message",
			type: "Error",
			description: "Detailed description of the first error message"
		}, {
			title: "Second message",
			type: "Error",
			description: "Detailed description of the second error message"
		}, {
			title: "Third message",
			type: "Warning",
			description: "Detailed description of the first warning message"
		}, {
			title: "Fourth message",
			type: "Success",
			description: "Detailed description of the first success message"
		}, {
			title: "Fifth message",
			type: "Information",
			description: "Detailed description of the first information message"
		}],
		oModel = new JSONModel();

	oModel.setData(oData);

	var oTemplate = new MessagePopoverItem({
			title: "{title}",
			type: "{type}",
			description: "{description}"
		}),
		oMessagePopover = new MessagePopover({
			items: {
				path: "/",
				template: oTemplate
			}
		}).setModel(oModel),

		oButton = new Button("messagePopoverButton", {
			text: "Open MessagePopover",
			press: function () {
				oMessagePopover.openBy(this);
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
			title: "MessagePopover Accessibility Test Page",
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

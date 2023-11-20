sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/List",
	"sap/m/Page",
	"sap/m/Popover",
	"sap/m/StandardListItem",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/library"
], function(App, Button, CheckBox, List, Page, Popover, StandardListItem, Toolbar, ToolbarSpacer, InvisibleText, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	var oApp = new App("myApp", {
			initialPage: "page"
		}),

		oInvisibleText = new InvisibleText({text: "Items to buy from the supermarket"}),

		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),

		oPopover = new Popover({
			title: "Grocery List",
			placement: "Bottom",
			content: [
				new List({
					items: [
						new StandardListItem({ title: "1 kg Tomatos", wrapping: true }),
						new StandardListItem({ title: "1 kg Potatos", wrapping: true }),
						new StandardListItem({ title: "Salt", wrapping: true })
					]
				})
			],
			ariaLabelledBy: oInvisibleText.getId()
		}),

		oButton = new Button("popoverButton", {
			text: "Open Grocery List in Popover ",
			ariaHasPopup: HasPopup.ListBox,
			press: function () {
				oPopover.openBy(this);
			}
		}),

		oPage = new Page("page", {
			title: "Popover Accessibility Test Page",
			content: [
				oButton,
				oInvisibleText
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

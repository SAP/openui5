sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(App, Button, CheckBox, Input, Label, mobileLibrary, Page, Panel, MText, Title, Toolbar, ToolbarSpacer) {
	"use strict";

	// shortcut for sap.m.PanelAccessibleRole
	var PanelAccessibleRole = mobileLibrary.PanelAccessibleRole;

	document.body.style.overflow = "hidden";

	var app = new App("myApp", {
			initialPage: "page1"
		}),

		panel1 = new Panel({
			headerText : "This is an expandable Panel with landmark role region",
			width: "auto",
			expandable: true,
			content : [
				new MText({ text : "This is a sap.m.Text control inside a sap.m.Panel. Can be read with virtual cursor (INS+Z)." })
			],
			accessibleRole: PanelAccessibleRole.Region
		}).addStyleClass("sapUiResponsiveMargin"),

		label2 = new Label({ text : "This is a non active infoToolbar" }),

		panel2 = new Panel({
			headerText : "This is a non expandable Panel",
			infoToolbar : new Toolbar({
				content : [
					label2
				]
			}).addAriaLabelledBy(label2),
			width: "auto",
			content : [
				new Label({ text : "Name", labelFor: "nameInputId" }),
				new Input({id: "nameInputId"})
			],
			accessibleRole: PanelAccessibleRole.Form
		}).addStyleClass("sapUiResponsiveMargin"),

		label3 = new Label({ text : "This is an active infoToolbar" }),

		panel3 = new Panel("panelWithToolbar", {
			headerToolbar : new Toolbar({
				content: [
					new Title({ text: "This is a Panel with a headerToolbar" }),
					new ToolbarSpacer(),
					new Button({ icon: "sap-icon://drop-down-list", tooltip: "Do something with list" }),
					new Button({ icon: "sap-icon://person-placeholder", tooltip: "Do something with user" })
				]
			}),
			infoToolbar : new Toolbar({
				active: true,
				content : [
					label3
				]
			}).addAriaLabelledBy(label3),
			width: "auto",
			expandable: true,
			expanded: true,
			content : [
				new MText({ text : "This is a sap.m.Text control inside a sap.m.Panel. Can be read with virtual cursor (INS+Z)." })
			]
		}).addStyleClass("sapUiResponsiveMargin"),

		panel4 = new Panel({
			headerText : "This is an expandable Panel with landmark role complementary",
			width: "auto",
			expandable: true,
			content : [
				new MText({ text : "This is a sap.m.Text control inside a sap.m.Panel. Can be read with virtual cursor (INS+Z)." })
			],
			accessibleRole: PanelAccessibleRole.Complementary
		}).addStyleClass("sapUiResponsiveMargin"),

		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),

		oPage = new Page("page1", {
			title: "Panel Accessibility Test Page",
			content:[
				panel1,
				panel2,
				panel3,
				panel4
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	app.addPage(oPage).placeAt("content");
});

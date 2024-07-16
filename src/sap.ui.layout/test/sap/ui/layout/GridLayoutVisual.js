// Note: the HTML page 'GridLayoutVisual.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Page",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/library"
], async function(Core, App, Button, Input, Label, Link, Page, SegmentedButton, SegmentedButtonItem, Text, Title, Toolbar, ToolbarSpacer, CoreTitle, SimpleForm, layoutLibrary) {
	"use strict";

	var BackgroundDesign = layoutLibrary.BackgroundDesign;
	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	await Core.ready();

	var aContentEdit = [
						new CoreTitle({text:"Person"}),
						new Label({text:"Name"}),
						new Input({value:"Max Mustermann", required: true}),
						new Label({text:"Street/ No."}),
						new Input({value:"Musterweg"}),
						new Input({value:"10", layoutData: new undefined/*GridElementData*/({hCells: "1"})}),
						new Label({text:"PostCode / City"}),
						new Input({value:"12345", layoutData: new undefined/*GridElementData*/({hCells: "2"})}),
						new Input({value:"Musterstadt"}),
						new CoreTitle({text:"Contact"}),
						new Label({text:"Phone"}),
						new Input({value:"0123456789"}),
						new Label({text:"Mail"}),
						new Input({value:"max@mustermann.de"}),
						new Label({text:"Web"}),
						new Input({value:"http://www.mustermann.de"})
						];

	var aContentEditToolbar = [
							   new Toolbar({
								 content: [new Title({text: "Person", tooltip: "Title tooltip"}),
										   new ToolbarSpacer(),
										   new Button({icon: "sap-icon://sap-ui5"})
								 ]
							   }),
							   new Label({text:"Name"}),
							   new Input({value:"Max Mustermann", required: true}),
							   new Label({text:"Street/ No."}),
							   new Input({value:"Musterweg"}),
							   new Input({value:"10", layoutData: new undefined/*GridElementData*/({hCells: "1"})}),
							   new Label({text:"PostCode / City"}),
							   new Input({value:"12345", layoutData: new undefined/*GridElementData*/({hCells: "2"})}),
							   new Input({value:"Musterstadt"}),
							   new Toolbar({
								 content: [new Title({text: "Contact", tooltip: "Title tooltip"}),
										   new ToolbarSpacer(),
										   new Button({icon: "sap-icon://sap-ui5"})
								 ]
							   }),
							   new Label({text:"Phone"}),
							   new Input({value:"0123456789"}),
							   new Label({text:"Mail"}),
							   new Input({value:"max@mustermann.de"}),
							   new Label({text:"Web"}),
							   new Input({value:"http://www.mustermann.de"})
							   ];

	var aContentEditOneContainer = [
							  new Label({text:"Name"}),
							  new Input({value:"Max Mustermann", required: true}),
							  new Label({text:"Street/ No."}),
							  new Input({value:"Musterweg"}),
							  new Input({value:"10", layoutData: new undefined/*GridElementData*/({hCells: "2"})}),
							  new Label({text:"PostCode / City"}),
							  new Input({value:"12345", layoutData: new undefined/*GridElementData*/({hCells: "3"})}),
							  new Input({value:"Musterstadt"}),
							  ];

	var aContentDisplay = [
						   new CoreTitle({text:"Person"}),
						   new Label({text:"Name"}),
						   new Text({text:"Max Mustermann"}),
						   new Label({text:"Street/ No."}),
						   new Text({text:"Musterweg 10"}),
						   new Label({text:"PostCode / City"}),
						   new Text({text:"12345 Musterstadt"}),
						   new CoreTitle({text:"Contact"}),
						   new Label({text:"Phone"}),
						   new Text({text:"0123456789"}),
						   new Label({text:"Mail"}),
						   new Link({text:"max@mustermann.de", href:"mailto:max@mustermann.de"}),
						   new Label({text:"Web"}),
						   new Link({text:"http://www.mustermann.de", href: "http://www.mustermann.de"})
						   ];

	var oSimpleForm = new SimpleForm( "SF1", {
		layout: SimpleFormLayout.GridLayout,
		width : "100%",
		editable: true,
		title: "Person data",
		content: aContentEdit
	});

	var oHeaderToolbar = new Toolbar({
		content: [new Title({text: "Person data", tooltip: "Title tooltip"}),
				  new ToolbarSpacer(),
				  new Button({icon: "sap-icon://sap-ui5"})
				  ]
	});


	var oSegmentedButton = new SegmentedButton("SB1", {
		selectedKey: "B1",
		items: [ new SegmentedButtonItem("B1", {key: "B1", text: "Edit"}),
				 new SegmentedButtonItem("B2", {key: "B2", text: "Display"}),
				 new SegmentedButtonItem("B3", {key: "B3", text: "Toolbar"}),
				 new SegmentedButtonItem("B4", {key: "B4", text: "one Container"})
				],
		selectionChange: function(oEvent) {
			var aContent = [];
			switch (oEvent.getParameter("item").getKey()) {
			case "B1":
				aContent = aContentEdit;
				oSimpleForm.setEditable(true);
				oSimpleForm.setBackgroundDesign(BackgroundDesign.Translucent);
				oSimpleForm.setToolbar();
				oSimpleForm.removeStyleClass("sapUiFormLblColon");
				break;

			case "B2":
				aContent = aContentDisplay;
				oSimpleForm.setEditable(false);
				oSimpleForm.setBackgroundDesign(BackgroundDesign.Transparent);
				oSimpleForm.setToolbar();
				oSimpleForm.removeStyleClass("sapUiFormLblColon");
				break;

			case "B3":
				aContent = aContentEditToolbar;
				oSimpleForm.setToolbar(oHeaderToolbar);
				oSimpleForm.setEditable(true);
				oSimpleForm.setBackgroundDesign(BackgroundDesign.Solid);
				oSimpleForm.addStyleClass("sapUiFormLblColon");
				break;

			case "B4":
				aContent = aContentEditOneContainer;
				oSimpleForm.setEditable(true);
				oSimpleForm.setToolbar();
				oSimpleForm.setBackgroundDesign(BackgroundDesign.Solid);
				oSimpleForm.removeStyleClass("sapUiFormLblColon");
				break;

			default:
				break;
			}
			oSimpleForm.removeAllContent();
			for (var i = 0; i < aContent.length; i++) {
				var oControl = aContent[i];
				oSimpleForm.addContent(oControl);
			}
		}
	}).addStyleClass("myPadding");

	var oApp = new App("myApp").placeAt("body");

	var oPage = new Page({
		title: "GridLayout",
		content : [
			oSimpleForm,
			oSegmentedButton
		]
	});

	oApp.addPage(oPage);
});
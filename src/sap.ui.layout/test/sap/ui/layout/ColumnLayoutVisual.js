// Note: the HTML page 'ColumnLayoutVisual.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/layout/library",
	"sap/m/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Link",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/App",
	"sap/m/Page"
	],
	async function(
		Core,
		CoreLib,
		LayoutLib,
		MLib,
		Form,
		FormContainer,
		FormElement,
		SemanticFormElement,
		ColumnLayout,
		ColumnElementData,
		ColumnContainerData,
		Title,
		Toolbar,
		ToolbarSpacer,
		mTitle,
		Label,
		Text,
		Input,
		Link,
		Button,
		SegmentedButton,
		SegmentedButtonItem,
		App,
		Page
		) {
	"use strict";

	await Core.ready();

	var InputType = MLib.InputType;
	var BackgroundDesign = LayoutLib.BackgroundDesign;

	var oContainerEdit1 = new FormContainer("FC1", {
				title : "Person",
				formElements : [
					new FormElement({label: "Name", fields: [new Input({value:"Max Mustermann", required: true})]}),
					new FormElement({label: new Label({text:"Street / No."}),
									 fields: [new Input({value:"Musterweg"}),
											  new Input({value:"10", layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]}),
					new SemanticFormElement({fieldLabels: [new Label({text:"PostCode"}), new Label({text:"City"})],
											 fields: [new Input({value:"12345", layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
													  new Input({value:"Musterstadt", layoutData: new ColumnElementData({cellsSmall: 8, cellsLarge: 5})})]})
					]
			});

	var oContainerEdit2 = new FormContainer("FC2", {
		toolbar : new Toolbar({
								content: [
									new mTitle({text: "Contact", tooltip: "Title tooltip"}),
									new ToolbarSpacer(),
									new Button({icon: "sap-icon://sap-ui5"})
								]
							}),
		formElements : [
			new FormElement({label: "Phone", fields: [new Input({value:"0123456789", type: InputType.Tel})]}),
			new FormElement({label: "Mail", fields: [new Input({value:"max@mustermann.de", type: InputType.Email})]}),
			new SemanticFormElement({label: "Web", fields: [new Input({value:"http://www.mustermann.de", type: InputType.Url}), new Input({value:"http://www.mustermann.com", type: InputType.Url})]})
			]
	});

	var oContainerDisplay1 = new FormContainer("FC3", {
				title : new Title({text : "Person"}),
				formElements : [
					new FormElement({label: "Name", fields: [new Text({text:"Max Mustermann"})]}),
					new FormElement({label: new Label({text:"Street / No."}), fields: [new Text({text:"Musterweg 10"})]}),
					new SemanticFormElement({fieldLabels: [new Label({text:"PostCode"}), new Label({text:"City"})],
											 fields: [new Input({value:"12345", layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
													  new Input({value:"Musterstadt"})]})
					]
			});

	var oContainerDisplay2 = new FormContainer("FC4", {
		title : "Contact",
		formElements : [
			new FormElement({label: "Phone", fields: [new Text({text:"0123456789"})]}),
			new FormElement({label: "Mail", fields: [new Link({text:"max@mustermann.de", href : "mailto:max@mustermann.de"})]}),
			new SemanticFormElement({label: "Web", fields: [new Link({text:"http://www.mustermann.de", href : "http://www.mustermann.de"}), new Link({text:"http://www.mustermann.com", href : "http://www.mustermann.com"})]})
			]
	});

	var oLayout = new ColumnLayout();
	var oForm = new Form("F1", {
		layout : oLayout,
		width : "100%",
		editable : true,
		title : "Person data",
		formContainers : [oContainerEdit1, oContainerEdit2]
	});

	var oSegmentedButton = new SegmentedButton("SB1", {
		selectedKey : "B1",
		items : [ new SegmentedButtonItem("B1", {key : "B1", text : "Edit"}),
				  new SegmentedButtonItem("B2", {key : "B2", text : "Display"}),
				  new SegmentedButtonItem("B3", {key : "B3", text : "more columns"}),
				  new SegmentedButtonItem("B4", {key : "B4", text : "one Container"}),
				  new SegmentedButtonItem("B5", {key : "B5", text : "expandable"})],
		selectionChange : function(oEvent) {
			var aContainers = [];
			switch (oEvent.getParameter("item").getKey()) {
			case "B1":
				oContainerEdit1.setTitle("Person");
				aContainers = [oContainerEdit1, oContainerEdit2];
				oForm.setEditable(true);
				oLayout.setBackgroundDesign(BackgroundDesign.Translucent);
				oLayout.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
				break;

			case "B2":
				aContainers = [oContainerDisplay1, oContainerDisplay2];
				oContainerDisplay1.setExpandable(false);
				oContainerDisplay1.setExpanded(true);
				oContainerDisplay2.setExpandable(false);
				oContainerDisplay2.setExpanded(true);
				oForm.setEditable(false);
				oLayout.setBackgroundDesign(BackgroundDesign.Transparent);
				oLayout.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
				break;

			case "B3":
				oContainerEdit1.setTitle("Person");
				aContainers = [oContainerEdit1, oContainerEdit2];
				oForm.setEditable(true);
				oLayout.setBackgroundDesign(BackgroundDesign.Translucent);
				oLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
				break;

			case "B4":
				oContainerEdit1.setTitle();
				aContainers = [oContainerEdit1];
				oForm.setEditable(true);
				oLayout.setBackgroundDesign(BackgroundDesign.Solid);
				oLayout.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
				break;

			case "B5":
				oContainerDisplay1.setExpandable(true);
				oContainerDisplay1.setExpanded(true);
				oContainerDisplay2.setExpandable(true);
				oContainerDisplay2.setExpanded(true);
				aContainers = [oContainerDisplay1, oContainerDisplay2];
				oForm.setEditable(false);
				oLayout.setBackgroundDesign(BackgroundDesign.Transparent);
				oLayout.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
				break;

			default:
				break;
			}
			oForm.removeAllFormContainers();
			for (var i = 0; i < aContainers.length; i++) {
				oForm.addFormContainer(aContainers[i]);
			}
		}
	}).addStyleClass("myPadding");

	var oApp = new App("myApp").placeAt("body");
	var oPage = new Page({
		title : "ColumnLayout",
		content : [ oForm, oSegmentedButton ]
	});

	oApp.addPage(oPage);

});
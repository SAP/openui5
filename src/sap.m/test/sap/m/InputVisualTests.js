sap.ui.require([
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/GridData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/core/VariantLayoutData",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/HBox",
	"sap/m/VBox"
	],
	function(
		SimpleForm,
		GridData,
		GridElementData,
		ColumnElementData,
		VariantLayoutData,
		Title,
		Label,
		Input,
		RadioButton,
		RadioButtonGroup,
		App,
		Page,
		HBox,
		VBox
	){

		"use strict";

		function handleContentChange(oEvent) {
			var choice = oEvent.getSource().getText();
			switch (choice) {
				case "Empty":
					sap.ui.getCore().byId("inp").setValue("");
					sap.ui.getCore().byId("inp").setPlaceholder("");
					break;
				case "Text":
					sap.ui.getCore().byId("inp").setValue("Some text");
					break;
				case "Placeholder":
					sap.ui.getCore().byId("inp").setValue("");
					sap.ui.getCore().byId("inp").setPlaceholder("Placeholder");
					break;
			}
		}

		function handleStateChange(oEvent) {
			var choice = oEvent.getSource().getText();
			switch (choice) {
				case "Standard":
					sap.ui.getCore().byId("inp").setEnabled(true);
					sap.ui.getCore().byId("inp").setEditable(true);
					break;
				case "Not enabled":
					sap.ui.getCore().byId("inp").setEnabled(false);
					sap.ui.getCore().byId("inp").setEditable(true);
					break;
				case "Not editable":
					sap.ui.getCore().byId("inp").setEnabled(true);
					sap.ui.getCore().byId("inp").setEditable(false);
					break;
			}
		}

		function handleValueStateChange(oEvent) {
			var choice = oEvent.getSource().getText();
			sap.ui.getCore().byId("inp").setValueState(choice);
			if ( choice === "Error") {
				sap.ui.getCore().byId("inp").setValueStateText("123 123 123 123 123 123 123 11111111111111111111111111111");
			}
		}

		function handleDescriptionChange(oEvent) {
			var choice = oEvent.getSource().getText();
			switch (choice) {
				case "None":
					sap.ui.getCore().byId("inp").setDescription("");
					break;
				case "Visible":
					sap.ui.getCore().byId("inp").setDescription("EUR");
					break;
			}
		}

		function handleValueHelpChange(oEvent) {
			var choice = oEvent.getSource().getText();
			switch (choice) {
				case "None":
					sap.ui.getCore().byId("inp").setShowValueHelp(false);
					break;
				case "Visible":
					sap.ui.getCore().byId("inp").setShowValueHelp(true);
					break;
			}
		}

		var app = new App("myApp", {initialPage: "inpPage"});
		app.placeAt("body");

		var initialPage = new Page("inpPage", {
			showHeader: false,
			content: [
				new HBox({
					wrap: "Wrap",
					items: [
						new VBox({
							items: [
								new Title({text: "Input Content:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 2,
									buttons: [
										new RadioButton("rb1", {text: "Text", select: handleContentChange}),
										new RadioButton("rb2", {text: "Placeholder", select: handleContentChange}),
										new RadioButton("rb3", {text: "Empty", select: handleContentChange})
									]
								})
							]
						}),
						new VBox({
							items: [
								new Title({text: "Input States:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 2,
									buttons: [
										new RadioButton("rb4", {text: "Not enabled", select: handleStateChange}),
										new RadioButton("rb5", {text: "Not editable", select: handleStateChange}),
										new RadioButton("rb6", {text: "Standard", select: handleStateChange})
									]
								})
							]
						}),
						new VBox({
							items: [
								new Title({text: "Input Value States:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 4,
									buttons: [
										new RadioButton("rb7", {text: "Success", select: handleValueStateChange}),
										new RadioButton("rb8", {text: "Warning", select: handleValueStateChange}),
										new RadioButton("rb9", {text: "Error", select: handleValueStateChange}),
										new RadioButton("rb10", {text: "Information", select: handleValueStateChange}),
										new RadioButton("rb11", {text: "None", select: handleValueStateChange})
									]
								})
							]
						}),
						new VBox({
							items: [
								new Title({text: "Input Description:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 1,
									buttons: [
										new RadioButton("rb12", {text: "Visible", select: handleDescriptionChange}),
										new RadioButton("rb13", {text: "None", select: handleDescriptionChange})
									]
								}),
								new Title({text: "Input Value Help:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 1,
									buttons: [
										new RadioButton("rb14", {text: "Visible", select: handleValueHelpChange}),
										new RadioButton("rb15", {text: "None", select: handleValueHelpChange})
									]
								})
							]
						})
					]
				}),
				new Input("inp", { width: "10rem"}),
				new SimpleForm("sf", {
					width: "100%",
					maxContainerCols: 2,
					title: "Input in SimpleForm",
					layout: "ResponsiveGridLayout",
					labelSpanM: 1,
					labelSpanS: 3,
					labelSpanL: 1,
					editable: true,
					content:[
						new Label({ text:"Label 1" }),
						new Input("I1", { value:"Value 1", required: true, showValueHelp: true}),
						new Label({ text:"Label 2" }),
						new Input("I2", { value:"Value 2/1" }),
						new Input("I3", { value:"Value 2/2",
							layoutData: new VariantLayoutData({multipleLayoutData: [
								new GridElementData({hCells: "1"}),
								new GridData({span: "L2 M2 S2"}),
								new ColumnElementData({cellsSmall: 2, cellsLarge: 2})
							]})
						})
					]
				})

			]
		});
		app.addPage(initialPage);
});
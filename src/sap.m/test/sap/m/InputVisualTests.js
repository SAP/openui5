sap.ui.require([
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/GridData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/ColumnElementData",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/core/Item",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
	],
	function(
		SimpleForm,
		GridData,
		GridElementData,
		ColumnElementData,
		Column,
		ColumnListItem,
		VariantLayoutData,
		Item,
		Title,
		Label,
		Input,
		RadioButton,
		RadioButtonGroup,
		App,
		Page,
		HBox,
		VBox,
		Sorter,
		JSONModel
	){

		"use strict";

		var aInputIds = ["inpText", "inpPlaceholder", "inpEmpty", "inpMinWidth"];

		function handleStateChange(oEvent) {
			var choice = oEvent.getSource().getText();
			switch (choice) {
				case "Standard":
				aInputIds.forEach(function(inp) {
					sap.ui.getCore().byId(inp).setEnabled(true);
					sap.ui.getCore().byId(inp).setEditable(true);
				});
					break;
				case "Not enabled":
				aInputIds.forEach(function(inp) {
					sap.ui.getCore().byId(inp).setEnabled(false);
					sap.ui.getCore().byId(inp).setEditable(true);
				});
					break;
				case "Not editable":
				aInputIds.forEach(function(inp) {
					sap.ui.getCore().byId(inp).setEnabled(true);
					sap.ui.getCore().byId(inp).setEditable(false);
				});
					break;
			}
		}

		function handleValueStateChange(oEvent) {
			var choice = oEvent.getSource().getText();
				aInputIds.forEach(function(inp) {
				sap.ui.getCore().byId(inp).setValueState(choice);
				if ( choice === "Error") {
					sap.ui.getCore().byId(inp).setValueStateText("123 123 123 123 123 123 123 11111111111111111111111111111");
				}
			});
		}

		function handleDescriptionChange(oEvent) {
			var choice = oEvent.getSource().getText();
			switch (choice) {
				case "None":
					aInputIds.forEach(function(inp) {
						sap.ui.getCore().byId(inp).setDescription("");
					});
					break;
				case "Visible":
					aInputIds.forEach(function(inp) {
						sap.ui.getCore().byId(inp).setDescription("EUR");
					});
					break;
			}
		}

		function handleValueHelpChange(oEvent) {
			var choice = oEvent.getSource().getText();
			switch (choice) {
				case "None":
				aInputIds.forEach(function(inp) {
					sap.ui.getCore().byId(inp).setShowValueHelp(false);
				});
				break;
				case "Visible":
				aInputIds.forEach(function(inp) {
					sap.ui.getCore().byId(inp).setShowValueHelp(true);
				});
				break;
			}
		}

		function handleTextDirChange(oEvent) {
			var choice = oEvent.getSource().getText();
			aInputIds.forEach(function(inp) {
			 sap.ui.getCore().byId(inp).setTextDirection(choice);
			});
		}

		var app = new App("myApp", {initialPage: "inpPage"});
		app.placeAt("body");

		var aData = [
			{
				name: "Apple", group: "Fruits"
			}, {
				name: "Pineapple", group: "Fruits"
			},{
				name: "Apricot", group: "Fruits"
			},{
				name: "Banana", group: "Fruits"
			},{
				name: "Tomato", group: "Vegetables"
			},{
				name: "Asparagus", group: "Vegetables"
			}
		],
		oSuggestionsInput = new Input("inputWithSuggestions", {
			showSuggestion: true,
			ariaLabelledBy: "suggestionsLabel"
		});

		var oModel = new JSONModel();

		oModel.setData(aData);
		oSuggestionsInput.setModel(oModel);
		oSuggestionsInput.bindAggregation("suggestionItems", {
			path: "/",
			sorter: [new Sorter('group', false, true)],
			template: new Item({text: "{name}"})
		});

		var oInputWithStickySuggestions = new Input("inputWithStickySuggestions", {
			showSuggestion: true,
			suggestionColumns: [
				new Column({
					header: new Label({text : "Name"})
				}),
				new Column({
					header: new Label({text : "Group"})
				})
			],
			showTableSuggestionValueHelp: false
		});

		oModel = new JSONModel();

		aData = [];

		for (var index = 0; index < 30; index++) {
			aData.push({name: "Apple" + index, group: "Fruits"});
		}

		oModel.setData(aData);
		oInputWithStickySuggestions.setModel(oModel);
		oInputWithStickySuggestions.bindAggregation("suggestionRows", {
			path: "/",
			template: new ColumnListItem({
				cells: [
					new Label({text: "{name}"}),
					new Label({text: "{group}"})
				]
			})
		});

		var initialPage = new Page("inpPage", {
			showHeader: false,
			content: [
				new HBox({
					wrap: "Wrap",
					items: [
						new VBox({
							items: [
								new Title({text: "Input States:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 2,
									buttons: [
										new RadioButton("rb1", {text: "Not enabled", select: handleStateChange}),
										new RadioButton("rb2", {text: "Not editable", select: handleStateChange}),
										new RadioButton("rb3", {text: "Standard", select: handleStateChange})
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
										new RadioButton("rb4", {text: "Success", select: handleValueStateChange}),
										new RadioButton("rb5", {text: "Warning", select: handleValueStateChange}),
										new RadioButton("rb6", {text: "Error", select: handleValueStateChange}),
										new RadioButton("rb7", {text: "Information", select: handleValueStateChange}),
										new RadioButton("rb8", {text: "None", select: handleValueStateChange})
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
										new RadioButton("rb9", {text: "Visible", select: handleDescriptionChange}),
										new RadioButton("rb10", {text: "None", select: handleDescriptionChange})
									]
								}),
								new Title({text: "Input Value Help:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 1,
									buttons: [
										new RadioButton("rb11", {text: "Visible", select: handleValueHelpChange}),
										new RadioButton("rb12", {text: "None", select: handleValueHelpChange})
									]
								}),
								new Title({text: "Input Text Direction:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 0,
									buttons: [
										new RadioButton("rb13", {text: "LTR", select: handleTextDirChange}),
										new RadioButton("rb14", {text: "RTL", select: handleTextDirChange})
									]
								})
							]
						})
					]
				}),
				new VBox("inpHolder", {
					width: "10rem",
					items: [
						new Input(aInputIds[0], {value: "some text"}),
						new Input(aInputIds[1], {placeholder: "placeholder"}),
						new Input(aInputIds[2], {}),
						new Input(aInputIds[3], { value: "min width", width: "2rem"})
					]
				}),
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
				}),
				new VBox("suggestions", {
					items: [
						new Label("suggestionsLabel", {text: "Input with suggestions", labelFor: "inputWithSuggestions"}),
						oSuggestionsInput,
						new Label({text: "Input with sticky column header suggestions", labelFor: "inputWithStickySuggestions"}),
						oInputWithStickySuggestions
					]
				})

			]
		});
		app.addPage(initialPage);
});

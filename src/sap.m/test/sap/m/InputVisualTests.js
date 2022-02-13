sap.ui.require([
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/GridData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/ColumnElementData",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/core/Item",
	"sap/m/Button",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
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
		Button,
		Title,
		ToolbarSpacer,
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

		var oSuggestTableInput = new Input("inputWithTabularSuggestions", {
			width: "300px",
			showSuggestion: true,
			enableTableAutoPopinMode: true,
			suggestionColumns : [
				new Column({
					styleClass : "name",
					header : new Label({
						text : "Column 1"
					})
				}),
				new Column({
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "Column 2"
					})
				}),
				new Column({
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "Column 3"
					})
				}),
				new Column({
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "Column 4"
					})
				})
			]
		});

		oModel = new JSONModel();

		aData = {
			tabularSuggestionItems : [{
				name : "Auch ein gutes Ding",
				qty : "3 EA",
				limit : "99.00 EUR",
				price : "17.00 EUR"
			}, {
				name : "Besser ist das",
				qty : "1 EA",
				limit : "20.00 EUR",
				price : "13.00 EUR"
			}, {
				name : "Holter-di-polter",
				qty : "10 EA",
				limit : "15.00 EUR",
				price : "12.00 EUR"
			}, {
				name : "Ha so was",
				qty : "10 EA",
				limit : "5.00 EUR",
				price : "3.00 EUR"
			}]
		};

		var oSuggestionRowTemplate = new ColumnListItem({
			type : "Active",
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}), new Label({
					text: "{limit}"
				}), new Label({
					text : "{price}"
				})
			]
		});

		oModel.setData(aData);
		oSuggestTableInput.setModel(oModel);
		oSuggestTableInput.bindAggregation("suggestionRows", "/tabularSuggestionItems", oSuggestionRowTemplate);

		var aSuggestionsData = [
			{
				name: "Proctra X"
			}, {
				name: "PC Lock"
			},{
				name: "PC Power Station"
			},{
				name: "Power Pro Player 80"
			}
		],
		oStartSuggestionsInput = new Input("inputStartSuggestions", {
			showSuggestion: true,
			startSuggestion: 2
		});

		var oModel = new JSONModel();

		oModel.setData(aSuggestionsData);
		oStartSuggestionsInput.setModel(oModel);
		oStartSuggestionsInput.bindAggregation("suggestionItems", {
			path: "/",
			template: new Item({text: "{name}"})
		});

		var oTabularSeparatorsInput = new Input("inputWithTabularSuggestionSeparators", {
			width: "300px",
			showSuggestion: true,
			enableTableAutoPopinMode: true,
			suggestionColumns : [
				new Column({
					styleClass : "name",
					header : new Label({
						text : "Column 1"
					})
				}),
				new Column({
					styleClass : "qty",
					popinDisplay : "Inline",
					header : new Label({
						text : "Column 2"
					})
				}),
				new Column({
					styleClass : "limit",
					width : "30%",
					header : new Label({
						text : "Column 3"
					})
				}),
				new Column({
					styleClass : "price",
					width : "30%",
					popinDisplay : "Inline",
					header : new Label({
						text : "Column 4"
					})
				})
			]
		});

		oModel = new JSONModel();

		aData = {
			tabularSuggestionItems : [{
				name : "Huch ein gutes Ding",
				qty : "3 EA",
				limit : "99.00 EUR",
				price : "17.00 EUR"
			}, {
				name : "Hesser ist das",
				qty : "1 EA",
				limit : "20.00 EUR",
				price : "13.00 EUR"
			}, {
				name : "Holter-di-polter",
				qty : "10 EA",
				limit : "15.00 EUR",
				price : "12.00 EUR"
			}, {
				name : "Ha so was",
				qty : "10 EA",
				limit : "5.00 EUR",
				price : "3.00 EUR"
			}]
		};

		oTabularSeparatorsInput._setSeparateSuggestions(true);

		oModel.setData(aData);
		oTabularSeparatorsInput.setModel(oModel);
		oTabularSeparatorsInput.bindAggregation("suggestionRows", "/tabularSuggestionItems", oSuggestionRowTemplate);

		var oCustomCssButton = new Button("customCssButton",{
			text: "Toggle custom CSS for visual test",
			press: function() {
				document.body.classList.toggle("customClassForVisualTests");
			}
		});

		var initialPage = new Page("inpPage", {
			headerContent: [
				new Title({
					text: "sap.m.Input"
				}),
				new ToolbarSpacer({
					width: "600px"
				}),
				oCustomCssButton
			],
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
								})
							]
						}),
						new VBox({
							items: [
								new Title({text: "Input Value Help:"}).addStyleClass("sapUiSmallMargin"),
								new RadioButtonGroup({
									selectedIndex: 1,
									buttons: [
										new RadioButton("rb11", {text: "Visible", select: handleValueHelpChange}),
										new RadioButton("rb12", {text: "None", select: handleValueHelpChange})
									]
								})
							]
						}),
						new VBox({
							items: [
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
						oInputWithStickySuggestions,
						new Label({text: "Input with table suggetions", labelFor: "oSuggestTableInput"}),
						oSuggestTableInput,
						new Label({text: "Input with startSuggestions = 2", labelFor: "inputStartSuggestions"}),
						oStartSuggestionsInput,
						new Label({text: "Input with tabular suggestion separators", labelFor: "inputWithTabularSuggestionSeparators"}),
						oTabularSeparatorsInput
					]
				})

			]
		});
		app.addPage(initialPage);
});

sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/FormattedText",
	"sap/m/HBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Page",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/m/VBox",
	"sap/ui/core/Item",
	"sap/ui/core/ListItem",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/layout/GridData",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
],
	function(
		App,
		Button,
		CheckBox,
		Column,
		ColumnListItem,
		FormattedText,
		HBox,
		Input,
		Label,
		Link,
		Page,
		Title,
		ToolbarSpacer,
		VBox,
		Item,
		ListItem,
		VariantLayoutData,
		GridData,
		ColumnElementData,
		SimpleForm,
		Sorter,
		JSONModel
	) {

		"use strict";

		var app = new App("myApp", {initialPage: "inpPage"});
		app.placeAt("body");

		var oRegularInput = new Input("regularInput", {
			value: "Test",
			width: "200px"

		}).addStyleClass("sapUiMediumMarginEnd");

		var oRegularInputWithVh = new Input("regularVHInput", {
			placeholder: "Type in text",
			showValueHelp: true,
			description: "EUR",
			width: "400px"
		}).addStyleClass("sapUiMediumMarginEnd");

		var oReadonlyInput = new Input("readonlyInput", {
			width: "400px",
			editable: false,
			showValueHelp: true,
			placeholder: "Type in text",
			description: "USD"
		}).addStyleClass("sapUiMediumMarginEnd");

		var oReadonlyErrorInput = new Input("readonlyErrorInput", {
			width: "200px",
			editable: false,
			showValueHelp: true,
			value: "Test",
			valueState: "Error"
		}).addStyleClass("sapUiMediumMarginEnd");

		var oDisabledInput = new Input("disabledInput", {
			width: "400px",
			enabled: false,
			showValueHelp: true,
			placeholder: "Type in text",
			description: "USD"
		}).addStyleClass("sapUiMediumMarginEnd");

		var oDisabledWarningInput = new Input("disabledWarningInput", {
			width: "200px",
			enabled: false,
			showValueHelp: true,
			value: "Test",
			valueState: "Warning"
		});

		var oInputValueStateErrorLink = new Input("inputError", {
			placeholder: "Error value message text with link",
			valueState: "Error",
			width: "300px",
			formattedValueStateText: new FormattedText({
				htmlText: "Error value state message with formatted text containing %%0",
				controls: [
					new Link({
						text: "link",
						href: "https://www.sap.com"
					})
				]
			})
		}).addStyleClass("sapUiMediumMarginEnd");

		var oInputValueStateWarning = new Input("inputWarning", {
			placeholder: "Warning ...",
			valueState: "Warning",
			width: "300px"
		}).addStyleClass("sapUiMediumMarginEnd");

		var oInputValueStateInformationLink = new Input("inputInformation", {
			placeholder: "Information value message text with link",
			valueState: "Information",
			width: "300px",
			formattedValueStateText: new FormattedText({
				htmlText: "Information value state message with formatted text containing %%0",
				controls: [
					new Link({
						text: "link",
						href: "https://www.sap.com"
					})
				]
			})
		}).addStyleClass("sapUiMediumMarginEnd");

		var oInputValueStateSuccess = new Input("inputSuccess", {
			placeholder: "Success ...",
			valueState: "Success",
			width: "300px"
		});

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

		var oLongSuggestionsInput = new Input("inputWrapping", {
			width: "300px",
			showSuggestion: true,
			suggestionItems: [
				new Item({key: "key1", text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."}),
				new Item({key: "key2", text: "Item with very long text, wrapping enabled and wrapCharLimit set to а very large number in order to make the whole text always visible, taking as much space as needed."}),
				new Item({key: "key3", text: "Item that not wrap"})
			]
		});

		var oSecondaryValueInput = new Input("inputSecondaryValue", {
			width: "300px",
			showSuggestion: true,
			suggestionItems: [
				new ListItem({key: "key1", text: "Audio/Video Cable Kit - 4m", additionalText: "Titanium"}),
				new ListItem({key: "key2", text: "Copymaster", additionalText: "Alpha Printers"}),
				new ListItem({key: "key3", text: "Laser Allround", additionalText: "Alpha Printers"})
			]
		});

		var oLongSuggInput = new Input("inputLongSugg", {
			placeholder: "Input Long Suggestions - type 'L'",
			showSuggestion: true,
			width: "30rem",
			suggestionItems: [
				new Item({text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."}),
				new Item({text: "Lorem ipsu"})
			]
		});

		var oClearIconInput = new Input("inputClearIcon", {
			value: "Test",
			showClearIcon: true
		});

		var oCustomCssButton = new Button("customCssButton",{
			text: "Toggle custom CSS for visual test",
			press: function() {
				document.body.classList.toggle("customClassForVisualTests");
			}
		});

		var theCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		});

		var initialPage = new Page("inpPage", {
			headerContent: [
				new Title({
					text: "sap.m.Input"
				}),
				new ToolbarSpacer({
					width: "200px"
				}),
				theCompactMode,
				new ToolbarSpacer({
					width: "200px"
				}),
				oCustomCssButton
			],
			content: [
				new HBox({
					items: [
						oRegularInput,
						oRegularInputWithVh,
						oReadonlyInput,
						oReadonlyErrorInput,
						oDisabledInput,
						oDisabledWarningInput
					]
				}).addStyleClass("sapUiMediumMarginBottom"),
				new HBox({
					items: [
						oInputValueStateErrorLink,
						oInputValueStateWarning,
						oInputValueStateInformationLink,
						oInputValueStateSuccess
					]
				}).addStyleClass("sapUiMediumMarginBottom"),
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
								new undefined/*GridElementData*/({hCells: "1"}),
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
						new Label({text: "Input with tabular suggetions", labelFor: "oSuggestTableInput"}),
						oSuggestTableInput,
						new Label({text: "Input with startSuggestions = 2", labelFor: "inputStartSuggestions"}),
						oStartSuggestionsInput,
						new Label({text: "Input with tabular suggestion separators", labelFor: "inputWithTabularSuggestionSeparators"}),
						oTabularSeparatorsInput,
						new Label({text: "Input with long suggestions", labelFor: "inputWrapping"}),
						oLongSuggestionsInput,
						new Label({text: "Input with two columns layout", labelFor: "inputSecondaryValue"}),
						oSecondaryValueInput,
						new Label({text: "Input with long suggestions", labelFor: "inputLongSugg"}),
						oLongSuggInput,
						new Label({text: "Input with clear icon", labelFor: "inputClearIcon"}),
						oClearIconInput
					]
				})

			]
		}).addStyleClass("sapUiContentPadding");
		app.addPage(initialPage);
});

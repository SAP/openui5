sap.ui.define([
	"sap/m/App",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/FormattedText",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Link",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel"
], function(
	App,
	Column,
	ColumnListItem,
	FormattedText,
	Input,
	Label,
	mobileLibrary,
	Link,
	MessageBox,
	MessageToast,
	Page,
	InvisibleText,
	Item,
	coreLibrary,
	VerticalLayout,
	JSONModel
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mobileLibrary.InputType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var app = new App("myApp");

	function handleChange(oEvent){
		// var oInput = oEvent.getSource();
		// var sValue = oEvent.getParameter("value");
	}

	function handleChange2(oEvent){
		var oInput = oEvent.getSource();
		var sValue = oEvent.getParameter("value");
		if ( sValue != "hello") {
			oInput.setValueState(ValueState.Error);
		} else {
			oInput.setValueState(ValueState.None);
		}
	}

	function handleValueHelp(oEvent) {
		MessageToast.show("Value help requested");
	}

	var aData = [
		{name: "Dente, Al", userid: "U01"},
		{name: "Friese, Andy", userid: "U02"},
		{name: "Mann, Anita", userid: "U03"},
		{name: "Schutt, Doris", userid: "U04"},
		{name: "Open, Doris", userid: "U05"},
		{name: "Dewit, Kenya", userid: "U06"},
		{name: "Zar, Lou", userid: "U07"},
		{name: "Burr, Tim", userid: "U08"},
		{name: "Hughes, Tish", userid: "U09"},
		{name: "Town, Mo", userid: "U10"},
		{name: "Case, Justin", userid: "U11"},
		{name: "Time, Justin", userid: "U12"},
		{name: "Barr, Sandy", userid: "U13"},
		{name: "Poole, Gene", userid: "U14"},
		{name: "Ander, Corey", userid: "U15"},
		{name: "Early, Brighton", userid: "U16"},
		{name: "Noring, Constance", userid: "U17"},
		{name: "O'Lantern, Jack", userid: "U18"},
		{name: "Tress, Matt", userid: "U19"},
		{name: "Turner, Paige", userid: "U20"}
	];

	var oModel1 = new JSONModel();
	oModel1.setData(aData);

	var oSuggestionData = {
			tabularSuggestionItems : [
				{	name : "Hard disk", qty : "2 EA", limit : "99.00 EUR", price : "90.00 EUR"},
				{	name : "CPU", qty : "1 EA", limit : "199.00 EUR", price : "180.00 EUR"},
				{	name : "DRAM", qty : "8 EA", limit : "99.00 EUR", price : "89.00 EUR"},
				{	name : "Fan", qty : "2 EA", limit : "30.00 EUR", price : "20.00 EUR"},
				{	name : "CPU Fan", qty : "1 EA", limit : "50.00 EUR", price : "48.00 EUR"},
				{	name : "Graphic card", qty : "1 EA", limit : "200.00 EUR", price : "150.00 EUR"},
				{	name : "CD drive", qty : "1 EA", limit : "99.00 EUR", price : "70.00 EUR"},
				{	name : "Monitor", qty : "2 EA", limit : "200.00 EUR", price : "190.00 EUR"},
				{	name : "Keyboard", qty : "1 EA", limit : "30.00 EUR", price : "20.00 EUR"},
				{	name : "Mouse", qty : "1 EA", limit : "99.00 EUR", price : "90.00 EUR"},
				{	name : "Mouse Pad", qty : "1 EA", limit : "20.00 EUR", price : "10.00 EUR"},
				{	name : "Speakers", qty : "1 EA", limit : "99.00 EUR", price : "60.00 EUR"}
			]
		};

	var oModel2 = new JSONModel();
	oModel2.setData(oSuggestionData);

	var oI18nModel = new JSONModel();
	oI18nModel.setData({
		Name : "Name",
		Qty : "Quantity",
		Value : "Value",
		Price : "Price"
	});
	sap.ui.getCore().setModel(oI18nModel, "i18n");

	var oTableItemTemplate = new ColumnListItem({
		type : "Active",
		vAlign : "Middle",
		cells : [
			new Label({text: "{name}"}),
			new Label({text: "{qty}", wrapping: true}),
			new Label({text: "{limit}"}),
			new Label({text: "{price}"})
		]
	});

	var mySuggestionColumns = [
		new Column({hAlign: "Begin", header: new Label({text: "{i18n>/Name}"})}),
		new Column({hAlign: "Center", popinDisplay: "Inline", header: new Label({text: "{i18n>/Qty}"}),minScreenWidth: "Tablet", demandPopin: true}),
		new Column({hAlign: "Center", width: "30%", header: new Label({text: "{i18n>/Value}"}), minScreenWidth: "XXSmall", demandPopin: true}),
		new Column({hAlign: "End", width: "30%", popinDisplay: "Inline", header: new Label({text : "{i18n>/Price}"}), minScreenWidth: "400px", demandPopin: true})
	];

	// create the static invisible text separately, not as part of the page tree.
	// Otherwise, it would be rendered twice
	new InvisibleText("descriptionNodeId", {text: "Additional input description referenced by aria-describedby."}).toStatic();

	var page1 = new Page("page1", {
		title:"Mobile Input",
		content : [
			new VerticalLayout("oVL", {
				width: "100%",
				content:[
					new Label({text: "Name", labelFor: "I1"}),
					new Input("I1", {type: InputType.Text, change: handleChange }),
					new Label({text: "email address", labelFor: "I2"}),
					new Input("I2", {type: InputType.Email, change: handleChange}),
					new Label({text: "Amount", labelFor: "I3"}),
					new Input("I3", {type: InputType.Number, change: handleChange}),
					new Label({text: "phone", labelFor: "I4"}),
					new Input("I4", {type: InputType.Tel, change: handleChange}),
					new Label({text: "link", labelFor: "I5"}),
					new Input("I5", {type: InputType.Url, change: handleChange}),
					new Label({text: "password is required", required: true, labelFor: "I6"}),
					new Input("I6", {type: InputType.Password, required: true, change: handleChange}),
					new Label({text: "Name", labelFor: "I7"}),
					new Input("I7", { placeholder: "choose name", showValueHelp: true, valueHelpRequest: handleValueHelp, change: handleChange}),
					new Label({text: "User", labelFor: "I8"}),
					new Input("I8", { showSuggestion: true, change: handleChange}).setModel(oModel1).bindAggregation("suggestionItems", "/", new Item({text: "{name}"})),
					new Label({text: "Hardware (try with C)", labelFor: "I9"}),
					new Input("I9", { showSuggestion: true, suggestionColumns: mySuggestionColumns, showValueHelp: true, valueHelpRequest: handleValueHelp, change: handleChange}).setModel(oModel2).bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate),
					new Label({text: "Price", labelFor: "I10"}),
					new Input("I10", { value: "220", description: "EUR", fieldWidth: "30%", change: handleChange}),
					new Label({text: "only \"hello\" is valid", labelFor: "I11"}),
					new Input("I11", {type: InputType.Text, value: "Hello", valueStateText: "Valid Value is Hello", change: handleChange2 }),
					new Label({text: "Input with aria-describedby", labelFor: "I13"}),
					new Input("I13", {type: InputType.Text, change: handleChange, ariaDescribedBy: "descriptionNodeId"}),
					new Label({text: "Input with value state Error", labelFor: "I12"}),
					new Input("I12", {
						showSuggestion: true,
						valueState: "Error",
						formattedValueStateText: new FormattedText({
							htmlText: "Invalid text input. For further information, please check out the following %%0.",
							controls: [
								new Link({
									text: "link",
									href: "#"
								})
							]
						})
					}).setModel(oModel1).bindAggregation("suggestionItems", "/", new Item({text: "{name}"}))
				]
			}).addStyleClass("sapUiContentPadding")
		]
	});
	app.addPage(page1);
	app.placeAt("body");
});

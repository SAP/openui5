sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/m/Page",
	"sap/m/Token",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/model/json/JSONModel"
], function(App, CheckBox, Column, ColumnListItem, Label, MultiInput, Page, Token, Toolbar, ToolbarSpacer, JSONModel) {
	"use strict";

	//Default sample
	var oMultiInputCustomValidator = new MultiInput("multiInputCustomValidator",{
		width:"50%",
		ariaLabelledBy: "labelDefault"
	});

	oMultiInputCustomValidator.setTokens([
		new Token({text: "Token 1 with a much much much longer text than the rest", key: "0001"}),
		new Token({text: "Token 2", key: "0002"}),
		new Token({text: "Token 3", key: "0003"}),
		new Token({text: "Token 4", key: "0004"}),
		new Token({text: "Token 5", key: "0005"})
	]);

	oMultiInputCustomValidator.addValidator(function(args){
		var text = args.text;
		return new Token({key: text, text: "\"" + text + "\""});
	});

	// data for tabular suggestions
	var oSuggestionData = {
		tabularSuggestionItems : [{
			name : "Holter-di-polter",
			qty : "10 EA",
			limit : "15.00 Eur",
			price : "12.00 EUR"
		}, {
			name : "Ha so was",
			qty : "10 EA",
			limit : "5.00 Eur",
			price : "3.00 EUR"
		}, {
			name : "Hurra ein Produkt",
			qty : "8 EA",
			limit : "60.00 Eur",
			price : "45.00 EUR"
		}, {
			name : "Hallo du tolles Ding",
			qty : "2 EA",
			limit : "40.00 Eur",
			price : "15.00 EUR"
		}, {
			name : "Hier sollte ich zuschlagen",
			qty : "10 EA",
			limit : "90.00 Eur",
			price : "55.00 EUR"
		},{
			name : "Hohoho",
			qty : "18 EA",
			limit : "29.00 Eur",
			price : "7.00 EUR"
		}, {
			name : "Holla die Waldfee",
			qty : "3 EA",
			limit : "55.00 Eur",
			price : "30.00 EUR"
		}, {
			name : "Hau Ruck",
			qty : "5 EA",
			limit : "2.00 Eur",
			price : "1.00 EUR"
		}, {
			name : "Haste mal nen Euro?",
			qty : "29 EA",
			limit : "99.00 Eur",
			price : "42.00 EUR"
		}, {
			name : "Hol es dir jetzt",
			qty : "4 EA",
			limit : "85.00 Eur",
			price : "10.00 EUR"
		}]
	};

	//Sample with tabular suggestions
	var oTabularSuggestMultiInput = new MultiInput("tabularSuggestMI", {
		width: "50%",
		ariaLabelledBy: "labelTabular",
		tokens:[
			new Token({text: "Token 1", key: "0001"}),
			new Token({text: "Token 2", key: "0002"}),
			new Token({text: "Token 3", key: "0003"}),
			new Token({text: "Token 4", key: "0004"}),
			new Token({text: "Token 5", key: "0005"}),
			new Token({text: "Token 6", key: "0006"})
		],
		suggestionColumns : [
			new Column({
				styleClass : "name",
				hAlign : "Left",
				header : new Label({
					text : "Name"
				})
			}),
			new Column({
				hAlign : "Center",
				styleClass : "qty",
				popinDisplay : "Inline",
				header : new Label({
					text : "Qty"
				}),
				minScreenWidth : "Tablet",
				demandPopin : true
			}),
			new Column({
				hAlign : "Center",
				styleClass : "limit",
				width : "30%",
				header : new Label({
					text : "Value"
				}),
				minScreenWidth : "XXSmall",
				demandPopin : true
			}),
			new Column({
				hAlign : "Right",
				styleClass : "price",
				width : "30%",
				popinDisplay : "Inline",
				header : new Label({
					text : "Price"
				}),
				minScreenWidth : "400px",
				demandPopin : true
			})
		]
	});

	oTabularSuggestMultiInput.addValidator(function(args){
		if (args.suggestionObject){
			var key = args.suggestionObject.getCells()[0].getText();
			var text = key + "(" + args.suggestionObject.getCells()[3].getText() + ")";

			return new Token({key: key, text: text});
		}
		return null;
	});

	var oTableItemTemplate = new ColumnListItem({
			type : "Active",
			vAlign : "Middle",
			cells : [
				new Label({
					text : "{name}"
				}),
				new Label({
					text: "{qty}"
				}),
				new Label({
					text: "{limit}"
				}),
				new Label({
					text : "{price}"
				})
			]
		}),
		oModel = new JSONModel();

	oModel.setData(oSuggestionData);
	oTabularSuggestMultiInput.setModel(oModel);
	oTabularSuggestMultiInput.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

	// Warning sample
	var oWarningMultiInput = new MultiInput("mIWarning", {
		placeholder: "Placeholder",
		valueState: "Warning",
		valueStateText: "Simple value state warning text",
		width: "50%",
		ariaLabelledBy: "labelWarning"
	}),

	// Error sample
		oErrorMultiInput = new MultiInput("mIError", {
			placeholder: "Placeholder",
			valueStateText: "Simple value state error text",
			valueState: "Error",
			width: "50%",
			ariaLabelledBy: "labelError"
		});

	var oSuccessMultiInput =  new MultiInput("mISuccess", {
		placeholder: "Placeholder",
		valueState: "Success",
		width: "50%",
		ariaLabelledBy: "labelSuccess"
	});

	//Maximum three tokens
	var oMultiInput8 = new MultiInput("multiInputNoPlaceholder", {
		enableMultiLineMode: true,
		maxTokens: 3,
		width: "50%",
		ariaLabelledBy: "labelMaxTokens"
	});

	oMultiInput8.addValidator(function(args){
		var text = args.text;
		return new Token({key: text, text: text});
	});

	//Read-only
	var oMultiInputReadOnly = new MultiInput("multiInputReadOnlyInitial", {
			width : "50%",
			ariaLabelledBy: "labelReadOnly",
			tokens : [
				new Token({text: "100", key: "0001"}),
				new Token({text: "101", key: "0002"}),
				new Token({text: "102", key: "0003"}),
				new Token({text: "103", key: "0004"}),
				new Token({text: "104", key: "0005"}),
				new Token({text: "105", key: "0006"}),
				new Token({text: "106", key: "0007"}),
				new Token({text: "107", key: "000800"}),
				new Token({text: "108", key: "000600"}),
				new Token({text: "109", key: "000700"}),
				new Token({text: "110", key: "000800"})
			]
		}).setEditable(false),

		//Disabled
		oDisabledMultiInput = new MultiInput("multiInputDisabled",{
			width:"50%",
			enabled: false,
			ariaLabelledBy: "labelDisabled"
		});

	oDisabledMultiInput.setTokens([
		new Token({text: "Token 1 with a much much much longer text than the rest", key: "0001"}),
		new Token({text: "Token 2", key: "0002"}),
		new Token({text: "Token 3", key: "0003"}),
		new Token({text: "Token 4", key: "0004"})
	]);

	var oCompactMode = new CheckBox("compactMode", {
		text: "Compact Mode",
		selected : false,
		select : function() {
			document.body.classList.toggle("sapUiSizeCompact");
			sap.ui.getCore().notifyContentDensityChanged();
		}
	});

	//******************************************

	var app = new App("myApp");

	var oPage = new Page("page1", {
		title:"MultiInput Accessibility Test Page",
		content : [
			new Label("labelDefault", {labelFor: oMultiInputCustomValidator.getId(), text: "Default sample", width: "100%"}),
			oMultiInputCustomValidator,
			new Label("labelTabular", {labelFor: oTabularSuggestMultiInput.getId(), text: "Sample with tabular suggestions", width: "100%"}),
			oTabularSuggestMultiInput,
			new Label("labelWarning", {labelFor: oWarningMultiInput.getId(), text: "Warning value state sample", width: "100%"}),
			oWarningMultiInput,
			new Label("labelError", {labelFor: oErrorMultiInput.getId(), text: "Error value state sample", width: "100%"}),
			oErrorMultiInput,
			new Label("labelSuccess", {labelFor: oSuccessMultiInput.getId(), text: "Success value state sample", width: "100%"}),
			oSuccessMultiInput,
			new Label("labelMaxTokens", {labelFor: oMultiInput8.getId(), text:"Sample with maximum three tokens", width: "100%"}),
			oMultiInput8,
			new Label("labelReadOnly", {labelFor: oMultiInputReadOnly.getId(), text:"Read only state sample", width: "100%"}),
			oMultiInputReadOnly,
			new Label("labelDisabled", {labelFor: oDisabledMultiInput.getId(), text : "Not interactable sample", width: "100%"}),
			oDisabledMultiInput
		],
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				oCompactMode
			]
		})
	}).addStyleClass("sapUiContentPadding");

	app.addPage(oPage);

	app.placeAt("body");
});

sap.ui.define([
	"sap/ui/core/InvisibleMessage",
	"sap/m/TextArea",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/m/SearchField",
	"sap/m/SuggestionItem",
	"sap/m/Page",
	"sap/m/App",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/core/HTML"
],
	function (
		InvisibleMessage,
		TextArea,
		MultiInput,
		Token,
		SearchField,
		SuggestionItem,
		Page,
		App,
		coreLibrary,
		JSONModel,
		Filter,
		HTML
	) {
		"use strict";

		var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

		//sample with TextArea control where a message is read out when the characters limit is reached
		var oTextArea = new TextArea({
			showExceededText: true,
			value: "This is text",
			width: "100%",
			maxLength: 40,
			height: "100px"
		});

		oTextArea.attachLiveChange(function (oEvent) {
			var oTextAreaSource = oEvent.getSource(),
				iValueLength = oTextAreaSource.getValue().length,
				iMaxLength = oTextAreaSource.getMaxLength(),
				iCharactersLeft = iMaxLength - iValueLength,
				oInvisibleMessage = InvisibleMessage.getInstance();

			if (iCharactersLeft === 0) {
				oInvisibleMessage.announce("There are no more remaining characters in the TextArea", InvisibleMessageMode.Polite);
			}
		});

		//sample with sap.m.MultiInput where information about the deleted token is read out
		var fnGetData = function(iCount) {
			var aData = [];
			for (var i = 0; i < iCount; i++) {
				aData[i] = {
					name: "tag" + i
				};
			}
			return aData;
		};

		var aData = fnGetData(10),
			oModel = new JSONModel(aData),
			oMultiInput = new MultiInput({
				tokens: {
					path: 'data>/',
					template: new Token({
						text: "{data>name}",
						key: "{data>name}"
					})
				}
			}).setModel(oModel, "data");

		oMultiInput.attachTokenUpdate(function (oEvent) {
			var oTokenRemoved = oEvent.getParameter("removedTokens")[0].getText();

			InvisibleMessage.getInstance().announce("Token with name " + oTokenRemoved + " has been deleted", InvisibleMessageMode.Assertive);
		});

		// sample with sap.m.SearchField where filtered items count is read out
		var aNames = [
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Maria", lastName: "Jones"}
			],
			oModel = new JSONModel(aNames),
			oSearchField = new SearchField({
				enableSuggestions: true,
				suggestionItems: {
					path:'data>/',
					template: new SuggestionItem({
						text: "{data>firstName}",
						key: "{data>/lastName}"
					})
				},
				suggest: onSuggest
			}).setModel(oModel, "data");

		function onSuggest(event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("firstName", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						}),
						new Filter("lastName", function (sDes) {
							return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}
			var oItems = oSearchField.getBinding("suggestionItems").filter(aFilters);
			InvisibleMessage.getInstance().announce("There are " + oItems.iLength + " items found with your search", InvisibleMessageMode.Assertive);
			oSearchField.suggest();
		}


		new App().addPage(new Page({
			title: "InvisibleMessage Test Page",
			content: [
				new HTML({ content: "<h4>TextArea -  available characters are read out on input</h4>" }),
				oTextArea,

				new HTML({ content: "<h4>MultiInput - information about the deleted token is read out</h4>" }),
				oMultiInput,

				new HTML({ content: "<h4>SearchField - filtered items count is read out</h4>" }),
				oSearchField
			]
		}).addStyleClass("sapUiContentPadding")).placeAt("content");
});
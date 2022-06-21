sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IconPool",
	"sap/m/SuggestionItem",
	"sap/m/App",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/m/SearchField",
	"sap/m/Dialog",
	"sap/ui/core/library",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/HBox",
	"sap/base/Log"
], function(
	JSONModel,
	IconPool,
	SuggestionItem,
	App,
	MessageToast,
	Label,
	SearchField,
	Dialog,
	coreLibrary,
	Bar,
	Button,
	Page,
	HBox,
	Log
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	function getIcon(i) {
		return IconPool.getIconURI(i);
	}

	var aSuggestionData = [
		{text: "ABCDEFGHI", description: "cat 01",  key: "001", icon: getIcon("search")},
		{text: "ABCDEFGH" , description: "cat 02",  key: "002", icon: ""},
		{text: "ABCDEFG"  , description: "cat 03",  key: "003", icon: getIcon("synchronize")},
		{text: "ABCDEF"   , description: "cat 04",  key: "004", icon: getIcon("wrench")},
		{text: "ABCDE"    , description: "cat 05",  key: "005", icon: getIcon("refresh")},
		{text: "ABCD"     , description: "cat 06",  key: "006", icon: ""},
		{text: "ABC"      , description: "cat 07",  key: "007", icon: ""},
		{text: "AB"       , description: "cat 08",  key: "008", icon: ""},
		{text: "A"        , description: "cat 09",  key: "009", icon: ""}
	];

	function createSuggestionModel() {
		var model = new JSONModel();
		model.setData(aSuggestionData.slice());
		return model;
	}

	var oSuggestionListItemTemplate = new SuggestionItem({
		text : "{text}",
		description : "{description}",
		key: "{key}",
		icon: "{icon}"
	});

	var app = new App("searchSuggestionsApp", {initialPage:"searchPage"});

	function onSearch(event) {
		MessageToast.show("Search event is fired!");

		Log.debug("searchField: search for: " + event.getParameter("query"));
		if (event.getParameter("refreshButtonPressed")){
			Log.debug("searchField: refresh button was pressed");
		}
		var item = event.getParameter("suggestionItem");
		if (item) {
			Log.debug("searchField: suggestion item with text '" + item.getText() + "' was selected");
		}
	}
	function onLiveChange(event) {
		Log.debug("searchField: liveChange for: " + event.getParameter("newValue"));
	}
	function onSuggest(event) {
		var value = event.getParameter("suggestValue");
		var newData;
		if (value) {
			value = value.toUpperCase();
			newData = aSuggestionData.filter(function(item){
				return (item.text || "").toUpperCase().indexOf(value) > -1 || (item.description || "").toUpperCase().indexOf(value) > -1;
			});
		} else {
			newData = aSuggestionData.slice();
		}
		event.getSource().getModel().setData(newData);
		Log.debug("searchField: Suggest for: " + event.getParameter("value"));
	}

	function doSuggest(event) {
		onSuggest(event);
		// eslint-disable-next-line no-constant-condition
		if (true || event.getSource() === barSearchField || event.getParameter("suggestValue")){
			event.getSource().suggest();
		}
	}
	var barSearchFieldLabel = new Label({
		text: "Search"
	}).addStyleClass("sapUiTinyMarginEnd");
	var barSearchField = new SearchField("SFB1", {
		placeholder: "Search",
		ariaLabelledBy: barSearchFieldLabel,
		enableSuggestions: true,
		search:onSearch,
		suggest: doSuggest
	});
	barSearchField
		.setModel(createSuggestionModel())
		.bindAggregation("suggestionItems", {
			path: "/",
			template: oSuggestionListItemTemplate,
			templateShareable: true
		});

	var dialogBarSearchField = barSearchField.clone("dialogBar");
	var dialogSearchField = new SearchField("SFDialog", {
			placeholder: "Search",
			ariaLabelledBy: barSearchFieldLabel,
			enableSuggestions: true,
			search:onSearch,
			suggest: doSuggest
		})
		.setModel(createSuggestionModel())
		.bindAggregation("suggestionItems", {
			path: "/",
			template: oSuggestionListItemTemplate,
			templateShareable: true
		});

	var oDialog = new Dialog("Dialog", {
		title: "SearchField in a Dialog",
		state: ValueState.Success,
		subHeader: new Bar({
			contentLeft: dialogBarSearchField
		}),
		content: [
			dialogSearchField
		],
		beginButton:
			new Button({
				text: "Accept",
				press : function() {
					oDialog.close();
				}
			}),
		endButton:
			new Button({
				text: "Reject",
				press : function() {
					oDialog.close();
				}
			})
	});

	var searchField1Label = new Label({ text: "Search" });

	var searchField = new SearchField("SF1", {
			placeholder: "Search",
			enableSuggestions: true,
			ariaLabelledBy: searchField1Label,
			search:onSearch,
			liveChange: onLiveChange,
			suggest: doSuggest
		});

	searchField.setModel(createSuggestionModel())
		.bindAggregation("suggestionItems", {
			path: "/",
			template: oSuggestionListItemTemplate,
			templateShareable: true
		});

	var page = new Page("searchPage", {
		enableScrolling: true,
		title:"Search Field with suggestions",
		customHeader: new Bar("P1Header", {
			contentLeft: [
				new Button('dialogButton', {
					text: "Open a Dialog",
					press : function() {
						oDialog.open();
					}
				})
			],
			contentRight: [
				new HBox({
					items: [
						barSearchFieldLabel,
						barSearchField
					]
				})
			]
		}),
		content: [
			searchField1Label,
			searchField
		]
	});

	app.addPage(page).placeAt("body");
});

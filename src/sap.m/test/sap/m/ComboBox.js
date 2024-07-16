// Note: the HTML page 'ComboBox.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item",
	"sap/ui/core/SeparatorItem",
	"sap/ui/core/ListItem",
	"sap/ui/core/HTML",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/ComboBox",
	"sap/m/Label",
	"sap/m/FormattedText",
	"sap/m/Link",
	"sap/m/Text",
	"sap/ui/core/library",
	"sap/m/MessageToast",
	"sap/ui/core/Popup",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/m/App",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], async function(Core, JSONModel, Item, SeparatorItem, ListItem, HTML, HorizontalLayout, ComboBox, Label, FormattedText, Link, Text, coreLibrary, MessageToast, Popup, Button, Page, Title, ToolbarSpacer, App, Log, jQuery) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	await Core.ready();

	var TextDirection = coreLibrary.TextDirection;
	var oModel = new JSONModel();
	var mData = {
		"items": [
			{
				"key": "LeaveBlank",
				"text": "<Leave Blank>"
			},
			{
				"key": "KEEP",
				"text": "<Keep Existing Value>"
			},
			{
				"key": "DZ",
				"text": "Algeria"
			},
			{
				"key": "AR",
				"text": "Argentina"
			},

			{
				"key": "AU",
				"text": "Australia"
			},

			{
				"key": "AT",
				"text": "Austria"
			},

			{
				"key": "BH",
				"text": "Bahrain"
			},

			{
				"id": "belgium",
				"key": "BE",
				"text": "Belgium"
			},

			{
				"key": "BA",
				"text": "Bosnia and Herzegovina"
			},

			{
				"key": "BR",
				"text": "Brazil"
			},

			{
				"key": "BG",
				"text": "Bulgaria"
			},

			{
				"key": "CA",
				"text": "Canada"
			},

			{
				"key": "CL",
				"text": "Chile"
			},

			{
				"key": "CO",
				"text": "Colombia"
			},

			{
				"key": "HR",
				"text": "Croatia"
			},

			{
				"key": "CU",
				"text": "Cuba"
			},

			{
				"key": "CZ",
				"text": "Czech Republic"
			},

			{
				"key": "DK",
				"text": "Denmark"
			},

			{
				"key": "EG",
				"text": "Egypt"
			},

			{
				"key": "EE",
				"text": "Estonia"
			},

			{
				"key": "FI",
				"text": "Finland"
			},

			{
				"key": "FR",
				"text": "France"
			},

			{
				"key": "GER",
				"text": "Germany"
			},

			{
				"key": "GH",
				"text": "Ghana"
			},

			{
				"key": "GR",
				"text": "Greece"
			},

			{
				"key": "HU",
				"text": "Hungary"
			},

			{
				"key": "IN",
				"text": "India"
			},

			{
				"key": "ID",
				"text": "Indonesia"
			},

			{
				"key": "IE",
				"text": "Ireland"
			},

			{
				"key": "IL",
				"text": "Israel"
			},

			{
				"key": "IT",
				"text": "Italy"
			},

			{
				"key": "JP",
				"text": "Japan"
			},

			{
				"key": "JO",
				"text": "Jordan"
			},

			{
				"key": "KE",
				"text": "Kenya"
			},

			{
				"key": "KW",
				"text": "Kuwait"
			},

			{
				"key": "LV",
				"text": "Latvia"
			},

			{
				"key": "LT",
				"text": "Lithuania"
			},

			{
				"key": "MK",
				"text": "Macedonia"
			},

			{
				"key": "MY",
				"text": "Malaysia"
			},

			{
				"key": "MX",
				"text": "Mexico"
			},

			{
				"key": "ME",
				"text": "Montenegro"
			},

			{
				"key": "MA",
				"text": "Morocco"
			},

			{
				"key": "NL",
				"text": "Netherlands"
			},

			{
				"key": "NZ",
				"text": "New Zealand"
			},

			{
				"key": "NG",
				"text": "Nigeria"
			},

			{
				"key": "NO",
				"text": "Norway"
			},

			{
				"key": "OM",
				"text": "Oman"
			},

			{
				"key": "PE",
				"text": "Peru"
			},

			{
				"key": "PH",
				"text": "Philippines"
			},

			{
				"key": "PL",
				"text": "Poland"
			},
			{
				"key": "PT",
				"text": "Portugal"
			},

			{
				"key": "QA",
				"text": "Qatar"
			},

			{
				"key": "RO",
				"text": "Romania"
			},

			{
				"key": "RU",
				"text": "Russia"
			},

			{
				"key": "SA",
				"text": "Saudi Arabia"
			},

			{
				"key": "SN",
				"text": "Senegal"
			},

			{
				"key": "RS",
				"text": "Serbia"
			},

			{
				"key": "SG",
				"text": "Singapore"
			},

			{
				"key": "SK",
				"text": "Slovakia"
			},

			{
				"key": "SI",
				"text": "Slovenia"
			},

			{
				"key": "ZA",
				"text": "South Africa"
			},

			{
				"key": "KR",
				"text": "South Korea"
			},

			{
				"key": "ES",
				"text": "Spain"
			},

			{
				"key": "SE",
				"text": "Sweden"
			},

			{
				"key": "CH",
				"text": "Switzerland"
			},

			{
				"key": "TN",
				"text": "Tunisia"
			},

			{
				"key": "TR",
				"text": "Turkey"
			},

			{
				"key": "UG",
				"text": "Uganda"
			},

			{
				"key": "UA",
				"text": "Ukraine"
			},

			{
				"key": "AE",
				"text": "United Arab Emirates"
			},

			{
				"key": "GB",
				"text": "United Kingdom"
			},

			{
				"key": "YE",
				"text": "Yemen"
			}
	],
		"testItems": [
			{
				"key": "1234",
				"text": "Test"
			},

			{
				"key": "2341",
				"text": "1Test"
			},

			{
				"key": "T234",
				"text": "Sonne"
			},

			{
				"key": "3433",
				"text": "Wolke"
			}
	],
		"addText": [
			{
				"key": "1234",
				"text": "Test",
				"addText" : "1234"
			},

			{
				"key": "2341",
				"text": "1Test",
				"addText" : "2341"
			},

			{
				"key": "T234",
				"text": "Sonne",
				"addText" : ""
			},

			{
				"key": "3433",
				"text": "Wolke",
				"addText" : ""
			}
		],
		"special": [
			{
				"key": "1",
				"text": "NoMatchText",
				"addText" : "NoMatchAddText"
			},
			{
				"key": "2",
				"text": "NoMatchText",
				"addText" : "MatchAddText"
			},
			{
				"key": "3",
				"text": "MatchText",
				"addText" : "NoMatchAddText"
			},
			{
				"key": "4",
				"text": "MatchText",
				"addText" : "MatchAddText"
			},
			{
				"key": "5",
				"text": "NoMatchText",
				"addText" : "MatchAddText"
			},
			{
				"key": "6",
				"text": "NoMatchText",
				"addText" : "NoMatchAddText"
			},
			{
				"key": "7",
				"text": "MatchText",
				"addText" : "NoMatchAddText"
			}
		],
		"selectedKey1" : "",
		"value1" : "",
		"selectedKey2" : ""
	};

	oModel.setData(mData);

	var oItemTemplate = new ListItem({
		key: "{key}",
		text: "{text}",
		additionalText: "{key}"
	});

	var oItemTemplate2 = new ListItem({
		key: "{key}",
		text: "{text}",
		additionalText: "{addText}"
	});

	var fnFormatter = function (text, key) {
		var sText = "";

		if (text !== undefined) {
			sText += text + " ";
		}

		if (key !== undefined) {
			sText += key;
		}

		return sText;
	};

	var oComboBox = new ComboBox("box_default",{
		items: {
			path: "/items",
			template: oItemTemplate
		},

		change: function(oControlEvent) {
			Log.info('Event fired: "change" the value of the input change to ' + oControlEvent.getParameter("value") + " on", this);
			MessageToast.show("change " + oControlEvent.getParameter("value"));
		},

		selectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");
			oSelectedItem = oSelectedItem ? oSelectedItem.getText() : oSelectedItem;
			Log.info('Event fired: "selectionChange" selected item change to ' + oSelectedItem + " on", this);
		}
	});

	var oComboBoxTwoColumn = new ComboBox("box_two_column",{
		showSecondaryValues: true,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oComboBoxContainsSearch = new ComboBox({
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	oComboBoxContainsSearch.setFilterFunction(function(sValue, oItem) {
		return oItem.getText().toLowerCase().indexOf(sValue.toLowerCase()) !== -1;
	});

	var oComboBoxTwoColumnSearchBoth = new ComboBox({
		showSecondaryValues: true,
		filterSecondaryValues: true,
		value: "{/value1}",
		selectedKey: "{/selectedKey1}",
		items: {
			path: "/items",
			template: oItemTemplate
		},

		change: function(oControlEvent) {
			Log.info('Event fired: "change" the value of the input change to ' + oControlEvent.getParameter("value") + " on", this);
			MessageToast.show("change " + oControlEvent.getParameter("value"));
		},

		selectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");
			oSelectedItem = oSelectedItem ? oSelectedItem.getText() : oSelectedItem;
			Log.info('Event fired: "selectionChange" selected item change to ' + oSelectedItem + " on", this);
		}
	});

	var oComboBoxTwoColumnSearchBoth2 = new ComboBox({
		showSecondaryValues: true,
		filterSecondaryValues: true,
		selectedKey: "{/selectedKey2}",
		items: {
			path: "/testItems",
			template: oItemTemplate
		},

		change: function(oControlEvent) {
			Log.info('Event fired: "change" the value of the input change to ' + oControlEvent.getParameter("value") + " on", this);
			MessageToast.show("change " + oControlEvent.getParameter("value"));
		},

		selectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");
			oSelectedItem = oSelectedItem ? oSelectedItem.getText() : oSelectedItem;
			Log.info('Event fired: "selectionChange" selected item change to ' + oSelectedItem + " on", this);
		}
	});

	var oComboBoxTwoColumnSearchBoth3 = new ComboBox({
		showSecondaryValues: true,
		filterSecondaryValues: true,
		items: {
			path: "/addText",
			template: oItemTemplate2
		},

		change: function(oControlEvent) {
			Log.info('Event fired: "change" the value of the input change to ' + oControlEvent.getParameter("value") + " on", this);
			MessageToast.show("change " + oControlEvent.getParameter("value"));
		},

		selectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");
			oSelectedItem = oSelectedItem ? oSelectedItem.getText() : oSelectedItem;
			Log.info('Event fired: "selectionChange" selected item change to ' + oSelectedItem + " on", this);
		}
	});

	var oComboBoxTwoColumnSearchBothShowOne = new ComboBox({
		showSecondaryValues: false,
		filterSecondaryValues: true,
		items: {
			path: "/items",
			template: oItemTemplate
		},

		change: function(oControlEvent) {
			Log.info('Event fired: "change" the value of the input change to ' + oControlEvent.getParameter("value") + " on", this);
			MessageToast.show("change " + oControlEvent.getParameter("value"));
		},

		selectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");
			oSelectedItem = oSelectedItem ? oSelectedItem.getText() : oSelectedItem;
			Log.info('Event fired: "selectionChange" selected item change to ' + oSelectedItem + " on", this);
		}
	});

	var oComboBoxTwoColumnSearchBothSpecial = new ComboBox({
		showSecondaryValues: true,
		filterSecondaryValues: true,
		items: {
			path: "/special",
			template: oItemTemplate2
		},

		change: function(oControlEvent) {
			Log.info('Event fired: "change" the value of the input change to ' + oControlEvent.getParameter("value") + " on", this);
			MessageToast.show("change " + oControlEvent.getParameter("value"));
		},

		selectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");
			oSelectedItem = oSelectedItem ? oSelectedItem.getText() : oSelectedItem;
			Log.info('Event fired: "selectionChange" selected item change to ' + oSelectedItem + " on", this);
		}
	});

	var oComboBoxDefault = new ComboBox("box_label_placeholder",{
		placeholder: "List of countries",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oLabel = new Label({
		text: "Country:",
		labelFor: oComboBoxDefault
	}).addStyleClass("customLabel");

	var oComboBoxWithPlaceholder = new ComboBox("box_placeholder",{
		placeholder: "Choose your country",

		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oComboBoxWithLongValueStateText = new ComboBox("box_longValueState",{
		placeholder: "Choose your country",
		valueState: "Warning",
		valueStateText: "Warning message. Extra long text used as a warning message. Extra long text used as a warning message - 2 Extra long text used as a warning message - 3..",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oComboBoxWithFormattedValueStateText = new ComboBox("box_formattedValueState",{
		placeholder: "Choose your country",
		valueState: "Warning",
		formattedValueStateText: new FormattedText({
			htmlText: "Warning value state message with formatted text containing %%0",
			controls: [new Link({
				text: "link",
				href: "#",
				press: function() {
					MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
				}
			})]
		}),
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oComboBoxWithValueStateTextMultipleLinks = new ComboBox("box_formattedValueStateErr",{
		placeholder: "Choose your country",
		valueState: "Error",
		formattedValueStateText: new FormattedText({
			htmlText: "Warning value state message with formatted text containing %%0 and a %%1",
			controls: [
				new Link({
					text: "link",
					href: "#",
					press: function() {
						MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
					}
				}),
				new Link({
					text: "second link",
					href: "#",
					press: function() {
						MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
					}
				})
			]
		}),
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oComboBoxDisabled = new ComboBox("box_disabled",{
		enabled: false,
		placeholder: "Choose your country",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oComboBoxReadOnly = new ComboBox("box_read_only",{
		editable: false,
		items: {
			path: "/items",
			template: oItemTemplate
		},
		selectedKey: "GER"
	});

	var oComboBoxSuccess = new ComboBox("box_success",{
		valueState: ValueState.Success,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oComboBoxWarning = new ComboBox("box_warning",{
		placeholder: "List of countries",
		valueState: ValueState.Warning,
		valueStateText: "value state text",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oLabelWarning = new Label({
		text: "Country:",
		labelFor: oComboBoxWarning
	}).addStyleClass("customLabel");

	var oComboBoxError = new ComboBox("box_error",{
		valueState: ValueState.Error,
		valueStateText: "value state text",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSpecialCharsModel = new JSONModel();
	var mSpecialCharsData = {
		"special": [
			{"text" : "product", "pey" : "productId"},
			{"text" : "näme", "key" : "name"},
			{"text" : "categöry", "key" : "category"},
			{"text" : "süppliername", "key" : "supplierName"},
			{"text" : "description", "key" : "description"},

			{"text" : "Абакан", "pey" : "productId"},
			{"text" : "Архангельск", "key" : "name"},
			{"text" : "Апатиты", "key" : "category"},
			{"text" : "Барнаул", "key" : "supplierName"},
			{"text" : "Белгород", "key" : "description"}
		]

	};

	oSpecialCharsModel.setData(mSpecialCharsData);

	var oSpecialCharsItemTemplate = new ListItem({
		key: "{key}",
		text: "{text}"
	});

	var oSpecialCharsComboBox = new ComboBox({
		items: {
			path: "/special",
			template: oSpecialCharsItemTemplate
		},

		change: function(oControlEvent) {
			Log.info('Event fired: "change" the value of the input change to ' + oControlEvent.getParameter("value") + " on", this);
			MessageToast.show("change " + oControlEvent.getParameter("value"));
		},

		selectionChange: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");
			oSelectedItem = oSelectedItem ? oSelectedItem.getText() : oSelectedItem;
			Log.info('Event fired: "selectionChange" selected item change to ' + oSelectedItem + " on", this);
			oSpecialCharsComboBox.invalidate();
		}

	});

	oSpecialCharsComboBox.setModel(oSpecialCharsModel);

	var oComboBoxGrouping = new ComboBox("combo-grouping", {
		items: [
			new SeparatorItem({text: "Group1"}),
			new Item({text: "item11", key:"key11"}),
			new Item({text: "item12", key:"key12"}),
			new SeparatorItem({text: "Group2"}),
			new Item({text: "item21", key:"key21"}),
			new Item({text: "item22", key:"key22"}),
			new SeparatorItem(),
			new Item({text: "item23", key:"key23"}),
			new Item({text: "item24", key:"key24"})
		]
	});

	var oComboBoxLongSuggestions = new ComboBox("combo-long-sugg", {
		width: "30rem",
		items: [
			new Item({text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. ", key:"key11"}),
		]
	});

	var oComboBoxRTL = new ComboBox({
		items: [
			new SeparatorItem({text: "Group1"}),
			new Item({text: "item11", key:"key11", textDirection: TextDirection.RTL}),
			new Item({text: "item12", key:"key12", textDirection: TextDirection.RTL}),
			new SeparatorItem({text: "Group2"}),
			new Item({text: "item21", key:"key21", textDirection: TextDirection.RTL}),
			new Item({text: "item22", key:"key22", textDirection: TextDirection.RTL}),
			new SeparatorItem(),
			new Item({text: "item23", key:"key23", textDirection: TextDirection.RTL}),
			new Item({text: "item24", key:"key24", textDirection: TextDirection.RTL})
		]
	});

	var oComboBoxWrapping = new ComboBox("comboBoxWrapping",{
		items: [
			new Item({text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", key: "1"}),
			new Item({text: "Item with very long text, wrapping enabled and wrapCharLimit set to а very large number in order to make the whole text always visible, taking as much space as needed.", key: "2"}),
			new Item({text: "Item that not wrap", key: "3"})
		]
	});

	// Add a css class to the body HTML element, in order to be used for caret stylization in visual tests run.
	var oCustomCssButton = new Button ("customCssButton",{
		text: "Toggle custom CSS for visual test",
		press: function() {
			var $body = jQuery("body");

			$body.toggleClass("customClassForVisualTests");
		}
	});

	var oPage = new Page("page",{
		headerContent: [
			new Title({
				text: "sap.m.ComboBox"
			}),
			new ToolbarSpacer({
				width: "600px"
			}),
			oCustomCssButton,
		],
		content: [
			new HTML("title_default",{ content: "<h3>Default</h3>" }),
			oComboBox,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>Two column layout</h3>" }),
			oComboBoxTwoColumn,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>setFilterFunction (contains)</h3>" }),
			oComboBoxContainsSearch,

			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>Two column layout, search in both columns</h3>" }),
			new HTML({ content: "<h4>Show both, search in both:</h4>" }),
			new HorizontalLayout({
				content: [
					oComboBoxTwoColumnSearchBoth,
					new Label({text: "Selected key:"}),
					new Text({text: "{/selectedKey1}"}),
					new Label({text: "Formatted pair:"}),
					new Text({text: {
						parts: [
							{path: "/value1"},
							{path: "/selectedKey1"}
						],
						formatter: fnFormatter
					}}),
				]
			}),
			new HTML({ content: "<br>" }),
			new HTML({ content: "<h4>Show both, search in both (test scenarios with binding shown):</h4>" }),
			new HorizontalLayout({
					content: [
						oComboBoxTwoColumnSearchBoth2,
						new Label({text: "Selected key:"}),
						new Text({text: "{/selectedKey2}"}),
					]
			}),
			new HTML({ content: "<br>" }),
			new HTML({ content: "<h4>Show both, search in both, not all items have additional text:</h4>" }),
			oComboBoxTwoColumnSearchBoth3,
			new HTML({ content: "<br>" }),
			new HTML({ content: "<h4>Show single column, search in both columns:</h4>" }),
			oComboBoxTwoColumnSearchBothShowOne,
			new HTML({ content: "<br>" }),
			new HTML({ content: "<h4>Special test case (test with letter \"m\"):</h4>" }),
			oComboBoxTwoColumnSearchBothSpecial,
			new HTML({ content: "<hr>" }),

			new HTML("title_placeholder",{ content: "<h3>Placeholder</h3>" }),
			oComboBoxWithPlaceholder,
			new HTML({ content: "<hr>" }),

			new HTML("title_label_placeholder",{ content: "<h3>Label and placeholder</h3>" }),
			new HorizontalLayout("layout_label_placeholder",{
				content: [
					oLabel,
					oComboBoxDefault
				]
			}),
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>Disabled</h3>" }),
			oComboBoxDisabled,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>Read only</h3>" }),
			oComboBoxReadOnly,
			new HTML({ content: "<hr>" }),

			new HTML("title_warning",{ content: "<h3>Warning state (with label and placeholder)</h3>" }),
			new HorizontalLayout("layout_warning",{
				content: [
					oLabelWarning,
					oComboBoxWarning
				]}
			),
			new HTML({ content: "<hr>" }),

			new HTML("title_success",{ content: "<h3>Success state</h3>" }),
			oComboBoxSuccess,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>Long value state message</h3>" }),
			oComboBoxWithLongValueStateText,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>Formatted value state message</h3>" }),
			oComboBoxWithFormattedValueStateText,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>Formatted value state message with multiple links</h3>" }),
			oComboBoxWithValueStateTextMultipleLinks,
			new HTML({ content: "<hr>" }),

			new HTML("title_error",{ content: "<h3>Error state</h3>" }),
			oComboBoxError,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>ComboBox with Accented characters</h3>" }),
			oSpecialCharsComboBox,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h3>ComboBox with Long Suggestions</h3>" }),
			oComboBoxLongSuggestions,

			new HTML({ content: "<h3>ComboBox with Grouping</h3>" }),
			oComboBoxGrouping,
			new HTML({ content: "<h3>ComboBox with RTL Items</h3>" }),
			oComboBoxRTL,
			new HTML({ content: "<hr>" }),
			new HTML({ content: "<h3>ComboBox with Wrapping</h3>" }),
			oComboBoxWrapping,
			new HTML({ content: "<hr>" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App("myApp", {
		initialPage: "page"
	});

	oApp.setModel(oModel);

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
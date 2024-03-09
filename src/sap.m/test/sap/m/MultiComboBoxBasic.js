sap.ui.define([
	"sap/base/Log",
	"sap/m/MultiComboBox",
	"sap/m/CheckBox",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Link",
	"sap/m/App",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/m/FormattedText",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel"],
function(
	Log,
	MultiComboBox,
	CheckBox,
	Button,
	Page,
	Link,
	App,
	Title,
	ToolbarSpacer,
	FormattedText,
	Item,
	JSONModel){

	"use strict";

	var oModel = new JSONModel();

	var mData = {
		"selected" : ["AR", "BH"],
		"items" : [{
			"key" : "DZ",
			"text" : "Algeria"
		},
		{
			"key" : "AR",
			"text" : "Argentina"
		},
		{
			"key" : "AU",
			"text" : "Australia"
		},
		{
			"key" : "DI",
			"text" : "Disabled",
			"enabled" : false
		},
		{
			"key" : "AT",
			"text" : "Austria"
		},
		{
			"key" : "BH",
			"text" : "Bahrain"
		},
		{
			"key" : "BE",
			"text" : "Belgium"
		},
		{
			"key" : "BA",
			"text" : "Bosnia and Herzegovina"
		},
		{
			"key" : "BR",
			"text" : "Brazil"
		},
		{
			"key" : "BG",
			"text" : "Bulgaria"
		},
		{
			"key" : "CA",
			"text" : "Canada"
		},
		{
			"key" : "CL",
			"text" : "Chile"
		},
		{
			"key" : "CO",
			"text" : "Colombia"
		},
		{
			"key" : "HR",
			"text" : "Croatia"
		},
		{
			"key" : "CZ",
			"text" : "Czech Republic"
		},
		{
			"key" : "DK",
			"text" : "Denmark"
		},
		{
			"key" : "EG",
			"text" : "Egypt"
		},
		{
			"key" : "EE",
			"text" : "Estonia"
		},
		{
			"key" : "FI",
			"text" : "Finland"
		},
		{
			"key" : "FR",
			"text" : "France"
		},
		{
			"key" : "GH",
			"text" : "Ghana"
		},
		{
			"key" : "GR",
			"text" : "Greece"
		},
		{
			"key" : "HU",
			"text" : "Hungary"
		},
		{
			"key" : "IN",
			"text" : "India"
		},
		{
			"key" : "ID",
			"text" : "Indonesia"
		},
		{
			"key" : "IE",
			"text" : "Ireland"
		},
		{
			"key" : "IL",
			"text" : "Israel"
		},
		{
			"key" : "IT",
			"text" : "Italy"
		},
		{
			"key" : "JP",
			"text" : "Japan"
		},
		{
			"key" : "JO",
			"text" : "Jordan"
		},
		{
			"key" : "KE",
			"text" : "Kenya"
		},
		{
			"key" : "KW",
			"text" : "Kuwait"
		},
		{
			"key" : "LV",
			"text" : "Latvia"
		},
		{
			"key" : "LT",
			"text" : "Lithuania"
		},
		{
			"key" : "MK",
			"text" : "Macedonia"
		},
		{
			"key" : "MY",
			"text" : "Malaysia"
		},
		{
			"key" : "MX",
			"text" : "Mexico"
		},
		{
			"key" : "ME",
			"text" : "Montenegro"
		},
		{
			"key" : "MA",
			"text" : "Morocco"
		},
		{
			"key" : "NL",
			"text" : "Netherlands"
		},
		{
			"key" : "NZ",
			"text" : "New Zealand"
		},
		{
			"key" : "NG",
			"text" : "Nigeria"
		},
		{
			"key" : "NO",
			"text" : "Norway"
		},
		{
			"key" : "OM",
			"text" : "Oman"
		},
		{
			"key" : "PE",
			"text" : "Peru"
		},
		{
			"key" : "PH",
			"text" : "Philippines"
		},
		{
			"key" : "PL",
			"text" : "Poland"
		},
		{
			"key" : "PT",
			"text" : "Portugal"
		},
		{
			"key" : "QA",
			"text" : "Qatar"
		},
		{
			"key" : "RO",
			"text" : "Romania"
		},
		{
			"key" : "RU",
			"text" : "Russia"
		},
		{
			"key" : "SA",
			"text" : "Saudi Arabia"
		},
		{
			"key" : "SN",
			"text" : "Senegal"
		},
		{
			"key" : "RS",
			"text" : "Serbia"
		},
		{
			"key" : "SG",
			"text" : "Singapore"
		},
		{
			"key" : "SK",
			"text" : "Slovakia"
		},
		{
			"key" : "SI",
			"text" : "Slovenia"
		},
		{
			"key" : "ZA",
			"text" : "South Africa"
		},
		{
			"key" : "KR",
			"text" : "South Korea"
		},
		{
			"key" : "ES",
			"text" : "Spain"
		},
		{
			"key" : "SE",
			"text" : "Sweden"
		},
		{
			"key" : "CH",
			"text" : "Switzerland"
		},
		{
			"key" : "TN",
			"text" : "Tunisia"
		},
		{
			"key" : "TR",
			"text" : "Turkey"
		},
		{
			"key" : "UG",
			"text" : "Uganda"
		},
		{
			"key" : "UA",
			"text" : "Ukraine"
		},
		{
			"key" : "AE",
			"text" : "United Arab Emirates"
		},
		{
			"key" : "GB",
			"text" : "United Kingdom"
		},
		{
			"key" : "YE",
			"text" : "Yemen"
		}]
	};

	oModel.setData(mData);

	var oItemTemplate = new Item({
		key : "{key}",
		text : "{text}",
		enabled : "{enabled}"
	});

	var theCompactMode = new CheckBox("compactMode", {
		text: "Compact Mode",
		selected : false,
		select : function() {
			document.querySelector("body").classList.toggle("sapUiSizeCompact");
		}
	});

	var oMultiComboBox2 = new MultiComboBox({
		id : "MultiComboBox2",
		width : "400px",
		placeholder : "Choose your country",
		items : {
			path : "/items",
			template : oItemTemplate
		},
		selectedKeys : {
			path : "/selected",
			template : "{selected}"
		}
	}).addStyleClass("sapUiMediumMarginEnd");

	var oMultiComboBox1 = new MultiComboBox({
		id : "MultiComboBox1",
		width : "300px",
		placeholder : "Choose your country",
		items : [
		new Item({
			key : "0",
			text : "item 0"
		}),
		new Item({
			key : "1",
			text : "item 1"
		}),
		new Item({
			key : "2",
			text : "item 2 is a little long"
		}),
		new Item({
			key : "3",
			text : "item 3"
		})],
		selectedKeys : ["0", "1", "2"]
	}).addStyleClass("sapUiMediumMarginEnd");

	var oMultiComboBoxError = new MultiComboBox({
		id : "MultiComboBoxError",
		width : "300px",
		placeholder : "Error",
		valueState : "Error",
		items : [
		new Item({
			key : "0",
			text : "item 0"
		}), new Item({
			key : "1",
			text : "item 1"
		})]
	}).addStyleClass("sapUiMediumMarginEnd");

	var oMultiComboBoxErrorWithLink = new MultiComboBox({
		id : "MultiComboBoxErrorWithLink",
		width : "300px",
		placeholder : "Error message with link",
		valueState : "Error",
		items : [
		new Item({
			key : "0",
			text : "item 0"
		}),
		new Item({
			key : "1",
			text : "item 1"
		})],
		formattedValueStateText: new FormattedText({
			htmlText: "Error value state message with %%0",
			controls: [new Link({
				text: "link",
				href: "#",
				target: "_blank"
			})]
		})
	}).addStyleClass("sapUiMediumMarginEnd");

	var oMultiComboBoxWarningWithLinks = new MultiComboBox({
		id : "MultiComboBoxWarningWithLinks",
		width : "300px",
		placeholder : "Warning message with link",
		valueState : "Warning",
		items : [new Item({
			key : "0",
			text : "item 0"
		}), new Item({
			key : "1",
			text : "item 1"
		})],
		formattedValueStateText: new FormattedText({
			htmlText: "Warning value state message with %%0 %%1",
			controls: [
				new Link({
					text: "multiple",
					href: "#",
					target: "_blank"
				}),
				new Link({
					text: "link",
					href: "#",
					target: "_blank"
				})
			]
		})
	}).addStyleClass("sapUiMediumMarginEnd");

	var oMultiComboBoxWarning = new MultiComboBox({
		id : "MultiComboBoxWarning",
		width : "300px",
		placeholder : "Warning",
		valueStateText : "Warning message. Extra long text used as a warning message. Extra long text used as a warning message - 2. Extra long text used as a warning message - 3.",
		valueState : "Warning",
		items : [new Item({
			key : "0",
			text : "item 0"
		}), new Item({
			key : "1",
			text : "item 1"
		})]
	}).addStyleClass("sapUiMediumMarginEnd");

	var oMultiComboBoxSuccess = new MultiComboBox({
		id : "MultiComboBoxSuccess",
		width : "300px",
		placeholder : "Success",
		valueState : "Success",
		items : [new Item({
			key : "0",
			text : "item 0"
		}), new Item({
			key : "1",
			text : "item 1"
		})]
	}).addStyleClass("sapUiMediumMarginEnd");
	var oItem;

	var oMultiComboBoxDisabledListItemDisabled = new MultiComboBox({
		id : "MultiComboBoxDisabledListItemDisabled",
		width : "400px",
		placeholder : "Example of list item showing disabled list item",
		items : [
		oItem = new Item({
			text : "triggers last item"
		}),
		new Item({
			text : "item 1"
		}),
		new Item({
			text : "disabled item",
			enabled : false
		}),
		new Item({
			text : "last item"
		})],
		selectedItems : [oItem],
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
			if (this.getFirstItem() === oControlEvent.getParameter("changedItem")) {
				this.getLastItem().setEnabled(oControlEvent.getParameter("selected"));
			}
		}
	}).addStyleClass("sapUiMediumMarginEnd");

	var items = [
	new Item({
		text : "Algeria"
	}),
	new Item({
		text : "Bulgaria"
	}),
	new Item({
		text : "Canada"
	}),
	new Item({
		text : "Denmark"
	}),
	new Item({
		text : "Estonia"
	})];
	var oMultiComboBoxReadOnly = new MultiComboBox({
		id : "MultiComboBoxReadOnly",
		width : "300px",
		placeholder : "ReadOnlyListItem",
		items : items,
		selectedItems : [items[0], items[1], items[2], items[3], items[4]],
		editable : false
	}).addStyleClass("sapUiMediumMarginEnd");

	var oMultiComboBoxDisabled = new MultiComboBox({
		id : "MultiComboBoxDisabled",
		width : "300px",
		placeholder : "Disabled",
		items : [
		new Item({
			text : "Algeria",
			key : "AL"
		}),
		new Item({
			text : "Bulgaria",
			key : "BU"
		}),
		new Item({
			text : "Canada",
			key : "CA"
		})],
		selectedKeys : ["AL", "BU", "CA"],
		enabled : false
	}).addStyleClass("sapUiMediumMarginEnd");

    var oMultiComboBoxOneToken = new MultiComboBox({
		id : "MultiComboBoxOneToken",
		width : "300px",
		placeholder : "Example with one token.",
		items : [oItem = new Item({
			text : "Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, "
		})],
		selectedItems : [oItem]
	});

	// Add a css class to the body HTML element, in order to be used for caret stylization in visual tests run.
	var oCustomCssButton = new Button("customCssButton",{
			text: "Toggle custom CSS for visual test",
			press: function() {
				document.querySelector("body").classList.toggle("customClassForVisualTests");
			}
	});

	var oApp = new App("myApp", {
		initialPage : "page1"
	});

	oApp.setModel(oModel);

	oApp.addPage(new Page("page1", {
		headerContent: [
				new Title({
					text: "sap.m.MultiComboBox"
				}),
				new ToolbarSpacer({
					width: "400px"
				}),
				oCustomCssButton,
                theCompactMode
		],
		content : [
			oMultiComboBox2, oMultiComboBox1, oMultiComboBoxDisabledListItemDisabled, oMultiComboBoxReadOnly, oMultiComboBoxDisabled,
			oMultiComboBoxErrorWithLink, oMultiComboBoxWarningWithLinks, oMultiComboBoxError, oMultiComboBoxWarning,
			oMultiComboBoxSuccess, oMultiComboBoxOneToken
		]
	}).addStyleClass("sapUiContentPadding"));

	oApp.placeAt("body");
});
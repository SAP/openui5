sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/ListItem",
	"sap/m/Select",
	"sap/m/Label",
	"sap/ui/core/IconPool",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/HTML",
	"sap/base/Log"
], function(JSONModel, InvisibleText, ListItem, Select, Label, IconPool, mobileLibrary, coreLibrary, App, Page, HTML, Log) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.SelectType
	var SelectType = mobileLibrary.SelectType;

	var oModel = new JSONModel();

	new InvisibleText("select_label", {text: "My label"}).toStatic();

	var mData = {
		"items": [
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
				"key": "HK",
				"text": "Hong Kong"
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
				"key": "TW",
				"text": "Taiwan"
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
	]};

	oModel.setData(mData);
	sap.ui.getCore().setModel(oModel);

	var oItemTemplate = new ListItem({
		key: "{key}",
		text: "{text}",
		additionalText: "{key}"
	});

	var oSelect = new Select("normalSelect", {
		ariaLabelledBy: 'select_label',
		tooltip: "Example tooltip",
		width: "15rem",
		items: {
			path: "/items",
			template: oItemTemplate
		},
		change: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");

			if (oSelectedItem) {
				Log.info("Event fired: 'change' value to " + oSelectedItem.getText() + " on " + this);
			}
		}
	});

	var oSelectTwoColumn = new Select({
		ariaLabelledBy: 'select_label',
		showSecondaryValues: true,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSelectLabeled = new Select({
		ariaLabelledBy: 'select_label',
		items: {
			path: "/items",
			template: oItemTemplate
		},
		selectedKey: "GER",
		change: function(oControlEvent) {
			var oSelectedItem = oControlEvent.getParameter("selectedItem");

			if (oSelectedItem) {
				Log.info("Event fired: 'change' value to " + oSelectedItem.getText() + " on " + this);
			}
		}
	});

	var oLabel = new Label({
		text: "Choose your country",
		labelFor: oSelectLabeled
	}).addStyleClass("customLabel");

	var oSelectIconOnly = new Select({
		ariaLabelledBy: 'select_label',
		autoAdjustWidth: true,
		icon: IconPool.getIconURI("filter"),
		type: SelectType.IconOnly,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSelectDisabled = new Select({
		ariaLabelledBy: 'select_label',
		enabled: false,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSelectReadOnly = new Select({
		ariaLabelledBy: 'select_label',
		editable: false,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSelectSuccess = new Select({
		ariaLabelledBy: 'select_label',
		width: "15rem",
		valueState: ValueState.Success,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSelectWarning = new Select({
		ariaLabelledBy: 'select_label',
		width: "15rem",
		valueState: ValueState.Warning,
		valueStateText: "value state text",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oLabelWarning = new Label({
		text: "Choose your country",
		labelFor: oSelectWarning
	}).addStyleClass("customLabel");

	var oSelectError = new Select({
		ariaLabelledBy: 'select_label',
		width: "15rem",
		valueState: ValueState.Error,
		valueStateText: "value state text",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSelectInformation = new Select({
		ariaLabelledBy: 'select_label',
		width: "15rem",
		valueState: ValueState.Information,
		valueStateText: "value state text",
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oSelectBusy = new Select({
		ariaLabelledBy: 'select_label',
		busy: true,
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	new App().addPage(new Page({
		title: "sap.m.Select",
		titleLevel: "H1",
		content: [
			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Default</h2>" }),
			oSelect,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Two column layout</h2>" }),
			oSelectTwoColumn,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Labeled</h2>" }),
			oLabel,
			oSelectLabeled,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Icon only</h2>" }),
			oSelectIconOnly,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Disabled</h2>" }),
			oSelectDisabled,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Read-only</h2>" }),
			oSelectReadOnly,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Warning state with label</h2>" }),
			oLabelWarning,
			oSelectWarning,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Success state</h2>" }),
			oSelectSuccess,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Error state</h2>" }),
			oSelectError,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Information state</h2>" }),
			oSelectInformation,
			new HTML({ content: "<hr>" }),

			new HTML({ content: "<h2 class='sapMTitleStyleH3'>Busy</h2>" }),
			oSelectBusy,
			new HTML({ content: "<hr>" })
		]
	}).addStyleClass("sapUiContentPadding")).placeAt("body");
});

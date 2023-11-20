sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ListItem",
	"sap/m/SelectList",
	"sap/m/App",
	"sap/m/Page",
	"sap/base/Log"
], function(JSONModel, ListItem, SelectList, App, Page, Log) {
	"use strict";

	var oModel = new JSONModel();

	var mData = {
		"items": [
			{
				"key": "DZ",
				"text": "Algeria",
				"additionalText": "DZ",
				"icon": "sap-icon://globe"
			},

			{
				"key": "AR",
				"text": "Argentina",
				"additionalText": "AR",
				"icon": "sap-icon://globe"
			},

			{
				"key": "AU",
				"text": "Australia",
				"additionalText": "AU",
				"icon": "sap-icon://globe"
			},

			{
				"key": "AT",
				"text": "Austria",
				"additionalText": "AT",
				"icon": "sap-icon://globe"
			},

			{
				"key": "BH",
				"text": "Bahrain",
				"additionalText": "BH",
				"icon": "sap-icon://globe"
			},

			{
				"key": "BE",
				"text": "Belgium",
				"additionalText": "BE",
				"icon": "sap-icon://globe"
			},

			{
				"key": "BA",
				"text": "Bosnia and Herzegovina",
				"additionalText": "BA",
				"icon": "sap-icon://globe"
			},

			{
				"key": "BR",
				"text": "Brazil",
				"additionalText": "BR",
				"icon": "sap-icon://globe"
			},

			{
				"key": "BG",
				"text": "Bulgaria",
				"additionalText": "BG",
				"icon": "sap-icon://globe"
			},

			{
				"key": "CA",
				"text": "Canada",
				"additionalText": "CA",
				"icon": "sap-icon://globe"
			},

			{
				"key": "CL",
				"text": "Chile",
				"additionalText": "CL",
				"icon": "sap-icon://globe"
			},

			{
				"key": "CO",
				"text": "Colombia",
				"additionalText": "CO",
				"icon": "sap-icon://globe"
			},

			{
				"key": "HR",
				"text": "Croatia",
				"additionalText": "HR",
				"icon": "sap-icon://globe"
			},

			{
				"key": "CU",
				"text": "Cuba",
				"additionalText": "CU",
				"icon": "sap-icon://globe"
			},

			{
				"key": "CZ",
				"text": "Czech Republic",
				"additionalText": "CZ",
				"icon": "sap-icon://globe"
			},

			{
				"key": "DK",
				"text": "Denmark",
				"additionalText": "DK",
				"icon": "sap-icon://globe"
			},

			{
				"key": "EG",
				"text": "Egypt",
				"additionalText": "EG",
				"icon": "sap-icon://globe"
			},

			{
				"key": "EE",
				"text": "Estonia",
				"additionalText": "EE",
				"icon": "sap-icon://globe"
			},

			{
				"key": "FI",
				"text": "Finland",
				"additionalText": "FI",
				"icon": "sap-icon://globe"
			},

			{
				"key": "FR",
				"text": "France",
				"additionalText": "FR",
				"icon": "sap-icon://globe"
			},

			{
				"key": "GER",
				"text": "Germany",
				"additionalText": "GER",
				"icon": "sap-icon://globe"
			},

			{
				"key": "GH",
				"text": "Ghana",
				"additionalText": "GH",
				"icon": "sap-icon://globe"
			},

			{
				"key": "GR",
				"text": "Greece",
				"additionalText": "GR",
				"icon": "sap-icon://globe"
			},

			{
				"key": "HK",
				"text": "Hong Kong",
				"additionalText": "HK",
				"icon": "sap-icon://globe"
			},

			{
				"key": "HU",
				"text": "Hungary",
				"additionalText": "HU",
				"icon": "sap-icon://globe"
			},

			{
				"key": "IN",
				"text": "India",
				"additionalText": "IN",
				"icon": "sap-icon://globe"
			},

			{
				"key": "ID",
				"text": "Indonesia",
				"additionalText": "ID",
				"icon": "sap-icon://globe"
			},

			{
				"key": "IE",
				"text": "Ireland",
				"additionalText": "IE",
				"icon": "sap-icon://globe"
			},

			{
				"key": "IL",
				"text": "Israel",
				"additionalText": "IL",
				"icon": "sap-icon://globe"
			},

			{
				"key": "IT",
				"text": "Italy",
				"additionalText": "IT",
				"icon": "sap-icon://globe"
			},

			{
				"key": "JP",
				"text": "Japan",
				"additionalText": "JP",
				"icon": "sap-icon://globe"
			},

			{
				"key": "JO",
				"text": "Jordan",
				"additionalText": "JO",
				"icon": "sap-icon://globe"
			},

			{
				"key": "KE",
				"text": "Kenya",
				"additionalText": "KE",
				"icon": "sap-icon://globe"
			},

			{
				"key": "KW",
				"text": "Kuwait",
				"additionalText": "KW",
				"icon": "sap-icon://globe"
			},

			{
				"key": "LV",
				"text": "Latvia",
				"additionalText": "LV",
				"icon": "sap-icon://globe"
			},

			{
				"key": "LT",
				"text": "Lithuania",
				"additionalText": "LT",
				"icon": "sap-icon://globe"
			},

			{
				"key": "MK",
				"text": "Macedonia",
				"additionalText": "MK",
				"icon": "sap-icon://globe"
			},

			{
				"key": "MY",
				"text": "Malaysia",
				"additionalText": "MY",
				"icon": "sap-icon://globe"
			},

			{
				"key": "MX",
				"text": "Mexico",
				"additionalText": "MX",
				"icon": "sap-icon://globe"
			},

			{
				"key": "ME",
				"text": "Montenegro",
				"additionalText": "ME",
				"icon": "sap-icon://globe"
			},

			{
				"key": "MA",
				"text": "Morocco",
				"additionalText": "MA",
				"icon": "sap-icon://globe"
			},

			{
				"key": "NL",
				"text": "Netherlands",
				"additionalText": "NL",
				"icon": "sap-icon://globe"
			},

			{
				"key": "NZ",
				"text": "New Zealand",
				"additionalText": "NZ",
				"icon": "sap-icon://globe"
			},

			{
				"key": "NG",
				"text": "Nigeria",
				"additionalText": "NG",
				"icon": "sap-icon://globe"
			},

			{
				"key": "NO",
				"text": "Norway",
				"additionalText": "NO",
				"icon": "sap-icon://globe"
			},

			{
				"key": "OM",
				"text": "Oman",
				"additionalText": "OM",
				"icon": "sap-icon://globe"
			},

			{
				"key": "PE",
				"text": "Peru",
				"additionalText": "PE",
				"icon": "sap-icon://globe"
			},

			{
				"key": "PH",
				"text": "Philippines",
				"additionalText": "PH",
				"icon": "sap-icon://globe"
			},

			{
				"key": "PL",
				"text": "Poland",
				"additionalText": "PL",
				"icon": "sap-icon://globe"
			},

			{
				"key": "PT",
				"text": "Portugal",
				"additionalText": "PT",
				"icon": "sap-icon://globe"
			},

			{
				"key": "QA",
				"text": "Qatar",
				"additionalText": "QA",
				"icon": "sap-icon://globe"
			},

			{
				"key": "RO",
				"text": "Romania",
				"additionalText": "RO",
				"icon": "sap-icon://globe"
			},

			{
				"key": "RU",
				"text": "Russia",
				"additionalText": "RU",
				"icon": "sap-icon://globe"
			},

			{
				"key": "SA",
				"text": "Saudi Arabia",
				"additionalText": "SA",
				"icon": "sap-icon://globe"
			},

			{
				"key": "SN",
				"text": "Senegal",
				"additionalText": "SN",
				"icon": "sap-icon://globe"
			},

			{
				"key": "RS",
				"text": "Serbia",
				"additionalText": "RS",
				"icon": "sap-icon://globe"
			},

			{
				"key": "SG",
				"text": "Singapore",
				"additionalText": "SG",
				"icon": "sap-icon://globe"
			},

			{
				"key": "SK",
				"text": "Slovakia",
				"additionalText": "SK",
				"icon": "sap-icon://globe"
			},

			{
				"key": "SI",
				"text": "Slovenia",
				"additionalText": "SI",
				"icon": "sap-icon://globe"
			},

			{
				"key": "ZA",
				"text": "South Africa",
				"additionalText": "ZA",
				"icon": "sap-icon://globe"
			},

			{
				"key": "KR",
				"text": "South Korea",
				"additionalText": "KR",
				"icon": "sap-icon://globe"
			},

			{
				"key": "ES",
				"text": "Spain",
				"additionalText": "ES",
				"icon": "sap-icon://globe"
			},

			{
				"key": "SE",
				"text": "Sweden",
				"additionalText": "SE",
				"icon": "sap-icon://globe"
			},

			{
				"key": "CH",
				"text": "Switzerland",
				"additionalText": "CH",
				"icon": "sap-icon://globe"
			},

			{
				"key": "TW",
				"text": "Taiwan",
				"additionalText": "TW",
				"icon": "sap-icon://globe"
			},

			{
				"key": "TN",
				"text": "Tunisia",
				"additionalText": "TN",
				"icon": "sap-icon://globe"
			},

			{
				"key": "TR",
				"text": "Turkey",
				"additionalText": "TR",
				"icon": "sap-icon://globe"
			},

			{
				"key": "UG",
				"text": "Uganda",
				"additionalText": "UG",
				"icon": "sap-icon://globe"
			},

			{
				"key": "UA",
				"text": "Ukraine",
				"additionalText": "UA",
				"icon": "sap-icon://globe"
			},

			{
				"key": "AE",
				"text": "United Arab Emirates",
				"additionalText": "AE",
				"icon": "sap-icon://globe"
			},

			{
				"key": "GB",
				"text": "United Kingdom",
				"additionalText": "GB",
				"icon": "sap-icon://globe"
			},

			{
				"key": "YE",
				"text": "Yemen",
				"additionalText": "YE",
				"icon": "sap-icon://globe"
			}
		],

		// path: selectedKey
		"selected": "GER"
	};

	oModel.setData(mData);

	var oItemTemplate = new ListItem({
		key: "{key}",
		text: "{text}",
		icon: "{icon}",
		additionalText: "{additionalText}"
	});

	var oSelectList = new SelectList({
		showSecondaryValues: true,
		width: "100%",
		items: {
			path: "/items",
			template: oItemTemplate
		},

		selectedKey: {
			path : "/selected",
			template: "{selected}"
		},

		selectionChange: function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to ' + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	oSelectList.setModel(oModel);

	new App({
		pages: [
			new Page({
				title: "SelectList Control demo page",
				titleLevel: "H1",
				content: [ oSelectList ]
			})
		]
	}).placeAt("body");
});

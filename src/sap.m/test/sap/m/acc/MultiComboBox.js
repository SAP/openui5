sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item",
	"sap/m/MultiComboBox",
	"sap/m/Label",
	"sap/m/CheckBox",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/HTML",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer"
], function(MessageToast, JSONModel, Item, MultiComboBox, Label, CheckBox, App, Page, HTML, Toolbar, ToolbarSpacer) {
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
			"key" : "PE",
			"text" : "Peru"
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
			"key" : "SE",
			"text" : "Sweden"
		},

		{
			"key" : "CH",
			"text" : "Switzerland"
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
			"key" : "YE",
			"text" : "Yemen"
		}]
	};

	oModel.setData(mData);
	sap.ui.getCore().setModel(oModel);

	var oItemTemplate = new Item({
			key : "{key}",
			text : "{text}",
			enabled : "{enabled}"
		}),

		oMultiComboBoxPlaceholder = new MultiComboBox({
			id : "MultiComboBox0",
			placeholder : "List of contries",
			width : "300px",
			items : {
				path : "/items",
				template : oItemTemplate
			}
		}),

		oLabelPlaceholder = new Label({
			text: "Choose your country",
			labelFor: oMultiComboBoxPlaceholder
		}).addStyleClass("customLabel"),

		oMultiComboBoxWithTokens = new MultiComboBox({
			id : "multiComboBoxWithTokens",
			width : "300px",
			placeholder : "Select an item",
			items : {
				path : "/items",
				template : oItemTemplate
			},
			selectedKeys : ["SA", "PH", "YE", "ZA", "PE"]
		}),

		oLabelWithTokens = new Label({
			text: "Choose your country",
			labelFor: oMultiComboBoxWithTokens
		}).addStyleClass("customLabel"),

		oMultiComboBoxDisabled = new MultiComboBox({
			id : "MultiComboBoxDisabled",
			width : "300px",
			placeholder : "Disabled",
			items : [new Item({
				text : "Algeria",
				key : "AL"
			}), new Item({
				text : "Bulgaria",
				key : "BU"
			}), new Item({
				text : "Canada",
				key : "CA"
			})],
			selectedKeys : ["AL", "BU", "CA"],
			enabled : false
		}),

		oLabelDisabled = new Label({
			text: "Choose your country",
			labelFor: oMultiComboBoxDisabled
		}).addStyleClass("customLabel"),

		items = [
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
			}), new Item({
				text : "Estonia"
			})
		],

		oMultiComboBoxReadOnly = new MultiComboBox({
			id : "MultiComboBoxReadOnly",
			width : "300px",
			placeholder : "ReadOnlyListItem",
			items : items,
			selectedItems : [items[0], items[1], items[2], items[3], items[4]],
			editable : false
		}),

		oLabelReadOnly = new Label({
			text: "Choose your country",
			labelFor: oMultiComboBoxReadOnly
		}).addStyleClass("customLabel"),

		oMultiComboBoxError = new MultiComboBox({
			id : "MultiComboBoxError",
			width : "300px",
			placeholder : "Error",
			valueState : "Error",
			items : [
				new Item({
					key : "0",
					text : "item 0"
				}),
				new Item({
					key : "1",
					text : "item 1"
				})
			]
		}),

		oLabelError = new Label({
			text: "Select an item",
			labelFor: oMultiComboBoxError
		}).addStyleClass("customLabel"),

		oMultiComboBoxWarning = new MultiComboBox({
			id : "MultiComboBoxWarning",
			width : "300px",
			placeholder : "Warning",
			valueState : "Warning",
			items : [
				new Item({
					key : "0",
					text : "item 0"
				}),
				new Item({
					key : "1",
					text : "item 1"
				})
			]
		}),

		oLabelWarning = new Label({
			text: "Select an item",
			labelFor: oMultiComboBoxWarning
		}).addStyleClass("customLabel"),

		oMultiComboBoxSuccess = new MultiComboBox({
			id : "MultiComboBoxSuccess",
			width : "300px",
			placeholder : "Success",
			valueState : "Success",
			items : [
				new Item({
					key : "0",
					text : "item 0"
				}),
				new Item({
					key : "1",
					text : "item 1"
				})
			]
		}),

		oLabelSuccess = new Label({
			text: "Select an item",
			labelFor: oMultiComboBoxSuccess
		}).addStyleClass("customLabel"),

		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),

		oApp = new App("myApp", {
			initialPage : "page1"
		});

	oApp.addPage(new Page("page1", {
		title: "MultiComboBox Accessibility Test Page",
		content : [
			new HTML({ content: "<h3>Placeholder</h3>" }),
			oLabelPlaceholder,
			oMultiComboBoxPlaceholder,
			new HTML({ content: "<h3>Tokens and N-more</h3>" }),
			oLabelWithTokens,
			oMultiComboBoxWithTokens,
			new HTML({ content: "<h3>Disabled</h3>" }),
			oLabelDisabled,
			oMultiComboBoxDisabled,
			new HTML({ content: "<h3>Read only</h3>" }),
			oLabelReadOnly,
			oMultiComboBoxReadOnly,
			new HTML({ content: "<h3>Error state</h3>" }),
			oLabelError,
			oMultiComboBoxError,
			new HTML({ content: "<h3>Warning State</h3>" }),
			oLabelWarning,
			oMultiComboBoxWarning,
			new HTML({ content: "<h3>Success state</h3>" }),
			oLabelSuccess,
			oMultiComboBoxSuccess
		],
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				oCompactMode
			]
		})
	}));

	oApp.placeAt("body");
});

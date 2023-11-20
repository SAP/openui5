sap.ui.define([
	"sap/m/App",
	"sap/m/CheckBox",
	"sap/m/ComboBox",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/HTML",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel"
], function(App, CheckBox, ComboBox, Label, Page, Toolbar, ToolbarSpacer, HTML, Item, coreLibrary, JSONModel) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var oModel = new JSONModel(),
		mData = {
		"items": [
			{
				"key": "BG",
				"text": "Bulgaria"
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
			}
	]};

	oModel.setData(mData);
	sap.ui.getCore().setModel(oModel);

	var oItemTemplate = new Item({
			key: "{key}",
			text: "{text}"
		}),
		oComboBoxDefault = new ComboBox("standardComboBox", {
			items: {
				path: "/items",
				template: oItemTemplate
			}
		}),

		oLabelDefault = new Label({
			text: "Choose your country",
			labelFor: oComboBoxDefault
		}).addStyleClass("customLabel"),

		oComboBoxPlaceholder = new ComboBox({
			placeholder: "List of countries",
			items: {
				path: "/items",
				template: oItemTemplate
			}
		}),

		oLabel = new Label({
			text: "Choose your country",
			labelFor: oComboBoxPlaceholder
		}).addStyleClass("customLabel"),

		oComboBoxDisabled  = new ComboBox({
			enabled: false,
			placeholder: "Choose your country",
			items: {
				path: "/items",
				template: oItemTemplate
			}
		}),

		oLabelDisabled = new Label({
			text: "Choose your country",
			labelFor: oComboBoxDisabled
		}).addStyleClass("customLabel"),

		oComboBoxReadOnly  = new ComboBox({
			editable: false,
			items: {
				path: "/items",
				template: oItemTemplate
			},
			selectedKey: "GER"
		}),

		oLabelReadOnly = new Label({
			text: "Choose your country",
			labelFor: oComboBoxReadOnly
		}).addStyleClass("customLabel"),

		oComboBoxSuccess = new ComboBox({
			valueState: ValueState.Success,
			items: {
				path: "/items",
				template: oItemTemplate
			}
		}),

		oLabelSuccess = new Label({
			text: "Choose your country",
			labelFor: oComboBoxSuccess
		}).addStyleClass("customLabel"),

		oComboBoxWarning = new ComboBox({
			valueState: ValueState.Warning,
			valueStateText: "Warning issued",
			items: {
				path: "/items",
				template: oItemTemplate
			}
		}),

		oLabelWarning = new Label({
			text: "Choose your country",
			labelFor: oComboBoxWarning
		}).addStyleClass("customLabel"),

		oComboBoxError = new ComboBox("errorComboBox", {
			valueState: ValueState.Error,
			valueStateText: "Invalid entry",
			items: {
				path: "/items",
				template: oItemTemplate
			}
		}),

		oLabelError = new Label({
			text: "Choose your country",
			labelFor: oComboBoxError
		}).addStyleClass("customLabel"),

		oComboBoxBusy = new ComboBox({
			busy: true,
			items: {
				path: "/items",
				template: oItemTemplate
			}
		}),

		oLabelBusy = new Label({
			text: "Choose your country",
			labelFor: oComboBoxBusy
		}).addStyleClass("customLabel"),

		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		});

	new App().addPage(new Page({
		title: "ComboBox Accessibility Test Page",
		content: [
			new HTML({ content: "<h3>Default</h3>" }),
			oLabelDefault,
			oComboBoxDefault,

			new HTML({ content: "<h3>Placeholder</h3>" }),
			oLabel,
			oComboBoxPlaceholder,

			new HTML({ content: "<h3>Disabled</h3>" }),
			oLabelDisabled,
			oComboBoxDisabled,

			new HTML({ content: "<h3>Read only</h3>" }),
			oLabelReadOnly,
			oComboBoxReadOnly,

			new HTML({ content: "<h3>Warring state</h3>" }),
			oLabelWarning,
			oComboBoxWarning,

			new HTML({ content: "<h3>Success state</h3>" }),
			oLabelSuccess,
			oComboBoxSuccess,

			new HTML({ content: "<h3>Error state</h3>" }),
			oLabelError,
			oComboBoxError,

			new HTML({ content: "<h3>Busy</h3>" }),
			oLabelBusy,
			oComboBoxBusy
		],
		footer: new Toolbar({
			content: [
				new ToolbarSpacer(),
				oCompactMode
			]
		})
	}).addStyleClass("sapUiContentPadding")).placeAt("body");
});

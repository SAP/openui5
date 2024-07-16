
sap.ui.define([
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item",
	"sap/m/Select",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/InputListItem",
	"sap/m/Switch",
	"sap/m/Slider",
	"sap/m/Button",
	"sap/m/RadioButton",
	"sap/m/CheckBox",
	"sap/m/List",
	"sap/m/VBox",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Bar",
	"sap/ui/core/IconPool",
	"sap/ui/core/ListItem",
	"sap/m/MessageToast",
	"sap/base/Log"
], function (
	mLibrary,
	JSONModel,
	Item,
	Select,
	Label,
	Text,
	Input,
	InputListItem,
	Switch,
	Slider,
	Button,
	RadioButton,
	CheckBox,
	List,
	VBox,
	App,
	Page,
	Bar,
	IconPool,
	ListItem,
	MessageToast,
	Log
) {
	"use strict";

	var LabelDesign = mLibrary.LabelDesign;
	var SelectType = mLibrary.SelectType;

	var oModel = new JSONModel();

	var oInput4,
		oInput5,
		oInput2,
		oInput3,
		oCheckBoxIsAutoAdjustableWidth,
		oCheckBox1,
		oCheckBox2,
		oPage;

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
		]
	};

	oModel.setData(mData);

	var oItemTemplate = new Item({
		key: "{key}",
		text: "{text}"
	});

	var oSelect0 = new Select({
		id: "select_regular",
		items: {
			path: "/items",
			template: oItemTemplate
		},

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oLabel1 = new Label({
		text: "Most common use cases:",
		design: LabelDesign.Bold
	});

	var oLabel2 = new Label({
		text: "Other possible options:",
		design: LabelDesign.Bold
	});

	var oText0 = new Text({
		text: "If the selected item is not specified, the first one will be selected"
	});

	var oText1 = new Text({
		text: "The default width of a select control depends on the width of the widest option/item in the menu"
	});

	var oText2 = new Text({
		text: "Inactive - no value state shown"
	});

	var oText3 = new Text({
		text: "Default width changed to 15rem"
	});

	var oText8 = new Text({
		text: "Default type with auto adjustable width"
	});

	var oText4 = new Text({
		text: "Without items"
	});

	var oText5 = new Text({
		text: "With disabled items"
	});

	var oText6 = new Text({
		text: "Only Icon type with auto adjustable width"
	});

	var oText7 = new Text({
		text: "Select which items have icons"
	});

	var oTextReadOnly = new Text({
		text: "Read-only - no value state shown"
	});

	var oSelect1 = new Select({
		name: "select-name0",
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2 is a little long"
			}),

			new Item({
				key: "3",
				text: "item 3"
			})
		],

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect2 = new Select({
		id: "select_disabled",
		valueState: "Warning",
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			})
		],
		enabled: false
	});

	var oSelectReadOnly = new Select({
		id: "select_readOnly",
		valueState: "Error",
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			})
		],
		editable: false
	});

	var oSelect3 = new Select({
		name: "select-name3",
		width: "15rem",
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			})
		],

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect4 = new Select({
		items: [],
		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect6 = new Select({
		items: {
			path: "/items",
			template: oItemTemplate
		},

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect7 = new Select({
		autoAdjustWidth: true,
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			}),

			new Item({
				key: "3",
				text: "item 3"
			})
		],

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect8 = new Select({
		id: "select_footer",
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			}),

			new Item({
				key: "3",
				text: "item 3"
			}),

			new Item({
				key: "4",
				text: "item 4"
			}),

			new Item({
				key: "5",
				text: "item 5"
			}),

			new Item({
				key: "6",
				text: "item 6"
			}),

			new Item({
				key: "7",
				text: "item 7"
			}),

			new Item({
				key: "8",
				text: "item 8"
			}),

			new Item({
				key: "9",
				text: "item 9"
			})
		],

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect9 = new Select({
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1",
				enabled: false
			}),

			new Item({
				key: "2",
				text: "item 2"
			}),

			new Item({
				key: "3",
				text: "item 3",
				enabled: false
			})
		],

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect10 = new Select({
		items: [
			new Item({
				text: "item 0"
			}),

			new Item({
				text: "item 1"
			})
		],

		selectedKey: 0,
		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
			oInput4.setValue(oControlEvent.getParameter("selectedItem").getKey());
			oInput5.setValue(oControlEvent.getParameter("selectedItem").getId());
		}
	});

	var oSelect11 = new Select({
		autoAdjustWidth: true,
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		]
	});

	var oSelect12 = new Select({
		id: "select_icon",
		type: SelectType.IconOnly,
		autoAdjustWidth: true,
		icon: IconPool.getIconURI("add"),
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		]
	});

	var oSelect13 = new Select({
		type: SelectType.IconOnly,
		autoAdjustWidth: true,
		icon: IconPool.getIconURI("filter"),
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		]
	});

	var oSelect14 = new Select({
		type: SelectType.IconOnly,
		autoAdjustWidth: true,
		icon: IconPool.getIconURI("settings"),
		items: [
			new Item({
				key: "0",
				text: "setting 1"
			}),

			new Item({
				key: "1",
				text: "setting 2"
			}),

			new Item({
				key: "2",
				text: "setting 3"
			})
		]
	});

	var oSelect16 = new Select({
		type: SelectType.Default,
		autoAdjustWidth: true,
		items: [
			new Item({
				key: "0",
				text: "item 0 is longer"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		]
	});

	var oSelect17 = new Select({
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		]
	});

	var oSelect19 = new Select({
		type: SelectType.IconOnly,
		icon: IconPool.getIconURI("filter"),
		autoAdjustWidth: true,
		width: "15rem",
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			})
		]
	});

	var oSelect20 = new Select({
		autoAdjustWidth: true,
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			}),

			new Item({
				key: "3",
				text: "item 3"
			})
		],

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect21 = new Select({
		autoAdjustWidth: true,
		items: [
			new Item({
				key: "0",
				text: "item 0"
			}),

			new Item({
				key: "1",
				text: "item 1"
			}),

			new Item({
				key: "2",
				text: "item 2"
			}),

			new Item({
				key: "3",
				text: "item 3"
			})
		],

		change: function (oControlEvent) {
			Log.info("Event fired: 'change' value property to " + oControlEvent.getParameter("selectedItem") + " on " + this);
		}
	});

	var oSelect22 = new Select({
		autoAdjustWidth: true,
		items: [
			new ListItem({
				key: "0",
				text: "Bottom",
				icon: "sap-icon://arrow-bottom"
			}),

			new ListItem({
				key: "1",
				text: "Left",
				icon: "sap-icon://arrow-left"
			}),

			new ListItem({
				key: "2",
				text: "Right",
				icon: "sap-icon://arrow-right"
			}),

			new ListItem({
				key: "3",
				text: "Top",
				icon: "sap-icon://arrow-top"
			})
		]
	});

	// lists
	var oList0 = new List({
		headerText: "Input List Item",
		inset: false,
		items: [

			// input list items
			new InputListItem({
				label: "Address",
				content: new Input()
			}),

			new InputListItem({
				label: "Country",
				content: oSelect6
			}),

			new InputListItem({
				label: "WLAN",
				content: new Switch()
			}),

			new InputListItem({
				label: "Volume",
				content: new Slider({
					value: 50
				})
			}),

			new InputListItem({
				label: "High Performance",
				content: new RadioButton()
			}),

			new InputListItem({
				label: "Battery Saving",
				content: new RadioButton()
			}),

			new InputListItem({
				label: "Flight Mode",
				content: new CheckBox()
			})
		]
	});

	// vbox
	var oVBox0 = new VBox({
		items: [

			// most common use cases
			oLabel1,

			oText0,
			oSelect0,

			oText1,
			oSelect1,

			oText3,
			oSelect3,

			oText8,
			oSelect16,

			oText6,
			oSelect12,

			oText7,
			oSelect22,

			// other possible options
			oLabel2,

			oText4,
			oSelect4,

			oText2,
			oSelect2,

			oText5,
			oSelect9,

			oTextReadOnly,
			oSelectReadOnly
		]
	}).addStyleClass("vBoxSelectTestPage");

	var oVBox1 = new VBox({
		items: [

			// width
			new Label({
				text: "Width:"
			}),

			oInput2 = new Input({
				value: oSelect10.getWidth()
			}),

			// maximum width
			new Label({
				text: "Maximum width:"
			}),

			oInput3 = new Input({
				value: oSelect10.getMaxWidth()
			}),

			// selected key
			new Label({
				text: "Selected Key:"
			}),

			oInput4 = new Input({
				value: oSelect10.getSelectedKey(),
				editable: false
			}),

			// selected item id
			new Label({
				text: "Selected item id:"
			}),

			oInput5 = new Input({
				value: oSelect10.getSelectedItemId(),
				editable: false
			}),

			// auto adjust width
			new Label({
				text: "Auto adjust width:"
			}),

			oCheckBoxIsAutoAdjustableWidth = new CheckBox({
				selected: oSelect10.getAutoAdjustWidth(),
				select: function (oControlEvent) {
					var bSelected = oControlEvent.getParameter("selected");

					oInput2.setEnabled(!bSelected);
					oInput3.setEnabled(!bSelected);
				}
			}),

			// enabled
			new Label({
				text: "Enabled:"
			}),

			oCheckBox1 = new CheckBox({
				selected: oSelect10.getEnabled()
			}),

			// visible
			new Label({
				text: "Visible:"
			}),

			oCheckBox2 = new CheckBox({
				selected: oSelect10.getVisible()
			}),

			// apply button
			new Button({
				text: "Apply changes",
				press: function () {
					try {
						oSelect10.setAutoAdjustWidth(oCheckBoxIsAutoAdjustableWidth.getSelected());
						oSelect10.setWidth(oInput2.getValue());
						oSelect10.setMaxWidth(oInput3.getValue());
						oSelect10.setEnabled(oCheckBox1.getSelected());
						oSelect10.setVisible(oCheckBox2.getSelected());
					} catch (e) {
						MessageToast.show(e.message);
					}
				}
			}),

			// visible
			new Label({
				text: "Result:"
			}),

			// result
			oSelect10,

			// clone
			new Label({
				text: "Clone the result:"
			}).addStyleClass("labelResult"),

			new Button({
				text: "Clone",
				press: function () {
					oPage.addContent(oSelect10.clone());
				}
			})
		]
	}).addStyleClass("vBoxSelectTestPageWithWhiteBackground");

	var oLabel9 = new Label({
		text: "API test:",
		design: LabelDesign.Bold
	}).addStyleClass("labelSelectTestPageHeader");

	new App().addPage(oPage = new Page({
		id: "select_page",
		customHeader: new Bar({

			contentLeft: oSelect14,

			contentMiddle: new Label({
				text: "Select Control demo page"
			}),

			contentRight: oSelect7
		}),

		subHeader: new Bar({
			contentLeft: [oSelect17, oSelect19],
			contentRight: [oSelect20, oSelect21]
		}),

		content: [oVBox0, oList0, oLabel9, oVBox1],

		footer: new Bar({
			contentLeft: oSelect8,
			contentRight: [oSelect11, oSelect13]
		})
	})).setModel(oModel).placeAt("body");
});

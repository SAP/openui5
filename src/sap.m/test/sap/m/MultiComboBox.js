sap.ui.define([
	"sap/base/Log",
	"sap/m/MultiComboBox",
	"sap/m/CheckBox",
	"sap/m/Label",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Link",
	"sap/m/App",
	"sap/m/Shell",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/FormattedText",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel"],
function(
	Log,
	MultiComboBox,
	CheckBox,
	Label,
	Dialog,
	Button,
	Page,
	Link,
	App,
	Shell,
	Title,
	Toolbar,
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

	function createComboForDialog(sId){
		return new MultiComboBox({
			id: sId,
			placeholder : "Choose your country",
			items : {
				path : "/items",
				template : oItemTemplate
			},
			selectedKeys : {
				path : "/selected",
				template : "{selected}"
			},
			change : function(oControlEvent) {
				Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
						+ this);
			},
			selectionChange : function(oControlEvent) {
				Log.info('Event fired: "selectionChange" value property to ' + oControlEvent.getParameter("changedItem")
						+ " with selected=" + oControlEvent.getParameter("selected") + " on " + this);
			},
			selectionFinish : function(oControlEvent) {
				Log.info('Event fired: "selectionFinish" value property to ' + oControlEvent.getParameter("selectedItems")
						+ " on " + this);
			}
		});
	}

	var theCompactMode = new CheckBox("compactMode", {
		text: "Compact Mode",
		selected : false,
		select : function() {
			document.getElementById("body").classList.toggle("sapUiSizeCompact");
		}
	});

	function createLabelForComboBox(sId) {
		return new Label({
			labelFor: sId,
			text: "Label for MultiComboBox " + sId
		});
	}

	var aDialogContent = [];
	for (var index = 0; index < 10; index++) {
		var i = index + 1;
		aDialogContent.push(createLabelForComboBox("mcb" + i));
		aDialogContent.push(createComboForDialog("mcb" + i));
	}

	var oDialog = new Dialog("dialog", {
		title: "Multi Inputs",
		contentWidth: "420px",
		horizontalScrolling: false,
		content: aDialogContent,
		beginButton:
			new Button({
				text: "OK",
				type: sap.m.ButtonType.Accept,
				press : function() {
					oDialog.close();
				}
			}),
		endButton:
			new Button({
				text: "Cancel",
				type: sap.m.ButtonType.Reject,
				press : function() {
					oDialog.close();
				}
		})
	});
	// open in a dialog
	function openDialog(){
		oDialog.open();
	}

	//var oEventList = new sap.m.List();
	// var oSearchProvider = new sap.ui.core.search.OpenSearchProvider({
	// 	suggestUrl : "../../../proxy/http/en.wikipedia.org/w/api.php?action=opensearch&namespace=0&search={searchTerms}",
	// 	suggestType : "json"
	// });

	var oMultiComboBox = new MultiComboBox({
		id : "MultiComboBox0",
		placeholder : "width = 50%",
		width : "50%",
		items : {
			path : "/items",
			template : oItemTemplate
		},
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to ' + oControlEvent.getParameter("changedItem")
					+ " with selected=" + oControlEvent.getParameter("selected") + " on " + this);
		},
		selectionFinish : function(oControlEvent) {
			Log.info('Event fired: "selectionFinish" value property to ' + oControlEvent.getParameter("selectedItems")
					+ " on " + this);
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
		},
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to ' + oControlEvent.getParameter("changedItem")
					+ " with selected=" + oControlEvent.getParameter("selected") + " on " + this);
		},
		selectionFinish : function(oControlEvent) {
			Log.info('Event fired: "selectionFinish" value property to ' + oControlEvent.getParameter("selectedItems")
					+ " on " + this);
		}
	});

	var oMultiComboBoxBinding = new MultiComboBox({
		id : "MultiComboBoxBinding",
		placeholder : "binding test: navigate to next page and back",
		width : "400px",
		items : {
			path : "/items",
			template : new Item({
				key : "{key}",
				text : "{text}",
				enabled : "{enabled}"
			})
		},
		selectedKeys : {
			path : "/selected",
			template : "{selected}"
		},
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to ' + oControlEvent.getParameter("changedItem")
					+ " with selected=" + oControlEvent.getParameter("selected") + " on " + this);
		},
		selectionFinish : function(oControlEvent) {
			Log.info('Event fired: "selectionFinish" value property to ' + oControlEvent.getParameter("selectedItems")
					+ " on " + this);
		}
	});
	oMultiComboBoxBinding.setModel(new JSONModel({
		"selected" : [],
		"items" : [{
			"key" : "AL",
			"text" : "Algeria"
		}, {
			"key" : "AR",
			"text" : "Argentina"
		}, {
			"key" : "NO",
			"text" : "Norway"
		}, {
			"key" : "OM",
			"text" : "Oman"
		}]
	}));

	var oMultiComboBox1 = new MultiComboBox({
		id : "MultiComboBox1",
		width : "300px",
		placeholder : "Choose your country",
		items : [new Item({
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
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectedKeys : ["0", "1", "2"],
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});

	var oMultiComboBoxError = new MultiComboBox({
		id : "MultiComboBoxError",
		width : "300px",
		placeholder : "Error",
		valueState : "Error",
		items : [new Item({
			key : "0",
			text : "item 0"
		}), new Item({
			key : "1",
			text : "item 1"
		})],
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},

		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});

	var oMultiComboBoxErrorWithLink = new MultiComboBox({
		id : "MultiComboBoxErrorWithLink",
		width : "300px",
		placeholder : "Error message with link",
		valueState : "Error",
		items : [new Item({
			key : "0",
			text : "item 0"
		}), new Item({
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
		}),
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},

		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});

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
		}),
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},

		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});

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
		})],
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});
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
		})],
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});
	var oItem;
	var oMultiComboBoxDisabledListItemSelectable = new MultiComboBox({
		id : "MultiComboBoxDisabledListItemSelectable",
		width : "400px",
		placeholder : "Example of disabled list item showing selectable feature",
		items : [oItem = new Item({
			text : "triggers last item"
		}), new Item({
			text : "item 1"
		}), new Item({
			text : "disabled item",
			enabled : false
		}), new Item({
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
				this.setSelectable(this.getLastItem(), oControlEvent.getParameter("selected"));
			}
		}
	});

	var oMultiComboBoxDisabledListItemDisabled = new MultiComboBox({
		id : "MultiComboBoxDisabledListItemDisabled",
		width : "400px",
		placeholder : "Example of list item showing disabled list item",
		items : [oItem = new Item({
			text : "triggers last item"
		}), new Item({
			text : "item 1"
		}), new Item({
			text : "disabled item",
			enabled : false
		}), new Item({
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
	});

	var items = [new Item({
		text : "Algeria"
	}), new Item({
		text : "Bulgaria"
	}), new Item({
		text : "Canada"
	}), new Item({
		text : "Denmark"
	}), new Item({
		text : "Estonia"
	})];
	var oMultiComboBoxReadOnly = new MultiComboBox({
		id : "MultiComboBoxReadOnly",
		width : "300px",
		placeholder : "ReadOnlyListItem",
		items : items,
		selectedItems : [items[0], items[1], items[2], items[3], items[4]],
		editable : false,
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});

	var oMultiComboBoxDisabled = new MultiComboBox({
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
		enabled : false,
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});

	var oMultiComboBoxWithoutKey = new MultiComboBox({
		id : "MultiComboBoxWithoutKey",
		width : "300px",
		placeholder : "WithoutKeyListItem",
		items : [new Item({
			text : "item 0"
		}), new Item({
			text : "item 1"
		})],
		change : function(oControlEvent) {
			Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value") + " on "
					+ this);
		},
		selectionChange : function(oControlEvent) {
			Log.info('Event fired: "selectionChange" value property to '
					+ oControlEvent.getParameter("changedItem") + " on " + this);
		}
	});

	var oToolbar = new Toolbar({
		content : [
			new Label({labelFor:"MultiComboBoxToolbar", text:"MultiComboBox in toolbar:"}),
			new MultiComboBox({
				id : "MultiComboBoxToolbar",
				width : "300px",
				items : [new Item({
					text : "item 0"
				}), new Item({
					text : "item 1"
				})],
				change : function(oControlEvent) {
					Log.info('Event fired: "change" value property to ' + oControlEvent.getParameter("value")
							+ " on " + this);
				},
				selectionChange : function(oControlEvent) {
					Log.info('Event fired: "selectionChange" value property to '
							+ oControlEvent.getParameter("changedItem") + " on " + this);
				}
			}),
			new ToolbarSpacer(),
			new Button({text: "Open Popup", press: openDialog})
		]
	});

	var oMultiComboBoxOneToken = new MultiComboBox({
		id : "MultiComboBoxOneToken",
		width : "300px",
		placeholder : "Example with one token.",
		items : [oItem = new Item({
			text : "Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, Very long text, "
		})],
		selectedItems : [oItem]
	});

	var readOnlyButtonOneToken = new sap.m.ToggleButton({
		text : "Toggle Read-Only mode MC with long token",
		press : function() {
			oMultiComboBoxOneToken.setEditable(!oMultiComboBoxOneToken.getEditable());
		}
	});

	var oMultiComboBoxFourItems = new MultiComboBox({
		id : "MultiComboBoxFourItems",
		width : "300px",
		items : [
			new Item({
				text : "New"
			}),
			new Item({
				text : "Open"
			}),
			new Item({
				text : "In Process"
			}),
			new Item({
				text : "Completed"
			})
		]
	});

	var oGroupedModel = new JSONModel({
		"items" : [
			{
				"key" : "DZ",
				"text" : "Algeria",
				"group" : "Countries 1"
			},

			{
				"key" : "AR",
				"text" : "Argentina",
				"group" : "Countries 1"
			},

			{
				"key" : "AU",
				"text" : "Australia",
				"group" : "Countries 1"
			},

			{
				"key" : "DI",
				"text" : "Disabled",
				"enabled" : false,
				"group" : "Countries 1"
			},

			{
				"key" : "AT",
				"text" : "Austria",
				"group" : "Countries 1"
			},

			{
				"key" : "BH",
				"text" : "Bahrain",
				"group" : "Countries 2"
			},

			{
				"key" : "BE",
				"text" : "Belgium",
				"group" : "Countries 2"
			},

			{
				"key" : "SA",
				"text" : "Saudi Arabia",
				"group" : "Countries 3"
			}
		]
	});

	var oMultiComboBoxWithGrouping = new MultiComboBox({
		id : "MultiComboBoxWithGrouping",
		width : "300px",
		valueState: "Warning",
		items : {
			path: "groupedModel>/items",
			template: new Item({
				key : "{groupedModel>key}",
				text : "{groupedModel>text}",
				enabled : "{groupedModel>enabled}"
			}),
			sorter: [new sap.ui.model.Sorter("group", false, true)]
		}
	});
	oMultiComboBoxWithGrouping.setModel(oGroupedModel, "groupedModel");

	var oMultiComboBoxSelectAll = new MultiComboBox({
		id : "MultiComboBoxSelectAll",
		width : "300px",
		items : [
			new Item({
				key: "0",
				text : "Item 0"
			}),
			new Item({
				key: "1",
				text : "Item 1"
			}),
			new Item({
				key: "2",
				text : "Item 2"
			}),
			new Item({
				key: "3",
				text : "Item 3"
			})
		],
		selectedKeys: [0, 2],
		showSelectAll: true
	});

	var oEmptyMultiComboBox = new MultiComboBox({
		placeholder: "MultiComboBox with no items"
	});

	var oMultiComboBoxLongSuggestions = new MultiComboBox("multiComboBoxWrapping", {
		width : "30rem",
		items : [
			new Item({
				key: "1",
				text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
			}),
			new Item({
				key: "2",
				text : "Item with very long text, wrapping enabled and wrapCharLimit set to а very large number in order to make the whole text always visible, taking as much space as needed."
			}),
			new Item({
				key: "3",
				text : "Item that not wrap"
			})
		]
	});
	var oLabelWrapping = new Label("wrappingLabel", {text: "MultiComboBox with suggestions wrapping", width:"100%", labelFor: "multiComboBoxWrapping"});

	var oMultiComboBoxStrangeKeys = new MultiComboBox("multiComboBoxStrangeKeys", {
		width: "600px",
		items : [
			new Item({ text: "Item A", key: '' }),
			new Item({ text: "Item B", key:'Y' }),
			new Item({ text: "Item C" }),
			new Item({ text: "Item D", key:'X' }),
			new Item({ text: "Item E", key: null})
		]
	});
	var oLabelItemsOrder = new Label("orderLabel", {text: "MultiComboBox with strange keys", width:"100%", labelFor: "multiComboBoxStrangeKeys"});

	var aTexts = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6", "Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];

	var aItems = aTexts.map( (text) => new Item({ text: text }));

	var oLongValueStateHeader = new MultiComboBox("longHeader", {
		selectionChange: () => {
			oLongValueStateHeader.setValueStateText("Minim tempor id amet adipiscing laboris mollit minim consequat dolor in sunt incididunt Excepteur Lorem mollit tempor incididunt ea dolor velit enim ea amet ex laborum occaecat dolore cillum eiusmod nisi cupidatat tempor veniam amet nostrud Lorem in anim anim laborum elit.");
		},
		valueState: "Error",
		items: aItems
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
				oCustomCssButton
		],
		content : [
			theCompactMode,oMultiComboBox2, oMultiComboBox, oMultiComboBox1,
			oMultiComboBoxDisabledListItemSelectable, oMultiComboBoxDisabledListItemDisabled, oMultiComboBoxReadOnly,
			oMultiComboBoxErrorWithLink, oMultiComboBoxWarningWithLinks, oMultiComboBoxDisabled, oMultiComboBoxWithoutKey, oMultiComboBoxError, oMultiComboBoxWarning,
			oMultiComboBoxSuccess, oMultiComboBoxOneToken, readOnlyButtonOneToken, oMultiComboBoxFourItems,
			oMultiComboBoxBinding, oMultiComboBoxWithGrouping, oMultiComboBoxSelectAll, oToolbar, oEmptyMultiComboBox, oLabelWrapping, oMultiComboBoxLongSuggestions,
			oLabelItemsOrder, oMultiComboBoxStrangeKeys, oLongValueStateHeader
		],
		showNavButton : true,
		navButtonPress : function() {
			oApp.to("page2");
		}
	}));

	oApp.addPage(new Page("page2", {
		title : "Navigation",
		content : [new Label({
			text : "Navigating back the JSON model of 'oMultiComboBoxBinding' will be replaced by new one where only 'Argentina' is selected...",
			width : "100%"
		})],
		showNavButton : true,
		navButtonPress : function() {
			oMultiComboBox2.rerender();
			var oModelNew = new JSONModel({
				"selected" : ["AR"],
				"items" : [{
					"key" : "AL",
					"text" : "Algeria"
				}, {
					"key" : "AR",
					"text" : "Argentina"
				}, {
					"key" : "NO",
					"text" : "Norway"
				}, {
					"key" : "OM",
					"text" : "Oman"
				}]
			});
			oMultiComboBoxBinding.setModel(oModelNew);
			oApp.back();
		}
	}));
	var shell = new Shell();
	shell.setApp(oApp);
	shell.placeAt("body");
});
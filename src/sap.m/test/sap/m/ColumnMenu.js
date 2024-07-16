sap.ui.define([
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/Item",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/Table",
	"sap/m/ComboBox",
	"sap/m/Button",
	"sap/ui/layout/GridData",
	"sap/m/FlexBox",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Text",
	"sap/m/ToolbarSpacer",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/model/json/JSONModel"
], function(
	ColumnMenu,
	Item,
	QuickAction,
	QuickSort,
	QuickSortItem,
	QuickGroup,
	QuickGroupItem,
	QuickTotal,
	QuickTotalItem,
	ActionItem,
	Table,
	ComboBox,
	Button,
	GridData,
	FlexBox,
	mobileLibrary,
	Toolbar,
	Text,
	ToolbarSpacer,
	Column,
	ColumnListItem,
	JSONModel
) {
	"use strict";

	// shortcut for sap.m.Sticky
	const Sticky = mobileLibrary.Sticky;

	// shortcut for sap.m.FlexWrap
	const FlexWrap = mobileLibrary.FlexWrap;

	var oData = {"items": []};
	for (var i = 0; i < 25; i++) {
		oData["items"].push({
			name: "Name " + i,
			street: "Street " + i,
			city: "City " + i
		});
	}

	var oQuickSort = new QuickSort({
		items : [
			new QuickSortItem ({
				key: "propertyA",
				label: "A",
				sortOrder: "Ascending"
			})
		]
	});

	var oQuickFilter = new QuickAction({
		label: "Quick Filter",
		content: new ComboBox()
	});

	var oQuickGroup = new QuickGroup({
		items: [
			new QuickGroupItem({
				key: "PropertyA",
				label: "Criterion A",
				grouped: true
			}),
			new QuickGroupItem({
				key: "PropertyB",
				label: "Criterion B",
				grouped: false
			}),
			new QuickGroupItem({
				key: "PropertyC",
				label: "Criterion C",
				grouped: false
			})
		]
	});

	var oQuickTotal = new QuickTotal({
		items: [
			new QuickTotalItem({
				key: "PropertyA",
				label: "Property A",
				totaled: false
			}),
			new QuickTotalItem({
				key: "PropertyB",
				label: "Property B",
				totaled: true
			})
		]
	});

	var oQuickCustomAction = new QuickAction({
		label: "Quick Custom",
		content: new Button({ text: "Execute Custom Action" })
	});

	var oQuickCustomLayoutNormal = new QuickAction({
		label: "Quick Custom Layout Long",
		content: [
			new Button({ text: "Button 1", layoutData: new GridData({spanS: 4, spanM: 3}) }),
			new Button({ text: "Button 2", layoutData: new GridData({spanS: 4, spanM: 3}) }),
			new Button({ text: "Button 3", layoutData: new GridData({spanS: 4, spanM: 2}) })
		]
	});

	var oQuickCustomActionLong = new QuickAction({
		label: "Quick Custom Long",
		content: new FlexBox({
			items: [
				new Button({ text: "Execute Custom Action 1" }),
				new Button({ text: "Execute Custom Action 2" }),
				new Button({ text: "Execute Custom Action 3" })
			],
			wrap: FlexWrap.Wrap
		}),
	});

	var oQuickMultiCustomActionLong = new QuickAction({
		label: "Quick Custom Long with HBox and just items",
		content: [
			new Button({ text: "Standalone Button 1"}),
			new FlexBox({
				items: [new Button({ text: "Execute Custom Action 1" }), new Button({ text: "Execute Custom Action 2" }), new Button({ text: "Execute Custom Action 3" })],
				wrap: FlexWrap.Wrap
			}),
		],
	});

	var oBtnReset = new Button({
		text: "Switch Reset State"
	});
	var oReset = new Item({
		label: "Reset",
		icon: "sap-icon://sort",
		content: oBtnReset,
		visible: false
	});
	oBtnReset.attachPress(function (oEvent) {
		oReset.changeButtonSettings({
			reset: {enabled: !oReset.getButtonSettings()["reset"]["enabled"]}
		});
	});

	var oItemFilter = new Item({
		label: "Filter",
		icon: "sap-icon://filter",
		content: new Button({
			text: "Sample Filter"
		})
	});

	var oItemGroup = new Item({
		label: "Group",
		icon: "sap-icon://group-2",
		content: new Button({
			text: "Sample Group"
		})
	});

	var oTable = new Table({
		sticky: [Sticky.ColumnHeaders, Sticky.HeaderToolbar],
		headerToolbar: new Toolbar({
			content: [
				new Text({text: "Example Table"}),
				new ToolbarSpacer(),
				new Button({text: "Example Button"})
			]
		}),
		columns: [
			new Column({
				header: new Text({text: "Column A"})
			}),
			new Column({
				header: new Text({text: "Column B"})
			}),
			new Column({
				header: new Text({text: "Column C"})
			}),
		],
	});

	var oTemplate = new ColumnListItem({
		cells : [
			new Text({text : "{name}"}),
			new Text({text : "{street}"}),
			new Text({text : "{city}"})
		]
	});
	oTable.setModel(new JSONModel(oData))
	oTable.bindItems({
		path: "/items",
		template : oTemplate,
		key: "name"
	});

	var oItemTable = new Item({
		label: "Table",
		icon: "sap-icon://table-column",
		content: oTable,
		resetButtonEnabled: false
	});

	var oActionItem = new ActionItem({
		label: "Action Item",
		icon: "sap-icon://table-column"
	});

	var aItems = [];

	for (var i = 0; i < 5; i++) {
		aItems.push(new Item({
			label: "Custom Action " + i,
			icon: "sap-icon://action-settings",
			content: new Button({ text: "Sample Action" }),
			showResetButton: i % 2 == 0,
			showConfirmButton: i % 3 == 0,
			showCancelButton: i % 5 == 0
		}))
	}

	// Test Menu
	var oMenu = new ColumnMenu({
		_quickActions: [oQuickSort, oQuickFilter, oQuickGroup, oQuickTotal],
		quickActions: [oQuickCustomAction, oQuickCustomLayoutNormal, oQuickCustomActionLong, oQuickMultiCustomActionLong],
		_items: [oReset, oItemFilter, oItemGroup, oItemTable, oActionItem],
		items: aItems
	});

	var oButton = new Button({
		text: "Open ColumnMenu",
		width: "200px",
		press: function () {
			oMenu.openBy(this);
		}
	});
	oButton.addDependent(oMenu);
	oButton.placeAt("body");

	var oButton2 = new Button({
		text: "Toggle Reset Visibility",
		width: "200px",
		press: function () {
			oReset.setVisible(!oReset.getVisible());
		}
	});
	oButton2.placeAt("body");

	// Visual Design Example
	var oSort = new Item({
		label: "Sort",
		icon: "sap-icon://sort",
		content: oBtnReset
	});
	var oColumn = new Item({
		label: "Column",
		icon: "sap-icon://table-column",
		content: new Button({text: "Column Button"}),
		resetButtonEnabled: false
	});
	var oVDMenu = new ColumnMenu({
		_quickActions: [oQuickSort.clone(), oQuickFilter.clone(), oQuickGroup.clone(), oQuickTotal.clone()],
		quickActions: [new QuickAction({
			label: "App-specific quick action",
			content: [
				new Button({
					text: "Action A",
					press: function() {
						oVDMenu.close();
					}
				}),
				new Button({
					text: "Action B",
					press: function() {
						oVDMenu.close();
					}
				})
			]
		})],
		_items: [oSort, oItemFilter.clone(), oItemGroup.clone(), oColumn],
		items: [
			new Item({
				label: "App-specific menu entry 1",
				icon: "sap-icon://pipeline-analysis",
				content: new Button({
					text: "Sample Button"
				})
			}),
			new Item({
				label: "App-specific menu entry 2",
				icon: "sap-icon://lab",
				content: new Button({
					text: "Sample Button"
				})
			})
		]
	});

	var oButton3 = new Button({
		text: "Open VisualDesign ColumnMenu",
		press: function () {
			oVDMenu.openBy(this);
		}
	});
	oButton3.addDependent(oVDMenu);
	oButton3.placeAt("body");
});
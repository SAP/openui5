sap.ui.define([
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/Button",
	"sap/m/ComboBox",
	"sap/m/FlexBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/library",
	"sap/ui/layout/GridData"
], function(
	ColumnMenu,
	QuickAction,
	QuickSort,
	QuickSortItem,
	QuickGroup,
	QuickGroupItem,
	QuickTotal,
	QuickTotalItem,
	ActionItem,
	Button,
	ComboBox,
	FlexBox,
	SegmentedButton,
	SegmentedButtonItem,
	library,
	GridData
) {
	"use strict";
	var oData = {"items": []};
	for (var i = 0; i < 10; i++) {
		oData["items"].push({
			name: "Name " + i,
			street: "Street " + i,
			city: "City " + i
		});
	}

	var oQuickSort = new QuickSort({
		items : [
			new QuickSortItem({
				key: "propertyA",
				label: "A",
				sortOrder: "Ascending"
			}),
			new QuickSortItem({
				key: "propertyB",
				label: "B",
				sortOrder: "Descending"
			})
		]
	});

	var oQuickFilter = new QuickAction({
		label: "Quick Filter",
		content: new ComboBox(),
		category: "Filter"
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

	new QuickAction({
		label: "Quick Custom",
		content: new Button({ text: "Execute Custom Action" }),
		category: "Sort"
	});

	new QuickAction({
		label: "Quick Filter",
		content: new Button({ text: "Execute Custom Filter" }),
		category: "Filter"
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
			wrap: library.FlexWrap.Wrap
		})
	});

	var oQuickMultiCustomActionLong = new QuickAction({
		label: "Quick Custom Long with HBox and just items",
		content: [
			new Button({ text: "Standalone Button 1"}),
			new FlexBox({
				items: [new Button({ text: "Execute Custom Action 1" }), new Button({ text: "Execute Custom Action 2" }), new Button({ text: "Execute Custom Action 3" })],
				wrap: library.FlexWrap.Wrap
			})
		]
	});

	var oActionItem = new ActionItem({
		label: "Action Item",
		icon: "sap-icon://table-column"
	});

	var oItemFilter = new ActionItem({
		label: "Filter",
		icon: "sap-icon://filter"
	});

	var oItemGroup = new ActionItem({
		label: "Group",
		icon: "sap-icon://group-2"
	});

	// Test Menu
	var oMenu = new ColumnMenu({
		showTableSettingsButton: true,
		quickActions: [oQuickSort, oQuickFilter, oQuickGroup, oQuickTotal, oQuickCustomLayoutNormal, oQuickCustomActionLong, oQuickMultiCustomActionLong],
		items: [oActionItem, oItemFilter, oItemGroup]
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
});
/*global QUnit*/
sap.ui.define([
	"sap/ui/test/actions/Drag",
	"sap/ui/test/actions/Drop",
	"sap/ui/test/actions/Press",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/Device"
], function (Drag, Drop, Press, Opa5, opaTest, Device) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true
	});

	if (Device.browser.safari) {
		QUnit.test("Should not run in Safari", function (assert) {
			assert.ok(true, "DataTransfer object can't be instantiated in Safari, but drag event needs a dataTransfer");
		});
	} else {

	opaTest("Should drag and drop and drop - Tree", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.m.sample.TreeDnD"
			}
		});

		// the binding path of tree items change according to their position in the tree
		// => verify that the path changes after dnd
		When.waitFor({
			controlType: "sap.m.StandardTreeItem",
			properties: {
				title: "Node1"
			},
			bindingPath: {
				path: "/0" // Node1 is at root level
			},
			actions: new Drag()
		});

		When.waitFor({
			controlType: "sap.m.StandardTreeItem",
			properties: {
				title: "Node2"
			},
			actions: new Drop()
		});

		// show Node2's children
		When.waitFor({
			controlType: "sap.ui.core.Icon",
			ancestor: {
				controlType: "sap.m.StandardTreeItem",
				properties: {
					title: "Node2"
				}
			},
			actions: new Press()
		});

		Then.waitFor({
			controlType: "sap.m.StandardTreeItem",
			properties: {
				title: "Node1"
			},
			bindingPath: {
				path: "/1/categories/0" // Node1's path should now be relevant to Node2
			},
			success: function () {
				Opa5.assert.ok(true);
			}
		});

		Then.iTeardownMyApp();
	});

	opaTest("Should drag and drop - grid list", function(Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.f.sample.GridListDragAndDrop"
			}
		});

		// when dropping item A over item B -> item A should go in B's old place, and B should move right in front of its old place

		Then.waitFor({
			controlType: "sap.f.GridList",
			properties: {
				headerText: "GridList header"
			},
			matchers: function (oList) {
				return oList.getItems();
			},
			success: function (aItems) {
				// check initial positions
				Opa5.assert.strictEqual(aItems[0][0].getCounter(), 5);
				Opa5.assert.strictEqual(aItems[0][1].getCounter(), 15);
			}
		});

		// scroll to items first, if they are outside the viewport, to ensure proper coordicates for the events.
		// scrolling is skipped here, because it creates a problem with dnd when app is started as component.
		// this happens even manually - the location of the drop indicator is wrong
		// When.waitFor({
		// 	controlType: "sap.f.GridListItem",
		// 	descendant: {
		// 		controlType: "sap.m.Title",
		// 		properties: {
		// 			text: "Box title 4"
		// 		}
		// 	},
		// 	actions: function (oItem) {
		// 		oItem.$()[0].scrollIntoView();
		// 	}
		// });

		When.waitFor({
			controlType: "sap.f.GridListItem",
			descendant: {
				controlType: "sap.m.Title",
				properties: {
					text: "Box title 1"
				}
			},
			actions: new Drag()
		});

		When.waitFor({
			controlType: "sap.f.GridListItem",
			descendant: {
				controlType: "sap.m.Title",
				properties: {
					text: "Box title 2"
				}
			},
			actions: new Drop()
		});

		Then.waitFor({
			controlType: "sap.f.GridList",
			properties: {
				headerText: "GridList header"
			},
			matchers: function (oList) {
				return oList.getItems();
			},
			success: function (aItems) {
				// positions of dragged item and drop target should be changed
				Opa5.assert.strictEqual(aItems[0][0].getCounter(), 15);
				Opa5.assert.strictEqual(aItems[0][1].getCounter(), 5);
			}
		});

		Then.iTeardownMyApp();
	});

	opaTest("Should drag and drop - table", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.ui.table.sample.DnD"
			}
		});

		// there are 2 cases: when the table is empty and when it's not.
		// the drop target changes accordingly

		// drop onto empty table
		Then.waitFor({
			controlType: "sap.ui.table.Table",
			descendant: {
				controlType: "sap.m.Title",
				properties: {
					text: "Selected Products"
				}
			},
			success: function (aTable) {
				// check that 'drop' table has no rows with data
				var aAllRows = aTable[0].getRows().length;
				var aHiddenRows = aTable[0].getRows().filter(function (oRow) {
					return oRow.$().hasClass("sapUiTableRowHidden");
				}).length;
				Opa5.assert.strictEqual(aHiddenRows, aAllRows);
			}
		});

		When.waitFor({
			controlType: "sap.ui.table.Row",
			bindingPath: {
				path: "/ProductCollection/0"
			},
			actions: new Drag()
		});

		// drop onto 'No Data' aggregation
		When.waitFor({
			controlType: "sap.ui.table.Table",
			descendant: {
				controlType: "sap.m.Title",
				properties: {
					text: "Selected Products"
				}
			},
			actions: new Drop({
				idSuffix: "noDataCnt"
			})
		});

		// drop onto filled table
		When.waitFor({
			controlType: "sap.ui.table.Row",
			bindingPath: {
				path: "/ProductCollection/1"
			},
			actions: new Drag()
		});

		// drop before the selected row (pick any row, as they are all visible, although they have no data)
		When.waitFor({
			controlType: "sap.ui.table.Table",
			descendant: {
				controlType: "sap.m.Title",
				properties: {
					text: "Selected Products"
				}
			},
			matchers: function (aTable) {
				return aTable.getRows()[0]; // will insert new row Before the first row
				// return aTable.getRows()[1]; // will insert new row After the first row (anhd before the second row)
			},
			actions: new Drop()
		});

		Then.waitFor({
			controlType: "sap.ui.table.Table",
			descendant: {
				controlType: "sap.m.Title",
				properties: {
					text: "Selected Products"
				}
			},
			success: function (aTable) {
				// check that the table has 2 rows with data
				var aAllRows = aTable[0].getRows().length;
				var aHiddenRows = aTable[0].getRows().filter(function (oRow) {
					return oRow.$().hasClass("sapUiTableRowHidden");
				}).length;
				Opa5.assert.strictEqual(aHiddenRows, aAllRows - 2);
			}
		});

		Then.iTeardownMyApp();
	});

	opaTest("Should drag and drop - icon tab bar", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.m.sample.IconTabBarDragDrop"
			}
		});

		// tab items are dropped onto the dividers between items
		Then.waitFor({
			controlType: "sap.m.IconTabHeader",
			ancestor: {
				controlType: "sap.m.IconTabBar"
			},
			success: function (aIconTabBar) {
				var aItems = aIconTabBar[0].getItems();
				// check values of first pair
				Opa5.assert.strictEqual(aItems[0].getText(), "Tab 1");
				Opa5.assert.strictEqual(aItems[1].getText(), "Tab 2");
				// check values of second pair
				Opa5.assert.strictEqual(aItems[2].getText(), "Tab 3");
				Opa5.assert.strictEqual(aItems[4].getText(), "Tab 5");
			}
		});

		// place Tab 1 after Tab 2 - first pair
		When.waitFor({
			controlType: "sap.m.IconTabFilter",
			properties: {
				text: "Tab 1"
			},
			actions: new Drag()
		});

		When.waitFor({
			controlType: "sap.m.IconTabFilter",
			properties: {
				text: "Tab 2"
			},
			actions: new Drop({
				after: true
			})
		});

		// place Tab 3 before Tab 5 - second pair
		When.waitFor({
			controlType: "sap.m.IconTabFilter",
			properties: {
				text: "Tab 3"
			},
			actions: new Drag()
		});

		When.waitFor({
			controlType: "sap.m.IconTabFilter",
			properties: {
				text: "Tab 5"
			},
			actions: new Drop({
				before: true
			})
		});

		Then.waitFor({
			controlType: "sap.m.IconTabHeader",
			ancestor: {
				controlType: "sap.m.IconTabBar"
			},
			success: function (aIconTabBar) {
				var aItems = aIconTabBar[0].getItems();
				// check values of first pair
				Opa5.assert.strictEqual(aItems[0].getText(), "Tab 2");
				Opa5.assert.strictEqual(aItems[1].getText(), "Tab 1");
				// check values of second pair
				Opa5.assert.strictEqual(aItems[2].getText(), "Tab 4");
				Opa5.assert.strictEqual(aItems[3].getText(), "Tab 3");
				Opa5.assert.strictEqual(aItems[4].getText(), "Tab 5");
			}
		});

		Then.iTeardownMyApp();
	});

	opaTest("Should drag and drop - tree table", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "sap.ui.table.sample.TreeTable.HierarchyMaintenanceJSONTreeBinding"
			}
		});

		// the binding path of tree table items change according to their position in the tree table
		// => verify that the path changes after dnd
		When.waitFor({
			controlType: "sap.ui.table.Row",
			bindingPath: {
				path: "/catalog/clothing/categories/2"
			},
			actions: new Drag()
		});

		When.waitFor({
			controlType: "sap.ui.table.Row",
			bindingPath: {
				path: "/catalog/clothing/categories/0"
			},
			actions: new Drop()
		});

		// show the drop target's children
		When.waitFor({
			controlType: "sap.ui.table.Row",
			bindingPath: {
				path: "/catalog/clothing/categories/0"
			},
			actions: new Press({
				idSuffix: "treeicon"
			})
		});

		// the dragged item should now be a child of the drop target
		Then.waitFor({
			controlType: "sap.ui.table.Row",
			bindingPath: {
				path: "/catalog/clothing/categories/0/categories/4"
			},
			success: function () {
				Opa5.assert.ok(true, "Row was dropped");
			}
		});

		Then.iTeardownMyApp();
	});
}
});

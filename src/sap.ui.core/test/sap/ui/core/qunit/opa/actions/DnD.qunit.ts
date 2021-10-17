import Drag from "sap/ui/test/actions/Drag";
import Drop from "sap/ui/test/actions/Drop";
import Press from "sap/ui/test/actions/Press";
import Opa5 from "sap/ui/test/Opa5";
import opaTest from "sap/ui/test/opaQunit";
import Device from "sap/ui/Device";
Opa5.extendConfig({
    autoWait: true
});
if (Device.browser.safari) {
    QUnit.test("Should not run in Safari", function (assert) {
        assert.ok(true, "DataTransfer object can't be instantiated in Safari, but drag event needs a dataTransfer");
    });
}
else {
    opaTest("Should drag and drop and drop - Tree", function (Given, When, Then) {
        Given.iStartMyUIComponent({
            componentConfig: {
                name: "sap.m.sample.TreeDnD"
            }
        });
        When.waitFor({
            controlType: "sap.m.StandardTreeItem",
            properties: {
                title: "Node1"
            },
            bindingPath: {
                path: "/0"
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
                path: "/1/categories/0"
            },
            success: function () {
                Opa5.assert.ok(true);
            }
        });
        Then.iTeardownMyApp();
    });
    opaTest("Should drag and drop - grid list", function (Given, When, Then) {
        Given.iStartMyUIComponent({
            componentConfig: {
                name: "sap.f.sample.GridListDragAndDrop"
            }
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
                Opa5.assert.strictEqual(aItems[0][0].getCounter(), 5);
                Opa5.assert.strictEqual(aItems[0][1].getCounter(), 15);
            }
        });
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
        Then.waitFor({
            controlType: "sap.ui.table.Table",
            descendant: {
                controlType: "sap.m.Title",
                properties: {
                    text: "Selected Products"
                }
            },
            success: function (aTable) {
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
        When.waitFor({
            controlType: "sap.ui.table.Row",
            bindingPath: {
                path: "/ProductCollection/1"
            },
            actions: new Drag()
        });
        When.waitFor({
            controlType: "sap.ui.table.Table",
            descendant: {
                controlType: "sap.m.Title",
                properties: {
                    text: "Selected Products"
                }
            },
            matchers: function (aTable) {
                return aTable.getRows()[0];
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
        Then.waitFor({
            controlType: "sap.m.IconTabHeader",
            ancestor: {
                controlType: "sap.m.IconTabBar"
            },
            success: function (aIconTabBar) {
                var aItems = aIconTabBar[0].getItems();
                Opa5.assert.strictEqual(aItems[0].getText(), "Tab 1");
                Opa5.assert.strictEqual(aItems[1].getText(), "Tab 2");
                Opa5.assert.strictEqual(aItems[2].getText(), "Tab 3");
                Opa5.assert.strictEqual(aItems[4].getText(), "Tab 5");
            }
        });
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
                Opa5.assert.strictEqual(aItems[0].getText(), "Tab 2");
                Opa5.assert.strictEqual(aItems[1].getText(), "Tab 1");
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
        When.waitFor({
            controlType: "sap.ui.table.Row",
            bindingPath: {
                path: "/catalog/clothing/categories/0"
            },
            actions: new Press({
                idSuffix: "treeicon"
            })
        });
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
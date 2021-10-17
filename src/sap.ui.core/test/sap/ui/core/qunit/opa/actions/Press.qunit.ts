import Press from "sap/ui/test/actions/Press";
import Button from "sap/m/Button";
import Link from "sap/m/Link";
import List from "sap/m/List";
import StandardListItem from "sap/m/StandardListItem";
import IconTabBar from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MockServer from "sap/ui/core/util/MockServer";
import Table from "sap/ui/table/Table";
import Column from "sap/ui/table/Column";
import Item from "sap/ui/core/Item";
import Label from "sap/m/Label";
import Input from "sap/m/Input";
import TileContainer from "sap/m/TileContainer";
import StandardTile from "sap/m/StandardTile";
import SearchField from "sap/m/SearchField";
import Page from "sap/m/Page";
import App from "sap/m/App";
import FullscreenPage from "sap/m/semantic/FullscreenPage";
import DetailPage from "sap/m/semantic/DetailPage";
import CheckBox from "sap/m/CheckBox";
import ComboBox from "sap/m/ComboBox";
import OverflowToolbar from "sap/m/OverflowToolbar";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import mobileLibrary from "sap/m/library";
import Opa5 from "sap/ui/test/Opa5";
import opaTest from "sap/ui/test/opaQunit";
import hasher from "sap/ui/thirdparty/hasher";
import AggregationLengthEquals from "sap/ui/test/matchers/AggregationLengthEquals";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";
import Ancestor from "sap/ui/test/matchers/Ancestor";
import Log from "sap/base/Log";
import $ from "sap/ui/thirdparty/jquery";
import ObjectIdentifier from "sap/m/ObjectIdentifier";
import ListHelpers from "sap/m/inputUtils/ListHelpers";
var ButtonType = mobileLibrary.ButtonType;
var ListMode = mobileLibrary.ListMode;
var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;
var OverflowToolbarLayoutData = mobileLibrary.OverflowToolbarLayoutData;
var aControlsToClean = [];
QUnit.module("positive tests", {
    beforeEach: function () {
        this.oSpy = sinon.spy(Log, "debug");
    },
    afterEach: function () {
        while (aControlsToClean.length) {
            aControlsToClean.pop().destroy();
        }
        this.oSpy.restore();
    }
});
[{
        control: new Page({
            showNavButton: true
        }),
        event: "NavButtonPress"
    }, {
        control: new FullscreenPage({
            showNavButton: true
        }),
        event: "NavButtonPress"
    }, {
        control: new DetailPage({
            showNavButton: true
        }),
        event: "NavButtonPress"
    }, {
        control: new Button(),
        event: "Press"
    }, {
        control: new Link(),
        event: "Press"
    }, {
        control: new CheckBox(),
        event: "Select"
    }, {
        control: new Input({
            showValueHelp: true
        }),
        event: "ValueHelpRequest"
    }].forEach(function (oTestCase) {
    QUnit.test("Should press a " + oTestCase.control.getMetadata().getName(), function (assert) {
        var fnDone = assert.async();
        var oControl = oTestCase.control;
        aControlsToClean.push(oControl);
        oControl.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        var oPressAction = new Press();
        oControl["attach" + oTestCase.event](function () {
            setTimeout(function () {
                sinon.assert.calledWith(this.oSpy, sinon.match(/Pressed the control/), oPressAction._sLogPrefix);
                sinon.assert.called(fnOnSapFocusInSpy);
                fnDone();
            }.bind(this), 20);
        }, this);
        if (!oControl.onfocusin) {
            oControl.onfocusin = $.noop;
        }
        if (!oControl.onsapfocusleave) {
            oControl.onsapfocusleave = $.noop;
        }
        var fnOnSapFocusInSpy = sinon.spy(oControl, "onfocusin");
        oPressAction.executeOn(oControl);
    });
});
QUnit.test("Should request focus and trigger a 'press' event on an StandardListItem of type 'active'", function (assert) {
    var done = assert.async();
    var oFirstListItem = new StandardListItem({
        title: "List Item Press",
        type: "Active"
    }), oList = new List({
        headerText: "Press Test",
        items: [oFirstListItem]
    });
    oList.placeAt("qunit-fixture");
    aControlsToClean.push(oList);
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press();
    oFirstListItem.attachPress(function () {
        assert.ok(true, "Press Event has been triggered");
        assert.ok(jQuery(document.activeElement).is(oFirstListItem.$()), "List Item has focus");
        done();
    }, this);
    oPressAction.executeOn(oFirstListItem);
});
QUnit.test("List should fire selection change event", function (assert) {
    var done = assert.async();
    var oFirstListItem = new StandardListItem({
        title: "Initially selected item",
        type: "Active"
    }), oSecondListItem = new StandardListItem({
        title: "Pressed upon during test",
        type: "Active"
    }), oList = new List({
        headerText: "Selection Change Test",
        mode: ListMode.SingleSelectMaster,
        items: [oFirstListItem, oSecondListItem]
    });
    oList.setSelectedItem(oFirstListItem);
    oList.placeAt("qunit-fixture");
    aControlsToClean.push(oList);
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press();
    oList.attachSelectionChange(function () {
        assert.ok(true, "Selection change has been triggered");
        assert.ok(jQuery(document.activeElement).is(oSecondListItem.$()), "Pressed List Item has focus");
        assert.ok(oSecondListItem.getSelected(), "Pressed List Item is selected");
        done();
    }, this);
    oPressAction.executeOn(oSecondListItem);
});
QUnit.test("IconTabBar should fire selection change event", function (assert) {
    var done = assert.async();
    var oFirstTab = new IconTabFilter({
        key: "foo"
    }), oSecondTab = new IconTabFilter({
        key: "bar"
    }), oTabBar = new IconTabBar({
        items: [oFirstTab, oSecondTab]
    });
    oTabBar.setSelectedItem(oFirstTab);
    oTabBar.placeAt("qunit-fixture");
    aControlsToClean.push(oTabBar);
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press();
    oTabBar.attachSelect(function () {
        assert.ok(true, "Select has been triggered");
        assert.ok(jQuery(document.activeElement).is(oSecondTab.$()), "Pressed Tab has focus");
        assert.strictEqual(oTabBar.getSelectedKey(), "bar", "Pressed Tab is selected");
        done();
    }, this);
    oPressAction.executeOn(oSecondTab);
});
QUnit.test("Should be able to press a row in the sap.ui.table.Table", function (assert) {
    var oTable = new Table({
        selectionBehavior: "Row"
    }), done = assert.async(), aData = [
        { lastName: "Dente" },
        { lastName: "Friese" },
        { lastName: "Mann" }
    ], oModel = new JSONModel();
    oModel.setData({ modelData: aData });
    oTable.addColumn(new Column({
        template: new Label({ text: "{lastName}" })
    }));
    oTable.setModel(oModel);
    oTable.bindRows("/modelData");
    oTable.placeAt("qunit-fixture");
    aControlsToClean.push(oTable);
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press();
    oTable.attachRowSelectionChange(function () {
        assert.ok(true, "Fired the event");
        done();
    });
    oPressAction.executeOn(oTable.getRows()[1].getCells()[0]);
});
QUnit.test("Should press a Tile in a Tile container", function (assert) {
    var done = assert.async(), oTile = new StandardTile(), oTileContainer = new TileContainer({
        tiles: oTile
    });
    oTileContainer.placeAt("qunit-fixture");
    aControlsToClean.push(oTileContainer);
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press();
    oTile.attachPress(function () {
        assert.ok(true, "Fired the event");
        done();
    });
    oPressAction.executeOn(oTile);
});
(function () {
    var oModel;
    var oMockServer;
    var oList;
    QUnit.module("Growing list with press", {
        beforeEach: function () {
            oList = new List({
                growing: true,
                growingThreshold: 1,
                items: {
                    path: "/Products",
                    template: new StandardListItem()
                }
            });
            oList.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function () {
            if (oMockServer) {
                oMockServer.stop();
                oMockServer.destroy();
            }
            oModel.destroy();
            oList.destroy();
        }
    });
    [
        {
            createModel: function () {
                oModel = new JSONModel();
                oModel.setData({ Products: [{}, {}] });
            },
            name: "List should load more items with JSON"
        },
        {
            createModel: function () {
                var sServerUrl = "/myODataService/";
                oMockServer = new MockServer({ rootUri: sServerUrl });
                MockServer.config({
                    autoRespond: true,
                    autoRespondAfter: 0
                });
                oMockServer.simulate(sap.ui.require.toUrl("test-resources/sap/ui/core/testdata/annotations/metadata.xml"), {
                    bGenerateMissingMockData: true
                });
                oMockServer.start();
                oModel = new ODataModel(sServerUrl);
            },
            name: "List should load more items with ODATA"
        }
    ].forEach(function (oTest) {
        Opa5.extendConfig({ autoWait: true });
        opaTest(oTest.name, function (oOpa) {
            oTest.createModel();
            oList.setModel(oModel);
            oOpa.waitFor({
                id: oList.getId(),
                matchers: new AggregationLengthEquals({ name: "items", length: 1 }),
                success: function () {
                    Opa5.assert.ok(true, "Table items loaded");
                },
                errorMessage: "Table items not loaded"
            });
            oOpa.waitFor({
                id: oList.getId(),
                actions: new Press(),
                errorMessage: "Can't find More button"
            });
            oOpa.waitFor({
                id: oList.getId(),
                matchers: new AggregationLengthEquals({ name: "items", length: 2 }),
                success: function () {
                    Opa5.assert.ok(true, "Table growth triggered");
                },
                errorMessage: "Table growth not triggered"
            });
        });
    });
})();
QUnit.module("Press - interact with ObjectIdentifier", {
    beforeEach: function () {
        this.oObjectIdentifier = new ObjectIdentifier({ active: true });
        this.oObjectIdentifier.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
    },
    afterEach: function () {
        this.oObjectIdentifier.destroy();
    }
});
QUnit.test("Should press active ObjectIdentifier - press adapter", function (assert) {
    var done = assert.async();
    this.oObjectIdentifier.setTitle("sampleTitle");
    this.oObjectIdentifier.setTitleActive(true);
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press();
    $("a").on("click", function () {
        assert.ok(true, "Executed press action on link");
        done();
    });
    oPressAction.executeOn(this.oObjectIdentifier);
});
QUnit.test("Should press inactive ObjectIdentifier - press adapter", function (assert) {
    var done = assert.async();
    this.oObjectIdentifier.setTitle("sampleTitle");
    this.oObjectIdentifier.setTitleActive(false);
    this.oObjectIdentifier.setText("sampleText");
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press();
    var that = this;
    $(".sapMObjectIdentifierTitle").on("click", function () {
        assert.ok(true, "Executed press action on title");
        that.oObjectIdentifier.setTitle(null);
        sap.ui.getCore().applyChanges();
        $(".sapMObjectIdentifierText").on("click", function () {
            assert.ok(true, "Executed press action on text");
            done();
        });
        oPressAction.executeOn(that.oObjectIdentifier);
    });
    oPressAction.executeOn(this.oObjectIdentifier);
});
QUnit.test("Should press ObjectIdentifier - missing press adapter", function (assert) {
    var done = assert.async();
    var oPressAction = new Press();
    $(".sapMObjectIdentifier").on("click", function () {
        assert.ok(true, "Executed press action on link");
        done();
    });
    oPressAction.executeOn(this.oObjectIdentifier);
});
QUnit.module("Press - interact with SearchField", {
    beforeEach: function () {
        this.oSearchField = new SearchField();
        this.oSearchField.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
    },
    afterEach: function () {
        this.oSearchField.destroy();
    }
});
QUnit.test("Should press SearchField search icon - press adapter", function (assert) {
    var done = assert.async();
    var oPressAction = new Press();
    $("div[title='Search']").on("click", function () {
        assert.ok(true, "Executed press action on search icon");
        done();
    });
    oPressAction.executeOn(this.oSearchField);
});
QUnit.test("Should press SearchField - missing press adapter", function (assert) {
    var done = assert.async();
    var oPressAction = new Press();
    this.oSearchField.setShowSearchButton(false);
    sap.ui.getCore().applyChanges();
    $("input[type='search']").on("mousedown", function () {
        assert.ok(true, "Executed press action on search input field (focus DOM ref)");
        done();
    });
    oPressAction.executeOn(this.oSearchField);
});
QUnit.test("Should press SearchField - user provided ID suffix", function (assert) {
    var done = assert.async();
    this.oSearchField.setShowRefreshButton(true);
    sap.ui.getCore().applyChanges();
    var oPressAction = new Press({ idSuffix: "reset" });
    $("div[title='Search']").on("click", function () {
        assert.ok(true, "Executed press action on search button");
        done();
    });
    oPressAction.executeOn(this.oSearchField);
});
QUnit.module("ComboBox", {
    beforeEach: function () {
        this.clock = sinon.useFakeTimers();
        this.oComboBox = new ComboBox({
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
        this.oComboBox.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
    },
    afterEach: function () {
        this.oComboBox.destroy();
        this.clock.restore();
    }
});
QUnit.test("Should select an item", function (assert) {
    var oPicker = this.oComboBox.getPicker();
    assert.strictEqual(this.oComboBox.getSelectedItem(), null, "By default the selected item of the ComboBox control is null");
    assert.strictEqual(this.oComboBox.getValue(), "", "ComboBox's value is empty");
    assert.strictEqual(oPicker, null, "ComboBox's Popover does not exists");
    var oPressArrow = new Press();
    oPressArrow.executeOn(this.oComboBox);
    this.clock.tick(1000);
    oPicker = this.oComboBox.getPicker();
    var oOpenPickerDomRef = jQuery(oPicker.getDomRef());
    assert.ok(oPicker.isOpen(), "ComboBox's Popover is open");
    assert.equal(oOpenPickerDomRef.css("visibility"), "visible", "Checking Popover's visibility css property");
    assert.equal(oOpenPickerDomRef.css("display"), "block", "Checking Popover's display css property");
    var oPressItem = new Press();
    oPressItem.executeOn(ListHelpers.getListItem(this.oComboBox.getItems()[1]));
    this.clock.tick(500);
    if (oPicker.getDomRef()) {
        var oClosedPickerDomRef = jQuery(oPicker.getDomRef());
        assert.ok(!oPicker.isOpen(), "ComboBox's Popover is closed");
        assert.equal(oClosedPickerDomRef.css("visibility"), "hidden", "Checking Popover's visibility css property");
        assert.equal(oClosedPickerDomRef.css("display"), "none", "Checking Popover's display css property");
        assert.strictEqual(this.oComboBox.getValue(), "item 1", "Check selected item");
    }
    else {
        assert.ok(true, "The Popover is removed from the DOM");
    }
});
(function () {
    function createButton(sText, fnPressCallback) {
        return new Button({
            text: sText,
            width: "150px",
            press: function () {
                Opa5.assert.ok(true, "Fired the press event on button with text " + sText);
                if (fnPressCallback) {
                    fnPressCallback();
                }
            }
        });
    }
    QUnit.module("OverflowToolbar");
    opaTest("Should synchronize with overflow popup", function (oOpa) {
        var oOverflowToolbar = new OverflowToolbar({
            width: "140px"
        });
        oOverflowToolbar.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        setTimeout(function () {
            oOverflowToolbar.addContent(createButton("Button1"));
            oOverflowToolbar.addContent(createButton("Button2"));
        }, 600);
        oOpa.extendConfig({ autoWait: true });
        oOpa.waitFor({
            controlType: "sap.m.ToggleButton",
            errorMessage: "Did not find the popover area toggle button",
            actions: new Press()
        });
        oOpa.waitFor({
            controlType: "sap.m.Button",
            matchers: new PropertyStrictEquals({ name: "text", value: "Button2" }),
            errorMessage: "Did not find the overflowing button with text Button2",
            actions: new Press()
        });
        oOpa.waitFor({
            success: function () {
                oOverflowToolbar.destroy();
            }
        });
    });
    opaTest("Should synchronize with resizing overflow toolbar", function (oOpa) {
        var oOverflowToolbar = new OverflowToolbar({
            width: "400px"
        });
        oOverflowToolbar.addContent(createButton("Button1"));
        oOverflowToolbar.addContent(createButton("Button2"));
        oOverflowToolbar.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        oOpa.extendConfig({ autoWait: true });
        oOpa.waitFor({
            success: function () {
                oOverflowToolbar.setWidth("140px");
                console.debug("Set smaller width to cause overflow");
            }
        });
        oOpa.waitFor({
            controlType: "sap.m.ToggleButton",
            errorMessage: "Did not find the popover area toggle button",
            actions: new Press()
        });
        oOpa.waitFor({
            controlType: "sap.m.Button",
            matchers: new PropertyStrictEquals({ name: "text", value: "Button2" }),
            errorMessage: "Did not find the overflowing button with text Button2",
            actions: new Press()
        });
        oOpa.waitFor({
            success: function () {
                oOverflowToolbar.destroy();
            }
        });
    });
    opaTest("Should synchronize with resizing overflow toolbar when resizing the app", function (oOpa) {
        var toolbarContent1 = [
            new Label({
                text: "Priority Toolbar"
            }),
            new ToolbarSpacer(),
            new Button({
                text: "Always 1",
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow }),
                width: "125px"
            }),
            new Button({
                text: "Always 2",
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.AlwaysOverflow }),
                width: "125px"
            }),
            new Button({
                text: "High 1",
                type: ButtonType.Accept,
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }),
                width: "125px"
            }),
            new Button({
                text: "Low 1",
                type: ButtonType.Emphasized,
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low }),
                width: "125px"
            }),
            new Button({
                text: "Never 1",
                type: ButtonType.Reject,
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.NeverOverflow }),
                width: "125px"
            }),
            new Button({
                text: "Never 2",
                type: ButtonType.Reject,
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.NeverOverflow }),
                width: "125px"
            }),
            new Button({
                text: "Low 2",
                type: ButtonType.Emphasized,
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Low }),
                width: "125px"
            }),
            new Button({
                text: "Disappear",
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.Disappear }),
                width: "125px"
            }),
            new Button({
                text: "High 2",
                type: ButtonType.Accept,
                layoutData: new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }),
                width: "125px",
                press: function () {
                    Opa5.assert.ok(true, "Fired the press event on button with text High 2");
                }
            })
        ];
        var oOverflowToolbar1 = new OverflowToolbar("otb1", {
            width: "auto",
            content: toolbarContent1
        });
        var oPage = new Page("toolbar-page", {
            title: "Overflow Toolbar - the buttons that do not fit go to an action sheet",
            enableScrolling: true,
            content: [
                oOverflowToolbar1
            ]
        });
        var oApp = new App();
        oApp.addPage(oPage).placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        oOpa.extendConfig({
            autoWait: true,
            asyncPolling: true
        });
        oOpa.waitFor({
            success: function () {
                $("#toolbar-page").width("480px");
                console.debug("Set smaller width to cause overflow");
            }
        });
        oOpa.waitFor({
            controlType: "sap.m.ToggleButton",
            errorMessage: "Did not find the popover area toggle button",
            actions: new Press(),
            success: function () {
                console.debug("Clicked the overflow button");
            }
        });
        oOpa.waitFor({
            controlType: "sap.m.Button",
            matchers: new PropertyStrictEquals({ name: "text", value: "High 2" }),
            errorMessage: "Did not find the High 2 button",
            actions: new Press(),
            success: function () {
                console.debug("Closed the overflow popup");
            }
        });
        oOpa.waitFor({
            success: function () {
                console.debug("Destroy the app");
                oApp.destroy();
            }
        });
    });
})();
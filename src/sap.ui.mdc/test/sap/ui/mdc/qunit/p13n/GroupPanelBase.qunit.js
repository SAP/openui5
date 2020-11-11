/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/p13n/panels/GroupPanelBase",
    "sap/ui/mdc/p13n/P13nBuilder",
    "sap/ui/model/json/JSONModel",
    "sap/m/CustomListItem",
    "sap/m/Toolbar",
    "sap/ui/base/Event",
    "sap/m/Text",
    "sap/m/List",
    "sap/m/SegmentedButtonItem",
    "sap/ui/mdc/util/PropertyHelper",
    "sap/m/VBox"
], function(GroupPanelBase, P13nBuilder, JSONModel, CustomListItem, Toolbar, Event, Text, List, SegmentedButtonItem, PropertyHelper, VBox) {
    "use strict";

    var oMockExisting = {
        items: [
            {
                name: "key1"
            },
            {
                name: "key2"
            },
            {
                name: "key3"
            }
        ],
        sorters: [
            {
                name: "key1",
                descending: true
            }
        ],
        filter: {
            key2: [
                {
                    operator: "EQ",
                    values: [
                        "Test"
                    ]
                }
            ]

        }
    };

    var aInfoData = [
        {
            name: "key1",
            label: "Field 1",
            group: "G1"
        },
        {
            name: "key2",
            label: "Field 2",
            group: "G1"
        },
        {
            name: "key3",
            label: "Field 3",
            group: "G1"
        },
        {
            name: "key4",
            label: "Field 4",
            group: "G2"
        },
        {
            name: "key5",
            label: "Field 5",
            group: "G2"
        },
        {
            name: "key6",
            label: "Field 6",
            group: "G2",
            tooltip: "Some Tooltip"
        }
    ];

    QUnit.module("API Tests", {
        beforeEach: function(){
            this.sDefaultGroup = "BASIC";
            this.oExistingMock = oMockExisting;
            this.aMockInfo = aInfoData;
            this.oPanel = new GroupPanelBase({
                expandFirstGroup: true,
                footerToolbar: new Toolbar("ID_TB1",{})
            });

            this.oPanel.setItemFactory(function(){
                return new VBox();
            });

			this.oPropertyHelper = new PropertyHelper(this.aMockInfo);
            this.oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.oPropertyHelper);

            this.oPanel.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function(){
            this.sDefaultGroup = null;
            this.oExistingMock = null;
            this.oP13nData = null;
            this.aMockInfo = null;
            this.oPanel.destroy();
            this.oPropertyHelper.destroy();
        }
    });

    QUnit.test("check instantiation", function(assert){
        assert.ok(this.oPanel, "Panel created");
        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");
        assert.ok(this.oPanel.getModel(this.oPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
    });

    var fnCheckListCreation = function(assert) {
        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        var oOuterList = this.oPanel._oListControl;
        assert.ok(oOuterList.isA("sap.m.ListBase"), "Inner control is a list");
        assert.ok(oOuterList.isA("sap.m.ListBase"), "Inner control is a list");

        assert.equal(oOuterList.getItems().length, 2, "2 Groups created");

        var oFirstInnerList = oOuterList.getItems()[0].getContent()[0].getContent()[0];
        assert.equal(oFirstInnerList.getItems().length, 3, "First inner list contains 3 items");
        assert.ok(oFirstInnerList.getItems()[0].isA("sap.m.CustomListItem"), "Item matches provided factory function");

        var oSecondInnerList = oOuterList.getItems()[1].getContent()[0].getContent()[0];
        assert.equal(oSecondInnerList.getItems().length, 3, "Second inner list contains 3 items");
        assert.ok(oSecondInnerList.getItems()[0].isA("sap.m.CustomListItem"), "Item matches provided factory function");
    };

    QUnit.test("Check Outer and Inner List creation", function(assert){
        fnCheckListCreation.call(this, assert);
    });

    QUnit.test("Check Search implementation", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._getSearchField().setValue("Field 5");
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});

        this.oPanel._onSearchFieldLiveChange(oFakeEvent);

        var oOuterList = this.oPanel._oListControl;
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
    });

    QUnit.test("Check Search implementation - also for ToolTip", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._getSearchField().setValue("Some Tooltip");
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});

        this.oPanel._onSearchFieldLiveChange(oFakeEvent);

        var oOuterList = this.oPanel._oListControl;
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
    });

    QUnit.test("Check Search implementation in combination with 'group mode' Select for 'active'", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._sModeKey = "active";
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});
        var oOuterList = this.oPanel._oListControl;

        //filter only via select control --> only first group has an active item
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is invisible since items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

        //filter with additional search --> active item does not have this tooltip
        this.oPanel._getSearchField().setValue("Some Tooltip");
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

        //filter with a search filter and 'all' --> only affected item with the tooltip should be visible
        this.oPanel._sModeKey = "all";
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
    });

    QUnit.test("Check Search implementation in combination with 'group mode' Select for 'visibleactive'", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._sModeKey = "visibleactive";
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});
        var oOuterList = this.oPanel._oListControl;

        //filter only via select control --> only first group has an active and visible item
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

        //filter with additional search --> active item is still present as it fits the label
        this.oPanel._getSearchField().setValue("Field 2");
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

        this.oPanel._getSearchField().setValue("Field 1");
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

        //filter with additional search --> active item is still present as it fits the label
        this.oPanel._getSearchField().setValue("Field 2");
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

        //filter with a search filter and 'all' --> only affected item with the tooltip should be visible
        this.oPanel._sModeKey = "all";
        this.oPanel._getSearchField().setValue("");
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), true, "Panel is visible since items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
    });

    QUnit.test("Check Search implementation in combination with 'group mode' Select", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._getSearchField().setValue("Some Tooltip");
        this.oPanel._sModeKey = "visible";
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});

        this.oPanel._onSearchFieldLiveChange(oFakeEvent);

        var oOuterList = this.oPanel._oListControl;
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), false, "Panel is invisible since no items are available");

        this.oPanel._sModeKey = "all";
        this.oPanel._onSearchFieldLiveChange(oFakeEvent);
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
    });

    QUnit.test("Check that groups are initially only displayed if necessary", function(assert){

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.oPropertyHelper);
        this.oPanel.setP13nModel(new JSONModel(oP13nData));
        this.oPanel.switchViewMode("group");

        assert.equal(this.oPanel._oListControl.getVisibleItems().length, 2, "All groups visible");

        oP13nData.itemsGrouped[0].items.forEach(function(oItem){
            oItem.visibleInDialog = false;
        });

        this.oPanel.setP13nModel(new JSONModel(oP13nData));

        assert.equal(this.oPanel._oListControl.getVisibleItems().length, 1, "Only necessary groups visible");

    });

    QUnit.test("Check 'itemFactory' execution for only necessary groups", function(assert){

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);

        var fnItemFactoryCallback = function(oContext) {
            return new VBox();
        };

        this.oPanel.setItemFactory(fnItemFactoryCallback);

        this.oPanel.setP13nModel(new JSONModel(oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._loopGroupList(function(oItem, sKey){
            var oProp = this.oPanel.getP13nModel().getProperty(oItem.getBindingContext(this.oPanel.P13N_MODEL).sPath);
            var iExpectedLength = oProp.group === "G1" ? 2 : 1;

            assert.equal(oItem.getContent().length, iExpectedLength, "Only required callbacks executed");

        }.bind(this));

    });

    QUnit.test("Check 'itemFactory' execution for expanded groups", function(assert){

        //6 items in 2 groups --> 6x callback excuted after expanding
        var done = assert.async(6);

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);

        var fnItemFactoryCallback = function (oContext) {

            assert.ok(oContext, "Callback executed with binding context");
            done(6);
        };

        this.oPanel.setItemFactory(fnItemFactoryCallback);

        this.oPanel.setP13nModel(new JSONModel(oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel.setGroupExpanded("G2");

    });

    QUnit.test("Check 'itemFactory' execution for expanded groups by checking created controls", function(assert){

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);

        var fnItemFactoryCallback = function (oContext) {

            return new VBox();
        };

        this.oPanel.setItemFactory(fnItemFactoryCallback);

        this.oPanel.setP13nModel(new JSONModel(oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel.setGroupExpanded("G2");

        this.oPanel._loopGroupList(function(oItem, sKey){

            //All Panels expanded --> all fields created
            assert.equal(oItem.getContent().length, 2, "Only required callbacks executed");

        });

    });

    QUnit.test("Check 'itemFactory' execution combined with filtering - panel not expaned while searching", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._getSearchField().setValue("Field 5");
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});

        this.oPanel._onSearchFieldLiveChange(oFakeEvent);

        assert.equal(this.oPanel._getInitializedGroups().length, 1, "Filter triggerd, but group not yet initialized");

        this.oPanel._loopGroupList(function(oItem, sKey){
            var oProp = this.oPanel.getP13nModel().getProperty(oItem.getBindingContext(this.oPanel.P13N_MODEL).sPath);
            var iExpectedLength = oProp.group === "G1" ? 2 : 1;

            assert.equal(oItem.getContent().length, iExpectedLength, "Only required callbacks executed");

        }.bind(this));
    });


    QUnit.test("Check 'itemFactory' execution combined with filtering - panel is expaned while searching", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel._getSearchField().setValue("Field 5");
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});

        this.oPanel.setGroupExpanded("G2");

        this.oPanel._onSearchFieldLiveChange(oFakeEvent);

        assert.equal(this.oPanel._getInitializedGroups().length, 2, "Filter triggerd - group initialized");

    });

    QUnit.test("Check method 'setGroupExpanded' ", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        var oSecondPanel = this.oPanel._oListControl.getItems()[1].getContent()[0];
        assert.ok(!oSecondPanel.getExpanded(), "Panel is initially collapsed");

        this.oPanel.setGroupExpanded("G2", true);
        assert.ok(oSecondPanel.getExpanded(), "Panel is expanded after manually triggering");

        this.oPanel.setGroupExpanded("G2");
        assert.ok(!oSecondPanel.getExpanded(), "Panel is collapsed when calling with 'undefined' as second parameter");

        this.oPanel.setGroupExpanded("G2", true);
        assert.ok(oSecondPanel.getExpanded(), "Panel is expanded after manually triggering");

        this.oPanel.setGroupExpanded("G2", false);
        assert.ok(!oSecondPanel.getExpanded(), "Panel is collapsed when calling with 'false'' as second parameter");
    });

    QUnit.test("Check 'getSelectedFields' - should only return selected fields", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        //Three existing items --> the amount of selected items should match the initially visible ones
        assert.equal(this.oPanel.getSelectedFields().length, this.oExistingMock.items.length, "Correct amount of selected items returned");

    });

    QUnit.test("Check toggle of 'allowFilterSelection' property", function(assert){

        this.oPanel.setAllowSelection(false);
        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        assert.equal(this.oPanel._oGroupModeSelect.getVisible(), false, "Group Select is not visible without selection");
		this.oPanel._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getContent()[0];
			var oInnerList = oPanel.getContent()[0];
            assert.equal(oInnerList.getMode(), "None", "List does not allow selection");
		});


        this.oPanel.setAllowSelection(true);

        assert.equal(this.oPanel._oGroupModeSelect.getVisible(), true, "Group Select is visible with selection");
		this.oPanel._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getContent()[0];
			var oInnerList = oPanel.getContent()[0];
            assert.equal(oInnerList.getMode(), "MultiSelect", "List does allow selection");
		});
    });

    QUnit.test("Check 'itemFactory' model propagation", function(assert){

        var oSecondModel = new JSONModel({
            data: [
                {
                    key: "k1",
                    text: "Some Test Text"
                }
            ]
        });

        var oTestFactory = new List({
            items: {
                path: "/data",
                name: "key",
                template: new CustomListItem({
                    content: new Text({
                        text: "{text}"
                    })
                }),
                templateShareable: false
            }
        });

        oTestFactory.setModel(oSecondModel);

        this.oPanel.setItemFactory(function(){

            return oTestFactory.clone();

        });

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        var aGroups = this.oPanel._oListControl.getItems();
        var oFirstGroup = aGroups[0].getContent()[0];
        var oFirstList = oFirstGroup.getContent()[0];

        //List created via template 'oTestFactory'
        var oCustomList = oFirstList.getItems()[0].getContent()[1];

        assert.equal(oCustomList.getItems().length, 1, "Custom template list has one item (oSecondModel, data)");
        assert.deepEqual(oCustomList.getModel(), oSecondModel, "Manual model propagated");
        assert.ok(oCustomList.getModel(this.oPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Inner panel p13n model propagated");

        assert.equal(oCustomList.getItems()[0].getContent()[0].getText(), "Some Test Text", "Custom binding from outside working in factory");

    });


    QUnit.test("Check view toggle", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        assert.equal(this.oPanel.getViewMode(), "group", "Group view is the default");

        this.oPanel.switchViewMode("group");
        assert.equal(this.oPanel.getViewMode(), "group", "Group view is unchanged");

        this.oPanel.switchViewMode("list");
        assert.equal(this.oPanel.getViewMode(), "list", "List view should be selected");

        this.oPanel.switchViewMode("group");
        assert.equal(this.oPanel.getViewMode(), "group", "List view should be selected");

    });

    QUnit.test("Check view toggle + search Field", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        assert.equal(this.oPanel.getViewMode(), "group", "Group view is the default");

        this.oPanel._sSearchString = "Some test";

        this.oPanel.switchViewMode("list");
        assert.equal(this.oPanel._getSearchField().getValue(), "Some test", "Search value remains");

        this.oPanel.switchViewMode("group");
        assert.equal(this.oPanel._getSearchField().getValue(), "Some test", "Search value remains");

    });

    QUnit.test("Throw an error for invalid view types", function (assert) {
        assert.throws(
            function () {
                this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
                this.oPanel.switchViewMode("Some invalid value");
            }.bind(this),
            function (oError) {
                return oError instanceof Error;
            },
            "Error has been raised as the parameter is a false value"
        );
    });

    QUnit.test("Check inner controls upon toggling the view", function (assert) {

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        this.oPanel.switchViewMode("list");
        assert.ok(this.oPanel._oListControl.isA("sap.m.Table"));

        this.oPanel.switchViewMode("group");
        assert.ok(this.oPanel._oListControl.isA("sap.m.List"));

    });

    QUnit.test("Check inner view storage", function(assert){

        //Check inner list creation
        assert.ok(this.oPanel._oReorderList.isA("sap.m.Table"));
        assert.ok(this.oPanel._oGroupList.isA("sap.m.List"));

        //Check _mView
        assert.ok(this.oPanel._mView[this.oPanel.GROUP_KEY].isA("sap.m.List"));
        assert.ok(this.oPanel._mView[this.oPanel.LIST_KEY].isA("sap.m.Table"));

        //Check that _mView has two entries by default
        assert.equal(Object.keys(this.oPanel._mView).length, 2, "Two views created by 'GroupPanelBase'");

        //Check amount of 'SegmentedButtonItem'
        assert.equal(this.oPanel._oViewSwitch.getItems().length, 2, "Two items by default");
    });

    QUnit.test("Check 'addCustomView'", function(assert){

        //add a custom view
        this.oPanel.addCustomView({
            item: new SegmentedButtonItem({
                key: "test",
                icon: "sap-icon://bar-chart"
            }),
            content: new List("myCustomList",{})
        });

        //Check that the UI has been enhanced
        assert.equal(Object.keys(this.oPanel._mView).length, 3, "A custom view has been added");
        assert.equal(this.oPanel._oViewSwitch.getItems().length, 3, "The item has been set on the view switch control");
    });

    QUnit.test("Check 'addCustomView' can be used via 'switchViewMode'", function(assert){

        //add a custom view
        this.oPanel.addCustomView({
            item: new SegmentedButtonItem({
                key: "test",
                icon: "sap-icon://bar-chart"
            }),
            content: new List("myCustomList",{})
        });

        this.oPanel.switchViewMode("test");

        assert.equal(this.oPanel.getViewMode(), "test", "Correct view has been selected");

        assert.equal(this.oPanel._oViewSwitch.getSelectedKey(), "test", "Correct item has been selected in the SegmentedButton");
    });

    QUnit.test("Check 'addCustomView' search callback execution", function(assert){
        var done = assert.async();

        //add a custom view
        this.oPanel.addCustomView({
            item: new SegmentedButtonItem({
                key: "test",
                icon: "sap-icon://bar-chart"
            }),
            content: new List("myCustomList",{}),
            search: function(sValue){
                assert.equal(sValue, "Test", "Callback executed with searched String");
                done();
            }
        });

        this.oPanel.switchViewMode("test");

        this.oPanel._getSearchField().setValue("Test");
        this.oPanel._getSearchField().fireLiveChange();
    });

    QUnit.test("Check 'addCustomView' view switch callback execution", function(assert){
        var done = assert.async();
        var oItem = new SegmentedButtonItem({
            key: "test",
            icon: "sap-icon://bar-chart"
        });

        //add a custom view
        this.oPanel.addCustomView({
            item: oItem,
            content: new List("myCustomList",{}),
            selectionChange: function(sKey){
                assert.equal(sKey, "test", "Callback executed with key");
                done();
            }
        });

        this.oPanel._oViewSwitch.fireSelectionChange({
            item: oItem
        });

    });

    QUnit.test("Check 'addCustomView' searchcallback on view switch execution", function (assert) {
        var done = assert.async();
        var oItem = new SegmentedButtonItem({
            key: "test",
            icon: "sap-icon://bar-chart"
        });
        //add a custom view
        this.oPanel.addCustomView({
            item: oItem,
            content: new List("myCustomList", {}),
            search: function (sSearch) {
                assert.equal(sSearch, "Test", "Callback executed with key");
                done();
            }
        });
        this.oPanel._getSearchField().setValue("Test");
        this.oPanel._oViewSwitch.fireSelectionChange({
            item: oItem
        });
    });

    QUnit.test("Check 'addCustomView' error if no key is provided", function(assert){

        assert.throws(
            function () {
                this.oPanel.addCustomView({
                    item: new SegmentedButtonItem({
                        icon: "sap-icon://bar-chart"
                    }),
                    content: new List("myCustomList",{}),
                    selectionChange: function(sKey){
                    }
                });
            },
            function (oError) {
                return (
                    oError instanceof Error &&
                    oError.message ===
                        "Please provide an item of type sap.m.SegmentedButtonItem with a key"
                );
            },
            "An error should be thrown if no item is provided or if the key is missing"
        );

    });

    QUnit.module("'GroupPanelBase' instance with a custom model name",{
        beforeEach: function() {
            this.oPanel = new GroupPanelBase();

            this.oPanel.P13N_MODEL = "$My_very_own_model";

            this.oExistingMock = oMockExisting;
            this.aMockInfo = aInfoData;
            this.oPanel.setItemFactory(function(){
                return new CustomListItem({
                    //Check both ways, one time via P13N_MODEL, one time hard coded
                    selected: "{" + this.oPanel.P13N_MODEL + ">selected}",
                    visible: "{" + "$My_very_own_model" + ">visibleInDialog}"
                });
            }.bind(this));

            this.oPropertyHelper = new PropertyHelper(this.aMockInfo);
            this.oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.oPropertyHelper);

            this.oPanel.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();

        },
        afterEach: function() {
            this.oPanel.destroy();
        }
    });

    QUnit.test("Instantiate panel and check model", function(assert){
        assert.ok(this.oPanel, "Panel created");
        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        this.oPanel.switchViewMode("group");

        assert.ok(this.oPanel.getP13nModel().isA("sap.ui.model.json.JSONModel"), "Model has been set");
        assert.ok(!this.oPanel.getModel("$p13n"), "The default $p13n model has not been set");
        assert.ok(this.oPanel.getModel("$My_very_own_model").isA("sap.ui.model.json.JSONModel"), "Model has been set");
    });

    QUnit.test("Check item creation with a custom model", function(assert){
        fnCheckListCreation.call(this, assert);

    });

});

/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/p13n/panels/GroupPanelBase",
    "sap/ui/mdc/p13n/P13nBuilder",
    "sap/ui/model/json/JSONModel",
    "sap/m/CustomListItem",
    "sap/m/Toolbar",
    "sap/ui/base/Event"
], function(GroupPanelBase, P13nBuilder, JSONModel, CustomListItem, Toolbar, Event) {
    "use strict";

    QUnit.module("API Tests", {
        beforeEach: function(){
            this.sDefaultGroup = "BASIC";
            this.oExistingMock = {
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
            this.aMockInfo = [
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
            this.oPanel = new GroupPanelBase({
                footerToolbar: new Toolbar("ID_TB1",{})
            });

            this.oPanel.setItemFactory(function(){
                return new CustomListItem({
                    selected: "{selected}",
                    visible: "{visibleInDialog}"
                });
            });

            this.oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);

            this.oPanel.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function(){
            this.sDefaultGroup = null;
            this.oExistingMock = null;
            this.oP13nData = null;
            this.aMockInfo = null;
            this.oPanel.destroy();
        }
    });

    QUnit.test("check instantiation", function(assert){
        assert.ok(this.oPanel, "Panel created");
        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));
        assert.ok(this.oPanel.getModel().isA("sap.ui.model.json.JSONModel"), "Model has been set");
    });

    QUnit.test("Check Outer and Inner List creation", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));

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
    });

    QUnit.test("Check Search implementation", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));

        this.oPanel._getSearchField().setValue("Field 5");
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});

        this.oPanel._onSearchFieldLiveChange(oFakeEvent);

        var oOuterList = this.oPanel._oListControl;
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
    });

    QUnit.test("Check Search implementation - also for ToolTip", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));

        this.oPanel._getSearchField().setValue("Some Tooltip");
        var oFakeEvent = new Event("liveSearch", this.oPanel._getSearchField(), {});

        this.oPanel._onSearchFieldLiveChange(oFakeEvent);

        var oOuterList = this.oPanel._oListControl;
        assert.equal(oOuterList.getItems()[0].getVisible(), false, "Panel is invisible since no items are available");
        assert.equal(oOuterList.getItems()[1].getVisible(), true, "Panel is visible since items are available");
    });

    QUnit.test("Check Search implementation in combination with 'grou mode' Select", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));

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

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);
        this.oPanel.setP13nModel(new JSONModel(oP13nData));

        assert.equal(this.oPanel._oListControl.getVisibleItems().length, 2, "All groups visible");

        oP13nData.itemsGrouped[0].items.forEach(function(oItem){
            oItem.visibleInDialog = false;
        });

        this.oPanel.setP13nModel(new JSONModel(oP13nData));

        assert.equal(this.oPanel._oListControl.getVisibleItems().length, 1, "Only necessary groups visible");

    });

    QUnit.test("Check method 'setGroupExpanded' ", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));

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


    QUnit.test("Check 'onReset' Button visibility", function(assert){

        assert.ok(!this.oPanel._oResetBtn.getVisible(), "No handler --> No Reset button");

        this.oPanel.setOnReset(function(){});

        assert.ok(this.oPanel._oResetBtn.getVisible(), "Once handler is provided, Button is visible");
    });

    QUnit.test("Check 'getSelectedFields' - should only return selected fields", function(assert){

        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));

        //Three existing items --> the amount of selected items should match the initially visible ones
        assert.equal(this.oPanel.getSelectedFields().length, this.oExistingMock.items.length, "Correct amount of selected items returned");

    });

    QUnit.test("Check toggle of 'allowFilterSelection' property", function(assert){

        this.oPanel.setAllowSelection(false);
        this.oPanel.setP13nModel(new JSONModel(this.oP13nData));

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

});

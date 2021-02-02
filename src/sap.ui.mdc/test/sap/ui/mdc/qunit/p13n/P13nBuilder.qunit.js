/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/p13n/P13nBuilder",
    "sap/ui/mdc/p13n/panels/BasePanel",
    "sap/ui/model/json/JSONModel"
], function(P13nBuilder, BasePanel, JSONModel) {
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
                    label: "Field 1"
                },
                {
                    name: "key2",
                    label: "Field 2"
                },
                {
                    name: "key3",
                    label: "Field 3"
                },
                {
                    name: "key4",
                    label: "Field 4"
                },
                {
                    name: "key5",
                    label: "Field 5"
                },
                {
                    name: "key6",
                    label: "Field 6"
                }
            ];
        },
        afterEach: function(){
            this.sDefaultGroup = null;
            this.oExistingMock = null;
            this.aMockInfo = null;
        }
    });

    QUnit.test("Test prepareP13nData - return object with two keys", function(assert){
        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);
        assert.ok(oP13nData.items instanceof Array, "Flat structure created");
        assert.ok(oP13nData.itemsGrouped instanceof Array, "Group structure created");

        assert.equal(oP13nData.items.length, this.aMockInfo.length, "correct amount of items created");
        assert.equal(oP13nData.itemsGrouped.length, 1, "No group info provided - only one group created");
        assert.equal(oP13nData.itemsGrouped[0].group, this.sDefaultGroup  , "All items are in group 'BASIC' as there is no group information provided");
        assert.equal(oP13nData.itemsGrouped[0].items.length, this.aMockInfo.length  , "All items are in group 'BASIC' as there is no group information provided");
    });

    QUnit.test("Test prepareP13nData - check optional ignoring", function(assert){
        this.aMockInfo[0]["someRandomAttribute"] = true;

        var bIgnore = false;

        var fnIgnore = function(oItem, oInfo) {
            //returned boolean decides the validity of the property
            return !(oInfo.someRandomAttribute === bIgnore);
        };

        //Ignore criteria not met
        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo, fnIgnore);
        assert.equal(oP13nData.items.length, this.aMockInfo.length, "correct amount of items created");

        //Ignore criteria met
        bIgnore = true;
        oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo, fnIgnore);
        assert.equal(oP13nData.items.length, this.aMockInfo.length - 1, "correct amount of items created");
    });

    QUnit.test("Test prepareP13nData - check grouping", function(assert){
        this.aMockInfo[0]["group"] = "Group2";
        this.aMockInfo[3]["group"] = "Group2";

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);
        assert.equal(oP13nData.itemsGrouped.length, 2, "Additional group created");
        assert.equal(oP13nData.itemsGrouped[1].items.length, this.aMockInfo.length - 2, "Basic group includes less items");
        assert.equal(oP13nData.itemsGrouped[0].items.length, 2, "Second group includes the rest");
    });

    QUnit.test("Test createP13nPopover", function(assert){

        var done = assert.async();

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);
        var oModel = new JSONModel(oP13nData);
        var oPanel = new BasePanel(oPanel);

        oPanel.setP13nModel(oModel);

       P13nBuilder.createP13nPopover(oPanel, {
            title: "Test"
        }).then(function(oPopover){
            assert.ok(oPopover.isA("sap.m.ResponsivePopover"), "Correct container control created");
            assert.ok(oPopover.getContent()[0].isA("sap.ui.mdc.p13n.panels.BasePanel"), "correct Content provided");
            assert.equal(oPopover.getTitle(), "Test");

            oPopover.destroy();

            done();
        });

    });

    QUnit.test("Test createP13nDialog", function(assert){

        var done = assert.async();

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);
        var oModel = new JSONModel(oP13nData);
        var oPanel = new BasePanel(oPanel);

        oPanel.setP13nModel(oModel);

        P13nBuilder.createP13nDialog(oPanel, {
            title: "Test",
            id: "myTestDialog"
        }).then(function(oDialog){
            assert.ok(oDialog.getId(), "myTestDialog");
            assert.ok(oDialog.isA("sap.m.Dialog"), "Correct container control created");
            assert.ok(oDialog.getContent()[0].isA("sap.ui.mdc.p13n.panels.BasePanel"), "correct Content provided");
            assert.equal(oDialog.getTitle(), "Test");

            oDialog.destroy();

            done();
        });

    });

    QUnit.test("Test createP13nDialog with reset included", function(assert){

        var done = assert.async();

        var oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);
        var oModel = new JSONModel(oP13nData);
        var oPanel = new BasePanel(oPanel);

        oPanel.setP13nModel(oModel);

        P13nBuilder.createP13nDialog(oPanel, {
            title: "Test",
            reset: {
                onExecute: function() {
                    //Control specific reset handling
                }
            },
            id: "myTestDialog"
        }).then(function(oDialog){
            assert.ok(oDialog.getCustomHeader(), "Custom Header provided");
            assert.equal(oDialog.getCustomHeader().getContentLeft()[0].getText(), "Test", "Title provided");
            assert.ok(oDialog.getCustomHeader().getContentRight()[0].isA("sap.m.Button"), "Reset Button provided");

            oDialog.destroy();

            done();
        });

    });

});

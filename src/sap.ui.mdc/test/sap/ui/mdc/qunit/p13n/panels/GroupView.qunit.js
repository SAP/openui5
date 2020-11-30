/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/p13n/panels/GroupView",
    "sap/ui/mdc/p13n/P13nBuilder",
    "sap/ui/model/json/JSONModel",
    "sap/ui/mdc/util/PropertyHelper",
    "sap/m/VBox"
], function(GroupView, P13nBuilder, JSONModel, PropertyHelper, VBox) {
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
            this.oExistingMock = oMockExisting;
            this.aMockInfo = aInfoData;
            this.oGroupView = new GroupView();

            this.oGroupView.setItemFactory(function(){
                return new VBox();
            });

			this.oPropertyHelper = new PropertyHelper(this.aMockInfo);
            this.oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.aMockInfo);

            this.oGroupView.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function(){
            this.sDefaultGroup = null;
            this.oExistingMock = null;
            this.oP13nData = null;
            this.aMockInfo = null;
            this.oGroupView.destroy();
        }
    });

    QUnit.test("check instantiation", function(assert){
        assert.ok(this.oGroupView, "Panel created");
        this.oGroupView.setP13nModel(new JSONModel(this.oP13nData));
        assert.ok(this.oGroupView.getModel(this.oGroupView.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
    });

    var fnCheckListCreation = function(assert) {
        this.oGroupView.setP13nModel(new JSONModel(this.oP13nData));

        var oOuterList = this.oGroupView._oListControl;
        assert.ok(oOuterList.isA("sap.m.ListBase"), "Inner control is a list");
        assert.ok(oOuterList.isA("sap.m.ListBase"), "Inner control is a list");

        assert.equal(oOuterList.getItems().length, 2, "2 Groups created");

        var oFirstInnerList = oOuterList.getItems()[0].getCells()[0].getContent()[0];
        assert.equal(oFirstInnerList.getItems().length, 3, "First inner list contains 3 items");
        assert.ok(oFirstInnerList.getItems()[0].isA("sap.m.CustomListItem"), "Item matches provided factory function");

        var oSecondInnerList = oOuterList.getItems()[1].getCells()[0].getContent()[0];
        assert.equal(oSecondInnerList.getItems().length, 3, "Second inner list contains 3 items");
        assert.ok(oSecondInnerList.getItems()[0].isA("sap.m.CustomListItem"), "Item matches provided factory function");
    };

    QUnit.test("Check Outer and Inner List creation", function(assert){
        fnCheckListCreation.call(this, assert);
    });
});

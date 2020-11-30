/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/p13n/panels/ListView",
    "sap/ui/mdc/p13n/P13nBuilder",
    "sap/ui/model/json/JSONModel",
    "sap/ui/mdc/util/PropertyHelper",
    "sap/m/VBox"
], function(ListView, P13nBuilder, JSONModel, PropertyHelper, VBox) {
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
            this.oListView = new ListView();

            this.oListView.setItemFactory(function(){
                return new VBox();
            });

			this.oPropertyHelper = new PropertyHelper(this.aMockInfo);
            this.oP13nData = P13nBuilder.prepareP13nData(this.oExistingMock, this.oPropertyHelper.getProperties());

            this.oListView.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
        },
        afterEach: function(){
            this.sDefaultGroup = null;
            this.oExistingMock = null;
            this.oP13nData = null;
            this.aMockInfo = null;
            this.oListView.destroy();
            this.oPropertyHelper.destroy();
        }
    });

    QUnit.test("check instantiation", function(assert){
        assert.ok(this.oListView, "Panel created");
        this.oListView.setP13nModel(new JSONModel(this.oP13nData));
        assert.ok(this.oListView.getModel(this.oListView.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
    });

});

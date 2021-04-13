/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/QueryPanel",
    "sap/ui/model/json/JSONModel"
], function (QueryPanel, JSONModel) {
	"use strict";

	QUnit.module("QueryPanel API tests", {
		beforeEach: function(){
			this.oQueryPanel = new QueryPanel();
			var oModel = new JSONModel({
				items: [
                    {
                        name: "key1",
                        selected: true
                    },
                    {
                        name: "key2",
                        selected: true
                    },
                    {
                        name: "key3",
                        selected: false
                    },
                    {
                        name: "key4",
                        selected: false
                    }
				],
                presenceAttribute: "selected"
			});
			this.oQueryPanel.setP13nModel(oModel);
			this.oQueryPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function(){
			this.oQueryPanel.destroy();
		}
	});

	QUnit.test("instantiate QueryPanel", function(assert){
        assert.ok(this.oQueryPanel);
	});

    QUnit.test("Check initial row amount", function(assert){
        assert.equal(this.oQueryPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row created");
        assert.equal(this.oQueryPanel._oListControl.getItems()[0].getContent()[0].getItems()[0].getSelectedKey(), "key1", "correct key set");
        assert.equal(this.oQueryPanel._oListControl.getItems()[1].getContent()[0].getItems()[0].getSelectedKey(), "key2", "correct key set");
        assert.equal(this.oQueryPanel._oListControl.getItems()[2].getContent()[0].getItems()[0].getSelectedKey(), "$_none", "correct key set");
	});

    QUnit.test("Check '_addQueryRow'", function(assert){
        var oNewRow = this.oQueryPanel._addQueryRow({name: "key4"});
        assert.ok(oNewRow.isA("sap.m.CustomListItem"), "New Row created");
        assert.equal(oNewRow.getContent()[0].getItems()[0].getSelectedKey(), "key4", "correct key set");
	});

    QUnit.test("Check 'getP13nState'", function(assert){
        var aP13nState = this.oQueryPanel.getP13nState();

        assert.equal(aP13nState.length, 2, "$_none is not part of the p13n state object (3-1 = 2)");
        assert.equal(aP13nState[0].name, "key1", "correct key in correct position provided");
        assert.equal(aP13nState[1].name, "key2", "correct key in correct position provided");
	});

    QUnit.test("Check 'getP13nState' after reordering items (order should change)", function(assert){

        var oMovedItem = this.oQueryPanel._oListControl.getItems()[0];
        this.oQueryPanel._moveTableItem(oMovedItem, 1); //Move from 0 to 1

        var aP13nState = this.oQueryPanel.getP13nState();

        assert.equal(aP13nState.length, 2, "$_none is not part of the p13n state object (3-1 = 2)");

        //the order in the retrieved state should change accordingly
        assert.equal(aP13nState[0].name, "key2", "correct key in correct position provided");
        assert.equal(aP13nState[1].name, "key1", "correct key in correct position provided");
	});

    QUnit.test("Check 'change' event from '_createKeySelect'", function(assert){

        var oFirstItem = this.oQueryPanel._oListControl.getItems()[0];
        var oSelectFromFirstItem = oFirstItem.getContent()[0].getItems()[0];

        oSelectFromFirstItem.fireChange({
            selectedItem: oSelectFromFirstItem.getItems()[3] //Select 'key3' instead of 'key1'
        });

        var aNewState = [
            {name: "key3", selected: true},
            {name: "key2", selected: true}
        ];

        assert.equal(this.oQueryPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row remain");
        assert.deepEqual(this.oQueryPanel.getP13nState(), aNewState, "The state has been updated correctly");
	});

    QUnit.test("Check that new row gets added if last item us updated", function(assert){

        var oNoneItem = this.oQueryPanel._oListControl.getItems()[2];
        var oSelectFromFirstItem = oNoneItem.getContent()[0].getItems()[0];

        oSelectFromFirstItem.fireChange({
            selectedItem: oSelectFromFirstItem.getItems()[4] //Select 'key4' instead of '(none)'
        });

        var aNewState = [
            {name: "key1", selected: true},
            {name: "key2", selected: true},
            {name: "key4", selected: true}
        ];

        assert.equal(this.oQueryPanel._oListControl.getItems().length, 4, "two initial rows +1 p13n created row + 1 empty new added row");
        assert.deepEqual(this.oQueryPanel.getP13nState(), aNewState, "The state has been updated correctly");
	});

    QUnit.test("Check that 'remove' updates the state accordingly", function(assert){

        var oFirstItem = this.oQueryPanel._oListControl.getItems()[0]; //key1
        var oFirstItemRemoveBtn = oFirstItem.getContent()[0].getItems()[1].getItems()[0]; //remove button for '   key1'

        oFirstItemRemoveBtn.firePress({});

        var aNewState = [
            {name: "key2", selected: true}
        ];

        assert.equal(this.oQueryPanel._oListControl.getItems().length, 2, "two initial rows -1 p13n removed row + 1 empty row");
        assert.deepEqual(this.oQueryPanel.getP13nState(), aNewState, "The state has been updated correctly");
	});

});

/* global QUnit */
sap.ui.define([
	"sap/m/p13n/QueryPanel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function (QueryPanel, JSONModel, oCore) {
	"use strict";

	QUnit.module("QueryPanel API tests", {
		beforeEach: function(){
			this.oQueryPanel = new QueryPanel();
			this.oQueryPanel.setP13nData([
				{
					name: "key1",
					visible: true
				},
				{
					name: "key2",
					visible: true
				},
				{
					name: "key3",
					visible: false
				},
				{
					name: "key4",
					visible: false
				}
			]);
			this.oQueryPanel.placeAt("qunit-fixture");
			oCore.applyChanges();
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
		assert.equal(this.oQueryPanel._oListControl.getItems()[0].getContent()[0].getContent()[0].getSelectedKey(), "key1", "correct key set");
		assert.equal(this.oQueryPanel._oListControl.getItems()[1].getContent()[0].getContent()[0].getSelectedKey(), "key2", "correct key set");
		assert.equal(this.oQueryPanel._oListControl.getItems()[2].getContent()[0].getContent()[0].getSelectedKey(), "", "correct key set");
	});

	QUnit.test("Check '_addQueryRow'", function(assert){
		var oNewRow = this.oQueryPanel._addQueryRow({name: "key4"});
		assert.ok(oNewRow.isA("sap.m.CustomListItem"), "New Row created");
		assert.equal(oNewRow.getContent()[0].getContent()[0].getSelectedKey(), "key4", "correct key set");
	});

	QUnit.test("Check 'getP13nData'", function(assert){
		var aP13nState = this.oQueryPanel.getP13nData(true);

		assert.equal(aP13nState.length, 2, "empty selectedKey is not part of the p13n state object (3-1 = 2)");
		assert.equal(aP13nState[0].name, "key1", "correct key in correct position provided");
		assert.equal(aP13nState[1].name, "key2", "correct key in correct position provided");
	});

	QUnit.test("Check 'getP13nData' after reordering items (order should change)", function(assert){

		var oMovedItem = this.oQueryPanel._oListControl.getItems()[0];
		this.oQueryPanel._moveTableItem(oMovedItem, 1); //Move from 0 to 1

		var aP13nState = this.oQueryPanel.getP13nData(true);

		assert.equal(aP13nState.length, 2, "empty selectedKey is not part of the p13n state object (3-1 = 2)");

		//the order in the retrieved state should change accordingly
		assert.equal(aP13nState[0].name, "key2", "correct key in correct position provided");
		assert.equal(aP13nState[1].name, "key1", "correct key in correct position provided");

		//check full state (also non present)
		assert.deepEqual(this.oQueryPanel.getP13nData(), [
			{
				name: "key2",
				visible: true
			},
			{
				name: "key1",
				visible: true
			},
			{
				name: "key3",
				visible: false
			},
			{
				name: "key4",
				visible: false
			}
		], "The state has been updated correctly");
	});

	QUnit.test("Reordering is disabled for the last row", function(assert){

		var oMovedItem = this.oQueryPanel._oListControl.getItems()[2];
		this.oQueryPanel._moveTableItem(oMovedItem, 0); //Move from 0 to 1

		var aP13nState = this.oQueryPanel.getP13nData(true);

		//the order has not changed as the last row has been tried to move
		assert.equal(aP13nState[0].name, "key1", "correct key in correct position provided");
		assert.equal(aP13nState[1].name, "key2", "correct key in correct position provided");

		//check full state (also non present)
		assert.deepEqual(this.oQueryPanel.getP13nData(), [
			{
				name: "key1",
				visible: true
			},
			{
				name: "key2",
				visible: true
			},
			{
				name: "key3",
				visible: false
			},
			{
				name: "key4",
				visible: false
			}
		], "The state has been updated correctly");
	});

	QUnit.test("Check 'change' event from '_createKeySelect'", function(assert){

		var oFirstItem = this.oQueryPanel._oListControl.getItems()[0];
		var oKeySelected = oFirstItem.getContent()[0].getContent()[0];

		oKeySelected.setSelection(oKeySelected.getItems()[2]);
		oKeySelected.fireSelectionChange({
			selectedItem: oKeySelected.getItems()[2] //key1 --> key3
		});
		oKeySelected.fireChange({
			newValue: oKeySelected.getItems()[2].getKey() //key1 --> key3
		});


		var aNewState = [
			{name: "key3", visible: true},
			{name: "key2", visible: true}
		];

		assert.equal(this.oQueryPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row remain");
		assert.deepEqual(this.oQueryPanel.getP13nData(true), aNewState, "The state has been updated correctly");
	});

	QUnit.test("Check that new row gets added if last item us updated", function(assert){

		var oNoneItem = this.oQueryPanel._oListControl.getItems()[2];
		var oKeySelected = oNoneItem.getContent()[0].getContent()[0];

		oKeySelected.setSelection(oKeySelected.getItems()[3]);
		oKeySelected.fireSelectionChange({
			selectedItem: oKeySelected.getItems()[3] //key1 --> key4
		});
		oKeySelected.fireChange({
			newValue: oKeySelected.getItems()[3].getKey() //key1 --> key4
		});


		var aNewState = [
			{name: "key1", visible: true},
			{name: "key2", visible: true},
			{name: "key4", visible: true}
		];

		assert.equal(this.oQueryPanel._oListControl.getItems().length, 4, "two initial rows +1 p13n created row + 1 empty new added row");
		assert.deepEqual(this.oQueryPanel.getP13nData(true), aNewState, "The state has been updated correctly");

		//check full state (also non present)
		assert.deepEqual(this.oQueryPanel.getP13nData(), [
			{
				name: "key1",
				visible: true
			},
			{
				name: "key2",
				visible: true
			},
			{
				name: "key4",
				visible: true
			},
			{
				name: "key3",
				visible: false
			}
		], "The state has been updated correctly");
	});

	QUnit.test("Check that 'remove' updates the state accordingly", function(assert){

		var oFirstItem = this.oQueryPanel._oListControl.getItems()[0]; //key1
		var oFirstItemRemoveBtn = oFirstItem.getContent()[0].getContent()[1].getItems()[0]; //remove button for 'key1'

		oFirstItemRemoveBtn.firePress({});

		var aNewState = [
			{name: "key2", visible: true}
		];

		assert.equal(this.oQueryPanel._oListControl.getItems().length, 2, "two initial rows -1 p13n removed row + 1 empty row");
		assert.deepEqual(this.oQueryPanel.getP13nData(true), aNewState, "The state has been updated correctly");
	});

	QUnit.test("Check that 'remove' updates the focus to the last row", function(assert){

		var oFirstItem = this.oQueryPanel._oListControl.getItems()[0]; //key1
		var oFirstItemRemoveBtn = oFirstItem.getContent()[0].getContent()[1].getItems()[0]; //remove button for 'key1'

		oFirstItemRemoveBtn.firePress({});

		var oSelectOfNewRow = this.oQueryPanel._oListControl.getItems()[1].getContent()[0].getContent()[0];
		var nActiveElement = document.activeElement;

		assert.ok(oSelectOfNewRow.getFocusDomRef() === nActiveElement, "The select control is focused");
	});

	QUnit.test("Check 'queryLimit' when setting more items than allowed", function(assert){

		//Limit query amount to max 1
		this.oQueryPanel.setQueryLimit(1);

		//set data which provides more than 1 query allowed
		this.oQueryPanel.setP13nData([
			{
				name: "key1",
				visible: true
			},
			{
				name: "key2",
				visible: true
			},
			{
				name: "key3",
				visible: false
			},
			{
				name: "key4",
				visible: false
			}
		]);

		assert.equal(this.oQueryPanel._oListControl.getItems().length, 2, "Two items in the panel");
		assert.ok(this.oQueryPanel._oListControl.getItems()[0].getContent()[0].getContent()[0].getEnabled(), "The first select control is enabled");//First select control is enabled
		assert.notOk(this.oQueryPanel._oListControl.getItems()[1].getContent()[0].getContent()[0].getEnabled(), "The second select control is disabled");//Higher rows than the query limit are disabled
	});
});

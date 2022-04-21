/* global QUnit */
sap.ui.define([
	"sap/m/p13n/SortPanel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function (SortPanel, JSONModel, oCore) {
	"use strict";

	QUnit.module("SortPanel API tests", {
		beforeEach: function(){
			this.oSortPanel = new SortPanel();
			this.oSortPanel.setP13nData([
				{
					name: "key1",
					sorted: true,
					descending: false
				},
				{
					name: "key2",
					sorted: true,
					descending: false
				},
				{
					name: "key3",
					sorted: false,
					descending: false
				},
				{
					name: "key4",
					sorted: false,
					descending: false
				}
			]);
			this.oSortPanel.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function(){
			this.oSortPanel.destroy();
		}
	});

	QUnit.test("instantiate SortPanel", function(assert){
		assert.ok(this.oSortPanel);
	});

	QUnit.test("Check initial sortrow amount", function(assert){
		assert.equal(this.oSortPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row created");
		assert.equal(this.oSortPanel._oListControl.getItems()[0].getContent()[0].getContent()[0].getSelectedKey(), "key1", "correct key set");
		assert.equal(this.oSortPanel._oListControl.getItems()[1].getContent()[0].getContent()[0].getSelectedKey(), "key2", "correct key set");
		assert.equal(this.oSortPanel._oListControl.getItems()[2].getContent()[0].getContent()[0].getSelectedKey(), "", "correct key set");
	});


	QUnit.test("Check sort switch (ascending <> descending)", function(assert){
		var oFirstSortRow = this.oSortPanel._oListControl.getItems()[0]; //key1
		var oSegmentedButton = oFirstSortRow.getContent()[0].getContent()[1];
		var oSortOrderText = oFirstSortRow.getContent()[0].getContent()[2];

		//check initial state
		assert.equal(oSortOrderText.getText(), "Ascending", "Correct sort order text");
		var aSortState = [
			{name: "key1", sorted: true, descending: false},
			{name: "key2", sorted: true, descending: false}
		];
		assert.deepEqual(this.oSortPanel.getP13nData(true), aSortState, "Correct sort state");

		//Change sort order of 'key1' to descending
		oSegmentedButton.fireSelect({
			key: "desc"
		});
		assert.equal(oSortOrderText.getText(), "Descending", "Correct sort order text");
		var aNewSortState = [
			{name: "key1", sorted: true, descending: true},
			{name: "key2", sorted: true, descending: false}
		];
		assert.deepEqual(this.oSortPanel.getP13nData(true), aNewSortState, "Correct sort state");

	});

	QUnit.test("Check that key change does not reset 'descending'", function(assert){
		var oFirstSortRow = this.oSortPanel._oListControl.getItems()[0]; //key1
		var oKeySelected = oFirstSortRow.getContent()[0].getContent()[0];
		var oSegmentedButton = oFirstSortRow.getContent()[0].getContent()[1];
		var oSortOrderText = oFirstSortRow.getContent()[0].getContent()[2];

		//check initial state
		assert.equal(oSortOrderText.getText(), "Ascending", "Correct sort order text");
		var aSortState = [
			{name: "key1", sorted: true, descending: false},
			{name: "key2", sorted: true, descending: false}
		];
		assert.deepEqual(this.oSortPanel.getP13nData(true), aSortState, "Correct sort state");

		// 1) Change sort order of 'key1' to descending
		oSegmentedButton.fireSelect({
			key: "desc"
		});
		oSegmentedButton.setSelectedKey("desc");

		oKeySelected.setSelection(oKeySelected.getItems()[2]);

		// 2) Change the key of the same row (but the SegmentedButton is still 'descending')
		oKeySelected.fireSelectionChange({
			selectedItem: oKeySelected.getItems()[2] //key1 --> key3
		});
		oKeySelected.fireChange({
			newValue: oKeySelected.getItems()[2].getKey() //key1 --> key3
		});


		var aNewSortState = [
			{name: "key3", sorted: true, descending: true},// --> descending has been kept (!)
			{name: "key2", sorted: true, descending: false}
		];

		assert.deepEqual(this.oSortPanel.getP13nData(true), aNewSortState, "Correct sort state");
	});
});

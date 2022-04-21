/* global QUnit */
sap.ui.define([
	"sap/m/p13n/GroupPanel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function (GroupPanel, JSONModel, oCore) {
	"use strict";

	QUnit.module("GroupPanel API tests", {
		beforeEach: function(){
			this.oGroupPanel = new GroupPanel({
				enableShowField: true
			});
			this.oGroupPanel.setP13nData([
				{
					name: "key1",
					grouped: true,
					showIfGrouped: true
				},
				{
					name: "key2",
					grouped: true,
					showIfGrouped: true
				},
				{
					name: "key3",
					grouped: false,
					showIfGrouped: true
				},
				{
					name: "key4",
					grouped: false,
					showIfGrouped: true
				}
			]);
			this.oGroupPanel.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function(){
			this.oGroupPanel.destroy();
		}
	});

	QUnit.test("instantiate GroupPanel", function(assert){
		assert.ok(this.oGroupPanel);
	});

	QUnit.test("Check initial grouprow amount", function(assert){
		assert.equal(this.oGroupPanel._oListControl.getItems().length, 3, "two initial rows + 1 empty row created");
		assert.equal(this.oGroupPanel._oListControl.getItems()[0].getContent()[0].getContent()[0].getSelectedKey(), "key1", "correct key set");
		assert.equal(this.oGroupPanel._oListControl.getItems()[1].getContent()[0].getContent()[0].getSelectedKey(), "key2", "correct key set");
		assert.equal(this.oGroupPanel._oListControl.getItems()[2].getContent()[0].getContent()[0].getSelectedKey(), "", "correct key set");
	});

	QUnit.test("Check 'showIfGrouped' toggle'", function(assert){
		var oFirstGroupRow = this.oGroupPanel._oListControl.getItems()[0]; //key1
		var oCheckBox = oFirstGroupRow.getContent()[0].getContent()[1].getItems()[0];

		//check initial state
		var aGroupState = [
			{name: "key1", grouped: true, showIfGrouped: true},
			{name: "key2", grouped: true, showIfGrouped: true}
		];
		assert.deepEqual(this.oGroupPanel.getP13nData(true), aGroupState, "Correct group state");

		//Change sort order of 'key1' to descending
		oCheckBox.fireSelect({
			selected: false
		});

		var aNewGroupState = [
			{name: "key1", grouped: true, showIfGrouped: false}, // --> should be updated accordingly in the data
			{name: "key2", grouped: true, showIfGrouped: true}
		];
		assert.deepEqual(this.oGroupPanel.getP13nData(true), aNewGroupState, "Correct group state");

	});
});

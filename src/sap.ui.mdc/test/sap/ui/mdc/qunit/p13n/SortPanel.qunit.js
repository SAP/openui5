/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/SortPanel", "sap/ui/model/json/JSONModel"
], function (SortPanel, JSONModel) {
	"use strict";

	this.oSortPanel = new SortPanel();
	var oModel = new JSONModel({
		items: [
			{
				label: "Test",
				name: "test",
				selected: true,
				sortOrder: "Ascending"
			},
			{
				label: "Test2",
				name: "test2",
				selected: false,
				sortOrder: "Ascending"
			},
			{
				label: "Test3",
				name: "test3",
				selected: false,
				sortOrder: "Ascending"
			}
		]
	});
	this.oSortPanel.setModel(oModel);
	this.oSortPanel.setPanelColumns(["Name", "Sort Order"]);
	this.oSortPanel.placeAt("qunit-fixture");
	sap.ui.getCore().applyChanges();

	QUnit.module("SelectionPanel API tests", {
		beforeEach: function(){
		},
		afterEach: function(){
		}
	});

	QUnit.test("instantiate SelectionPanel", function(assert){
		var done = assert.async();
		assert.ok(this.oSortPanel);

		//check if the change event has been fired
		this.oSortPanel.attachEvent("change", function(oEvent){
			assert.ok(oEvent, "change event has been fired");
			done();
		});

		//fire the change event which is being used for the change of sort order
		this.oSortPanel._oListControl.getItems()[0].getCells()[1].fireChange({selectedItem:this.oSortPanel._oListControl.getItems()[0]});
	}.bind(this));

});

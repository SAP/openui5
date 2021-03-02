/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/SortPanel", "sap/ui/model/json/JSONModel"
], function (SortPanel, JSONModel) {
	"use strict";

	QUnit.module("SelectionPanel API tests", {
		beforeEach: function(){
			this.oSortPanel = new SortPanel();
			var oModel = new JSONModel({
				items: [
					{
						label: "Test",
						name: "test",
						sorted: true,
						descending: false
					},
					{
						label: "Test2",
						name: "test2",
						sorted: false,
						descending: false
					},
					{
						label: "Test3",
						name: "test3",
						sorted: false,
						descending: false
					}
				]
			});
			this.oSortPanel.setP13nModel(oModel);
			this.oSortPanel.setPanelColumns(["Name", "Sort Order"]);
			this.oSortPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function(){
			this.oSortPanel.destroy();
		}
	});

	QUnit.test("instantiate SelectionPanel - check that sortorder 'Select' control fires a change event", function(assert){
		var done = assert.async();
		assert.ok(this.oSortPanel);

		//check if the change event has been fired
		this.oSortPanel.attachEvent("change", function(oEvent){
			assert.ok(oEvent, "change event has been fired");
			done();
		});

		//fire the change event which is being used for the change of sort order maunally
		this.oSortPanel._oListControl.getItems()[0].getCells()[1].fireChange({

			//Select control instance
			selectedItem: this.oSortPanel._oListControl.getItems()[0].getCells()[1].getItems()[1]
		});
	});

	QUnit.test("Check change in 'sortOrder' - model should keep a boolean (and not a string)", function(assert){

		var done = assert.async();
		assert.ok(this.oSortPanel);

		//check if the change event has been fired
		this.oSortPanel.attachEvent("change", function(oEvent){
			assert.ok(typeof this.oSortPanel.getP13nModel().getProperty("/items")[0].descending == "boolean", "'Descending' is still a boolean after the change");
			assert.ok(this.oSortPanel.getP13nModel().getProperty("/items")[0].descending === true, "'Descending' is still a boolean after the change (+ value changed to true)");
			done();
		}.bind(this));

		//fire the change event which is being used for the change of sort order maunally
		this.oSortPanel._oListControl.getItems()[0].getCells()[1].fireChange({

			//Select control instance
			selectedItem: this.oSortPanel._oListControl.getItems()[0].getCells()[1].getItems()[1] // Item index 0: false, 1:true
		});

	});

});

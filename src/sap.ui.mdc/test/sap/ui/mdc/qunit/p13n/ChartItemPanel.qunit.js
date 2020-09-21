/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/ChartItemPanel", "sap/ui/model/json/JSONModel"
], function (ChartItemPanel, JSONModel) {
	"use strict";

	this.oChartItemPanel = new ChartItemPanel();
	var oModel = new JSONModel({
		items: [
			{
				label: "Test",
				name: "test",
				selected: true,
				role: "dimension"
			},
			{
				label: "Test2",
				name: "test2",
				selected: false,
				role: "measure"
			},
			{
				label: "Test3",
				name: "test3",
				selected: false,
				role: "measure"
			}
		]
	});
	this.oChartItemPanel.setP13nModel(oModel);
	this.oChartItemPanel.setPanelColumns(["Item", "Type", "Role"]);
	this.oChartItemPanel.placeAt("qunit-fixture");
	sap.ui.getCore().applyChanges();

	QUnit.module("SortPanel API tests", {
		beforeEach: function(){
		},
		afterEach: function(){
		}
	});

	QUnit.test("instantiate ChartItemPanel", function(assert){
		var done = assert.async();
		assert.ok(this.oChartItemPanel);

		//check if the change event has been fired
		this.oChartItemPanel.attachEvent("change", function(oEvent){
			assert.ok(oEvent, "change event has been fired");
			done();
		});

		this.oChartItemPanel._oListControl.getItems()[0].getCells()[2].fireChange({selectedItem:this.oChartItemPanel._oListControl.getItems()[0]});
	}.bind(this));

});

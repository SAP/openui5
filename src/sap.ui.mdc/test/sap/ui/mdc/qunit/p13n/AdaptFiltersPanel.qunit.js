/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/AdaptFiltersPanel", "sap/ui/mdc/FilterField", "sap/ui/model/json/JSONModel"
], function (AdaptFiltersPanel, FilterField, JSONModel) {
	"use strict";

	this.oAdaptFiltersPanel = new AdaptFiltersPanel();
	var oModel = new JSONModel({
		items: [
			{
				label: "Test",
				name: "test",
				selected: true,
				controls: [new FilterField()]
			},
			{
				label: "Test2",
				name: "test2",
				selected: false,
				controls: [new FilterField()]
			},
			{
				label: "Test3",
				name: "test3",
				selected: false,
				controls: [new FilterField()]
			}
		]
	});
	this.oAdaptFiltersPanel.setModel(oModel);
	this.oAdaptFiltersPanel.setPanelColumns(["Filter", "Values"]);
	this.oAdaptFiltersPanel.placeAt("qunit-fixture");
	sap.ui.getCore().applyChanges();

	QUnit.module("AdaptFiltersPanel API tests", {
		beforeEach: function(){
		},
		afterEach: function(){
		}
	});

	QUnit.test("instantiate AdaptFiltersPanel", function(assert){
		assert.ok(this.oAdaptFiltersPanel);
	}.bind(this));

});

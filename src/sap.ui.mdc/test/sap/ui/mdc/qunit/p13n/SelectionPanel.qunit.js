/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/SelectionPanel",
	"sap/ui/core/Core"
], function (SelectionPanel, oCore) {
	"use strict";

	this.oSelectionPanel = new SelectionPanel();
	this.oSelectionPanel.placeAt("qunit-fixture");
	oCore.applyChanges();

	QUnit.module("SelectionPanel API tests", {
		beforeEach: function(){
		},
		afterEach: function(){
		}
	});

	QUnit.test("instantiate SelectionPanel", function(assert){
		assert.ok(this.oSelectionPanel);
	}.bind(this));

});

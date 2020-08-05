/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/SelectionPanel"
], function (SelectionPanel) {
	"use strict";

	this.oSelectionPanel = new SelectionPanel();
	this.oSelectionPanel.placeAt("qunit-fixture");
	sap.ui.getCore().applyChanges();

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

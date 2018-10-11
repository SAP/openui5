/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/ux3/FacetFilter",
	"sap/ui/ux3/FacetFilterList",
	"sap/ui/core/ListItem"
], function(createAndAppendDiv, FacetFilter, FacetFilterList, ListItem) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");


	var oFacetFilter = new FacetFilter("myFacetFilter");

	var oFFL1 = new FacetFilterList("ffl1", {
		title:"Car Brand",
		selectedKeys : [ "2", "3" ],
		items : [
			new ListItem({text:"bmw", key:"2"}),
			new ListItem({text:"audi", key:"3"}),
			new ListItem({text:"volvo", key:"4"}),
			new ListItem({text:"skoda", key:"5"}),
			new ListItem({text:"opel", key:"6"})
		]
	});
	oFacetFilter.addList(oFFL1);

	var oFFL2 = new FacetFilterList("ffl2", {
		title:"Car Model",
		multiSelect: false,
		selectedKeys: ["3", "2"],
		items : [
			new ListItem({text:"A1"}),
			new ListItem({text:"A3", key:"2"}),
			new ListItem({text:"A5", key:"3"}),
			new ListItem({text:"A4"}),
			new ListItem({text:"A6"}),
			new ListItem({text:"Q3"}),
			new ListItem({text:"Q5"})
		]
	});
	oFacetFilter.addList(oFFL2);

	var oFFL3 = new FacetFilterList("ffl3", {
		title:"Type",
		items : [
			new ListItem({text:"A4 Avant"}),
			new ListItem({text:"A4 Limousine"})
		]
	});
	oFacetFilter.addList(oFFL3);
	oFacetFilter.placeAt("uiArea1");



	QUnit.module("Public API");

	QUnit.test("Title", function(assert) {
		assert.equal(oFFL1.getTitle(), "Car Brand", "Title is correct:");
		assert.equal(oFFL2.getTitle(), "Car Model", "Title is correct:");
		assert.equal(oFFL3.getTitle(), "Type", "Title is correct:");
	});

	QUnit.test("Multiselect", function(assert) {
		assert.equal(oFFL1.getMultiSelect(), true, "Multiselection");
		assert.equal(oFFL2.getMultiSelect(), false, "Single selection");
		assert.equal(oFFL3.getMultiSelect(), true, "Multiselection");
	});

	QUnit.module("Visual appearence");

	QUnit.test("Visiblity", function(assert) {
		assert.ok(oFacetFilter.getDomRef(), "Control is visible");
	});

	QUnit.test("Visible Items", function(assert) {
		assert.equal(oFFL1._oListBox.getVisibleItems(), 5, "Number of visible Items is 5");
		assert.equal(oFFL2._oListBox.getVisibleItems(), 5, "Number of visible Items is 5");
		assert.equal(oFFL3._oListBox.getVisibleItems(), 5, "Number of visible Items is 5");
	});


	QUnit.test("Lists", function(assert) {
		assert.equal(oFacetFilter.getLists().length, 3, "There are 3 lists");
	});
});
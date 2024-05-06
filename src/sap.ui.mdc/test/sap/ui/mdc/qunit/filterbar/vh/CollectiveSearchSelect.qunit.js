/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/valuehelp/CollectiveSearchSelect",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/VariantItem"
], function (
	CollectiveSearchSelect,
	createAndAppendDiv,
	keyCodes,
	nextUIUpdate,
	Item
) {
	"use strict";

	createAndAppendDiv("mdcColSearchcontent");


	QUnit.module("CollectiveSearchSelect", {
		beforeEach: function () {
			this.oColSearch = new CollectiveSearchSelect({
			});

		},
		afterEach: function () {
			this.oColSearch.destroy();
			this.oColSearch = undefined;
		}
	});


	QUnit.test("instanciable", function (assert) {
		assert.ok(this.oColSearch);
	});

	QUnit.test("testing public API", function(assert) {
		this.oColSearch.setTitle("foo");
		assert.equal(this.oColSearch.getTitle(), "foo", "should return the extpected title");

		assert.equal(this.oColSearch.getSelectedItemKey(), "", "should be undefined");
		this.oColSearch.setSelectedItemKey("foo");
		assert.equal(this.oColSearch.getSelectedItemKey(), "foo", "should be foo");
		assert.equal(this.oColSearch.getItems().length, 0, "items aggregation should be empty");

		this.oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		assert.equal(this.oColSearch.getItems().length, 1, "one item exist");
		this.oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));
		assert.equal(this.oColSearch.getItems().length, 2, "two items exist");

		this.oColSearch.setSelectedItemKey("cs2");
		assert.equal(this.oColSearch.getCurrentText(), "col Search 2", "long text of selected item should be correct");

		this.oColSearch.setSelectedItemKey("cs1");
		assert.equal(this.oColSearch.getCurrentText(), "col Search 1", "long text of selected item should be correct");
	});

	QUnit.test("testing open popover and creation of list", async function(assert) {
		// arrange
		this.oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		this.oColSearch.setSelectedItemKey("cs2");
		this.oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		this.oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));

		// Assert
		assert.ok(!this.oColSearch.oVariantList, "List should not exist");
		this.oColSearch.onclick();
		assert.ok(this.oColSearch.oVariantList, "List should exist");
	});

	QUnit.test("testing subheader and search field visiblity", async function(assert) {
		// arrange
		this.oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		this.oColSearch.setSelectedItemKey("cs2");
		this.oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		this.oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));

		this.oColSearch.onclick();

		// Assert
		assert.ok(!this.oColSearch.oVariantSelectionPage.getShowSubHeader(), "Subheader should not be visible");
		for (let i = 3; i < 11; i++) {
			this.oColSearch.addItem(new Item({key: "cs" + i, text: "col Search " + i}));
		}
		this.oColSearch.onclick();
		assert.ok(this.oColSearch.oVariantSelectionPage.getShowSubHeader(), "Subheader should be visible when more than 9 items exist");
	});

	QUnit.test("testing search field ", async function(assert) {
		// arrange
		this.oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		this.oColSearch.setSelectedItemKey("cs2");
		this.oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		this.oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));
		for (let i = 3; i < 11; i++) {
			this.oColSearch.addItem(new Item({key: "cs" + i, text: "col Search " + i}));
		}
		this.oColSearch.onclick();

		// Assert
		let oFakeEvent = {
			newValue: "10"
		};
		this.oColSearch._oSearchField.fireLiveChange(oFakeEvent);
		assert.equal(this.oColSearch.oVariantList.getItems().length, 1, "one item should be avaiable/visible after search in the list");

		oFakeEvent = {
			newValue: ""
		};
		this.oColSearch._oSearchField.fireLiveChange(oFakeEvent);
		assert.equal(this.oColSearch.oVariantList.getItems().length, 10, "all items should be avaiable/visible after search in the list");
		assert.ok(!this.oColSearch.oNodataTextLayout.getVisible(), "no data illustrated message should not be visible");

		oFakeEvent = {
			newValue: "X"
		};
		this.oColSearch._oSearchField.fireLiveChange(oFakeEvent);
		assert.ok(!this.oColSearch.oVariantList.getVisible(), "list should not be visible after search");
		assert.ok(this.oColSearch.oNodataTextLayout.getVisible(), "no data illustrated message should be visible");
		assert.equal(this.oColSearch._oNoDataFoundIllustratedMessage.getTitle(), this.oColSearch.oRb.getText("COL_SEARCH_SEL_NODATA_FOUND"), "no data found title should be displayed");
	});

	QUnit.test("testing open popover via keyboard", async function(assert) {
		// arrange
		this.oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		this.oColSearch.setSelectedItemKey("cs2");
		this.oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		this.oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));

		this.oColSearch.onkeyup({which : keyCodes.F4});
		await nextUIUpdate();

		// Assert
		assert.ok(this.oColSearch.oVariantPopOver.isOpen() === true, "Popover should be open!");
	});

	QUnit.test("testing selection of item and event handling", async function(assert) {
		// arrange
		this.oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Prepare
		this.oColSearch.setSelectedItemKey("cs2");
		this.oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		this.oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));
		this.oColSearch.addItem(new Item({key: "cs3", text: "col Search 3"}));
		this.oColSearch.addItem(new Item({key: "cs4", text: "col Search 4"}));
		this.oColSearch.onclick();

		// Act
		this.bEventHandled = false;
		this.oColSearch.attachSelect(function(oEvent){
			this.bEventHandled = true;
		}.bind(this));


		let oFakeEvent = {
			item: new Item({key: "cs2", text: "col Search 2"})
		};
		this.oColSearch.oVariantList.fireItemPress(oFakeEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(!this.bEventHandled, "select event should not be triggered");
		assert.ok(this.oColSearch.getSelectedItemKey() === "cs2", "selectedItemKey should be cs2!");

		// Act
		oFakeEvent = {
			item: new Item({key: "cs3", text: "col Search 3"})
		};
		this.oColSearch.oVariantList.fireItemPress(oFakeEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(this.bEventHandled, "select event should be triggered");
		assert.ok(this.oColSearch.getSelectedItemKey() === "cs3", "selectedItemKey should be cs3!");

		//Cleanup
		delete this.bEventHandled;
	});

});

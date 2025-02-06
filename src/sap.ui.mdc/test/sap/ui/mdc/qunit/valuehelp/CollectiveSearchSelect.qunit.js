/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/valuehelp/CollectiveSearchSelect",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/events/KeyCodes",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/m/VariantItem"
], (
	CollectiveSearchSelect,
	createAndAppendDiv,
	keyCodes,
	nextUIUpdate,
	Item
) => {
	"use strict";

	createAndAppendDiv("mdcColSearchcontent");

	let oColSearch;

	QUnit.module("CollectiveSearchSelect", {
		beforeEach() {
			oColSearch = new CollectiveSearchSelect("CS1", {
			});
		},
		afterEach() {
			oColSearch.destroy();
			oColSearch = undefined;
		}
	});

	QUnit.test("instanciable", (assert) => {
		assert.ok(oColSearch);
	});

	QUnit.test("testing public API", (assert) => {
		oColSearch.setTitle("foo");
		assert.equal(oColSearch.getTitle(), "foo", "should return the extpected title");

		assert.equal(oColSearch.getSelectedItemKey(), "", "should be undefined");
		oColSearch.setSelectedItemKey("foo");
		assert.equal(oColSearch.getSelectedItemKey(), "foo", "should be foo");
		assert.equal(oColSearch.getItems().length, 0, "items aggregation should be empty");

		oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		assert.equal(oColSearch.getItems().length, 1, "one item exist");
		oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));
		assert.equal(oColSearch.getItems().length, 2, "two items exist");

		oColSearch.setSelectedItemKey("cs2");
		assert.equal(oColSearch.getCurrentText(), "col Search 2", "long text of selected item should be correct");

		oColSearch.setSelectedItemKey("cs1");
		assert.equal(oColSearch.getCurrentText(), "col Search 1", "long text of selected item should be correct");
	});

	QUnit.test("testing open popover and creation of list", async (assert) => {
		// arrange
		oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		oColSearch.setSelectedItemKey("cs2");
		oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));

		// Assert
		assert.ok(!oColSearch.oVariantList, "List should not exist");
		oColSearch.onclick();
		assert.ok(oColSearch.oVariantList, "List should exist");
	});

	QUnit.test("testing subheader and search field visiblity", async (assert) => {
		// arrange
		oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		oColSearch.setSelectedItemKey("cs2");
		oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));

		oColSearch.onclick();

		// Assert
		assert.ok(!oColSearch.oVariantSelectionPage.getShowSubHeader(), "Subheader should not be visible");
		for (let i = 3; i < 11; i++) {
			oColSearch.addItem(new Item({key: "cs" + i, text: "col Search " + i}));
		}
		oColSearch.onclick();
		assert.ok(oColSearch.oVariantSelectionPage.getShowSubHeader(), "Subheader should be visible when more than 9 items exist");
	});

	QUnit.test("testing search field ", async (assert) => {
		// arrange
		oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		oColSearch.setSelectedItemKey("cs2");
		oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));
		for (let i = 3; i < 11; i++) {
			oColSearch.addItem(new Item({key: "cs" + i, text: "col Search " + i}));
		}
		oColSearch.onclick();

		// Assert
		let oFakeEvent = {
			newValue: "10"
		};
		oColSearch._oSearchField.fireLiveChange(oFakeEvent);
		assert.equal(oColSearch.oVariantList.getItems().length, 1, "one item should be avaiable/visible after search in the list");

		oFakeEvent = {
			newValue: ""
		};
		oColSearch._oSearchField.fireLiveChange(oFakeEvent);
		assert.equal(oColSearch.oVariantList.getItems().length, 10, "all items should be avaiable/visible after search in the list");
		assert.ok(!oColSearch.oNodataTextLayout.getVisible(), "no data illustrated message should not be visible");

		oFakeEvent = {
			newValue: "X"
		};
		oColSearch._oSearchField.fireLiveChange(oFakeEvent);
		assert.ok(!oColSearch.oVariantList.getVisible(), "list should not be visible after search");
		assert.ok(oColSearch.oNodataTextLayout.getVisible(), "no data illustrated message should be visible");
		assert.equal(oColSearch._oNoDataFoundIllustratedMessage.getTitle(), oColSearch.oRb.getText("COL_SEARCH_SEL_NODATA_FOUND"), "no data found title should be displayed");
	});

	QUnit.test("testing open popover via keyboard", async (assert) => {
		// arrange
		oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Act
		oColSearch.setSelectedItemKey("cs2");
		oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));

		oColSearch.onkeyup({which : keyCodes.F4});
		await nextUIUpdate();

		// Assert
		assert.ok(oColSearch.oVariantPopOver.isOpen() === true, "Popover should be open!");
	});

	QUnit.test("testing selection of item and event handling", async (assert) => {
		// arrange
		oColSearch.placeAt("mdcColSearchcontent");
		await nextUIUpdate();

		// Prepare
		oColSearch.setSelectedItemKey("cs2");
		oColSearch.addItem(new Item({key: "cs1", text: "col Search 1"}));
		oColSearch.addItem(new Item({key: "cs2", text: "col Search 2"}));
		oColSearch.addItem(new Item({key: "cs3", text: "col Search 3"}));
		oColSearch.addItem(new Item({key: "cs4", text: "col Search 4"}));
		oColSearch.onclick();

		// Act
		let bEventHandled = false;
		oColSearch.attachSelect((oEvent) => {
			bEventHandled = true;
		});


		let oFakeEvent = {
			item: new Item({key: "cs2", text: "col Search 2"})
		};
		oColSearch.oVariantList.fireItemPress(oFakeEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(!bEventHandled, "select event should not be triggered");
		assert.ok(oColSearch.getSelectedItemKey() === "cs2", "selectedItemKey should be cs2!");

		// Act
		oFakeEvent = {
			item: new Item({key: "cs3", text: "col Search 3"})
		};
		oColSearch.oVariantList.fireItemPress(oFakeEvent);
		await nextUIUpdate();

		// Assert
		assert.ok(bEventHandled, "select event should be triggered");
		assert.ok(oColSearch.getSelectedItemKey() === "cs3", "selectedItemKey should be cs3!");
	});

	QUnit.test("getOverflowToolbarConfig", (assert) => {
		const oOverflowToolbarConfig = oColSearch.getOverflowToolbarConfig();
		assert.ok(oOverflowToolbarConfig?.canOverflow, "canOverflow");
	});

});

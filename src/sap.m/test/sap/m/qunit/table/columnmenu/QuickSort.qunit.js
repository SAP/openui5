/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/library"
], function(Library, QUnitUtils, Menu, QuickSort, QuickSortItem, Button, library, nextUIUpdate, CoreLibrary) {
	"use strict";

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oQuickSort = new QuickSort({
				items : [
					new QuickSortItem({
						key: "propertyA",
						label: "A",
						sortOrder: "Ascending"
					})
				]
			});
		},
		afterEach: function () {
			this.oQuickSort.destroy();
		}
	});

	QUnit.test("Defaults", function(assert) {
		var oQuickSort = new QuickSort({
			items: new QuickSortItem()
		});

		assert.strictEqual(oQuickSort.getItems()[0].getKey(), undefined, "Item: Key");
		assert.strictEqual(oQuickSort.getItems()[0].getLabel(), "", "Item: Label");
		assert.strictEqual(oQuickSort.getItems()[0].getSortOrder(), CoreLibrary.SortOrder.None, "Item: SortOrder");

		oQuickSort.destroy();
	});

	QUnit.test("getEffectiveQuickActions", function(assert) {
		assert.equal(this.oQuickSort.getEffectiveQuickActions().length, 1, "Returns an array that contains 1 item");
		assert.ok(this.oQuickSort.getEffectiveQuickActions()[0].isA("sap.m.table.columnmenu.QuickAction"), "The array contains a QuickAction instance");

		this.oQuickSort.setVisible(false);
		assert.equal(this.oQuickSort.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 items");
	});

	QUnit.test("Label", function(assert) {
		var oBundle = Library.getResourceBundleFor("sap.m");
		var sLabel = oBundle.getText("table.COLUMNMENU_QUICK_SORT", "A");
		var aItems = this.oQuickSort.getItems();
		assert.equal(aItems[0]._getLabel(aItems.length), sLabel, "QuickSort label of single item is correct.");

		var oItem = new QuickSortItem({
			key: "propertyB",
			label: "B",
			sortOrder: "Descending"
		});
		this.oQuickSort.addItem(oItem);
		aItems = this.oQuickSort.getItems();
		sLabel = oBundle.getText("table.COLUMNMENU_QUICK_SORT", "A");
		assert.equal(aItems[0]._getLabel(aItems.length), sLabel, "QuickSort label of first of two items is correct.");
		sLabel = oBundle.getText("table.COLUMNMENU_QUICK_SORT", "B");
		assert.equal(aItems[1]._getLabel(aItems.length), sLabel, "QuickSort label of second of two items correct.");
	});

	QUnit.test("Content", function(assert) {
		var oBundle = Library.getResourceBundleFor("sap.m");
		var aContent = this.oQuickSort.getEffectiveQuickActions()[0].getContent();
		assert.ok(aContent, "The quick sort has content");

		assert.equal(aContent.length, 2, "The quick sort has 2 buttons");
		assert.equal(aContent[0].getText(), oBundle.getText("table.COLUMNMENU_SORT_ASCENDING"), "Ascending button");
		assert.ok(aContent[0].getPressed(), "The ascending button is pressed");
		assert.equal(aContent[1].getText(), oBundle.getText("table.COLUMNMENU_SORT_DESCENDING"), "Descending button");
		assert.ok(!aContent[1].getPressed(), "The descending button is not pressed");

		var oItem = new QuickSortItem({
			key: "propertyB",
			label: "B",
			sortOrder: "Descending"
		});
		this.oQuickSort.addItem(oItem);

		assert.notOk(this.oQuickSort._oContent, "The content is destroyed after addItem call");
		var aQuickActions = this.oQuickSort.getEffectiveQuickActions();
		assert.equal(aQuickActions.length, 2, "The quick sort has 2 quick actions");
		assert.equal(aQuickActions[0].getProperty("label"), oBundle.getText("table.COLUMNMENU_QUICK_SORT", "A"), "The label for the quick action is set correctly");
		assert.equal(aQuickActions[1].getProperty("label"), oBundle.getText("table.COLUMNMENU_QUICK_SORT", "B"), "The label for the quick action is set correctly");

		function testItems(aItems, sortOrder) {
			assert.equal(aItems.length, 2, "The quick sort has 2 buttons");
			assert.equal(aItems[0].getText(), oBundle.getText("table.COLUMNMENU_SORT_ASCENDING"), "Ascending button");
			assert.equal(aItems[0].getPressed(), sortOrder === "Ascending", "The ascending button is pressed");
			assert.equal(aItems[1].getText(), oBundle.getText("table.COLUMNMENU_SORT_DESCENDING"), "Descending button");
			assert.equal(aItems[1].getPressed(), sortOrder === "Descending", "The descending button is not pressed");
		}

		testItems(aQuickActions[0].getContent(), "Ascending");
		testItems(aQuickActions[1].getContent(), "Descending");
	});

	QUnit.test("Category", function(assert) {
		assert.strictEqual(this.oQuickSort.getCategory(), library.table.columnmenu.Category.Generic, "Category of the QuickSort instance itself");

		this.oQuickSort.getEffectiveQuickActions().forEach(function(oQuickAction) {
			assert.strictEqual(oQuickAction.getCategory(), library.table.columnmenu.Category.Sort, "Category of the inner QuickAction instances");
		});
	});

	QUnit.module("Events", {
		triggerClickEvent: function(sId) {
			QUnitUtils.triggerEvent("mousedown", sId);
			QUnitUtils.triggerEvent("mouseup", sId);
			QUnitUtils.triggerEvent("click", sId);
		},
		beforeEach: async function () {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");

			this.oColumnMenu = new Menu({
				quickActions: [new QuickSort({
					items : [{
						key: "propertyA",
						label: "A",
						sortOrder: "Ascending"
					}]
				})]
			});

			await nextUIUpdate();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Change", function(assert) {
		var done = assert.async();
		var oMenu = this.oColumnMenu;
		oMenu.openBy(this.oButton);

		var oQuickSort = oMenu.getAggregation("quickActions")[0];

		oQuickSort.attachChange(function(oEvent) {
			assert.ok(true, "Sort event has been fired");
			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getKey(), "propertyA", "The item is passed as event parameter");
			assert.equal(oItem.getSortOrder(), "Descending", "The sortOrder property of the item is correct");

			setTimeout(function() {
				assert.ok(!oMenu.isOpen(), "The popover closes");
				done();
			}, 1000);
		});

		this.triggerClickEvent(document.getElementsByTagName("button")[1].id);
	});

	QUnit.module("Aggregations", {
		beforeEach: function () {
			this.oQuickSort = new QuickSort({
				items : [
					new QuickSortItem({
						key: "propertyA",
						label: "A",
						sortOrder: "Ascending"
					})
				]
			});
		},
		afterEach: function () {
			this.oQuickSort.destroy();
		}
	});

	QUnit.test("Items", function(assert) {
		var oItem = new QuickSortItem({
			key: "propertyB",
			label: "B",
			sortOrder: "Ascending"
		});

		this.oQuickSort.addItem(oItem);
		assert.equal(this.oQuickSort.getItems().length, 2, "The items aggregation contains 2 items");
		assert.equal(this.oQuickSort.getItems()[1], oItem, "The item is added at the end");

		this.oQuickSort.removeItem(oItem);
		assert.equal(this.oQuickSort.getItems().length, 1, "The items aggregation contains 1 item");
		assert.notEqual(this.oQuickSort.getItems()[0], oItem, "The correct item is removed");

		this.oQuickSort.insertItem(oItem, 0);
		assert.equal(this.oQuickSort.getItems().length, 2, "The items aggregation contains 2 items");
		assert.equal(this.oQuickSort.getItems()[0], oItem, "The item is added at index 0");

		this.oQuickSort.removeAllItems();
		assert.equal(this.oQuickSort.getItems().length, 0, "The items aggregation contains 0 items");

		this.oQuickSort.addItem(oItem);
		this.oQuickSort.destroyItems();
		assert.equal(this.oQuickSort.getItems().length, 0, "The items aggregation contains 0 items");
	});
});
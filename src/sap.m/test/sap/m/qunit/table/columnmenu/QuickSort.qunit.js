/*global QUnit*/
sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/library"
], function(nextUIUpdate, QUnitUtils, Menu, QuickSort, QuickSortItem, Button, library, CoreLibrary) {
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
		const oQuickSort = new QuickSort({
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

	QUnit.test("Content", function(assert) {
		let oQuickSortItem = this.oQuickSort.getItems()[0];
		let sLabel = oQuickSortItem.getLabel();
		assert.equal(sLabel, "A", "The label of the first QuickSortItem is correct");
		let aContent = this.oQuickSort.getEffectiveQuickActions()[0].getContent();
		assert.ok(aContent, "The quick sort has content");
		assert.ok(aContent[0].isA("sap.m.SegmentedButton"), "The content of the first QuickSortItem is a SegmentedButton");
		assert.equal(aContent[0].getProperty("selectedKey"), "Ascending", "The selected key of the first SegmentedButton is correct");

		const oItem = new QuickSortItem({
			key: "propertyB",
			label: "B",
			sortOrder: "Descending"
		});
		this.oQuickSort.addItem(oItem);

		oQuickSortItem = this.oQuickSort.getItems()[1];
		sLabel = oQuickSortItem.getLabel();
		assert.equal(sLabel, "B", "The label of the second QuickSortItem is correct");
		aContent = this.oQuickSort.getEffectiveQuickActions()[1].getContent();
		assert.ok(aContent, "The second QuickSortItem has content");
		assert.ok(aContent[0].isA("sap.m.SegmentedButton"), "The content of the second QuickSortItem is a SegmentedButton");
		assert.equal(aContent[0].getProperty("selectedKey"), "Descending", "The selected key of the second SegmentedButton is correct");
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
					items : [
						new QuickSortItem({
							key: "propertyA",
							label: "A",
							sortOrder: "Ascending"
						})
					]
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
		const done = assert.async();
		const oMenu = this.oColumnMenu;
		oMenu.openBy(this.oButton);

		const oQuickSort = oMenu.getAggregation("quickActions")[0];
		const oSegmentedButton = oQuickSort.getEffectiveQuickActions()[0].getContent()[0];

		oQuickSort.attachChange(function(oEvent) {
			assert.ok(true, "Sort event has been fired");
			const oItem = oEvent.getParameter("item");
			assert.equal(oItem.getKey(), "propertyA", "The item is passed as event parameter");
			assert.equal(oItem.getSortOrder(), "Descending", "The sortOrder property of the item is correct");

			setTimeout(function() {
				assert.ok(!oMenu.isOpen(), "The popover closes");
				done();
			}, 1000);
		});

		oSegmentedButton.setSelectedKey("Descending");
		oSegmentedButton.fireSelectionChange({item: oSegmentedButton.getItems()[0]});
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
		const oItem = new QuickSortItem({
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
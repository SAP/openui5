/*global QUnit sinon*/
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/Button",
	"sap/m/library"
], function(Library, nextUIUpdate, QUnitUtils, Menu, QuickTotal, QuickTotalItem, Button, library) {
	"use strict";

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oQuickTotal = new QuickTotal({
				items: [
					new QuickTotalItem({
						key: "propertyA",
						label: "A",
						totaled: false
					}),
					new QuickTotalItem({
						key: "propertyB",
						label: "B",
						totaled: true
					})
				]
			});
		},
		afterEach: function () {
			this.oQuickTotal.destroy();
		}
	});

	QUnit.test("Defaults", function(assert) {
		const oQuickTotal = new QuickTotal({
			items: new QuickTotalItem()
		});

		assert.strictEqual(oQuickTotal.getItems()[0].getKey(), undefined, "Item: Key");
		assert.strictEqual(oQuickTotal.getItems()[0].getLabel(), "", "Item: Label");
		assert.strictEqual(oQuickTotal.getItems()[0].getTotaled(), false, "Item: Totaled");

		oQuickTotal.destroy();
	});

	QUnit.test("getEffectiveQuickActions", function(assert) {
		assert.deepEqual(this.oQuickTotal.getEffectiveQuickActions(), [this.oQuickTotal],
			"It returns an array that contains the QuickTotal instance");

		this.oQuickTotal.setVisible(false);
		assert.equal(this.oQuickTotal.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 items");

		this.oQuickTotal.setVisible(true);
		this.oQuickTotal.removeAllItems();
		assert.equal(this.oQuickTotal.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 items");
	});

	QUnit.test("Label", function(assert) {
		const oBundle = Library.getResourceBundleFor("sap.m");
		const sLabel = oBundle.getText("table.COLUMNMENU_QUICK_TOTAL");
		assert.equal(this.oQuickTotal.getLabel(), sLabel, "QuickTotal label is correct.");
	});

	QUnit.test("setLabel on QuickTotalItem", function(assert) {
		const ooQuickTotalItem = this.oQuickTotal.getItems()[0];
		ooQuickTotalItem.setLabel("New label");
		assert.equal(ooQuickTotalItem.getLabel(), "New label", "New QuickTotalItem label is correct");

		const oToggleButton = this.oQuickTotal.getDependents()[0];
		assert.strictEqual(oToggleButton.getText(), ooQuickTotalItem.getLabel(), "QuickTotalItem's ToggleButton label is updated correctly");
	});

	QUnit.test("Content", function(assert) {
		const aContent = this.oQuickTotal.getContent();
		assert.ok(aContent, "The quick total has content");
		assert.strictEqual(aContent[0].getParent(), this.oQuickTotal, "The content is in the control tree");
		assert.strictEqual(aContent[1].getParent(), this.oQuickTotal, "The content is in the control tree");

		assert.equal(aContent.length, 2, "The quick total has the correct number of items");
		assert.equal(aContent[0].getText(), "A", "The first button text is correct");
		assert.ok(!aContent[0].getPressed(), "The first button is not pressed");
		assert.equal(aContent[1].getText(), "B", "The second button text is correct");
		assert.ok(aContent[1].getPressed(), "The second button is pressed");
	});

	QUnit.test("Category", function(assert) {
		assert.strictEqual(this.oQuickTotal.getCategory(), library.table.columnmenu.Category.Aggregate);
	});

	QUnit.test("QuickTotalItem setTotaled", function(assert) {
		const oQuickTotalItem = this.oQuickTotal.getItems()[0];
		const oButton = this.oQuickTotal.getContent()[0];

		oQuickTotalItem.setTotaled(true);
		assert.ok(oButton.getPressed(), "The pressed state of the button is updated");
		oQuickTotalItem.setTotaled(false);
		assert.ok(!oButton.getPressed(), "The pressed state of the button is updated");
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
				quickActions: [new QuickTotal({
					items: [
						new QuickTotalItem({
							key: "PropertyA",
							label: "A",
							totaled: false
						}),
						new QuickTotalItem({
							key: "PropertyB",
							label: "B",
							totaled: true
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

		const oQuickTotal = oMenu.getAggregation("quickActions")[0];
		const aItems = oQuickTotal.getContent();

		oQuickTotal.attachChange(function(oEvent) {
			assert.ok(true, "Change event has been fired");
			const oItem = oEvent.getParameter("item");
			assert.equal(oItem.getKey(), "PropertyA", "The item is passed as event parameter");
			assert.ok(oItem.getTotaled(), "The totaled property of the item is correct");

			setTimeout(function() {
				assert.ok(!oMenu.isOpen(), "The popover closes");
				done();
			}, 1000);
		});

		this.triggerClickEvent(aItems[0].getId());
	});

	QUnit.module("Aggregations", {
		beforeEach: function () {
			this.oQuickTotal = new QuickTotal({
				items : [
					new QuickTotalItem({
						key: "propertyA",
						label: "A",
						totaled: true
					})
				]
			});
		},
		afterEach: function () {
			this.oQuickTotal.destroy();
		}
	});

	QUnit.test("Items", function(assert) {
		const oDestroySpy = sinon.spy(this.oQuickTotal, "destroyContent");
		const oItem = new QuickTotalItem({
			key: "propertyB",
			label: "B",
			totaled: false
		});

		this.oQuickTotal.addItem(oItem);
		assert.equal(oDestroySpy.callCount, 1, "The content is destroyed after addItem call");
		assert.equal(this.oQuickTotal.getItems().length, 2, "The items aggregation contains 2 items");
		assert.equal(this.oQuickTotal.getItems()[1], oItem, "The item is added at the end");

		this.oQuickTotal.removeItem(oItem);
		assert.equal(oDestroySpy.callCount, 2, "The content is destroyed after removeItem call");
		assert.equal(this.oQuickTotal.getItems().length, 1, "The items aggregation contains 1 item");
		assert.notEqual(this.oQuickTotal.getItems()[0], oItem, "The correct item is removed");

		this.oQuickTotal.insertItem(oItem, 0);
		assert.equal(oDestroySpy.callCount, 3, "The content is destroyed after insertItem call");
		assert.equal(this.oQuickTotal.getItems().length, 2, "The items aggregation contains 2 items");
		assert.equal(this.oQuickTotal.getItems()[0], oItem, "The item is added at index 0");

		this.oQuickTotal.removeAllItems();
		assert.equal(oDestroySpy.callCount, 4, "The content is destroyed after removeAllItems call");
		assert.equal(this.oQuickTotal.getItems().length, 0, "The items aggregation contains 0 items");

		this.oQuickTotal.addItem(oItem);
		this.oQuickTotal.destroyItems();
		assert.equal(oDestroySpy.callCount, 6, "The content is destroyed after destroyItems call");
		assert.equal(this.oQuickTotal.getItems().length, 0, "The items aggregation contains 0 items");
		oDestroySpy.reset();
	});
});
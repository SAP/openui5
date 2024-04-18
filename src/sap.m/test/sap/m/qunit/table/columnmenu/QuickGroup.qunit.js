/*global QUnit sinon*/
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/Button",
	"sap/m/library"
], function(Library, nextUIUpdate, QUnitUtils, Menu, QuickGroup, QuickGroupItem, Button, library) {
	"use strict";

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oQuickGroup = new QuickGroup({
				items: [
					new QuickGroupItem({
						key: "propertyA",
						label: "A",
						grouped: true
					}),
					new QuickGroupItem({
						key: "propertyB",
						label: "B",
						grouped: false
					})
				]
			});
		},
		afterEach: function () {
			this.oQuickGroup.destroy();
		}
	});

	QUnit.test("Defaults", function(assert) {
		const oQuickGroup = new QuickGroup({
			items: new QuickGroupItem()
		});

		assert.strictEqual(oQuickGroup.getItems()[0].getKey(), undefined, "Item: Key");
		assert.strictEqual(oQuickGroup.getItems()[0].getLabel(), "", "Item: Label");
		assert.strictEqual(oQuickGroup.getItems()[0].getGrouped(), false, "Item: Grouped");

		oQuickGroup.destroy();
	});

	QUnit.test("getEffectiveQuickActions", function(assert) {
		assert.deepEqual(this.oQuickGroup.getEffectiveQuickActions(), [this.oQuickGroup],
			"It returns an array that contains the QuickGroup instance");

		this.oQuickGroup.setVisible(false);
		assert.equal(this.oQuickGroup.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 items");

		this.oQuickGroup.setVisible(true);
		this.oQuickGroup.removeAllItems();
		assert.equal(this.oQuickGroup.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 items");
	});

	QUnit.test("Label", function(assert) {
		const oBundle = Library.getResourceBundleFor("sap.m");
		const sLabel = oBundle.getText("table.COLUMNMENU_QUICK_GROUP");
		assert.equal(this.oQuickGroup.getLabel(), sLabel, "QuickGroup label is correct.");
	});

	QUnit.test("setLabel on QuickGroupItem", function(assert) {
		const oQuickGroupItem = this.oQuickGroup.getItems()[0];
		oQuickGroupItem.setLabel("New label");
		assert.equal(oQuickGroupItem.getLabel(), "New label", "New QuickGroupItem label is correct");

		const oToggleButton = this.oQuickGroup.getDependents()[0];
		assert.strictEqual(oToggleButton.getText(), oQuickGroupItem.getLabel(), "QuickGroupItem's ToggleButton label is updated correctly");
	});

	QUnit.test("Content", function(assert) {
		const aContent = this.oQuickGroup.getContent();
		assert.ok(aContent, "The quick group has content");
		assert.strictEqual(aContent[0].getParent(), this.oQuickGroup, "The content is in the control tree");
		assert.strictEqual(aContent[1].getParent(), this.oQuickGroup, "The content is in the control tree");

		assert.equal(aContent.length, 2, "The quick group has the correct number of items");
		assert.equal(aContent[0].getText(), "A", "The first button text is correct");
		assert.ok(aContent[0].getPressed(), "The first button is pressed");
		assert.equal(aContent[1].getText(), "B", "The second button text is correct");
		assert.ok(!aContent[1].getPressed(), "The second button is not pressed");
	});

	QUnit.test("Category", function(assert) {
		assert.strictEqual(this.oQuickGroup.getCategory(), library.table.columnmenu.Category.Group);
	});

	QUnit.test("QuickGroupItem setGrouped", function(assert) {
		const oQuickGroupItem = this.oQuickGroup.getItems()[0];
		const oButton = this.oQuickGroup.getContent()[0];

		oQuickGroupItem.setGrouped(true);
		assert.ok(oButton.getPressed(), "The pressed state of the button is updated");
		oQuickGroupItem.setGrouped(false);
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
				quickActions: [new QuickGroup({
					items: [
						new QuickGroupItem({
							key: "propertyA",
							label: "A",
							grouped: true
						}),
						new QuickGroupItem({
							key: "propertyB",
							label: "B",
							grouped: false
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

		const oQuickGroup = oMenu.getAggregation("quickActions")[0];
		const aItems = oQuickGroup.getContent();

		oQuickGroup.attachChange(function(oEvent) {
			assert.ok(true, "Change event has been fired");
			const oItem = oEvent.getParameter("item");
			assert.equal(oItem.getKey(), "propertyB", "The item is passed as event parameter");
			assert.ok(oItem.getGrouped(), "The grouped property of the item is correct");

			setTimeout(function() {
				assert.ok(!oMenu.isOpen(), "The popover closes");
				done();
			}, 1000);
		});

		this.triggerClickEvent(aItems[1].getId());
	});

	QUnit.module("Aggregations", {
		beforeEach: function () {
			this.oQuickGroup = new QuickGroup({
				items : [
					new QuickGroupItem({
						key: "propertyA",
						label: "A",
						grouped: true
					})
				]
			});
		},
		afterEach: function () {
			this.oQuickGroup.destroy();
		}
	});

	QUnit.test("Items", function(assert) {
		const oDestroySpy = sinon.spy(this.oQuickGroup, "destroyContent");
		const oItem = new QuickGroupItem({
			key: "propertyB",
			label: "B",
			grouped: false
		});

		this.oQuickGroup.addItem(oItem);
		assert.equal(oDestroySpy.callCount, 1, "The content is destroyed after addItem call");
		assert.equal(this.oQuickGroup.getItems().length, 2, "The items aggregation contains 2 items");
		assert.equal(this.oQuickGroup.getItems()[1], oItem, "The item is added at the end");

		this.oQuickGroup.removeItem(oItem);
		assert.equal(oDestroySpy.callCount, 2, "The content is destroyed after removeItem call");
		assert.equal(this.oQuickGroup.getItems().length, 1, "The items aggregation contains 1 item");
		assert.notEqual(this.oQuickGroup.getItems()[0], oItem, "The correct item is removed");

		this.oQuickGroup.insertItem(oItem, 0);
		assert.equal(oDestroySpy.callCount, 3, "The content is destroyed after insertItem call");
		assert.equal(this.oQuickGroup.getItems().length, 2, "The items aggregation contains 2 items");
		assert.equal(this.oQuickGroup.getItems()[0], oItem, "The item is added at index 0");

		this.oQuickGroup.removeAllItems();
		assert.equal(oDestroySpy.callCount, 4, "The content is destroyed after removeAllItems call");
		assert.equal(this.oQuickGroup.getItems().length, 0, "The items aggregation contains 0 items");

		this.oQuickGroup.addItem(oItem);
		this.oQuickGroup.destroyItems();
		assert.equal(oDestroySpy.callCount, 6, "The content is destroyed after destroyItems call");
		assert.equal(this.oQuickGroup.getItems().length, 0, "The items aggregation contains 0 items");
		oDestroySpy.reset();
	});
});
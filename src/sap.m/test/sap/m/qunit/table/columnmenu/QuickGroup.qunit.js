/*global QUnit sinon*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/Button",
	"sap/ui/core/Core"
], function (QUnitUtils, Menu, QuickGroup, QuickGroupItem, Button, Core) {
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

	QUnit.test("getEffectiveQuickActions", function(assert) {
		assert.deepEqual(this.oQuickGroup.getEffectiveQuickActions(), [this.oQuickGroup],
			"It returns an array that contains the QuickGroup instance");
	});

	QUnit.test("Label", function(assert) {
		var oBundle = Core.getLibraryResourceBundle("sap.m");
		var sLabel = oBundle.getText("table.COLUMNMENU_QUICK_GROUP");
		assert.equal(this.oQuickGroup.getLabel(), sLabel, "QuickGroup label is correct.");
	});

	QUnit.test("Content", function(assert) {
		var aContent = this.oQuickGroup.getContent();
		assert.ok(aContent, "The quick group has content");
		assert.strictEqual(aContent[0].getParent(), this.oQuickGroup, "The content is in the control tree");
		assert.strictEqual(aContent[1].getParent(), this.oQuickGroup, "The content is in the control tree");

		assert.equal(aContent.length, 2, "The quick group has the correct number of items");
		assert.equal(aContent[0].getText(), "A", "The first button text is correct");
		assert.ok(aContent[0].getPressed(), "The first button is pressed");
		assert.equal(aContent[1].getText(), "B", "The second button text is correct");
		assert.ok(!aContent[1].getPressed(), "The second button is not pressed");
	});

	QUnit.module("Events", {
		triggerClickEvent: function(sId) {
			QUnitUtils.triggerEvent("mousedown", sId);
			QUnitUtils.triggerEvent("mouseup", sId);
			QUnitUtils.triggerEvent("click", sId);
		},
		beforeEach: function () {
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

			Core.applyChanges();
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

		var oQuickGroup = oMenu.getAggregation("quickActions")[0];
		var aItems = oQuickGroup.getContent();

		oQuickGroup.attachChange(function(oEvent) {
			assert.ok(true, "Change event has been fired");
			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getKey(), "propertyB", "The item is passed as event parameter");
			assert.ok(oItem.getGrouped(), "The grouped property of the item is correct");

			setTimeout(function() {
				assert.ok(!oMenu._oPopover.isOpen(), "The popover closes");
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
		var oDestroySpy = sinon.spy(this.oQuickGroup, "destroyContent");
		var oItem = new QuickGroupItem({
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
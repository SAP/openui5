/*global QUnit sinon*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/Button"
], function (QUnitUtils, Menu, QuickTotal, QuickTotalItem, Button) {
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

	QUnit.test("getEffectiveQuickActions", function(assert) {
		assert.deepEqual(this.oQuickTotal.getEffectiveQuickActions(), [this.oQuickTotal],
			"It returns an array that contains the QuickTotal instance");
	});

	QUnit.test("Label", function(assert) {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var sLabel = oBundle.getText("table.COLUMNMENU_QUICK_TOTAL");
		assert.equal(this.oQuickTotal.getLabel(), sLabel, "QuickTotal label is correct.");
	});

	QUnit.test("Content", function(assert) {
		var aContent = this.oQuickTotal.getContent();
		assert.ok(aContent, "The quick total has content");

		assert.equal(aContent.length, 2, "The quick total has the correct number of items");
		assert.equal(aContent[0].getText(), "A", "The first button text is correct");
		assert.ok(!aContent[0].getPressed(), "The first button is not pressed");
		assert.equal(aContent[1].getText(), "B", "The second button text is correct");
		assert.ok(aContent[1].getPressed(), "The second button is pressed");
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

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Change", function(assert) {
		var done = assert.async();
		this.oColumnMenu.openBy(this.oButton);
		sap.ui.getCore().applyChanges();

		var oQuickTotal = this.oColumnMenu.getAggregation("quickActions")[0];
		var aItems = oQuickTotal.getContent();

		oQuickTotal.attachChange(function(oEvent) {
			assert.ok(true, "Change event has been fired");
			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getKey(), "PropertyA", "The item is passed as event parameter");
			assert.ok(oItem.getTotaled(), "The totaled property of the item is correct");
			assert.ok(aItems[0].getPressed(), "The first button is pressed");
			assert.ok(!aItems[1].getPressed(), "After pressing the first button, the state of the second button has changed.");
			done();
		});

		assert.ok(!aItems[0].getPressed(), "The first button is initially not pressed");
		assert.ok(aItems[1].getPressed(), "The second button is initially pressed");
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
		var oDestroySpy = sinon.spy(this.oQuickTotal, "destroyContent");
		var oItem = new QuickTotalItem({
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
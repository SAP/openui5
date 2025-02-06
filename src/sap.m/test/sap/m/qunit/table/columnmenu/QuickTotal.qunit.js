/*global QUnit*/
sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/Button"
], function(nextUIUpdate, QUnitUtils, Menu, QuickTotal, QuickTotalItem, Button) {
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
		const aQuickActions = this.oQuickTotal.getEffectiveQuickActions();
		assert.deepEqual(aQuickActions.length, 2,
			"It returns an array that contains 2 quick actions");

		let oQuickAction = aQuickActions[0];
		assert.equal(oQuickAction.getLabel(), "A", "The label of the first QuickTotalItem is correct");
		assert.ok(oQuickAction.getContent()[0].isA("sap.m.Switch"), "The content is a Switch");
		assert.notOk(oQuickAction.getContent()[0].getState(), "The state of the Switch is correct");
		assert.equal(oQuickAction.getCategory(), "Aggregate", "The category is correct");
		assert.equal(oQuickAction.getContentSize(), "S", "The contentSize is correct");

		oQuickAction = aQuickActions[1];
		assert.equal(oQuickAction.getLabel(), "B", "The label of the second QuickTotalItem is correct");
		assert.ok(oQuickAction.getContent()[0].isA("sap.m.Switch"), "The content is a Switch");
		assert.ok(oQuickAction.getContent()[0].getState(), "The state of the Switch is correct");
		assert.equal(oQuickAction.getCategory(), "Aggregate", "The category is correct");
		assert.equal(oQuickAction.getContentSize(), "S", "The contentSize is correct");

		this.oQuickTotal.setVisible(false);
		assert.equal(this.oQuickTotal.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 quick actions");

		this.oQuickTotal.setVisible(true);
		this.oQuickTotal.removeAllItems();
		assert.equal(this.oQuickTotal.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 quick actions");
	});

	QUnit.test("Content", function(assert) {
		let oQuickTotalItem = this.oQuickTotal.getItems()[0];
		let sLabel = oQuickTotalItem.getLabel();
		assert.equal(sLabel, "A", "The label of the first QuickTotalItem is correct");
		let oContent = oQuickTotalItem.getContent();
		assert.ok(oContent, "The first QuickTotalItem has content");
		assert.ok(oContent.isA("sap.m.Switch"), "The content of the first QuickTotalItem is a Switch");
		assert.ok(!oContent.getState(), "The first switch is off");

		oQuickTotalItem = this.oQuickTotal.getItems()[1];
		sLabel = oQuickTotalItem.getLabel();
		assert.equal(sLabel, "B", "The label of the second QuickTotalItem is correct");
		oContent = oQuickTotalItem.getContent();
		assert.ok(oContent, "The second QuickTotalItem has content");
		assert.ok(oContent.isA("sap.m.Switch"), "The content of the second QuickTotalItem is a Switch");
		assert.ok(oContent.getState(), "The second switch is on");
	});

	QUnit.test("QuickTotalItem setTotaled", function(assert) {
		const oQuickTotalItem = this.oQuickTotal.getItems()[0];
		const oSwitch = oQuickTotalItem.getContent();

		assert.notOk(oSwitch.getState(), "The initial state of the switch is correct");
		oQuickTotalItem.setTotaled(true);
		assert.ok(oSwitch.getState(), "The state of the switch is updated");
		oQuickTotalItem.setTotaled(false);
		assert.notOk(oSwitch.getState(), "The state of the switch is updated");
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
		const oSwitch = oQuickTotal.getItems()[0].getContent();

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

		oSwitch.setState(true);
		oSwitch.fireChange({state: true});
	});
});
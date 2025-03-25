/*global QUnit*/
sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/Button",
	"sap/m/library"
], function(nextUIUpdate, QUnitUtils, Menu, QuickGroup, QuickGroupItem, Button, library) {
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
		const aQuickActions = this.oQuickGroup.getEffectiveQuickActions();
		assert.deepEqual(aQuickActions.length, 2,
			"It returns an array that contains 2 quick actions");

		let oQuickAction = aQuickActions[0];
		assert.equal(oQuickAction.getLabel(), "A", "The label of the first QuickTotalItem is correct");
		assert.ok(oQuickAction.getContent()[0].isA("sap.m.Switch"), "The content is a Switch");
		assert.ok(oQuickAction.getContent()[0].getState(), "The state of the Switch is correct");
		assert.equal(oQuickAction.getCategory(), "Group", "The category is correct");
		assert.equal(oQuickAction.getContentSize(), "S", "The contentSize is correct");

		oQuickAction = aQuickActions[1];
		assert.equal(oQuickAction.getLabel(), "B", "The label of the second QuickTotalItem is correct");
		assert.ok(oQuickAction.getContent()[0].isA("sap.m.Switch"), "The content is a Switch");
		assert.notOk(oQuickAction.getContent()[0].getState(), "The state of the Switch is correct");
		assert.equal(oQuickAction.getCategory(), "Group", "The category is correct");
		assert.equal(oQuickAction.getContentSize(), "S", "The contentSize is correct");

		this.oQuickGroup.setVisible(false);
		assert.equal(this.oQuickGroup.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 quick actions");

		this.oQuickGroup.setVisible(true);
		this.oQuickGroup.removeAllItems();
		assert.equal(this.oQuickGroup.getEffectiveQuickActions().length, 0, "Returns an array that contains 0 quick actions");
	});

	QUnit.test("Content", function(assert) {
		let oQuickGroupItem = this.oQuickGroup.getItems()[0];
		let sLabel = oQuickGroupItem.getLabel();
		assert.equal(sLabel, "A", "The label of the first QuickGroupItem is correct");
		let oContent = this.oQuickGroup.getEffectiveQuickActions()[0].getContent()[0];
		assert.ok(oContent, "The first QuickGroupItem has content");
		assert.ok(oContent.isA("sap.m.Switch"), "The content of the first QuickGroupItem is a Switch");
		assert.ok(oContent.getState(), "The first switch is on");

		oQuickGroupItem = this.oQuickGroup.getItems()[1];
		sLabel = oQuickGroupItem.getLabel();
		assert.equal(sLabel, "B", "The label of the second QuickGroupItem is correct");
		oContent = this.oQuickGroup.getEffectiveQuickActions()[1].getContent()[0];
		assert.ok(oContent, "The second QuickGroupItem has content");
		assert.ok(oContent.isA("sap.m.Switch"), "The content of the second QuickGroupItem is a Switch");
		assert.ok(!oContent.getState(), "The second switch is off");
	});

	QUnit.test("QuickGroupItem setGrouped", function(assert) {
		const oQuickGroupItem = this.oQuickGroup.getItems()[0];
		const oSwitch = this.oQuickGroup.getEffectiveQuickActions()[0].getContent()[0];

		assert.ok(oSwitch.getState(), "The initial state of the switch is correct");
		oQuickGroupItem.setGrouped(false);
		assert.notOk(oSwitch.getState(), "The state of the switch is updated");
		oQuickGroupItem.setGrouped(true);
		assert.ok(oSwitch.getState(), "The state of the switch is updated");
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
		const oSwitch = oQuickGroup.getEffectiveQuickActions()[1].getContent()[0];

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

		oSwitch.setState(true);
		oSwitch.fireChange({state: true});
	});
});
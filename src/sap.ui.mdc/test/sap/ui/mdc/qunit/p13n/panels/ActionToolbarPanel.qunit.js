/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/ActionToolbarPanel",
	"sap/m/StandardListItem",
	"sap/m/ColumnListItem",
	"sap/ui/thirdparty/sinon",
	"sap/ui/base/Event",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/message/MessageType",
	"sap/m/Text"
], function (ActionToolbarPanel, StandardListItem, ColumnListItem, sinon, Event, nextUIUpdate, MessageType, Text) {
	"use strict";

	QUnit.module("ActionToolbarPanel API tests", {
		beforeEach: async function() {
			this.oActionToolbarPanel = new ActionToolbarPanel();
			this.oActionToolbarPanel.setP13nData([
				{
					label: "Test",
					name: "test",
					visible: true
				}, {
					label: "Test2",
					name: "test2",
					visible: true
				}, {
					label: "Test3",
					name: "test3",
					visible: false
				}, {
					label: "Test4",
					name: "test4",
					visible: true
				}
			]);

			this.oActionToolbarPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oActionToolbarPanel.destroy();
		}
	});

	QUnit.test("check drag & drop eventhandler for dragging disabled elements", function(assert) {

		// Setup Fake drop event
		const oDropItem = this.oActionToolbarPanel._oListControl.getItems()[0];
		const oDragItem = this.oActionToolbarPanel._oListControl.getItems()[2];
		oDragItem.getMultiSelectControl()?.setEnabled(false);
		const oFakeSession = {
			getDropControl: function() {
				return oDropItem;
			},
			getDragControl: function() {
				return oDragItem;
			},
			setIndicatorConfig: sinon.stub(),
			setDropControl: sinon.stub(),
			getDropPosition: sinon.stub()
		};

		const oFakeEvent = new Event("fakeDropEvent", this.oActionToolbarPanel, {
			dropPosition: "After",
			dragSession: oFakeSession,
			draggedControl: oDragItem,
			droppedControl: oDropItem
		});

		// fire event for drag and drop
		this.oActionToolbarPanel._onRearrange(oFakeEvent);

		// Test results: no repositioning
		const aItems = this.oActionToolbarPanel._oListControl.getItems();
		assert.equal(aItems[0].getCells()[0].getItems()[0].getText(), "Test");
		assert.equal(aItems[1].getCells()[0].getItems()[0].getText(), "Test2");
		assert.equal(aItems[2].getCells()[0].getItems()[0].getText(), "Test3");
	});

	QUnit.test("check drag & drop eventhandler for dropping on disabled elements", function(assert) {

		// Setup Fake drop event
		const oDropItem = this.oActionToolbarPanel._oListControl.getItems()[0];
		oDropItem.getMultiSelectControl()?.setEnabled(false);
		const oDragItem = this.oActionToolbarPanel._oListControl.getItems()[2];
		const oFakeSession = {
			getDropControl: function() {
				return oDropItem;
			},
			getDragControl: function() {
				return oDragItem;
			},
			setIndicatorConfig: sinon.stub(),
			setDropControl: sinon.stub(),
			getDropPosition: sinon.stub()
		};

		const oFakeEvent = new Event("fakeDropEvent", this.oActionToolbarPanel, {
			dragSession: oFakeSession,
			draggedControl: oDragItem,
			droppedControl: oDropItem
		});

		// fire event for drag and drop
		this.oActionToolbarPanel._onRearrange(oFakeEvent);

		// Test results: no repositioning
		const aItems = this.oActionToolbarPanel._oListControl.getItems();
		assert.equal(aItems[0].getCells()[0].getItems()[0].getText(), "Test");
		assert.equal(aItems[1].getCells()[0].getItems()[0].getText(), "Test3");
		assert.equal(aItems[2].getCells()[0].getItems()[0].getText(), "Test2");
	});

	QUnit.test("disables 'Clear All' button correctly without disabled elements", function(assert){
		// arrange
		this.oActionToolbarPanel.setMessageStrip(null);
		const oModelItems = this.oActionToolbarPanel._getP13nModel().getProperty("/items");
		oModelItems[0].enabled = true;

		// act
		this.oActionToolbarPanel._updateClearAllButton();

		// assert
		const bEnabled = this.oActionToolbarPanel._oListControl._getClearAllButton().getVisible();
		assert.ok(bEnabled, "'Clear-All' Button is enabled");
	});

	QUnit.test("disables 'Clear All' button correctly if disabled elements exist", function(assert){
		// arrange
		this.oActionToolbarPanel.setMessageStrip(null);
		const oModelItems = this.oActionToolbarPanel._getP13nModel().getProperty("/items");
		oModelItems[0].enabled = false;

		// act
		this.oActionToolbarPanel._updateClearAllButton();

		// assert
		const bEnabled = this.oActionToolbarPanel._oListControl._getClearAllButton().getVisible();
		assert.notOk(bEnabled, "'Clear-All' Button is disabled");
	});

	QUnit.test("_updateMessageStripForItemEnablement: shows no MessageStrip without disabled elements", function(assert){
		// arrange
		this.oActionToolbarPanel.setMessageStrip(null);
		const oModelItems = this.oActionToolbarPanel._getP13nModel().getProperty("/items");
		oModelItems[0].enabled = true;

		// act
		this.oActionToolbarPanel._updateMessageStripForItemEnablement();

		// assert
		const oMessageStrip = this.oActionToolbarPanel.getMessageStrip();
		assert.notOk(oMessageStrip, "MessageStrip does not exists");
	});

	QUnit.test("_updateMessageStripForItemEnablement: shows MessageStrip if disabled elements exist", function(assert){
		// arrange
		this.oActionToolbarPanel.setMessageStrip(null);
		const oModelItems = this.oActionToolbarPanel._getP13nModel().getProperty("/items");
		oModelItems[0].enabled = false;

		// act
		this.oActionToolbarPanel._updateMessageStripForItemEnablement();

		// assert
		const oMessageStrip = this.oActionToolbarPanel.getMessageStrip();
		assert.ok(oMessageStrip, "MessageStrip exists");
		assert.ok(oMessageStrip.getType() === MessageType.Warning, "MessageStrip type equals 'Warning'");
	});

	QUnit.module("ActionToolbarPanel API tests - _updateItemEnableState", {
		beforeEach: async function() {
			this.oActionToolbarPanel = new ActionToolbarPanel();
			this.oActionToolbarPanel.setP13nData([
				{
					label: "Test",
					name: "test",
					visible: true
				}, {
					label: "Test2",
					name: "test2",
					visible: true
				}, {
					label: "Test3",
					name: "test3",
					visible: false
				}, {
					label: "Test4",
					name: "test4",
					visible: true
				}
			]);
			const oTemplate = new ColumnListItem({
				cells: [
					new Text({
						text: "{" + this.oActionToolbarPanel.P13N_MODEL  + ">label}"
					})
				]
			});

			this.oActionToolbarPanel._setTemplate(oTemplate);
			this.oActionToolbarPanel._setPanelColumns([
				"Name", "Country", "Year"
			]);
			this.oActionToolbarPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oActionToolbarPanel.destroy();
		}
	});

	QUnit.test("works correctly for 'sap.m.ColumnListItem' controls", function(assert){
		// arrange
		const fnDisableListElementSpy = sinon.spy(this.oActionToolbarPanel, "_updateCheckboxEnablement");

		// act
		this.oActionToolbarPanel._updateItemEnableState();

		// assert
		assert.ok(fnDisableListElementSpy.called, "_updateCheckboxEnablement of ActionToolbarPanel not called");
	});

	QUnit.test("works correctly for 'sap.m.ColumnListItem' controls", function(assert){
		// arrange
		this.oActionToolbarPanel._oListControl.removeAllItems();
		this.oActionToolbarPanel._oListControl.addItem(new StandardListItem());

		const fnDisableListElementSpy = sinon.spy(this.oActionToolbarPanel, "_updateCheckboxEnablement");

		// act
		this.oActionToolbarPanel._updateItemEnableState();

		// assert
		assert.ok(fnDisableListElementSpy.notCalled, "_updateCheckboxEnablement of ActionToolbarPanel not called");
	});
});

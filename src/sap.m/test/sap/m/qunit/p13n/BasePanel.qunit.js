/* global QUnit */
sap.ui.define([
	"sap/m/p13n/BasePanel",
	"sap/m/StandardListItem",
	"sap/ui/thirdparty/sinon",
	"sap/ui/base/Event",
	"sap/m/MessageStrip",
	"sap/ui/core/Core"
], function (BasePanel, StandardListItem, sinon, Event, MessageStrip, oCore) {
	"use strict";

	QUnit.module("BasePanel API tests", {
		beforeEach: function() {
			this.oBasePanel = new BasePanel();
			this.oBasePanel.setP13nData([
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
			var oTemplate = new StandardListItem({
				title: "{" + this.oBasePanel.P13N_MODEL  + ">label}"
			});

			this.oBasePanel._setTemplate(oTemplate);
			this.oBasePanel._setPanelColumns([
				"Name", "Country", "Year"
			]);
			this.oBasePanel.placeAt("qunit-fixture");
			oCore.applyChanges();
			this.oBtnShowSelected = this.oBasePanel._oListControl.getHeaderToolbar().getContent()[6];
		},
		afterEach: function() {
			this.oBasePanel.destroy();
		}
	});

	QUnit.test("instantiate", function(assert) {
		assert.ok(this.oBasePanel, "Panel has been instantiated");
		assert.ok(this.oBasePanel._oListControl, "Inner table has been instantiated");

		assert.ok(!this.oBasePanel.getModel(), "BasePanel does not create an undefined model");
		assert.ok(this.oBasePanel._getP13nModel().isA("sap.ui.model.json.JSONModel"), "BasePanel creates a named model '$p13n' ");

		// Check if columns have been created with correct text in header
		var aColumns = this.oBasePanel._oListControl.getColumns();
		assert.equal(aColumns[0].getHeader().getText(), "Name", "Added 'Name' column");
		assert.equal(aColumns[1].getHeader().getText(), "Country", "Added 'Country' column");
		assert.equal(aColumns[2].getHeader().getText(), "Year", "Added 'Year' column");
	});

	QUnit.test("check drag & drop eventhandler", function(assert) {

		// Setup Fake drop event
		var oDropItem = this.oBasePanel._oListControl.getItems()[0];
		var oDragItem = this.oBasePanel._oListControl.getItems()[2];
		var oFakeSession = {
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

		var oFakeEvent = new Event("fakeDropEvent", this.oBasePanel, {
			dropPosition: "After",
			dragSession: oFakeSession,
			draggedControl: oDragItem,
			droppedControl: oDropItem
		});

		// fire event for drag and drop
		this.oBasePanel._onRearrange(oFakeEvent);

		// Test results
		var aItems = this.oBasePanel._oListControl.getItems();
		assert.equal(aItems[0].getTitle(), "Test");
		assert.equal(aItems[1].getTitle(), "Test3");
		assert.equal(aItems[2].getTitle(), "Test2");

	});

	QUnit.test("Change selection", function(assert) {
		var done = assert.async();
		this.oBasePanel.attachEvent("change", function(oEvt) {
			assert.ok(oEvt);// we just need to check if the event is being fired
			done();
		});

		// fire single event
		this.oBasePanel._oListControl.fireSelectionChange({
			selectAll: false,
			listItems: this.oBasePanel._oListControl.getItems()
		});
	});

	QUnit.test("press item and check the enablement of move buttons (item at the top)", function(assert) {
		// fire single event
		this.oBasePanel._oListControl.fireItemPress({
			listItem: this.oBasePanel._oListControl.getItems()[0]
		});

		assert.equal(this.oBasePanel._getMoveTopButton().getEnabled(), false, "'move top' button is disabled (item is at the top)");
		assert.equal(this.oBasePanel._getMoveUpButton().getEnabled(), false, "'move up' button is disabled (item is at the top)");
		assert.equal(this.oBasePanel._getMoveDownButton().getEnabled(), true, "'move down' button is enabled");
		assert.equal(this.oBasePanel._getMoveBottomButton().getEnabled(), true, "'move bottom' button is enabled");
	});

	QUnit.test("press item and check the enablement of move buttons (item at the bottom)", function(assert) {
		// fire single event
		this.oBasePanel._oListControl.fireItemPress({
			listItem: this.oBasePanel._oListControl.getItems()[3]
		});

		assert.equal(this.oBasePanel._getMoveTopButton().getEnabled(), true, "'move top' button is enabled");
		assert.equal(this.oBasePanel._getMoveUpButton().getEnabled(), true, "'move up' button is enabled");
		assert.equal(this.oBasePanel._getMoveDownButton().getEnabled(), false, "'move down' button is disabled (item is at the top)");
		assert.equal(this.oBasePanel._getMoveBottomButton().getEnabled(), false, "'move bottom' button is disabled (item is at the top)");
	});

	QUnit.test("press item and check the enablement of move buttons (item inbetween)", function(assert) {
		// fire single event
		this.oBasePanel._oListControl.fireItemPress({
			listItem: this.oBasePanel._oListControl.getItems()[1]
		});

		assert.equal(this.oBasePanel._getMoveTopButton().getEnabled(), true, "'move top' button is enabled");
		assert.equal(this.oBasePanel._getMoveUpButton().getEnabled(), true, "'move up' button is enabled");
		assert.equal(this.oBasePanel._getMoveDownButton().getEnabled(), true, "'move down' button is enabled");
		assert.equal(this.oBasePanel._getMoveBottomButton().getEnabled(), true, "'move bottom' button is enabled");

	});

	QUnit.test("Check 'messagerStrip' aggregation, provide a message strip", function(assert){

		var oMessageStrip = new MessageStrip();
		this.oBasePanel.setMessageStrip(oMessageStrip);

		var oFirstItem = this.oBasePanel.getAggregation("_content").getItems()[0];

		assert.deepEqual(oFirstItem, oMessageStrip, "The message strip has been placed in the content area of the BasePanel");

	});

	QUnit.test("Check 'messagerStrip' aggregation, remove a message strip", function(assert){

		var oMessageStrip = new MessageStrip();
		this.oBasePanel.setMessageStrip(oMessageStrip);
		this.oBasePanel.setMessageStrip();

		assert.equal(this.oBasePanel.getAggregation("_content").getItems().length, 1, "Only table in content area of the BasePanel");

	});

	QUnit.test("Check 'messagerStrip' aggregation, provide a message strip twice (only once added)", function(assert){

		var oMessageStrip = new MessageStrip();
		this.oBasePanel.setMessageStrip(oMessageStrip);

		var oMessageStrip2 = new MessageStrip();
		this.oBasePanel.setMessageStrip(oMessageStrip2);

		assert.equal(this.oBasePanel.getAggregation("_content").getItems().length, 2, "Only one strip has been added to the BasePanel");

	});

	QUnit.test("Check 'messagerStrip' aggregation, provide a message strip twice (new one is being used)", function(assert){

		var oMessageStrip = new MessageStrip({
			text: "First"
		});
		this.oBasePanel.setMessageStrip(oMessageStrip);

		var oMessageStrip2 = new MessageStrip({
			text: "Second"
		});
		this.oBasePanel.setMessageStrip(oMessageStrip2);

		assert.ok(oMessageStrip.bIsDestroyed, "First MessageStrip has been destroyed, as a second one has been provided");
		assert.equal(this.oBasePanel.getAggregation("_content").getItems()[0].getText(), "Second", "Second provided message strip is being used");

	});

	QUnit.test("Check 'enableReorder' --> hover event delegate provided/removed", function(assert){
		this.oBasePanel.setEnableReorder(true);
		assert.equal(this.oBasePanel.getAggregation("_template").aDelegates.length, 1, "Hover event delegate registered");

		this.oBasePanel.setEnableReorder(false);
		assert.equal(this.oBasePanel.getAggregation("_template").aDelegates.length, 0, "No hover event delegate registered");
	});

});

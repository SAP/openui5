/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/BasePanel", "sap/m/StandardListItem", "sap/ui/thirdparty/sinon", "sap/ui/base/Event","sap/ui/model/json/JSONModel"
], function (BasePanel, StandardListItem, sinon, Event, JSONModel) {
	"use strict";

	this.oBasePanel = new BasePanel();
	var oTemplate = new StandardListItem({
		title: "{label}"
	});

	var oModel = new JSONModel({
		items: [
			{
				label: "Test",
				name: "test",
				selected: true
			}, {
				label: "Test2",
				name: "test2",
				selected: true
			}, {
				label: "Test3",
				name: "test3",
				selected: true
			}, {
				label: "Test4",
				name: "test4",
				selected: false
			}
		]
	});
	this.oBasePanel.setP13nModel(oModel);
	this.oBasePanel.setTemplate(oTemplate);
	this.oBasePanel.setPanelColumns([
		"Name", "Country", "Year"
	]);
	this.oBasePanel.placeAt("qunit-fixture");
	sap.ui.getCore().applyChanges();

	QUnit.module("BasePanel API tests", {
		beforeEach: function() {
			this.oBtnShowSelected = this.oBasePanel._oListControl.getHeaderToolbar().getContent()[6];
		}.bind(this),
		afterEach: function() {

		}
	},this);

	QUnit.test("instantiate", function(assert) {
		assert.ok(this.oBasePanel, "Panel has been instantiated");
		assert.ok(this.oBasePanel._oListControl, "Inner table has been instantiated");

		// Check if columns have been created with correct text in header
		var aColumns = this.oBasePanel._oListControl.getColumns();
		assert.equal(aColumns[0].getHeader().getText(), "Name", "Added 'Name' column");
		assert.equal(aColumns[1].getHeader().getText(), "Country", "Added 'Country' column");
		assert.equal(aColumns[2].getHeader().getText(), "Year", "Added 'Year' column");
	}.bind(this));

	QUnit.test("check 'Reorder / Select mode' eventhandler", function(assert) {
		//Reorder mode
		this.oBtnShowSelected.firePress();
		assert.equal(this.oBasePanel._oListControl.getItems().length, 3, "only selected items are visible in the dialog");// we only see the selected item
		this.oBasePanel._oListControl.getItems().forEach(function(oItem){
			assert.equal(oItem.getType(), "Active", "Type is active in 'Reorder' mode");//type is active in 'Reorder'
		});

		//all buttons for movement should be disabled upon reordering
		assert.equal(this.oBasePanel._moveTopButton.getEnabled(), false);
		assert.equal(this.oBasePanel._moveUpButton.getEnabled(), false);
		assert.equal(this.oBasePanel._moveDownButton.getEnabled(), false);
		assert.equal(this.oBasePanel._moveBottomButton.getEnabled(), false);

		//Select mode
		this.oBtnShowSelected.firePress();
		assert.equal(this.oBasePanel._oListControl.getItems().length, 4, "all items are visible in the dialog");// we see all items
		this.oBasePanel._oListControl.getItems().forEach(function(oItem){
			assert.equal(oItem.getType(), "Inactive", "Type is inactive in 'Select' mode");//type is inactive in 'Select'
		});
	}.bind(this));

	QUnit.test("check drag & drop eventhandler", function(assert) {
		// Go to "Reorder" mode first
		this.oBtnShowSelected.firePress();

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

	}.bind(this));

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
	}.bind(this));

	QUnit.test("press item and check the enablement of move buttons (item at the top)", function(assert) {
		// fire single event
		this.oBasePanel._oListControl.fireItemPress({
			listItem: this.oBasePanel._oListControl.getItems()[0]
		});

		assert.equal(this.oBasePanel._moveTopButton.getEnabled(), false, "'move top' button is disabled (item is at the top)");
		assert.equal(this.oBasePanel._moveUpButton.getEnabled(), false, "'move up' button is disabled (item is at the top)");
		assert.equal(this.oBasePanel._moveDownButton.getEnabled(), true, "'move down' button is enabled");
		assert.equal(this.oBasePanel._moveBottomButton.getEnabled(), true, "'move bottom' button is enabled");
	}.bind(this));

	QUnit.test("press item and check the enablement of move buttons (item at the bottom)", function(assert) {
		// fire single event
		this.oBasePanel._oListControl.fireItemPress({
			listItem: this.oBasePanel._oListControl.getItems()[this.oBasePanel._oListControl.getItems().length - 1]
		});

		assert.equal(this.oBasePanel._moveTopButton.getEnabled(), true, "'move top' button is enabled");
		assert.equal(this.oBasePanel._moveUpButton.getEnabled(), true, "'move up' button is enabled");
		assert.equal(this.oBasePanel._moveDownButton.getEnabled(), false, "'move down' button is disabled (item is at the top)");
		assert.equal(this.oBasePanel._moveBottomButton.getEnabled(), false, "'move bottom' button is disabled (item is at the top)");
	}.bind(this));

	QUnit.test("press item and check the enablement of move buttons (item inbetween)", function(assert) {
		// fire single event
		this.oBasePanel._oListControl.fireItemPress({
			listItem: this.oBasePanel._oListControl.getItems()[1]
		});

		assert.equal(this.oBasePanel._moveTopButton.getEnabled(), true, "'move top' button is enabled");
		assert.equal(this.oBasePanel._moveUpButton.getEnabled(), true, "'move up' button is enabled");
		assert.equal(this.oBasePanel._moveDownButton.getEnabled(), true, "'move down' button is enabled");
		assert.equal(this.oBasePanel._moveBottomButton.getEnabled(), true, "'move bottom' button is enabled");

		this.oBasePanel.destroy(); //TODO: consider to remodulize 'BasePanel.qunit'
	}.bind(this));

});

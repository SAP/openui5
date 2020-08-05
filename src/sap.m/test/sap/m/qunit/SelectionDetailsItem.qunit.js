/*global QUnit, sinon */
sap.ui.define([
	"sap/m/SelectionDetailsItem",
	"sap/m/SelectionDetailsItemLine",
	"sap/ui/core/Item",
	"sap/m/library"
], function(SelectionDetailsItem, SelectionDetailsItemLine, Item, library) {
	"use strict";

	// shortcut for sap.m.SelectionDetailsActionLevel
	var SelectionDetailsActionLevel = library.SelectionDetailsActionLevel;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	QUnit.module("Default values", {
		beforeEach: function() {
			this.oItem = new SelectionDetailsItem();
		},
		afterEach: function() {
			this.oItem.destroy();
			this.oItem = null;
		}
	});

	QUnit.test("Default value of property navigationEnabled", function(assert) {
		assert.equal(this.oItem.getEnableNav(), false, "Default value is correct.");
	});

	QUnit.module("Function _getListItem and list item life cycle", {
		beforeEach: function() {
			this.oItem = new SelectionDetailsItem();
		},
		afterEach: function() {
			if (this.oItem) {
				this.oItem.destroy();
			}
			this.oItem = null;
		}
	});

	QUnit.test("Creates new list item if it not yet exists", function(assert) {
		//Arrange
		this.oItem._oListItem = null;

		//Act
		this.oItem._getListItem();

		//Assert
		assert.ok(this.oItem._oListItem, "Function _getListItem creates a new list item.");
	});

	QUnit.test("List item is member of element", function(assert) {
		//Arrange
		var oListItem = this.oItem._getListItem();

		//Assert
		assert.deepEqual(this.oItem._oListItem, oListItem, "The correct list item has been added as local member.");
	});

	QUnit.test("List item is destroyed as well if element is destroyed", function(assert) {
		//Arrange
		var oListItem = this.oItem._getListItem(),
			oSpy = sinon.spy(oListItem, "destroy");
		//Act
		this.oItem.destroy();
		//Assert
		assert.ok(oSpy.calledOnce, "ListItem is destroyed.");
	});

	QUnit.test("List item is destroyed with element", function(assert) {
		//Arrange
		var oListItem = this.oItem._getListItem();
		sinon.spy(oListItem, "destroy");

		//Act
		this.oItem.destroy();

		//Assert
		assert.equal(oListItem.destroy.callCount, 1, "ListItem has been destroyed with element.");
	});

	QUnit.test("Press handler for ListItem results in event called on SelectionDetailsItem", function(assert) {
		//Arrange
		var oListItem = this.oItem._getListItem();
		sinon.spy(this.oItem, "fireEvent");

		//Act
		oListItem.firePress();

		//Assert
		assert.deepEqual(this.oItem.fireEvent.getCalls()[0].args[0], "_navigate", "press event of ListItem results in navigate event on SelectionDetailsItem.");
	});

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.oItem = new SelectionDetailsItem({
				lines: [
					new SelectionDetailsItemLine({
						label: "My Label",
						value: "100"
					}),
					new SelectionDetailsItemLine({
						label: "Fancy line",
						value: "200",
						unit: "Brötchen"
					}),
					new SelectionDetailsItemLine({
						label: "Boring label",
						displayValue: "20 K"
					})
				],
				actions: [
					new Item({
						key: "1",
						text: "item action 1"
					}), new Item({
						key: "2",
						text: "item action 2"
					})
				]
			});
			this.oListItem = this.oItem._getListItem();
			this.oListItem.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oListItem = null;
			this.oItem.destroy();
			this.oItem = null;
		}
	});

	QUnit.test("Item rendering", function(assert) {
		//Arrange
		var $ListItem = this.oListItem.$();

		//Assert
		assert.ok($ListItem.length > 0, "A list item is rendered.");
		assert.ok($ListItem.hasClass("sapMSDItem"), "The correct class has been rendered.");
		assert.equal($ListItem.find(".sapMSDItemActions").length, 1, "The correct number of action containers has been rendered.");
	});

	QUnit.test("Line rendering", function(assert) {
		//Arrange
		var $ListItem = this.oListItem.$();

		//Assert
		assert.equal($ListItem.find(".sapMSDItemLine").length, 3, "The correct number of lines has been rendered.");
		assert.equal($ListItem.find(".sapMSDItemLineLabel").length, 3, "The correct number of labels has been rendered.");
		assert.equal($ListItem.find(".sapMSDItemLineValue").length, 3, "The correct number of values has been rendered.");
		assert.equal($ListItem.find(".sapMSDItemLineBold").length, 1, "The correct number of bold values has been rendered.");
		assert.equal($ListItem.find(".sapMSDItemLineUnit").length, 1, "The correct number of units has been rendered.");
	});

	QUnit.test("Action rendering", function(assert) {
		//Arrange
		var $ListItem = this.oListItem.$();

		//Assert
		assert.ok(this.oItem.getAggregation("_overflowToolbar"), "OverflowToolbar has been created");
		assert.ok(this.oItem.getAggregation("_overflowToolbar").getContent().length, 3, "Toolbar spacer and two buttons have been created");
		assert.equal($ListItem.find(".sapMSDItemActions").length, 1, "The action buttons toolbar has been rendered");
	});

	QUnit.test("Internal SelectionDetailsListItem has correct type property for enabled navigation", function(assert) {
		//Arrange
		this.oItem.setEnableNav(true);
		var oSetPropertySpy = sinon.spy(this.oListItem, "setProperty");
		this.oListItem.invalidate();

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oSetPropertySpy.withArgs("type", ListType.Navigation, true).callCount, 1, "ListItem's type property has been correctly updated.");
	});

	QUnit.test("Internal SelectionDetailsListItem has correct type property for disabled navigation", function(assert) {
		//Arrange
		this.oItem.setEnableNav(false);
		var oSetPropertySpy = sinon.spy(this.oListItem, "setProperty");
		this.oListItem.invalidate();

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(oSetPropertySpy.withArgs("type", ListType.Inactive, true).callCount, 1, "ListItem's type property has been correctly updated.");
	});

	QUnit.module("Item interaction", {
		beforeEach : function() {
			this.oItem = new SelectionDetailsItem({
				actions: [new Item("itemAction", {
					text: "Action 1"
				})]
			});
			this.oSelectionDetailsListItem = this.oItem._getListItem();
			this.oSelectionDetailsListItem.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oSelectionDetailsListItem.destroy();
			this.oSelectionDetailsListItem = null;
		}
	});

	QUnit.test("Press on the Action results in _ActionPress event", function(assert) {
		// Arrange
		var sActionTypeExpected = "_actionPress",
			oActionExpected = this.oItem.getAggregation("actions")[0],
			oButton = sap.ui.getCore().byId(this.oItem.getId() + "-action-0"),
			oSpy = sinon.spy(SelectionDetailsItem.prototype, "fireEvent");
		// Act
		oButton.firePress();
		//Assert
		assert.deepEqual(oSpy.getCall(0).args[0], sActionTypeExpected, "The _actionPress event of SelectionDetailsItem has been triggered");
		assert.deepEqual(oSpy.getCall(0).args[1].action, oActionExpected, "The _actionPress event contains correct 'action' parameter");
		assert.deepEqual(oSpy.getCall(0).args[1].items[0], this.oItem, "The _actionPress event contains correct 'items' parameter");
		assert.deepEqual(oSpy.getCall(0).args[1].level, SelectionDetailsActionLevel.Item, "The _actionPress event contains correct 'level' parameter");
	});

	QUnit.module("Item facade", {
		beforeEach : function() {
			this.oItem = new SelectionDetailsItem();
		},
		afterEach : function() {
			this.oItem.destroy();
			this.oItem = null;
		}
	});

	QUnit.test("Facade is not returning the original instance", function(assert) {
		// Act
		var oFacade = this.oItem.getFacade();
		//Assert
		assert.notDeepEqual(this.oItem, oFacade, "Proxy object is returned.");
	});

	QUnit.test("Facade proxy object is buffered on instance level", function(assert) {
		// Act
		var oFacadeFirstCall = this.oItem.getFacade();
		var oFacadeSecondCall = this.oItem.getFacade();
		//Assert
		assert.equal(oFacadeFirstCall, oFacadeSecondCall, "Same proxy object is returned");
	});

	QUnit.test("Facade methods exist", function(assert) {
		// Act
		var aFacadeMethods = this.oItem._aFacadeMethods;

		//Assert
		assert.ok(aFacadeMethods.indexOf("addCustomData") > -1, "Facade contains method 'addCustomData'");
		assert.ok(aFacadeMethods.indexOf("getCustomData") > -1, "Facade contains method 'getCustomData'");
		assert.ok(aFacadeMethods.indexOf("indexOfCustomData") > -1, "Facade contains method 'indexOfCustomData'");
		assert.ok(aFacadeMethods.indexOf("insertCustomData") > -1, "Facade contains method 'insertCustomData'");
		assert.ok(aFacadeMethods.indexOf("removeCustomData") > -1, "Facade contains method 'removeCustomData'");
		assert.ok(aFacadeMethods.indexOf("removeAllCustomData") > -1, "Facade contains method 'removeAllCustomData'");
		assert.ok(aFacadeMethods.indexOf("destroyCustomData") > -1, "Facade contains method 'destroyCustomData'");
		assert.ok(aFacadeMethods.indexOf("data") > -1, "Facade contains method 'data'");
		assert.ok(aFacadeMethods.indexOf("addEventDelegate") > -1, "Facade contains method 'addEventDelegate'");
		assert.ok(aFacadeMethods.indexOf("removeEventDelegate") > -1, "Facade contains method 'removeEventDelegate'");
		assert.ok(aFacadeMethods.indexOf("setEnableNav") > -1, "Facade contains method 'setEnableNav'");
		assert.ok(aFacadeMethods.indexOf("getEnableNav") > -1, "Facade contains method 'getEnableNav'");
		assert.ok(aFacadeMethods.indexOf("addAction") > -1, "Facade contains method 'addAction'");
		assert.ok(aFacadeMethods.indexOf("removeAction") > -1, "Facade contains method 'removeAction'");
	});

});
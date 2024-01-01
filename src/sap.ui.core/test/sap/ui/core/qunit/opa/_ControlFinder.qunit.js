/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/_ControlFinder",
	"sap/m/library",
	"sap/m/Button",
	"sap/m/SearchField",
	"sap/m/List",
	"sap/m/ObjectListItem",
	"sap/m/Dialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/_LogCollector",
	"sap/ui/qunit/utils/nextUIUpdate"
], function ($, _ControlFinder,  mobileLibrary, Button, SearchField, List, ObjectListItem, Dialog, JSONModel, PropertyStrictEquals, _LogCollector, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	QUnit.module("_ControlFinder - controls", {
		beforeEach: function () {
			this.oButton = new Button("myId", {text : "foo", type: ButtonType.Emphasized});
			this.oButtonWithSpecialId = new Button("test::button.ID");
			this.oObjectListItem = new ObjectListItem({title: "testItem", number: 8});
			this.oDialogButton = new Button({
				type: ButtonType.Emphasized,
				text: "Close",
				press: function () {
					this.oDialog.close();
				}.bind(this)
			});
			this.oDialog = new Dialog({
				title: "static area test",
				beginButton: this.oDialogButton
			});
			this.oButton.placeAt("qunit-fixture");
			this.oButtonWithSpecialId.placeAt("qunit-fixture");
			this.oObjectListItem.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButtonWithSpecialId.destroy();
			this.oObjectListItem.destroy();
			this.oDialog.destroy();
		}
	});

	QUnit.test("Should find no matching elements", function (assert) {
		var aControls = _ControlFinder._findControls({
			id: "myId",
			propertyStrictEquals: {name: "text", value: "bar"}
		});

		assert.ok(Array.isArray(aControls), "Should return empty array if no elements match");
		assert.strictEqual(aControls.length, 0, "Should not match any elements");
	});

	QUnit.test("Should use declarative matcher syntax", function (assert) {
		var oIsMatchingSpy = this.spy(PropertyStrictEquals.prototype, "isMatching");
		var aControls = _ControlFinder._findControls({
			controlType: "sap.m.Button",
			propertyStrictEquals: [
				{name: "text", value: "foo"},
				{name: "type", value: ButtonType.Emphasized}
			]
		});

		assert.strictEqual(aControls.length, 1, "Should match the correct element");
		assert.strictEqual(aControls[0], this.oButton);
		assert.strictEqual(oIsMatchingSpy.callCount, 3, "Should pass all Buttons through matcher pipeline");
		assert.strictEqual(oIsMatchingSpy.getCalls()[0].thisValue.getName(), "text");
		assert.strictEqual(oIsMatchingSpy.getCalls()[1].thisValue.getName(), "type");
	});

	QUnit.test("Should get control for element", function (assert) {
		var oControl = _ControlFinder._getControlForElement(document.getElementById("myId-content"));
		assert.strictEqual(oControl, this.oButton);
	});

	QUnit.test("Should get control for element ID", function (assert) {
		var oControl = _ControlFinder._getControlForElement("myId-content");
		assert.strictEqual(oControl, this.oButton);
	});

	QUnit.test("Should get control when element ID has meta characters", function (assert) {
		var oControl = _ControlFinder._getControlForElement("test::button.ID");
		assert.strictEqual(oControl, this.oButtonWithSpecialId);
	});

	QUnit.test("Should get control properties", function (assert) {
		var sText = _ControlFinder._getControlProperty(this.oButton, "text");
		assert.strictEqual(sText, "foo");
		var bEnabled = _ControlFinder._getControlProperty(this.oButton, "enabled");
		assert.strictEqual(bEnabled, true);
	});

	QUnit.test("Should apply ancestor matcher", function (assert) {
		var oObjectNumber = _ControlFinder._findControls({
			controlType: "sap.m.ObjectNumber"
		})[0];
		var aResult = _ControlFinder._findControls({
			controlType: "sap.m.ObjectNumber",
			ancestor: {
				controlType: "sap.m.ObjectListItem"
			}
		});

		assert.strictEqual(aResult.length, 1, "Should match the correct element");
		assert.strictEqual(aResult[0], oObjectNumber);
	});

	QUnit.test("Should not find any control if ancestor is not found", function (assert) {
		var aResult = _ControlFinder._findControls({
			controlType: "sap.m.ObjectNumber",
			ancestor: {
				controlType: "sap.m.StandardListItem"
			}
		});

		assert.strictEqual(aResult.length, 0, "Should not find any controls with non-existent ancestor");
	});

	QUnit.test("Should accept only ancestor ID for backwards compatibility", function (assert) {
		var oObjectNumber = _ControlFinder._findControls({
			controlType: "sap.m.ObjectNumber"
		})[0];
		var aResult = _ControlFinder._findControls({
			controlType: "sap.m.ObjectNumber",
			ancestor: [this.oObjectListItem.getId()]
		});

		assert.strictEqual(aResult[0], oObjectNumber, "Should match the correct element");
	});

	QUnit.test("Should apply descendant matcher", function (assert) {
		var oListItem = _ControlFinder._findControls({
			controlType: "sap.m.ObjectListItem"
		})[0];
		var aResult = _ControlFinder._findControls({
			controlType: "sap.m.ObjectListItem",
			descendant: {
				controlType: "sap.m.ObjectNumber"
			}
		});

		assert.strictEqual(aResult.length, 1, "Should match the correct element");
		assert.strictEqual(aResult[0], oListItem);
	});

	QUnit.test("Should expand matchers recursively", function (assert) {
		var fnOriginal =  _ControlFinder._findControls;
		var aCalls = [];
		_ControlFinder._findControls = function () {
			aCalls.push(Array.prototype.slice.call(arguments)[0]);
			return fnOriginal.apply(this, arguments);
		};
		var oListItem = _ControlFinder._findControls({
			controlType: "sap.m.ObjectListItem"
		})[0];
		var aResult = _ControlFinder._findControls({
			controlType: "sap.m.ObjectListItem",
			descendant: {
				controlType: "sap.m.ObjectNumber",
				ancestor: {
					controlType: "sap.m.ObjectListItem",
					descendant: {
						controlType: "sap.m.ObjectNumber"
					}
				}
			}
		});

		assert.strictEqual(aResult.length, 1, "Should match the correct element");
		assert.strictEqual(aResult[0], oListItem);
		assert.strictEqual(aCalls.length, 8, "Should call _findControls recursively");
		// go down 3 levels to the selector of the bottom-most descendant
		// and then go up and build up "expanded" selectors along the way
		assert.ok(aCalls[7].matchers.descendant && aCalls[6].matchers.ancestor && aCalls[5].matchers.descendant);

		_ControlFinder._findControls = fnOriginal;
	});

	QUnit.test("Should not find any control if descendant is not found", function (assert) {
		var aResult = _ControlFinder._findControls({
			controlType: "sap.m.ObjectListItem",
			descendant: {
				controlType: "sap.m.Input"
			}
		});

		assert.strictEqual(aResult.length, 0, "Should not find any controls with non-existent descendant");
	});

	QUnit.test("Should collect logs while searching for elements", function (assert) {
		var fnStartSpy = sinon.spy(_LogCollector.prototype, "start");
		var fnStopSpy = sinon.spy(_LogCollector.prototype, "stop");
		var fnGetSpy = sinon.spy(_LogCollector.prototype, "getAndClearLog");

		_ControlFinder._findElements({id: "myId"});
		sinon.assert.calledOnce(fnStartSpy);
		sinon.assert.calledOnce(fnStopSpy);
		assert.ok(fnStartSpy.calledBefore(fnStopSpy));
		var sLog = _ControlFinder._getLatestLog();
		sinon.assert.calledOnce(fnGetSpy);
		assert.ok(sLog.match("Found control with the global ID 'myId'"), "Should include logs");

		fnStartSpy.restore();
		fnStopSpy.restore();
		fnGetSpy.restore();
	});

	QUnit.test("Should check if control is in static area", function (assert) {
		assert.ok(!_ControlFinder._isControlInStaticArea(this.oButton), "Should return false for controls outside of static area");
		assert.ok(!_ControlFinder._isControlInStaticArea(this.oDialogButton), "Should return false for controls in static area that are not rendered");
		this.oDialog.open();
		assert.ok(_ControlFinder._isControlInStaticArea(this.oDialogButton), "Should return true for controls in open static area");
		this.oDialog.destroy();
		$("#sap-ui-static").remove();
		assert.ok(!_ControlFinder._isControlInStaticArea(this.oDialogButton), "Should return false if there is no static area");
	});

	QUnit.module("_ControlFinder - interaction adapters", {
		beforeEach: function () {
			var oJSONModel = new JSONModel({
				items: [{id: 1, name: "Item 11"}, {id: 2, name: "Item 22"}]
			});
			this.oList = new List("myList");
			this.oList.bindItems({
				path : "/items",
				template : new ObjectListItem({
					title: "{name}"
				})
			});
			this.oSearchField = new SearchField("myId");
			this.oSearchField.placeAt("qunit-fixture");
			this.oList.placeAt("qunit-fixture");

			this.oUIArea = this.oList.getUIArea();
			this.oUIArea.setModel(oJSONModel);

			return nextUIUpdate();
		},
		afterEach: function () {
			this.oUIArea.setModel();
			this.oSearchField.destroy();
			this.oList.destroy();
		}
	});

	QUnit.test("Should return the DOM ref", function (assert) {
		var aElements = _ControlFinder._findElements({
			id: "myId",
			interaction: "root"
		});

		assert.strictEqual(aElements.length, 1, "Should match the element");
		assert.strictEqual(aElements[0], this.oSearchField.getDomRef(), "Should return the DOM ref");
	});

	QUnit.test("Should return the focus DOM ref", function (assert) {
		var aElements = _ControlFinder._findElements({
			id: "myId",
			interaction: "focus"
		});

		assert.strictEqual(aElements.length, 1, "Should match the element");
		assert.strictEqual(aElements[0], this.oSearchField.getFocusDomRef(), "Should return the focus DOM ref");
	});

	QUnit.test("Should return the press adapter", function (assert) {
		var aElements = _ControlFinder._findElements({
			id: "myId",
			interaction: "press"
		});

		assert.strictEqual(aElements.length, 1, "Should match the element");
		assert.strictEqual(aElements[0].tagName, "DIV", "Should return the search button");
		assert.strictEqual(aElements[0].id, "myId-search", "Should return the search button");
	});

	QUnit.test("Should return the generic action adapter", function (assert) {
		var aElements = _ControlFinder._findElements({
			id: "myId",
			interaction: "auto"
		});

		assert.strictEqual(aElements.length, 1, "Should match the element");
		assert.strictEqual(aElements[0].tagName, "DIV", "Should return the search button");
		assert.strictEqual(aElements[0].id, "myId-search", "Should return the search button");
	});

	QUnit.test("Should return the child with matching ID suffix", function (assert) {
		var aElements = _ControlFinder._findElements({
			id: "myId",
			interaction: {idSuffix: "reset"}
		});

		assert.strictEqual(aElements.length, 1, "Should match the element");
		assert.strictEqual(aElements[0].tagName, "DIV", "Should return the reset button");
		assert.strictEqual(aElements[0].id, "myId-reset", "Should return the reset button");
	});

	QUnit.test("Should get stable element ID suffix", function (assert) {
		["input", "input-content"].forEach(function (sSuffix) {
			var sControlRelativeID = _ControlFinder._getDomElementIDSuffix({
				id: "app.myView--supplier::filter-field-" + sSuffix
			}, {
				getId: function () {
					return "app.myView--supplier::filter-field";
				}
			});
			assert.strictEqual(sControlRelativeID, sSuffix, "Should get control relative ID suffix " + sSuffix);
		});
	});
});

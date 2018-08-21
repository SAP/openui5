/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/_ControlFinder",
	"sap/m/Button",
	"sap/m/SearchField",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationLengthEquals"
], function (_ControlFinder, Button, SearchField, PropertyStrictEquals, AggregationLengthEquals) {
	"use strict";

	QUnit.module("_ControlFinder - controls", {
		beforeEach: function () {
			this.oButton = new Button("myId", {text : "foo", type: sap.m.ButtonType.Emphasized});
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
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
				{name: "type", value: sap.m.ButtonType.Emphasized}
			]
		});

		assert.strictEqual(aControls.length, 1, "Should match the correct element");
		assert.strictEqual(aControls[0], this.oButton);
		sinon.assert.calledTwice(oIsMatchingSpy);
		assert.strictEqual(oIsMatchingSpy.getCalls()[0].thisValue.getName(), "text");
		assert.strictEqual(oIsMatchingSpy.getCalls()[1].thisValue.getName(), "type");
	});

	QUnit.test("Should get control for element", function (assert) {
		var oControl = _ControlFinder._getControlForElement("myId-content");
		assert.strictEqual(oControl, this.oButton);
	});

	QUnit.test("Should get control properties", function (assert) {
		var sText = _ControlFinder._getControlProperty(this.oButton, "text");
		assert.strictEqual(sText, "foo");
		var bEnabled = _ControlFinder._getControlProperty(this.oButton, "enabled");
		assert.strictEqual(bEnabled, true);
	});

	QUnit.module("_ControlFinder - interaction adapters", {
		beforeEach: function () {
			this.oSearchField = new SearchField("myId");
			this.oSearchField.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSearchField.destroy();
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

});

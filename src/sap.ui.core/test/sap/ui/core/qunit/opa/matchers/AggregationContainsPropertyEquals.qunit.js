/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/matchers/AggregationContainsPropertyEqual",
	"sap/m/ComboBox",
	"sap/ui/core/ListItem",
	"sap/m/ObjectHeader",
	"sap/m/Column"
], function (AggregationContainsPropertyEqual, ComboBox, ListItem, ObjectHeader, Column) {
	"use strict";

	function beforeEach () {
		this.oColumn = new Column({header: new ObjectHeader({title: "foo"})});
		this.oComboBox = new ComboBox("myCB", {
			items : [
				new ListItem(),
				new ListItem({ text : "" }),
				new ListItem({ key : "foo" }),
				new ListItem({ text : "foo" })
			]
		});
	}

	function afterEach () {
		this.oColumn.destroy();
		this.oComboBox.destroy();
	}

	QUnit.module("positive tests", {
		beforeEach: beforeEach,
		afterEach: afterEach
	});

	QUnit.test("Should match an aggregation with items that match the property", function(assert) {
		// System under Test
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName : "items",
			propertyName : "text",
			propertyValue : "foo"
		});

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(bResult, "Did match because there was a matching item");
	});

	QUnit.test("Should not match an aggregation filled with multiple items that match the property", function(assert) {
		// System under Test
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName : "items",
			propertyName : "text",
			propertyValue : "foo"
		});

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(bResult, "Did match because there were two matching items");
	});

	QUnit.test("Should match aggregation with cardinality 0..1", function (assert) {
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName: "header",
			propertyName: "title",
			propertyValue: "foo"
		});

		var bResult = oMatcher.isMatching(this.oColumn);

		assert.ok(bResult, "Matched one control");
	});

	QUnit.module("negative tests", {
		beforeEach: beforeEach,
		afterEach: afterEach
	});

	QUnit.test("Should not match a filled with items that do not have the property", function(assert) {
		// System under Test
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName : "items",
			propertyName : "someUnknownProperty",
			propertyValue : "foo"
		});

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(!bResult, "Did not match because there is no item with such a property");
	});

	QUnit.test("Should not match a filled with items that do not match the property", function(assert) {
		// Arrange

		// System under Test
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName : "items",
			propertyName : "text",
			propertyValue : "bar"
		});
		var oSpy = this.spy(oMatcher._oLogger, "debug");

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(!bResult, "Did not match because there was no matching item");
		sinon.assert.calledWith(oSpy, "Control 'Element sap.m.ComboBox#myCB' has no property 'text'" +
				" with the value 'bar' in the aggregation 'items'");
	});

	QUnit.test("Should not match an empty aggregation", function(assert) {
		// Arrange
		this.oComboBox.getItems().forEach(function (oItem) {
			oItem.destroy();
		});

		// System under Test
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName : "items",
			propertyName : "text",
			propertyValue : "foo"
		});

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(!bResult, "Did not match because there was no item");
	});

	QUnit.test("Should complain if control does not have an aggregation", function(assert) {
		// System under Test
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName : "anAggregationThatWillNeverBeAddedToTheCombobox",
			propertyName : "text",
			propertyValue : "foo"
		});
		var oErrorSpy = this.spy(oMatcher._oLogger, "error");

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.strictEqual(bResult, false, "Did not match");
		sinon.assert.calledWith(oErrorSpy, "Control 'Element sap.m.ComboBox#myCB' " +
				"does not have an aggregation called 'anAggregationThatWillNeverBeAddedToTheCombobox'");
	});

	QUnit.test("Should match when value contains binding symbols", function (assert) {
		this.oComboBox.getItems()[2].setText("{foo");
		var oMatcher = new AggregationContainsPropertyEqual({
			aggregationName : "items",
			propertyName : "text",
			propertyValue : "{foo"
		});

		var bResult = oMatcher.isMatching(this.oComboBox);

		assert.ok(bResult, "Did match because there was a matching item");
	});

});

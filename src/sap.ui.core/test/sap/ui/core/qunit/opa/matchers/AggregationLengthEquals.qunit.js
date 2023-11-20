/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/m/ComboBox",
	"sap/ui/core/ListItem",
	"sap/m/ObjectHeader",
	"sap/m/Column"
], function (AggregationLengthEquals, ComboBox, ListItem, ObjectHeader, Column) {
	"use strict";

	QUnit.module("AggregationLengthEquals", {
		beforeEach: function () {
			this.oComboBox = new ComboBox("myCB");
			this.oColumn = new Column({header: new ObjectHeader({title: "foo"})});
		},
		afterEach: function () {
			this.oComboBox.destroy();
			this.oColumn.destroy();
		}
	});

	QUnit.test("Should match a filled aggregation with length 1, testing length 1", function(assert) {
		// Arrange
		this.oComboBox.addItem(new ListItem());

		// System under Test
		var oMatcher = new AggregationLengthEquals({ name : "items", length : 1 });

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(bResult, "Did match because there was one item in the aggregation");
	});

	QUnit.test("Should not match a filled aggregation with length 1, testing length 2", function(assert) {
		// Arrange
		this.oComboBox.addItem(new ListItem());

		// System under Test
		var oMatcher = new AggregationLengthEquals({ name : "items", length : 2 });
		var oDebugSpy = this.spy(oMatcher._oLogger,"debug");

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(!bResult, "Did not match because there was one item and we tested for length 2");
		sinon.assert.calledWith(oDebugSpy, "Control 'Element sap.m.ComboBox#myCB' has 1 Objects in the aggregation 'items' but it should have 2");
	});

	QUnit.test("Should match an empty aggregation, testing length 0", function(assert) {
		// System under Test
		var oMatcher = new AggregationLengthEquals({ name : "items", length : 0 });

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(bResult, "Did match because aggregation was there but had no item");
	});

	QUnit.test("Should complain if control does not have an aggregation", function(assert) {
		// System under Test
		var oMatcher = new AggregationLengthEquals({ name : "anAggregationThatWillNeverBeAddedToTheCombobox" , length : 0});
		var oErrorSpy = this.spy(oMatcher._oLogger,"error");

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.strictEqual(bResult, false, "Did not match");
		sinon.assert.calledWith(oErrorSpy, "Control 'Element sap.m.ComboBox#myCB' does not have an aggregation called 'anAggregationThatWillNeverBeAddedToTheCombobox'");
	});

	QUnit.test("Should match aggregation with cardinality 0..1", function (assert) {
		var oMatcher = new AggregationLengthEquals({name: "header", length: 1});

		var bResult = oMatcher.isMatching(this.oColumn);

		assert.ok(bResult, "Matched one control");
	});

});

/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/matchers/AggregationFilled",
	"sap/m/ComboBox",
	"sap/ui/core/ListItem",
	"sap/m/ObjectHeader",
	"sap/m/Column"
], function (AggregationFilled, ComboBox, ListItem, ObjectHeader, Column) {
	"use strict";

	QUnit.module("AggregationFilled", {
		beforeEach: function () {
			this.oComboBox = new ComboBox("myCB");
			this.oColumn = new Column({header: new ObjectHeader({title: "foo"})});
		},
		afterEach: function () {
			this.oComboBox.destroy();
			this.oColumn.destroy();
		}
	});

	QUnit.test("Should match a filled aggregation", function(assert) {
		// Arrange
		this.oComboBox.addItem(new ListItem());

		// System under Test
		var oMatcher = new AggregationFilled({ name : "items" });

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(bResult, "Matched because there was an item");
	});

	QUnit.test("Should match aggregation with cardinality 0..1", function (assert) {
		var oMatcher = new AggregationFilled({name: "header"});

		var bResult = oMatcher.isMatching(this.oColumn);

		assert.ok(bResult, "Matched one control");
	});

	QUnit.test("Should not match an empty aggregation", function(assert) {
		// System under Test
		var oMatcher = new AggregationFilled({ name : "items" });
		var oDebugSpy = this.spy(oMatcher._oLogger,"debug");

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(!bResult, "Did not match because there was no item");
		sinon.assert.calledWith(oDebugSpy, "Control 'Element sap.m.ComboBox#myCB' aggregation 'items' is empty");
	});

	QUnit.test("Should complain if control does not have an aggregation", function(assert) {
		// System under Test
		var oMatcher = new AggregationFilled({ name : "anAggregationThatWillNeverBeAddedToTheCombobox" });
		var oErrorSpy = this.spy(oMatcher._oLogger,"error");

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.strictEqual(bResult, false, "Did not match");
		sinon.assert.calledWith(oErrorSpy, "Control 'Element sap.m.ComboBox#myCB' does not have an aggregation called 'anAggregationThatWillNeverBeAddedToTheCombobox'");
	});

});

/*global QUnit */
sap.ui.define([
	"sap/ui/test/matchers/AggregationEmpty",
	"sap/m/ComboBox",
	"sap/ui/core/ListItem"
], function (AggregationEmpty, ComboBox, ListItem) {
	"use strict";

	QUnit.module("AggregationEmpty", {
		beforeEach: function () {
			this.oComboBox = new ComboBox("myCB");
		},
		afterEach: function () {
			this.oComboBox.destroy();
		}
	});

	QUnit.test("Should not match a filled aggregation", function(assert) {
		// Arrange
		this.oComboBox.addItem(new ListItem());

		// System under Test
		var oMatcher = new AggregationEmpty({ name : "items" });

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(!bResult, "Did not match because there was an item");
	});

	QUnit.test("Should match an empty aggregation", function(assert) {
		// System under Test
		var oMatcher = new AggregationEmpty({ name : "items" });

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.ok(bResult, "Matched because there was no item");
	});

	QUnit.test("Should complain if control does not have an aggregation", function(assert) {
		// System under Test
		var oMatcher = new AggregationEmpty({ name : "anAggregationThatWillNeverBeAddedToTheCombobox" });

		// Act
		var bResult = oMatcher.isMatching(this.oComboBox);

		// Assert
		assert.strictEqual(bResult, false, "Did not match");
	});

});

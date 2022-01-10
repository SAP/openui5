/* global QUnit */

sap.ui.define([
	"sap/ui/integration/cards/filters/FilterBarFactory",
	"sap/ui/integration/cards/filters/DateRangeFilter",
	"sap/ui/integration/cards/filters/SearchFilter",
	"sap/ui/integration/cards/filters/SelectFilter"
], function (
	FilterBarFactory,
	DateRangeFilter,
	SearchFilter,
	SelectFilter
) {
	"use strict";

	QUnit.module("FilterBarFactory");

	QUnit.test("Filter type", function (assert) {
		assert.strictEqual(FilterBarFactory.prototype._getClass(), SelectFilter, "'SelectFilter' should be returned when type is not specified");
		assert.strictEqual(FilterBarFactory.prototype._getClass("Select"), SelectFilter, "'SelectFilter' should be returned when type is 'Select'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("integer"), SelectFilter, "'SelectFilter' should be returned when type is 'integer'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("string"), SelectFilter, "'SelectFilter' should be returned when type is 'string'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("DateRange"), DateRangeFilter, "'DateRangeFilter' should be returned when type is 'DateRange'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("invalidType"), undefined, "'undefined' should be returned when type is not valid");
		assert.strictEqual(FilterBarFactory.prototype._getClass("Search"), SearchFilter, "'SearchFilter' should be returned when type is 'Search'");
	});

});
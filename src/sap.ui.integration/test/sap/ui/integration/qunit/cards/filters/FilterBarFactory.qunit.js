/* global QUnit */

sap.ui.define([
	"sap/ui/integration/cards/filters/FilterBarFactory",
	"sap/ui/integration/cards/filters/DateRangeFilter",
	"sap/ui/integration/cards/filters/SelectFilter"
], function (
	FilterBarFactory,
	DateRangeFilter,
	SelectFilter
) {
	"use strict";

	QUnit.module("FilterBarFactory");

	QUnit.test("Filter type", function (assert) {
		assert.strictEqual(FilterBarFactory.prototype._getClass(), SelectFilter, "'SelectFilter' should be returned when type is not specified");
		assert.strictEqual(FilterBarFactory.prototype._getClass("select"), SelectFilter, "'SelectFilter' should be returned when type is 'select'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("integer"), SelectFilter, "'SelectFilter' should be returned when type is 'integer'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("string"), SelectFilter, "'SelectFilter' should be returned when type is 'string'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("dateRange"), DateRangeFilter, "'DateRangeFilter' should be returned when type is 'dateRange'");
		assert.strictEqual(FilterBarFactory.prototype._getClass("invalidType"), undefined, "'undefined' should be returned when type is not valid");
	});

});
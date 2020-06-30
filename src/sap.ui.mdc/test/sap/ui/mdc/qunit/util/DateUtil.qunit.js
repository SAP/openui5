/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/mdc/util/DateUtil",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/model/type/Date",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTime"
], function(
	jQuery,
	DateUtil,
	UniversalDate,
	DateType,
	V4DateType,
	V2DateTimeType
) {
	"use strict";

	QUnit.module("toUniversalDate", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({style: "long"});
		var oUniversalDate = DateUtil.typeToUniversalDate(new Date(2019, 1, 16), oType);
		assert.ok(oUniversalDate instanceof UniversalDate, "UniversalDate returned");
		assert.equal(oUniversalDate.getUTCFullYear(), 2019, "Year");
		assert.equal(oUniversalDate.getUTCMonth(), 1, "Month");
		assert.equal(oUniversalDate.getUTCDate(), 16, "Date");

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({style: "long"}, {displayFormat: "Date"});
		var oUniversalDate = DateUtil.typeToUniversalDate(new Date(Date.UTC(2019, 11, 16)), oType);
		assert.ok(oUniversalDate instanceof UniversalDate, "UniversalDate returned");
		assert.equal(oUniversalDate.getUTCFullYear(), 2019, "Year");
		assert.equal(oUniversalDate.getUTCMonth(), 11, "Month");
		assert.equal(oUniversalDate.getUTCDate(), 16, "Date");

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({style: "long"});
		var oUniversalDate = DateUtil.typeToUniversalDate("2019-12-16", oType);
		assert.ok(oUniversalDate instanceof UniversalDate, "UniversalDate returned");
		assert.equal(oUniversalDate.getUTCFullYear(), 2019, "Year");
		assert.equal(oUniversalDate.getUTCMonth(), 11, "Month");
		assert.equal(oUniversalDate.getUTCDate(), 16, "Date");

	});

	QUnit.module("toType", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({style: "long"});
		var oUniversalDate = new UniversalDate(UniversalDate.UTC(2019, 11, 16));
		var oDate = DateUtil.universalDateToType(oUniversalDate, oType);
		assert.ok(oDate instanceof Date, "Date returned");
		assert.equal(oDate.getFullYear(), 2019, "Year");
		assert.equal(oDate.getMonth(), 11, "Month");
		assert.equal(oDate.getDate(), 16, "Date");

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({style: "long"}, {displayFormat: "Date"});
		var oUniversalDate = new UniversalDate(UniversalDate.UTC(2019, 5, 16));
		var oDate = DateUtil.universalDateToType(oUniversalDate, oType);
		assert.ok(oDate instanceof Date, "Date returned");
		assert.equal(oDate.getUTCFullYear(), 2019, "Year");
		assert.equal(oDate.getUTCMonth(), 5, "Month");
		assert.equal(oDate.getUTCDate(), 16, "Date");

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({style: "long"});
		var oUniversalDate = new UniversalDate(UniversalDate.UTC(2019, 1, 16));
		var sDate = DateUtil.universalDateToType(oUniversalDate, oType);
		assert.equal(sDate, "2019-02-16", "Date");

		oUniversalDate = new UniversalDate(UniversalDate.UTC(2019, 11, 16));
		sDate = DateUtil.universalDateToType(oUniversalDate, oType);
		assert.equal(sDate, "2019-12-16", "Date");
	});


});

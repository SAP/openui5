/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/DateUtil",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Time",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/model/odata/type/Time",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], function(
	DateUtil,
	BaseType,
	UI5Date,
	DateType,
	DateTimeType,
	TimeType,
	V4DateType,
	V2DateTimeType,
	DateTimeOffsetType,
	V2TimeType,
	V4TimeType,
	DateTimeWithTimezoneType
) {
	"use strict";

	QUnit.module("dateToType", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({pattern: "yyyy MM dd"});
		var vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16), oType, BaseType.Date);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16", "string"), "Result: " + vResult); // compare with result of parsing the same Date (do not need to know what type dies internally)
		oType.destroy();

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd"}, {displayFormat: "Date"});
		var vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 11, 16), oType, BaseType.Date);
		assert.deepEqual(vResult, oType.parseValue("2019 12 16", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({pattern: "yyyy MM dd"});
		var vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 11, 16), oType, BaseType.Date);
		assert.equal(vResult, oType.parseValue("2019 12 16", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("DateTime", function(assert) {

		var oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V2-DateTime", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V2-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V4-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"}, {V4: true});
		var vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true}, {V4: true});
		vResult = DateUtil.dateToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.module("typeToDate", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({pattern: "yyyy MM dd"});
		var oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16", "string"), oType, BaseType.Date); // compare with result of parsing the same Date (do not need to know what type dies internally)
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16), "Result: " + oDate.toString());
		oType.destroy();

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd"}, {displayFormat: "Date"});
		var oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16", "string"), oType, BaseType.Date);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16), "Result: " + oDate.toString());
		oType.destroy();

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({pattern: "yyyy MM dd"});
		var oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16", "string"), oType, BaseType.Date);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16), "Result: " + oDate.toString());
		oType.destroy();

	});

	QUnit.test("DateTime", function(assert) {

		var oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

		oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

	});

	QUnit.test("V2-DateTime", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

		oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

	});

	QUnit.test("V2-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"});
		var oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

	});

	QUnit.test("V4-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"}, {V4: true});
		var oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true}, {V4: true});
		oDate = DateUtil.typeToDate(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(oDate, UI5Date.getInstance(2019, 1, 16, 10, 10, 10), "Result: " + oDate.toString());
		oType.destroy();

	});

	QUnit.module("ISOToType", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("DateTime", function(assert) {

		var oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.ISOToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.ISOToType(UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V2-DateTime", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.ISOToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.ISOToType(UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V2-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.ISOToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.ISOToType(UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V4-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"}, {V4: true});
		var vResult = DateUtil.ISOToType(UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true}, {V4: true});
		vResult = DateUtil.ISOToType(UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), oType, BaseType.DateTime);
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.module("typeToISO", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("DateTime", function(assert) {

		var oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), "Result: " + sISO);
		oType.destroy();

		oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), "Result: " + sISO);
		oType.destroy();

	});

	QUnit.test("V2-DateTime", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), "Result: " + sISO);
		oType.destroy();

		oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), "Result: " + sISO);
		oType.destroy();

	});

	QUnit.test("V2-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"});
		var sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), "Result: " + sISO);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), "Result: " + sISO);
		oType.destroy();

	});

	QUnit.test("V4-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"}, {V4: true});
		var sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(2019, 1, 16, 10, 10, 10).toISOString(), "Result: " + sISO);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true}, {V4: true});
		sISO = DateUtil.typeToISO(oType.parseValue("2019 02 16 10 10 10", "string"), oType, BaseType.DateTime);
		assert.deepEqual(sISO, UI5Date.getInstance(Date.UTC(2019, 1, 16, 10, 10, 10)).toISOString(), "Result: " + sISO);
		oType.destroy();

	});

	QUnit.module("stringToType", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({pattern: "yyyy MM dd"});
		var vResult = DateUtil.stringToType("2019+02+16", oType, "yyyy+MM+dd");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16", "string"), "Result: " + vResult); // compare with result of parsing the same Date (do not need to know what type dies internally)
		oType.destroy();

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd"}, {displayFormat: "Date"});
		var vResult = DateUtil.stringToType("2019+12+16", oType, "yyyy+MM+dd");
		assert.deepEqual(vResult, oType.parseValue("2019 12 16", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({pattern: "yyyy MM dd"});
		var vResult = DateUtil.stringToType("2019+12+16", oType, "yyyy+MM+dd");
		assert.equal(vResult, oType.parseValue("2019 12 16", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("DateTime", function(assert) {

		var oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V2-DateTime", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V2-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"});
		var vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V4-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"}, {V4: true});
		var vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true}, {V4: true});
		vResult = DateUtil.stringToType("2019+02+16+10+10+10", oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("2019 02 16 10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("Time", function(assert) {

		var oType = new TimeType({pattern: "hh mm ss"});
		var vResult = DateUtil.stringToType("10+10+10", oType, "hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V2-Time", function(assert) {

		var oType = new V2TimeType({pattern: "hh mm ss"});
		var vResult = DateUtil.stringToType("10+10+10", oType, "hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.test("V4-Time", function(assert) {

		var oType = new V4TimeType({pattern: "hh mm ss"});
		var vResult = DateUtil.stringToType("10+10+10", oType, "hh+mm+ss");
		assert.deepEqual(vResult, oType.parseValue("10 10 10", "string"), "Result: " + vResult);
		oType.destroy();

	});

	QUnit.module("typeToString", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({pattern: "yyyy MM dd"});
		var sString = DateUtil.typeToString(oType.parseValue("2019 02 16", "string"), oType, "yyyy+MM+dd");
		assert.deepEqual(sString, "2019+02+16", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd"}, {displayFormat: "Date"});
		var sString = DateUtil.typeToString(oType.parseValue("2019 02 16", "string"), oType, "yyyy+MM+dd");
		assert.deepEqual(sString, "2019+02+16", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({pattern: "yyyy MM dd"});
		var sString = DateUtil.typeToString(oType.parseValue("2019 02 16", "string"), oType, "yyyy+MM+dd");
		assert.deepEqual(sString, "2019+02+16", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("DateTime", function(assert) {

		var oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

		oType = new DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("V2-DateTime", function(assert) {

		var oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss"});
		var sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

		oType = new V2DateTimeType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("V2-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"});
		var sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true});
		sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("V4-DateTimeOffset", function(assert) {

		var oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss"}, {V4: true});
		var sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

		oType = new DateTimeOffsetType({pattern: "yyyy MM dd hh mm ss", UTC: true}, {V4: true});
		sString = DateUtil.typeToString(oType.parseValue("2019 02 16 10 10 10", "string"), oType, "yyyy+MM+dd+hh+mm+ss");
		assert.deepEqual(sString, "2019+02+16+10+10+10", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("Time", function(assert) {

		var oType = new TimeType({pattern: "hh mm ss"});
		var sString = DateUtil.typeToString(oType.parseValue("10 10 10", "string"), oType, "hh+mm+ss");
		assert.deepEqual(sString, "10+10+10", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("V2-Time", function(assert) {

		var oType = new V2TimeType({pattern: "hh mm ss"});
		var sString = DateUtil.typeToString(oType.parseValue("10 10 10", "string"), oType, "hh+mm+ss");
		assert.deepEqual(sString, "10+10+10", "Result: " + sString);
		oType.destroy();

	});

	QUnit.test("V4-Time", function(assert) {

		var oType = new V4TimeType({pattern: "hh mm ss"});
		var sString = DateUtil.typeToString(oType.parseValue("10 10 10", "string"), oType, "hh+mm+ss");
		assert.deepEqual(sString, "10+10+10", "Result: " + sString);
		oType.destroy();

	});

	QUnit.module("other functions", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("showTimezone", function(assert) {

		var oType = new DateTimeWithTimezoneType();
		assert.ok(DateUtil.showTimezone(oType), "default settings");
		oType.destroy();

		oType = new DateTimeWithTimezoneType({showDate: true, showTime: true, showTimezone: false});
		assert.notOk(DateUtil.showTimezone(oType), "date, time, no timezone");
		oType.destroy();


		oType = new DateTimeWithTimezoneType({showDate: true, showTime: false, showTimezone: true});
		assert.ok(DateUtil.showTimezone(oType), "date, no time, timezone");
		oType.destroy();

		oType = new DateTimeWithTimezoneType({showDate: false, showTime: true, showTimezone: true});
		assert.ok(DateUtil.showTimezone(oType), "no date, time, timezone");
		oType.destroy();

		oType = new DateTimeWithTimezoneType({showDate: false, showTime: false, showTimezone: false});
		assert.notOk(DateUtil.showTimezone(oType), "no date, no time, timezone");
		oType.destroy();

		oType = new DateTimeWithTimezoneType({showDate: true, showTime: false, showTimezone: false});
		assert.notOk(DateUtil.showTimezone(oType), "date, no time, no timezone");
		oType.destroy();

		oType = new DateTimeWithTimezoneType({showDate: false, showTime: true, showTimezone: false});
		assert.notOk(DateUtil.showTimezone(oType), "no date, time, no timezone");
		oType.destroy();

	});

});

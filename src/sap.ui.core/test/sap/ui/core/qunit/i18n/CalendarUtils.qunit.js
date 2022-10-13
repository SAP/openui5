/*global QUnit */
sap.ui.define([
	"sap/ui/core/date/CalendarUtils",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/CalendarWeekNumbering"
], function(
	CalendarUtils,
	Locale,
	LocaleData,
	CalendarWeekNumbering
) {
	"use strict";

	QUnit.module("sap.ui.core.date.CalendarUtils");

	QUnit.test("getWeekConfigurationValues Fixed", function (assert) {
		assert.deepEqual(
			CalendarUtils.getWeekConfigurationValues(CalendarWeekNumbering.ISO_8601),
			{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4});
		assert.deepEqual(
			CalendarUtils.getWeekConfigurationValues(CalendarWeekNumbering.WesternTraditional),
			{firstDayOfWeek: 0, minimalDaysInFirstWeek: 1});
		assert.deepEqual(
			CalendarUtils.getWeekConfigurationValues(CalendarWeekNumbering.MiddleEastern),
			{firstDayOfWeek: 6, minimalDaysInFirstWeek: 1});
	});

	QUnit.test("getWeekConfigurationValues Dynamic", function (assert) {
		this.stub(LocaleData, "getInstance").returns({
			getFirstDayOfWeek : function() {
				return "~firstDay";
			},
			getMinimalDaysInFirstWeek : function() {
				return "~minimalDays";
			}
		});
		assert.deepEqual(CalendarUtils.getWeekConfigurationValues(CalendarWeekNumbering.Default),
			{firstDayOfWeek: "~firstDay", minimalDaysInFirstWeek: "~minimalDays"});
		assert.deepEqual(CalendarUtils.getWeekConfigurationValues(),
			{firstDayOfWeek: "~firstDay", minimalDaysInFirstWeek: "~minimalDays"});
	});

	QUnit.test("getWeekConfigurationValues Invalid value", function (assert) {
		assert.strictEqual(CalendarUtils.getWeekConfigurationValues("~foo"), undefined);
	});

	QUnit.test("getWeekConfigurationValues from locale", function (assert) {
		this.mock(LocaleData).expects("getInstance").withExactArgs("~oLocale").returns({
			getFirstDayOfWeek : function() {
				return "~firstDay";
			},
			getMinimalDaysInFirstWeek : function() {
				return "~minimalDays";
			}
		});
		assert.deepEqual(
			CalendarUtils.getWeekConfigurationValues(CalendarWeekNumbering.Default, "~oLocale"),
			{firstDayOfWeek: "~firstDay", minimalDaysInFirstWeek: "~minimalDays"});
	});

	QUnit.test("getWeekConfigurationValues from locale, no calendarWeekNumbering", function (assert) {
		var oLocale = new Locale("de");
		this.mock(LocaleData).expects("getInstance").withExactArgs(oLocale).returns({
			getFirstDayOfWeek : function() {
				return "~firstDay";
			},
			getMinimalDaysInFirstWeek : function() {
				return "~minimalDays";
			}
		});
		assert.deepEqual(
			CalendarUtils.getWeekConfigurationValues(undefined, oLocale),
			{firstDayOfWeek: "~firstDay", minimalDaysInFirstWeek: "~minimalDays"});
	});
});
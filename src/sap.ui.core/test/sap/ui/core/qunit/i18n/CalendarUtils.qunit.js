/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/CalendarUtils",
	"sap/ui/core/date/CalendarWeekNumbering"
], function(Formatting, LocaleData, CalendarUtils, CalendarWeekNumbering) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.core.date.CalendarUtils");

	//*********************************************************************************************
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

	//*********************************************************************************************
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
	});

	//*********************************************************************************************
	QUnit.test("getWeekConfigurationValues from Configuration", function (assert) {
		var oCalendarUtilsMock = this.mock(CalendarUtils);

		// avoid falsy unexpected call failure of getWeekConfigurationValues, see code under test
		oCalendarUtilsMock.expects("getWeekConfigurationValues").withExactArgs(undefined, "~oLocale").callThrough();
		this.mock(Formatting).expects("getCalendarWeekNumbering").withExactArgs().returns("ISO_8601");
		oCalendarUtilsMock.expects("getWeekConfigurationValues")
			.withExactArgs("ISO_8601", "~oLocale").returns("~WeekConfig");

		// code under test
		assert.deepEqual(CalendarUtils.getWeekConfigurationValues(undefined, "~oLocale"), "~WeekConfig");
	});

	//*********************************************************************************************
	QUnit.test("getWeekConfigurationValues Invalid value", function (assert) {
		assert.strictEqual(CalendarUtils.getWeekConfigurationValues("~foo"), undefined);
	});

	//*********************************************************************************************
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
});
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/date/CalendarWeekNumbering"
], function(CalendarWeekNumbering) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.core.date.CalendarWeekNumbering");

	//*********************************************************************************************
	QUnit.test("CalendarWeekNumbering - getWeekConfigurationValues", function (assert) {
		assert.deepEqual(Object.keys(CalendarWeekNumbering),
			["Default", "ISO_8601", "MiddleEastern", "WesternTraditional"],
			"getWeekConfigurationValues is not an enumerable property");
		assert.throws(function () {
			CalendarWeekNumbering.getWeekConfigurationValues = "foo";
		}, "getWeekConfigurationValues is not a writeable property");
		assert.throws(function () {
			Object.defineProperty(CalendarWeekNumbering, "getWeekConfigurationValues", {value : {foo : "bar"}});
		}, "getWeekConfigurationValues is not a configurable property");
		assert.throws(function () {
			delete CalendarWeekNumbering.getWeekConfigurationValues;
		}, "getWeekConfigurationValues is not a configurable property");

		// week configuration values cannot be changed via reference
		CalendarWeekNumbering.getWeekConfigurationValues(CalendarWeekNumbering.ISO_8601).firstDayOfWeek = "foo";
		assert.deepEqual(CalendarWeekNumbering.getWeekConfigurationValues(CalendarWeekNumbering.ISO_8601),
			{
				firstDayOfWeek : 1,
				minimalDaysInFirstWeek : 4
			});
		assert.deepEqual(CalendarWeekNumbering.getWeekConfigurationValues(CalendarWeekNumbering.MiddleEastern),
			{
				firstDayOfWeek : 6,
				minimalDaysInFirstWeek : 1
			});
		assert.deepEqual(CalendarWeekNumbering.getWeekConfigurationValues(CalendarWeekNumbering.WesternTraditional),
			{
				firstDayOfWeek : 0,
				minimalDaysInFirstWeek : 1
			});
		assert.deepEqual(CalendarWeekNumbering.getWeekConfigurationValues(CalendarWeekNumbering.Default), undefined);
		assert.deepEqual(CalendarWeekNumbering.getWeekConfigurationValues(), undefined);
	});
});
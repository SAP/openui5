/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/date/CalendarWeekNumbering"
], function(CalendarWeekNumbering) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.base.i18n.date.CalendarWeekNumbering");

	//*********************************************************************************************
	QUnit.test("CalendarWeekNumbering - getWeekConfigurationValues", function (assert) {
		assert.deepEqual(Object.keys(CalendarWeekNumbering),
			["Default", "ISO_8601", "MiddleEastern", "WesternTraditional"]);
		const descriptor = Object.getOwnPropertyDescriptor(CalendarWeekNumbering, "getWeekConfigurationValues");
		assert.ok(descriptor !== undefined);
		assert.strictEqual(descriptor.writable, false);
		assert.strictEqual(descriptor.configurable, false);
		assert.strictEqual(descriptor.enumerable, false);
		assert.strictEqual(typeof descriptor.value, "function");
		// week configuration values cannot be changed via reference
		CalendarWeekNumbering.getWeekConfigurationValues(CalendarWeekNumbering.ISO_8601).firstDayOfWeek = 6;
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
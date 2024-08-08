/*!
 * ${copyright}
 */

// Provides type sap.ui.core.date.CalendarWeekNumbering.
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/base/i18n/date/CalendarWeekNumbering"
], function(
	DataType,
	CalendarWeekNumbering
) {
	"use strict";

	DataType.registerEnum("sap.ui.core.date.CalendarWeekNumbering", CalendarWeekNumbering);

	return CalendarWeekNumbering;
});
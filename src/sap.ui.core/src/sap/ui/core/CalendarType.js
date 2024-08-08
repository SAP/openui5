/*!
 * ${copyright}
 */

// Provides type sap.ui.core.CalendarType.
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/base/i18n/date/CalendarType"
], function(
	DataType,
	CalendarType
) {
	"use strict";
	DataType.registerEnum("sap.ui.core.CalendarType", CalendarType);

	return CalendarType;
});
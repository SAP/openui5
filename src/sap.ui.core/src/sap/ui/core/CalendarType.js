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
	/**
	 * The types of <code>Calendar</code>.
	 *
	 * @enum {string}
	 * @name sap.ui.core.CalendarType
	 * @public
	 * @deprecated As of Version 1.120. Please use {@link module:sap/base/18n/date/CalendarType} instead.
	 * @borrows module:sap/base/i18n/date/CalendarType.Gregorian as Gregorian
	 * @borrows module:sap/base/i18n/date/CalendarType.Islamic as Islamic
	 * @borrows module:sap/base/i18n/date/CalendarType.Japanese as Japanese
	 * @borrows module:sap/base/i18n/date/CalendarType.Persian as Persian
	 * @borrows module:sap/base/i18n/date/CalendarType.Buddhist as Buddhist
	 */

	DataType.registerEnum("sap.ui.core.CalendarType", CalendarType);

	return CalendarType;
});
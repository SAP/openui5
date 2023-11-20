/*!
 * ${copyright}
 */

// Provides type module:sap/base/i18n/date/CalendarWeekNumbering.
sap.ui.define([], function() {
	"use strict";

	/**
	 * The <code>CalendarWeekNumbering</code> enum defines how to calculate calendar weeks. Each
	 * value defines:
	 * <ul>
	 * <li>The first day of the week,</li>
	 * <li>the first week of the year.</li>
	 * </ul>
	 *
	 * @enum {string}
	 * @public
	 * @alias module:sap/base/i18n/date/CalendarWeekNumbering
	 * @since 1.120
	 */
	var CalendarWeekNumbering = {

		/**
		 * The default calendar week numbering:
		 *
		 * The framework determines the week numbering scheme; currently it is derived from the
		 * active format locale. Future versions of UI5 might select a different week numbering
		 * scheme.
		 *
		 * @public
		 */
		Default : "Default",

		/**
		 * Official calendar week numbering in most of Europe (ISO 8601 standard):
		 * <ul>
		 * <li>Monday is first day of the week,
		 * <li>the week containing January 4th is first week of the year.
		 * </ul>
		 *
		 * @public
		 */
		ISO_8601 : "ISO_8601",

		/**
		 * Official calendar week numbering in much of the Middle East (Middle Eastern calendar):
		 * <ul>
		 * <li>Saturday is first day of the week,
		 * <li>the week containing January 1st is first week of the year.
		 * </ul>
		 *
		 * @public
		 */
		MiddleEastern : "MiddleEastern",

		/**
		 * Official calendar week numbering in the United States, Canada, Brazil, Israel, Japan, and
		 * other countries (Western traditional calendar):
		 * <ul>
		 * <li>Sunday is first day of the week,
		 * <li>the week containing January 1st is first week of the year.
		 * </ul>
		 *
		 * @public
		 */
		WesternTraditional : "WesternTraditional"
	};

	/**
	 * Returns an object containing the week configuration values for the given calendar week
	 * numbering algorithm.
	 *
	 * @param {module:sap/base/i18n/date/CalendarWeekNumbering} [sCalendarWeekNumbering=Default]
	 *   The calendar week numbering algorithm
	 * @returns {{firstDayOfWeek: 0|1|2|3|4|5|6, minimalDaysInFirstWeek: 1|2|3|4|5|6|7}|undefined}
	 *   The week configuration values or <code>undefined</code> if the given calendar week
	 *   numbering algorithm is "Default"
	 *
	 * @function
	 * @name module:sap/base/i18n/date/CalendarWeekNumbering.getWeekConfigurationValues
	 * @private
	 */
	Object.defineProperty(CalendarWeekNumbering, "getWeekConfigurationValues", {
		// configurable : false,
		// enumerable : false,
		value : function (sCalendarWeekNumbering) {
			switch (sCalendarWeekNumbering) {
				case CalendarWeekNumbering.ISO_8601 :
					return {firstDayOfWeek : 1, minimalDaysInFirstWeek : 4};
				case CalendarWeekNumbering.MiddleEastern :
					return {firstDayOfWeek : 6, minimalDaysInFirstWeek : 1};
				case CalendarWeekNumbering.WesternTraditional :
					return {firstDayOfWeek : 0, minimalDaysInFirstWeek : 1};
				default:
					return undefined;
			}
		}
		// writable : false
	});

	return CalendarWeekNumbering;
});

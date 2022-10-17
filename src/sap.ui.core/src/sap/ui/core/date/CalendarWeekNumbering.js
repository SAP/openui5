/*!
 * ${copyright}
 */

// Provides type sap.ui.core.date.CalendarWeekNumbering.
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
	 * @since 1.108.0
	 * @alias sap.ui.core.date.CalendarWeekNumbering
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

	return CalendarWeekNumbering;
}, /* bExport= */ true);

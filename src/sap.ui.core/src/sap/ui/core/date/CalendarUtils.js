/*!
 * ${copyright}
 */

// Provides type sap.ui.core.date.CalendarUtils.
sap.ui.define([
	"sap/ui/core/date/CalendarWeekNumbering",
	"sap/ui/core/Configuration",
	"sap/ui/core/LocaleData"
], function(
	CalendarWeekNumbering,
	Configuration,
	LocaleData
) {
	"use strict";

	var mWeekNumberingConfiguration = {
			ISO_8601 : {
				firstDayOfWeek : 1,
				minimalDaysInFirstWeek : 4
			},
			MiddleEastern : {
				firstDayOfWeek : 6,
				minimalDaysInFirstWeek : 1
			},
			WesternTraditional : {
				firstDayOfWeek : 0,
				minimalDaysInFirstWeek : 1
			}
		};

	/**
	 * Provides calendar-related utilities.
	 *
	 * @namespace
	 * @alias module:sap/ui/core/date/CalendarUtils
	 * @public
	 * @since 1.108.0
	 */
	var CalendarUtils = {

		/**
		 * Resolves calendar week configuration.
		 *
		 * Returns an object with the following fields:
		 * <ul>
		 *   <li><code>firstDayOfWeek</code>: specifies the first day of the week starting with
		 *   <code>0</code> (which is Sunday)</li>
		 *   <li><code>minimalDaysInFirstWeek</code>: minimal days at the beginning of the year
		 *   which define the first calendar week</li>
		 * </ul>
		 *
		 * @param {sap.ui.core.date.CalendarWeekNumbering} [sCalendarWeekNumbering=Default]
		 *   The calendar week numbering; if omitted, <code>Default</code> is used.
		 * @param {sap.ui.core.Locale} [oLocale]
		 *   The locale to use; if not provided, this falls back to the format locale from the
		 *   Configuration; see {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale}.
		 *   Is only used when <code>sCalendarWeekNumbering</code> is set to <code>Default</code>.
		 * @returns {{firstDayOfWeek: int, minimalDaysInFirstWeek: int}|undefined}
		 *   The calendar week configuration, or <code>undefined<code> for an invalid value of
		 *   <code>sap.ui.core.date.CalendarWeekNumbering</code>.
		 * @public
		 * @since 1.108.0
		 */
		getWeekConfigurationValues : function (sCalendarWeekNumbering, oLocale) {
			var oLocaleData;

			if (mWeekNumberingConfiguration.hasOwnProperty(sCalendarWeekNumbering)) {
				return mWeekNumberingConfiguration[sCalendarWeekNumbering];
			}
			sCalendarWeekNumbering = sCalendarWeekNumbering || CalendarWeekNumbering.Default;
			if (sCalendarWeekNumbering === CalendarWeekNumbering.Default) {
				oLocale = oLocale || Configuration.getFormatSettings().getFormatLocale();
				oLocaleData = LocaleData.getInstance(oLocale);
				return {
					firstDayOfWeek : oLocaleData.getFirstDayOfWeek(),
					minimalDaysInFirstWeek : oLocaleData.getMinimalDaysInFirstWeek()
				};
			}
			return undefined;
		}
	};

	return CalendarUtils;
});
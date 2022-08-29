/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/date/UniversalDate', 'sap/ui/core/Locale', 'sap/ui/core/LocaleData', 'sap/base/assert', 'sap/ui/core/Configuration'],
	function (UniversalDate, Locale, LocaleData, assert, Configuration) {
		"use strict";

		function clone(oUniversalDate) {
			assert(oUniversalDate instanceof UniversalDate, "method accepts only instances of UniversalDate");
			return oUniversalDate.createDate(oUniversalDate.constructor, [oUniversalDate.getJSDate()]);
		}

		/**
		 * Provides helpers to execute common calculations on <code>UniversalDate</code> instances.
		 *
		 * @namespace
		 * @alias module:sap/ui/core/date/UniversalDateUtils
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		var UniversalDateUtils = {};

		/**
		 * Calculates a date range based on a given base date, duration and unit.
		 *
		 * If no or a null base date is given, today (<code>UniversalDateUtils.createNewUniversalDate()</code>) will be used as
		 * base date, represented in the current session's default calendar type.
		 *
		 * If the duration is 0, the base date will be used and is part of the returned range. 0 WEEK means this week.
		 * If the duration is positive, the base date will be used as start date of the range. 1 WEEK means next week.
		 * If the duration is negative, the base date will be used as end date.
		 * This method expects only integer values for <code>iDuration</code>,
		 * any fractional part will be ignored (truncated).
		 *
		 * The unit can be one of <code>"DAY"</code>, <code>"WEEK"</code>, <code>"MONTH"</code>,
		 * <code>"QUARTER"</code> or <code>"YEAR"</code>.
		 *
		 * The first value in the returned array will be the first day within the calculated range
		 * (start date) with the time portion set to the beginning of the day. The second value in the array
		 * will be the last day within the range (the inclusive end date) with the time portion set to the
		 * end of the day.
		 *
		 * The returned dates will use the same calendar as the given base date. If no base date was given,
		 * they will use the session's default calendar type.
		 *
		 * @param {int} iDuration
		 *   Positive or negative integer value that defines the duration of the date range.
		 * @param {string} sUnit
		 *   Unit of <code>iDuration</code>, one of <code>"DAY", "WEEK", "MONTH", "QUARTER" , "YEAR"</code>.
 		 * @param {sap.ui.core.date.UniversalDate} [oBaseDate=now]
		 *   Universal date used as basis for the range calculation, defaults to now
		 *  @param {boolean} [bBaseOnUnit]
		 *   Resets the <code>oBaseDate</code> to the first day of the corresponding <code>sUnit</code> where
		 *   <code>oBaseDate</code> is included. E.g. for the unit <code>"MONTH"</code>, it will reset to the
		 *   first day of that month. This option is applicable to the units "WEEK","MONTH","QUARTER","YEAR",
		 *   for unit "DAY" it has no effect. For unit "WEEK", the first day depends on the locale settings
		 *   (see method {@link #.getWeekStartDate})
		 * @returns {sap.ui.core.date.UniversalDate[]}
		 *   Array with two dates representing the calculated range (<code>[startDate, endDate]</code>)
		 *   If the <code>iDuration</code> is zero or not a valid number, an empty array will be returned.
		 * @throws {TypeError}
		 *   If <code>oBaseDate</code> is not an instance of <code>UniversalDate</code>
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getRange = function (iDuration, sUnit, oBaseDate, bBaseOnUnit) {

			if (bBaseOnUnit === undefined ) {
				bBaseOnUnit = true;
			}

			if (isNaN(iDuration)) {
				throw new TypeError("duration is NaN, but is " + iDuration);
			}

			// restrict duration to integer values
			iDuration = Math.trunc(iDuration);

			var oStartDate = UniversalDateUtils.resetStartTime(oBaseDate == undefined ? null : oBaseDate),
				oEndDate;

			if (bBaseOnUnit) {
				switch (sUnit) {
				case "DAY":
					break;
				case "WEEK":
					oStartDate = UniversalDateUtils.getWeekStartDate(oStartDate);
					break;
				case "MONTH":
					oStartDate = UniversalDateUtils.getMonthStartDate(oStartDate);
					break;
				case "QUARTER":
					oStartDate = UniversalDateUtils.getQuarterStartDate(oStartDate);
					break;
				case "YEAR":
					oStartDate = UniversalDateUtils.getYearStartDate(oStartDate);
					break;
				default:
					throw new TypeError("invalid unit " + sUnit);
				}
			}

			switch (sUnit) {
			case "DAY":
				if (iDuration > 0) {
					oStartDate.setDate(oStartDate.getDate() + 1);
				}
				oEndDate = clone(oStartDate);
				iDuration = iDuration == 0 ? 1 : iDuration;
				oEndDate.setDate(oStartDate.getDate() + iDuration);
				break;
			case "WEEK":
				if (iDuration > 0) {
					oStartDate.setDate(oStartDate.getDate() + 7);
				}
				oEndDate = clone(oStartDate);
				iDuration = iDuration == 0 ? 1 : iDuration;
				oEndDate.setDate(oStartDate.getDate() + (iDuration * 7));
				break;
			case "MONTH":
				if (iDuration > 0) {
					oStartDate.setMonth(oStartDate.getMonth() + 1);
				}
				oEndDate = clone(oStartDate);
				iDuration = iDuration == 0 ? 1 : iDuration;
				oEndDate.setMonth(oStartDate.getMonth() + iDuration);
				break;
			case "QUARTER":
				if (iDuration > 0) {
					oStartDate.setMonth(oStartDate.getMonth() + 3);
				}
				oEndDate = clone(oStartDate);
				iDuration = iDuration == 0 ? 1 : iDuration;
				oEndDate.setMonth(oStartDate.getMonth() + (iDuration * 3));
				break;
			case "YEAR":
				if (iDuration > 0) {
					oStartDate.setFullYear(oStartDate.getFullYear() + 1);
				}
				oEndDate = clone(oStartDate);
				iDuration = iDuration == 0 ? 1 : iDuration;
				oEndDate.setFullYear(oStartDate.getFullYear() + iDuration);
				break;
			default:
				throw new TypeError("invalid unit " + sUnit);
			}

			if (oEndDate.getTime() < oStartDate.getTime()) {
				// swap start/end date
				oEndDate = [oStartDate, oStartDate = oEndDate][0];
			}
			// adjust endDate (it is 'inclusive')
			oEndDate.setDate(oEndDate.getDate() - 1);
			return [
				UniversalDateUtils.resetStartTime(oStartDate), UniversalDateUtils.resetEndTime(oEndDate)
			];
		};

		/**
		 * Returns the first day of the week of the given date.
		 *
		 * The interpretation of 'first day of the week' depends on the given locale or, if none is given,
		 * on the current {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale UI5 format locale}.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the beginning of the day (0:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @param {string} [sLocale=format locale] An optional locale identifier, as BCP language tag;
		 *   defaults to the current format localе of UI5
		 * @returns {sap.ui.core.date.UniversalDate} First day of the week
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getWeekStartDate = function (oUniversalDate, sLocale) {
			var oLocale = sLocale ? new Locale(sLocale)
					: Configuration.getFormatSettings().getFormatLocale(),
				oLocaleData = LocaleData.getInstance(oLocale),
				iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
			oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
			oUniversalDate.setDate(oUniversalDate.getDate() - oUniversalDate.getDay() + iFirstDayOfWeek);
			return UniversalDateUtils.resetStartTime(oUniversalDate);
		};

		/**
		 * Returns the last day of the week for the given date.
		 *
		 * The interpretation of 'last day of the week' depends on the given locale or, if none is given,
		 * on the current {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale UI5 format locale}.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the start of the day (00:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @param {string} [sLocale=format locale] An optional locale identifier, as BCP language tag;
		 *   defaults to the current format localе of UI5
		 * @returns {sap.ui.core.date.UniversalDate} Last day of the week
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getWeekLastDate = function (oUniversalDate, sLocale) {
			var oEndDate = UniversalDateUtils.getWeekStartDate(oUniversalDate, sLocale);
			oEndDate.setDate(oEndDate.getDate() + 6);
			return UniversalDateUtils.resetStartTime(oEndDate);
		};

		/**
		 * Returns the first day of the month of the given date.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the beginning of the day (0:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} First day of the month
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getMonthStartDate = function (oUniversalDate) {
			oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
			oUniversalDate.setDate(1);
			return UniversalDateUtils.resetStartTime(oUniversalDate);
		};

		/**
		 * Returns the last day of the month for the given date.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the start of the day (00:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} Last day of the month
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getMonthEndDate = function (oUniversalDate) {
			var oEndDate = UniversalDateUtils.getMonthStartDate(oUniversalDate);
			oEndDate.setMonth(oEndDate.getMonth() + 1);
			oEndDate.setDate(0);
			return UniversalDateUtils.resetStartTime(oEndDate);
		};

		/**
		 * Returns the first day of the quarter of the year of the given date.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the beginning of the day (0:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} First day of the quarter of the year
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getQuarterStartDate = function (oUniversalDate) {
			oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
			oUniversalDate.setMonth(3 * Math.floor(oUniversalDate.getMonth() / 3));
			oUniversalDate.setDate(1);
			return UniversalDateUtils.resetStartTime(oUniversalDate);
		};

		/**
		 * Returns the last day of the quarter of the year for the given date.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the start of the day (00:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} Last day of the quarter of the year
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getQuarterEndDate = function (oUniversalDate) {
			var oEndDate = UniversalDateUtils.getQuarterStartDate(oUniversalDate);
			oEndDate.setMonth(oEndDate.getMonth() + 3);
			oEndDate.setDate(0);
			return UniversalDateUtils.resetStartTime(oEndDate);
		};

		/**
		 * Returns the year's start date based on a given universal date.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the beginning of the day (0:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} The year's start date for the given universal date
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getYearStartDate = function (oUniversalDate) {
			oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
			oUniversalDate.setMonth(0);
			oUniversalDate.setDate(1);
			return UniversalDateUtils.resetStartTime(oUniversalDate);
		};

		/**
		 * Returns the year's end date based on a given universal date.
		 *
		 * If no date is given, today is used, represented in the session's default calendar.
		 * If a date is given, the returned date will use the same calendar.
		 * The time portion of the returned date will be set to the start of the day (00:00:00:000).
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Base date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} The year's end date for the given universal date
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.getYearEndDate = function (oUniversalDate) {
			oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
			oUniversalDate.setFullYear(oUniversalDate.getFullYear() + 1);
			oUniversalDate.setMonth(0);
			oUniversalDate.setDate(0);
			return UniversalDateUtils.resetStartTime(oUniversalDate);
		};

		/**
		 * Returns a copy of the given date with the time portion set to 00:00:00.000.
		 *
		 * If no date is given, today will be used, represented in the session's default calendar.
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} A date with the time portion set to 00:00:00.000
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.resetStartTime = function (oUniversalDate) {
			oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
			oUniversalDate.setHours(0, 0, 0, 0);
			return oUniversalDate;
		};

		/**
		 * Returns a copy of the given date with the time portion set to 23:59:59:999
		 *
		 * If no date is given, today will be used, represented in the session's default calendar.
		 *
		 * @param {sap.ui.core.date.UniversalDate} [oUniversalDate=now] Date, defaults to now
		 * @returns {sap.ui.core.date.UniversalDate} A date with the time portion set to 23:59:59.999
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.resetEndTime = function (oUniversalDate) {
			oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
			oUniversalDate.setHours(23, 59, 59, 999);
			return oUniversalDate;
		};

		UniversalDateUtils.createNewUniversalDate = function() {
			return new UniversalDate();
		};

		/**
		 * Helpers to create well-known ranges.
		 *
		 * @private
		 * @ui5-restricted sap.ui.comp, sap.ui.mdc
		 */
		UniversalDateUtils.ranges = {
			/**
			 * @param {int} iDays Number of days before the current day
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iDays before the current day
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastDays: function (iDays) {
				return UniversalDateUtils.getRange(-iDays, "DAY");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of yesterday's date
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			yesterday: function () {
				return UniversalDateUtils.getRange(-1, "DAY");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of today's date
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			today: function () {
				return UniversalDateUtils.getRange(0, "DAY");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of tomorrow's date
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			tomorrow: function () {
				return UniversalDateUtils.getRange(1, "DAY");
			},
			/**
			 * @param {int} iDays Number of days after the current day
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iDays after the current day
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextDays: function (iDays) {
				return UniversalDateUtils.getRange(iDays, "DAY");
			},

			/**
			 * @param {int} iWeeks Number of weeks before the current week
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iWeeks before the current week
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastWeeks: function (iWeeks) {
				return UniversalDateUtils.getRange(-iWeeks, "WEEK");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of last week
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastWeek: function () {
				return UniversalDateUtils.getRange(-1, "WEEK");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of the current week
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			currentWeek: function () {
				return UniversalDateUtils.getRange(0, "WEEK");
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of the first day of the current week
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			firstDayOfWeek: function () {
				var oStartDate = UniversalDateUtils.getWeekStartDate();
				return [
					oStartDate,
					UniversalDateUtils.resetEndTime(oStartDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of the last day of the current week
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastDayOfWeek: function () {
				var oEndDate = UniversalDateUtils.getWeekLastDate();
				return [
					oEndDate,
					UniversalDateUtils.resetEndTime(oEndDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of next week's
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextWeek: function () {
				return UniversalDateUtils.getRange(1, "WEEK");
			},
			/**
			 * @param {int} iWeeks Number of weeks after the current week
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iWeeks after the current week
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextWeeks: function (iWeeks) {
				return UniversalDateUtils.getRange(iWeeks, "WEEK");
			},

			/**
			 * @param {int} iMonths Number of months before the current month
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iMonths before the current month
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastMonths: function (iMonths) {
				return UniversalDateUtils.getRange(-iMonths, "MONTH");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of last month's
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastMonth: function () {
				return UniversalDateUtils.getRange(-1, "MONTH");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of current month
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			currentMonth: function () {
				return UniversalDateUtils.getRange(0, "MONTH");
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of first day of the current month
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			firstDayOfMonth: function () {
				var oStartDate = UniversalDateUtils.getMonthStartDate();
				return [
					oStartDate,
					UniversalDateUtils.resetEndTime(oStartDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of last day of the current month
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastDayOfMonth: function () {
				var oEndDate = UniversalDateUtils.getMonthEndDate();
				return [
					oEndDate,
					UniversalDateUtils.resetEndTime(oEndDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of next month's
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextMonth: function () {
				return UniversalDateUtils.getRange(1, "MONTH");
			},
			/**
			 * @param {int} iMonths Number of months after the current month
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iMonths after the current month
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextMonths: function (iMonths) {
				return UniversalDateUtils.getRange(iMonths, "MONTH");
			},

			/**
			 * @param {int} iQuarters Number of quarters before the current quarter
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iQuarters before the current quarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastQuarters: function (iQuarters) {
				return UniversalDateUtils.getRange(-iQuarters, "QUARTER");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of last quarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastQuarter: function () {
				return UniversalDateUtils.getRange(-1, "QUARTER");
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of first day of the current quarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			firstDayOfQuarter: function () {
				var oStartDate = UniversalDateUtils.getQuarterStartDate();
				return [
					oStartDate,
					UniversalDateUtils.resetEndTime(oStartDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of last day of the current quarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastDayOfQuarter: function () {
				var oEndDate = UniversalDateUtils.getQuarterEndDate();
				return [
					oEndDate,
					UniversalDateUtils.resetEndTime(oEndDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of current quarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			currentQuarter: function () {
				return UniversalDateUtils.getRange(0, "QUARTER");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of next quarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextQuarter: function () {
				return UniversalDateUtils.getRange(1, "QUARTER");
			},
			/**
			 * @param {int} iQuarters Number of quarters after the current quarter
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iQuarters after the current quarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextQuarters: function (iQuarters) {
				return UniversalDateUtils.getRange(iQuarters, "QUARTER");
			},

			/**
			 * @param {int} iQuarter Number of quarter of the current year
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iQuarter
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			quarter: function (iQuarter) {
				if (iQuarter <= 2) {
					return UniversalDateUtils.getRange(iQuarter - 1, "QUARTER", UniversalDateUtils.getYearStartDate());
				} else {
					var aRange = UniversalDateUtils.getRange(iQuarter - 2, "QUARTER", UniversalDateUtils.getYearStartDate());
					var oStartDate = aRange[1];
					oStartDate.setMilliseconds(1000);
					return UniversalDateUtils.getRange(0, "QUARTER", oStartDate);
				}
			},
			/**
			 * @param {int} iYears Number of years before the current year
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iYears before the current year
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastYears: function (iYears) {
				return UniversalDateUtils.getRange(-iYears, "YEAR");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of last year
			 * @private
			 * @ui5-restricted sap.ui.comp
			 */
			lastYear: function () {
				return UniversalDateUtils.getRange(-1, "YEAR");
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of first day of the current year
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			firstDayOfYear: function () {
				var oStartDate = UniversalDateUtils.getYearStartDate();
				return [
					oStartDate,
					UniversalDateUtils.resetEndTime(oStartDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of last day of the current year
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			lastDayOfYear: function () {
				var oEndDate = UniversalDateUtils.getYearEndDate();

				return [
					oEndDate,
					UniversalDateUtils.resetEndTime(oEndDate)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of current year
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			currentYear: function () {
				return UniversalDateUtils.getRange(0, "YEAR");
			},
			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of next year
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextYear: function () {
				return UniversalDateUtils.getRange(1, "YEAR");
			},
			/**
			 * @param {int} iYears Number of years after the current year
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with start and end date of iYears after the current year
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			nextYears: function (iYears) {
				return UniversalDateUtils.getRange(iYears, "YEAR");
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with first day of the current year and today
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			yearToDate: function () {
				var oToday = UniversalDateUtils.createNewUniversalDate();
				return [
					UniversalDateUtils.getYearStartDate(oToday),
					UniversalDateUtils.resetEndTime(oToday)
				];
			},

			/**
			 * @returns {sap.ui.core.date.UniversalDate[]} Array with today and end of the current year
			 * @private
			 * @ui5-restricted sap.ui.comp, sap.ui.mdc
			 */
			dateToYear: function () {
				var oToday = UniversalDateUtils.createNewUniversalDate();
				return [
					UniversalDateUtils.resetStartTime(oToday),
					UniversalDateUtils.resetEndTime(UniversalDateUtils.getYearEndDate(oToday))
				];
			}
		};
		return UniversalDateUtils;
	});

/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/base/EventProvider',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/library'
],
	function(
		EventProvider,
		CalendarUtils,
		CalendarDate,
		unifiedLibrary
	) {
		"use strict";

		var Periods = unifiedLibrary.CalendarIntervalType;

		/**
		 * Creates a <code>sap.m.delegate.DateNavigation</code> delegate that can navigate through dates.
		 *
		 * @extends sap.ui.base.EventProvider
		 * @constructor
		 * @private
		 * @alias sap.m.delegate.DateNavigation
		 * @version 1.71
		 * @author SAP SE
		 */
		var DateNavigation = EventProvider.extend("sap.m.delegate.DateNavigation", /** @lends sap.m.delegate.DateNavigation.prototype */ {
			constructor: function() {
				EventProvider.apply(this, arguments);

				this._unit = Periods.Day;
				this._start = new Date();
				this._step = 1;
			}
		});

		/**
		 * 24 hours as milliseconds.
		 * @type {int}
		 * @private
		 */
		DateNavigation.HOURS24 = 1000 * 3600 * 24;

		DateNavigation.prototype.setUnit = function(sPeriodUnit) {
			this._unit = sPeriodUnit;
		};

		DateNavigation.prototype.setStart = function(oDate) {
			this._start = oDate;
		};

		DateNavigation.prototype.setStep = function(iStep) {
			this._step = iStep;
		};

		DateNavigation.prototype.setCurrent = function(oDate) {
			this._current = oDate;
		};

		DateNavigation.prototype.setWeekConfiguration = function(oWeekConfig) {
			this._weekConfiguration = oWeekConfig;
		};

		DateNavigation.prototype.getUnit = function() {
			return this._unit;
		};

		DateNavigation.prototype.getStart = function() {
			return this._start;
		};

		DateNavigation.prototype.getStep = function() {
			return this._step;
		};

		DateNavigation.prototype.getCurrent = function() {
			return this._current;
		};

		DateNavigation.prototype.getWeekConfiguration = function() {
			return this._weekConfiguration;
		};

		DateNavigation.prototype.getEnd = function(calendarType) {
			var oCalEnd = CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);

			switch (this.getUnit()) {
				case Periods.Day:
				case Periods.Week:
					oCalEnd.setUTCDate(oCalEnd.getUTCDate() + this.getStep() - 1);
					break;
				case Periods.OneMonth:
				case "OneMonth":
					oCalEnd.setUTCMonth(oCalEnd.getUTCMonth() + 1, 1);
					oCalEnd.setUTCDate(oCalEnd.getUTCDate() - 1, 1);
					break;
				case Periods.Hour:
					oCalEnd.setUTCHours(oCalEnd.getUTCHours() + this.getStep() - 1);
					break;
				case Periods.Month:
					oCalEnd.setUTCMonth(oCalEnd.getUTCMonth() + this.getStep() - 1, 1);
					break;
				default:
					break;
			}

			return CalendarUtils._createLocalDate(oCalEnd, true);
		};

		DateNavigation.prototype.next = function(calendarType) {
			var oNewCalStart = CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);
			var oNewCalCurrent = this.getCurrent() ? CalendarUtils._createUniversalUTCDate(this.getCurrent(), calendarType, true) : CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);

			switch (this.getUnit()) {
				case Periods.Hour:
					oNewCalCurrent.setUTCHours(oNewCalCurrent.getUTCHours() + this.getStep());
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));

					oNewCalStart.setUTCHours(oNewCalStart.getUTCHours() + this.getStep());
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));

					break;
				case Periods.Week:
				case Periods.Day:
					oNewCalCurrent.setUTCDate(oNewCalCurrent.getUTCDate() + this.getStep());
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));

					oNewCalStart.setUTCDate(oNewCalStart.getUTCDate() + this.getStep());
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));

					break;
				case Periods.Month:
					oNewCalCurrent.setUTCMonth(oNewCalCurrent.getUTCMonth() + this.getStep(), 1);
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));

					oNewCalStart.setUTCMonth(oNewCalStart.getUTCMonth() + this.getStep(), 1);
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));

					break;
				case Periods.OneMonth:
				case "OneMonth":
					oNewCalCurrent.setUTCMonth(oNewCalCurrent.getUTCMonth() + 1, 1);
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));

					oNewCalStart.setUTCMonth(oNewCalStart.getUTCMonth() + 1, 1);
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					break;
				default:
					break;
			}
		};

		DateNavigation.prototype.previous = function(calendarType) {
			var oNewCalStart = CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);
			var oNewCalCurrent = this.getCurrent() ? CalendarUtils._createUniversalUTCDate(this.getCurrent(), calendarType, true) : CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);

			switch (this.getUnit()) {
				case Periods.Hour:
					oNewCalCurrent.setUTCHours(oNewCalCurrent.getUTCHours() - this.getStep());
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));

					oNewCalStart.setUTCHours(oNewCalStart.getUTCHours() - this.getStep());
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));

					break;
				case Periods.Week:
				case Periods.Day:
					oNewCalCurrent.setUTCDate(oNewCalCurrent.getUTCDate() - this.getStep());
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));

					oNewCalStart.setUTCDate(oNewCalStart.getUTCDate() - this.getStep());
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					break;

				case Periods.Month:
					oNewCalCurrent.setUTCMonth(oNewCalCurrent.getUTCMonth() - this.getStep(), 1);
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));
					oNewCalStart.setUTCMonth(oNewCalStart.getUTCMonth() - this.getStep(), 1);
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					break;
				case Periods.OneMonth:
				case "OneMonth":
					oNewCalCurrent.setUTCMonth(oNewCalCurrent.getUTCMonth() - 1, 1);
					this.setCurrent(CalendarUtils._createLocalDate(oNewCalCurrent, true));

					oNewCalStart.setUTCMonth(oNewCalStart.getUTCMonth() - 1, 1);
					this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					break;
				default:
					break;
			}
		};

		DateNavigation.prototype.toDate = function(oToDate, calendarType) {
			var oNewCalStart,
				oCalEnd,
				iHoursOffset,
				oNewCurrent = CalendarUtils._createUniversalUTCDate(oToDate, calendarType, true),
				oNewUTCCurrent = CalendarUtils._createUTCDate(oToDate, true);

			this.setCurrent(oToDate);

			switch (this.getUnit()) {
				case Periods.OneMonth:
				case "OneMonth":
					if (CalendarUtils.monthsDiffer(this.getStart(), oToDate)) {
						var oFirstMonthCalDate = CalendarUtils._getFirstDateOfMonth(CalendarDate.fromLocalJSDate(oToDate));

						this.setStart(oFirstMonthCalDate.toLocalJSDate());
					}

					break;
				case Periods.Day:
					oCalEnd = CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);
					oCalEnd.setUTCDate(oCalEnd.getUTCDate() + this.getStep());

					if (oToDate.valueOf() >= oCalEnd.valueOf()) {
						iHoursOffset = 1 + Math.ceil((oToDate.valueOf() - oCalEnd.valueOf()) / (DateNavigation.HOURS24));
						oNewCalStart = CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);
						oNewCalStart.setUTCDate(oNewCalStart.getUTCDate() + iHoursOffset);

						this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					} else if (oToDate.valueOf() < this.getStart().valueOf()) {
						oNewCalStart = CalendarUtils._createUniversalUTCDate(oToDate, calendarType, true);

						this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					}

					break;
				case Periods.Month:
					oCalEnd = CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);
					oCalEnd.setUTCMonth(oCalEnd.getUTCMonth() + this.getStep(), 1);
					if (oNewCurrent.getTime() >= oCalEnd.valueOf()) {
						iHoursOffset = 1 + CalendarUtils._monthsBetween(oToDate, CalendarUtils._createLocalDate(oCalEnd, true));
						oNewCalStart = CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true);
						oNewCalStart.setUTCMonth(oNewCalStart.getUTCMonth() + iHoursOffset, 1);
						this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					} else if (oToDate.valueOf() < this.getStart().valueOf()) {
						oNewCalStart = CalendarUtils._createUniversalUTCDate(oToDate, calendarType, true);
						this.setStart(CalendarUtils._createLocalDate(oNewCalStart, true));
					}

					break;
				case Periods.Week:
					var oToCalDateFirstWeekDate = CalendarUtils.getFirstDateOfWeek(oNewUTCCurrent, this.getWeekConfiguration());
					if (this.getStart().valueOf() !== oToCalDateFirstWeekDate.valueOf()) {
						this.setStart(CalendarUtils._createLocalDate(oToCalDateFirstWeekDate, true));
					}
					break;
				case Periods.Hour:
					oCalEnd = this.getEnd();
					var oCalutcEnd = CalendarUtils._createUniversalUTCDate(oCalEnd, calendarType, true);

					if (oNewCurrent.getTime() < CalendarUtils._createUniversalUTCDate(this.getStart(), calendarType, true).getTime() || oNewCurrent.getTime() > oCalutcEnd.getTime()) {
						this.setStart(oToDate);
					}
					break;
				default:
					break;
			}
		};

		return DateNavigation;
	});
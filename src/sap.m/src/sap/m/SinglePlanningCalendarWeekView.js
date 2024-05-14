/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'./SinglePlanningCalendarView',
	"sap/base/i18n/Formatting",
	'sap/ui/core/LocaleData',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils',
	"sap/ui/core/date/CalendarUtils",
	'sap/ui/core/Locale'
],
function (library, SinglePlanningCalendarView, Formatting, LocaleData, CalendarDate, CalendarUtils, CalendarDateUtils, Locale) {
	"use strict";

	/**
	 * Constructor for a new <code>SinglePlanningCalendarWeekView</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * Represents a week view of the {@link sap.m.SinglePlanningCalendar}.
	 * The purpose of the element is to decouple the view logic from parent control <code>SinglePlanningCalendar</code>.
	 *
	 * @extends sap.m.SinglePlanningCalendarView
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.61
	 * @alias sap.m.SinglePlanningCalendarWeekView
	 */
	var SinglePlanningCalendarWeekView = SinglePlanningCalendarView.extend("sap.m.SinglePlanningCalendarWeekView", {
		metadata: {

			library: "sap.m"

		}
	});

	/**
	 * Returns after how much entities is the next/previous startDate of the <code>sap.m.SinglePlanningCalendar</code> after
	 * navigating forward or backwards.
	 *
	 * @returns {int} the number of entities to be skipped by scrolling
	 * @override
	 * @public
	 */
	SinglePlanningCalendarWeekView.prototype.getEntityCount = function () {
		return 7;
	};

	/**
	 * Should return a number of entities until the next/previous startDate of the
	 * <code>sap.m.SinglePlanningCalendar</code> after navigating forward or backwards.
	 *
	 * @returns {int} the number of entities to be skipped by scrolling
	 */
	SinglePlanningCalendarWeekView.prototype.getScrollEntityCount = function () {
		return 7;
	};

	/**
	 * Calculates the startDate which will be displayed in the <code>sap.m.SinglePlanningCalendar</code> based
	 * on a given date.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate The given date
	 * @returns {Date|module:sap/ui/core/date/UI5Date} The startDate of the view
	 * @override
	 * @public
	 */
	SinglePlanningCalendarWeekView.prototype.calculateStartDate = function (oDate) {

		var sLocale = new Locale(Formatting.getLanguageTag()).toString();

		var oLocaleData = LocaleData.getInstance(new Locale(Formatting.getLanguageTag())),
			iFirstDayOfWeek = this.getFirstDayOfWeek();

			if (iFirstDayOfWeek < 0 || iFirstDayOfWeek > 6) {
				var oWeekConfigurationValues = CalendarDateUtils.getWeekConfigurationValues(this.getCalendarWeekNumbering(), new Locale(sLocale));

				if (oWeekConfigurationValues) {
					iFirstDayOfWeek = oWeekConfigurationValues.firstDayOfWeek;
				} else {
					iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
				}
			}

			oDate.setDate(oDate.getDate() - oDate.getDay() + iFirstDayOfWeek);
		return CalendarUtils
			._getFirstDateOfWeek(CalendarDate.fromLocalJSDate(oDate), {
				firstDayOfWeek: iFirstDayOfWeek,
				minimalDaysInFirstWeek: oLocaleData.getMinimalDaysInFirstWeek()
			})
			.toLocalJSDate();
	};

	return SinglePlanningCalendarWeekView;

});
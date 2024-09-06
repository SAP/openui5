/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'./SinglePlanningCalendarView',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate'
],
	function(library, SinglePlanningCalendarView, CalendarUtils, CalendarDate) {
		"use strict";

		/**
		 * Constructor for a new <code>SinglePlanningCalendarMonthView</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * Represents a one month view of the <code>SinglePlanningCalendar</code>. The purpose
		 * of the element is to decouple the view logic from parent control
		 * <code>SinglePlanningCalendar</code>.
		 *
		 * @extends sap.m.SinglePlanningCalendarView
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 *
		 * @since 1.69
		 * @alias sap.m.SinglePlanningCalendarMonthView
		 */
		var SinglePlanningCalendarMonthView = SinglePlanningCalendarView.extend("sap.m.SinglePlanningCalendarMonthView", {
			metadata: {

				library: "sap.m"

			}
		});

		SinglePlanningCalendarMonthView.prototype.getEntityCount = function() {
			return 1;
		};

		/**
		 * Returns a number of entities until the next/previous <code>startDate</code> of the
		 * <code>sap.m.SinglePlanningCalendar</code> after navigating forward or backwards.
		 *
		 * @param {object} oStartDate The current start date
		 * @param {int} iOffset The number of pages to scroll, negative means backwards
		 * @returns {int} The number of entities to be skipped by scrolling
		 * @override
		 * @public
		 */
		SinglePlanningCalendarMonthView.prototype.getScrollEntityCount = function(oStartDate, iOffset) {
			var oNewDate = CalendarDate.fromLocalJSDate(oStartDate),
				iMonth = oNewDate.getMonth() + iOffset;

			oNewDate.setMonth(iMonth);

			// re-adjust if we skipped one month, because it has no such
			// day(31 Jan -> 31 Feb -> 3 March)
			while ((iMonth + 12) % 12 !== oNewDate.getMonth()) {
				oNewDate.setDate(oNewDate.getDate() - 1);
			}
			return Math.abs(CalendarUtils._daysBetween(oNewDate, CalendarDate.fromLocalJSDate(oStartDate)));
		};

		/**
		 * Calculates the <code>startDate</code> displayed in the <code>sap.m.SinglePlanningCalendar</code> based
		 * on a given date.
		 *
		 * @param {Date|module:sap/ui/core/date/UI5Date} oDate The given date
		 * @returns {Date|module:sap/ui/core/date/UI5Date} The startDate of the view
		 * @override
		 * @public
		 */
		SinglePlanningCalendarMonthView.prototype.calculateStartDate = function(oDate) {
			var oReturnDate = CalendarUtils.getFirstDateOfMonth(CalendarUtils._createUTCDate(oDate, true)).getJSDate();
			return CalendarUtils._createLocalDate(oReturnDate, true);
		};

		return SinglePlanningCalendarMonthView;

	});
/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'./SinglePlanningCalendarView',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/CalendarUtils'
],
function (library, SinglePlanningCalendarView, CalendarDate, CalendarUtils) {
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
	 * @return {int} the number of entities to be skipped by scrolling
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
	 * @return {int} the number of entities to be skipped by scrolling
	 */
	SinglePlanningCalendarWeekView.prototype.getScrollEntityCount = function () {
		return 7;
	};

	/**
	 * Calculates the startDate which will be displayed in the <code>sap.m.SinglePlanningCalendar</code> based
	 * on a given date.
	 *
	 * @param {object} oStartDate the given date
	 * @return {object} the startDate of the view
	 * @override
	 * @public
	 */
	SinglePlanningCalendarWeekView.prototype.calculateStartDate = function (oStartDate) {
		var oCalDate = CalendarDate.fromLocalJSDate(oStartDate),
			oCalFirstDateOfWeek = CalendarUtils._getFirstDateOfWeek(oCalDate);

		return oCalFirstDateOfWeek.toLocalJSDate();
	};

	return SinglePlanningCalendarWeekView;

});
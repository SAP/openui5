/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'./SinglePlanningCalendarView'
],
function (library, SinglePlanningCalendarView) {
	"use strict";

	/**
	 * Constructor for a new <code>SinglePlanningCalendarDayView</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Disclaimer: This control is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * <h3>Overview</h3>
	 *
	 * A {@link sap.m.SinglePlanningCalendarDayView} element represents a day view of the SinglePlanningCalendar.
	 * The purpose of the element is to decouple the view logic from parent control SinglePlanningCalendar
	 *
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.61
	 * @alias sap.m.SinglePlanningCalendarDayView
	 */
	var SinglePlanningCalendarDayView = SinglePlanningCalendarView.extend("sap.m.SinglePlanningCalendarDayView", {
		metadata: {

			library: "sap.m"

		}
	});

	/**
	 * Returns the number of columns to be displayed in the grid of the <code>sap.m.SinglePlanningCalendar</code>.
	 *
	 * @return {int} the number of columns to be displayed
	 * @override
	 * @public
	 */
	SinglePlanningCalendarDayView.prototype.getEntityCount = function () {
		return 1;
	};

	/**
	 * Should return a number of entities until the next/previous startDate of the
	 * <code>sap.m.SinglePlanningCalendar</code> after navigating forward or backwards.
	 *
	 * @return {int} the number of entities to be skipped by scrolling
	 * @override
	 * @public
	 */
	SinglePlanningCalendarDayView.prototype.getScrollEntityCount = function () {
		return 1;
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
	SinglePlanningCalendarDayView.prototype.calculateStartDate = function (oStartDate) {
		return oStartDate;
	};

	return SinglePlanningCalendarDayView;

});
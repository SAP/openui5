/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/base/Log',
	'sap/ui/core/Element'
],
function (library, Log, Element) {
	"use strict";

	/**
	 * Constructor for a new <code>SinglePlanningCalendarView</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * Represents a day view of the {@link sap.m.SinglePlanningCalendar}.
	 * The purpose of the element is to decouple the view logic from parent control <code>SinglePlanningCalendar</code>.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.61
	 * @alias sap.m.SinglePlanningCalendarView
	 */
	var SinglePlanningCalendarView = Element.extend("sap.m.SinglePlanningCalendarView", {
		metadata: {

			library: "sap.m",

			properties: {

				/**
				 * Indicates a unique key for the view
				 */
				key : { type : "string", group : "Data" },

				/**
				 * Adds a title for the view
				 */
				title : { type : "string", group : "Appearance" },

				/**
				 * If set, the first day of the displayed week is this day. Valid values are 0 to 6 starting on Sunday.
				 * If there is no valid value set, the default of the used locale is used.
				 *
				 * Note: This property will only have effect in Week view and Month view of the SinglePlanningCalendar,
				 * but it wouldn't have effect in WorkWeek view.
				 *
				 * @since 1.98
				 */
				firstDayOfWeek : {type : "int", group : "Appearance", defaultValue : -1},

				/**
			 	 * If set, the calendar week numbering is used for display.
				 * If not set, the calendar week numbering of the global configuration is used.
				 * Note: This property should not be used with firstDayOfWeek property.
				 * @since 1.110.0
				 */
				calendarWeekNumbering : { type : "sap.ui.core.date.CalendarWeekNumbering", group : "Appearance", defaultValue: null}

			}
		}
	});

	/**
	 * Should return the number of columns to be displayed in the grid of the <code>sap.m.SinglePlanningCalendar</code>.
	 *
	 * @returns {int} the number of columns to be displayed
	 * @public
	 * @abstract
	 */
	SinglePlanningCalendarView.prototype.getEntityCount = function () {
		throw new Error("This method should be implemented in one of the inherited classes.");
	};

	/**
	 * Should return a number of entities until the next/previous startDate of the
	 * <code>sap.m.SinglePlanningCalendar</code> after navigating forward/backward with the arrows. For example, by
	 * pressing the forward button inside the work week view, the next startDate of a work week will be 7 entities
	 * (days) away from the current one.
	 *
	 * @returns {int} the number of entities to be skipped by scrolling
	 * @public
	 * @abstract
	 */
	SinglePlanningCalendarView.prototype.getScrollEntityCount = function () {
		throw new Error("This method should be implemented in one of the inherited classes.");
	};

	/**
	 * Should calculate the startDate which will be displayed in the <code>sap.m.SinglePlanningCalendar</code>
	 * based on a given date.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate The given date
	 * @returns {Date|module:sap/ui/core/date/UI5Date} The startDate of the view
	 * @public
	 * @abstract
	 */
	SinglePlanningCalendarView.prototype.calculateStartDate = function (oDate) {
		throw new Error("This method should be implemented in one of the inherited classes.");
	};

	return SinglePlanningCalendarView;

});
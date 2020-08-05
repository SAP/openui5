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
				title : { type : "string", group : "Appereance" }

			}
		}
	});

	/**
	 * Should return the number of columns to be displayed in the grid of the <code>sap.m.SinglePlanningCalendar</code>.
	 *
	 * @public
	 * @abstract
	 */
	SinglePlanningCalendarView.prototype.getEntityCount = function () {
		Log.warning("This method should be implemented in one of the inherited classes.", this);
	};

	/**
	 * Should return a number of entities until the next/previous startDate of the
	 * <code>sap.m.SinglePlanningCalendar</code> after navigating forward/backward with the arrows. For example, by
	 * pressing the forward button inside the work week view, the next startDate of a work week will be 7 entities
	 * (days) away from the current one.
	 *
	 * @public
	 * @abstract
	 */
	SinglePlanningCalendarView.prototype.getScrollEntityCount = function () {
		Log.warning("This method should be implemented in one of the inherited classes.", this);
	};

	/**
	 * Should calculate the startDate which will be displayed in the <code>sap.m.SinglePlanningCalendar</code>
	 * based on a given date.
	 *
	 * @param {object} oDate the given date
	 * @public
	 * @abstract
	 */
	SinglePlanningCalendarView.prototype.calculateStartDate = function (oDate) {
		Log.warning("This method should be implemented in one of the inherited classes.", this);
	};

	return SinglePlanningCalendarView;

});
/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.RecurringNonWorkingPeriod.
sap.ui.define([
	"./NonWorkingPeriod"
],
	function(
		NonWorkingPeriod
	) {
	"use strict";

	/**
	 * Constructor for a new <code>RecurringNonWorkingPeriod</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>RecurringNonWorkingPeriod</code> for use in a <code>PlanningCalendar</code> and <code>SinglePlanningCalendar</code>.
	 *
	 * Applications can inherit from this element to add own fields.
	 * @extends sap.ui.unified.
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.127.0
	 * @experimental Since version 1.127.0.
	 * @alias sap.ui.unified.RecurringNonWorkingPeriod
	 */
	var RecurringNonWorkingPeriod = NonWorkingPeriod.extend("sap.ui.unified.RecurringNonWorkingPeriod", /** @lends sap.ui.unified.RecurringNonWorkingPeriod.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {
			/**
			 * The recurrenceType determines the pattern of recurrence for a given calendar item.
			 */
			recurrenceType: {type: "sap.ui.unified.RecurrenceType", group: "Misc"},

			/**
			 * Determines the end date of the calendar item, as a UI5Date or JavaScript Date object. It is considered as a local date.
			 */
			recurrenceEndDate: {type : "object", group : "Data"},

			/**
			 * The recurrencePattern is an integer value which, in combination with the recurrenceType, sets the recurrence frequency for a calendar item.
			 * For example, if the recurrenceType is set to "Daily" and the recurrencePattern is set to 1, it signifies that repetition is set for every day.
			 * If the recurrencePattern is set to 3, this would imply the calendar item is recurring once for every three days.
			 */
			recurrencePattern: {type : "int", group : "Behavior", defaultValue : 1}
		}
	}});

	/**
	 * Determines whether the current instance has recurrence or not.
	 * @return {boolean} The result is <code>true</code> when the instance has recurrence.
	 * @private
	 */
	RecurringNonWorkingPeriod.prototype.isRecurring = function () {
		return true;
	};

	return RecurringNonWorkingPeriod;
});
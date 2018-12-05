/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarAppointment.
sap.ui.define(['sap/ui/unified/CalendarAppointment'],
	function(UnifiedCalendarAppointment) {
		"use strict";

		/**
		 * Constructor for a new <code>CalendarAppointment</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 * An appointment for use in a <code>SinglePlanningCalendar</code> or similar.
		 *
		 * Applications could inherit from this element to add own fields.
		 *
		 * <b>Disclaimer</b>: this control is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
		 *
		 * @extends sap.ui.unified.CalendarAppointment
		 * @version ${version}
		 *
		 *
		 * @constructor
		 * @public
		 * @since 1.61
		 * @alias sap.m.CalendarAppointment
		 */
		var CalendarAppointment = UnifiedCalendarAppointment.extend("sap.m.CalendarAppointment", /** @lends sap.m.CalendarAppointment.prototype */ { metadata : {

				library : "sap.m",
				properties : {

					/**
					 * If set to true, the appointment is considered as a blocker.
					 * @experimental
					 * since 1.61 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
					 */
					fullDay : {type : "boolean", group : "Data", defaultValue: false}
				}
			}});

		return CalendarAppointment;

	});
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
		 * An appointment for use in a <code>SinglePlanningCalendar</code> or similar.
		 * (Because there are different visualizations possible.)
		 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
		 *
		 * Applications could inherit from this element to add own fields.
		 * @extends sap.ui.unified.CalendarAppointment
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.58.0
		 * @alias sap.m.CalendarAppointment
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var CalendarAppointment = UnifiedCalendarAppointment.extend("sap.m.CalendarAppointment", /** @lends sap.m.CalendarAppointment.prototype */ { metadata : {

				library : "sap.m",
				properties : {

					/**
					 * Title of the appointment.
					 */
					fullDay : {type : "boolean", group : "Data", defaultValue: false}
				}
			}});

		return CalendarAppointment;

	});
/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.PlanningCalendarRow.
sap.ui.define([
				'sap/ui/core/Element',
				'sap/m/CustomListItem',
				"sap/ui/core/Lib",
				'sap/ui/unified/DateTypeRange',
				'sap/ui/unified/library'
			], function (
				Element,
				CustomListItem,
				Library,
				DateTypeRange,
				unifiedLibrary
) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = unifiedLibrary.CalendarDayType;

	/**
	 * Constructor for a new <code>PlanningCalendarRow</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a row in the {@link sap.m.PlanningCalendar}.
	 *
	 * This element holds the data of one row in the {@link sap.m.PlanningCalendar}. Once the header information
	 * (for example, person information) is assigned, the appointments are assigned.
	 * The <code>sap.m.PlanningCalendarRow</code> allows you to modify appointments at row level.
	 *
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.PlanningCalendarRow
	 */
	var PlanningCalendarRow = Element.extend("sap.m.PlanningCalendarRow", /** @lends sap.m.PlanningCalendarRow.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the title of the header (for example, the name of the person).
			 */
			title : {type : "string", group : "Data"},

			/**
			 * Defines the text of the header (for example, the department of the person).
			 */
			text : {type : "string", group : "Data"},

			/**
			 * Specifies the URI of an image or an icon registered in <code>sap.ui.core.IconPool</code>.
			 */
			icon : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * Determines whether the provided weekdays are displayed as non-working days.
			 * Valid values inside the array are from 0 to 6 (other values are ignored).
			 * If not set, the weekend defined in the locale settings is displayed as non-working days.
			 *
			 * <b>Note:</b> The non-working days are visualized if the <code>intervalType</code>
			 * property of the {@link sap.m.PlanningCalendarView} is set to <code>Day</code>.
			 */
			nonWorkingDays : {type : "int[]", group : "Misc", defaultValue : null},

			/**
			 * Determines whether the provided hours are displayed as non-working hours.
			 * Valid values inside the array are from 0 to 23 (other values are ignored).
			 *
			 * <b>Note:</b> The non-working hours are visualized if <code>intervalType</code>
			 * property of the {@link sap.m.PlanningCalendarView} is set to <code>Hour</code>.
			 */
			nonWorkingHours : {type : "int[]", group : "Misc", defaultValue : null},

			/**
			 * Defines the selected state of the <code>PlanningCalendarRow</code>.
			 *
			 * <b>Note:</b> Binding the <code>selected</code> property in single selection modes may
			 * cause unwanted results if you have more than one selected row in your binding.
			 */
			selected : {type : "boolean", group : "Data", defaultValue : false},

			/**
			 * Defines the identifier of the row.
			 */
			key : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Determines whether the appointments in the row are draggable.
			 *
			 * The drag and drop interaction is visualized by a placeholder highlighting the area where the
			 * appointment can be dropped by the user.
			 *
			 * By default, appointments can be dragged only within their original <code>PlanningCalendarRow</code>. When
			 * <code>enableAppointmentsDragAndDrop</code> is set to true, attaching the
			 * {@link #event:appointmentDragEnter appointmentDragEnter} event can change the default behavior and allow
			 * appointments to be dragged between calendar rows.
			 *
			 * Specifics based on the intervals (hours, days or months) displayed in the <code>PlanningCalendar</code> views:
			 *
			 * Hours:<br>
			 * For views where the displayed intervals are hours, the placeholder snaps on every interval
			 * of 15 minutes. After the appointment is dropped, the {@link #event:appointmentDrop appointmentDrop} event is fired, containing
			 * the new start and end UI5Date or JavaScript Date objects.<br>
			 * For example, an appointment with start date "Nov 13 2017 12:17:00" and end date "Nov 13 2017 12:45:30"
			 * lasts for 27 minutes and 30 seconds. After dragging and dropping to a new time, the possible new
			 * start date has time that is either "hh:00:00" or "hh:15:00" because of the placeholder that can
			 * snap on every 15 minutes. The new end date is calculated to be 27 minutes and 30 seconds later
			 * and would be either "hh:27:30" or "hh:57:30".
			 *
			 * Days:<br>
			 * For views where intervals are days, the placeholder highlights the whole day and after the
			 * appointment is dropped the {@link #event:appointmentDrop appointmentDrop} event is fired. The event contains the new start and
			 * end UI5Date or JavaScript Date objects with changed date but the original time (hh:mm:ss) is preserved.
			 *
			 * Months:<br>
			 * For views where intervals are months, the placeholder highlights the whole month and after the
			 * appointment is dropped the {@link #event:appointmentDrop appointmentDrop} event is fired. The event contains the new start and
			 * end UI5Date or JavaScript Date objects with changed month but the original date and time is preserved.
			 *
			 * <b>Note:</b> In "One month" view, the appointments are not draggable on small screen (as there they are
			 * displayed as a list below the dates). Group appointments are also not draggable.
			 *
			 * <b>Note:</b> Additional application-level code will be needed to provide a keyboard alternative to drag and drop mouse interactions.
			 * One possible option is by handling {@link sap.m.PlanningCalendar#event:appointmentSelect appointmentSelect} event of the
			 * <code>sap.m.PlanningCalendar</code>, as shown in the following simplified example:
			 *
			 * <pre>
			 * 	new sap.m.PlanningCalendar({
			 * 		...
   			 *		rows: [
      		 *			new sap.m.PlanningCalendarRow({
         	 *				...
         	 *				enableAppointmentsDragAndDrop: true,
			 *         		...
      		 *			}),
      		 *			...
   			 *		],
   			 *		...
   			 *		appointmentSelect: function(event) {
      		 *			// Open edit {@link sap.m.Dialog Dialog} to modify the appointment properties
      		 *			new sap.m.Dialog({ ... }).openBy(event.getParameter("appointment"));
   			 *		}
			 *	});
			 * </pre>
			 *
			 * For a complete example, you can check out the following Demokit sample:
			 * {@link https://ui5.sap.com/#/entity/sap.m.PlanningCalendar/sample/sap.m.sample.PlanningCalendarModifyAppointments Planning Calendar - with appointments modification}
			 *
			 * @since 1.54
			 */
			enableAppointmentsDragAndDrop : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Determines whether the appointments in the row are resizable.
			 *
			 * The resize interaction is visualized by making the appointment transparent.
			 *
			 * Specifics based on the intervals (hours, days or months) displayed in the <code>PlanningCalendar</code> views:
			 *
			 * Hours:
			 * For views where the displayed intervals are hours, the appointment snaps on every interval
			 * of 15 minutes. After the resize is finished, the {@link #event:appointmentResize appointmentResize} event is fired, containing
			 * the new start and end UI5Date or JavaScript Date objects.
			 *
			 * Days:
			 * For views where intervals are days, the appointment snaps to the end of the day. After the resize is finished,
			 * the {@link #event:appointmentResize appointmentResize} event is fired, containing the new start and end UI5Date or JavaScript Date objects.
			 * The <code>endDate</code> time is changed to 00:00:00
			 *
			 * Months:
			 * For views where intervals are months, the appointment snaps to the end of the month.
			 * The {@link #event:appointmentResize appointmentResize} event is fired, containing the new start and end UI5Date or JavaScript Date objects.
			 * The <code>endDate</code> is set to the 00:00:00 and first day of the following month.
			 *
			 * <b>Notes:</b>
			 * In "One month" view, the appointments are not resizable on small screen (as there they are
			 * displayed as a list below the dates). Group appointments are also not resizable
			 *
			 * <b>Note:</b> Additional application-level code will be needed to provide a keyboard alternative to appointments resizing interactions with mouse.
			 * It can be done in a similar way as described in the <code>enableAppointmentsDragAndDrop</code> property documentation.
			 *
			 * @since 1.56
			 */
			enableAppointmentsResize : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Determines whether the appointments can be created by dragging on empty cells.
			 *
			 * See <code>enableAppointmentsResize</code> property documentation for the specific points for events snapping.
			 *
			 * <b>Notes:</b>
			 * In "One month" view, the appointments cannot be created on small screen (as there they are
			 * displayed as a list below the dates).
			 *
			 * @since 1.56
			 */
			enableAppointmentsCreate : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Defines the text that is displayed when no {@link sap.ui.unified.CalendarAppointment CalendarAppointments} are assigned.
			 */
			noAppointmentsText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the text that will be announced by the screen reader when a user navigates to the row header.
			 */
			rowHeaderDescription: {type : "string", group : "Misc", defaultValue : null}
		},
		aggregations : {

			/**
			 * The appointments to be displayed in the row. Appointments that outside the visible time frame are not rendered.
			 *
			 * <b>Note:</b> For performance reasons, only appointments in the visible time range or nearby should be assigned.
			 */
			appointments : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "appointment", dnd : {draggable: true}},

			/**
			 * The appointments to be displayed at the top of the intervals (for example, for public holidays).
			 * Appointments outside the visible time frame are not rendered.
			 *
			 * Keep in mind that the <code>intervalHeaders</code> should always fill whole intervals. If they are shorter or longer
			 * than one interval, they are not displayed.
			 *
			 * <b>Note:</b> For performance reasons, only appointments in the visible time range or nearby should be assigned.
			 */
			intervalHeaders : {type : "sap.ui.unified.CalendarAppointment", multiple : true, singularName : "intervalHeader"},

			/**
			 * Holds the special dates in the context of a row. A single <code>sap.ui.unified.DateTypeRange</code> instance can be set.
			 *
			 * <b>Note</b> Only <code>sap.ui.unified.DateTypeRange</code> isntances configured with <code>sap.ui.unified.CalendarDayType.NonWorking</code>
			 * or <code>sap.ui.unified.CalendarDayType.Working</code> type will be visualized in the row.
			 * In all other cases the <code>sap.ui.unified.DateTypeRange</code> instances will be ignored and will not be displayed in the control.
			 * Assigning more than one of these values in combination for the same date will lead to unpredictable results.
			 *
			 * @since 1.56
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

			/**
			 * Holds the header content of the row.
			 *
			 * <b>Note:</b> <li>If the <code>headerContent</code> aggregation is added, then the set icon, description, title
			 * and tooltip are ignored.</li>
			 * <li>The application developer has to ensure, that the size of the content conforms with the size of the header.</li>
			 * @since 1.67
			 */
			headerContent : {type : "sap.ui.core.Control", multiple : true, singularName : "headerContent",
				forwarding: {
					getter: "_getPlanningCalendarCustomRowHeader",
					aggregation: "content"
				}
			}

		},
		events : {
			/**
			 * Fired if an appointment is dropped.
			 * @since 1.54
			 */
			appointmentDrop : {
				parameters : {
					/**
					 * The dropped appointment.
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * Start date of the dropped appointment, as a UI5Date or JavaScript Date object.
					 */
					startDate : {type : "object"},

					/**
					 * Dropped appointment end date as a UI5Date or JavaScript Date object.
					 */
					endDate : {type : "object"},

					/**
					 * The row of the appointment.
					 */
					calendarRow : {type : "sap.m.PlanningCalendarRow"},

					/**
					 * The drop type. If true - it's "Copy", if false - it's "Move".
					 */
					copy : {type : "boolean"}
				}
			},

			/**
			 * Fired if an appointment is dropped.
			 *
			 * When this event handler is attached, the default behavior of the <code>enableAppointmentsDragAndDrop</code>
			 * property to move appointments only within their original calendar row is no longer valid. You can move
			 * the appointment around all rows for which <code>enableAppointmentsDragAndDrop</code> is set to true.
			 * In this case, the drop target area is indicated by a placeholder. In the event handler you can call the
			 * <code>preventDefault</code> method of the event to prevent this default behavior. In this case,
			 * the placeholder will no longer be available and it will not be possible to drop the appointment in the row.
			 *
			 * @since 1.56
			 */
			appointmentDragEnter : {
				allowPreventDefault : true,
				parameters : {
					/**
					 * The dropped appointment.
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * Start date of the dropped appointment, as a UI5Date or JavaScript Date object.
					 */
					startDate : {type : "object"},

					/**
					 * Dropped appointment end date as a UI5Date or JavaScript Date object.
					 */
					endDate : {type : "object"},

					/**
					 * The row of the appointment.
					 */
					calendarRow : {type : "sap.m.PlanningCalendarRow"}
				}
			},

			/**
			 * Fired if an appointment is resized.
			 * @since 1.56
			 */
			appointmentResize : {
				parameters : {
					/**
					 * The resized appointment.
					 */
					appointment : {type : "sap.ui.unified.CalendarAppointment"},

					/**
					 * Start date of the resized appointment, as a UI5Date or JavaScript Date object.
					 */
					startDate : {type : "object"},

					/**
					 * End date of the resized appointment, as a UI5Date or JavaScript Date object.
					 */
					endDate : {type : "object"}
				}
			},

			/**
			 * Fired if an appointment is created.
			 * @since 1.56
			 */
			appointmentCreate : {
				parameters : {
					/**
					 * Start date of the created appointment, as a UI5Date or JavaScript Date object.
					 */
					startDate : {type : "object"},

					/**
					 * End date of the created appointment, as a UI5Date or JavaScript Date object.
					 */
					endDate : {type : "object"},

					/**
					 * The row of the appointment.
					 */
					calendarRow : {type : "sap.m.PlanningCalendarRow"}
				}
			}
		}
	}});

	PlanningCalendarRow.prototype.exit = function () {
		if (this.oRowHeader) {
			this.oRowHeader.destroy();
		}
	};

	/*
	 * Creates the header for the row and handles the binding.
	 *
	 * @returns {sap.m.CustomListItem}
	 * @since 1.67
	 * @private
	 */
	PlanningCalendarRow.prototype._getPlanningCalendarCustomRowHeader = function() {
		if (!this.oRowHeader) {
			this.oRowHeader = new CustomListItem(this.getId() + "-CustomHead", {
				accDescription: Library.getResourceBundleFor("sap.m").getText("PC_CUSTOM_ROW_HEADER_CONTENT_DESC")
			});
		}

		return this.oRowHeader;
	};

	PlanningCalendarRow.prototype._getSpecialDates = function(){
		var specialDates = this.getSpecialDates();
		for (var i = 0; i < specialDates.length; i++) {
			var bNeedsSecondTypeAdding = (specialDates[i].getSecondaryType() === CalendarDayType.NonWorking
					&& specialDates[i].getType() !== CalendarDayType.NonWorking)
					|| (specialDates[i].getSecondaryType() === CalendarDayType.Working
					&& specialDates[i].getType() !== CalendarDayType.Working);

			if (bNeedsSecondTypeAdding) {
				var newSpecialDate = new DateTypeRange();
				newSpecialDate.setType(specialDates[i].getSecondaryType());
				newSpecialDate.setStartDate(specialDates[i].getStartDate());
				if (specialDates[i].getEndDate()) {
					newSpecialDate.setEndDate(specialDates[i].getEndDate());
				}
				specialDates.push(newSpecialDate);
			}
		}
		return specialDates;
	};


	return PlanningCalendarRow;

});

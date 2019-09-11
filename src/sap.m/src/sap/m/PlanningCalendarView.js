/*!
 * ${copyright}
 */

//Provides control sap.m.PlanningCalendarView.
sap.ui.define(['sap/ui/core/Element', './library', 'sap/ui/unified/library'],
		function(Element, library, unifiedLibrary) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarIntervalType
	var CalendarIntervalType = unifiedLibrary.CalendarIntervalType;

	/**
	 * Constructor for a new <code>PlanningCalendarView</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * View of the {@link sap.m.PlanningCalendar}.
	 *
	 * The <code>PlanningCalendarView</code> defines the type of the intervals (hours, days, months)
	 * and how many intervals are displayed.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.PlanningCalendarView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PlanningCalendarView = Element.extend("sap.m.PlanningCalendarView", /** @lends sap.m.PlanningCalendarView.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the key of the view. This must be set to identify the used view in the
			 * {@link sap.m.PlanningCalendar}.
			 */
			key : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Determines the type of the intervals of the row.
			 *
			 * <b>Note:</b> Not all predefined interval types are supported for this property. For more information, see the
			 * descriptions in the {@link sap.ui.unified.CalendarIntervalType CalendarIntervalType} enumeration.
			 */
			intervalType : {type : "sap.ui.unified.CalendarIntervalType", group : "Appearance", defaultValue : CalendarIntervalType.Hour},

			/**
			 * Defines the description of the <code>PlanningCalendarView</code>.
			 */
			description : {type : "string", group : "Data"},

			/**
			 * Defines the number of intervals that are displayed for a {@link sap.m.PlanningCalendar} that is less than 600 pixels wide.

			 * <b>Note:</b> On a phone the maximum visible intervals are 8.
			 */
			intervalsS : {type : "int", group : "Appearance", defaultValue : 6},

			/**
			 * Defines the number of intervals that are displayed for a {@link sap.m.PlanningCalendar} that is between 600 and 1024 pixels wide.
			 */
			intervalsM : {type : "int", group : "Appearance", defaultValue : 8},

			/**
			 * Defines the number of intervals that are displayed for a {@link sap.m.PlanningCalendar} that is more than 1024 pixels wide.
			 */
			intervalsL : {type : "int", group : "Appearance", defaultValue : 12},

			/**
			 * If set, subintervals are displayed as lines in the rows.
			 *
			 * <ul>
			 * <li>Quarter hour subintervals for interval type <code>Hour</code>.</li>
			 * <li>Hour subintervals for interval types <code>Day</code>, <code>Week</code> and <code>OneMonth</code>.</li>
			 * <li>Day subintervals for interval type <code>Month</code>.</li>
			 * </ul>
			 */
			showSubIntervals : {type : "boolean", group : "Appearance", defaultValue : false}

		}
	}});

	return PlanningCalendarView;

});

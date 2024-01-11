/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.DateTypeRange.
sap.ui.define(['./DateRange', './library'],
	function(DateRange, library) {
	"use strict";



	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;



	/**
	 * Constructor for a new DateTypeRange.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Date range with calendar day type information. Used to visualize special days in the Calendar.
	 * @extends sap.ui.unified.DateRange
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.24.0
	 * @alias sap.ui.unified.DateTypeRange
	 */
	var DateTypeRange = DateRange.extend("sap.ui.unified.DateTypeRange", /** @lends sap.ui.unified.DateTypeRange.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Type of the date range.
			 */
			type : {type : "sap.ui.unified.CalendarDayType", group : "Appearance", defaultValue : CalendarDayType.Type01},

			/**
			 * Applies additional <code>sap.ui.unified.CalendarDayType</code>, with which <code>sap.ui.unified.CalendarDayType.NonWorking</code>
			 * or <code>sap.ui.unified.CalendarDayType.Working</code> types could be represented as well.
			 * @since 1.81.0
			 */
			secondaryType : {type : "sap.ui.unified.CalendarDayType", group : "Appearance", defaultValue : CalendarDayType.None},

			/**
			 * Background color of the <code>Calendar</code> <code>specialDates</code> aggregation.
			 * If set, this color will override the default background color defined in <code>Calendar</code> <code>specialDates</code> aggregation
			 * @since 1.76.0
			 */
			color : {type : "sap.ui.core.CSSColor", group : "Appearance", defaultValue : null}
		}
	}});

	return DateTypeRange;

});

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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateTypeRange = DateRange.extend("sap.ui.unified.DateTypeRange", /** @lends sap.ui.unified.DateTypeRange.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Type of the date range.
			 */
			type : {type : "sap.ui.unified.CalendarDayType", group : "Appearance", defaultValue : CalendarDayType.Type01},

			/**
			 * Background color of the <code>Calendar</code> <code>specialDates</code> aggregation.
			 * If set, this color will override the default background color defined in <code>Calendar</code> <code>specialDates</code> aggregation
			 * @since 1.76.0
			 */
			color : {type : "sap.ui.core.CSSColor", group : "Appearance", defaultValue : null}
		}
	}});

	///**
	// * This file defines behavior for the control,
	// */
	//sap.ui.unified.DateTypeRange.prototype.init = function(){
	//   // do something for initialization...
	//};


	return DateTypeRange;

});

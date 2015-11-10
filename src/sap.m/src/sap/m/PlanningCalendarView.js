/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.PlanningCalendarView.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', './StandardListItem', './StandardListItemRenderer', 'sap/ui/core/Renderer', './library'],
		function(jQuery, Element, StandardListItem, StandardListItemRenderer, Renderer, library) {
	"use strict";

	/**
	 * Constructor for a new <code>PlanningCalendarView</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * View of the <code>PlanningCalendar</code>.
	 *
	 * The <code>PlanningCalendarView</code> defines the granularity of the output. It defines what type of intervals (hours, days or months)
	 * and how many intervals are shown.
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
			 * key of the view. Must be set to identify the used view in the <code>PlanningCalendar</code>
			 */
			key : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Type of the intervals of the row. The default is one hour.
			 */
			intervalType : {type : "sap.ui.unified.CalendarIntervalType", group : "Appearance", defaultValue : sap.ui.unified.CalendarIntervalType.Hour},

			/**
			 * Description of the <code>PlanningCalendarView</code>
			 */
			description : {type : "string", group : "Data"},

			/**
			 * Number of intervals (defined with <code>intervalType</code>) that are displayed on small size (phones).
			 *
			 * <b>Note:</b> not only the screen size is used to determine the available space. The size of the <code>PlanningCalendar</code> is used.
			 */
			intervalsS : {type : "int", group : "Appearance", defaultValue : 6},

			/**
			 * Number of intervals (defined with <code>intervalType</code>) that are displayed on medium size (tablet)
			 *
			 * <b>Note:</b> not only the screen size is used to determine the available space. The size of the <code>PlanningCalendar</code> is used.
			 */
			intervalsM : {type : "int", group : "Appearance", defaultValue : 8},

			/**
			 * Number of intervals (defined with <code>intervalType</code>) that are displayed on large size (desktop)
			 *
			 * <b>Note:</b> not only the screen size is used to determine the available space. The size of the <code>PlanningCalendar</code> is used.
			 */
			intervalsL : {type : "int", group : "Appearance", defaultValue : 12},

			/**
			 * If set subintervals are shown.
			 *
			 * If the interval type is <code>Hour</code> quarter hours are shown.
			 *
			 * If the interval type is <code>Day</code> hours are shown.
			 *
			 * If the interval type is <code>Month</code> days are shown.
			 */
			showSubIntervals : {type : "boolean", group : "Appearance", defaultValue : false}

		}
	}});

	(function() {

//		PlanningCalendarView.prototype.init = function(){
//
//
//		};
//
//		PlanningCalendarView.prototype.exit = function(){
//
//
//		};

	}());

	return PlanningCalendarView;

}, /* bExport= */ true);

/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.TeamCalendarView.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', './StandardListItem', './StandardListItemRenderer', 'sap/ui/core/Renderer', './library'],
		function(jQuery, Element, StandardListItem, StandardListItemRenderer, Renderer, library) {
	"use strict";

	/**
	 * Constructor for a new <code>TeamCalendarView</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * View of the <code>TeamCalendar</code>.
	 *
	 * The <code>TeamCalendarView</code> defines the granularity of the output. It defines what type of intervals (hours, days or months)
	 * and how many intervals are shown.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.TeamCalendarView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TeamCalendarView = Element.extend("sap.m.TeamCalendarView", /** @lends sap.m.TeamCalendarView.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * key of the view. Must be set to identify the used view in the <code>TeamCalendar</code>
			 */
			key : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Type of the intervals of the row. The default is one hour.
			 */
			intervalType : {type : "sap.ui.unified.CalendarIntervalType", group : "Appearance", defaultValue : sap.ui.unified.CalendarIntervalType.Hour},

			/**
			 * Description of the <code>TeamCalendarView</code>
			 */
			description : {type : "string", group : "Data"},

			/**
			 * Number of intervals (defined with <code>intervalType</code>) that are displayed on small size (phones).
			 *
			 * <b>Note:</b> not only the screen size is used to determine the available space. The size of the <code>TeamCalendar</code> is used.
			 */
			intervalsS : {type : "int", group : "Appearance", defaultValue : 6},

			/**
			 * Number of intervals (defined with <code>intervalType</code>) that are displayed on medium size (tablet)
			 *
			 * <b>Note:</b> not only the screen size is used to determine the available space. The size of the <code>TeamCalendar</code> is used.
			 */
			intervalsM : {type : "int", group : "Appearance", defaultValue : 8},

			/**
			 * Number of intervals (defined with <code>intervalType</code>) that are displayed on large size (desktop)
			 *
			 * <b>Note:</b> not only the screen size is used to determine the available space. The size of the <code>TeamCalendar</code> is used.
			 */
			intervalsL : {type : "int", group : "Appearance", defaultValue : 12}

		}
	}});

	(function() {

//		TeamCalendarView.prototype.init = function(){
//
//
//		};
//
//		TeamCalendarView.prototype.exit = function(){
//
//
//		};

	}());

	return TeamCalendarView;

}, /* bExport= */ true);

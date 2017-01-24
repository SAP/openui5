/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarAppointment.
sap.ui.define(['jquery.sap.global', './DateTypeRange', './library'],
	function(jQuery, DateTypeRange, library) {
	"use strict";

	/**
	 * Constructor for a new <code>CalendarAppointment</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An appointment for use in a <code>PlanningCalendar</code> or similar. The rendering must be done in the Row collecting the appointments.
	 * (Because there are different visualizations possible.)
	 *
	 * Applications could inherit from this element to add own fields.
	 * @extends sap.ui.unified.DateTypeRange
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.ui.unified.CalendarAppointment
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarAppointment = DateTypeRange.extend("sap.ui.unified.CalendarAppointment", /** @lends sap.ui.unified.CalendarAppointment.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Title of the appointment.
			 */
			title : {type : "string", group : "Data"},

			/**
			 * Text of the appointment.
			 */
			text : {type : "string", group : "Data"},

			/**
			 * Icon of the Appointment. (e.g. picture of the person)
			 *
			 * URI of an image or an icon registered in sap.ui.core.IconPool.
			 */
			icon : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * Indicates if the icon is tentative.
			 */
			tentative : {type : "boolean", group : "Data", defaultValue : false},

			/**
			 * Indicates if the icon is selected.
			 */
			selected : {type : "boolean", group : "Data", defaultValue : false},

			/**
			 * Can be used as identifier of the appointment
			 */
			key : {type : "string", group : "Data", defaultValue : null},

            /**
             * Overrides the color derived from the <code>type</code> property.
             * This property will work only with full hex color with pound symbol, e.g.: #FF0000.
             * @since 1.46.0
             */
            color: {type : "sap.ui.core.CSSColor", group : "Appearance", defaultValue : null}
		}
	}});

	CalendarAppointment.prototype.applyFocusInfo = function (oFocusInfo) {

		// let the parent handle the focus assignment after rerendering
		var oParent = this.getParent();

		if (oParent) {
			oParent.applyFocusInfo(oFocusInfo);
		}

		return this;

	};

	/**
	 * Sets for the <code>color</code> property.
	 * @param {string} sColor Hex type CSS color
	 * @returns {control} <code>this</code> context for chaining.
	 * @override
	 * @since 1.46.0
	 */
	CalendarAppointment.prototype.setColor = function (sColor) {
		if (sColor && sColor.match(/^#[0-9a-f]{6}$/i)) {
			jQuery.sap.log.warning("setColor accepts only full hex color value with pound symbol.");
		}
		return this.setProperty("color", sColor);
	};

	/**
	 * Generates CSS RGBA string from the Hex color.
	 * @param {string} sHex color string
	 * @returns {string} CSS rgba string
	 * @private
	 */
	CalendarAppointment.prototype._getCSSColorForBackground = function(sHex) {
		return "rgba(" + [
				parseInt(sHex.substr(1, 2), 16), // Red
				parseInt(sHex.substr(3, 2), 16), // Green
				parseInt(sHex.substr(5, 2), 16) // Blue
			].join(",") + ", 0.2)";
	};

	return CalendarAppointment;

}, /* bExport= */ true);

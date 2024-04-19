/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarAppointment.
sap.ui.define([
	'./DateTypeRange',
	"sap/base/i18n/Formatting",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/format/NumberFormat',
	'./calendar/CalendarUtils',
	'./library',
	"sap/base/Log",
	"sap/ui/core/date/UI5Date"
],
	function(
		DateTypeRange,
		Formatting,
		Library,
		Locale,
		DateFormat,
		NumberFormat,
		CalendarUtils,
		library,
		Log,
		UI5Date
	) {
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
			 * Description of the appointment.
			 * @since 1.81.0
			 */
			description: {type: "string", group: "Data"},

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
		},
		aggregations: {
			/**
			 * Holds the content of the appointment.
			 *
			 * <b>Note </b>, If the <code>customContent</code> aggregation is added then:
			 *
			 * <ul>
			 * <li>The <code>title</code>, <code>text</code>, <code>description</code>, and <code>icon</code> properties
			 * are ignored.</li>
			 * <li>The application developer has to ensure, that all the accessibility requirements are met, and that
			 * the height of the content conforms with the height provided by the appointment.</li>
			 * <li>Do not use interactive controls as content, as they may trigger unwanted selection of the appointment
			 * and may lead to unpredictable results.</li>
			 * </ul>
			 *
			 * @since 1.93.0
			 */
			customContent: { type: "sap.ui.core.Control", multiple: true }
		}
	}});

	CalendarAppointment.prototype.init = function () {
		this._sAppointmentPartSuffix = null;
	};

	CalendarAppointment.prototype.applyFocusInfo = function (oFocusInfo) {

		// let the parent handle the focus assignment after rerendering
		var oParent = this.getParent();

		if (oParent) {
			oParent.applyFocusInfo(oFocusInfo);
		}

		return this;

	};

	/**
	 * Gets the text for an appointment that intersects with a given date.
	 * @param {object} oCurrentlyDisplayedDate The displayed day
	 * @returns {object} An object with a start and end fields, which represent how the appointment intersects with the given date
	 * @private
	 */
	CalendarAppointment.prototype._getDateRangeIntersectionText = function (oCurrentlyDisplayedDate) {
		var oStartDate = this.getStartDate(),
			oEndDate = this.getEndDate() ? this.getEndDate() : UI5Date.getInstance(864000000000000), //in case of emergency call this number
			sFirstLineText,
			sSecondLineText,
			oCurrentDayStart = UI5Date.getInstance(oCurrentlyDisplayedDate.getFullYear(), oCurrentlyDisplayedDate.getMonth(), oCurrentlyDisplayedDate.getDate(), 0, 0, 0),
			oNextDayStart = UI5Date.getInstance(oCurrentDayStart.getFullYear(), oCurrentDayStart.getMonth(), oCurrentDayStart.getDate() + 1),
			oTimeFormat = DateFormat.getTimeInstance({pattern: "HH:mm"}),
			oResourceBundle = Library.getResourceBundleFor("sap.m"),
			oHourFormat = NumberFormat.getUnitInstance({
				allowedUnits: ["duration-hour"]
			}, new Locale(Formatting.getLanguageTag())),
			oMinuteFormat = NumberFormat.getUnitInstance({
				allowedUnits: ["duration-minute"]
			}, new Locale(Formatting.getLanguageTag())),
			iHour, iMinute, sHour, sMinute;

		//have no intersection with the given day
		if (oStartDate.getTime() > oNextDayStart.getTime() || oEndDate.getTime() < oCurrentDayStart.getTime()) {
			sFirstLineText = "";
		} else if (oStartDate.getTime() <= oCurrentDayStart.getTime() && oEndDate.getTime() >= oNextDayStart.getTime()) {
			sFirstLineText = oResourceBundle.getText("PLANNINGCALENDAR_ALLDAY");
		} else if (oStartDate.getTime() < oCurrentDayStart.getTime()) {
			sFirstLineText = oResourceBundle.getText("PLANNINGCALENDAR_UNTIL");
			sSecondLineText = oTimeFormat.format(oEndDate);
		} else if (oEndDate.getTime() > oNextDayStart.getTime()) {
			sFirstLineText = oResourceBundle.getText("PLANNINGCALENDAR_FROM");
			sSecondLineText = oTimeFormat.format(oStartDate);
		} else {
			sFirstLineText = oTimeFormat.format(oStartDate);
			if (oEndDate.getTime() - oStartDate.getTime() < 3600000) { // less than 1 hour
				iMinute = (oEndDate.getTime() - oStartDate.getTime()) / 60000;
				sSecondLineText = oMinuteFormat.format(iMinute, "duration-minute");
			} else if (((oEndDate.getTime() - oStartDate.getTime()) % 3600000) === 0) { // difference is full hours
				iHour = (oEndDate.getTime() - oStartDate.getTime()) / 3600000;
				sSecondLineText = oHourFormat.format(iHour, "duration-hour");
			} else { // difference is longer than an hour and less than full hours
				iHour = Math.floor((oEndDate.getTime() - oStartDate.getTime()) / 3600000);
				sHour = oHourFormat.format(iHour, "duration-hour");
				iMinute = (oEndDate.getTime() - oStartDate.getTime()) / 60000 % 60;
				sMinute = oMinuteFormat.format(iMinute, "duration-minute");
				sSecondLineText = oResourceBundle.getText("PLANNINGCALENDAR_APP_DURATION", [sHour, sMinute]);
			}
		}

		return {start: sFirstLineText, end: sSecondLineText};
	};

	/**
	 * Returns a sort comparer that considers all day events, respective to a given date, the smallest.
	 * The rest sorts first by start date, then by end date.
	 * @param oDate
	 * @returns {Function}
	 * @private
	 */
	CalendarAppointment._getComparer = function(oDate) {
		var ONE_DAY = 24 * 60 * 60 * 1000,
			iCurrentDayStartTime = UI5Date.getInstance(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), 0, 0, 0).getTime(),
			iNextDayStart = iCurrentDayStartTime + ONE_DAY;

		return function(oAppInfo1, oAppInfo2) {
			var iStartDateTime1 = oAppInfo1.appointment.getStartDate().getTime(),
				iStartDateTime2 = oAppInfo2.appointment.getStartDate().getTime(),
				iEndDateTime1 = oAppInfo1.appointment.getEndDate() ? oAppInfo1.appointment.getEndDate().getTime() : 864000000000000, //this is max date in case of no max date
				iEndDateTime2 = oAppInfo2.appointment.getEndDate() ? oAppInfo2.appointment.getEndDate().getTime() : 864000000000000,
				bWholeDay1 = iStartDateTime1 <= iCurrentDayStartTime && iEndDateTime1 >= iNextDayStart,
				bWholeDay2 = iStartDateTime2 <= iCurrentDayStartTime && iEndDateTime2 >= iNextDayStart,
				iResult;

			if ((bWholeDay1 && bWholeDay2) || (!bWholeDay1 && !bWholeDay2)) {
				iResult = iStartDateTime1 - iStartDateTime2;
				if (iResult === 0) {
					// same start date -> longest appointment should be on top
					iResult = iEndDateTime2 - iEndDateTime1;
				}
			} else if (bWholeDay1) {
				iResult =  -1;
			} else { //bWholeDay2
				iResult =  1;
			}

			return iResult;
		};
	};

	/*
	 * Sets for the <code>color</code> property.
	 * @param {string} sColor Hex type CSS color
	 * @returns {control} <code>this</code> context for chaining.
	 * @override
	 * @since 1.46.0
	 */
	CalendarAppointment.prototype.setColor = function (sColor) {
		if (sColor && !sColor.match(/^#[0-9a-f]{6}$/i)) {
			Log.warning("setColor accepts only full hex color value with pound symbol, but value is '" + sColor + "'");
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
		if (sHex.length === 4) {
			// normalize shortened hex values (#abc -> #aabbcc) in order to work properly with them
			sHex = '#' + sHex.charAt(1) + sHex.charAt(1) + sHex.charAt(2) + sHex.charAt(2) + sHex.charAt(3) + sHex.charAt(3);
		}
		return "rgba(" + [
				parseInt(sHex.substr(1, 2), 16), // Red
				parseInt(sHex.substr(3, 2), 16), // Green
				parseInt(sHex.substr(5, 2), 16) // Blue
			].join(", ") + ", 0.2)";
	};

	CalendarAppointment.prototype._setAppointmentPartSuffix = function (sSuffix) {
		this._sAppointmentPartSuffix = sSuffix;
		return this;
	};

	CalendarAppointment.prototype.getDomRef = function (sSuffix) {
		if (document.getElementById(this.getId())) {
			return document.getElementById(sSuffix ? this.getId() + "-" + sSuffix : this.getId());
		} else if (this._sAppointmentPartSuffix) {
			return document.getElementById(sSuffix ? this.getId() + "-" + this._sAppointmentPartSuffix + "-" + sSuffix : this.getId() + "-" + this._sAppointmentPartSuffix);
		}

		var oAppointmentParts = document.querySelectorAll(".sapUiCalendarRowApps[id^='" + this. getId() + "-']");
		return oAppointmentParts.length > 0 ? oAppointmentParts[0] : null;
	};

	return CalendarAppointment;

});
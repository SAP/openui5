/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarAppointment.
sap.ui.define(['./DateTypeRange', 'sap/ui/core/format/DateFormat', 'sap/ui/core/format/NumberFormat', 'sap/ui/core/LocaleData', './library', "sap/base/Log"],
	function(DateTypeRange, DateFormat, NumberFormat, LocaleData, library, Log) {
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
	 * Gets the text for an appointment that intersects with a given date.
	 * @param {object} oCurrentlyDisplayedDate The displayed day
	 * @returns {object} An object with a start and end fields, which represent how the appointment intersects with the given date
	 * @private
	 */
	CalendarAppointment.prototype._getDateRangeIntersectionText = function (oCurrentlyDisplayedDate) {
		var oStartDate = this.getStartDate(),
			oEndDate = this.getEndDate() ? this.getEndDate() : new Date(864000000000000), //in case of emergency call this number
			sFirstLineText,
			sSecondLineText,
			oCurrentDayStart = new Date(oCurrentlyDisplayedDate.getFullYear(), oCurrentlyDisplayedDate.getMonth(), oCurrentlyDisplayedDate.getDate(), 0, 0, 0),
			oNextDayStart = new Date(oCurrentDayStart.getTime() + 24 * 60 * 60 * 1000),
			oTimeFormat = DateFormat.getTimeInstance({pattern: "HH:mm"}),
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oHourFormat = NumberFormat.getUnitInstance({
				allowedUnits: ["duration-hour"]
			}, sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()),
			oMinuteFormat = NumberFormat.getUnitInstance({
				allowedUnits: ["duration-minute"]
			}, sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()),
			iHour, iMinute, sHour, sMinute;

		//have no intersection with the given day
		if (oStartDate.getTime() > oNextDayStart.getTime() || oEndDate.getTime() < oCurrentDayStart.getTime()) {
			sFirstLineText = "";
		} else if (oStartDate.getTime() < oCurrentDayStart.getTime() && oEndDate.getTime() > oNextDayStart.getTime()) {
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
			iCurrentDayStartTime = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), 0, 0, 0).getTime(),
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
		if (sColor && sColor.match(/^#[0-9a-f]{6}$/i)) {
			Log.warning("setColor accepts only full hex color value with pound symbol.");
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

});
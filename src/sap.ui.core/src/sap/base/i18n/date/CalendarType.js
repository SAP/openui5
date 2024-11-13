/*!
 * ${copyright}
 */

// Provides type module:sap/base/i18n/date/CalendarType.
sap.ui.define(["sap/base/i18n/date/_EnumHelper"], function(_EnumHelper) {
	"use strict";

	/**
	 * The types of <code>Calendar</code>.
	 *
	 * @enum {string}
	 * @alias module:sap/base/i18n/date/CalendarType
	 * @public
	 * @since 1.120
	 */
	var CalendarType = {

		/**
		 * The Gregorian calendar
		 * @public
		 */
		Gregorian: "Gregorian",

		/**
		 * The Islamic calendar
		 * @public
		 */
		Islamic: "Islamic",

		/**
		 * The Japanese emperor calendar
		 * @public
		 */
		Japanese: "Japanese",

		/**
		 * The Persian Jalali calendar
		 * @public
		 */
		Persian: "Persian",

		/**
		 * The Thai buddhist calendar
		 * @public
		 */
		Buddhist: "Buddhist"
	};

	_EnumHelper.register("sap.base.i18n.date.CalendarType", CalendarType);

	return CalendarType;

});
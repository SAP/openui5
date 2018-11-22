/*!
 * ${copyright}
 */

// Provides type sap.ui.core.CalendarType.
sap.ui.define([], function() {
	"use strict";

	/**
	 * The types of Calendar
	 *
	 * @enum {string}
	 * @alias sap.ui.core.CalendarType
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
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

	return CalendarType;

}, /* bExport= */ true);
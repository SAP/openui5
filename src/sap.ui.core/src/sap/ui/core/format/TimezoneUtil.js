/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/date/TimezoneUtils"
], function(
	TimezoneUtils
) {
	"use strict";
	/**
	 * Static collection of utility functions to handle time zone related conversions.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @name module:sap/ui/core/format/TimezoneUtil
	 * @private
	 * @ui5-restricted sap.viz
	 *
	 * @deprecated As of 1.124.0, use {@link module:sap/base/i18n/date/TimezoneUtils} instead.
	 */

	/**
	 * Use {@link module:sap/base/i18n/date/TimezoneUtils.isValidTimezone} instead.
	 *
	 * @param {string} sTimezone The IANA timezone ID which is checked, e.g <code>"Europe/Berlin"</code>
	 * @returns {boolean} Whether the time zone is a valid IANA timezone ID
	 * @private
	 * @ui5-restricted sap.ui.comp.util.DateTimeUtil
	 * @function
	 * @name module:sap/ui/core/format/TimezoneUtil.isValidTimezone
	 */

	/**
	 * Use {@link module:sap/base/i18n/date/TimezoneUtils.getLocalTimezone} instead.
	 *
	 * @returns {string} The local IANA timezone ID of the browser as up-to-date IANA timezone ID,
	 *   e.g. <code>"Europe/Berlin"</code> or <code>"Asia/Kolkata"</code>
	 * @private
	 * @ui5-restricted sap.gantt.misc.AxisTime, sap.gantt.misc.Utility, sap.m.DynamicDateOption, sap.viz
	 * @function
	 * @name module:sap/ui/core/format/TimezoneUtil.getLocalTimezone
	 */

	/**
	 * Use {@link module:sap/base/i18n/date/TimezoneUtils.convertToTimezone} instead.
	 *
	 * @param {Date} oDate The date which should be converted.
	 * @param {string} sTargetTimezone The target IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {Date} The new date in the target time zone.
	 * @private
	 * @ui5-restricted sap.ui.comp.util.DateTimeUtil
	 * @function
	 * @name module:sap/ui/core/format/TimezoneUtil.convertToTimezone
	 */

	/**
	 * Use {@link module:sap/base/i18n/date/TimezoneUtils._getParts} instead.
	 *
	 * @param {Date} oDate The date which should be converted.
	 * @param {string} sTargetTimezone The target IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {{
	 *     day: string,
	 *     era: string,
	 *     fractionalSecond: string,
	 *     hour: string,
	 *     minute: string,
	 *     month: string,
	 *     second: string,
	 *     timeZoneName: string,
	 *     weekday: string,
	 *     year: string
	 * }} An object containing the date and time fields considering the target time zone.
	 * @private
	 * @ui5-restricted sap.viz
	 * @function
	 * @name module:sap/ui/core/format/TimezoneUtil._getParts
	 */

   /**
	* Use {@link module:sap/base/i18n/date/TimezoneUtils._getDateFromParts} instead.
	*
	* @param {object} oParts Separated date and time fields as object, see {@link #_getParts}.
	* @returns {Date} Returns the date object created from the provided parts.
	* @private
	* @ui5-restricted sap.viz
	* @function
	* @name module:sap/ui/core/format/TimezoneUtil._getDateFromParts
	*/

   /**
	* Use {@link module:sap/base/i18n/date/TimezoneUtils.calculateOffset} instead.
	*
	* @param {Date} oDate The date in the time zone used to calculate the offset to UTC.
	* @param {string} sTimezoneSource The source IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	* @returns {number} The difference to UTC between the date in the time zone.
	* @private
	* @ui5-restricted sap.m.DynamicDateUtil, sap.viz
	* @function
	* @name module:sap/ui/core/format/TimezoneUtil.calculateOffset
	*/

	return TimezoneUtils;
});
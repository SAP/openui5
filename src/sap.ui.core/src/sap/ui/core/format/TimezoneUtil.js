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
	 * Static collection of utility functions to handle time zone related conversions
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @name module:sap/ui/core/format/TimezoneUtils
	 * @private
	 * @ui5-restricted sap.ui.core.Configuration, sap.ui.core.format.DateFormat
	 *
	 * @borrows sap/base/i18n/date/TimezoneUtils.isValidTimezone as isValidTimezone
	 * @borrows sap/base/i18n/date/TimezoneUtils.convertToTimezone as convertToTimezone
	 * @borrows sap/base/i18n/date/TimezoneUtils._getParts as _getParts
	 * @borrows sap/base/i18n/date/TimezoneUtils._getDateFromParts as _getDateFromParts
	 * @borrows sap/base/i18n/date/TimezoneUtils.calculateOffset as calculateOffset
	 * @borrows sap/base/i18n/date/TimezoneUtils.getLocalTimezone as getLocalTimezone
	 */
	return TimezoneUtils;
});
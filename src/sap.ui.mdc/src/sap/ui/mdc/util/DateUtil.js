/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/library',
		'sap/ui/core/date/UniversalDate',
		'sap/base/util/merge'
	],
	function(
			coreLibrary,
			UniversalDate,
			merge
	) {
		"use strict";

		var CalendarType = coreLibrary.CalendarType;

		/**
		 * Utility class with functions for Date conversion
		 *
		 * @namespace
		 * @author SAP SE
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 * @since 1.74.0
		 * @alias sap.ui.mdc.util.DateUtil
		 */
		var DateUtil = {

				/**
				 * Converts a data type specific date to a UniversalDate.
				 *
				 * @param {any} vDate Date
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @return {sap.ui.core.date.UniversalDate} UniversalDate
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.74.0
				 */
				typeToUniversalDate: function(vDate, oType) {

					var sDate = this.typeToString(vDate, oType, "yyyyMMdd");
					var iYear = parseInt(sDate.slice(0,4));
					var iMonth = parseInt(sDate.slice(4,6)) - 1;
					var iDate = parseInt(sDate.slice(6,8));
					var oUniversalDate = new UniversalDate(UniversalDate.UTC(iYear, iMonth, iDate));

					return oUniversalDate;

				},

				/**
				 * Converts a UniversalDate to data type specific date.
				 *
				 * @param {sap.ui.core.date.UniversalDate} oDate UniversalDate
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @return {any} type specific date
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.74.0
				 */
				universalDateToType: function(oDate, oType) {

					var iYear = oDate.getUTCFullYear();
					var iMonth = oDate.getUTCMonth() + 1;
					var iDate = oDate.getUTCDate();
					var sDate = iYear.toString() + ((iMonth < 10) ? "0" : "") + iMonth.toString() + ((iDate < 10) ? "0" : "") + iDate.toString();
					var vDate = this.stringToType(sDate, oType, "yyyyMMdd");

					return vDate;

				},

				/**
				 * "Clones" a given data type to use a given pattern.
				 *
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {string} sPattern Pattern based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
				 * @return {sap.ui.model.SimpleType} nes data type
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.74.0
				 */
				createInternalType: function(oType, sPattern) {

					var Type = sap.ui.require(oType.getMetadata().getName().replace(/\./g, "/")); // type is already loaded because instance is provided
					var oConstraints = merge({}, oType.getConstraints());
					var oFormatOptions = merge({}, oType.getFormatOptions());

					if (oFormatOptions.style) {
						delete oFormatOptions.style;
					}
					oFormatOptions.pattern = sPattern;
					oFormatOptions.calendarType = CalendarType.Gregorian;

					return new Type(oFormatOptions, oConstraints);

				},

				/**
				 * Converts a data type specific date to a string using a given pattern.
				 *
				 * @param {any} vDate Date
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {string} sPattern Pattern based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
				 * @return {string} Date as String
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.74.0
				 */
				typeToString: function(vDate, oType, sPattern) {

					var oInternalType = this.createInternalType(oType, sPattern);
					var sDate = oInternalType.formatValue(vDate, "string");
					return sDate;

				},

				/**
				 * Converts a string based date to a Type using a given pattern.
				 *
				 * @param {string} sDate Date
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {string} sPattern Pattern based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
				 * @return {any} Date for type
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.74.0
				 */
				stringToType: function(sDate, oType, sPattern) {

					var oInternalType = this.createInternalType(oType, sPattern);
					var vDate = oInternalType.parseValue(sDate, "string");
					return vDate;

				},

				/**
				 * Convert time part of a JS Date object from local time to UTC
				 *
				 * Returns a new date object, where the UTC time is set to the same value as
				 * the local time on the original date object.
				 *
				 * If a date has a local time of to 14:00 GMT+0200, the resulting date will have
				 * 14:00 UTC on the same day.
				 *
				 * @param {Date} oDate the date to convert
				 * @returns {Date} a new date object with converted time
				 * @private
				 */
				localToUtc: function(oDate) {
					return new Date( Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(),
							oDate.getHours(), oDate.getMinutes(), oDate.getSeconds(), oDate.getMilliseconds())
					);
				},

				/**
				 * Convert time part of a JS Date object from UTC to local time
				 *
				 * Returns a new date object, where the local time is set to the same value as
				 * the UTC time on the original date object.
				 *
				 * If a date has a time of to 14:00 UTC, the resulting date will have
				 * 14:00 GMT+0200 on the same day.
				 *
				 * Please be aware that due to summer/winter time and changes in timezones,
				 * not all times can be converted to local time.
				 *
				 * @param {Date} oDate the date to convert
				 * @returns {Date} a new date object with converted time
				 * @private
				 */
				utcToLocal: function(oDate) {
					return new Date( oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate(),
							oDate.getUTCHours(), oDate.getUTCMinutes(), oDate.getUTCSeconds(), oDate.getUTCMilliseconds()
					);
				}
		};

		return DateUtil;
	}, /* bExport= */ true);

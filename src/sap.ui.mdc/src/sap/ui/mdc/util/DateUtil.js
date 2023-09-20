/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/library',
		'sap/ui/core/date/UI5Date',
		'sap/ui/mdc/enums/BaseType',
		'sap/base/util/merge'
	],
	function(
			coreLibrary,
			UI5Date,
			BaseType,
			merge
	) {
		"use strict";

		const CalendarType = coreLibrary.CalendarType;

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
		const DateUtil = {

				/**
				 * "Clones" a given data type to use a given pattern.
				 *
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {string} sPattern Pattern based on Unicode LDML Date Format notation. {@link http://unicode.org/reports/tr35/#Date_Field_Symbol_Table}
				 * @return {sap.ui.model.SimpleType} new data type
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.74.0
				 */
				createInternalType: function(oType, sPattern) {

					const Type = sap.ui.require(oType.getMetadata().getName().replace(/\./g, "/")); // type is already loaded because instance is provided
					const oConstraints = merge({}, oType.getConstraints());
					const oFormatOptions = merge({}, oType.getFormatOptions());

					if (oFormatOptions.style) {
						delete oFormatOptions.style;
					}
					oFormatOptions.pattern = sPattern;
					oFormatOptions.calendarType = CalendarType.Gregorian;

					if (this.showTimezone(oType)) {
						// for Date/Time part of binding hide timezone, a new binding with only TimeZone is added to TimeZone property of DateTimePicker
						oFormatOptions.showTimezone = false;
					}

					return new Type(oFormatOptions, oConstraints);

				},

				/**
				 * Checks if a DateTimeWithTimezone is used and the Timezone should be shown beside Date an time
				 *
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @return {boolean} if set, timezine needs to be shown
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.101.0
				 */
				showTimezone: function(oType) {

					const oFormatOptions = oType.getFormatOptions();
					const fnCheckProperty = function(oFormatOptions, sProperty) {
						return !oFormatOptions.hasOwnProperty(sProperty) || oFormatOptions[sProperty]; // if not set, showTimezone=true, showDate=true or showTime=true is default
					};

					return oType.isA("sap.ui.model.odata.type.DateTimeWithTimezone") && fnCheckProperty(oFormatOptions, "showTimezone") && (fnCheckProperty(oFormatOptions, "showDate") || fnCheckProperty(oFormatOptions, "showTime"));

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

					const oInternalType = this.createInternalType(oType, sPattern);
					const sDate = oInternalType.formatValue(vDate, "string");
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

					const oInternalType = this.createInternalType(oType, sPattern);
					const vDate = oInternalType.parseValue(sDate, "string");
					return vDate;

				},

				/**
				 * Converts a data type representation of a dateTime to a ISO-string.
				 *
				 * @param {any} vDate Date
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {sap.ui.mdc.enums.BaseType} [sBaseType] Basic type
				 * @return {string} Date as ISOString
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.112.0
				 */
				typeToISO: function(vDate, oType, sBaseType) {

					if (oType.getISOStringFromModelValue) {
						return oType.getISOStringFromModelValue(vDate);
					} else { // old types cannot convert to ISO by itself
						let oDate = this.typeToDate(vDate, oType, sBaseType);

						if (oType.getFormatOptions().UTC) { // in UTC date we need to bring the local date to UTC
							oDate = UI5Date.getInstance(Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), oDate.getHours(), oDate.getMinutes(), oDate.getSeconds(), oDate.getMilliseconds()));
						}

						return oDate.toISOString();
					}

				},

				/**
				 * Converts a ISO representation of a DateTime into the data-type representation.
				 *
				 * @param {string} sISODate Date
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {sap.ui.mdc.enums.BaseType} [sBaseType] Basic type
				 * @return {any} Date for type
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.112.0
				 */
				ISOToType: function(sISODate, oType, sBaseType) {

					if (oType.getModelValueFromISOString) {
						return oType.getModelValueFromISOString(sISODate);
					} else { // old types cannot convert to ISO by itself
						let oDate = UI5Date.getInstance(sISODate); // can also interpret string with pattern "yyyy-MM-ddTHH:mm:ssZ"

						if (oType.getFormatOptions().UTC) { // in UTC date we need to bring the UTC to local date
							oDate = UI5Date.getInstance(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate(), oDate.getUTCHours(), oDate.getUTCMinutes(), oDate.getUTCSeconds(), oDate.getUTCMilliseconds());
						}

						return this.dateToType(oDate, oType, sBaseType);
					}

				},

				/**
				 * Convert time part of a JS Date ino the type representation
				 *
				 * The incomming date is a local date, so for Date and Time the local value needs to be used, for DateTime it depends on the UTC configuration.
				 *
				 * @param {Date} oDate the date to convert
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {sap.ui.mdc.enums.BaseType} [sBaseType] Basic type
				 * @returns {any} date in type representation
				 * @private
				 */
				dateToType: function(oDate, oType, sBaseType) {
					let vDate;

					if (oType.getModelValue) {
						vDate = oType.getModelValue(oDate);
					} else if (oType.isA("sap.ui.model.type.DateTime") && oType.getFormatOptions().UTC) { // old DateTime don't support UTC on ModelFormat
						vDate = UI5Date.getInstance(Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), oDate.getHours(), oDate.getMinutes(), oDate.getSeconds(), oDate.getMilliseconds()));
					} else { // older types don't support the new getModelValue
						const oModelFormat = oType.getModelFormat();
						const oFormatOptions = oType.getFormatOptions();
						const bUTC = sBaseType === BaseType.DateTime ? !!oFormatOptions.UTC : false;
						vDate = oModelFormat.format(oDate, bUTC);
					}

					return vDate;
				},

				/**
				 * Convert time part of a JS Date ino the type representation
				 *
				 * The needed date is a local date, so for Date and Time the local value needs to be used, for DateTime it depends on the UTC configuration.
				 *
				 * @param {any} vDate date in type representation
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {sap.ui.mdc.enums.BaseType} [sBaseType] Basic type
				 * @returns {Date} JSDate (local)
				 * @private
				 */
				typeToDate: function(vDate, oType, sBaseType) {
					let oDate;

					if (oType.getDateValue) {
						oDate = oType.getDateValue(vDate);
					} else if (oType.isA("sap.ui.model.type.DateTime") && oType.getFormatOptions().UTC) { // old DateTime don't support UTC on ModelFormat
						oDate = UI5Date.getInstance(vDate.getUTCFullYear(), vDate.getUTCMonth(), vDate.getUTCDate(), vDate.getUTCHours(), vDate.getUTCMinutes(), vDate.getUTCSeconds(), vDate.getUTCMilliseconds());
					} else { // older types don't support the new getDateValue
						const oModelFormat = oType.getModelFormat();
						const oFormatOptions = oType.getFormatOptions();
						const bUTC = sBaseType === BaseType.DateTime ? !!oFormatOptions.UTC : false;
						oDate = oModelFormat.parse(vDate, bUTC);
					}

					return oDate;
				}
		};

		return DateUtil;
	});

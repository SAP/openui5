/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/library',
		'sap/ui/core/date/UI5Date',
		'sap/ui/mdc/enum/BaseType',
		'sap/base/util/merge'
	],
	function(
			coreLibrary,
			UI5Date,
			BaseType,
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

					var Type = sap.ui.require(oType.getMetadata().getName().replace(/\./g, "/")); // type is already loaded because instance is provided
					var oConstraints = merge({}, oType.getConstraints());
					var oFormatOptions = merge({}, oType.getFormatOptions());

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

					var oFormatOptions = oType.getFormatOptions();
					var fnCheckProperty = function(oFormatOptions, sProperty) {
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
				 * Converts a data type representation of a dateTime to a ISO-string.
				 *
				 * @param {any} vDate Date
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {sap.ui.mdc.enum.BaseType} [sBaseType] Basic type
				 * @return {string} Date as ISOString
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.112.0
				 */
				typeToISO: function(vDate, oType, sBaseType) {

					var oDate = this.typeToDate(vDate, oType, sBaseType);
					return oDate.toISOString();

				},

				/**
				 * Converts a ISO representation of a DateTime into the data-type representation.
				 *
				 * @param {string} sISODate Date
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {sap.ui.mdc.enum.BaseType} [sBaseType] Basic type
				 * @return {any} Date for type
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 * @since 1.112.0
				 */
				ISOToType: function(sISODate, oType, sBaseType) {

					var oDate = UI5Date.getInstance(sISODate); // can also interpret string with pattern "yyyy-MM-ddTHH:mm:ssZ"
					return this.dateToType(oDate, oType, sBaseType);

				},

				/**
				 * Convert time part of a JS Date ino the type representation
				 *
				 * The incomming date is a local date, so for Date and Time the local value needs to be used, for DateTime it depends on the UTC configuration.
				 *
				 * @param {Date} oDate the date to convert
				 * @param {sap.ui.model.SimpleType} oType Data type
				 * @param {sap.ui.mdc.enum.BaseType} [sBaseType] Basic type
				 * @returns {any} date in type representation
				 * @private
				 */
				dateToType: function(oDate, oType, sBaseType) {
					var vDate;

					if (oType.getModelValue) {
						vDate = oType.getModelValue(oDate);
					} else { // older types don't support the new getModelValue
						var oModelFormat = oType.getModelFormat();
						var oFormatOptions = oType.getFormatOptions();
						var bUTC = sBaseType === BaseType.DateTime ? !!oFormatOptions.UTC : false;
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
				 * @param {sap.ui.mdc.enum.BaseType} [sBaseType] Basic type
				 * @returns {Date} JSDate (local)
				 * @private
				 */
				typeToDate: function(vDate, oType, sBaseType) {
					var oDate;

					if (oType.isA("sap.ui.model.odata.type.DateTime") && oType.getConstraints().displayFormat === "Date") { // TODO: need some type-function to convert
						oDate = UI5Date.getInstance(vDate.getUTCFullYear(), vDate.getUTCMonth(), vDate.getUTCDate());
					} else {
						var oModelFormat = oType.getModelFormat();
						var oFormatOptions = oType.getFormatOptions();
						var bUTC = sBaseType === BaseType.DateTime ? !!oFormatOptions.UTC : false;
						oDate = oModelFormat.parse(vDate, bUTC);
					}

					return oDate;
				}
		};

		return DateUtil;
	});

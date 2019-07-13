/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.ListFormat
sap.ui.define([
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
],
	function(Locale, LocaleData, Log, jQuery, isEmptyObject) {
	"use strict";

	/**
	 * Constructor for ListFormat - must not be used: To get a ListFormat instance, please use getInstance.
	 *
	 * @class
	 * The ListFormat is a static class for formatting and parsing an array of strings in a locale-sensitive manner according
	 * to a set of format options.
	 *
	 * @public
	 * @hideconstructor
	 * @alias sap.ui.core.format.ListFormat
	 */
	var ListFormat = function() {
		// Do not use the constructor
		throw new Error();
	};

	ListFormat.oDefaultListFormat = {
		type: "standard",
		style: "wide"
	};

	/**
	 * Get an instance of the ListFormat which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.ListFormat} Instance of the ListFormat
	 * @public
	 *
	 */
	ListFormat.getInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale);
	};

	/**
	 * Create an instance of the ListFormat.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {{sap.ui.core.Locale}} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.ListFormat} Instance of the ListFormat
	 * @private
	 */
	ListFormat.createInstance = function(oFormatOptions, oLocale){
		var oFormat = Object.create(this.prototype);

		if ( oFormatOptions instanceof Locale ) {
			oLocale = oFormatOptions;
			oFormatOptions = undefined;
		}

		if (!oLocale) {
			oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);
		oFormat.oOriginalFormatOptions = jQuery.extend({}, this.oDefaultListFormat, oFormatOptions);

		return oFormat;

	};

	/**
	 * Formats a list according to the given format options.
	 *
	 * @param {array} aList The value to format
	 * @return {string} The formatted output value.
	 * @public
	 */
	ListFormat.prototype.format = function(aList) {
		if (!Array.isArray(aList)) {
			Log.error("ListFormat can only format with an array given.");
			return "";
		}

		var oOriginalFormat = this.oOriginalFormatOptions,
				mListPatterns,
				sPattern, sValue, sStart, sMiddle, sEnd,
				aValues = [].concat(aList),
				aStart, aMiddle;

		mListPatterns = this.oLocaleData.getListFormat(oOriginalFormat.type, oOriginalFormat.style);

		if (isEmptyObject(mListPatterns)) {
			Log.error("No list pattern exists for the provided format options (type, style).");
			return "";
		}

		function replaceMiddlePatterns(aValues, sPattern) {
			var sResult =  aValues[0]; // 1

			for (var i = 1; i < aValues.length; i++) {
				sResult = sPattern.replace("{0}", sResult); // 1, {1}
				sResult = sResult.replace("{1}", aValues[i]); // 1, 2
			}

			return sResult;
		}



		if (mListPatterns[aValues.length]) {
			sPattern = mListPatterns[aValues.length];

			for (var i = 0; i < aValues.length; i++) {
				sPattern = sPattern.replace('{' + i + '}', aValues[i]);
			}
			sValue = sPattern;

		} else if (aValues.length < 2) {
			sValue = aValues.toString();

		} else {
			// split array in start, middle and end parts
			aStart = aValues.shift();
			sEnd = aValues.pop();
			aMiddle = aValues;

			sStart = mListPatterns.start.replace("{0}", aStart);
			sEnd = mListPatterns.end.replace("{1}", sEnd);
			sMiddle = replaceMiddlePatterns(aMiddle, mListPatterns.middle);

			sValue = sStart.replace("{1}", sEnd.replace("{0}", sMiddle));
		}

		return sValue;
	};

	/**
	 * Parses a given list string into an array.
	 *
	 * @param {string} sValue String value to be parsed
	 * @return {array} The parsed output value
	 * @public
	 */
	ListFormat.prototype.parse = function(sValue) {
		if (typeof sValue !== 'string') {
			Log.error("ListFormat can only parse a String.");
			return [];
		}

		var aResult = [],
				aStart = [], aMiddle = [], aEnd = [],
				aExactNumber = [],
				oOriginalFormat = this.oOriginalFormatOptions,
				mListPatterns,
				rPlaceholder = /\{[01]\}/g,
				sEnd, sSeperatorExactNumber, sSeparatorStart, sSeparatorMiddle, sSeparatorEnd;

		if (!oOriginalFormat) {
			oOriginalFormat = ListFormat.oDefaultListFormat;
		}

		mListPatterns = this.oLocaleData.getListFormat(oOriginalFormat.type, oOriginalFormat.style);

		if (isEmptyObject(mListPatterns)) {
			Log.error("No list pattern exists for the provided format options (type, style).");
			return [];
		}

		// replace placeholder and extract the separator for each pattern part (start, middle, end)
		sSeparatorStart = mListPatterns.start.replace(rPlaceholder, "");
		sSeparatorMiddle = mListPatterns.middle.replace(rPlaceholder, "");
		sSeparatorEnd = mListPatterns.end.replace(rPlaceholder, "");

		// extract start element
		aStart = sValue.split(sSeparatorStart);
		aResult = aResult.concat(aStart.shift());

		// extract end element
		aEnd = aStart.join(sSeparatorStart).split(sSeparatorEnd);
		sEnd = aEnd.pop();

		// extract middle elements
		aMiddle = aEnd.join(sSeparatorEnd).split(sSeparatorMiddle);
		aResult = aResult.concat(aMiddle);
		aResult.push(sEnd);

		if (aStart.length < 1 || aMiddle.length < 1 || aEnd.length < 1) {
			// if start, middle or end pattern do not match, then test type 2 pattern
			sSeperatorExactNumber = mListPatterns["2"].replace(rPlaceholder, "");
			// parse exact number
			aExactNumber = sValue.split(sSeperatorExactNumber);

			if (aExactNumber.length === 2) {
				return aExactNumber;
			}

			if (sValue) {
				// return array with sValue if any of the pattern parts or type 2 pattern do not match
				return [sValue];
			} else {
				// empty string
				return [];
			}
		}

		return aResult;
	};

	return ListFormat;
});
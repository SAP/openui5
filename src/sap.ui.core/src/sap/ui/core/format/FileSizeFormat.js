/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.FileSizeFormat
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/ui/base/Object",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/format/NumberFormat"
],
	function(Formatting, BaseObject, Lib, Locale, LocaleData, NumberFormat) {
	"use strict";


	var _UNITS = [
		{ binaryFactor: 1, decimalFactor: 1, decimalUnit: "Byte", binaryUnit: "Byte" },
		{ binaryFactor: 1, decimalFactor: 1, decimalUnit: "Bytes", binaryUnit: "Bytes" },
		{ binaryFactor: Math.pow(2,10), decimalFactor: 1e3, decimalUnit: "Kilobyte", binaryUnit: "Kibibyte" },
		{ binaryFactor: Math.pow(2,20), decimalFactor: 1e6, decimalUnit: "Megabyte", binaryUnit: "Mebibyte" },
		{ binaryFactor: Math.pow(2,30), decimalFactor: 1e9, decimalUnit: "Gigabyte", binaryUnit: "Gibibyte" },
		{ binaryFactor: Math.pow(2,40), decimalFactor: 1e12, decimalUnit: "Terabyte", binaryUnit: "Tebibyte" },
		{ binaryFactor: Math.pow(2,50), decimalFactor: 1e15, decimalUnit: "Petabyte", binaryUnit: "Pebibyte" },
		{ binaryFactor: Math.pow(2,60), decimalFactor: 1e18, decimalUnit: "Exabyte", binaryUnit: "Exbibyte" },
		{ binaryFactor: Math.pow(2,70), decimalFactor: 1e21, decimalUnit: "Zettabyte", binaryUnit: "Zebibyte" },
		{ binaryFactor: Math.pow(2,80), decimalFactor: 1e24, decimalUnit: "Yottabyte", binaryUnit: "Yobibyte" }
	];


	/**
	 * Format classes
	 *
	 * @namespace
	 * @name sap.ui.core.format
	 * @public
	 */

	/**
	 * Constructor for FileSizeFormat - must not be used: To get a FileSizeFormat instance, please use getInstance.
	 *
	 * @class
	 * The FileSizeFormat is a static class for formatting and parsing numeric file size values according
	 * to a set of format options.
	 *
	 * Supports the same options as {@link sap.ui.core.format.NumberFormat.getFloatInstance NumberFormat.getFloatInstance}
	 * For format options which are not specified default values according to the type and locale settings are used.
	 *
	 * Supported format options (additional to NumberFormat):
	 * <ul>
	 * <li>binaryFilesize: Whether to use base 2, that means 1 Kibibyte = 1024 Byte, or base 10, that means 1 Kilobyte = 1000 Byte</li>
	 * </ul>
	 *
	 * @public
	 * @hideconstructor
	 * @alias sap.ui.core.format.FileSizeFormat
	 * @extends sap.ui.base.Object
	 */
	var FileSizeFormat = BaseObject.extend("sap.ui.core.format.FileSizeFormat", /** @lends sap.ui.core.format.FileSizeFormat.prototype */ {
		constructor : function(oFormatOptions) {
			// Do not use the constructor
			throw new Error();
		}
	});


	/**
	 * Get an instance of the FileSizeFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions]
	 *   Supports the same options as {@link sap.ui.core.format.NumberFormat.getFloatInstance}
	 * @param {boolean} [oFormatOptions.binaryFilesize=false]
	 *   Whether to use base 2, that means 1 Kibibyte = 1024 Byte, or base 10, that means 1 Kilobyte = 1000 Byte
	 * @param {sap.ui.core.Locale} [oLocale]
	 *   The locale to get the formatter for; if no locale is given, a locale for the currently configured language is
	 *   used; see {@link module:sap/base/i18n/Formatting.getLanguageTag Formatting.getLanguageTag}
	 * @ui5-omissible-params oFormatOptions
	 * @return {sap.ui.core.format.FileSizeFormat} instance of the FileSizeFormat
	 * @static
	 * @public
	 */
	FileSizeFormat.getInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale);
	};

	/**
	 * Create an instance of the FileSizeFormat.
	 *
	 * @param {object} [oFormatOptions]
	 *   Supports the same options as {@link sap.ui.core.format.NumberFormat.getFloatInstance}
	 * @param {boolean} [oFormatOptions.binaryFilesize=false]
	 *   Whether to use base 2, that means 1 Kibibyte = 1024 Byte, or base 10, that means 1 Kilobyte = 1000 Byte
	 * @param {sap.ui.core.Locale} [oLocale]
	 *   The locale to get the formatter for; if no locale is given, a locale for the currently configured language is
	 *   used; see {@link module:sap/base/i18n/Formatting.getLanguageTag Formatting.getLanguageTag}
	 * @return {sap.ui.core.format.FileSizeFormat} the instance of the FileSizeFormat
	 * @static
	 * @private
	 */
	FileSizeFormat.createInstance = function(oFormatOptions, oLocale) {
		var oFormat = Object.create(this.prototype);
		if ( oFormatOptions instanceof Locale ) {
			oLocale = oFormatOptions;
			oFormatOptions = undefined;
		}
		if (!oLocale) {
			oLocale = new Locale(Formatting.getLanguageTag());
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);
		oFormat.oNumberFormat = NumberFormat.getFloatInstance(oFormatOptions, oLocale);
		oFormat.oBundle = Lib.getResourceBundleFor("sap.ui.core", oLocale.toString());

		oFormat.bBinary = oFormatOptions ? !!oFormatOptions.binaryFilesize : false;

		return oFormat;
	};

	/**
	 * Format a filesize (in bytes) according to the given format options.
	 *
	 * @param {number|string} oValue the number (or hex string) to format
	 * @return {string} the formatted output value
	 * @public
	 */
	FileSizeFormat.prototype.format = function(oValue) {
		var fValue = null, fOriginValue;
		if (typeof oValue == "string") {
			try {
				if (/^\s*[\+-]?0[xX]/.test(oValue)) {
					fValue = parseInt(oValue, 16);
				} else {
					fValue = parseFloat(oValue, 10);
				}
			} catch (e) {
				// Incompatible String is handled as NaN
			}
		} else if (typeof oValue == "number") {
			fValue = oValue;
		}

		if (fValue === null) {
			return "NaN";
		}

		fOriginValue = fValue;

		var oUnit = _getUnit(fValue, this.bBinary),
			sValue = this.oNumberFormat.format(fValue / oUnit.factor);

		// Rounding may induce a change of scale. -> Second pass required
		if (!oUnit.noSecondRounding) {
			fValue = this.oNumberFormat.parse(sValue);
			if ((this.bBinary && Math.abs(fValue) >= 1024) || (!this.bBinary && Math.abs(fValue) >= 1000)) {
				oUnit = _getUnit(fValue * oUnit.factor, this.bBinary);
				sValue = this.oNumberFormat.format(fOriginValue / oUnit.factor);
			}
		}

		return this.oBundle.getText("FileSize." + oUnit.unit, sValue);
	};

	/**
	 * Parse a string which is formatted according to the given format options.
	 *
	 * @param {string} sValue the string containing a formatted filesize value
	 * @return {number} the parsed value in bytes
	 * @public
	 */
	FileSizeFormat.prototype.parse = function(sValue) {
		var oUnit, _sValue, fValue, bBinary;

		if (!sValue) {
			return NaN;
		}

		for (var i = 0; i < _UNITS.length; i++) {
			oUnit = _UNITS[i];
			_sValue = _checkUnit(this.oBundle, oUnit.decimalUnit, sValue);
			if (_sValue) {
				bBinary = false;
				break;
			} else {
				_sValue = _checkUnit(this.oBundle, oUnit.binaryUnit, sValue);
				if (_sValue) {
					bBinary = true;
					break;
				}
			}
		}

		if (!_sValue) {
			_sValue = sValue;
			bBinary = false;
			oUnit = _UNITS[0];
		}

		fValue = this.oNumberFormat.parse(_sValue);
		return fValue * (bBinary ? oUnit.binaryFactor : oUnit.decimalFactor);
	};


	function _getUnit(fBytes, bBinary) {
		var b = Math.abs(fBytes),
			unit, factor;

		for (var i = _UNITS.length - 1; i >= 2; i--) {
			unit = _UNITS[i];
			factor = bBinary ? unit.binaryFactor : unit.decimalFactor;
			if (b >= factor) {
				return {factor: factor, unit: bBinary ? unit.binaryUnit : unit.decimalUnit, noSecondRounding: (i == _UNITS.length - 1)};
			}
		}
		return {factor: 1, unit: _UNITS[b >= 2 ? 1 : 0].decimalUnit};
	}


	function _checkUnit(oBundle, sUnit, sValue){
		var sPattern = oBundle.getText("FileSize." + sUnit),
			_oPattern;

		if (sPattern.startsWith("{0}")) {
			_oPattern = sPattern.substr(3, sPattern.length);
			if ((typeof _oPattern == "string" && _oPattern != "" ? sValue.toLowerCase().endsWith(_oPattern.toLowerCase()) : false)) {
				return sValue.substr(0, sValue.length - _oPattern.length);
			}
		} else if (sPattern.endsWith("{0}")) {
			_oPattern = sPattern.substr(0, sPattern.length - 3);
			if ((typeof _oPattern == "string" && _oPattern != "" ? sValue.toLowerCase().startsWith(_oPattern.toLowerCase()) : false)) {
				return sValue.substr(_oPattern.length, sValue.length);
			}
		} else {
			_oPattern = sPattern.split("{0}");
			if (_oPattern.length == 2 && ((typeof _oPattern[0] == "string" && _oPattern[0] != "" ? sValue.toLowerCase().startsWith(_oPattern[0].toLowerCase()) : false)) && ((typeof _oPattern[1] == "string" && _oPattern[1] != "" ? sValue.toLowerCase().endsWith(_oPattern[1].toLowerCase()) : false))) {
				return sValue.substr(_oPattern[0].length, sValue.length - _oPattern[1].length);
			}
		}

		return null;
	}


	return FileSizeFormat;

});
/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/core/format/NumberFormat',
	'sap/ui/model/CompositeType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/ui/core/LocaleData',
	"sap/base/strings/hash",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
],
	function(
		NumberFormat,
		CompositeType,
		FormatException,
		ParseException,
		ValidateException,
		LocaleData,
		hash,
		jQuery,
		isEmptyObject
	) {
	"use strict";


	/**
	 * Constructor for a Unit type.
	 *
	 * @class
	 * This class represents the Unit composite type.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @example MeterType with dynamic decimals coming from the model
	 * // defining a new custom Type as a subclass of the sap.ui.model.type.Unit type
	 * sap.ui.require(["sap/ui/model/type/Unit"], function(UnitType) {
	 *
	 *  UnitType.extend("sap.ui.core.samples.MeterType", {
	 *      constructor: function(oFormatOptions, oConstraints){
	 *          // define the dynamic format options as the third argument
	 *          // ‘aDynamicFormatOptionNames’
	 *          UnitType.call(this, oFormatOptions, oConstraints, ["decimals"]);
	 *      }
	 *  });
	 * });
	 *
	 * in the view
	 * {parts:['energyModel>value', 'energyModel>unit', 'energyModel>decimals'],type: 'sap.ui.core.samples.MeterType'}
	 *
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.NumberFormat.getUnitInstance NumberFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of format options to be used if the property in the model is not of type <code>string</code> and needs formatting as well.
	 * 										   If an empty object is given, the grouping is disabled and a dot is used as decimal separator.
	 * @param {object} [oConstraints] Value constraints
	 * @param {float} [oConstraints.minimum] Smallest value allowed for this type
	 * @param {float} [oConstraints.maximum] Largest value allowed for this type
	 * @param {float} [oConstraints.decimals] Largest number of decimals allowed for this type
	 * @param {array} [aDynamicFormatOptionNames] keys for dynamic format options which are used to map additional binding values, e.g. <code>["decimals"]</code>
	 * @alias sap.ui.model.type.Unit
	 */
	var Unit = CompositeType.extend("sap.ui.model.type.Unit", /** @lends sap.ui.model.type.Unit.prototype  */ {

		constructor : function (oFormatOptions, oConstraints, aDynamicFormatOptionNames) {
			CompositeType.apply(this, arguments);
			this.sName = "Unit";
			this.bUseRawValues = true;
			this.aDynamicFormatOptionNames = aDynamicFormatOptionNames;
		}
	});

	/**
	 * Retrieves a new NumberFormat instance for the given dynamic format options.
	 * If a Unit is already known during formatting, we also pass it along to construct
	 * an optimal NumberFormat instance.
	 *
	 * @param {*} aArgs an array containing the parsed dynamic format options
	 * @param {*} sUnitToBeFormatted
	 */
	Unit.prototype._getInstance = function(aArgs, sUnitToBeFormatted) {
		var oFormatArgs = this.createFormatOptions(aArgs);

		// We resolve the unit and merge it with the bound decimals/precision in case the following is true:
		//     1. If the unit is known during formatting
		//     2. no custom units are given on the the Unit type's format-options
		//     3. no custom units are given in bound the dynamic-format-options
		// This way we ensure that the bound dynamic format options (e.g. decimals, precision)
		// are taken into account with priority. Otherwise the format options defined for units on the Configuration
		// might overwrite the given dynamic format options of the type.
		if (sUnitToBeFormatted && !this.oFormatOptions.customUnits && !oFormatArgs.customUnits) {
			// checks the global Configuration and CLDR for Units/UnitMappings
			var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
			var oLocaleData = LocaleData.getInstance(oLocale);
			var sLookupMeasure = oLocaleData.getUnitFromMapping(sUnitToBeFormatted) || sUnitToBeFormatted;
			var mUnitPatterns = oLocaleData.getUnitFormat(sLookupMeasure);

			// we have a unit pattern, so we create a customUnit definition for the format options
			if (mUnitPatterns) {
				var mUnitClone = jQuery.extend({}, mUnitPatterns);
				mUnitClone.decimals = (oFormatArgs.decimals != undefined) ? oFormatArgs.decimals : mUnitClone.decimals;
				mUnitClone.precision = (oFormatArgs.precision != undefined) ? oFormatArgs.precision : mUnitClone.precision;
				oFormatArgs.customUnits = {};
				oFormatArgs.customUnits[sUnitToBeFormatted] = mUnitClone;
			}
		}

		var oFormatOptionsMerged = oFormatArgs;
		// merge the format options defined via constructor with the bound dynamic format options
		if (this.oFormatOptions) {
			oFormatOptionsMerged = jQuery.extend({}, this.oFormatOptions, oFormatArgs);
		}

		// Only subclasses of the Unit type use a NumberFormat instance cache.
		// By default a new NumberFormat instance is created everytime.
		if (this.getMetadata().getClass() !== Unit) {

			var oMetadata = this.getMetadata();
			oMetadata._mTypeInstanceCache = oMetadata._mTypeInstanceCache || {};

			var sHashKey = hash(JSON.stringify(oFormatOptionsMerged) || "");
			var oHashedInstance = oMetadata._mTypeInstanceCache[sHashKey];
			if (!oHashedInstance) {
				oHashedInstance = NumberFormat.getUnitInstance(oFormatOptionsMerged);
				oMetadata._mTypeInstanceCache[sHashKey] = oHashedInstance;
			}
			return oHashedInstance;
		} else {
			return NumberFormat.getUnitInstance(oFormatOptionsMerged);
		}
	};

	/**
	 * Clears the cache
	 * @private
	 */
	Unit.prototype._clearInstances = function() {
		if (this.getMetadata().getClass() !== Unit) {

			var oMetadata = this.getMetadata();
			if (oMetadata._mTypeInstanceCache) {
				oMetadata._mTypeInstanceCache = {};
			}
		}
	};

	Unit.prototype.createFormatOptions = function(aValues) {
		var oFormatOptions = {};
		if (this.aDynamicFormatOptionNames && aValues.length >= this.aDynamicFormatOptionNames.length) {

			this.aDynamicFormatOptionNames.forEach(function(sDynamicFormatOptionName, iIndex) {
				if (sDynamicFormatOptionName) {
					oFormatOptions[sDynamicFormatOptionName] = aValues[iIndex];
				}
			});
		}
		return oFormatOptions;
	};

	/**
	 * Extracts arguments from the given value
	 * @param vValue
	 * @returns {Array}
	 */
	Unit.prototype.extractArguments = function(vValue) {
		return Array.isArray(vValue) && vValue.length > 2 ? vValue.slice(2) : [];
	};

	/**
	 * Format the given array containing amount and Unit code to an output value of type string.
	 * Other internal types than 'string' are not supported by the Unit type.
	 * If a source format has been defined for this type, the formatValue does also accept
	 * a string value as input, which will be parsed into an array using the source format.
	 * If vValues is not defined or null, null will be returned.
	 *
	 * @function
	 * @name sap.ui.model.type.Unit.prototype.formatValue
	 * @param {array|string} vValue the array of values or string value to be formatted.
	 *                              If an array is given, index 0 is the number value,
	 *                              and index 1 is the Unit code (CLDR or custom).
	 *                              Indices 2+ are the bound values for the dynamic format options.
	 * @param {string} sInternalType the target type
	 * @return {any} the formatted output value
	 *
	 * @public
	 */
	Unit.prototype.formatValue = function(vValue, sInternalType) {
		var aValues = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			aValues = this.oInputFormat.parse(vValue);
		}
		if (!Array.isArray(aValues)) {
			throw new FormatException("Cannot format Unit: " + vValue + " has the wrong format");
		}
		if (aValues[0] == undefined || aValues[0] == null) {
			return null;
		}
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				this.aDynamicValues = this.extractArguments(aValues);
				// retrieve a new NumberFormat (Unit) instance for the dynamic values and the given unit
				this.oOutputFormat = this._getInstance(this.aDynamicValues, aValues[1]);
				return this.oOutputFormat.format(aValues);
			case "int":
			case "float":
			case "any":
			default:
				throw new FormatException("Don't know how to format Unit to " + sInternalType);
		}
	};

	/**
	 * Parse a string value to an array containing amount and Unit. Parsing of other
	 * internal types than 'string' is not supported by the Unit type.
	 * In case a source format has been defined, after parsing the Unit is formatted
	 * using the source format and a string value is returned instead.
	 *
	 * @function
	 * @name sap.ui.model.type.Unit.prototype.parseValue
	 * @param {any} vValue the value to be parsed
	 * @param {string} sInternalType the source type
	 * @param {array} aCurrentValues the current values of all binding parts
	 * @return {array|string} the parse result array
	 *
	 * @public
	 */
	Unit.prototype.parseValue = function(vValue, sInternalType) {
		var vResult, oBundle;
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				this.oOutputFormat = this._getInstance(this.aDynamicValues);
				vResult = this.oOutputFormat.parse(vValue);
				// current default error
				// more specific errors describing the actual issue during parse()
				// will be introduced with later work on the NumberFormat
				if (!Array.isArray(vResult) || isNaN(vResult[0])) {
					oBundle = sap.ui.getCore().getLibraryResourceBundle();
					throw new ParseException(oBundle.getText("Unit.Invalid", [vValue]));
				}
				break;
			case "int":
			case "float":
			default:
				throw new ParseException("Don't know how to parse Unit from " + sInternalType);
		}
		if (this.oInputFormat) {
			vResult = this.oInputFormat.format(vResult);
		}
		return vResult;
	};

	Unit.prototype.validateValue = function(vValue) {
		if (this.oConstraints) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [],
				aValues = vValue,
				iValue;
			if (this.oInputFormat) {
				aValues = this.oInputFormat.parse(vValue);
			}
			iValue = aValues[0];
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (iValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Unit.Minimum", [oContent]));
						}
						break;
					case "maximum":
						if (iValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Unit.Maximum", [oContent]));
						}
						break;
					case "decimals":
						var tempValue = NumberFormat._shiftDecimalPoint(iValue, oContent);
						if (Math.floor(tempValue) !== tempValue) {
							aViolatedConstraints.push("decimals");
							aMessages.push(oBundle.getText("Unit.Decimals", [oContent]));
						}
						break;
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(aMessages.join(" "), aViolatedConstraints);
			}
		}
	};

	Unit.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._clearInstances();
		this._createInputFormat();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Unit.prototype._handleLocalizationChange = function() {
		this._clearInstances();
		this._createInputFormat();
	};

	Unit.prototype._createInputFormat = function() {
		var oSourceOptions = this.oFormatOptions.source;
		if (oSourceOptions) {
			if (isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getUnitInstance(oSourceOptions);
		}
	};

	return Unit;

});

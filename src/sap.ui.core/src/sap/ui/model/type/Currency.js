/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/CompositeType'],
	function(jQuery, NumberFormat, CompositeType) {
	"use strict";


	/**
	 * Constructor for a Currency type.
	 *
	 * @class
	 * This class represents float simple types.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] formatting options. Supports the same options as {@link sap.ui.core.format.NumberFormat.getCurrencyInstance NumberFormat.getCurrencyInstance}
	 * @param {object} [oFormatOptions.source] additional set of format options to be used if the property in the model is not of type string and needs formatting as well. 
	 * 										   In case an empty object is given, the default is disabled grouping and a dot as decimal separator. 
	 * @param {object} [oConstraints] value constraints. 
	 * @param {float} [oConstraints.minimum] smallest value allowed for this type  
	 * @param {float} [oConstraints.maximum] largest value allowed for this type  
	 * @alias sap.ui.model.type.Currency 
	 */
	var Currency = CompositeType.extend("sap.ui.model.type.Currency", /** @lends sap.ui.model.type.Currency.prototype  */ {

		constructor : function () {
			CompositeType.apply(this, arguments);
			this.sName = "Currency";
			this.bUseRawValues = true;
		}

	});

	/**
	 * @see sap.ui.model.SimpleType.prototype.formatValue
	 */
	Currency.prototype.formatValue = function(vValue, sInternalType) {
		var aValues = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			aValues = this.oInputFormat.parse(vValue);
			if (aValues == null) {
				throw new sap.ui.model.FormatException("Cannot format float: " + vValue + " has the wrong format");
			}
		}
		switch (sInternalType) {
			case "string":
				return this.oOutputFormat.format(aValues);
			case "int":
			case "float":
			case "any":
			default:
				throw new sap.ui.model.FormatException("Don't know how to format Currency to " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.parseValue
	 */
	Currency.prototype.parseValue = function(vValue, sInternalType) {
		var vResult;
		switch (sInternalType) {
			case "string":
				vResult = this.oOutputFormat.parse(vValue);
				if (!jQuery.isArray(vResult)) {
					throw new sap.ui.model.ParseException(vValue + " is not a valid Currency value");
				}
				break;
			case "int":
			case "float":
			default:
				throw new sap.ui.model.ParseException("Don't know how to parse Currency from " + sInternalType);
		}
		if (this.oInputFormat) {
			vResult = this.oInputFormat.format(vResult);
		}				
		return vResult;
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.validateValue
	 */
	Currency.prototype.validateValue = function(aValues) {
		var iValue = aValues[0];
		if (this.oConstraints) {
			var aViolatedConstraints = [];
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (iValue < oContent) {
							aViolatedConstraints.push("minimum");
						}
						break;
					case "maximum":
						if (iValue > oContent) {
							aViolatedConstraints.push("maximum");
						}
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new sap.ui.model.ValidateException("Validation of type constraints failed", aViolatedConstraints);
			}
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.setFormatOptions
	 */
	Currency.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._createFormats();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Currency.prototype._handleLocalizationChange = function() {
		this._createFormats();
	};
	
	/**
	 * Create formatters used by this type
	 * @private
	 */
	Currency.prototype._createFormats = function() {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = NumberFormat.getCurrencyInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (jQuery.isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getCurrencyInstance(oSourceOptions);
		}
	};

	return Currency;

}, /* bExport= */ true);

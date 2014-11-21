/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/SimpleType'],
	function(jQuery, NumberFormat, SimpleType) {
	"use strict";


	/**
	 * Constructor for a Integer type.
	 *
	 * @class
	 * This class represents integer simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] formatting options. Supports the same options as {@link sap.ui.core.format.NumberFormat.getIntegerInstance NumberFormat.getIntegerInstance}
	 * @param {object} [oConstraints] value constraints. 
	 * @param {int} [oConstraints.minimum] smallest value allowed for this type  
	 * @param {int} [oConstraints.maximum] largest value allowed for this type  
	 * @alias sap.ui.model.type.Integer
	 */
	var Integer = SimpleType.extend("sap.ui.model.type.Integer", /** @lends sap.ui.model.type.Integer.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Integer";
		}

	});

	/**
	 * @see sap.ui.model.SimpleType.prototype.formatValue
	 */
	Integer.prototype.formatValue = function(iValue, sInternalType) {
		if (iValue == undefined || iValue == null) {
			return null;
		}
		switch (sInternalType) {
			case "string":
				return this.oFormat.format(iValue);
			case "int":
			case "float":
			case "any":
				return iValue;
			default:
				throw new sap.ui.model.FormatException("Don't know how to format Integer to " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.parseValue
	 */
	Integer.prototype.parseValue = function(oValue, sInternalType) {
		var iResult;
		switch (sInternalType) {
			case "float":
			case "string":
				iResult = this.oFormat.parse(String(oValue));
				if (isNaN(iResult)) {
					throw new sap.ui.model.ParseException(oValue + " is not a valid Integer value");
				}
				return iResult;
			case "int":
				return oValue;
			default:
				throw new sap.ui.model.ParseException("Don't know how to parse Integer from " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.validateValue
	 */
	Integer.prototype.validateValue = function(iValue) {
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
	Integer.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._handleLocalizationChange();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Integer.prototype._handleLocalizationChange = function() {
		this.oFormat = NumberFormat.getIntegerInstance(this.oFormatOptions);
	};


	return Integer;

}, /* bExport= */ true);

/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the base implementation for all model implementations
sap.ui.define([
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/ui/core/Lib"
], function(each, isEmptyObject, NumberFormat, FormatException, ParseException, SimpleType, ValidateException, Lib) {
	"use strict";

	/**
	 * Constructor for a Float type.
	 *
	 * @class
	 * This class represents float simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.NumberFormat.getFloatInstance}
	 * @param {boolean} [oFormatOptions.preserveDecimals=true]
	 *   By default decimals are preserved, unless <code>oFormatOptions.style</code> is given as
	 *   "short" or "long"; since 1.89.0
	 * @param {object} [oFormatOptions.source] Additional set of format options to be used if the property in the model is not of type string and needs formatting as well.
	 * 										   If an empty object is given, the grouping is disabled and a dot is used as decimal separator.
	 * @param {object} [oConstraints] Value constraints
	 * @param {float} [oConstraints.minimum] Smallest value allowed for this type
	 * @param {float} [oConstraints.maximum] Largest value allowed for this type
	 * @alias sap.ui.model.type.Float
	 */
	var Float = SimpleType.extend("sap.ui.model.type.Float", /** @lends sap.ui.model.type.Float.prototype  */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Float";
		}

	});

	Float.prototype.formatValue = function(vValue, sInternalType) {
		var fValue = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			fValue = this.oInputFormat.parse(vValue);
			if (fValue == null) {
				throw new FormatException("Cannot format float: " + vValue + " has the wrong format");
			}
		}
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				return this.oOutputFormat.format(fValue);
			case "int":
				return Math.floor(fValue);
			case "float":
			case "any":
				return fValue;
			default:
				throw new FormatException("Don't know how to format Float to " + sInternalType);
		}
	};

	Float.prototype.parseValue = function(vValue, sInternalType) {
		var fResult, oBundle;
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				fResult = this.oOutputFormat.parse(vValue);
				if (isNaN(fResult)) {
					oBundle = Lib.getResourceBundleFor("sap.ui.core");
					throw new ParseException(oBundle.getText("Float.Invalid"));
				}
				break;
			case "int":
			case "float":
				fResult = vValue;
				break;
			default:
				throw new ParseException("Don't know how to parse Float from " + sInternalType);
		}
		if (this.oInputFormat) {
			fResult = this.oInputFormat.format(fResult);
		}
		return fResult;
	};

	Float.prototype.validateValue = function(vValue) {
		if (this.oConstraints) {
			var oBundle = Lib.getResourceBundleFor("sap.ui.core"),
				aViolatedConstraints = [],
				aMessages = [],
				fValue = vValue,
				that = this;
			if (this.oInputFormat) {
				fValue = this.oInputFormat.parse(vValue);
			}
			each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (fValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Float.Minimum",
								[that.oOutputFormat.format(oContent)]));
						}
						break;
					case "maximum":
						if (fValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Float.Maximum",
								[that.oOutputFormat.format(oContent)]));
						}
						break;
					default: break;
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
			}
		}
	};

	Float.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = Object.assign(
			oFormatOptions.style !== "short" && oFormatOptions.style !== "long"
				? {preserveDecimals : true}
				: {},
			oFormatOptions);
		this._createFormats();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Float.prototype._handleLocalizationChange = function() {
		this._createFormats();
	};

	/**
	 * Create formatters used by this type
	 * @private
	 */
	Float.prototype._createFormats = function() {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = NumberFormat.getFloatInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getFloatInstance(oSourceOptions);
		}
	};

	return Float;

});
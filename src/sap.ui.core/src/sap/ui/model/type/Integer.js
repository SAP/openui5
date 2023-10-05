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
	 * Constructor for an Integer type.
	 *
	 * @class
	 * This class represents integer simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.NumberFormat.getIntegerInstance}
	 * @param {object} [oFormatOptions.source] Additional set of format options to be used if the property in the model is not of type string and needs formatting as well.
	 * 										   If an empty object is given, the grouping is disabled and a dot is used as decimal separator.
	 * @param {object} [oConstraints] Value constraints
	 * @param {int} [oConstraints.minimum] Smallest value allowed for this type
	 * @param {int} [oConstraints.maximum] Largest value allowed for this type
	 * @alias sap.ui.model.type.Integer
	 */
	var Integer = SimpleType.extend("sap.ui.model.type.Integer", /** @lends sap.ui.model.type.Integer.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Integer";
		}

	});

	Integer.prototype.formatValue = function(vValue, sInternalType) {
		var iValue = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			iValue = this.oInputFormat.parse(vValue);
			if (iValue == null) {
				throw new FormatException("Cannot format float: " + vValue + " has the wrong format");
			}
		}
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				return this.oOutputFormat.format(iValue);
			case "int":
			case "float":
			case "any":
				return iValue;
			default:
				throw new FormatException("Don't know how to format Integer to " + sInternalType);
		}
	};

	Integer.prototype.parseValue = function(vValue, sInternalType) {
		var iResult, oBundle;
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				iResult = this.oOutputFormat.parse(String(vValue));
				if (isNaN(iResult)) {
					oBundle = Lib.getResourceBundleFor("sap.ui.core");
					throw new ParseException(oBundle.getText("EnterInt"));
				}
				break;
			case "float":
				iResult = Math.floor(vValue);
				if (iResult != vValue) {
					oBundle = Lib.getResourceBundleFor("sap.ui.core");
					throw new ParseException(oBundle.getText("EnterInt"));
				}
				break;
			case "int":
				iResult = vValue;
				break;
			default:
				throw new ParseException("Don't know how to parse Integer from " + sInternalType);
		}
		if (this.oInputFormat) {
			iResult = this.oInputFormat.format(iResult);
		}
		return iResult;
	};

	Integer.prototype.validateValue = function(vValue) {
		if (this.oConstraints) {
			var oBundle = Lib.getResourceBundleFor("sap.ui.core"),
				aViolatedConstraints = [],
				aMessages = [],
				iValue = vValue,
				that = this;

			if (this.oInputFormat) {
				iValue = this.oInputFormat.parse(vValue);
			}
			each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (iValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Integer.Minimum",
								[that.oOutputFormat.format(oContent)]));
						}
						break;
					case "maximum":
						if (iValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Integer.Maximum",
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

	Integer.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._createFormats();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Integer.prototype._handleLocalizationChange = function() {
		this._createFormats();
	};

	/**
	 * Create formatters used by this type
	 * @private
	 */
	Integer.prototype._createFormats = function() {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = NumberFormat.getIntegerInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getIntegerInstance(oSourceOptions);
		}
	};

	return Integer;

});
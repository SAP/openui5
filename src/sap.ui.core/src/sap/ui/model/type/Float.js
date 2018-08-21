/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/core/format/NumberFormat',
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	"sap/ui/thirdparty/jquery"
],
	function(
		NumberFormat,
		SimpleType,
		FormatException,
		ParseException,
		ValidateException,
		jQuery
	) {
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
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.NumberFormat#constructor NumberFormat}.
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
					oBundle = sap.ui.getCore().getLibraryResourceBundle();
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
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [],
				fValue = vValue;
			if (this.oInputFormat) {
				fValue = this.oInputFormat.parse(vValue);
			}
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (fValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Float.Minimum", [oContent]));
						}
						break;
					case "maximum":
						if (fValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Float.Maximum", [oContent]));
						}
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
			}
		}
	};

	Float.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
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
			if (jQuery.isEmptyObject(oSourceOptions)) {
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
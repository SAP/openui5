/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/SimpleType'],
	function(jQuery, NumberFormat, SimpleType) {
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
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] formatting options. Supports the same options as {@link sap.ui.core.format.NumberFormat.getFloatInstance NumberFormat.getFloatInstance}
	 * @param {object} [oConstraints] value constraints.
	 * @param {float} [oConstraints.minimum] smallest value allowed for this type
	 * @param {float} [oConstraints.maximum] largest value allowed for this type
	 * @name sap.ui.model.type.Float
	 */
	var Float = SimpleType.extend("sap.ui.model.type.Float", /** @lends sap.ui.model.type.Float.prototype  */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "Float";
		}

	});

	/**
	 * Creates a new subclass of class sap.ui.model.type.Float with name <code>sClassName</code>
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 *
	 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code>
	 * see {@link sap.ui.base.Object.extend Object.extend}.
	 *
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class
	 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.model.type.Float.extend
	 * @function
	 */

	/**
	 * @see sap.ui.model.SimpleType.prototype.formatValue
	 * @name sap.ui.model.type.Float#formatValue
	 * @function
	 */
	Float.prototype.formatValue = function(fValue, sInternalType) {
		if (fValue == undefined || fValue == null) {
			return null;
		}
		switch (sInternalType) {
			case "string":
				return this.oFormat.format(fValue);
			case "int":
				return Math.floor(fValue);
			case "float":
			case "any":
				return fValue;
			default:
				throw new sap.ui.model.FormatException("Don't know how to format Float to " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.parseValue
	 * @name sap.ui.model.type.Float#parseValue
	 * @function
	 */
	Float.prototype.parseValue = function(oValue, sInternalType) {
		var iResult;
		switch (sInternalType) {
			case "string":
				iResult = this.oFormat.parse(oValue);
				if (isNaN(iResult)) {
					throw new sap.ui.model.ParseException(oValue + " is not a valid Float value");
				}
				return iResult;
			case "int":
			case "float":
				return oValue;
			default:
				throw new sap.ui.model.ParseException("Don't know how to parse Float from " + sInternalType);
		}
	};

	/**
	 * @see sap.ui.model.SimpleType.prototype.validateValue
	 * @name sap.ui.model.type.Float#validateValue
	 * @function
	 */
	Float.prototype.validateValue = function(iValue) {
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
	 * @name sap.ui.model.type.Float#setFormatOptions
	 * @function
	 */
	Float.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._handleLocalizationChange();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 * @name sap.ui.model.type.Float#_handleLocalizationChange
	 * @function
	 */
	Float.prototype._handleLocalizationChange = function() {
		this.oFormat = NumberFormat.getFloatInstance(this.oFormatOptions);
	};


	return Float;

}, /* bExport= */ true);

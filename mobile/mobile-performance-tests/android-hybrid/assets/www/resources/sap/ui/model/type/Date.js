/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base implementation for all model implementations
jQuery.sap.declare("sap.ui.model.type.Date");
jQuery.sap.require("sap.ui.model.SimpleType");
jQuery.sap.require("sap.ui.core.format.DateFormat");

/**
 * Constructor for a Date type.
 *
 * @class
 * This class represents date simple types.
 *
 * @extends sap.ui.model.SimpleType
 *
 * @author SAP AG
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor
 * @public
 */
sap.ui.model.type.Date = function () {
	sap.ui.model.SimpleType.apply(this, arguments);
	this.sName = "Date";
};

// chain the prototypes
sap.ui.model.type.Date.prototype = jQuery.sap.newObject(sap.ui.model.SimpleType.prototype);

/*
 * Describe the sap.ui.model.type.Date.
 * Resulting metadata can be obtained via sap.ui.model.type.Date.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.type.Date", {

  // ---- object ----
  baseType : "sap.ui.model.SimpleType",
  publicMethods : [
    // methods
  ]

});

/**
 * @see sap.ui.model.SimpleType.prototype.formatValue
 */
sap.ui.model.type.Date.prototype.formatValue = function(oValue, sInternalType) {
	if (oValue == undefined || oValue == null) {
		return null;
	}
	switch(sInternalType) {
		case "string":
			if (this.oInputFormat) {
				if (this.oFormatOptions.source.pattern == "timestamp") {
					if(typeof(oValue) != "number"){
						if (isNaN(oValue)) {
							throw new sap.ui.model.FormatException("Cannot format date: " + oValue + " is not a valid Timestamp");
						}else{
							oValue = parseInt(oValue, 10);
						}
					}
					oValue= new Date(oValue);
				}else{
					oValue = this.oInputFormat.parse(oValue);
				}
			}
			return this.oOutputFormat.format(oValue);
		default:
			throw new sap.ui.model.FormatException("Don't know how to format Date to " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.parseValue
 */
sap.ui.model.type.Date.prototype.parseValue = function(oValue, sInternalType) {
	var oResult;
	switch(sInternalType) {
		case "string":
			var oResult = this.oOutputFormat.parse(oValue);
			if (isNaN(oResult.getYear())) {
				throw new sap.ui.model.ParseException(oValue + " is not a valid Date value");
			}
			if (this.oInputFormat) {
				if (this.oFormatOptions.source.pattern == "timestamp") {
					oResult = oResult.getTime();
				}else{
					oResult = this.oInputFormat.format(oResult);
				}
			}
			return oResult;
		default:
			throw new sap.ui.model.ParseException("Don't know how to parse Date from " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.validateValue
 */
sap.ui.model.type.Date.prototype.validateValue = function(oValue) {
	if (this.oConstraints) {
		var aViolatedConstraints = [],
			oInputFormat = this.oInputFormat;

		// convert date into date object to compare
		if (oInputFormat && this.oFormatOptions.source.pattern != "timestamp"){
			oValue = oInputFormat.parse(oValue);
		}

		jQuery.each(this.oConstraints, function(sName, oContent) {
			if (oInputFormat){
				oContent = oInputFormat.parse(oContent);
			}
			switch (sName) {
				case "minimum":
					if (oValue < oContent) {
						aViolatedConstraints.push("minimum");
					}
					break;
				case "maximum":
					if (oValue > oContent) {
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
sap.ui.model.type.Date.prototype.setFormatOptions = function(oFormatOptions) {
	this.oFormatOptions = oFormatOptions;
	this.oOutputFormat = sap.ui.core.format.DateFormat.getInstance(this.oFormatOptions);
	if (this.oFormatOptions.source) {
		this.oInputFormat = sap.ui.core.format.DateFormat.getInstance(this.oFormatOptions.source);
	}
};

/**
 * @protected
 */
sap.ui.model.type.Date.prototype.getOutputPattern = function() {

	return this.oOutputFormat.oFormatOptions.pattern;

};
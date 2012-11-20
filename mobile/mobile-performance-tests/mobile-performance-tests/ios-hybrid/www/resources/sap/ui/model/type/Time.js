/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base implementation for all model implementations
jQuery.sap.declare("sap.ui.model.type.Time");
jQuery.sap.require("sap.ui.model.type.Date");

/**
 * Constructor for a Time type.
 *
 * @class
 * This class represents time simple types.
 *
 * @extends sap.ui.model.SimpleType
 *
 * @author SAP AG
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor
 * @public
 */
sap.ui.model.type.Time = function () {
	sap.ui.model.type.Date.apply(this, arguments);
	this.sName = "Time";
};

// chain the prototypes
sap.ui.model.type.Time.prototype = jQuery.sap.newObject(sap.ui.model.type.Date.prototype);

/*
 * Describe the sap.ui.model.type.Date.
 * Resulting metadata can be obtained via sap.ui.model.type.Date.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.type.Time", {

  // ---- object ----
  baseType : "sap.ui.model.type.Date",
  publicMethods : [
    // methods
  ]

});

/**
 * @see sap.ui.model.SimpleType.prototype.setFormatOptions
 */
sap.ui.model.type.Time.prototype.setFormatOptions = function(oFormatOptions) {
	this.oFormatOptions = oFormatOptions;
	this.oOutputFormat = sap.ui.core.format.DateFormat.getTimeInstance(this.oFormatOptions);
	if (this.oFormatOptions.source) {
		this.oInputFormat = sap.ui.core.format.DateFormat.getTimeInstance(this.oFormatOptions.source);
	}
};
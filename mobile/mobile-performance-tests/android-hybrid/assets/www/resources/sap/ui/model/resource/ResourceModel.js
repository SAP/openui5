/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * ResourceBundle-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.resource
 * @public
 */

// Provides the resource bundle based model implementation
jQuery.sap.declare("sap.ui.model.resource.ResourceModel");
jQuery.sap.require("sap.ui.model.Model");
jQuery.sap.require("sap.ui.model.resource.ResourcePropertyBinding");

/**
 * Constructor for a new ResourceModel.
 *
 * @class Model implementation for resource bundles
 *
 * @extends sap.ui.model.Model
 *
 * @author SAP AG
 * @version 1.9.0-SNAPSHOT
 *
 * @param {object}
 *            oData.url defines the url of the resource bundle, [oData.locale]
 *            defines an optional locale
 * @constructor
 * @public
 */
sap.ui.model.resource.ResourceModel = function(oData) {
	sap.ui.model.Model.apply(this, arguments);

	this.sDefaultBindingMode = sap.ui.model.BindingMode.OneTime;
	this.mSupportedBindingModes = {
		"OneWay" : false,
		"TwoWay" : false,
		"OneTime" : true
	};
	// load resource bundle
	if (oData && (oData.bundleUrl || oData.bundleName)) {
		this.ResourceBundle = this.loadResourceBundle(oData);
	} else {
		throw new Error("Neither url nor library name are given. One of these is mandatory.");
	}
};

// chain the prototypes
sap.ui.model.resource.ResourceModel.prototype = jQuery.sap.newObject(sap.ui.model.Model.prototype);

/*
 * Describe the sap.ui.model.resource.ResourceModel. Resulting metadata can be
 * obtained via sap.ui.model.resource.ResourceModel.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.resource.ResourceModel", {

	// ---- object ----
	baseType : "sap.ui.model.Model",
	publicMethods : [ "getResourceBundle" ]
});

/**
 * Returns the resource bundle
 *
 * @param {object} oData
 * @return loaded resource bundle
 * @private
 */
sap.ui.model.resource.ResourceModel.prototype.loadResourceBundle = function(oData) {
	var oConfiguration = sap.ui.getCore().getConfiguration(),
		oRb, sUrl, sLocale, bIncludeInfo;
	sLocale = oData.bundleLocale;
	if (!sLocale) {
		sLocale = oConfiguration.getLanguage();
	}
	bIncludeInfo = oConfiguration.getOriginInfo();
	sUrl = oData.bundleUrl;
	if(oData.bundleName) {
		sUrl = jQuery.sap.getModulePath(oData.bundleName, '.properties');
	}
    oRb = jQuery.sap.resources({url: sUrl, locale: sLocale, includeInfo: bIncludeInfo});
    return oRb;
};

/**
 * @see sap.ui.model.Model.prototype.bindProperty
 *
 */
sap.ui.model.resource.ResourceModel.prototype.bindProperty = function(sPath) {
	var oBinding = new sap.ui.model.resource.ResourcePropertyBinding(this, sPath);
	return oBinding;
};

/**
 * Returns the value for the property with the given <code>sPropertyName</code>
 *
 * @param {string} sPath the path to the property
 * @type any
 * @return the value of the property
 * @public
 */
sap.ui.model.resource.ResourceModel.prototype.getProperty = function(sPath) {
	var sText = this.ResourceBundle.getText(sPath);
	return sText;
};

/**
 * Returns the resource bundle of this model
 *
 * @return loaded resource bundle
 * @public
 */
sap.ui.model.resource.ResourceModel.prototype.getResourceBundle = function() {
	return this.ResourceBundle;
};

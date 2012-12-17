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
 * @version 1.9.1-SNAPSHOT
 *
 * @param {object}
 *            oData.url defines the url of the resource bundle, [oData.locale]
 *            defines an optional locale
 * @constructor
 * @public
 * @name sap.ui.model.resource.ResourceModel
 */
sap.ui.model.Model.extend("sap.ui.model.resource.ResourceModel", /** @lends sap.ui.model.resource.ResourceModel */ {

	constructor : function(oData) {
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
	},

	metadata : {
		publicMethods : [ "getResourceBundle" ]
	}

});

/**
 * Creates a new subclass of class sap.ui.model.resource.ResourceModel with name <code>sClassName</code> 
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
 * @name sap.ui.model.resource.ResourceModel.extend
 * @function
 */

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

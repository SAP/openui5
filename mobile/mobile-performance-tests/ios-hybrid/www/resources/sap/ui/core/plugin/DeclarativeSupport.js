/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.plugin.DeclarativeSupport
jQuery.sap.declare("sap.ui.core.plugin.DeclarativeSupport");

jQuery.sap.require("sap.ui.core.DeclarativeSupport");
jQuery.sap.require("sap.ui.core.Core");

/**
 * Creates an instance of the class <code>sap.ui.core.plugin.DeclarativeSupport</code>
 * The plugin uses the <code>sap.ui.core.DeclarativeSupport</code>.
 *
 * @author Peter Muessig, Tino Butz
 * @see sap.ui.core.DeclarativeSupport
 * @public
 * @since 1.7.0
 * @version 1.9.1-SNAPSHOT
 */
sap.ui.core.plugin.DeclarativeSupport = function() {
};


/**
 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start.
 *
 * @param {sap.ui.core.Core} oCore reference to the Core
 * @param {boolean} [bOnInit] whether the hook is called during core initialization
 * @public
 */
sap.ui.core.plugin.DeclarativeSupport.prototype.startPlugin = function(oCore, bOnInit) {
	jQuery.sap.log.info("Starting DeclarativeSupport plugin.");
	this.oCore = oCore;
	this.oWindow = window;
	sap.ui.core.DeclarativeSupport.compile(document.body);
};

/**
 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start
 * @param {sap.ui.core.Core} oCore reference to the Core
 * @public
 */
sap.ui.core.plugin.DeclarativeSupport.prototype.stopPlugin = function() {
	jQuery.sap.log.info("Stopping DeclarativeSupport plugin.");
	this.oCore = null;
};


/**
 * Create the <code>sap.ui.core.plugin.DeclarativeSupport</code> plugin and
 * register it within the <code>sap.ui.core.Core</code>.
 */
(function(){
	var oThis = new sap.ui.core.plugin.DeclarativeSupport();
	sap.ui.getCore().registerPlugin(oThis);
}());
/*!
 * ${copyright}
 */

// Provides class sap.ui.core.plugin.TemplatingSupport
sap.ui.define([
	"sap/base/Log",
	'sap/ui/core/tmpl/Template', // provides sap.ui.template
	'sap/ui/core/Core' // provides sap.ui.getCore()
], function(Log) {
	"use strict";


	/**
	 * Creates an instance of the class <code>sap.ui.core.plugin.TemplatingSupport</code>
	 * The plugin uses the <code>sap.ui.core.tmpl.Template</code>.
	 *
	 * @author Peter Muessig
	 * @public
	 * @since 1.15.0
	 * @deprecated since 1.56, use an {@link sap.ui.core.mvc.XMLView} or a {@link topic:e6bb33d076dc4f23be50c082c271b9f0 Typed View} instead
	 * @version ${version}
	 * @alias sap.ui.core.plugin.TemplatingSupport
	 */
	var TemplatingSupport = function() {
	};


	/**
	 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start.
	 *
	 * @param {sap.ui.core.Core} oCore reference to the Core
	 * @param {boolean} [bOnInit] whether the hook is called during core initialization
	 * @public
	 */
	TemplatingSupport.prototype.startPlugin = function(oCore, bOnInit) {
		Log.info("Starting TemplatingSupport plugin.");
		this.oCore = oCore;
		sap.ui.template();
	};

	/**
	 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start
	 * @public
	 */
	TemplatingSupport.prototype.stopPlugin = function() {
		Log.info("Stopping TemplatingSupport plugin.");
		this.oCore = null;
	};


	/**
	 * Create the <code>sap.ui.core.plugin.TemplatingSupport</code> plugin and
	 * register it within the <code>sap.ui.core.Core</code>.
	 */
	sap.ui.getCore().registerPlugin(new TemplatingSupport());

	return TemplatingSupport;

}, /* bExport= */ true);
/*!
 * ${copyright}
 */

// Provides class sap.ui.core.plugin.DeclarativeSupport
sap.ui.define([
	"sap/base/Log",
	'sap/ui/core/DeclarativeSupport',
	'sap/ui/core/Core' // provides sap.ui.getCore()
], function(Log, DeclarativeSupport) {
	"use strict";


	/**
	 * Creates an instance of the class <code>sap.ui.core.plugin.DeclarativeSupport</code>
	 * The plugin uses the {@link sap.ui.core.DeclarativeSupport}.
	 *
	 * @author Peter Muessig, Tino Butz
	 * @see sap.ui.core.DeclarativeSupport
	 * @public
	 * @since 1.7.0
	 * @version ${version}
	 * @alias sap.ui.core.plugin.DeclarativeSupport
	 */
	var DeclarativeSupportPlugin = function() {
	};


	/**
	 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start.
	 *
	 * @param {sap.ui.core.Core} oCore reference to the Core
	 * @param {boolean} [bOnInit] whether the hook is called during core initialization
	 * @public
	 */
	DeclarativeSupportPlugin.prototype.startPlugin = function(oCore, bOnInit) {
		Log.info("Starting DeclarativeSupport plugin.");
		this.oCore = oCore;
		this.oWindow = window;
		DeclarativeSupport.compile(document.body);
	};

	/**
	 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start
	 * @public
	 */
	DeclarativeSupportPlugin.prototype.stopPlugin = function() {
		Log.info("Stopping DeclarativeSupport plugin.");
		this.oCore = null;
	};


	/*
	 * Create the <code>sap.ui.core.plugin.DeclarativeSupport</code> plugin and
	 * register it within the <code>sap.ui.core.Core</code>.
	 */
	sap.ui.getCore().registerPlugin(new DeclarativeSupportPlugin());

	return DeclarativeSupportPlugin;

}, /* bExport= */ true);
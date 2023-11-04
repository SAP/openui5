/*!
 * ${copyright}
 */

/**
 * @overview Initialization for the SAP UI Library
 *
 * This module creates the main SAP namespaces {@link sap} and automatically
 * registers it to the OpenAjax hub if that exists.
 *
 * This class provides method {@link #namespace} to register namespaces to the
 * SAP UI Library.
 *
 * @sample
 * Ensures a control can be used afterwards but does not load immediately
 * sap.ui.lazyRequire("sap.ui.core.Control");
 * sap.ui.lazyRequire("sap.m.Button");
 *
 * @version ${version}
 * @author  SAP SE
 * @public
 */

/*global OpenAjax */

sap.ui.define([
],
	function() {
		"use strict";

		// Register to the OpenAjax Hub if it exists
		if (window.OpenAjax && window.OpenAjax.hub) {
			OpenAjax.hub.registerLibrary("sap", "http://www.sap.com/", "0.1", {});
		}

		/**
		 * Root namespace for JavaScript functionality provided by SAP SE.
		 *
		 * The <code>sap</code> namespace is automatically registered with the
		 * OpenAjax hub if it exists.
		 *
		 * @version ${version}
		 * @namespace
		 * @public
		 * @name sap
		 */

		/**
		 * The <code>sap.ui</code> namespace is the central OpenAjax compliant entry
		 * point for UI related JavaScript functionality provided by SAP.
		 *
		 * @version ${version}
		 * @namespace
		 * @name sap.ui
		 * @public
		 */

		let Global = {
			/**
			 * The version of the SAP UI Library
			 * @type string
			 */
			version: "${version}",
			// buildinfo.lastchange is deprecated and is therefore defaulted to empty string
			buildinfo : { lastchange : "", buildtime : "${buildtime}" }
		};

		var syncCallBehavior = sap.ui.loader._.getSyncCallBehavior();

		return Global;
	});
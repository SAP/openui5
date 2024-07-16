/*!
 * ${copyright}
 */

/*global OpenAjax */

sap.ui.define([
],
	function() {
		"use strict";

		// Register to the OpenAjax Hub if it exists
		if (globalThis.OpenAjax && globalThis.OpenAjax.hub) {
			OpenAjax.hub.registerLibrary("sap", "http://www.sap.com/", "0.1", {});
		}

		/**
		 * The <code>sap.ui</code> namespace is the central OpenAjax compliant entry
		 * point for UI related JavaScript functionality provided by SAP.
		 *
		 * @version ${version}
		 * @namespace
		 * @name sap.ui
		 * @public
		 */

		const Global = {
			/**
			 * The version of the SAP UI Library
			 * @type string
			 */
			version: "${version}",
			// buildinfo.lastchange is deprecated and is therefore defaulted to empty string
			buildinfo : { lastchange : "", buildtime : "${buildtime}" }
		};

		return Global;
	});
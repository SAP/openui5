/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/syncFetch"
], function (Log, syncFetch) {
	"use strict";

	/*
	 * Merged, raw (un-interpreted) configuration data from the following sources
	 * (last one wins)
	 * <ol>
	 * <li>global configuration object <code>window["sap-ui-config"]</code> (could be either a string/url or a configuration object)</li>
	 * <li><code>data-sap-ui-config</code> attribute of the bootstrap script tag</li>
	 * <li>other <code>data-sap-ui-<i>xyz</i></code> attributes of the bootstrap tag</li>
	 * </ol>
	 */
	var oCfgData = window["sap-ui-config"] = (function() {
		function normalize(o) {
			for (var i in o) {
				var v = o[i];
				var il = i.toLowerCase();
				if ( !o.hasOwnProperty(il) ) {
					o[il] = v;
					delete o[i];
				}
			}
			return o;
		}

		function loadExternalConfig(url) {
			var sCfgFile = "sap-ui-config.json",
				config;

			Log.warning("Loading external bootstrap configuration from \"" + url + "\". This is a design time feature and not for productive usage!");
			if (url !== sCfgFile) {
				Log.warning("The external bootstrap configuration file should be named \"" + sCfgFile + "\"!");
			}

			try {
				var oSimpleResponse = syncFetch(url, {
					headers: {
						Accept: syncFetch.ContentTypes.JSON
					}
				});
				if (oSimpleResponse.ok) {
					try {
						config = oSimpleResponse.json();
					} catch (error) {
						Log.error("Parsing externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
					}
				} else {
					Log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Response: " + oSimpleResponse.status + "!");
				}
			} catch (error) {
				Log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
			}

			config = config || {};
			config.__loaded = true; // mark config as 'being loaded', needed to detect sync call

			return config;
		}

		function getInfo() {
			function check(oScript, rUrlPattern) {
				var sUrl = oScript && oScript.getAttribute("src");
				var oMatch = rUrlPattern.exec(sUrl);
				if ( oMatch ) {
					return {
						tag: oScript,
						url: sUrl,
						resourceRoot: oMatch[1] || ""
					};
				}
			}

			var rResources = /^((?:.*\/)?resources\/)/,
				rBootScripts, aScripts, i, oResult;

			// Prefer script tags which have the sap-ui-bootstrap ID
			// This prevents issues when multiple script tags point to files named
			// "sap-ui-core.js", for example when using the cache buster for UI5 resources
			oResult = check(document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), rResources);

			if ( !oResult ) {
				aScripts = document.querySelectorAll('SCRIPT[src]');
				rBootScripts = /^([^?#]*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-[^?#/]*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
				for ( i = 0; i < aScripts.length; i++ ) {
					oResult = check(aScripts[i], rBootScripts);
					if ( oResult ) {
						break;
					}
				}
			}

			return oResult || {};
		}

		var _oBootstrap = getInfo(),
			oScriptTag = _oBootstrap.tag,
			oCfg = window["sap-ui-config"];

		// load the configuration from an external JSON file
		if (typeof oCfg === "string") {
			oCfg = loadExternalConfig(oCfg);
		}
		oCfg = normalize(oCfg || {});
		oCfg.resourceroots = oCfg.resourceroots || {};
		oCfg.themeroots = oCfg.themeroots || {};

		// if a script tag has been identified, collect its configuration info
		if ( oScriptTag ) {
			// evaluate the config attribute first - if present
			var sConfig = oScriptTag.getAttribute("data-sap-ui-config");
			if ( sConfig ) {
				try {
					var oParsedConfig;
					try {
						// first try to parse the config as a plain JSON
						oParsedConfig = JSON.parse("{" + sConfig + "}");
					} catch (e) {
						// if the JSON.parse fails, we fall back to the more lenient "new Function" eval for compatibility reasons
						Log.error("JSON.parse on the data-sap-ui-config attribute failed. Please check the config for JSON syntax violations.");
						/*eslint-disable no-new-func */
						oParsedConfig = (new Function("return {" + sConfig + "};"))();
						/*eslint-enable no-new-func */
					}
					Object.assign(oCfg, normalize(oParsedConfig));
				} catch (e) {
					// no log yet, how to report this error?
					Log.error("failed to parse data-sap-ui-config attribute: " + (e.message || e));
				}
			}

			// merge with any existing "data-sap-ui-" attributes
			for (var i = 0; i < oScriptTag.attributes.length; i++) {
				var attr = oScriptTag.attributes[i];
				var m = attr.name.match(/^data-sap-ui-(.*)$/);
				if ( m ) {
					// the following (deactivated) conversion would implement multi-word names like "resource-roots"
					m = m[1].toLowerCase(); // .replace(/\-([a-z])/g, function(s,w) { return w.toUpperCase(); })
					if ( m === 'resourceroots' ) {
						// merge map entries instead of overwriting map
						Object.assign(oCfg[m], JSON.parse(attr.value));
					} else if ( m === 'theme-roots' ) {
						// merge map entries, but rename to camelCase
						Object.assign(oCfg.themeroots, JSON.parse(attr.value));
					} else if ( m !== 'config' ) {
						oCfg[m] = attr.value;
					}
				}
			}
		}

		return oCfg;
	}());

	// evaluate configuration
	oCfgData.loglevel = (function() {
		var m = /(?:\?|&)sap-ui-log(?:L|-l)evel=([^&]*)/.exec(window.location.search);
		return m && m[1];
	}()) || oCfgData.loglevel;
	if ( oCfgData.loglevel ) {
		Log.setLevel(Log.Level[oCfgData.loglevel.toUpperCase()] || parseInt(oCfgData.loglevel));
	} else if (!window["sap-ui-optimized"]) {
		Log.setLevel(Log.Level.DEBUG);
	}

	function ui5ToRJS(sName) {
		if ( /^jquery\.sap\./.test(sName) ) {
			return sName;
		}
		return sName.replace(/\./g, "/");
	}

	// take resource roots from configuration
	var paths = {};
	for ( var n in oCfgData["resourceroots"] ) {
		paths[ui5ToRJS(n)] = oCfgData["resourceroots"][n] || ".";
	}
	sap.ui.loader.config({paths: paths});
});
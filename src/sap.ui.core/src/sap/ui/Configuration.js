/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global XMLHttpRequest */
sap.ui.define(["sap/ui/bootstrap/Info", "sap/base/util/extend", "sap/base/log"], function(_oBootstrap, extend, log) {

	"use strict";

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

		log.warning("Loading external bootstrap configuration from \"" + url + "\". This is a design time feature and not for productive usage!");
		if (url !== sCfgFile) {
			log.warning("The external bootstrap configuration file should be named \"" + sCfgFile + "\"!");
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load', function(e) {
			if ( xhr.status === 200 && xhr.responseText ) {
				try {
					config = JSON.parse( xhr.responseText );
				} catch (error) {
					log.error("Parsing externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
				}
			} else {
				log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Response: " + xhr.status + "!");
			}
		});
		xhr.open('GET', url, false);
		try {
			xhr.send();
		} catch (error) {
			log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
		}

		config = config || {};
		config.__loaded = true; // makr config as 'being loaded', needed to detect sync call

		return config;
	}

	var oScriptTag = _oBootstrap.tag,
		oCfg = window["sap-ui-config"];

	// load the configuration from an external JSON file
	if (typeof oCfg === "string") {
		oCfg = loadExternalConfig(oCfg);
	}

	oCfg = normalize(oCfg || {});
	oCfg.resourceroots = oCfg.resourceroots || {};
	oCfg.themeroots = oCfg.themeroots || {};
	oCfg.resourceroots[''] = oCfg.resourceroots[''] || _oBootstrap.resourceRoot;

	// map loadall mode to sync preload mode
	if ( /(^|\/)(sap-?ui5|[^\/]+-all).js([?#]|$)/.test(_oBootstrap.url) ) {
		log.error(
			"The all-in-one file 'sap-ui-core-all.js' has been abandoned in favour of standard preloads." +
			" Please migrate to sap-ui-core.js and consider to use async preloads.");
		oCfg.preload = 'sync';
	}

	// if a script tag has been identified, collect its configuration info
	if ( oScriptTag ) {
		// evaluate the config attribute first - if present
		var sConfig = oScriptTag.getAttribute("data-sap-ui-config");
		if ( sConfig ) {
			try {
				/*eslint-disable no-new-func */
				extend(oCfg, normalize((new Function("return {" + sConfig + "};"))())); // TODO jQuery.parseJSON would be better but imposes unwanted restrictions on valid syntax
				/*eslint-enable no-new-func */
			} catch (e) {
				// no log yet, how to report this error?
				log.error("failed to parse data-sap-ui-config attribute: " + (e.message || e));
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
					extend(oCfg[m], JSON.parse(attr.value));
				} else if ( m === 'theme-roots' ) {
					// merge map entries, but rename to camelCase
					extend(oCfg.themeroots, JSON.parse(attr.value));
				} else if ( m !== 'config' ) {
					oCfg[m] = attr.value;
				}
			}
		}
	}

	return oCfg;
});
/*!
 * ${copyright}
 */

/**
 * evaluate configuration before starting the bootstrap sequence
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config",
	"sap/ui/core/boot/_resourceRoots"
], (
	config,
	_resourceRoots
) => {
	"use strict";

	/*
	 * This module tries to detect a bootstrap script tag in the current page and
	 * to derive the path for 'resources/' from it. For that purpose it checks for a
	 * hard coded set of well-known bootstrap script names:
	 *  - sap-ui-custom(-suffix)?.js
	 *  - sap-ui-core(-suffix)?.js
	 *  - jquery.sap.global.js
	 *  - ui5loader-autoconfig.js
	 */

	/*global */

	/** configuration */
	var ui5loader = globalThis.sap && globalThis.sap.ui && globalThis.sap.ui.loader;

	if (ui5loader == null) {
		throw new Error("ui5loader-autoconfig.js: ui5loader is needed, but could not be found");
	}

	/** autoconfig */
	var sBaseUrl, bNojQuery,
		aScripts, rBootScripts, i,
		sBootstrapUrl, bExposeAsAMDLoader = false;

	function findBaseUrl(oScript, rUrlPattern) {
		var sUrl = oScript && oScript.getAttribute("src"),
			oMatch = rUrlPattern.exec(sUrl);
		if ( oMatch ) {
			sBaseUrl = oMatch[1] || "";
			sBootstrapUrl = sUrl;
			bNojQuery = /sap-ui-core-nojQuery\.js(?:[?#]|$)/.test(sUrl);
			return true;
		}
		return false;
	}

	// Prefer script tags which have the sap-ui-bootstrap ID
	// This prevents issues when multiple script tags point to files named
	// "sap-ui-core.js", for example when using the cache buster for UI5 resources
	if ( !findBaseUrl(document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), /^((?:[^?#]*\/)?resources\/)/ ) ) {

		// only when there's no such script tag, check all script tags
		rBootScripts = /^([^?#]*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-[^?#/]*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
		aScripts = document.scripts;
		for ( i = 0; i < aScripts.length; i++ ) {
			if ( findBaseUrl(aScripts[i], rBootScripts) ) {
				break;
			}
		}
	}

	// configuration via window['sap-ui-config'] always overrides an auto detected base URL
	const mResourceRoots = _resourceRoots.register();
	if (typeof mResourceRoots[''] === 'string' ) {
		sBaseUrl = mResourceRoots[''];
	}

	if (sBaseUrl == null) {
		throw new Error("ui5loader-autoconfig.js: could not determine base URL. No known script tag and no configuration found!");
	}

	/**
	 * Determine whether to use debug sources depending on URL parameter, local storage
	 * and script tag attribute.
	 * If full debug mode is required, restart with a debug version of the bootstrap.
	 */
	(function() {
		// check URI param
		var vDebugInfo = config.get({
			name: "sapUiDebug",
			type: config.Type.String,
			defaultValue: false,
			external: true,
			freeze: true
		});

		// check local storage
		try {
			vDebugInfo = vDebugInfo || window.localStorage.getItem("sap-ui-debug");
		} catch (e) {
			// access to localStorage might be disallowed
		}

		// normalize vDebugInfo; afterwards, it either is a boolean or a string not representing a boolean
		if ( typeof vDebugInfo === 'string' ) {
			if ( /^(?:false|true|x|X)$/.test(vDebugInfo) ) {
				vDebugInfo = vDebugInfo !== 'false';
			}
		} else {
			vDebugInfo = !!vDebugInfo;
		}

		// if bootstrap URL explicitly refers to a debug source, generally use debug sources
		if ( /-dbg\.js([?#]|$)/.test(sBootstrapUrl) ) {
			window['sap-ui-loaddbg'] = true;
			vDebugInfo = vDebugInfo || true;
		}

		// export resulting debug mode under legacy property
		window["sap-ui-debug"] = vDebugInfo;

		// check for optimized sources by testing variable names in a local function
		// (check for native API ".getAttribute" to make sure that the function's source can be retrieved)
		window["sap-ui-optimized"] = window["sap-ui-optimized"] ||
			(/\.getAttribute/.test(findBaseUrl) && !/oScript/.test(findBaseUrl));

		if ( window["sap-ui-optimized"] && vDebugInfo ) {
			// if current sources are optimized and any debug sources should be used, enable the "-dbg" suffix
			window['sap-ui-loaddbg'] = true;
		}

		function makeRegExp(sGlobPattern) {
			if (!/\/\*\*\/$/.test(sGlobPattern)) {
				sGlobPattern = sGlobPattern.replace(/\/$/, '/**/');
			}
			return sGlobPattern.replace(/\*\*\/|\*|[[\]{}()+?.\\^$|]/g, function(sMatch) {
				switch (sMatch) {
					case '**/': return '(?:[^/]+/)*';
					case '*': return '[^/]*';
					default: return '\\' + sMatch;
				}
			});
		}

		var fnIgnorePreload;

		if (typeof vDebugInfo === 'string') {
			var sPattern = "^(?:" + vDebugInfo.split(/,/).map(makeRegExp).join("|") + ")",
				rFilter = new RegExp(sPattern);

			fnIgnorePreload = function(sModuleName) {
				return rFilter.test(sModuleName);
			};

			ui5loader._.logger.debug("Modules that should be excluded from preload: '" + sPattern + "'");

		} else if (vDebugInfo === true) {

			fnIgnorePreload = function() {
				return true;
			};

			ui5loader._.logger.debug("All modules should be excluded from preload");

		}

		ui5loader.config({
			debugSources: !!window['sap-ui-loaddbg'],
			ignoreBundledResources: fnIgnorePreload
		});

	})();

	if (config.get({
		name: "sapUiAsync",
		type: config.Type.Boolean,
		external: true,
		freeze: true
	})) {
		ui5loader.config({
			async: true
		});
	}

	// Note: loader converts any NaN value to a default value
	ui5loader._.maxTaskDuration = config.get({
		name: "sapUiXxMaxLoaderTaskDuration",
		type: config.Type.Integer,
		defaultValue: undefined,
		external: true,
		freeze: true
	});

	// support legacy switch 'noLoaderConflict', but 'amdLoader' has higher precedence
	bExposeAsAMDLoader = config.get({
		name: "sapUiAmd",
		type: config.Type.Boolean,
		defaultValue: !config.get({
			name: "sapUiNoLoaderConflict",
			type: config.Type.Boolean,
			defaultValue: true,
			external: true,
			freeze: true
		}),
		external: true,
		freeze: true
	});

	//calculate syncCallBehavior
	let syncCallBehavior = 0; // ignore
	const sNoSync = config.get({
		name: "sapUiXxNoSync",
		type: config.Type.String,
		external: true,
		freeze: true
	});
	if (sNoSync === 'warn') {
		syncCallBehavior = 1;
	} else if (/^(true|x)$/i.test(sNoSync)) {
		syncCallBehavior = 2;
	}

	/**
	 * @deprectaed As of Version 1.120
	 */
	(() => {
		const GlobalConfigurationProvider = sap.ui.require("sap/base/config/GlobalConfigurationProvider");
		if ( syncCallBehavior && GlobalConfigurationProvider._.configLoaded()) {
			const sMessage = "[nosync]: configuration loaded via sync XHR";
			if (syncCallBehavior === 1) {
				ui5loader._.logger.warning(sMessage);
			} else {
				ui5loader._.logger.error(sMessage);
			}
		}
	})();

	ui5loader.config({
		amd: bExposeAsAMDLoader,
		reportSyncCalls: syncCallBehavior
	});

	var defineModuleSync = ui5loader._.defineModuleSync;

	defineModuleSync('ui5loader.js', null);

	if (bNojQuery && typeof jQuery === 'function') {
		// when we're executed in the context of the sap-ui-core-noJQuery file,
		// we try to detect an existing jQuery / jQuery position plugin and register them as modules
		defineModuleSync('sap/ui/thirdparty/jquery.js', jQuery);
		if (jQuery.ui && jQuery.ui.position) {
			defineModuleSync('sap/ui/thirdparty/jqueryui/jquery-ui-position.js', jQuery);
		}
	}

	var sMainModule = config.get({
		name: "sapUiMain",
		type: config.Type.String,
		freeze: true
	});
	if ( sMainModule ) {
		sap.ui.require(sMainModule.trim().split(/\s*,\s*/));
	}
});

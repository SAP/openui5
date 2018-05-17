/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
(function() {

	/*
	 * This module tries to detect a bootstrap script tag in the current page and
	 * to derive the path for 'resources/' from it. For that purpose it checks for a
	 * hard coded set of well-known bootstrap script names:
	 *  - sap-ui-custom(-suffix)?.js
	 *  - sap-ui-core(-suffix)?.js
	 *  - jquery.sap.global.js
	 *  - ui5loader-autoconfig.js
	 */

	/*global console, document, jQuery, sap, window */
	"use strict";

	var ui5loader = window.sap && window.sap.ui && window.sap.ui.loader,
		oCfg = window['sap-ui-config'] || {},
		sBaseUrl, bNojQuery,
		aScripts, rBootScripts, i,
		oBootstrapScript, sBootstrapUrl, bExposeAsAMDLoader = false;

	function findBaseUrl(oScript, rUrlPattern) {
		var sUrl = oScript && oScript.getAttribute("src"),
			oMatch = rUrlPattern.exec(sUrl);
		if ( oMatch ) {
			sBaseUrl = oMatch[1] || "";
			oBootstrapScript = oScript;
			sBootstrapUrl = sUrl;
			bNojQuery = /sap-ui-core-nojQuery\.js(?:\?|#|$)/.test(sUrl);
			return true;
		}
	}

	function ensureSlash(path) {
		return path && path[path.length - 1] !== '/' ? path + '/' : path;
	}

	if (ui5loader == null) {
		throw new Error("ui5loader-autoconfig.js: ui5loader is needed, but could not be found");
	}

	// Prefer script tags which have the sap-ui-bootstrap ID
	// This prevents issues when multiple script tags point to files named
	// "sap-ui-core.js", for example when using the cache buster for UI5 resources
	if ( !findBaseUrl(document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), /^((?:.*\/)?resources\/)/ ) ) {

		// only when there's no such script tag, check all script tags
		rBootScripts = /^(.*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-\w*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
		aScripts = document.scripts;
		for ( i = 0; i < aScripts.length; i++ ) {
			if ( findBaseUrl(aScripts[i], rBootScripts) ) {
				break;
			}
		}
	}

	// configuration via window['sap-ui-config'] always overrides an auto detected base URL
	if ( typeof oCfg === 'object'
		 && typeof oCfg.resourceRoots === 'object'
		 && typeof oCfg.resourceRoots[''] === 'string' ) {
		sBaseUrl = oCfg.resourceRoots[''];
	}

	if (sBaseUrl == null) {
		throw new Error("ui5loader-autoconfig.js: could not determine base URL. No known script tag and no configuration found!");
	}

	/**
	 * Determine whether a bootstrap reboot URL is set to reboot UI5 from a different URL
	 */
	(function() {
		var sRebootUrl;
		try { // Necessary for FF when Cookies are disabled
			sRebootUrl = window.localStorage.getItem("sap-ui-reboot-URL");
		} catch (e) { /* no warning, as this will happen on every startup, depending on browser settings */ }

		/*
		* Determine whether sap-bootstrap-debug is set, run debugger statement
		* to allow early debugging in browsers with broken dev tools
		*/
		if (/sap-bootstrap-debug=(true|x|X)/.test(location.search)) {
			/*eslint-disable no-debugger */
			debugger;
			/*eslint-enable no-debugger */
		}

		if (sRebootUrl) {
			var sDebugRebootPath = ensureSlash(sBaseUrl) + 'sap/ui/core/support/debugReboot.js';

			// This won't work in case this script is loaded async (e.g. dynamic script tag)
			document.write("<script src=\"" + sDebugRebootPath + "\"></script>");

			var oRestart = new Error("This is not a real error. Aborting UI5 bootstrap and rebooting from: " + sRebootUrl);
			oRestart.name = "Restart";
			throw oRestart;
		}

	})();

	/**
	 * Determine whether to use debug sources depending on URL parameter, local storage
	 * and script tag attribute.
	 * If full debug mode is required, restart with a debug version of the bootstrap.
	 */
	(function() {
		// check URI param
		var mUrlMatch = /(?:^|\?|&)sap-ui-debug=([^&]*)(?:&|$)/.exec(window.location.search),
			vDebugInfo = mUrlMatch && decodeURIComponent(mUrlMatch[1]);

		// check local storage
		try {
			vDebugInfo = vDebugInfo || window.localStorage.getItem("sap-ui-debug");
		} catch (e) {
			// access to localStorage might be disallowed
		}

		// check bootstrapScript attribute
		vDebugInfo = vDebugInfo || (oBootstrapScript && oBootstrapScript.getAttribute("data-sap-ui-debug"));

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

		if ( window["sap-ui-optimized"] && vDebugInfo ) {
			// if current sources are optimized and any debug sources should be used, enable the "-dbg" suffix
			window['sap-ui-loaddbg'] = true;
			// if debug sources should be used in general, restart with debug URL
			if ( vDebugInfo === true ) {
				var sDebugUrl;
				if ( sBootstrapUrl != null ) {
					sDebugUrl = sBootstrapUrl.replace(/\/(?:sap-ui-cachebuster\/)?([^\/]+)\.js/, "/$1-dbg.js");
				} else {
					// when no boot script could be identified, we can't derive the name of the
					// debug boot script from it, so fall back to a default debug boot script
					sDebugUrl = ensureSlash(sBaseUrl) + 'sap-ui-core.js';
				}
				// revert changes to global names
				ui5loader.config({
					exposeAsAMDLoader:false
				});
				window["sap-ui-optimized"] = false;

				if (ui5loader.config().async) {
					var script = document.createElement("script");
					script.src = sDebugUrl;
					document.head.appendChild(script);
				} else {
					document.write("<script src=\"" + sDebugUrl + "\"></script>");
				}

				var oRestart = new Error("This is not a real error. Aborting UI5 bootstrap and restarting from: " + sDebugUrl);
				oRestart.name = "Restart";
				throw oRestart;
			}
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

	function _getOption(name, defaultValue, pattern) {
		// check for an URL parameter ...
		var match = window.location.search.match(new RegExp("(?:^\\??|&)sap-ui-" + name + "=([^&]*)(?:&|$)"));
		if ( match && (pattern == null || pattern.test(match[1])) ) {
			return match[1];
		}
		// ... or an attribute of the bootstrap tag
		var attrValue = oBootstrapScript && oBootstrapScript.getAttribute("data-sap-ui-" + name.toLowerCase());
		if ( attrValue != null && (pattern == null || pattern.test(attrValue)) ) {
			return attrValue;
		}
		// ... or an entry in the global config object
		if ( Object.prototype.hasOwnProperty.call(oCfg, name) && (pattern == null || pattern.test(oCfg[name])) ) {
			return oCfg[name];
		}
		// if no valid config value is found, fall back to a system default value
		return defaultValue;
	}

	function _getBooleanOption(name, defaultValue) {
		return /^(?:true|x|X)$/.test( _getOption(name, defaultValue, /^(?:true|x|X|false)$/) );
	}

	if ( _getBooleanOption("xx-async", false) ) {
		ui5loader.config({
			async: true
		});
	}

	// support legacy switch 'noLoaderConflict', but 'amdLoader' has higher precedence
	var bExposeAsAMDLoader = _getBooleanOption("amd", !_getBooleanOption("noLoaderConflict", true));

	ui5loader.config({
		baseUrl: sBaseUrl,

		amd: bExposeAsAMDLoader,

		map: {
			"*": {
				'blanket': 'sap/ui/thirdparty/blanket',
				'crossroads': 'sap/ui/thirdparty/crossroads',
				'd3': 'sap/ui/thirdparty/d3',
				'handlebars': 'sap/ui/thirdparty/handlebars',
				'hasher': 'sap/ui/thirdparty/hasher',
				'IPv6': 'sap/ui/thirdparty/IPv6',
				'jquery': 'sap/ui/thirdparty/jquery',
				'jszip': 'sap/ui/thirdparty/jszip',
				'less': 'sap/ui/thirdparty/less',
				'OData': 'sap/ui/thirdparty/datajs',
				'punycode': 'sap/ui/thirdparty/punycode',
				'SecondLevelDomains': 'sap/ui/thirdparty/SecondLevelDomains',
				'sinon': 'sap/ui/thirdparty/sinon',
				'signals': 'sap/ui/thirdparty/signals',
				'URI': 'sap/ui/thirdparty/URI',
				'URITemplate': 'sap/ui/thirdparty/URITemplate',
				'esprima': 'sap/ui/demokit/js/esprima'
			}
		},

		shim: {
			'sap/ui/thirdparty/blanket': {
				amd: true,
				exports: 'blanket' // '_blanket', 'esprima', 'falafel', 'inBrowser', 'parseAndModify'
			},
			'sap/ui/thirdparty/caja-html-sanitizer': {
				amd: false,
				exports: 'html' // 'html_sanitizer', 'html4'
			},
			'sap/ui/thirdparty/crossroads': {
				amd: true,
				exports: 'crossroads',
				deps: ['sap/ui/thirdparty/signals']
			},
			'sap/ui/thirdparty/d3': {
				amd: true,
				exports: 'd3'
			},
			'sap/ui/thirdparty/datajs': {
				amd: true,
				exports: 'OData' // 'datajs'
			},
			'sap/ui/thirdparty/es6-promise': {
				amd: true,
				exports: 'ES6Promise'
			},
			'sap/ui/thirdparty/flexie': {
				amd: false,
				exports: 'Flexie'
			},
			'sap/ui/thirdparty/handlebars': {
				amd: true,
				exports: 'Handlebars'
			},
			'sap/ui/thirdparty/hasher': {
				amd: true,
				exports: 'hasher',
				deps: ['sap/ui/thirdparty/signals']
			},
			'sap/ui/thirdparty/IPv6': {
				amd: true,
				exports: 'IPv6'
			},
			'sap/ui/thirdparty/iscroll-lite': {
				amd: false,
				exports: 'iScroll'
			},
			'sap/ui/thirdparty/iscroll': {
				amd: false,
				exports: 'iScroll'
			},
			'sap/ui/thirdparty/jquery': {
				amd: true,
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-position': {
				amd: true,
				deps: ['sap/ui/thirdparty/jquery'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jquery-mobile-custom': {
				amd: true,
				deps: ['sap/ui/thirdparty/jquery'],
				exports: 'jQuery.mobile'
			},
			'sap/ui/thirdparty/jszip': {
				amd: true,
				exports: 'JSZip'
			},
			'sap/ui/thirdparty/less': {
				amd: true,
				exports: 'less'
			},
			'sap/ui/thirdparty/mobify-carousel': {
				amd: false,
				exports: 'Mobify' // or Mobify.UI.Carousel?
			},
			'sap/ui/thirdparty/qunit-2': {
				amd: false,
				exports: 'QUnit'
			},
			'sap/ui/thirdparty/punycode': {
				amd: true,
				exports: 'punycode'
			},
			'sap/ui/thirdparty/require': {
				exports: 'define' // 'require', 'requirejs'
			},
			'sap/ui/thirdparty/SecondLevelDomains': {
				amd: true,
				exports: 'SecondLevelDomains'
			},
			'sap/ui/thirdparty/signals': {
				amd: true,
				exports: 'signals'
			},
			'sap/ui/thirdparty/sinon': {
				amd: true,
				exports: 'sinon'
			},
			'sap/ui/thirdparty/sinon-4': {
				amd: true,
				exports: 'sinon'
			},
			'sap/ui/thirdparty/sinon-server': {
				amd: true,
				exports: 'sinon' // really sinon! sinon-server is a subset of server and uses the same global for export
			},
			'sap/ui/thirdparty/unorm': {
				amd: false,
				exports: 'UNorm'
			},
			'sap/ui/thirdparty/unormdata': {
				exports: 'UNorm', // really 'UNorm'! module extends UNorm
				deps: ['sap/ui/thirdparty/unorm']
			},
			'sap/ui/thirdparty/URI': {
				amd: true,
				exports: 'URI'
			},
			'sap/ui/thirdparty/URITemplate': {
				amd: true,
				exports: 'URITemplate',
				deps: ['sap/ui/thirdparty/URI']
			},
			'sap/ui/thirdparty/vkbeautify': {
				amd: false,
				exports: 'vkbeautify'
			},
			'sap/ui/thirdparty/zyngascroll': {
				amd: false,
				exports: 'Scroller' // 'requestAnimationFrame', 'cancelRequestAnimationFrame', 'core'
			},
			'sap/ui/demokit/js/esprima': {
				amd: true,
				exports: 'esprima'
			},
			'sap/ui/thirdparty/RequestRecorder': {
				amd: true,
				exports: 'RequestRecorder',
				deps: ['sap/ui/thirdparty/URI', 'sap/ui/thirdparty/sinon.js']
			},
			'sap/viz/libs/sap-viz': {
				amd: true
			},
			'sap/viz/libs/sap-viz-info-framework': {
				amd: true
			},
			'sap/viz/libs/sap-viz-info-charts': {
				amd: true
			},
			'sap/viz/container/libs/sap-viz-controls-vizcontainer': {
				amd: true
			},
			'sap/viz/controls/libs/sap-viz-vizframe': {
				amd: true
			},
			'sap/viz/controls/libs/sap-viz-vizservices': {
				amd: true
			},
			'sap/ui/thirdparty/bignumber': {
				amd: true,
				exports: 'BigNumber'
			}
		}
	});

	// hide sap.ui.define calls from dependency analyzers
	var _define = sap['ui']['define'];

	// @evo-todo introduce an internal API for these registrations as the declarations should be synchronous
	_define('ui5loader', function() {
		return undefined;
	});

	_define('ui5loader-autoconfig', function() {
		return undefined;
	});

	if (bNojQuery && typeof jQuery === 'function') {
		// when we're executed in the context of the sap-ui-core-noJQuery file,
		// we try to detect an existing jQuery / jQuery position plugin and register them as modules
		_define('sap/ui/thirdparty/jquery', function() {
			return jQuery;
		});
		if (jQuery.prototype.position) {
			_define('sap/ui/thirdparty/jqueryui/jquery-ui-position', function() {
				return jQuery;
			});
		}
	}

	var sMainModule = oBootstrapScript && oBootstrapScript.getAttribute('data-sap-ui-main');
	if ( sMainModule ) {
		sap.ui.require(sMainModule.trim().split(/\s*,\s*/));
	}

}());

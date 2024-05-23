/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/ui/thirdparty/URI"
], function(isPlainObject, merge, URI) {
	"use strict";

	const mConfigLoaded = {};

	// ---- helpers ----
	/**
	 * Searches for the first occurrence of an attribute with
	 * the given name and if found, returns its value.
	 *
	 * Name must not contain characters that have a meaning in CSS selectors (no escaping).
	 *
	 * @param {string} name Name of the attribute to search for
	 * @returns {string} Value of the attribute or <code>null</code>
	 */
	function getAttribute(name) {
		var tag = document.querySelector("[" + name + "]");
		return tag ? tag.getAttribute(name) : null;
	}

	function getDefaultSuiteName() {
		var sName = sap.ui.loader._.guessResourceName(location.href);
		return sName ? sName.replace(/\.html$/, "") : null;
	}

	/**
	 * Execute the given callback once the DOM is ready (which might already be the case).
	 *
	 * @returns {Promise<void>} Returns a promise that settles after DOM became ready
	 */
	function whenDOMReady() {
		return new Promise(function(resolve) {
			function onLoaded() {
				document.removeEventListener( "DOMContentLoaded", onLoaded, false );
				resolve();
			}

			if ( document.readyState === 'loading' ) {
				document.addEventListener( "DOMContentLoaded", onLoaded, false );
			} else {
				resolve();
			}
		});
	}

	/**
	 * Adds a stylesheet to the head.
	 *
	 * sap/ui/dom/includeStylesheet requires additional modules, so we don't use it here.
	 * @param {string} resourceName UI5 resource name of the stylesheet (not a URL!)
	 */
	function addStylesheet(resourceName) {
		var oLink = document.createElement("link");
		oLink.rel = "stylesheet";
		oLink.href = sap.ui.require.toUrl(resourceName);
		document.head.appendChild(oLink);
	}

	/**
	 * Very basic HTML escaping, not bullet proof.
	 *
	 * @param {string} str HTML string to encode
	 * @returns {string} Encoded HTML string.
	 */
	function encode(str) {
		return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
	}

	// assume the document.baseURI to be constant
	const [baseOrigin, baseURL] = (() => {
		const url = new URL(document.baseURI);
		return [url.origin, url.origin + url.pathname];
	})();

	function toAbsoluteURL(sUrl) {
		// check for ui5 scheme
		if (sUrl.startsWith("ui5:")) {
			// check for authority
			if (!sUrl.startsWith("ui5://")) {
				throw new Error("URLs using the 'ui5' protocol must be absolute. Relative and server absolute URLs are reserved for future use.");
			}

			const sNoScheme = sUrl.slice(6 /* "ui5://".length */);
			sUrl = sap.ui.require.toUrl(sNoScheme);
		} else {
			// not a ui5:// URL
			// in the context of the test starter, it then by convention is relative to the UI5 baseUrl (parent of "resources/")
			sUrl = sap.ui.require.toUrl("") + "/../" + sUrl;
		}
		const url = new URL(sUrl, baseURL);
		// for same origin URLs, return a URL w/o origin, otherwise the full URL
		return url.origin === baseOrigin ? url.pathname + url.search + url.hash : url.href;
	}

	// ---- Suite Configuration ----

	var DEFAULT_CONFIG = {
		name: null,
		beforeBootstrap: null,
		module: "./{name}.qunit",
		page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}",
		title: "QUnit tests '{name}' of suite '{suite}'",
		qunit: {
			versions: {
				1: {
					module: "sap/ui/thirdparty/qunit",
					css: "sap/ui/thirdparty/qunit-2.css"
				},
				2: {
					module: "sap/ui/thirdparty/qunit-2",
					css: "sap/ui/thirdparty/qunit-2.css"
				},
				edge: 2,
				"true": "edge"
			},
			version: "edge"
		},
		sinon: {
			versions: {
				1: {
					module: "sap/ui/thirdparty/sinon",
					bridge: "sap/ui/thirdparty/sinon-qunit"
				},
				4: {
					module: "sap/ui/thirdparty/sinon-4",
					bridge: "sap/ui/qunit/sinon-qunit-bridge"
				},
				edge: 4,
				"true": "edge"
			},
			version: "edge",
			qunitBridge: true,
			useFakeTimers: false,
			useFakeServer: false
		},
		coverage: {
			only: null,
			never: null,
			branchTracking: false,
			// "auto" checks for istanbul middleware and loads istanbul instrumentation, otherwise blanket is used.
			// The other options set explicitly the desired instrumenter.
			instrumenter: "auto" // blanket, istanbul, auto (default)
		},
		ui5: {
			bindingSyntax: 'complex',
			noConflict: true,
			libs: [],
			theme: "sap_horizon"
		},
		bootCore: true,
		autostart: true
	};

	function normalize(oTestConfig) {
		if ( oTestConfig && typeof oTestConfig === "object" ) {
			if ( oTestConfig.qunit === null || oTestConfig.qunit === false ) {
				oTestConfig.qunit = {
					version: null
				};
			} else if ( typeof oTestConfig.qunit === "number" || oTestConfig.qunit === "edge" ) {
				oTestConfig.qunit = {
					version: oTestConfig.qunit
				};
			} else if ( typeof oTestConfig.qunit !== "object" ) {
				oTestConfig.qunit = {};
			}

			if ( oTestConfig.sinon === null || oTestConfig.sinon === false ) {
				oTestConfig.sinon = {
					version: null
				};
			} else if ( typeof oTestConfig.sinon === "number" || oTestConfig.sinon === "edge" ) {
				oTestConfig.sinon = {
					version: oTestConfig.sinon
				};
			} else if ( typeof oTestConfig.sinon !== "object" ) {
				oTestConfig.sinon = {};
			}
		} else {
			oTestConfig = null;
		}
		return oTestConfig;
	}

	function mergeWithDefaults(oSuiteConfig, sTestSuite) {
		function resolvePlaceholders(str, name) {
			return str == null ? str : str.replace(/\{suite\}/g, sTestSuite).replace(/\{name\}/g, name);
		}

		var sModulePrefix = sTestSuite.slice(0, sTestSuite.lastIndexOf('/') + 1);

		function resolvePackage(sModule) {
			return sModule == null ? sModule : sModule.replace(/^\.\//, sModulePrefix);
		}

		// first merge the static defaults and the defaults of the suite
		var oSuiteDefaults = merge({}, DEFAULT_CONFIG, normalize(oSuiteConfig.defaults));

		// then merge each test config with the test specific defaults and the suite defaults
		Object.keys(oSuiteConfig.tests).forEach(function(name) {
			var oTestConfig = normalize(oSuiteConfig.tests[name]),
				oTestDefaults = {
					name: name
				};

			const mergeConfigObjects = (...aConfigs) => {
				const oResult = merge({}, aConfigs.shift());

				while (aConfigs.length) {
					const oTmp = aConfigs.shift();
					for (const sKey in oTmp) {
						oResult[sKey] = isPlainObject(oResult[sKey]) ? mergeConfigObjects(oResult[sKey], oTmp[sKey]) : oTmp[sKey];
					}
				}

				return oResult;
			};

			oTestConfig = mergeConfigObjects(oSuiteDefaults, oTestDefaults, oTestConfig);

			if ( Array.isArray(oTestConfig.module) ) {
				oTestConfig.module  = oTestConfig.module.map(function(sModule) {
					return resolvePackage(resolvePlaceholders(sModule, name));
				});
			} else {
				oTestConfig.module = resolvePackage(resolvePlaceholders(oTestConfig.module, name));
			}
			oTestConfig.beforeBootstrap = resolvePackage(resolvePlaceholders(oTestConfig.beforeBootstrap, name));
			oTestConfig.page = toAbsoluteURL(resolvePlaceholders(oTestConfig.page, name));

			if (oTestConfig.uriParams) {
				var oUri = new URI(oTestConfig.page);
				oUri.addSearch(oTestConfig.uriParams);
				oTestConfig.page = oUri.toString();
			}

			oTestConfig.title = resolvePlaceholders(oTestConfig.title, name);
			oSuiteConfig.tests[name] = oTestConfig;
		});

		oSuiteConfig.sortedTests =
			Object.keys(oSuiteConfig.tests)
			.sort(function(a, b) {
				var groupA = oSuiteConfig.tests[a].group || "";
				var groupB = oSuiteConfig.tests[b].group || "";
				if ( groupA !== groupB ) {
					return groupA  < groupB ? -1 : 1;
				}
				a = a.toUpperCase();
				b = b.toUpperCase();
				if (a === b) {
					return 0;
				}
				return a < b ? -1 : 1;
			})
			.map(function(name) {
				return oSuiteConfig.tests[name];
			});

		return oSuiteConfig;

	}

	/**
	 * Pattern to validate testsuite names.
	 *
	 * The pattern is so restrictive to limit the locations where code will be loaded from.
	 */
	var VALID_TESTSUITE = /^test-resources\/([a-zA-Z_$\-][a-zA-Z_$0-9\-\.]*\/)*testsuite(?:\.[a-z][a-z0-9\-]*)*\.qunit$/;
	//var VALID_TEST = /^([a-zA-Z_$\-][a-zA-Z_$0-9\-]*\/)*[a-zA-Z_$\-][a-zA-Z_$0-9\-]*$/;

	/**
	 * Loads and normalized a test suite configuration.
	 *
	 * After loading, the configuration for the individual tests is merged with
	 * the defaults that are also stored in the configuration module and it is merged
	 * with the static defaults above.
	 *
	 * In addition to the merged configuration, an alphabetically sorted
	 * array of the tests is built and stored in property <code>sortedTests</code>
	 * (sorted by 'group' asc, 'name' asc).
	 *
	 * @param {string} sTestSuite resource name of the test suite, usually starting with 'test-resources/'
	 * @returns {Promise<object>} A promise on the normalized configuration object.
	 */
	function getSuiteConfig(sTestSuite) {
		const pLoaded = mConfigLoaded[sTestSuite] || new Promise(function(resolve, reject) {
			if ( !sTestSuite ) {
				throw new TypeError("No test suite specified");
			}
			if ( !VALID_TESTSUITE.test(sTestSuite) ) {
				throw new TypeError("Invalid test suite name");
			}

			sap.ui.require([sTestSuite], function(oSuiteConfig) {
				mConfigLoaded[sTestSuite] = pLoaded;
				resolve( mergeWithDefaults(oSuiteConfig, sTestSuite) );
			}, function(oErr) {
				reject(oErr);
			});
		});
		return pLoaded;
	}

	function registerResourceRoots(oScriptTag) {
		const sResourceRoots = getAttribute("data-sap-ui-resource-roots");
		if (!sResourceRoots) {
			return;
		}
		const oResourceRoots = JSON.parse(sResourceRoots);
		const paths = {};
		for (const n in oResourceRoots) {
			paths[n.replace(/\./g, "/")] = oResourceRoots[n] || ".";
		}
		sap.ui.loader.config({ paths });
	}

	sap.ui.loader.config({
		paths: {
			'test-resources': sap.ui.require.toUrl("") + "/../test-resources/"
		}
	});

	return {
		defaultConfig: DEFAULT_CONFIG,
		addStylesheet: addStylesheet,
		encode: encode,
		getAttribute: getAttribute,
		getDefaultSuiteName: getDefaultSuiteName,
		getSuiteConfig: getSuiteConfig,
		whenDOMReady: whenDOMReady,
		registerResourceRoots: registerResourceRoots
	};

});

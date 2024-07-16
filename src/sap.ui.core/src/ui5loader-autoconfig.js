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

	/*global define */
	"use strict";

	/** BaseConfiguration */
	var ui5loader = globalThis.sap && globalThis.sap.ui && globalThis.sap.ui.loader;

	if (ui5loader == null) {
		throw new Error("ui5loader-autoconfig.js: ui5loader is needed, but could not be found");
	}

	const origDefine = globalThis.define;
	globalThis.define = function define(moduleId, dependencies, callback) {
		const imports = dependencies.map((dep) => sap.ui.require(dep));
		const moduleExport = callback(...imports);
		ui5loader._.defineModuleSync(`${moduleId}.js`, moduleExport);
	};

	define("sap/base/strings/_camelize", [], function () {
		var rCamelCase = /[-\.]([a-z0-9])/ig;
		var fnCamelize = function (sString) {
			var sNormalizedString = sString.replace( rCamelCase, function( sMatch, sChar ) {
				return sChar.toUpperCase();
			});
			if (/^[a-z][A-Za-z0-9]*$/.test(sNormalizedString)) {
				return sNormalizedString;
			}
			return undefined;
		};

		return fnCamelize;
	});

	/* helper for finding the bootstrap tag */
	function getBootstrapTag() {
		var oResult;
		function check(oScript, rUrlPattern) {
			var sUrl = oScript && oScript.getAttribute("src");
			var oMatch = rUrlPattern.exec(sUrl);
			var oTagInfo;
			if (oMatch) {
				oTagInfo = {
					tag: oScript,
					url: sUrl,
					resourceRoot: oMatch[1] || ""
				};
			}
			return oTagInfo;
		}

		if (globalThis.document) {
			var rResources = /^((?:.*\/)?resources\/)/,
				rBootScripts, aScripts, i;
			// Prefer script tags which have the sap-ui-bootstrap ID
			// This prevents issues when multiple script tags point to files named
			// "sap-ui-core.js", for example when using the cache buster for UI5 resources
			oResult = check(globalThis.document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), rResources);
			if (!oResult) {
				aScripts = globalThis.document.querySelectorAll('SCRIPT[src]');
				rBootScripts = /^([^?#]*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-[^?#/]*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
				for (i = 0; i < aScripts.length; i++) {
					oResult = check(aScripts[i], rBootScripts);
					if (oResult) {
						break;
					}
				}
			}
		}
		return oResult || {};
	}

	define("sap/base/config/GlobalConfigurationProvider", [
		"sap/base/strings/_camelize"
	], function (camelize) {
		var oConfig;
		var oWriteableConfig = Object.create(null);
		var rAlias = /^(sapUiXx|sapUi|sap)((?:[A-Z0-9][a-z]*)+)$/; //for getter
		var mFrozenProperties = Object.create(null);
		var bFrozen = false;
		var Configuration;

		function createConfig() {
			oConfig = Object.create(null);
			globalThis["sap-ui-config"] ??= {};
			var mOriginalGlobalParams = {};
			var oGlobalConfig = globalThis["sap-ui-config"];
			if (typeof oGlobalConfig === "object")  {
				for (var sKey in oGlobalConfig) {
					var sNormalizedKey = camelize("sapUi-" + sKey);
					var vFrozenValue = mFrozenProperties[sNormalizedKey];
					if (!sNormalizedKey) {
						ui5loader._.logger.error("Invalid configuration option '" + sKey + "' in global['sap-ui-config']!");
					} else if (Object.hasOwn(oConfig, sNormalizedKey)) {
						ui5loader._.logger.error("Configuration option '" + sKey + "' was already set by '" + mOriginalGlobalParams[sNormalizedKey] + "' and will be ignored!");
					} else if (Object.hasOwn(mFrozenProperties, sNormalizedKey) && oGlobalConfig[sKey] !== vFrozenValue) {
						oConfig[sNormalizedKey] = vFrozenValue;
						ui5loader._.logger.error("Configuration option '" + sNormalizedKey + "' was frozen and cannot be changed to " + oGlobalConfig[sKey] + "!");
					} else {
						oConfig[sNormalizedKey] = oGlobalConfig[sKey];
						mOriginalGlobalParams[sNormalizedKey] = sKey;
					}
				}
			}
			mOriginalGlobalParams = undefined;
		}
		function freeze() {
			if (!bFrozen) {
				createConfig();
				Configuration._.invalidate();
				bFrozen = true;
			}
		}

		function get(sKey, bFreeze) {
			if (Object.hasOwn(mFrozenProperties,sKey)) {
				return mFrozenProperties[sKey];
			}
			var vValue = oWriteableConfig[sKey] || oConfig[sKey];
			if (!Object.hasOwn(oConfig, sKey) && !Object.hasOwn(oWriteableConfig, sKey)) {
				var vMatch = sKey.match(rAlias);
				var sLowerCaseAlias = vMatch ? vMatch[1] + vMatch[2][0] + vMatch[2].slice(1).toLowerCase() : undefined;
				if (sLowerCaseAlias) {
					vValue = oWriteableConfig[sLowerCaseAlias] || oConfig[sLowerCaseAlias];
				}
			}
			if (bFreeze) {
				mFrozenProperties[sKey] = vValue;
			}
			return vValue;
		}

		function set(sKey, vValue) {
			if (Object.hasOwn(mFrozenProperties, sKey) || bFrozen) {
				ui5loader._.logger.error("Configuration option '" + sKey + "' was frozen and cannot be changed to " + vValue + "!");
			} else {
				oWriteableConfig[sKey] = vValue;
			}
		}

		function setConfiguration(Config) {
			Configuration = Config;
		}

		var GlobalConfigurationProvider = {
			get: get,
			set: set,
			freeze: freeze,
			setConfiguration: setConfiguration
		};

		createConfig();

		return GlobalConfigurationProvider;
	});

	define("sap/ui/core/config/BootstrapConfigurationProvider", [
		"sap/base/strings/_camelize"
	], function(camelize) {
		var oConfig = Object.create(null);
		var rAlias = /^(sapUiXx|sapUi|sap)((?:[A-Z0-9][a-z]*)+)$/; //for getter

		var bootstrap = getBootstrapTag();
		if (bootstrap.tag) {
			var dataset = bootstrap.tag.dataset;
			if (dataset) {
				for (var sKey in dataset) {
					var sNormalizedKey = camelize(sKey);
					if (!sNormalizedKey) {
						ui5loader._.logger.error("Invalid configuration option '" + sKey + "' in bootstrap!");
					} else if (Object.hasOwn(oConfig, sNormalizedKey)) {
						ui5loader._.logger.error("Configuration option '" + sKey + "' already exists and will be ignored!");
					} else {
						oConfig[sNormalizedKey] = dataset[sKey];
					}
				}
			}
		}

		function get(sKey) {
			var vValue = oConfig[sKey];
			if (vValue === undefined) {
				var vMatch = sKey.match(rAlias);
				var sLowerCaseAlias = vMatch ? vMatch[1] + vMatch[2][0] + vMatch[2].slice(1).toLowerCase() : undefined;
				if (sLowerCaseAlias) {
					vValue = oConfig[sLowerCaseAlias];
				}
			}
			return vValue;
		}

		var BootstrapConfigurationProvider = {
			get: get
		};

		return BootstrapConfigurationProvider;
	});

	define("sap/ui/base/config/URLConfigurationProvider", [
		"sap/base/strings/_camelize"
	], function(camelize) {
		var oConfig = Object.create(null);

		if (globalThis.location) {
			oConfig = Object.create(null);
			var mOriginalUrlParams = {};
			var sLocation = globalThis.location.search;
			var urlParams = new URLSearchParams(sLocation);
			urlParams.forEach(function(value, key) {
				const bSapParam = /sap\-?([Uu]?i\-?)?/.test(key);
				var sNormalizedKey = camelize(key);
				if (sNormalizedKey) {
					if (Object.hasOwn(oConfig, sNormalizedKey)) {
						ui5loader._.logger.error("Configuration option '" + key + "' was already set by '" + mOriginalUrlParams[sNormalizedKey] + "' and will be ignored!");
					} else {
						oConfig[sNormalizedKey] = value;
						mOriginalUrlParams[sNormalizedKey] = key;
					}
				} else if (bSapParam) {
					ui5loader._.logger.error("Invalid configuration option '" + key + "' in url!");
				}
			});
			mOriginalUrlParams = undefined;
		}

		function get(sKey) {
			return oConfig[sKey];
		}

		var URLConfigurationProvider = {
			external: true,
			get: get
		};

		return URLConfigurationProvider;
	});

	define("sap/ui/base/config/MetaConfigurationProvider", [
		"sap/base/strings/_camelize"
	], function (camelize) {
		var oConfig = Object.create(null);

		if (globalThis.document) {
			oConfig = Object.create(null);
			var mOriginalTagNames = {};
			var allMetaTags = globalThis.document.querySelectorAll("meta");
			allMetaTags.forEach(function(tag) {
				var sNormalizedKey = camelize(tag.name);
				const bSapParam = /sap\-?([Uu]?i\-?)?/.test(tag.name);
				if (sNormalizedKey) {
					if (Object.hasOwn(oConfig, sNormalizedKey)) {
						ui5loader._.logger.error("Configuration option '" + tag.name + "' was already set by '" + mOriginalTagNames[sNormalizedKey] + "' and will be ignored!");
					} else {
						oConfig[sNormalizedKey] = tag.content;
						mOriginalTagNames[sNormalizedKey] = tag.name;
					}
				} else if (tag.name && bSapParam) { // tags without explicit name (tag.name === "") are ignored silently
					ui5loader._.logger.error("Invalid configuration option '" + tag.name + "' in meta tag!");
				}
			});
			mOriginalTagNames = undefined;
		}

		function get(sKey) {
			return oConfig[sKey];
		}

		var MetaConfigurationProvider = {
			get: get
		};

		return MetaConfigurationProvider;
	});

	define("sap/base/config/_Configuration", [
		"sap/base/config/GlobalConfigurationProvider"
	], function _Configuration(GlobalConfigurationProvider) {
		var rValidKey = /^[a-z][A-Za-z0-9]*$/;
		var rXXAlias = /^(sapUi(?!Xx))(.*)$/;
		var mCache = Object.create(null);
		var aProvider = [GlobalConfigurationProvider];
		var mUrlParamOptions = {
			name: "sapUiIgnoreUrlParams",
			type: "boolean"
		};
		var mInternalDefaultValues = {
			"boolean": false,
			"code": undefined,
			"integer": 0,
			"string": "",
			"string[]": [],
			"function[]": [],
			"function": undefined,
			"object": {},
			"mergedObject": {}
		};

		/**
		 * Enum for available types of configuration entries.
		 *
		 * @enum {string}
		 * @alias module:sap/base/config.Type
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		var TypeEnum = {
			/**
			 * defaultValue: false
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"Boolean": "boolean",

			/**
			 * defaultValue: 0
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"Integer": "integer",

			/**
			 * defaultValue: ""
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"String": "string",

			/**
			 * defaultValue: []
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"StringArray": "string[]",

			/**
			 * defaultValue: []
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"FunctionArray": "function[]",

			/**
			 * defaultValue: undefined
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"Function": "function",

			/**
			 * defaultValue: {}
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"Object":  "object",

			/**
			 * defaultValue: {}
			 * @private
			 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
			 */
			"MergedObject":  "mergedObject"
		};

		var bGlobalIgnoreExternal = get(mUrlParamOptions);

		function deepClone(src) {
			if (src == null) {
				return src;
			} else if (Array.isArray(src)) {
				return cloneArray(src);
			} else if (typeof src === "object") {
				return cloneObject(src);
			} else {
				return src;
			}
		}

		function cloneArray(src) {
			var aClone = [];
			for (var i = 0; i < src.length; i++) {
				aClone.push(deepClone(src[i]));
			}

			return aClone;
		}

		function cloneObject(src) {
			var oClone = {};

			for (var key in src) {
				if (key === "__proto__") {
					continue;
				}
				oClone[key] = deepClone(src[key]);
			}

			return oClone;
		}

		/** Register a new Configuration provider
		 *
		 * @name module:sap/base/config.registerProvider
		 * @function
		 * @param {object} oProvider The provider instance
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		function registerProvider(oProvider) {
			if (aProvider.indexOf(oProvider) === -1) {
				aProvider.push(oProvider);
				invalidate();
				bGlobalIgnoreExternal = get(mUrlParamOptions);
			}
		}

		/**
		 * Converts a given value to the given type.
		 *
		 * @name module:sap/base/config.convertToType
		 * @function
		 * @param {any} vValue The value to be converted
		 * @param {string} vType The resulting type
		 * @param {string} [sName] The property name of the enumeration to check
		 * @returns {any} The converted value
		 * @throws {TypeError} Throws an TypeError if the given value could not be converted to the requested type
		 *
		 * @private
		 */
		function convertToType(vValue, vType, sName) {
			if (vValue === undefined || vValue === null) {
				return vValue;
			}

			if (typeof vType === "string") {
				switch (vType) {
				case TypeEnum.Boolean:
					if (typeof vValue === "string") {
						return vValue.toLowerCase() === "true" || vValue.toLowerCase() === "x";
					} else {
						vValue = !!vValue;
					}
					break;
				case TypeEnum.Integer:
					if (typeof vValue === "string") {
						vValue = parseInt(vValue);
					}
					if (typeof vValue !== 'number' && isNaN(vValue)) {
						throw new TypeError("unsupported value");
					}
					break;
				case TypeEnum.String:
					vValue = '' + vValue; // enforce string
					break;
				case TypeEnum.StringArray:
					if (Array.isArray(vValue)) {
						return vValue;
					} else if (typeof vValue === "string") {
						// enforce array
						vValue = vValue ? vValue.split(/[,;]/).map(function(s) {
							return s.trim();
						}) : [];
						return vValue;
					} else {
						throw new TypeError("unsupported value");
					}
				case TypeEnum.FunctionArray:
					vValue.forEach(function(fnFunction) {
						if ( typeof fnFunction !== "function" ) {
							throw new TypeError("Not a function: " + fnFunction);
						}
					});
					break;
				case TypeEnum.Function:
					if (typeof vValue !== "function") {
						throw new TypeError("unsupported value");
					}
					break;
				case TypeEnum.Object:
				case TypeEnum.MergedObject:
					if (typeof vValue === "string") {
						vValue = JSON.parse(vValue);
					}
					if (typeof vValue !== "object") {
						throw new TypeError("unsupported value");
					}
					break;
				default:
					throw new TypeError("unsupported type");
				}
			} else if (typeof vType === "object" && !Array.isArray(vType)) {
				vValue = checkEnum(vType, vValue, sName);
			} else if (typeof vType === "function") {
				vValue = vType(vValue);
			} else {
				throw new TypeError("unsupported type");
			}

			return vValue;
		}

		/**
		 * Checks if a value exists within an enumerable list.
		 *
		 * @name module:sap/base/config._.checkEnum
		 * @function
		 * @param {object} oEnum Enumeration object with values for validation
		 * @param {string} sValue Value to check against enumerable list
		 * @param {string} sPropertyName Name of the property which is checked
		 * @returns {string} Value passed to the function for check
		 * @throws {TypeError} If the value could not be found, an TypeError is thrown
		 *
		 * @private
		 */
		function checkEnum(oEnum, sValue, sPropertyName) {
			var aValidValues = [];
			for (var sKey in oEnum) {
				if (oEnum.hasOwnProperty(sKey)) {
					if (oEnum[sKey] === sValue) {
						return sValue;
					}
					aValidValues.push(oEnum[sKey]);
				}
			}
			throw new TypeError("Unsupported Enumeration value for " + sPropertyName + ", valid values are: " + aValidValues.join(", "));
		}

		/**
		 * Generic getter for configuration options that are not explicitly exposed via a dedicated own getter.
		 *
		 * @name module:sap/base/config.get
		 * @function
		 * @param {object} mOptions The options object that contains the following properties
		 * @param {string} mOptions.name Name of the configuration parameter. Must start with 'sapUi/sapUiXx' prefix followed by letters only. The name must be camel-case
		 * @param {module:sap/base/config.Type|object<string, string>|function} mOptions.type Type of the configuration parameter. This argument can be a <code>module:sap/base/config.Type</code>, object or function.
		 * @param {any} [mOptions.defaultValue=undefined] Default value of the configuration parameter corresponding to the given type or a function returning the default value.
		 * @param {boolean} [mOptions.external=false] Whether external (e.g. url-) parameters should be included or not
		 * @param {boolean} [mOptions.freeze=false] Freezes parameter and parameter can't be changed afterwards.
		 * @returns {any} Value of the configuration parameter
		 * @throws {TypeError} Throws an error if the given parameter name does not match the definition.
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		function get(mOptions) {
			if (typeof mOptions.name !== "string" || !rValidKey.test(mOptions.name)) {
				throw new TypeError(
					"Invalid configuration key '" + mOptions.name + "'!"
				);
			}
			var sCacheKey = mOptions.name;
			if (mOptions.provider) {
				sCacheKey += "-" + mOptions.provider.getId();
			}
			if (!(sCacheKey in mCache)) {
				mOptions = Object.assign({}, mOptions);
				var vValue;

				var bIgnoreExternal = bGlobalIgnoreExternal || !mOptions.external;
				var sName = mOptions.name;
				var vMatch = sName.match(rXXAlias);
				var vDefaultValue = mOptions.hasOwnProperty("defaultValue") ? mOptions.defaultValue : mInternalDefaultValues[mOptions.type];

				const aAllProvider = [...aProvider, ...(mOptions.provider ? [mOptions.provider] : [])];

				for (var i = aAllProvider.length - 1; i >= 0; i--) {
					if (!aAllProvider[i].external || !bIgnoreExternal) {
						const vProviderValue = convertToType(aAllProvider[i].get(sName, mOptions.freeze), mOptions.type, mOptions.name);
						if (vProviderValue !== undefined) {
							if (mOptions.type === TypeEnum.MergedObject) {
								vValue = Object.assign({}, vProviderValue, vValue);
							} else {
								vValue = vProviderValue;
								break;
							}
						}
					}
				}
				if (vValue === undefined && (vMatch && vMatch[1] === "sapUi")) {
					mOptions.name = vMatch[1] + "Xx" + vMatch[2];
					vValue = get(mOptions);
				}
				if (vValue === undefined) {
					if (typeof vDefaultValue === 'function') {
						vDefaultValue = vDefaultValue();
					}
					vValue = vDefaultValue;
				}
				mCache[sCacheKey] = vValue;
			}
			var vCachedValue = mCache[sCacheKey];
			if (typeof mOptions.type !== 'function' && (mOptions.type === TypeEnum.StringArray || mOptions.type === TypeEnum.Object || mOptions.type === TypeEnum.MergedObject)) {
				vCachedValue = deepClone(vCachedValue);
			}
			return vCachedValue;
		}

		function invalidate() {
			mCache = Object.create(null);
		}

		var Configuration = {
			get: get,
			registerProvider: registerProvider,
			Type: TypeEnum,
			_: {
				checkEnum: checkEnum,
				invalidate: invalidate
			}
		};

		//forward Configuration to Global provider to invalidate the cache when freezing
		GlobalConfigurationProvider.setConfiguration(Configuration);

		return Configuration;
	});

	globalThis.define = origDefine;

	function _setupConfiguration() {
		var BaseConfiguration = sap.ui.require('sap/base/config/_Configuration');
		//register config provider
		BaseConfiguration.registerProvider(sap.ui.require("sap/ui/core/config/BootstrapConfigurationProvider"));
		BaseConfiguration.registerProvider(sap.ui.require("sap/ui/base/config/MetaConfigurationProvider"));
		BaseConfiguration.registerProvider(sap.ui.require("sap/ui/base/config/URLConfigurationProvider"));
	}

	/** init configuration */
	_setupConfiguration();

	var BaseConfig = sap.ui.require("sap/base/config/_Configuration");

	/** autoconfig */
	var sBaseUrl, bNojQuery,
		aScripts, rBootScripts, i,
		sBootstrapUrl;

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

	function ensureSlash(path) {
		return path && path[path.length - 1] !== '/' ? path + '/' : path;
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
	var mResourceRoots = BaseConfig.get({
		name: "sapUiResourceRoots",
		type: BaseConfig.Type.MergedObject
	});
	if (typeof mResourceRoots[''] === 'string' ) {
		sBaseUrl = mResourceRoots[''];
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
		var bDebugBootstrap = BaseConfig.get({
			name: "sapBootstrapDebug",
			type: BaseConfig.Type.Boolean,
			external: true,
			freeze: true
		});
		if (bDebugBootstrap) {
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
		var vDebugInfo = BaseConfig.get({
			name: "sapUiDebug",
			type: BaseConfig.Type.String,
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
			// if debug sources should be used in general, restart with debug URL (if not disabled, e.g. by test runner)
			if ( vDebugInfo === true && !window["sap-ui-debug-no-reboot"] ) {
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
					amd:false
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

	const bFuture = BaseConfig.get({
		name: "sapUiXxFuture",
		type: BaseConfig.Type.Boolean,
		external: true,
		freeze: true
	});

	// Note: loader converts any NaN value to a default value
	ui5loader._.maxTaskDuration = BaseConfig.get({
		name: "sapUiXxMaxLoaderTaskDuration",
		type: BaseConfig.Type.Integer,
		defaultValue: undefined,
		external: true,
		freeze: true
	});

	// support legacy switch 'noLoaderConflict', but 'amdLoader' has higher precedence
	const bExposeAsAMDLoader = BaseConfig.get({
		name: "sapUiAmd",
		type: BaseConfig.Type.Boolean,
		defaultValue: !BaseConfig.get({
			name: "sapUiNoLoaderConflict",
			type: BaseConfig.Type.Boolean,
			defaultValue: true,
			external: true,
			freeze: true
		}),
		external: true,
		freeze: true
	});

	// calculate syncCallBehavior
	let syncCallBehavior = 0; // ignore
	let sNoSync = BaseConfig.get({ // call must be made to ensure freezing
		name: "sapUiXxNoSync",
		type: BaseConfig.Type.String,
		external: true,
		freeze: true
	});

	// sap-ui-xx-future enforces strict sync call behavior
	sNoSync = bFuture ? "x" : sNoSync;

	if (sNoSync === 'warn') {
		syncCallBehavior = 1;
	} else if (/^(true|x)$/i.test(sNoSync)) {
		syncCallBehavior = 2;
	}

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
				'esprima': 'sap/ui/documentation/sdk/thirdparty/esprima'
			}
		},

		reportSyncCalls: syncCallBehavior,

		shim: {
			'sap/ui/thirdparty/bignumber': {
				amd: true,
				exports: 'BigNumber'
			},
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
				exports: 'jQuery',
				deps: ['sap/ui/thirdparty/jquery-compat']
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-datepicker': {
				deps: ['sap/ui/thirdparty/jqueryui/jquery-ui-core'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-draggable': {
				deps: ['sap/ui/thirdparty/jqueryui/jquery-ui-mouse'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-droppable': {
				deps: ['sap/ui/thirdparty/jqueryui/jquery-ui-mouse', 'sap/ui/thirdparty/jqueryui/jquery-ui-draggable'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-effect': {
				deps: ['sap/ui/thirdparty/jquery'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-mouse': {
				deps: ['sap/ui/thirdparty/jqueryui/jquery-ui-core', 'sap/ui/thirdparty/jqueryui/jquery-ui-widget'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-position': {
				deps: ['sap/ui/thirdparty/jquery'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-resizable': {
				deps: ['sap/ui/thirdparty/jqueryui/jquery-ui-mouse'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-selectable': {
				deps: ['sap/ui/thirdparty/jqueryui/jquery-ui-mouse'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-sortable': {
				deps: ['sap/ui/thirdparty/jqueryui/jquery-ui-mouse'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jqueryui/jquery-ui-widget': {
				deps: ['sap/ui/thirdparty/jquery'],
				exports: 'jQuery'
			},
			'sap/ui/thirdparty/jquery-mobile-custom': {
				amd: true,
				deps: ['sap/ui/thirdparty/jquery', 'sap/ui/Device'],
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
			'sap/ui/thirdparty/qunit-2': {
				amd: false,
				exports: 'QUnit'
			},
			'sap/ui/thirdparty/punycode': {
				amd: true,
				exports: 'punycode'
			},
			'sap/ui/thirdparty/RequestRecorder': {
				amd: true,
				exports: 'RequestRecorder',
				deps: ['sap/ui/thirdparty/URI', 'sap/ui/thirdparty/sinon']
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
			'sap/ui/documentation/sdk/thirdparty/esprima': {
				amd: true,
				exports: 'esprima'
			},
			'sap/viz/libs/canvg': {
				deps: ['sap/viz/libs/rgbcolor']
			},
			'sap/viz/libs/rgbcolor': {
			},
			'sap/viz/libs/sap-viz': {
				deps: ['sap/viz/library', 'sap/ui/thirdparty/jquery', 'sap/ui/thirdparty/d3', 'sap/viz/libs/canvg']
			},
			'sap/viz/libs/sap-viz-info-charts': {
				deps: ['sap/viz/libs/sap-viz-info-framework']
			},
			'sap/viz/libs/sap-viz-info-framework': {
				deps: ['sap/ui/thirdparty/jquery', 'sap/ui/thirdparty/d3']
			},
			'sap/viz/ui5/container/libs/sap-viz-controls-vizcontainer': {
				deps: ['sap/viz/libs/sap-viz', 'sap/viz/ui5/container/libs/common/libs/rgbcolor/rgbcolor_static']
			},
			'sap/viz/ui5/controls/libs/sap-viz-vizframe/sap-viz-vizframe': {
				deps: ['sap/viz/libs/sap-viz-info-charts']
			},
			'sap/viz/ui5/controls/libs/sap-viz-vizservices/sap-viz-vizservices': {
				deps: ['sap/viz/libs/sap-viz-info-charts']
			},
			'sap/viz/resources/chart/templates/standard_fiori/template': {
				deps: ['sap/viz/libs/sap-viz-info-charts']
			}
		}
	});

	var defineModuleSync = ui5loader._.defineModuleSync;

	defineModuleSync('ui5loader.js', null);
	defineModuleSync('ui5loader-autoconfig.js', null);

	if (bNojQuery && typeof jQuery === 'function') {
		// when we're executed in the context of the sap-ui-core-noJQuery file,
		// we try to detect an existing jQuery / jQuery position plugin and register them as modules
		defineModuleSync('sap/ui/thirdparty/jquery.js', jQuery);
		if (jQuery.ui && jQuery.ui.position) {
			defineModuleSync('sap/ui/thirdparty/jqueryui/jquery-ui-position.js', jQuery);
		}
	}

	var sMainModule = BaseConfig.get({
		name: "sapUiMain",
		type: BaseConfig.Type.String,
		freeze: true
	});
	if ( sMainModule ) {
		sap.ui.require(sMainModule.trim().split(/\s*,\s*/));
	}
}());

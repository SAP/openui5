/*!
 * ${copyright}
 */

//Provides class sap.ui.core.Lib
sap.ui.define([
	'sap/base/assert',
	'sap/base/config',
	'sap/base/i18n/Localization',
	'sap/base/i18n/ResourceBundle',
	'sap/base/future',
	'sap/base/Log',
	'sap/base/util/deepExtend',
	"sap/base/util/isEmptyObject",
	"sap/base/util/isPlainObject",
	'sap/base/util/LoaderExtensions',
	'sap/base/util/Version',
	'sap/base/util/array/uniqueSort',
	'sap/ui/Global',
	/* sap.ui.lazyRequire */
	'sap/ui/VersionInfo',
	'sap/ui/base/DataType',
	'sap/ui/base/EventProvider',
	'sap/ui/base/Object',
	'sap/ui/core/_UrlResolver',
	"sap/ui/core/Supportability"
], function(
	assert,
	BaseConfig,
	Localization,
	ResourceBundle,
	future,
	Log,
	deepExtend,
	isEmptyObject,
	isPlainObject,
	LoaderExtensions,
	Version,
	uniqueSort,
	Global,
	VersionInfo,
	DataType,
	EventProvider,
	BaseObject,
	_UrlResolver,
	Supportability
) {
	"use strict";

	/**
	 * Save the library instances by their keys
	 */
	var mLibraries = {};


	/**
	 * Bookkeeping for the guessing of library names.
	 *
	 * Set of bundleUrls from which a library name has been derived or not, see #getLibraryNameForBundle
	 * If no library name can be derived, the result will also be tracked with 'false' as value.
	 *
	 * Example:
	 *   mGuessedLibraries = {
	 *     "my/simple/library/i18n/i18n.properties": "my.simple.library",
	 *     "no/library/i18n/i18n.properties": false
	 *   }
	 */
	var mGuessedLibraries = {};

	/**
	 * Set of libraries that provide a bundle info file (library-preload-lazy.js).
	 *
	 * The file will be loaded, when a lazy dependency to the library is encountered.
	 * @private
	 */
	var oLibraryWithBundleInfo = new Set([
		"sap.suite.ui.generic.template",
		"sap.ui.comp",
		"sap.ui.layout",
		"sap.ui.unified"
	]);

	/**
	 * Retrieves the module path.
	 * @param {string} sModuleName module name.
	 * @param {string} sSuffix is used untouched (dots are not replaced with slashes).
	 * @returns {string} module path.
	 */
	function getModulePath(sModuleName, sSuffix){
		return sap.ui.require.toUrl(sModuleName.replace(/\./g, "/") + sSuffix);
	}

	/**
	 * Register the given namespace prefix to the given URL
	 * @param {string} sModuleNamePrefix The namespace prefix
	 * @param {string} sUrlPrefix The URL prefix that will be registered for the given namespace
	 */
	function registerModulePath(sModuleNamePrefix, sUrlPrefix) {
		LoaderExtensions.registerResourcePath(sModuleNamePrefix.replace(/\./g, "/"), sUrlPrefix);
	}

	/**
	 * Configured type of preload file per library.
	 * The empty name represents the default for all libraries not explicitly listed.
	 *
	 * A type can be one of
	 * - 'none' (do not preload),
	 * - 'js' (preload JS file),
	 * - 'json' (preload a json file)
	 * or 'both (try js first, then 'json')
	 *
	 * @private
	 */
	var mLibraryPreloadFileTypes = {};

	// evaluate configuration for library preload file types
	BaseConfig.get({
		name: "sapUiXxLibraryPreloadFiles",
		type: BaseConfig.Type.StringArray,
		external: true
	}).forEach(function(v){
		var fields = String(v).trim().split(/\s*:\s*/),
			name = fields[0],
			fileType = fields[1];
		if ( fields.length === 1 ) {
			fileType = name;
			name = '';
		}
		if ( /^(?:none|js|json|both)$/.test(fileType) ) {
			mLibraryPreloadFileTypes[name] = fileType;
		}
	});

	/**
	 * Set of libraries which require CSS.
	 */
	var aAllLibrariesRequiringCss = [];

	var pThemeManager;

	/**
	 * Get the sap/ui/core/theming/ThemeManager on demand
	 *
	 * @param {boolean} [bClear=false] Whether to reset the ThemeManager
	 * @returns {Promise} The promise that resolves with the sap/ui/core/theming/ThemeManager class
	 */
	function _getThemeManager(bClear) {
		var ThemeManager = sap.ui.require("sap/ui/core/theming/ThemeManager");
		if (!pThemeManager) {
			if (!ThemeManager) {
				pThemeManager = new Promise(function (resolve, reject) {
					sap.ui.require(["sap/ui/core/theming/ThemeManager"], function (ThemeManager) {
						resolve(ThemeManager);
					}, reject);
				});
			} else {
				pThemeManager = Promise.resolve(ThemeManager);
			}
		}
		// This is only used within initLibrary to reset flag themeLoaded synchronously in case
		// a theme for a new library will be loaded
		if (ThemeManager && bClear) {
			ThemeManager.reset();
		}
		return pThemeManager;
	}

	/**
	 * This is an identifier to restrict the usage of constructor within this module
	 */
	var oConstructorKey = Symbol("sap.ui.core.Lib");

	var oPropDescriptor = {
		configurable: true,
		enumerable: true,
		writable: false
	};

	function createPropDescriptorWithValue(vValue) {
		oPropDescriptor.value = vValue;
		return oPropDescriptor;
	}


	/**
	 * Freezes the object and nested objects to avoid later manipulation
	 *
	 * @param {object} oObject the object to deep freeze
	 */
	function deepFreeze(oObject) {
		if (oObject && typeof oObject === 'object' && !Object.isFrozen(oObject)) {
			Object.freeze(oObject);
			for (var sKey in oObject) {
				if (Object.hasOwn(oObject, sKey)) {
					deepFreeze(oObject[sKey]);
				}
			}
		}
	}

	/**
	 * Returns the list of libraries for which the library.css was preloaded.
	 *
	 * This configuration setting specifies a list of UI libraries using the same syntax as the "libs" property,
	 * for which the SAPUI5 core does not include the library.css stylesheet in the head of the page.
	 * If the list starts with an exclamation mark (!), no stylesheet is loaded at all for the specified libs.
	 * In this case, it is assumed that the application takes care of loading CSS.
	 *
	 * If the first library's name is an asterisk (*), it will be expanded to the list of already
	 * configured libraries.
	 *
	 * @returns {string[]} the list of libraries for which the library.css was preloaded
	 * @private
	 */
	function getPreloadLibCss() {
		var aPreloadLibCSS = BaseConfig.get({name: "sapUiPreloadLibCss", type: BaseConfig.Type.StringArray, external: true});
		if ( aPreloadLibCSS.length > 0 ) {
			// remove leading '!' (legacy) as it does not make any difference
			if ( aPreloadLibCSS[0].startsWith("!") ) {
				aPreloadLibCSS[0] = aPreloadLibCSS[0].slice(1);
			}
			// "*"  means "add all bootstrap libraries"
			if ( aPreloadLibCSS[0] === "*" ) {
				aPreloadLibCSS.shift(); // remove * (inplace)

				// The modules list also contains all configured libs
				// we prepend them now to the preloaded libs css list
				Object.keys(mLibraries).forEach(function(sLib) {
					if (!aPreloadLibCSS.includes(sLib)) {
						aPreloadLibCSS.unshift(sLib);
					}
				});
			}
		}
		return aPreloadLibCSS;
	}

	/**
	 * @classdesc
	 * Constructor must not be used: To load a library, please use the static method {@link #.load}.
	 *
	 * This class also provides other static methods which are related to a library, such as {@link
	 * #.getResourceBundleFor} to retrieve the resource bundle of a library, {@link #.init} to provide information for a
	 * library and so on.
	 *
	 * @param {object} mSettings Info object for the library
	 * @param {string} mSettings.name Name of the library; when given it must match the name by which the library has been loaded
	 * @class
	 * @alias sap.ui.core.Lib
	 * @extends sap.ui.base.Object
	 * @since 1.118
	 * @hideconstructor
	 * @public
	 */
	var Library = BaseObject.extend("sap.ui.core.Lib", /** @lends sap.ui.core.Lib.prototype */ {
		constructor: function(mSettings) {
			BaseObject.call(this);

			assert(typeof mSettings === "object", "A settings object must be given to the constructor of sap/ui/core/Lib");
			assert(typeof mSettings.name === "string" && mSettings.name, "The settings object that is given to the constructor of sap/ui/core/Lib must contain a 'name' property which is a non-empty string");

			if (mSettings._key !== oConstructorKey) {
				throw new Error("The constructor of sap/ui/core/Lib is restricted to the internal usage. To get an instance of Library with name '" + mSettings.name + "', use the static method 'get' from sap/ui/core/Lib instead.");
			}

			this.name = mSettings.name;

			var aPropsWithDefaults = ["dependencies", "types", "interfaces", "controls", "elements"];

			// provide default values
			aPropsWithDefaults.forEach(function(sPropName) {
				Object.defineProperty(this, sPropName, createPropDescriptorWithValue([]));
			}.bind(this));

			/**
			 * Resource bundles that are cached by their locales as key
			 */
			Object.defineProperty(this, "_resourceBundles", {
				value: {},
				writable: true
			});
			/**
			 * The '_loadingStatus' property may contain the following attributes
			 *  * {boolean} pending
			 *  * {boolean} async
			 *  * {Promise} promise
			 */
			Object.defineProperty(this, "_loadingStatus", {
				value: null,
				writable: true
			});
			Object.defineProperty(this, "_settingsEnhanced", {
				value: false,
				writable: true
			});
			Object.defineProperty(this, "_manifestFailed", {
				value: false,
				writable: true
			});
		},

		/**
		 * Override the function to avoid creating facade for this instance to expose the settings properties that are
		 * given through {@link #enhanceSettings}.
		 *
		 * @return {this} The Lib instance itself
		 * @override
		 */
		getInterface: function() {
			return this;
		},

		/**
		 * Indicates whether the {@link sap.ui.core.Lib#enhanceSettings} is called
		 *
		 * @returns {boolean} Whether a library's setting is enhanced with additional metadata
		 * @private
		 */
		isSettingsEnhanced: function() {
			return this._settingsEnhanced;
		},

		/**
		 * Enhances a library's setting information.
		 *
		 * When the <code>mSettings</code> has been processed, a normalized version of it will be kept and set on the
		 * library instance.
		 *
		 * @param {object} mSettings Info object for the library
		 * @param {string} mSettings.version Version of the library
		 * @param {string[]} [mSettings.dependencies=[]] List of libraries that this library depends on; names are in
		 *  dot notation (e.g. "sap.ui.core")
		 * @param {string[]} [mSettings.types=[]] List of names of types that this library provides; names are in dot
		 *  notation (e.g. "sap.ui.core.CSSSize")
		 * @param {string[]} [mSettings.interfaces=[]] List of names of interface types that this library provides;
		 *  names are in dot notation (e.g. "sap.ui.core.PopupInterface")
		 * @param {string[]} [mSettings.controls=[]] Names of control types that this library provides; names are in dot
		 *  notation (e.g. "sap.ui.core.ComponentContainer")
		 * @param {string[]} [mSettings.elements=[]] Names of element types that this library provides (excluding
		 *  controls); names are in dot notation (e.g. "sap.ui.core.Item")
		 * @param {boolean} [mSettings.noLibraryCSS=false] Indicates whether the library doesn't provide/use theming.
		 *  When set to true, no library.css will be loaded for this library
		 * @param {Object<string,any>} [mSettings.extensions] A map of potential extensions of the library metadata; structure not defined by
		 *  the UI5 core framework. Keys should be qualified names derived from the namespace of the code that introduces the feature, e.g.
		 *  <code>""sap.ui.support"</code> is used for the support rule metadata of a library.
		 * @returns {sap.ui.core.Lib} The library instance
		 * @private
		 */
		enhanceSettings: function(mSettings) {
			if (this._settingsEnhanced) {
				return this;
			}

			this._settingsEnhanced = true;

			var sKey, vValue, vValueToSet;

			for (sKey in mSettings) {
				vValue = mSettings[sKey];
				vValueToSet = undefined;

				// don't copy undefined values
				if ( vValue !== undefined ) {
					if ( Array.isArray(this[sKey]) ) {
						// concat array typed values
						if (this[sKey].length === 0) {
							vValueToSet = vValue;
						} else {
							vValueToSet = uniqueSort(this[sKey].concat(vValue));
						}
					} else if ( this[sKey] === undefined ) {
						// only set values for properties that are still undefined
						vValueToSet = vValue;
					} else if ( sKey != "name" ) {
						// ignore other values (silently ignore "name")
						future.warningThrows("library info setting ignored: " + sKey + "=" + vValue);
					}

					if (vValueToSet !== undefined) {
						// freeze settings value
						Object.defineProperty(this, sKey, createPropDescriptorWithValue(vValueToSet));
					}
				}
			}

			return this;
		},

		/**
				 * Returns the file type (either js, json, none, or both) that should be used for preloading this library
				 * instance.
				 *
				 * When <code>bJSON</code> is set to <code>true</code>, type "json" is returned directly. When
				 * <code>bJSON</code> is set to <code>false</code>, type "js" is returned. Otherwise it takes the configured
				 * file type into consideration. In case of conflict between the given <code>bJSON</code> and the configured
				 * file type, type "none" is returned.
				 *
				 * @returns {string} The determined file type. It can be "js", "json", "none", or "both".
				 * @private
				 */
		_getFileType: function() {
			var sFileType;
			var sConfiguredFileType = mLibraryPreloadFileTypes[this.name] || mLibraryPreloadFileTypes[''] || 'both';

			sFileType = 'js';

			if (sConfiguredFileType !== 'both' && sFileType !== 'both' &&  sConfiguredFileType !== sFileType ) {
				// if the configured and the supported file type are not equal and the library doesn't support 'both',
				// then there is no compromise -> 'none'
				sFileType = 'none';
			}

			return sFileType;
		},

		/**
		 * Loads the library-preload bundle and the resource bundle for a library and apply the same for its
		 * dependencies.
		 *
		 * When the optional parameter <code>mOptions.url</code> is given, its value will be registered for the
		 * namespace of the library and all resources will be loaded from that location.
		 *
		 * When the library has been loaded already, or its entry module (library.js) is already loaded or preloaded, no
		 * further action will be taken, especially, a given <code>mOptions.url</code> will not be registered. A promise
		 * will be returned which resolves immediately.
		 *
		 * @param {object} [mOptions] The options object that contains the following properties
		 * @param {string} [mOptions.url] URL to load the library from
		 * @param {boolean} [mOptions.lazy] Whether the library-preload-lazy bundle should be loaded instead of the
		 *  library-preload bundle
		 * @returns {Promise<sap.ui.core.Lib>} A promise that resolves with the library instance
		 * @private
		 */
		preload: function(mOptions) {
			if (mOptions && (mOptions.hasOwnProperty("async") || mOptions.hasOwnProperty("sync"))) {
				future.errorThrows("The 'preload' function of class sap/ui/core/Lib only supports preloading a library asynchronously.", { suffix: "The given 'async' or 'sync' setting is ignored."});
			}
			if (mOptions && mOptions.hasOwnProperty("json")) {
				future.errorThrows("The 'preload' function of class sap/ui/core/Lib only supports preloading in JS Format.", { suffix: "The given 'json' setting is ignored."});
			}

			return this._preload(["url", "lazy"].reduce(function(acc, sProperty) {
				if (mOptions && mOptions.hasOwnProperty(sProperty)) {
					acc[sProperty] = mOptions[sProperty];
				}
				return acc;
			}, {}));
		},

		/**
				 * Internal function for preloading a library which still supports the legacy parameters:
				 *
				 * <ul>
				 * <li><code>mOptions.sync</code>: load the preload file in sync mode</li>
				 * <li><code>mOptions.json</code>: load the preload file in "json" format</li>
				 * </ul>
				 *
				 * @param [mOptions] The options object that contains the following properties
				 * @param [mOptions.url] URL to load the library from
				 * @param [mOptions.lazy] Whether the library-preload-lazy bundle should be loaded instead of the
				 *  library-preload bundle
				 * @returns {Promise<Lib>|Lib} A promise that resolves with the library instance in async mode and the library
				 *  instance itself in sync mode
				 * @private
				 */
		_preload: function(mOptions) {
			mOptions = mOptions || {};

			var sFileType = this._getFileType(false),
				sLibPackage = this.name.replace(/\./g, '/'),
				bEntryModuleExists = !!sap.ui.loader._.getModuleState(sLibPackage + '/library.js'),
				bHttp2 = Library.isDepCacheEnabled();

			if (sFileType === 'none') {
				return Promise.resolve(this);
			}

			if (this._loadingStatus == null && mOptions.url) {
				registerModulePath(this.name, mOptions.url);
			}

			this._loadingStatus = this._loadingStatus || {};

			if (this._loadingStatus.pending) {
				if (this._loadingStatus.preloadFinished) { // async
					// When it's already in progress for loading a library and loading its own preload file (either JS,
					// JSON or doesn't need to load the preload at all) is finished, a dependency cycle between
					// libraries is detected. A resolved promise is returned instead of this._loadingStatus.promise to
					// avoid the deadlock between the libraries which have dependency of each other
					return Promise.resolve(this);
				}
			}

			if (this._loadingStatus.promise) {
				// in the sync case, we can do a immediate return only when the library is fully loaded.
				return this._loadingStatus.promise;
			}

			if (mOptions.lazy) {
				// For selected lazy dependencies, we load a library-preload-lazy module.
				// Errors are ignored and the library is not marked as pending in the bookkeeping
				// (but the loader avoids double loading).
				Log.debug("Lazy dependency to '" + this.name + "' encountered, loading library-preload-lazy.js");

				return sap.ui.loader._.loadJSResourceAsync(
					sLibPackage + '/library-preload-lazy.js', /* ignoreErrors = */ true);
			}

			// otherwise mark as pending
			this._loadingStatus.pending = true;
			this._loadingStatus.async = true;

			var pPreload;
			if (bEntryModuleExists) {
				pPreload = (Promise).resolve();
			} else {
				// first preload code, resolves with list of dependencies (or undefined)
				pPreload = sFileType !== 'json' ?
					/* 'js' or 'both', not forced to JSON */
					this._preloadJSFormat({
						fallbackToJSON: sFileType !== "js",
						http2: bHttp2,
						sync: false
					})
					: this._preloadJSONFormat({sync: false});
			}

			// load dependencies, if there are any
			this._loadingStatus.promise = pPreload.then(function(aDependencies) {
				// resolve dependencies via manifest "this._getDependencies()" except for libary-preload.json
				aDependencies = aDependencies || this._getDependencies();

				this._loadingStatus.preloadFinished = true;

				var oManifest = this.getManifest(),
					aPromises;

				if (aDependencies && aDependencies.length) {
					var aEagerDependencies = [],
						aLazyDependencies = [];

					aDependencies.forEach(function(oDependency) {
						if (oDependency.lazy) {
							aLazyDependencies.push(oDependency);
						} else {
							aEagerDependencies.push(oDependency.name);
						}
					});
					// aEagerDependencies contains string elements before executing the next line

					aEagerDependencies = VersionInfo._getTransitiveDependencyForLibraries(aEagerDependencies)
						.map(function(sDependencyName) {
							return {
								name: sDependencyName
							};
						});
					// aEagerDependencies contains object elements after executing the above line

					// combine transitive closure of eager dependencies and direct lazy dependencies,
					// the latter might be redundant
					aDependencies = aEagerDependencies.concat(aLazyDependencies);

					aPromises = aDependencies.map(function(oDependency) {
						var oLibrary = Library._get(oDependency.name, true/* bCreate */);
						return oLibrary._preload({
							lazy: oDependency.lazy
						});
					});
				} else {
					aPromises = [];
				}

				if (oManifest && Version(oManifest._version).compareTo("1.9.0") >= 0) {
					aPromises.push(this.loadResourceBundle());
				}

				var pFinish = Promise.all(aPromises);
				return pFinish.then(function() {
					this._loadingStatus.pending = false;
					return this;
				}.bind(this));

			}.bind(this));

			return this._loadingStatus.promise;
		},

		/**
				 * Loads the library's preload bundle in JS format. In case the resource "library-preload.js" doesn't exist and
				 * <code>mOptions.fallbackToJSON</code> is set to <code>true</code>, the library's preload in JSON format will
				 * be loaded.
				 *
				 * @param {object} [mOptions] The options object that contains the following properties
				 * @param {boolean} [mOptions.fallbackToJSON] Whether to load the preload in JSON format when loading the JS
				 *  format fails
				 * @param {boolean} [mOptions.http2] Whether to load the "library-h2-preload" bundle instead of the
				 * "library-preload" bundle
				 * @returns {Promise|object} A promise that resolves with the dependency information of the library in async
				 *  mode or the dependency information directly in sync mode
				 * @private
				 */
		_preloadJSFormat: function(mOptions) {
			mOptions = mOptions || {};

			var that = this;
			var sPreloadModule = this.name.replace(/\./g, '/')
				+ (mOptions.http2 ? '/library-h2-preload' : '/library-preload')
				+ ('.js');
			var pResult;

			pResult = sap.ui.loader._.loadJSResourceAsync(sPreloadModule);

			return pResult.catch(function(e) {
				if (mOptions.fallbackToJSON) {
					var bFallback;
					// loading library-preload.js failed, might be an old style lib with a library-preload.json only.
					// with mOptions.fallbackToJSON === false, this fallback can be suppressed
					bFallback = true;

					if (bFallback) {
						Log.error("failed to load '" + sPreloadModule + "' (" + (e && e.message || e) + "), falling back to library-preload.json");
						return that._preloadJSONFormat({sync: false});
					}
					// ignore other errors
				}
			});
		},

		/**
		 * Returns the library's manifest when it's available.
		 *
		 * Only when the library's manifest is preloaded with the library's preload bundle, the manifest will be
		 * returned from this function. This function never triggers a separate request to load the library's manifest.
		 *
		 * @param {boolean} [bSync=false] whether to use sync request to load the library manifest when it doesn't exist
		 *  in preload cache
		 * @returns {object|undefined} The manifest of the library
		 * @private
		 */
		getManifest: function(bSync) {
			if (!this.oManifest) {
				var manifestModule = this.name.replace(/\./g, '/') + '/manifest.json';

				if (sap.ui.loader._.getModuleState(manifestModule) || (bSync && !this._manifestFailed)) {
					try {
						this.oManifest = LoaderExtensions.loadResource(manifestModule, {
							dataType: 'json',
							async: false,
							failOnError: !this.isSettingsEnhanced()
						});

						if (this._oManifest) {
							deepFreeze(this.oManifest);
						} else {
							this._manifestFailed = true;
						}
					} catch (e) {
						this._manifestFailed = true;
					}

				}
			}

			return this.oManifest;
		},

		/**
		 * Returns the dependency information of the library which is read from the library's manifest.
		 *
		 * The returned array contains elements which have a property "name" and an optional "lazy" property.
		 *
		 * @private
		 * @returns {Array<{name:string, lazy:boolean}>} The dependency information of the library
		 */
		_getDependencies: function() {
			var oManifest = this.getManifest();
			var aDependencies = [];

			var mDependencies = oManifest && oManifest["sap.ui5"] && oManifest["sap.ui5"].dependencies && oManifest["sap.ui5"].dependencies.libs;
			if (mDependencies) {
				// convert manifest map to array, inject object which contains "name" and optional "lazy" properties
				return Object.keys(mDependencies).reduce(function(aResult, sDependencyName) {
					if (!mDependencies[sDependencyName].lazy) {
						aResult.push({
							name: sDependencyName
						});
					} else if (oLibraryWithBundleInfo.has(sDependencyName)) {
						aResult.push({
							name: sDependencyName,
							lazy: true
						});
					}
					return aResult;
				}, aDependencies);
			} else {
				return aDependencies;
			}
		},

		/**
		 * Returns the i18n information of the library which is read from the library's manifest.
		 *
		 * @private
		 * @returns {object|undefined} The i18n information of the library
		 */
		_getI18nSettings: function() {
			var oManifest = this.getManifest(),
				vI18n;

			if ( oManifest && Version(oManifest._version).compareTo("1.9.0") >= 0 ) {
				vI18n = oManifest["sap.ui5"] && oManifest["sap.ui5"].library && oManifest["sap.ui5"].library.i18n;
			} // else vI18n = undefined

			vI18n = this._normalizeI18nSettings(vI18n);

			return vI18n;
		},

		/**
		 * Provides the default values for the library's i18n information
		 *
		 * @param {boolean|string|object} vI18n bundle information. Can be:
		 * <ul>
		 *     <li>false - library has no resource bundle</li>
		 *     <li>true|null|undefined - use default settings: bundle is 'messageBundle.properties',
		 *       fallback and supported locales are not defined (defaulted by ResourceBundle)</li>
		 *     <li>typeof string - string is the url of the bundle,
		 *       fallback and supported locales are not defined (defaulted by ResourceBundle)</li>
		 *     <li>typeof object - object can contain bundleUrl, supportedLocales, fallbackLocale</li>
		 * </ul>
		 *
		 * @private
		 * @returns {object} normalized i18N information
		 */
		_normalizeI18nSettings: function(vI18n) {
			if ( vI18n == null || vI18n === true ) {
				vI18n = {
					bundleUrl: "messagebundle.properties"
				};
			} else if ( typeof vI18n === "string" ) {
				vI18n = {
					bundleUrl: vI18n
				};
			} else if (typeof vI18n === "object") {
				vI18n = deepExtend({}, vI18n);
			}

			return vI18n;
		},

		/**
		 * Returns a resource bundle for the given locale.
		 *
		 * The locale's default value is read from {@link module:sap/base/i18n/Localization.getLanguage session locale}.
		 *
		 * This method returns the resource bundle directly. When the resource bundle for the given locale isn't loaded
		 * yet, synchronous request will be used to load the resource bundle. If it should be loaded asynchronously, use
		 * {@link #loadResourceBundle}.
		 *
		 * The {@link #preload} method will evaluate the same descriptor entry as described above. If it is not
		 * <code>false</code>, loading the main resource bundle of the library will become a subtask of the
		 * asynchronous preloading.
		 *
		 * Due to this preload of the main bundle and the caching behavior of this method, controls in such a library
		 * still can use this method in their API, behavior and rendering code without causing a synchronous request to
		 * be sent. Only when the bundle is needed at module execution time (by top level code in a control module),
		 * then the asynchronous loading of resource bundle with {@link #loadResourceBundle} should be preferred.
		 *
		 * @param {string} [sLocale] Locale to retrieve the resource bundle for
		 * @returns {module:sap/base/i18n/ResourceBundle} The best matching
		 *  resource bundle for the given locale or <code>undefined</code> when resource bundle isn't available
		 * @private
		 */
		getResourceBundle: function(sLocale) {
			return this._loadResourceBundle(sLocale, true /* bSync */);
		},

		/**
		 * Retrieves a resource bundle for the given locale.
		 *
		 * The locale's default value is read from {@link module:sap/base/i18n/Localization.getLanguage session locale}.
		 *
		 * <h3>Configuration via App Descriptor</h3>
		 * When the App Descriptor for the library is available without further request (manifest.json
		 * has been preloaded) and when the App Descriptor is at least of version 1.9.0 or higher, then
		 * this method will evaluate the App Descriptor entry <code>"sap.ui5" / "library" / "i18n"</code>.
		 * <ul>
		 * <li>When the entry is <code>true</code>, a bundle with the default name "messagebundle.properties"
		 * will be loaded</li>
		 * <li>If it is a string, then that string will be used as name of the bundle</li>
		 * <li>If it is <code>false</code>, no bundle will be loaded and the result will be
		 *     <code>undefined</code></li>
		 * </ul>
		 *
		 * <h3>Caching</h3>
		 * Once a resource bundle for a library has been loaded, it will be cached.
		 * Further calls for the same library and locale won't create new requests, but return the already
		 * loaded bundle. There's therefore no need for control code to cache the returned bundle for a longer
		 * period of time. Not further caching the result also prevents stale texts after a locale change.
		 *
		 * @param {string} [sLocale] Locale to retrieve the resource bundle for
		 * @returns {Promise<module:sap/base/i18n/ResourceBundle>} Promise that resolves with the best matching
		 *  resource bundle for the given locale
		 * @private
		 */
		loadResourceBundle: function(sLocale) {
			return this._loadResourceBundle(sLocale);
		},

		/**
		 * Internal method that either returns the resource bundle directly when <code>bSync</code> is set to
		 * <code>true</code> or a Promise that resolves with the resource bundle in the asynchronous case.
		 *
		 * @param {string} [sLocale] Locale to retrieve the resource bundle for
		 * @param {string} [bSync=false] Whether to load the resource bundle synchronously
		 * @returns {module:sap/base/i18n/ResourceBundle|Promise<module:sap/base/i18n/ResourceBundle>} The resource
		 * bundle in synchronous case, otherwise a promise that resolves with the resource bundle
		 * @private
		 */
		_loadResourceBundle: function(sLocale, bSync) {
			var that = this,
				oManifest = this.getManifest(bSync),
				// A library ResourceBundle can be requested before its owning library is preloaded.
				// In this case we do not have the library's manifest yet and the default bundle (messagebundle.properties) is requested.
				// We still cache this default bundle for as long as the library remains "not-preloaded".
				// When the library is preloaded later on, a new ResourceBundle needs to be requested, since we need to take the
				// "sap.ui5/library/i18n" section of the library's manifest into account.
				bLibraryManifestIsAvailable = !!oManifest,
				vResult,
				vI18n,
				sNotLoadedCacheKey,
				sKey;

			assert(sLocale === undefined || typeof sLocale === "string", "sLocale must be a string or omitted");
			sLocale = sLocale || Localization.getLanguage();
			sNotLoadedCacheKey = sLocale + "/manifest-not-available";

			// If the library was loaded in the meantime (or the first time around), we can delete the old ResourceBundle
			if (bLibraryManifestIsAvailable) {
				sKey = sLocale;
				delete this._resourceBundles[sNotLoadedCacheKey];
			} else {
				// otherwise we use the temporary cache-key
				sKey = sNotLoadedCacheKey;
			}

			vResult = this._resourceBundles[sKey];
			if (!vResult || (bSync && vResult instanceof Promise)) {

				vI18n = this._getI18nSettings();

				if (vI18n) {
					var sBundleUrl = getModulePath(this.name + "/", vI18n.bundleUrl);

					// add known library name to cache to avoid later guessing
					mGuessedLibraries[sBundleUrl] = this;

					vResult = ResourceBundle.create({
						bundleUrl: sBundleUrl,
						supportedLocales: vI18n.supportedLocales,
						fallbackLocale: vI18n.fallbackLocale,
						locale: sLocale,
						async: !bSync,
						activeTerminologies: Localization.getActiveTerminologies()
					});

					if (vResult instanceof Promise) {
						vResult = vResult.then(function(oBundle) {
							that._resourceBundles[sKey] = oBundle;
							return oBundle;
						});
					}

					// Save the result directly under the map
					// the real bundle will replace the promise after it's loaded in async case
					this._resourceBundles[sKey] = vResult;
				}
			}

			// if the bundle is loaded, return a promise which resolved with the bundle
			return bSync ? vResult : Promise.resolve(vResult);
		}
	});


	/**
	 * Returns an array containing all libraries which require loading of CSS
	 *
	 * @returns {Array} Array containing all libraries which require loading of CSS
	 * @private
	 * @ui5-restricted sap.ui.core.theming.Parameters
	 */
	Library.getAllInstancesRequiringCss = function() {
		return aAllLibrariesRequiringCss.slice();
	};

	/**
	 * Checks whether the library for the given <code>sName</code> has been loaded or not.
	 *
	 * @param {string} sName The name of the library
	 * @returns {boolean} Returns <code>true</code> if the library is loaded. Otherwise <code>false</code>.
	 * @public
	 */
	Library.isLoaded = function(sName) {
		return mLibraries[sName] ? true : false;
	};

	/**
	 * Internal method for fetching library instance from the library cache by using the given <code>sName</code>.
	 *
	 * When the <code>bCreate</code> is set to <code>true</code>, a new instance for the library is created in case
	 * there was no such library instance before. Otherwise, the library instance from the cache or
	 * <code>undefined</code> is returned.
	 *
	 * @param {string} sName The name of the library
	 * @param {boolean} bCreate Whether to create an instance for the library when there's no instance saved in the
	 *  cache under the given <code>sName</code>
	 * @returns {Promise<sap.ui.core.Lib>|undefined} Either an instance of the library or <code>undefined</code>
	 * @private
	 */
	Library._get = function(sName, bCreate) {
		var oLibrary = mLibraries[sName];

		if (!oLibrary && bCreate) {
			mLibraries[sName] = oLibrary = new Library({
				name: sName,
				_key: oConstructorKey
			});
		}

		return oLibrary;
	};

	/**
	 * Tries to derive a library from a bundle URL by guessing the resource name first,
	 * then trying to match with the (known) loaded libraries.
	 *
	 * @param {string} sBundleUrl The bundleURL from which the library name needs to be derived.
	 * @returns {sap.ui.core.Lib|undefined} Returns the corresponding library if found or 'undefined'.
	 * @private
	 */
	Library._getByBundleUrl = function(sBundleUrl) {
		if (sBundleUrl) {
			if (mGuessedLibraries[sBundleUrl]) {
				return mGuessedLibraries[sBundleUrl];
			}

			// [1] Guess ResourceName
			var sBundleName = sap.ui.loader._.guessResourceName(sBundleUrl);
			if (sBundleName) {

				// [2] Guess library name
				for (var sLibrary in mLibraries) {
					if (!mLibraries[sLibrary].isSettingsEnhanced()) {
						// ignore libraries that haven't been initialized
						continue;
					}
					var sLibraryName = sLibrary.replace(/\./g, "/");
					var oLib = mLibraries[sLibrary];
					if (sLibraryName !== "" && sBundleName.startsWith(sLibraryName + "/")) {
						var sBundlePath = sBundleName.replace(sLibraryName + "/", "");

						// [3] Retrieve i18n from manifest for looking up the base bundle
						//     (can be undefined if the lib defines "sap.ui5/library/i18n" with <false>)
						var vI18n = oLib._getI18nSettings();

						if (vI18n) {
							// Resolve bundle paths relative to library before comparing
							var sManifestBaseBundlePath = getModulePath(sLibraryName, "/" + vI18n.bundleUrl);
								sBundlePath = getModulePath(sLibraryName, "/" + sBundlePath);

							// the input bundle-path and the derived library bundle-path must match,
							// otherwise we would enhance the wrong bundle with terminologies etc.
							if (sBundlePath === sManifestBaseBundlePath) {
								// [4.1] Cache matching result
								mGuessedLibraries[sBundleUrl] = oLib;
								return oLib;
							}
							// [4.2] Cache none-matching result
							mGuessedLibraries[sBundleUrl] = false;
						}
					}
				}
			}
		}
	};

	/**
	 * Returns a map that contains the libraries that are already initialized (by calling {@link #.init}). Each library
	 * instance is saved in the map under its name as key.
	 *
	 * @returns {object} A map that contains the initialized libraries. Each library is saved in the map under its name
	 *  as key.
	 * @private
	 * @ui5-restricted sap.ui.core, sap.ui.support, sap.ui.fl, sap.ui.dt
	 */
	Library.all = function() {
		// return only libraries that are initialized (settings enhanced)
		return Library._all(false /* bIgnoreSettingsEnhanced */);
	};

	/**
	 * Returns a map that contains the libraries that are already initialized (by calling {@link #.init}). Each library
	 * instance is saved in the map under its name as key.
	 *
	 * @param {boolean} [bIgnoreSettingsEnhanced=false] All libraries are returned when it's set to true. Otherwise only
	 *  the libraries with their settings enhanced are returned.
	 * @returns {object} A map of libraries. Each library is saved in the map under its name as key.
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	Library._all = function(bIgnoreSettingsEnhanced) {
		var mInitLibraries = {};

		Object.keys(mLibraries).forEach(function(sKey) {
			if (bIgnoreSettingsEnhanced || mLibraries[sKey].isSettingsEnhanced()) {
				mInitLibraries[sKey] = mLibraries[sKey];
			}
		});

		return mInitLibraries;
	};

	/*
	 * A symbol used to mark a Proxy as such
	 * Proxys are indistinguishable from the outside, but we need a way
	 * to prevent duplicate Proxy wrapping for library namespaces.
	 */
	const symIsProxy = Symbol("isProxy");

	/**
	 * Creates a Proxy handler object for the a library namespace.
	 * Additionally creates a WeakMap for storing sub-namespace segments.
	 * @param {string} sLibName the library name in dot-notation
	 * @param {object} oLibNamespace the top-level library namespace object
	 * @returns {object} an object containing the proxy-handler and the sub-namespace map
	 */
	function createProxyForLibraryNamespace(sLibName, oLibNamespace) {
		// weakmap to track sub-namespaces for a library
		// key: the sub-namespace objects, value: the accumulated namespace segments as string[]
		// initial entry (the first 'target') is the library namespace object itself
		const mSubNamespaces = new WeakMap();
		mSubNamespaces.set(oLibNamespace, `${sLibName}.`);

		// Proxy facade for library namespace/info-object
		// will be filled successively by the library after Library.init()
		const oLibProxyHandler = {

			set(target, prop, value) {
				// only analyze plain-objects: literals and (Constructor) functions, etc. must not have a proxy
				// note: we explicitly must exclude Proxies here, since they are recognized as plain and empty
				if ( isPlainObject(value) && !value[symIsProxy]) {
					//Check Objects if they only contain static values
					// assumption: a non-empty plain-object with only static content is an enum
					const valueIsEmpty = isEmptyObject(value);

					let registerProxy = valueIsEmpty;

					if (!valueIsEmpty) {
						if (DataType._isEnumCandidate(value)) {
							// general namespace assignment
							target[prop] = value;

							// join library sub-paths when registering an enum type
							// note: namespace already contains a trailing dot '.'
							const sNamespacePrefix = mSubNamespaces.get(target);
							DataType.registerEnum(`${sNamespacePrefix}${prop}`, value);

							Log.debug(`[Library API-Version 2] If you intend to use API-Version 2 in your library, make sure to call 'sap/ui/base/DataType.registerEnum' for ${sNamespacePrefix}${prop}.`);
						} else {
							const firstChar = prop.charAt(0);
							if (firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase()) {
								registerProxy = true;
							} else {
								// general namespace assignment
								target[prop] = value;
							}
						}
					}

					if (registerProxy) {
						target[prop] = new Proxy(value, oLibProxyHandler);
						// append currently written property to the namespace (mind the '.' at the end for the next level)
						const sNamespacePrefix = `${mSubNamespaces.get(target)}${prop}.`;
						// track nested namespace paths segments per proxy object
						mSubNamespaces.set(value, sNamespacePrefix);
					}
				} else {
					// no plain-object values, e.g. strings, classes
					target[prop] = value;
				}

				return true;
			},

			get(target, prop) {
				// check if an object is a proxy
				if (prop === symIsProxy) {
					return true;
				}
				return target[prop];
			}
		};

		return oLibProxyHandler;
	}

	/**
	 * Provides information about a library.
	 *
	 * This method is intended to be called exactly once while the main module of a library (its <code>library.js</code>
	 * module) is executing, typically at its begin. The single parameter <code>mSettings</code> is an info object that
	 * describes the content of the library.
	 *
	 * When the <code>mSettings</code> has been processed, a normalized version will be set on the library instance
	 * Finally, this function fires {@link #event:LibraryChanged} event with operation 'add' for the newly loaded
	 * library.
	 *
	 * <h3>Side Effects</h3>
	 *
	 * While analyzing the <code>mSettings</code>, the framework takes some additional actions:
	 *
	 * <ul>
	 * <li>If the object contains a list of <code>interfaces</code>, they will be registered with the {@link
	 * sap.ui.base.DataType} class to make them available as aggregation types in managed objects.</li>
	 *
	 * <li>If the object contains a list of <code>controls</code> or <code>elements</code>, {@link sap.ui.lazyRequire
	 * lazy stubs} will be created for their constructor as well as for their static <code>extend</code> and
	 * <code>getMetadata</code> methods.
	 *
	 * <b>Note:</b> Future versions of UI5 will abandon the concept of lazy stubs as it requires synchronous
	 * XMLHttpRequests which have been deprecated (see {@link http://xhr.spec.whatwg.org}). To be on the safe side,
	 * productive applications should always require any modules that they directly depend on.</li>
	 *
	 * <li>With the <code>noLibraryCSS</code> property, the library can be marked as 'theming-free'.  Otherwise, the
	 * framework will add a &lt;link&gt; tag to the page's head, pointing to the library's theme-specific stylesheet.
	 * The creation of such a &lt;link&gt; tag can be suppressed with the {@link topic:91f2d03b6f4d1014b6dd926db0e91070 global
	 * configuration option} <code>preloadLibCss</code>.  It can contain a list of library names for which no stylesheet
	 * should be included.  This is e.g. useful when an application merges the CSS for multiple libraries and already
	 * loaded the resulting stylesheet.</li>
	 *
	 * <li>If a list of library <code>dependencies</code> is specified in the info object, those libraries will be
	 * loaded synchronously if they haven't been loaded yet.
	 *
	 * <b>Note:</b> Dependencies between libraries have to be modeled consistently in several places:
	 * <ul>
	 * <li>Both eager and lazy dependencies have to be modelled in the <code>.library</code> file.</li>
	 * <li>By default, UI5 Tooling generates a <code>manifest.json</code> file from the content of the <code>.library</code>
	 * file. However, if the <code>manifest.json</code> file for the library is not generated but
	 * maintained manually, it must be kept consistent with the <code>.library</code> file, especially regarding
	 * its listed library dependencies.</li>
	 * <li>All eager library dependencies must be declared as AMD dependencies of the <code>library.js</code> module
	 * by referring to the corresponding <code>"some/lib/namespace/library"</code> module of each library
	 * dependency.</code></li>
	 * <li>All eager dependencies must be listed in the <code>dependencies</code> property of the info object.</li>
	 * <li>All lazy dependencies <b>must not</b> be listed as AMD dependencies or in the <code>dependencies</code>
	 * property of the info object.</li>
	 * </ul>
	 *
	 * Last but not least, higher layer frameworks might want to include their own metadata for libraries.
	 * The property <code>extensions</code> might contain such additional metadata. Its structure is not defined
	 * by the framework, but it is strongly suggested that each extension only occupies a single property
	 * in the <code>extensions</code> object and that the name of that property contains some namespace
	 * information (e.g. library name that introduces the feature) to avoid conflicts with other extensions.
	 * The framework won't touch the content of <code>extensions</code> but will make it available
	 * in the library info objects provided by {@link #.load}.
	 *
	 *
	 * <h3>Relationship to Descriptor for Libraries (manifest.json)</h3>
	 *
	 * The information contained in <code>mSettings</code> is partially redundant to the content of the descriptor
	 * for the same library (its <code>manifest.json</code> file). Future versions of UI5 will ignore the information
	 * provided in <code>mSettings</code> and will evaluate the descriptor file instead. Library developers therefore
	 * must keep the information in both files in sync if the <code>manifest.json</code> file is maintained manually.
	 *
	 *
	 * <h3>Library API-Version 2</h3>
	 *
	 * The Library API Version 2 has been introduced to avoid access to the global namespace when retrieving enum types.
	 * With Library API Version 2 a library must declare its enum types via {@link module:sap/ui/base/DataType.registerEnum DataType.registerEnum}.
	 *
	 * @param {object} mSettings Info object for the library
	 * @param {string} mSettings.name Name of the library; It must match the name by which the library has been loaded
	 * @param {string} [mSettings.version] Version of the library
	 * @param {int} [mSettings.apiVersion=1] The library's API version; supported values are 1, 2 and <code>undefined</code> (defaults to 1).
	 * @param {string[]} [mSettings.dependencies=[]] List of libraries that this library depends on; names are in dot
	 *  notation (e.g. "sap.ui.core")
	 * @param {string[]} [mSettings.types=[]] List of names of types that this library provides; names are in dot
	 *  notation (e.g. "sap.ui.core.CSSSize")
	 * @param {string[]} [mSettings.interfaces=[]] List of names of interface types that this library provides; names
	 *  are in dot notation (e.g. "sap.ui.core.PopupInterface")
	 * @param {string[]} [mSettings.controls=[]] Names of control types that this library provides; names are in dot
	 *  notation (e.g. "sap.ui.core.ComponentContainer")
	 * @param {string[]} [mSettings.elements=[]] Names of element types that this library provides (excluding controls);
	 *  names are in dot notation (e.g. "sap.ui.core.Item")
	 * @param {boolean} [mSettings.noLibraryCSS=false] Indicates whether the library doesn't provide / use theming.
	 *  When set to true, no library.css will be loaded for this library
	 * @param {object} [mSettings.extensions] Potential extensions of the library metadata; structure not defined by the
	 *  UI5 core framework.
	 * @returns {object} Returns the library namespace, based on the given library name.
	 * @public
	 */
	Library.init = function(mSettings) {
		// throw error if a Library is initialized before the core is ready.
		if (!sap.ui.require("sap/ui/core/Core")) {
			throw new Error("Library " + mSettings.name + ": Library must not be used before the core is ready!");
		}

		assert(typeof mSettings === "object" , "mSettings given to 'sap/ui/core/Lib.init' must be an object");
		assert(typeof mSettings.name === "string" && mSettings.name, "mSettings given to 'sap/ui/core/Lib.init' must have the 'name' property set");

		var METHOD = "sap/ui/core/Lib.init";
		Log.debug("Analyzing Library " + mSettings.name, null, METHOD);

		var oLib = Library._get(mSettings.name, true /* bCreate */);
		oLib.enhanceSettings(mSettings);

		var oLibNamespace = Object.create(null);

		// If a library states that it is using apiVersion 2, we expect types to be fully declared.
		// In this case we don't need to create Proxies for the library namespace.
		const apiVersion = mSettings.apiVersion ?? 1;

		if (![1, 2].includes(apiVersion)) {
			throw new TypeError(`The library '${mSettings.name}' has defined 'apiVersion: ${apiVersion}', which is an unsupported value. The supported values are: 1, 2 and undefined (defaults to 1).`);
		}

		if (apiVersion < 2) {
			const oLibProxyHandler = createProxyForLibraryNamespace(mSettings.name, oLibNamespace);

			// activate proxy for outer library namespace object
			oLibNamespace = new Proxy(oLibNamespace, oLibProxyHandler);
		}


		// register interface types
		DataType.registerInterfaceTypes(oLib.interfaces);

		if (!oLib.noLibraryCSS) {
			var oLibThemingInfo = {
				name: oLib.name,
				version: oLib.version,
				preloadedCss: getPreloadLibCss().indexOf(oLib.name) !== -1
			};
			aAllLibrariesRequiringCss.push(oLibThemingInfo);
			// Don't reset ThemeManager in case CSS for current library is already preloaded
			_getThemeManager(/* bClear = */ !oLibThemingInfo.preloadedCss).then(function(ThemeManager) {
				ThemeManager._includeLibraryThemeAndEnsureThemeRoot(oLibThemingInfo);
			});
		}

		// expose some legacy names
		oLib.sName = oLib.name;
		oLib.aControls = oLib.controls;

		Library.fireLibraryChanged({
			name: mSettings.name,
			stereotype: "library",
			operation: "add",
			metadata: oLib
		});

		return oLibNamespace;
	};

	function getLibraryModuleNames(aLibs) {
		return aLibs.map(function(oLib) {
			return oLib.name.replace(/\./g, "/") + "/library";
		});
	}

	function requireLibrariesAsync(aLibs) {
		var aLibraryModuleNames = getLibraryModuleNames(aLibs);

		return new Promise(function(resolve, reject) {
			sap.ui.require(
				aLibraryModuleNames,
				function () {
					// Wrapper function is needed to omit parameters for resolve()
					// which is always one library (first from the list), not an array of libraries.
					resolve(aLibs);
				},
				reject
			);
		});
	}

	/**
	 * Loads the given library and its dependencies and makes its content available to the application.
	 *
	 *
	 * <h3>What it does</h3>
	 *
	 * When library preloads are not suppressed for the given library, then a library-preload bundle will be loaded for
	 * it.
	 *
	 * After preloading the bundle, dependency information from the bundle is evaluated and any missing libraries are
	 * also preloaded.
	 *
	 * Only then the library entry module (named <code><i>your/lib</i>/library.js</code>) will be required and executed.
	 * The module is supposed to call {@link #.init} providing the framework with additional metadata about the library,
	 * e.g. its version, the set of contained enums, types, interfaces, controls and elements and whether the library
	 * requires CSS. If the library requires CSS, a &lt;link&gt; will be added to the page referring to the
	 * corresponding <code>library.css</code> stylesheet for the library and the current theme.
	 *
	 * When the optional parameter <code>mOptions.url</code> is given, then that URL will be registered for the
	 * namespace of the library and all resources will be loaded from that location. This is convenience for a call like
	 * <pre>
	 *   sap.ui.loader.config({
	 *     paths: {
	 *       "lib/with/slashes": mOptions.url
	 *     }
	 *   });
	 * </pre>
	 *
	 * When the given library has been loaded already, no further action will be taken, especially, a given URL will not
	 * be registered. A Promise will be returned, but will be resolved immediately.
	 *
	 *
	 * <h3>When to use</h3>
	 *
	 * For applications that follow the best practices and use components with component descriptors (manifest.json),
	 * the framework will load all declared mandatory libraries and their dependencies automatically before
	 * instantiating the application component.
	 *
	 * The same is true for libraries that are listed in the bootstrap configuration (e.g. with the attribute
	 * <code>data-sap-ui-libs</code>). They will be loaded before the <code>init</code> event of the UI5 Core is fired.
	 *
	 * Only when an app declares a library to be a lazy library dependency or when code does not use descriptors at all,
	 * then an explicit call to <code>loadLibrary</code> becomes necessary. The call should be made before artifacts
	 * (controls, elements, types, helpers, modules etc.) from the library are used or required. This allows the
	 * framework to optimize access to those artifacts.
	 *
	 * For example, when an app uses a heavy-weight charting library that shouldn't be loaded during startup, it can
	 * declare it as "lazy" and load it just before it loads and displays a view that uses the charting library:
	 * <pre>
	 *   await Library.load({name: "heavy.charting"});
	 *   await View.create({
	 *       name: "myapp.views.HeavyChartingView",
	 *       type: ViewType.XML
	 *   });
	 * </pre>
	 *
	 * @param {object} mOptions The options object that contains the following properties
	 * @param {string} mOptions.name The name of the library
	 * @param {string} [mOptions.url] URL to load the library from
	 * @returns {Promise<sap.ui.core.Lib>} A promise that resolves with the library instance after the loading of
	 *  the library is finished
	 * @public
	 */
	Library.load = function(mOptions) {
		if (typeof mOptions === "string") {
			mOptions = {name: mOptions};
		} else {
			mOptions = ["name", "url"].reduce(function(acc, sProperty) {
				if (mOptions && mOptions.hasOwnProperty(sProperty)) {
					acc[sProperty] = mOptions[sProperty];
				}
				return acc;
			}, {});
		}

		return Library._load(mOptions).then(function(aLibs) {
			return aLibs[0];
		});
	};

	/**
	 * Internal function for loading library/libraries which still supports the legacy features:
	 *
	 * <ul>
	 * <li>loading multiple libraries: libraries are preloaded firstly and their entry modules are executed within a
	 * single <code>sap.ui.require</code> call after their preloads are finished</li>
	 * <li><code>oLibConfig.json</code>: load the library preload in JSON format</li>
	 * <li><code>mOptions.sync</code>: load the preload file in sync mode</li>
	 * <li><code>mOptions.preloadOnly</code>: load the preload file in sync mode</li>
	 * </ul>
	 *
	 * @param {object[]|object} vLibConfigs An array of objects for libraries or a single object for one library
	 *  which contain the following properties
	 * @param {string} vLibConfigs.name The name of the library
	 * @param {string} [vLibConfigs.url] URL to load the library from
	 * @param {boolean} [vLibConfigs.json] Whether to load the library's preload bundle in JSON format
	 * @param {object} [mOptions] The options object that contains the following properties
	 * @param {boolean} [mOptions.sync] Whether to load the preload bundle(s) in sync mode
	 * @param {boolean} [mOptions.preloadOnly] Whether to skip executing the entry module(s) after preloading the
	 *  library/libraries
	 * @return {Promise<Array<sap.ui.core.Lib>>|Array<sap.ui.core.Lib>} A promise that resolves with an
	 *  array of library instances in async mode or an array of library instances in sync mode
	 * @private
	 */
	Library._load = function(vLibConfigs, mOptions) {
		mOptions = mOptions || {};

		if (!Array.isArray(vLibConfigs)) {
			vLibConfigs = [vLibConfigs];
		}

		var mAdditionalConfig = {};
		var aLibraryNames = [];
		vLibConfigs.forEach(function(vLibrary) {
			if (typeof vLibrary === "object") {
				if (vLibrary.hasOwnProperty("url") || vLibrary.hasOwnProperty("json")) {
					mAdditionalConfig[vLibrary.name] = vLibrary;
				}
				aLibraryNames.push(vLibrary.name);
			} else {
				aLibraryNames.push(vLibrary);
			}
		});

		var bPreload = Library.getPreloadMode() === 'sync' || Library.getPreloadMode() === 'async',
			bRequire = !mOptions.preloadOnly;

		if (!mOptions.sync) {
			aLibraryNames = VersionInfo._getTransitiveDependencyForLibraries(aLibraryNames);
		}

		var aLibs = aLibraryNames.map(function(sLibraryName) {
			var oLib = Library._get(sLibraryName, true /* bCreate */);

			if (oLib._loadingStatus == null && mAdditionalConfig[sLibraryName] && mAdditionalConfig[sLibraryName].url) {
				registerModulePath(sLibraryName, mAdditionalConfig[sLibraryName].url);
			}

			return oLib;
		});

		const pPreloaded = bPreload ?
			Promise.all(aLibs.map(function(oLib) {
				const mOptions = {};
				if (mAdditionalConfig[oLib.name] && mAdditionalConfig[oLib.name].hasOwnProperty("json")) {
					mOptions.json = mAdditionalConfig[oLib.name].json;
				}
				return oLib._preload(mOptions);
			})) :
			Promise.resolve(aLibs);

		return bRequire ? pPreloaded.then(requireLibrariesAsync) : pPreloaded;
	};

	/**
	 * Retrieves a resource bundle for the given library and locale.
	 *
	 * This method returns the resource bundle directly. When the resource bundle for the given locale isn't loaded
	 * yet, synchronous request will be used to load the resource bundle.
	 *
	 * If only one argument is given, it is assumed to be the library name. The locale
	 * then falls back to the current {@link module:sap/base/i18n/Localization.getLanguage session locale}.
	 *
	 * <h3>Configuration via App Descriptor</h3>
	 * When the App Descriptor for the library is available without further request (manifest.json
	 * has been preloaded) and when the App Descriptor is at least of version 1.9.0 or higher, then
	 * this method will evaluate the App Descriptor entry <code>"sap.ui5" / "library" / "i18n"</code>.
	 * <ul>
	 * <li>When the entry is <code>true</code>, a bundle with the default name "messagebundle.properties"
	 * will be loaded</li>
	 * <li>If it is a string, then that string will be used as name of the bundle</li>
	 * <li>If it is <code>false</code>, no bundle will be loaded and the result will be
	 *     <code>undefined</code></li>
	 * </ul>
	 *
	 * <h3>Caching</h3>
	 * Once a resource bundle for a library has been loaded, it will be cached.
	 * Further calls for the same locale won't create new requests, but return the already
	 * loaded bundle. There's therefore no need for control code to cache the returned bundle for a longer
	 * period of time. Not further caching the result also prevents stale texts after a locale change.
	 *
	 * @param {string} sLibrary Name of the library to retrieve the bundle for
	 * @param {string} [sLocale] Locale to retrieve the resource bundle for
	 * @returns {module:sap/base/i18n/ResourceBundle|undefined} The best matching resource bundle for the given
	 *  parameters or <code>undefined</code>
	 * @public
	 */
	Library.getResourceBundleFor = function(sLibrary, sLocale) {
		var oLibrary = Library._get(sLibrary, true);

		return oLibrary.getResourceBundle(sLocale);
	};

	/**
	 * Registers the given Element class to the library to which it belongs.
	 *
	 * @param {sap.ui.core.ElementMetadata} oElementMetadata the metadata of the Element class
	 * @private
	 */
	Library._registerElement = function(oElementMetadata) {
		var sElementName = oElementMetadata.getName(),
			sLibraryName = oElementMetadata.getLibraryName() || "",
			oLibrary = Library._get(sLibraryName),
			sCategory = oElementMetadata.isA("sap.ui.core.Control") ? 'controls' : 'elements';

		// if library has not been loaded yet, create a library
		if (!oLibrary) {
			oLibrary = Library._get(sLibraryName, true /* bCreate */);
		}

		if (oLibrary[sCategory].indexOf(sElementName) < 0) {
			// add class to corresponding category in library ('elements' or 'controls')
			oLibrary[sCategory].push(sElementName);

			Log.debug("Class " + sElementName + " registered for library " + sLibraryName);
			Library.fireLibraryChanged({name: sElementName, stereotype: oElementMetadata.getStereotype(), operation: "add", metadata : oElementMetadata});
		}
	};

	var _oEventProvider = new EventProvider();

	/**
	 * Fired when the set of controls, elements etc. for a library has changed or when the set of libraries has changed.
	 *
	 * Note: while the parameters of this event could already describe <i>any</i> type of change, the set of reported
	 * changes is currently restricted to the addition of libraries, controls and elements. Future implementations might
	 * extend the set of reported changes. Therefore applications should already check the operation and stereotype
	 * parameters.
	 *
	 * @name sap.ui.core.Lib#libraryChanged
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.name name of the newly added entity
	 * @param {string} [oEvent.getParameters.stereotype] stereotype of the newly added entity type ("control", "element")
	 * @param {string} [oEvent.getParameters.operation] type of operation ("add")
	 * @param {sap.ui.base.Metadata|object} [oEvent.getParameters.metadata] metadata for the added entity type.
	 *         Either an instance of sap.ui.core.ElementMetadata if it is a Control or Element, or a library info object
	 *         if it is a library. Note that the API of all metadata objects is not public yet and might change.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core, sap.ui.fl, sap.ui.support
	 */

	/**
	 * Register a listener for the {@link sap.ui.core.Lib#event:libraryChanged} event.
	 *
	 * @param {function} fnFunction Callback to be called when the <code>libraryChanged</code> event is fired
	 * @param {object} [oListener] Optional context object to call the callback on
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.support
	 */
	Library.attachLibraryChanged = function(fnFunction, oListener) {
		_oEventProvider.attachEvent("LibraryChanged", fnFunction, oListener);
	};

	/**
	 * Unregister a listener from the {@link sap.ui.core.Lib#event:libraryChanged} event.
	 *
	 * @param {function} fnFunction function to unregister
	 * @param {object} [oListener] context object given during registration
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.support
	 */
	Library.detachLibraryChanged = function(fnFunction, oListener) {
		_oEventProvider.detachEvent("LibraryChanged", fnFunction, oListener);
	};

	/**
	 * Fires a libraryChanged event when:
	 *   - a new library was loaded
	 *   - a control/element was added to a library
	 * @param {object} oParams the event parameters
	 *
	 * @private
	 */
	Library.fireLibraryChanged = function(oParams) {
		// notify registered Core listeners
		_oEventProvider.fireEvent("LibraryChanged", oParams);
	};

	/**
	 * Implementation of the ResourceBundle._enrichBundleConfig hook.
	 * Guesses if the given bundleUrl is pointing to a library's ResourceBundle and adapts the given bundle definition accordingly
	 * based on the inferred library's manifest.
	 *
	 * @param {module:sap/base/i18n/ResourceBundle.Configuration} mParams Map containing the arguments of the <code>ResourceBundle.create</code> call
	 * @returns {module:sap/base/i18n/ResourceBundle.Configuration} mParams The enriched config object
	 * @private
	 */
	ResourceBundle._enrichBundleConfig = function (mParams) {
		if (!mParams.terminologies || !mParams.enhanceWith) {

			var oLib = Library._getByBundleUrl(mParams.url);

			if (oLib) {
				// look up i18n information in library manifest
				// (can be undefined if the lib defines "sap.ui5/library/i18n" with <false>)
				var vI18n = oLib._getI18nSettings();

				// enrich i18n information
				if (vI18n) {
					// resolve bundleUrls relative to library path
					var sLibraryPath = oLib.name.replace(/\./g, "/");
					sLibraryPath = sLibraryPath.endsWith("/") ? sLibraryPath : sLibraryPath + "/"; // add trailing slash if missing
					sLibraryPath = sap.ui.require.toUrl(sLibraryPath);

					_UrlResolver._processResourceConfiguration(vI18n, {
						alreadyResolvedOnRoot: true,
						relativeTo: sLibraryPath
					});

					// basic i18n information
					mParams.fallbackLocale = mParams.fallbackLocale || vI18n.fallbackLocale;
					mParams.supportedLocales = mParams.supportedLocales || vI18n.supportedLocales;

					// text verticalization information
					mParams.terminologies = mParams.terminologies || vI18n.terminologies;
					mParams.enhanceWith = mParams.enhanceWith || vI18n.enhanceWith;
					mParams.activeTerminologies = mParams.activeTerminologies || Localization.getActiveTerminologies();
				}
			}
		}
		return mParams;
	};

	/**
	 * Get VersionedLibCss config option
	 *
	 * @returns {boolean} Wether VersionedLibCss is enabled or not
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	Library.getVersionedLibCss = function() {
		return BaseConfig.get({
			name: "sapUiVersionedLibCss",
			type: BaseConfig.Type.Boolean,
			external: true
		});
	};

	/**
	 * Whether dependency cache info files should be loaded instead of preload files.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @returns {boolean} whether dep-cache info files should be loaded
	 */
	Library.isDepCacheEnabled = function() {
		return BaseConfig.get({
			name: "sapUiXxDepCache",
			type: BaseConfig.Type.Boolean,
			external: true
		});
	};

	/**
	 * Currently active preload mode for libraries or falsy value.
	 *
	 * @returns {string} preload mode
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @since 1.120.0
	 */
	Library.getPreloadMode = function() {
		// if debug sources are requested, then the preload feature must be deactivated
		if (Supportability.isDebugModeEnabled() === true) {
			return "";
		}
		// determine preload mode (e.g. resolve default or auto)
		let sPreloadMode = BaseConfig.get({
			name: "sapUiPreload",
			type: BaseConfig.Type.String,
			defaultValue: "auto",
			external: true
		});
		// when the preload mode is 'auto', it will be set to 'async' or 'sync' for optimized sources
		// depending on whether the ui5loader is configured async
		if ( sPreloadMode === "auto" ) {
			if (window["sap-ui-optimized"]) {
				sPreloadMode = sap.ui.loader.config().async ? "async" : "sync";
			} else {
				sPreloadMode = "";
			}
		}
		return sPreloadMode;
	};

	return Library;
});

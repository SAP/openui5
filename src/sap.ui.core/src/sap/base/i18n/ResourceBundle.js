/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/base/assert',
		'sap/base/future',
		'sap/base/Log',
		'sap/base/i18n/LanguageFallback',
		'sap/base/i18n/Localization',
		'sap/base/strings/formatMessage',
		'sap/base/util/Properties',
		'sap/base/util/merge'
	],
	function(assert, future, Log, LanguageFallback, Localization, formatMessage, Properties, merge) {
	"use strict";

	/**
	 * HANA XS Engine can't handle private extensions in BCP47 language tags.
	 * Therefore, the agreed BCP47 codes for the technical languages 1Q..3Q
	 * don't work as Accept-Header and need to be send as URL parameters as well.
	 * @const
	 * @private
	 */
	var M_SUPPORTABILITY_TO_XS = {
		"en_US_saptrc"  : "1Q",
		"en_US_sappsd"  : "2Q",
		"en_US_saprigi" : "3Q"
	};

	/**
	 * Default fallback locale is "en" (English) to stay backward compatible
	 * @const
	 * @private
	 */
	var sDefaultFallbackLocale = "en";

	/**
	 * The cache for property file requests
	 *
	 * @private
	 */
	const oPropertiesCache = {

		/**
		 * Holds the cache entries
		 *
		 * @private
		 */
		_oCache: new Map(),

		/**
		 * Removes the given cache entry
		 *
		 * @param {string} sKey The key of the cache entry
		 * @private
		 */
		_delete(sKey){
			this._oCache.delete(sKey);
		},

		/**
		 * Creates and returns a new instance of {@link module:sap/base/util/Properties}.
		 *
		 * @see {@link module:sap/base/util/Properties.create}
		 * @param {object} oOptions The options to create the properties object
		 * @returns {module:sap/base/util/Properties|null|Promise<module:sap/base/util/Properties|null>} The properties object or a promise on it
		 * @private
		 */
		_load(oOptions){
			return Properties.create(oOptions);
		},

		/**
		 * Inserts or updates an entry
		 *
		 * @param {string} sKey the cache id
		 * @param {object} oValue entry to cache
		 * @private
		 */
		_set(sKey, oValue){
			this._oCache.set(sKey, oValue);
		},

		/**
		 * Retrieves an entry from the cache
		 *
		 * @param {string} sKey the cache id
		 * @param {object} [oLoadOptions] options which are passed to #load
		 * @param {boolean} [bAsync=false] async requested
		 * @returns {object} entry which either comes from cache or from #load
		 * @private
		 */
		get(sKey, oLoadOptions, bAsync){
			if (this._oCache.has(sKey)) {
				const oExisting = this._oCache.get(sKey);
				if (bAsync){
					return Promise.resolve(oExisting);
				} else if (!(oExisting instanceof Promise)) {
					return oExisting;
				}
				// can't use cached, non-fulfilled promise in sync mode
			}

			const oNewEntry = this._load(oLoadOptions);
			if (oNewEntry instanceof Promise) {
				// update cache entry with actual object instead of fulfilled promise
				oNewEntry.then((oResult) => {
					if (oResult) {
						this._set(sKey, oResult);
					} else {
						this._delete(sKey);
					}
				}).catch((e) => {
					this._delete(sKey);
					throw e;
				});
			}
			if (oNewEntry) {
				this._set(sKey, oNewEntry);
			}
			return oNewEntry;
		}
	};

	/**
	 * Returns the default locale (the locale defined in UI5 configuration if available, else fallbackLocale).
	 *
	 * @param {string} sFallbackLocale If the locale cannot be retrieved from the configuration
	 * @returns {string} The default locale
	 * @private
	 */
	function defaultLocale(sFallbackLocale) {
		var sLocale;
		// use the current session locale, if available
		sLocale = Localization.getLanguage();
		sLocale = LanguageFallback.normalize(sLocale);
		// last fallback is fallbackLocale if no or no valid locale is given
		return sLocale || sFallbackLocale;
	}

	/**
	 * A regular expression to split a URL into
	 * <ol>
	 * <li>a part before the file extension</li>
	 * <li>the file extension itself</li>
	 * <li>any remaining part after the file extension (query, hash - optional)</li>
	 * </ol>.
	 *
	 * Won't match for URLs without a file extension.
	 *
	 *           [------- prefix ------][----ext----][-------suffix--------]
	 *                                               ?[--query--]#[--hash--]
	 */
	var rUrl = /^((?:[^?#]*\/)?[^\/?#]*)(\.[^.\/?#]+)((?:\?([^#]*))?(?:#(.*))?)$/;

	/**
	 * List of supported file extensions.
	 *
	 * Could be enriched in future or even could be made
	 * extensible to support other formats as well.
	 * @const
	 * @private
	 */
	var A_VALID_FILE_TYPES = [ ".properties", ".hdbtextbundle" ];

	/**
	 * Helper to split a URL with the above regex.
	 * Either returns an object with the parts or undefined.
	 * @param {string} sUrl URL to analyze / split into pieces.
	 * @returns {object} an object with properties for the individual URL parts
	 */
	function splitUrl(sUrl) {
		var m = rUrl.exec(sUrl);
		if ( !m || A_VALID_FILE_TYPES.indexOf( m[2] ) < 0 ) {
			throw new Error("resource URL '" + sUrl + "' has unknown type (should be one of " + A_VALID_FILE_TYPES.join(",") + ")");
		}
		return { url : sUrl, prefix : m[1], ext : m[2], query: m[4], hash: (m[5] || ""), suffix : m[2] + (m[3] || "") };
	}

	/**
	 * @class Contains locale-specific texts.
	 *
	 * If you need a locale-specific text within your application, you can use the
	 * resource bundle to load the locale-specific file from the server and access
	 * the texts of it.
	 *
	 * Use {@link module:sap/base/i18n/ResourceBundle.create} to create an instance of sap/base/i18n/ResourceBundle
	 * (.properties without any locale information, e.g. "mybundle.properties"), and optionally
	 * a locale. The locale is defined as a string of the language and an optional country code
	 * separated by underscore (e.g. "en_GB" or "fr"). If no locale is passed, the default
	 * locale is "en" if the SAPUI5 framework is not available. Otherwise the default locale is taken from
	 * the SAPUI5 configuration.
	 *
	 * With the getText() method of the resource bundle, a locale-specific string value
	 * for a given key will be returned.
	 *
	 * With the given locale, the resource bundle requests the locale-specific properties file
	 * (e.g. "mybundle_fr_FR.properties"). If no file is found for the requested locale or if the file
	 * does not contain a text for the given key, a sequence of fallback locales is tried one by one.
	 * First, if the locale contains a region information (fr_FR), then the locale without the region is
	 * tried (fr). If that also can't be found or doesn't contain the requested text, a fallback language
	 * will be used, if given (defaults to en (English), assuming that most development projects contain
	 * at least English texts). If that also fails, the file without locale (base URL of the bundle,
	 * often called the 'raw' bundle) is tried.
	 *
	 * If none of the requested files can be found or none of them contains a text for the given key,
	 * then the key itself is returned as text.
	 *
	 * Exception: Fallback for "zh_HK" is "zh_TW" before "zh".
	 *
	 * @since 1.58
	 * @alias module:sap/base/i18n/ResourceBundle
	 * @public
	 * @hideconstructor
	 */
	function ResourceBundle(sUrl, sLocale, bIncludeInfo, bAsync, aSupportedLocales, sFallbackLocale, bSkipFallbackLocaleAndRaw){
		// locale to retrieve texts for (normalized)
		this.sLocale = LanguageFallback.normalize(sLocale) || defaultLocale(sFallbackLocale === undefined ? sDefaultFallbackLocale : sFallbackLocale);
		this.oUrlInfo = splitUrl(sUrl);
		this.bIncludeInfo = bIncludeInfo;
		this.bAsync = bAsync;
		// list of custom bundles
		this.aCustomBundles = [];
		// declare list of property files that are loaded,
		// along with a list of origins
		this.aPropertyFiles = [];
		this.aPropertyOrigins = [];

		this.aLocales = [];

		// list of calculated fallbackLocales
		// note: every locale which was loaded is removed from this list
		this._aFallbackLocales = LanguageFallback.calculate(
			this.sLocale,
			// bundle specific supported locales will be favored over configuration ones
			aSupportedLocales || Localization.getSupportedLanguages(),
			sFallbackLocale,
			" of the bundle '" + this.oUrlInfo.url + "'",
			bSkipFallbackLocaleAndRaw
		);

		// load the most specific, existing properties file
		if (bAsync) {
			return loadNextPropertiesAsync(this).then(() => this, /** @deprecated As of version 1.135 */ (err) => {
				future.errorThrows(err.message);
				return this;
			});
		}
		loadNextPropertiesSync(this);
	}

	/**
	 * Enhances the resource bundle with a custom resource bundle. The bundle
	 * can be enhanced with multiple resource bundles. The last enhanced resource
	 * bundle wins against the previous ones and the original ones. This function
	 * can be called several times.
	 *
	 * @param {module:sap/base/i18n/ResourceBundle} oCustomBundle an instance of a <code>sap/base/i18n/ResourceBundle</code>
	 * @private
	 */
	ResourceBundle.prototype._enhance = function(oCustomBundle) {
		if (oCustomBundle instanceof ResourceBundle) {
			this.aCustomBundles.push(oCustomBundle);
		} else {
			// we report the error but do not break the execution
			Log.error("Custom resource bundle is either undefined or not an instanceof sap/base/i18n/ResourceBundle. Therefore this custom resource bundle will be ignored!");
		}
	};

	/**
	 * Returns a locale-specific string value for the given key sKey.
	 *
	 * The text is searched in this resource bundle according to the fallback chain described in
	 * {@link module:sap/base/i18n/ResourceBundle}. If no text could be found, the key itself is used
	 * as text.
	 *
	 *
	 * <h3>Placeholders</h3>
	 *
	 * A text can contain placeholders that will be replaced with concrete values when
	 * <code>getText</code> is called. The replacement is triggered by the <code>aArgs</code> parameter.
	 *
	 * Whenever this parameter is given, then the text and the arguments are additionally run through
	 * the {@link module:sap/base/strings/formatMessage} API to replace placeholders in the text with
	 * the corresponding values from the arguments array. The resulting string is returned by
	 * <code>getText</code>.
	 *
	 * As the <code>formatMessage</code> API imposes some requirements on the input text (regarding
	 * curly braces and single apostrophes), text authors need to be aware of the specifics of the
	 * <code>formatMessage</code> API. Callers of <code>getText</code>, on the other side, should only
	 * supply <code>aArgs</code> when the text has been created with the <code>formatMessage</code> API
	 * in mind. Otherwise, single apostrophes in the text might be removed unintentionally.
	 *
	 * When <code>getText</code> is called without <code>aArgs</code>, the <code>formatMessage</code>
	 * API is not applied and the transformation reg. placeholders and apostrophes does not happen.
	 *
	 * For more details on the replacement mechanism refer to {@link module:sap/base/strings/formatMessage}.
	 *
	 * @param {string} sKey Key to retrieve the text for
	 * @param {any[]} [aArgs] List of parameter values which should replace the placeholders "{<i>n</i>}"
	 *     (<i>n</i> is the index) in the found locale-specific string value. Note that the replacement
	 *     is done whenever <code>aArgs</code> is given (not <code>undefined</code>), no matter whether
	 *     the text contains placeholders or not and no matter whether <code>aArgs</code> contains a
	 *     value for <i>n</i> or not.
	 * @param {boolean} [bIgnoreKeyFallback=false]
	 *     If set, <code>undefined</code> is returned instead of the key string, when the key is not found
	 *     in any bundle or fallback bundle.
	 * @returns {string|undefined}
	 *     The value belonging to the key, if found; otherwise the key itself or <code>undefined</code>
	 *     depending on <code>bIgnoreKeyFallback</code>.
	 *
	 * @public
	 */
	ResourceBundle.prototype.getText = function(sKey, aArgs, bIgnoreKeyFallback){

		// 1. try to retrieve text from properties (including custom properties)
		var sValue = this._getTextFromProperties(sKey, aArgs);
		if (sValue != null) {
			return sValue;
		}

		// 2. try to retrieve text from fallback properties (including custom fallback properties)
		sValue = this._getTextFromFallback(sKey, aArgs);
		if (sValue != null) {
			return sValue;
		}

		if (bIgnoreKeyFallback) {
			return undefined;
		} else {
			assert(false, "could not find any translatable text for key '" + sKey + "' in bundle file(s): '" + this.aPropertyOrigins.join("', '") + "'");
			return this._formatValue(sKey, sKey, aArgs);
		}
	};

	/**
	 * Enriches the input value with originInfo if <code>this.bIncludeInfo</code> is truthy.
	 * Uses args to format the message.
	 * @param {string} sValue the given input value
	 * @param {string} sKey the key within the bundle
	 * @param {array} [aArgs] arguments to format the message
	 * @returns {string|null} formatted string, <code>null</code> if sValue is not a string
	 * @private
	 */
	ResourceBundle.prototype._formatValue = function(sValue, sKey, aArgs){
		if (typeof sValue === "string") {

			if (aArgs !== undefined && !Array.isArray(aArgs)){
				future.errorThrows("sap/base/i18n/ResourceBundle: value for parameter 'aArgs' is not of type array");
			}

			if (aArgs) {
				sValue = formatMessage(sValue, aArgs);
			}

			if (this.bIncludeInfo) {
				// String object is created on purpose and must not be a string literal
				// eslint-disable-next-line no-new-wrappers
				sValue = new String(sValue);
				sValue.originInfo = {
					source: "Resource Bundle",
					url: this.oUrlInfo.url,
					locale: this.sLocale,
					key: sKey
				};
			}
		}
		return sValue;
	};

	/**
	 * Recursively loads synchronously the fallback locale's properties and looks up the value by key.
	 * The custom bundles are checked first in reverse order.
	 * @param {string} sKey the key within the bundle
	 * @param {array} [aArgs] arguments to format the message
	 * @returns {string|null} the formatted value if found, <code>null</code> otherwise
	 * @private
	 */
	ResourceBundle.prototype._getTextFromFallback = function(sKey, aArgs){

		var sValue, i;

		// loop over the custom bundles before resolving this one
		// lookup the custom resource bundles (last one first!)
		for (i = this.aCustomBundles.length - 1; i >= 0; i--) {
			sValue = this.aCustomBundles[i]._getTextFromFallback(sKey, aArgs);
			// value found - so return it!
			if (sValue != null) {
				return sValue; // found!
			}
		}

		// value for this key was not found in the currently loaded property files,
		// load the fallback locales
		while ( typeof sValue !== "string" && this._aFallbackLocales.length ) {

			var oProperties = loadNextPropertiesSync(this);

			// check whether the key is included in the newly loaded property file
			if (oProperties) {
				sValue = oProperties.getProperty(sKey);
				if (typeof sValue === "string") {
					return this._formatValue(sValue, sKey, aArgs);
				}
			}
		}
		return null;
	};

	/**
	 * Recursively loads locale's properties and looks up the value by key.
	 * The custom bundles are checked first in reverse order.
	 * @param {string} sKey the key within the bundle
	 * @param {array} [aArgs] arguments to format the message
	 * @returns {string|null} the formatted value if found, <code>null</code> otherwise
	 * @private
	 */
	ResourceBundle.prototype._getTextFromProperties = function(sKey, aArgs){
		var sValue = null,
			i;

		// loop over the custom bundles before resolving this one
		// lookup the custom resource bundles (last one first!)
		for (i = this.aCustomBundles.length - 1; i >= 0; i--) {
			sValue = this.aCustomBundles[i]._getTextFromProperties(sKey, aArgs);
			// value found - so return it!
			if (sValue != null) {
				return sValue; // found!
			}
		}

		// loop over all loaded property files and return the value for the key if any
		for (i = 0; i < this.aPropertyFiles.length; i++) {
			sValue = this.aPropertyFiles[i].getProperty(sKey);
			if (typeof sValue === "string") {
				return this._formatValue(sValue, sKey, aArgs);
			}
		}

		return null;
	};

	/**
	 * Checks whether a text for the given key can be found in the first loaded
	 * resource bundle or not. Neither the custom resource bundles nor the
	 * fallback chain will be processed.
	 *
	 * This method allows to check for the existence of a text without triggering
	 * requests for the fallback locales.
	 *
	 * When requesting the resource bundle asynchronously this check must only be
	 * used after the resource bundle has been loaded.
	 *
	 * @param {string} sKey Key to check
	 * @returns {boolean} Whether the text has been found in the concrete bundle
	 *
	 * @public
	 */
	ResourceBundle.prototype.hasText = function(sKey) {
		return this.aPropertyFiles.length > 0 && typeof this.aPropertyFiles[0].getProperty(sKey) === "string";
	};

	/**
	 * Creates and returns a new instance with the exact same parameters this instance has been created with.
	 *
	 * @private
	 * @ui5-restricted sap.ui.model.resource.ResourceModel
	 * @returns {module:sap/base/i18n/ResourceBundle|Promise<module:sap/base/i18n/ResourceBundle>}
	 *     A new resource bundle or a Promise on that bundle (in asynchronous case)
	 */
	ResourceBundle.prototype._recreate = function() {
		if (!this._mCreateFactoryParams) {
			// This can only happen when calling the method for instances created by ResourceBundle.create via getEnhanceWithResourceBundles or getTerminologyResourceBundles.
			// But those instances are only internally assigned to the actual ResourceBundle instance. Therefore it is not required for the model use case to recreate a bundle.
			var error = new Error("ResourceBundle instance can't be recreated as it has not been created by the ResourceBundle.create factory.");
			if (this.bAsync) {
				return Promise.reject(error);
			} else {
				throw error;
			}
		} else {
			// Use internal factory to bypass async deprecation handling.
			// This prevents false-positive deprecation warnings in the console
			// in case the private _createSync has been used and prevents
			// duplicate warnings in case the public create has been used in sync mode.
			return createResourceBundle(this._mCreateFactoryParams);
		}
	};

	/*
	 * Tries to load properties files asynchronously until one could be loaded
	 * successfully or until there are no more fallback locales.
	 */
	function loadNextPropertiesAsync(oBundle) {
		if ( oBundle._aFallbackLocales.length ) {
			return tryToLoadNextProperties(oBundle, true).then(function(oProps) {
				// if props could not be loaded, try next fallback locale
				return oProps || loadNextPropertiesAsync(oBundle);
			});
		}
		// no more fallback locales: give up
		return Promise.resolve(null);
	}

	/*
	 * Tries to load properties files synchronously until one could be loaded
	 * successfully or until there are no more fallback locales.
	 */
	function loadNextPropertiesSync(oBundle) {
		while ( oBundle._aFallbackLocales.length ) {
			var oProps = tryToLoadNextProperties(oBundle, false);
			if ( oProps ) {
				return oProps;
			}
		}
		return null;
	}

	/*
	 * Tries to load the properties file for the next fallback locale.
	 *
	 * If there is no further fallback locale or when requests for the next fallback locale are
	 * suppressed by configuration or when the file cannot be loaded, <code>null</code> is returned.
	 *
	 * @param {module:sap/base/i18n/ResourceBundle} oBundle ResourceBundle to extend
	 * @param {boolean} [bAsync=false] Whether the resource should be loaded asynchronously
	 * @returns {module:sap/base/util/Properties|null|Promise<module:sap/base/util/Properties|null>}
	 *         The newly loaded properties (sync mode) or a Promise on the properties (async mode);
	 *         value / Promise fulfillment will be <code>null</code> when the properties for the
	 *         next fallback locale should not be loaded or when loading failed or when there
	 *         was no more fallback locale
	 * @private
	 */
	function tryToLoadNextProperties(oBundle, bAsync) {

		// get the next fallback locale
		var sLocale = oBundle._aFallbackLocales.shift();

		if ( sLocale != null) {

			var oUrl = oBundle.oUrlInfo,
				sUrl, mHeaders;

			if ( oUrl.ext === '.hdbtextbundle' ) {
				if ( M_SUPPORTABILITY_TO_XS[sLocale] ) {
					// Add technical support languages also as URL parameter (as XS engine can't handle private extensions in Accept-Language header)
					sUrl = oUrl.prefix + oUrl.suffix + '?' + (oUrl.query ? oUrl.query + "&" : "") + "sap-language=" + M_SUPPORTABILITY_TO_XS[sLocale] + (oUrl.hash ? "#" + oUrl.hash : "");
				} else {
					sUrl = oUrl.url;
				}
				// Alternative: add locale as query:
				// url: oUrl.prefix + oUrl.suffix + '?' + (oUrl.query ? oUrl.query + "&" : "") + "locale=" + sLocale + (oUrl.hash ? "#" + oUrl.hash : ""),
				mHeaders = {
					"Accept-Language": LanguageFallback.convertLocaleToBCP47(sLocale) || "*"
				};
			} else {
				sUrl = oUrl.prefix + (sLocale ? "_" + sLocale : "") + oUrl.suffix;
			}

			// headers might contain "accept-language" tag which can lead to a different properties
			// request, therefore it needs to be integrated into the cache key
			// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
			var sCacheKey = JSON.stringify({url: new URL(sUrl, document.baseURI).href, headers: mHeaders});

			var oOptions = {
				url: sUrl,
				headers: mHeaders,
				async: !!bAsync,
				returnNullIfMissing: true
			};

			const vProperties = oPropertiesCache.get(sCacheKey, oOptions, oOptions.async);

			var addProperties = function(oProps) {
				if ( oProps ) {
					oBundle.aPropertyFiles.push(oProps);
					oBundle.aPropertyOrigins.push(sUrl);
					oBundle.aLocales.push(sLocale);
				}
				return oProps;
			};

			return bAsync ? vProperties.then( addProperties ) : addProperties( vProperties );

		}

		return bAsync ? Promise.resolve(null) : null;
	}

	/**
	 * Gets the URL either from the given resource bundle name or the given resource bundle URL.
	 *
	 * @param {string} [bundleUrl]
	 *   URL pointing to the base ".properties" file of a bundle (".properties" file without any
	 *   locale information, e.g. "../../i18n/mybundle.properties"); relative URLs are evaluated
	 *   relative to the document.baseURI
	 * @param {string} [bundleName]
	 *   UI5 module name in dot notation referring to the base ".properties" file; this name is
	 *   resolved to a path like the paths of normal UI5 modules and ".properties" is then
	 *   appended (e.g. a name like "myapp.i18n.myBundle" can be given); relative module names are
	 *   not supported
	 * @returns {string}
	 *   The resource bundle URL
	 *
	 * @private
	 * @ui5-restricted sap.ui.model.resource.ResourceModel
	 */
	ResourceBundle._getUrl = function(bundleUrl, bundleName) {
		var sUrl = bundleUrl;
		if (bundleName) {
			bundleName = bundleName.replace(/\./g, "/");
			sUrl = sap.ui.require.toUrl(bundleName) + ".properties";
		}
		return sUrl;
	};

	/**
	 * @returns {module:sap/base/i18n/ResourceBundle[]} The list of ResourceBundles created from enhanceWith
	 */
	function getEnhanceWithResourceBundles(aActiveTerminologies, aEnhanceWith, sLocale, bIncludeInfo, bAsync, sFallbackLocale, aSupportedLocales) {
		if (!aEnhanceWith) {
			return [];
		}
		var aCustomBundles = [];
		aEnhanceWith.forEach(function (oEnhanceWith) {

			// inherit fallbackLocale and supportedLocales if not defined
			if (oEnhanceWith.fallbackLocale === undefined) {
				oEnhanceWith.fallbackLocale = sFallbackLocale;
			}
			if (oEnhanceWith.supportedLocales === undefined) {
				oEnhanceWith.supportedLocales = aSupportedLocales;
			}
			var sUrl = ResourceBundle._getUrl(oEnhanceWith.bundleUrl, oEnhanceWith.bundleName);

			var vResourceBundle = new ResourceBundle(sUrl, sLocale, bIncludeInfo, bAsync, oEnhanceWith.supportedLocales, oEnhanceWith.fallbackLocale);

			aCustomBundles.push(vResourceBundle);

			if (oEnhanceWith.terminologies) {
				aCustomBundles = aCustomBundles.concat(getTerminologyResourceBundles(aActiveTerminologies, oEnhanceWith.terminologies, sLocale, bIncludeInfo, bAsync));
			}
		});

		return aCustomBundles;
	}

	/**
	 * @returns {module:sap/base/i18n/ResourceBundle[]} The list of ResourceBundles created from terminologies
	 */
	function getTerminologyResourceBundles(aActiveTerminologies, oTerminologies, sLocale, bIncludeInfo, bAsync) {
		if (!aActiveTerminologies) {
			return [];
		}
		// only take activeTerminologies which are present
		// creates a copy of the given array (is reversed later on)
		aActiveTerminologies = aActiveTerminologies.filter(function (sActiveTechnology) {
			return oTerminologies.hasOwnProperty(sActiveTechnology);
		});
		// reverse
		// the terminology resource bundles are enhancements of the current bundle
		// the lookup order for enhancements starts with the last enhancement
		// therefore to ensure that the first element in the activeTerminologies array is looked up first
		// this array needs to be reversed.

		// Note: Array#reverse modifies the original array
		aActiveTerminologies.reverse();

		return aActiveTerminologies.map(function (sActiveTechnology) {
			var mParamsTerminology = oTerminologies[sActiveTechnology];

			var sUrl = ResourceBundle._getUrl(mParamsTerminology.bundleUrl, mParamsTerminology.bundleName);

			var aSupportedLocales = mParamsTerminology.supportedLocales;

			return new ResourceBundle(sUrl, sLocale, bIncludeInfo, bAsync, aSupportedLocales, null, true);
		});
	}

	/**
	 * ResourceBundle Configuration
	 *
	 * A ResourceBundle Configuration holds information on where to load the ResourceBundle from
	 * using the fallback chain and terminologies.
	 * The location is retrieved from the <code>bundleUrl</code> and <code>bundleName</code> parameters
	 * The locale used is influenced by the <code>supportedLocales</code> and <code>fallbackLocale</code> parameters
	 * Terminologies of this ResourceBundle are loaded via the <code>terminologies</code> parameter
	 *
	 * Note: If omitted, the supportedLocales and the fallbackLocale are inherited from the parent ResourceBundle Configuration
	 *
	 * @typedef {object} module:sap/base/i18n/ResourceBundle.Configuration
	 * @property {string} [bundleUrl] URL pointing to the base .properties file of a bundle (.properties file without any locale information, e.g. "i18n/mybundle.properties")
	 * @property {string} [bundleName] UI5 module name in dot notation pointing to the base .properties file of a bundle (.properties file without any locale information, e.g. "i18n.mybundle")
	 * @property {string[]} [supportedLocales] List of supported locales (aka 'language tags') to restrict the fallback chain.
	 *     Each entry in the array can either be a BCP47 language tag or a JDK compatible locale string
	 *     (e.g. "en-GB", "en_GB" or "en"). An empty string (<code>""</code>) represents the 'raw' bundle.
	 *     <b>Note:</b> The given language tags can use modern or legacy ISO639 language codes. Whatever
	 *     language code is used in the list of supported locales will also be used when requesting a file
	 *     from the server. If the <code>locale</code> contains a legacy language code like "iw" and the
	 *     <code>supportedLocales</code> contains [...,"he",...], "he" will be used in the URL.
	 *     This mapping works in both directions.
	 * @property {string} [fallbackLocale="en"] A fallback locale to be used after all locales
	 *     derived from <code>locale</code> have been tried, but before the 'raw' bundle is used.
	 * 	   Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB"
	 *     or "en"), defaults to "en" (English).
	 *     To prevent a generic fallback, use the empty string (<code>""</code>).
	 *     E.g. by providing <code>fallbackLocale: ""</code> and <code>supportedLocales: ["en"]</code>,
	 *     only the bundle "en" is requested without any fallback.
	 * @property {Object<string,module:sap/base/i18n/ResourceBundle.TerminologyConfiguration>} [terminologies]
	 *     An object, mapping a terminology identifier (e.g. "oil") to a <code>ResourceBundle.TerminologyConfiguration</code>.
	 *     A terminology is a resource bundle configuration for a specific use case (e.g. "oil").
	 *     It does neither have a <code>fallbackLocale</code> nor can it be enhanced with <code>enhanceWith</code>.
	 * @public
	 */

	/**
	 * ResourceBundle Terminology Configuration
	 *
	 * Terminologies represent a variant of a ResourceBundle.
	 * They can be used to provide domain specific texts, e.g. for industries, e.g. "oil", "retail" or "health".
	 * While "oil" could refer to a user as "driller", in "retail" a user could be a "customer" and in "health" a "patient".
	 * While "oil" could refer to a duration as "hitch", in "retail" a duration could be a "season" and in "health" an "incubation period".
	 *
	 * Note: Terminologies do neither support a fallbackLocale nor nested terminologies in their configuration.
	 *
	 * @typedef {object} module:sap/base/i18n/ResourceBundle.TerminologyConfiguration
	 * @property {string} [bundleUrl] URL pointing to the base .properties file of a bundle (.properties file without any locale information, e.g. "i18n/mybundle.properties")
	 * @property {string} [bundleName] UI5 module name in dot notation pointing to the base .properties file of a bundle (.properties file without any locale information, e.g. "i18n.mybundle")
	 * @property {string[]} [supportedLocales] List of supported locales (aka 'language tags') to restrict the fallback chain.
	 *     Each entry in the array can either be a BCP47 language tag or a JDK compatible locale string
	 *     (e.g. "en-GB", "en_GB" or "en"). An empty string (<code>""</code>) represents the 'raw' bundle.
	 *     <b>Note:</b> The given language tags can use modern or legacy ISO639 language codes. Whatever
	 *     language code is used in the list of supported locales will also be used when requesting a file
	 *     from the server. If the <code>locale</code> contains a legacy language code like "iw" and the
	 *     <code>supportedLocales</code> contains [...,"he",...], "he" will be used in the URL.
	 *     This mapping works in both directions.
	 * @public
	 */

	/**
	 * Creates and returns a new instance of {@link module:sap/base/i18n/ResourceBundle}
	 * using the given URL and locale to determine what to load.
	 *
	 * Before loading the ResourceBundle, the locale is evaluated with a fallback chain.
	 * Sample fallback chain for locale="de-DE" and fallbackLocale="fr_FR"
	 * <code>"de-DE" -> "de" -> "fr_FR" -> "fr" -> raw</code>
	 *
	 * Only those locales are considered for loading, which are in the supportedLocales array
	 * (if the array is supplied and not empty).
	 *
	 * Note: The fallbackLocale should be included in the supportedLocales array.
	 *
	 *
	 * @example <caption>Load a resource bundle</caption>
	 *
	 * sap.ui.require(["sap/base/i18n/ResourceBundle"], function(ResourceBundle){
	 *  // ...
	 *  ResourceBundle.create({
	 *      // specify url of the base .properties file
	 *      url : "i18n/messagebundle.properties",
	 *      async : true
	 *  }).then(function(oResourceBundle){
	 *      // now you can access the bundle
	 *  });
	 *  // ...
	 * });
	 *
	 * @example <caption>Load a resource bundle with supported locales and fallback locale</caption>
	 *
	 * sap.ui.require(["sap/base/i18n/ResourceBundle"], function(ResourceBundle){
	 *  // ...
	 *  ResourceBundle.create({
	 *      // specify url of the base .properties file
	 *      url : "i18n/messagebundle.properties",
	 *      async : true,
	 *      supportedLocales: ["de", "da"],
	 *      fallbackLocale: "de"
	 *  }).then(function(oResourceBundle){
	 *      // now you can access the bundle
	 *  });
	 *  // ...
	 * });
	 *
	 * @example <caption>Load a resource bundle with terminologies 'oil' and 'retail'</caption>
	 *
	 * sap.ui.require(["sap/base/i18n/ResourceBundle"], function(ResourceBundle){
	 *  // ...
	 *  ResourceBundle.create({
	 *      // specify url of the base .properties file
	 *      url : "i18n/messagebundle.properties",
	 *      async : true,
	 *      supportedLocales: ["de", "da"],
	 *      fallbackLocale: "de",
	 *      terminologies: {
	 *          oil: {
	 *              bundleUrl: "i18n/terminologies.oil.i18n.properties",
	 *                 supportedLocales: [
	 *                     "da", "en", "de"
	 *                 ]
	 *          },
	 *          retail: {
	 *             bundleUrl: "i18n/terminologies.retail.i18n.properties",
	 *             supportedLocales: [
	 *                 "da", "de"
	 *             ]
	 *         }
	 *      },
	 *      activeTerminologies: ["retail", "oil"]
	 *  }).then(function(oResourceBundle){
	 *      // now you can access the bundle
	 *  });
	 *  // ...
	 * });
	 *
	 * @example <caption>Load a resource bundle with enhancements</caption>
	 *
	 * sap.ui.require(["sap/base/i18n/ResourceBundle"], function(ResourceBundle){
	 *  // ...
	 *  ResourceBundle.create({
	 *      // specify url of the base .properties file
	 *      url : "i18n/messagebundle.properties",
	 *      async : true,
	 *      supportedLocales: ["de", "da"],
	 *      fallbackLocale: "de",
	 *      enhanceWith: [
	 *          {
	 *              bundleUrl: "appvar1/i18n/i18n.properties",
	 *              supportedLocales: ["da", "en", "de"]
	 *           },
	 *           {
	 *              bundleUrl: "appvar2/i18n/i18n.properties",
	 *              supportedLocales: ["da", "de"]
	 *           }
	 *      ]
	 *  }).then(function(oResourceBundle){
	 *      // now you can access the bundle
	 *  });
	 *  // ...
	 * });
	 *
	 * @public
	 * @function
	 * @param {object} [mParams] Parameters used to initialize the resource bundle
	 * @param {string} [mParams.url=''] URL pointing to the base .properties file of a bundle (.properties
	 *     file without any locale information, e.g. "mybundle.properties")
	 *     if not provided, <code>bundleUrl</code> or <code>bundleName</code> can be used; if both are set,
	 *     <code>bundleName</code> wins
	 * @param {string} [mParams.bundleUrl] URL pointing to the base .properties file of a bundle
	 *     (.properties file without any locale information, e.g. "i18n/mybundle.properties")
	 * @param {string} [mParams.bundleName] UI5 module name in dot notation pointing to the base
	 *     .properties file of a bundle (.properties file without any locale information, e.g. "i18n.mybundle")
	 * @param {string} [mParams.locale] Optional locale (aka 'language tag') to load the texts for.
	 *     Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB" or "en").
	 *     Defaults to the current session locale if <code>sap.ui.getCore</code> is available, otherwise
	 *     to the provided <code>fallbackLocale</code>
	 * @param {boolean} [mParams.includeInfo=false] Whether to include origin information into the returned property values
	 * @param {string[]} [mParams.supportedLocales] List of supported locales (aka 'language tags') to restrict the fallback chain.
	 *     Each entry in the array can either be a BCP47 language tag or a JDK compatible locale string
	 *     (e.g. "en-GB", "en_GB" or "en"). An empty string (<code>""</code>) represents the 'raw' bundle.
	 *     <b>Note:</b> The given language tags can use modern or legacy ISO639 language codes. Whatever
	 *     language code is used in the list of supported locales will also be used when requesting a file
	 *     from the server. If the <code>locale</code> contains a legacy language code like "iw" and the
	 *     <code>supportedLocales</code> contains [...,"he",...], "he" will be used in the URL.
	 *     This mapping works in both directions.
	 * @param {string} [mParams.fallbackLocale="en"] A fallback locale to be used after all locales
	 *     derived from <code>locale</code> have been tried, but before the 'raw' bundle is used.
	 * 	   Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB"
	 *     or "en").
	 *     To prevent a generic fallback, use the empty string (<code>""</code>).
	 *     E.g. by providing <code>fallbackLocale: ""</code> and <code>supportedLocales: ["en"]</code>,
	 *     only the bundle "en" is requested without any fallback.
	 * @param {Object<string,module:sap/base/i18n/ResourceBundle.TerminologyConfiguration>} [mParams.terminologies] map of terminologies.
	 *     The key is the terminology identifier and the value is a ResourceBundle terminology configuration.
	 *     A terminology is a resource bundle configuration for a specific use case (e.g. "oil").
	 *     It does neither have a <code>fallbackLocale</code> nor can it be enhanced with <code>enhanceWith</code>.
	 * @param {string[]} [mParams.activeTerminologies] The list of active terminologies,
	 *     e.g. <code>["oil", "retail"]</code>. The order in this array represents the lookup order.
	 * @param {module:sap/base/i18n/ResourceBundle.Configuration[]} [mParams.enhanceWith] List of ResourceBundle configurations which enhance the current one.
	 *     The order of the enhancements is significant, because the lookup checks the last enhancement first.
	 *     Each enhancement represents a ResourceBundle with limited options ('bundleUrl', 'bundleName', 'terminologies', 'fallbackLocale', 'supportedLocales').
	 *     Note: supportedLocales and fallbackLocale are inherited from the parent ResourceBundle if not present.
	 * @param {boolean} [mParams.async=false] Whether the first bundle should be loaded asynchronously
	 *     Note: Fallback bundles loaded by {@link #getText} are always loaded synchronously.
	 *     <b>As of version 1.135, synchronous loading is deprecated.</b> The <code>async</code> parameter must have the value <code>true</code>.
	 * @returns {module:sap/base/i18n/ResourceBundle|Promise<module:sap/base/i18n/ResourceBundle>}
	 *     A new resource bundle or a Promise on that bundle (in asynchronous case)
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	ResourceBundle.create = function(mParams) {
		if (mParams?.async !== true) {
			future.warningThrows("sap/base/i18n/ResourceBundle.create: As of version 1.135, synchronous loading is deprecated. The 'async' parameter must have the value 'true'");
		}
		return createResourceBundle(mParams);
	};

	function createResourceBundle(mParams) {
		var mOriginalCreateParams = merge({}, mParams);

		mParams = merge({url: "", includeInfo: false}, mParams);

		// bundleUrl and bundleName parameters get converted into the url parameter if the url parameter is not present
		if (mParams.bundleUrl || mParams.bundleName) {
			mParams.url = mParams.url || ResourceBundle._getUrl(mParams.bundleUrl, mParams.bundleName);
		}

		// Hook implemented by sap/ui/core/Lib.js; adds missing terminology information from the library manifest, if available
		mParams = ResourceBundle._enrichBundleConfig(mParams);

		// Note: ResourceBundle constructor returns a Promise in async mode!
		var vResourceBundle = new ResourceBundle(mParams.url, mParams.locale, mParams.includeInfo, !!mParams.async, mParams.supportedLocales, mParams.fallbackLocale);

		// Pass the exact create factory parameters to allow the bundle to create a new instance via ResourceBundle#_recreate
		if (vResourceBundle instanceof Promise) {
			vResourceBundle = vResourceBundle.then(function(oResourceBundle) {
				oResourceBundle._mCreateFactoryParams = mOriginalCreateParams;
				return oResourceBundle;
			});
		} else {
			vResourceBundle._mCreateFactoryParams = mOriginalCreateParams;
		}

		// aCustomBundles is a flat list of all "enhancements"
		var aCustomBundles = [];
		// handle terminologies
		if (mParams.terminologies) {
			aCustomBundles = aCustomBundles.concat(getTerminologyResourceBundles(mParams.activeTerminologies, mParams.terminologies, mParams.locale, mParams.includeInfo, !!mParams.async));
		}
		// handle enhanceWith
		if (mParams.enhanceWith) {
			aCustomBundles = aCustomBundles.concat(getEnhanceWithResourceBundles(mParams.activeTerminologies, mParams.enhanceWith, mParams.locale, mParams.includeInfo, !!mParams.async, mParams.fallbackLocale, mParams.supportedLocales));
		}
		if (aCustomBundles.length) {
			if (vResourceBundle instanceof Promise) {
				vResourceBundle = vResourceBundle.then(function (oResourceBundle) {
					// load all resource bundles in parallel for a better performance
					// but do the enhancement one after the other to establish a stable lookup order
					return Promise.all(aCustomBundles).then(function (aCustomBundles) {
						aCustomBundles.forEach(oResourceBundle._enhance, oResourceBundle);
					}).then(function () {
						return oResourceBundle;
					});
				});
			} else {
				aCustomBundles.forEach(vResourceBundle._enhance, vResourceBundle);
			}
		}
		return vResourceBundle;
	}

	/**
	 * Private synchronous variant of {@link module:sap/base/i18n/ResourceBundle.create}.
	 *
	 * @param {object} mParams The configuration for ResourceBundle.create
	 * @returns {module:sap/base/i18n/ResourceBundle} A new resource bundle
	 * @private
	 * @ui5-restricted sap.ui.core.Lib, sap.ui.core.Manifest
	 */
	ResourceBundle._createSync = function(mParams) {
		mParams.async = false;
		return createResourceBundle(mParams);
	};

	/**
	 * Hook implemented by sap/ui/core/Lib to enrich bundle config with terminologies.
	 * See also the documentation of the hook's implementation in sap/ui/core/Lib.js.
	 *
	 * @see sap.ui.core.Lib.getResourceBundleFor
	 *
	 * @param {object} mParams the ResourceBundle.create bundle config
	 * @returns {object} the enriched bundle config
	 * @private
	 * @ui5-restricted sap.ui.core.Lib
	 */
	ResourceBundle._enrichBundleConfig = function(mParams) {
		// Note: the ResourceBundle is a base module, which might be used standalone without the Core,
		// so the bundle config must remain untouched
		return mParams;
	};

	// ---- handling of supported locales and fallback chain ------------------------------------------

	/**
	 * Determine sequence of fallback locales, starting from the given locale and
	 * optionally taking the list of supported locales into account.
	 *
	 * Callers can use the result to limit requests to a set of existing locales.
	 *
	 * @param {string} sLocale Locale to start the fallback sequence with, should be a BCP47 language tag
	 * @param {string[]} [aSupportedLocales] List of supported locales (in JDK legacy syntax, e.g. zh_CN, iw)
	 * @param {string} [sFallbackLocale] Last fallback locale, defaults to "en"
	 * @returns {string[]} Sequence of fallback locales in JDK legacy syntax, decreasing priority
	 *
	 * @private
	 * @ui5-restricted sap.fiori, sap.support launchpad
	 * @deprecated As of version 1.135. Use {@link sap.base.i18n.LanguageFallback.getFallbackLocales} instead.
	 */
	ResourceBundle._getFallbackLocales = LanguageFallback.getFallbackLocales;

	/**
	 * Gets the properties cache
	 *
	 * @returns {Map} The properties cache
	 * @private
	 */
	ResourceBundle._getPropertiesCache = function () {
		return oPropertiesCache._oCache;
	};

	return ResourceBundle;
});

/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/base/assert',
		'sap/base/Log',
		'sap/base/strings/formatMessage',
		'sap/base/util/Properties',
		'sap/base/util/merge'
	],
	function(assert, Log, formatMessage, Properties, merge) {
	"use strict";

	/* global Promise */

	/**
	 * A regular expression that describes language tags according to BCP-47.
	 * @see BCP47 "Tags for Identifying Languages" (http://www.ietf.org/rfc/bcp/bcp47.txt)
	 *
	 * The matching groups are
	 *  0=all
	 *  1=language (shortest ISO639 code + ext. language sub tags | 4digits (reserved) | registered language sub tags)
	 *  2=script (4 letters)
	 *  3=region (2letter language or 3 digits)
	 *  4=variants (separated by '-', Note: capturing group contains leading '-' to shorten the regex!)
	 *  5=extensions (including leading singleton, multiple extensions separated by '-')
	 *  6=private use section (including leading 'x', multiple sections separated by '-')
	 *
	 *              [-------------------- language ----------------------][--- script ---][------- region --------][------------- variants --------------][----------- extensions ------------][------ private use -------]
	 */
	var rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;

	/**
	 * Resource bundles are stored according to the Java Development Kit conventions.
	 * JDK uses old language names for a few ISO639 codes ("iw" for "he", "ji" for "yi", "in" for "id" and "sh" for "sr").
	 * Make sure to convert newer codes to older ones before creating file names.
	 * @const
	 * @private
	 */
	var M_ISO639_NEW_TO_OLD = {
		"he" : "iw",
		"yi" : "ji",
		"id" : "in",
		"sr" : "sh",
		"nb" : "no"
	};

	/**
	 * Inverse of M_ISO639_NEW_TO_OLD.
	 * @const
	 * @private
	 */
	var M_ISO639_OLD_TO_NEW = {
		"iw" : "he",
		"ji" : "yi",
		"in" : "id",
		"sh" : "sr",
		"no" : "nb"
	};

	/**
	 * HANA XS Engine can't handle private extensions in BCP47 language tags.
	 * Therefore, the agreed BCP47 codes for the technical languages 1Q and 2Q
	 * don't work as Accept-Header and need to be send as URL parameters as well.
	 * @const
	 * @private
	 */
	var M_SUPPORTABILITY_TO_XS = {
		"en_US_saptrc" : "1Q",
		"en_US_sappsd" : "2Q"
	};

	/**
	 * Default fallback locale is "en" (English) to stay backward compatible
	 * @const
	 * @private
	 */
	var sDefaultFallbackLocale = "en";

	var rSAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd)(?:-|$)/i;

	/**
	 * Helper to normalize the given locale (in BCP-47 syntax) to the java.util.Locale format.
	 *
	 * @param {string} sLocale Locale to normalize
	 * @param {boolean} [bPreserveLanguage=false] Whether to keep the language untouched, otherwise
	 *     the language is mapped from modern to legacy ISO639 codes, e.g. "sr" to "sh"
	 * @returns {string} Normalized locale or undefined if the locale can't be normalized
	 * @private
	 */
	function normalize(sLocale, bPreserveLanguage) {

		var m;
		if ( typeof sLocale === 'string' && (m = rLocale.exec(sLocale.replace(/_/g, '-'))) ) {
			var sLanguage = m[1].toLowerCase();
			if (!bPreserveLanguage) {
				sLanguage = M_ISO639_NEW_TO_OLD[sLanguage] || sLanguage;
			}
			var sScript = m[2] ? m[2].toLowerCase() : undefined;
			var sRegion = m[3] ? m[3].toUpperCase() : undefined;
			var sVariants = m[4] ? m[4].slice(1) : undefined;
			var sPrivate = m[6];
			// recognize and convert special SAP supportability locales (overwrites m[]!)
			if ( (sPrivate && (m = rSAPSupportabilityLocales.exec(sPrivate)))
				|| (sVariants && (m = rSAPSupportabilityLocales.exec(sVariants))) ) {
				return "en_US_" + m[1].toLowerCase(); // for now enforce en_US (agreed with SAP SLS)
			}
			// Chinese: when no region but a script is specified, use default region for each script
			if ( sLanguage === "zh" && !sRegion ) {
				if ( sScript === "hans" ) {
					sRegion = "CN";
				} else if ( sScript === "hant" ) {
					sRegion = "TW";
				}
			}
			return sLanguage + (sRegion ? "_" + sRegion + (sVariants ? "_" + sVariants.replace("-","_") : "") : "");
		}
	}

	/**
	 * Normalizes the given locale, unless it is an empty string (<code>""</code>).
	 *
	 * When locale is an empty string (<code>""</code>), it is returned without normalization.
	 * @see normalize
	 * @param {string} sLocale locale (aka 'language tag') to be normalized.
	 * 	   Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB" or "fr");
	 * @param {boolean} [bPreserveLanguage=false] whether to keep the language untouched, otherwise
	 *     the language is mapped from modern to legacy ISO639 codes, e.g. "sr" to "sh"
	 * @returns {string} normalized locale
	 * @throws {TypeError} Will throw an error if the locale is not a valid BCP47 language tag.
	 * @private
	 */
	function normalizePreserveEmpty(sLocale, bPreserveLanguage) {
		// empty string is valid and should not be normalized
		if (sLocale === "") {
			return sLocale;
		}
		var sNormalizedLocale = normalize(sLocale, bPreserveLanguage);
		if (sNormalizedLocale === undefined) {
			throw new TypeError("Locale '" + sLocale + "' is not a valid BCP47 language tag");
		}
		return sNormalizedLocale;
	}

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
		if (window.sap && window.sap.ui && sap.ui.getCore) {
			sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			sLocale = normalize(sLocale);
		}
		// last fallback is fallbackLocale if no or no valid locale is given
		return sLocale || sFallbackLocale;
	}

	/**
	 * Returns the supported locales from the configuration.
	 * @returns {string[]} supported locales from the configuration. Otherwise, an empty array is returned.
	 * @private
	 */
	function defaultSupportedLocales() {
		if (window.sap && window.sap.ui && sap.ui.getCore) {
			return sap.ui.getCore().getConfiguration().getSupportedLanguages();
		}
		return [];
	}



	/**
	 * Helper to normalize the given locale (java.util.Locale format) to the BCP-47 syntax.
	 *
	 * @param {string} sLocale locale to convert
	 * @returns {string} Normalized locale or undefined if the locale can't be normalized
	 */
	function convertLocaleToBCP47(sLocale) {
		var m;
		if ( typeof sLocale === 'string' && (m = rLocale.exec(sLocale.replace(/_/g, '-'))) ) {
			var sLanguage = m[1].toLowerCase();
			sLanguage = M_ISO639_OLD_TO_NEW[sLanguage] || sLanguage;
			return sLanguage + (m[3] ? "-" + m[3].toUpperCase() + (m[4] ? "-" + m[4].slice(1).replace("_","-") : "") : "");
		}
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
	function ResourceBundle(sUrl, sLocale, bIncludeInfo, bAsync, aSupportedLocales, sFallbackLocale){
		// locale to retrieve texts for (normalized)
		this.sLocale = normalize(sLocale) || defaultLocale(sFallbackLocale);
		this.oUrlInfo = splitUrl(sUrl);
		this.bIncludeInfo = bIncludeInfo;
		// list of custom bundles
		this.aCustomBundles = [];
		// declare list of property files that are loaded
		this.aPropertyFiles = [];
		this.aLocales = [];

		// list of calculated fallbackLocales
		// note: every locale which was loaded is removed from this list
		this._aFallbackLocales = calculateFallbackChain(
			this.sLocale,
			// bundle specific supported locales will be favored over configuration ones
			aSupportedLocales || defaultSupportedLocales(),
			sFallbackLocale,
			" of the bundle '" + this.oUrlInfo.url + "'"
		);

		// load the most specific, existing properties file
		if (bAsync) {
			var resolveWithThis = function() { return this; }.bind(this);
			return loadNextPropertiesAsync(this).then(resolveWithThis, resolveWithThis);
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
	 *
	 * @function
	 * @name module:sap/base/i18n/ResourceBundle.prototype._enhance
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
	 * {@link module:sap/base/i18n/ResourceBundle}. If no text could be found, the key itself is used as text.
	 *
	 * If the second parameter <code>aArgs</code> is given, then any placeholder of the form "{<i>n</i>}"
	 * (with <i>n</i> being an integer) is replaced by the corresponding value from <code>aArgs</code>
	 * with index <i>n</i>.  Note: This replacement is applied to the key if no text could be found.
	 * For more details on the replacement mechanism refer to {@link module:sap/base/strings/formatMessage}.
	 *
	 * @param {string} sKey Key to retrieve the text for
	 * @param {string[]} [aArgs] List of parameter values which should replace the placeholders "{<i>n</i>}"
	 *     (<i>n</i> is the index) in the found locale-specific string value. Note that the replacement is done
	 *     whenever <code>aArgs</code> is given, no matter whether the text contains placeholders or not
	 *     and no matter whether <code>aArgs</code> contains a value for <i>n</i> or not.
	 * @param {boolean} [bIgnoreKeyFallback=false] If set, <code>undefined</code> is returned instead of the key string, when the key is not found in any bundle or fallback bundle.
	 * @returns {string} The value belonging to the key, if found; otherwise the key itself or <code>undefined</code> depending on <code>bIgnoreKeyFallback</code>.
	 *
	 * @function
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

		assert(false, "could not find any translatable text for key '" + sKey + "' in bundle '" + this.oUrlInfo.url + "'");
		if (bIgnoreKeyFallback){
			return undefined;
		} else {
			return this._formatValue(sKey, sKey, aArgs);
		}
	};

	/**
	 * Enriches the input value with originInfo if <code>this.bIncludeInfo</code> is truthy.
	 * Uses args to format the message.
	 * @param {string} sValue the given input value
	 * @param {string} sKey the key within the bundle
	 * @param {array} [aArgs] arguments to format the message
	 * @returns {string} formatted string, <code>null</code> if sValue is not a string
	 * @private
	 */
	ResourceBundle.prototype._formatValue = function(sValue, sKey, aArgs){
		if (typeof sValue === "string") {
			if (aArgs) {
				sValue = formatMessage(sValue, aArgs);
			}

			if (this.bIncludeInfo) {
				/* eslint-disable no-new-wrappers */
				sValue = new String(sValue);
				/* eslint-enable no-new-wrappers */
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
	 * @returns {string} the formatted value if found, <code>null</code> otherwise
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
	 * @returns {string} the formatted value if found, <code>null</code> otherwise
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
	 * @returns {boolean} true if the text has been found in the concrete bundle
	 *
	 * @function
	 * @public
	 */
	ResourceBundle.prototype.hasText = function(sKey) {
		return this.aPropertyFiles.length > 0 && typeof this.aPropertyFiles[0].getProperty(sKey) === "string";
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
	 * @param {ResourceBundle} oBundle ResourceBundle to extend
	 * @param {boolean} [bAsync=false] Whether the resource should be loaded asynchronously
	 * @returns The newly loaded properties (sync mode) or a Promise on the properties (async mode);
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
					"Accept-Language": convertLocaleToBCP47(sLocale) || ""
				};
			} else {
				sUrl = oUrl.prefix + (sLocale ? "_" + sLocale : "") + oUrl.suffix;
			}

			var vProperties = Properties.create({
				url: sUrl,
				headers: mHeaders,
				async: !!bAsync,
				returnNullIfMissing: true
			});

			var addProperties = function(oProps) {
				if ( oProps ) {
					oBundle.aPropertyFiles.push(oProps);
					oBundle.aLocales.push(sLocale);
				}
				return oProps;
			};

			return bAsync ? vProperties.then( addProperties ) : addProperties( vProperties );

		}

		return bAsync ? Promise.resolve(null) : null;
	}

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
	 * @public
	 * @function
	 * @param {object} [mParams] Parameters used to initialize the resource bundle
	 * @param {string} [mParams.url=''] URL pointing to the base .properties file of a bundle (.properties
	 *     file without any locale information, e.g. "mybundle.properties")
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
	 *     from the server. If the <code>locale</code> contains a legacy language code like "sh" and the
	 *     <code>supportedLocales</code> contains [...,"sr",...], "sr" will be used in the URL.
	 *     This mapping works in both directions.
	 * @param {string} [mParams.fallbackLocale="en"] A fallback locale to be used after all locales
	 *     derived from <code>locale</code> have been tried, but before the 'raw' bundle is used.
	 * 	   Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB"
	 *     or "en"), defaults to "en" (English).
	 *     To prevent a generic fallback, use the empty string (<code>""</code>).
	 *     E.g. by providing <code>fallbackLocale: ""</code> and <code>supportedLocales: ["en"]</code>,
	 *     only the bundle "en" is requested without any fallback.
	 * @param {boolean} [mParams.async=false] Whether the first bundle should be loaded asynchronously
	 *     Note: Fallback bundles loaded by {@link #getText} are always loaded synchronously.
	 * @returns {module:sap/base/i18n/ResourceBundle|Promise} A new resource bundle or a Promise on that bundle (in asynchronous case)
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	ResourceBundle.create = function(mParams) {
		mParams = merge({url: "", includeInfo: false, fallbackLocale: sDefaultFallbackLocale}, mParams);
		// Note: ResourceBundle constructor returns a Promise in async mode!
		return new ResourceBundle(mParams.url, mParams.locale, mParams.includeInfo, !!mParams.async, mParams.supportedLocales, mParams.fallbackLocale);
	};


	// ---- handling of supported locales and fallback chain ------------------------------------------

	/**
	 * Check if the given locale is contained in the given list of supported locales.
	 *
	 * If no list is given or if it is empty, any locale is assumed to be supported and
	 * the given locale is returned without modification.
	 *
	 * When the list contains the given locale, the locale is also returned without modification.
	 *
	 * If an alternative code for the language code part of the locale exists (e.g a modern code
	 * if the language is a legacy code, or a legacy code if the language is a modern code), then
	 * the language code is replaced by the alternative code. If the resulting alternative locale
	 * is contained in the list, the alternative locale is returned.
	 *
	 * If there is no match, <code>undefined</code> is returned.
	 * @param {string} sLocale Locale, using legacy ISO639 language code, e.g. sh_RS
	 * @param {string[]} aSupportedLocales List of supported locales, e.g. ["sr_RS"]
	 * @returns {string} The match in the supportedLocales (using either modern or legacy ISO639 language codes),
	 *   e.g. "sr_RS"; <code>undefined</code> if not matched
	 */
	function findSupportedLocale(sLocale, aSupportedLocales) {

		// if supportedLocales array is empty or undefined or if it contains the given locale,
		// return that locale (with a legacy ISO639 language code)
		if (!aSupportedLocales || aSupportedLocales.length === 0 || aSupportedLocales.indexOf(sLocale) >= 0) {
			return sLocale;
		}

		// determine an alternative locale, using a modern ISO639 language code
		// (converts "sh_RS" to "sr-RS")
		sLocale = convertLocaleToBCP47(sLocale);
		if (sLocale) {
			// normalize it to JDK syntax for easier comparison
			// (converts "sr-RS" to "sr_RS" - using an underscore ("_") between the segments)
			sLocale = normalize(sLocale, true);
		}
		if (aSupportedLocales.indexOf(sLocale) >= 0) {
			// return the alternative locale (with a modern ISO639 language code)
			return sLocale;
		}
		return undefined;
	}

	/**
	 * Determines the sequence of fallback locales, starting from the given locale.
	 *
	 * The fallback chain starts with the given <code>sLocale</code> itself. If this locale
	 * has multiple segments (region, variant), further entries are added to the fallback
	 * chain, each one omitting the last (rightmost) segment of its predecessor, making the
	 * new locale entry less specific than the previous one (e.g. "de" after "de_CH").
	 *
	 * If <code>sFallbackLocale</code> is given, it will be added to the fallback chain next.
	 * If it consists of multiple segments, multiple locales will be added, each less specific
	 * than the previous one. If <code>sFallbackLocale</code> is omitted or <code>undefined</code>,
	 * "en" (English) will be added instead. If <code>sFallbackLocale</code> is the empty string
	 * (""), no generic fallback will be added.
	 *
	 * Last but not least, the 'raw' locale will be added, represented by the empty string ("").
	 *
	 * The returned list will contain no duplicates and all entries will be in normalized JDK file suffix
	 * format (using an underscore ("_") as separator, a lowercase language and an uppercase region
	 * (if any)).
	 *
	 * If <code>aSupportedLocales</code> is provided and not empty, only locales contained
	 * in that array will be added to the result. This allows to limit the backend requests
	 * to a certain set of files (e.g. those that are known to exist).
	 *
	 * @param {string} sLocale Locale to start the fallback sequence with, must be normalized already
	 * @param {string[]} [aSupportedLocales] List of supported locales (either BCP47 or JDK legacy syntax, e.g. zh_CN, iw)
	 * @param {string} [sFallbackLocale="en"] Last fallback locale
	 * @param {string} [sContextInfo] Describes the context in which this function is called, only used for logging
	 * @returns {string[]} Sequence of fallback locales in JDK legacy syntax, decreasing priority
	 *
	 * @private
	 */
	function calculateFallbackChain(sLocale, aSupportedLocales, sFallbackLocale, sContextInfo) {
		// Defines which locales are supported (BCP47 language tags or JDK locale format using underscores).
		// Normalization of the case and of the separator char simplifies later comparison, but the language
		// part is not converted to a legacy ISO639 code, in order to enable the support of modern codes as well.
		aSupportedLocales = aSupportedLocales && aSupportedLocales.map(function (sSupportedLocale) {
			return normalizePreserveEmpty(sSupportedLocale, true);
		});
		// normalize the fallback locale for sanitizing it and converting the language part to legacy ISO639
		// because it is like the locale part of the fallback chain
		sFallbackLocale = sFallbackLocale === undefined ? sDefaultFallbackLocale : sFallbackLocale;
		sFallbackLocale = normalizePreserveEmpty(sFallbackLocale);

		// An empty fallback locale ("") is valid and means that a generic fallback should not be loaded.
		// The supportedLocales must contain the fallbackLocale, or else it will be ignored.
		if (sFallbackLocale !== "" && !findSupportedLocale(sFallbackLocale, aSupportedLocales)) {
			Log.error("The fallback locale '" + sFallbackLocale + "' is not contained in the list of supported locales ['"
				+ aSupportedLocales.join("', '") + "']" + sContextInfo + " and will be ignored.");
		}

		// Calculate the list of fallback locales, starting with the given locale.
		//
		// Note: always keep this in sync with the fallback mechanism in Java, ABAP (MIME & BSP)
		// resource handler (Java: Peter M., MIME: Sebastian A., BSP: Silke A.)


		// fallback logic:
		// locale with region -> locale language -> fallback with region -> fallback language -> raw
		// note: if no region is present, it is skipped

		// Sample fallback chains:
		//  "de_CH" -> "de" -> "de_DE" -> "de" -> ""  // locale 'de_CH', fallbackLocale 'de_DE'
		//  "de_CH" -> "de" -> "en_US" -> "en" -> ""  // locale 'de_CH', fallbackLocale 'en_US'
		//  "en_GB" -> "en"                    -> ""  // locale 'en_GB', fallbackLocale 'en'

		// fallback calculation
		var aLocales = [],
			sSupportedLocale;

		while ( sLocale != null ) {

			// check whether sLocale is supported, potentially using an alternative language code
			sSupportedLocale = findSupportedLocale(sLocale, aSupportedLocales);

			// only push if it is supported and is not already contained (avoid duplicates)
			if ( sSupportedLocale !== undefined && aLocales.indexOf(sSupportedLocale) === -1) {
				aLocales.push(sSupportedLocale);
			}

			// calculate next one

			if (!sLocale) {
				// there is no fallback for the 'raw' locale or for null/undefined
				sLocale = null;
			} else if (sLocale === "zh_HK") {
				// special (legacy) handling for zh_HK:
				// try zh_TW (for "Traditional Chinese") first before falling back to 'zh'
				sLocale = "zh_TW";
			} else if (sLocale.lastIndexOf('_') >= 0) {
				// if sLocale contains more then one segment (region, variant), remove the last one
				sLocale = sLocale.slice(0, sLocale.lastIndexOf('_'));
			} else if (sFallbackLocale) {
				// if there's a fallbackLocale, add it first before the 'raw' locale
				sLocale = sFallbackLocale;
				sFallbackLocale = null; // no more fallback in the next round
			} else {
				// last fallback to raw bundle
				sLocale = "";
			}
		}

		return aLocales;
	}

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
	 */
	ResourceBundle._getFallbackLocales = function(sLocale, aSupportedLocales, sFallbackLocale) {
		return calculateFallbackChain(
			normalize(sLocale),
			aSupportedLocales,
			sFallbackLocale,
			/* no context info */ ""
		);
	};

	return ResourceBundle;
});
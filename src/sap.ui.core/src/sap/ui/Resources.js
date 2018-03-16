/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
		'sap/base/assert',
		'sap/base/log',
		'sap/base/strings/formatMessage',
		'sap/base/util/extend',
		'sap/ui/Properties'
	],
	function(assert, log, formatMessage, extend, Properties) {
	"use strict";

	/* global Promise */

	// Javadoc for private inner class "Bundle" - this list of comments is intentional!
	/**
	 * @interface Contains locale-specific texts.
	 *
	 * If you need a locale-specific text within your application, you can use the
	 * resource bundle to load the locale-specific file from the server and access
	 * the texts of it.
	 *
	 * Use {@link sap/ui/Resources} to create an instance of sap/ui/Resources/Bundle
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
	 * does not contain a text for the given key, a sequence of fall back locales is tried one by one.
	 * First, if the locale contains a region information (fr_FR), then the locale without the region is
	 * tried (fr). If that also can't be found or doesn't contain the requested text, the English file
	 * is used (en - assuming that most development projects contain at least English texts).
	 * If that also fails, the file without locale (base URL of the bundle) is tried.
	 *
	 * If none of the requested files can be found or none of them contains a text for the given key,
	 * then the key itself is returned as text.
	 *
	 * Exception: Fallback for "zh_HK" is "zh_TW" before zh.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @name sap/ui/Resources/Bundle
	 * @private
	 */

	/**
	 * Returns a locale-specific string value for the given key sKey.
	 *
	 * The text is searched in this resource bundle according to the fallback chain described in
	 * {@link sap/ui/Resources/Bundle}. If no text could be found, the key itself is used as text.
	 *
	 * If the second parameter<code>aArgs</code> is given, then any placeholder of the form "{<i>n</i>}"
	 * (with <i>n</i> being an integer) is replaced by the corresponding value from <code>aArgs</code>
	 * with index <i>n</i>.  Note: This replacement is applied to the key if no text could be found.
	 * For more details on the replacement mechanism refer to {@link sap/ui/formatMessage}.
	 *
	 * @param {string} sKey Key to retrieve the text for
	 * @param {string[]} [aArgs] List of parameter values which should replace the placeholders "{<i>n</i>}"
	 *     (<i>n</i> is the index) in the found locale-specific string value. Note that the replacement is done
	 *     whenever <code>aArgs</code> is given, no matter whether the text contains placeholders or not
	 *     and no matter whether <code>aArgs</code> contains a value for <i>n</i> or not.
	 * @returns {string} The value belonging to the key, if found; otherwise the key itself.
	 *
	 * @function
	 * @name sap/ui/Resources/Bundle.prototype.getText
	 * @private
	 */

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
	 * @name sap/ui/Resources/Bundle.prototype.hasText
	 * @private
	 */

	/**
	 * Enhances the resource bundle with a custom resource bundle. The bundle
	 * can be enhanced with multiple resource bundles. The last enhanced resource
	 * bundle wins against the previous ones and the original ones. This function
	 * can be called several times.
	 *
	 * @param {sap/ui/Resources/Bundle} oBundle an instance of a <code>sap/ui/Resources/Bundle</code>
	 * @private
	 *
	 * @function
	 * @name sap/ui/Resources/Bundle.prototype._enhance
	 */

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
		"sr" : "sh"
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
		"sh" : "sr"
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

	var rSAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd)(?:-|$)/i;

	/**
	 * Helper to normalize the given locale (in BCP-47 syntax) to the java.util.Locale format.
	 * @param {string} sLocale locale to normalize
	 * @returns {string} Normalized locale or undefined if the locale can't be normalized
	 */
	function normalize(sLocale) {
		var m;
		if ( typeof sLocale === 'string' && (m = rLocale.exec(sLocale.replace(/_/g, '-'))) ) {
			var sLanguage = m[1].toLowerCase();
			sLanguage = M_ISO639_NEW_TO_OLD[sLanguage] || sLanguage;
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
	 * Returns the default locale (the locale defined in UI5 configuration if available, else "en")
	 * @returns {string} The default locale
	 */
	function defaultLocale() {
		var sLocale;
		// use the current session locale, if available
		if (window.sap && window.sap.ui && sap.ui.getCore) {
			sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			sLocale = normalize(sLocale);
		}
		// last fallback is english if no or no valid locale is given
		return sLocale || "en";
	}

	/**
	 * Calculate the next fallback locale for the given locale.
	 *
	 * Note: always keep this in sync with the fallback mechanism in Java, ABAP (MIME & BSP)
	 * resource handler (Java: Peter M., MIME: Sebastian A., BSP: Silke A.)
	 * @param {string} sLocale Locale string in Java format (underscores) or null
	 * @returns {string|null} Next fallback Locale or null if there is no more fallback
	 * @private
	 */
	function nextFallbackLocale(sLocale) {

		// there is no fallback for the 'raw' locale or for null/undefined
		if ( !sLocale ) {
			return null;
		}

		// special (legacy) handling for zh_HK: try zh_TW (for Traditional Chinese) first before falling back to 'zh'
		if ( sLocale === "zh_HK" ) {
			return "zh_TW";
		}

		// if there are multiple segments (separated by underscores), remove the last one
		var p = sLocale.lastIndexOf('_');
		if ( p >= 0 ) {
			return sLocale.slice(0,p);
		}
		// invariant: only a single segment, must be a language

		// for any language but 'en', fallback to 'en' first before falling back to the 'raw' language (empty string)
		return sLocale !== 'en' ? 'en' : '';
	}

	/**
	 * Helper to normalize the given locale (java.util.Locale format) to the BCP-47 syntax.
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

	/*
	 * Implements sap/ui/Resources/Bundle
	 */
	function Bundle(sUrl, sLocale, bIncludeInfo, bAsync){
		this.sLocale = this._sNextLocale = normalize(sLocale) || defaultLocale();
		this.oUrlInfo = splitUrl(sUrl);
		this.bIncludeInfo = bIncludeInfo;
		// list of custom bundles
		this.aCustomBundles = [];
		// declare list of property files that are loaded
		this.aPropertyFiles = [];
		this.aLocales = [];
		// load the most specific, existing properties file
		if (bAsync) {
			var resolveWithThis = function() { return this; }.bind(this);
			return loadNextPropertiesAsync(this).then(resolveWithThis, resolveWithThis);
		}
		loadNextPropertiesSync(this);
	}

	/*
	 * Implements sap/ui/Resources/Bundle.prototype._enhance
	 */
	Bundle.prototype._enhance = function(oCustomBundle) {
		if (oCustomBundle instanceof Bundle) {
			this.aCustomBundles.push(oCustomBundle);
		} else {
			// we report the error but do not break the execution
			log.error("Custom resource bundle is either undefined or not an instanceof sap/ui/Resources/Bundle. Therefore this custom resource bundle will be ignored!");
		}
	};

	/*
	 * Implements sap/ui/Resources/Bundle.prototype.getText
	 */
	Bundle.prototype.getText = function(sKey, aArgs, bCustomBundle){
		var sValue = null,
			i;

		// loop over the custom bundles before resolving this one
		// lookup the custom resource bundles (last one first!)
		for (i = this.aCustomBundles.length - 1; i >= 0; i--) {
			sValue = this.aCustomBundles[i].getText(sKey, aArgs, true /* bCustomBundle */);
			// value found - so return it!
			if (sValue != null) {
				return sValue; // found!
			}
		}

		// loop over all loaded property files and return the value for the key if any
		for (i = 0; i < this.aPropertyFiles.length; i++) {
			sValue = this.aPropertyFiles[i].getProperty(sKey);
			if (typeof sValue === "string") {
				break;
			}
		}

		// value for this key was not found in the currently loaded property files,
		// load the fallback locales
		while ( typeof sValue !== "string" && this._sNextLocale != null ) {

			var oProperties = loadNextPropertiesSync(this);

			// check whether the key is included in the newly loaded property file
			if ( oProperties ) {
				sValue = oProperties.getProperty(sKey);
			}

		}

		if (!bCustomBundle && typeof sValue !== "string") {
			assert(false, "could not find any translatable text for key '" + sKey + "' in bundle '" + this.oUrlInfo.url + "'");
			sValue = sKey;
		}

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

	// checks the existence of the text in the concrete properties file
	Bundle.prototype.hasText = function(sKey) {
		return this.aPropertyFiles.length > 0 && typeof this.aPropertyFiles[0].getProperty(sKey) === "string";
	};

	/*
	 * Tries to load properties files asynchronously until one could be loaded
	 * successfully or until there are no more fallback locales.
	 */
	function loadNextPropertiesAsync(oBundle) {
		if ( oBundle._sNextLocale != null ) {
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
		while ( oBundle._sNextLocale != null ) {
			var oProps = tryToLoadNextProperties(oBundle, false);
			if ( oProps ) {
				return oProps;
			}
		}
		return null;
	}

	/*
	 * Checks whether the given locale is supported by checking it
	 * against an array of supported locales.
	 * If the array is not given or is empty, any locale is supported.
	 */
	function isSupported(sLocale, aSupportedLocales) {
		return !aSupportedLocales || aSupportedLocales.length === 0 || aSupportedLocales.indexOf(sLocale) >= 0;
	}

	/*
	 * Tries to load the properties file for the next fallback locale.
	 *
	 * If there is no further fallback locale or when requests for the next fallback locale are
	 * suppressed by configuration or when the file cannot be loaded, <code>null</code> is returned.
	 *
	 * @param {Bundle} oBundle Resource bundle to extend
	 * @param {boolean} [bAsync=false] Whether the resource should be loaded asynchronously
	 * @returns The newly loaded properties (sync mode) or a Promise on the properties (async mode);
	 *         value / Promise fulfillment will be <code>null</code> when the properties for the
	 *         next fallback locale should not be loaded or when loading failed or when there
	 *         was no more fallback locale
	 * @private
	 */
	function tryToLoadNextProperties(oBundle, bAsync) {

		// get the next fallback locale and calculate the next but one locale
		var sLocale = oBundle._sNextLocale;
		oBundle._sNextLocale = nextFallbackLocale(sLocale);

		var aSupportedLanguages = window.sap && window.sap.ui && sap.ui.getCore && sap.ui.getCore().getConfiguration().getSupportedLanguages();

		if ( sLocale != null && isSupported(sLocale, aSupportedLanguages) ) {

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

			var vProperties = Properties({
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
	 * Creates and returns a new instance of {@link sap/ui/Resources/Bundle}
	 * using the given URL and locale to determine what to load.
	 *
	 * @private
	 * @function
	 * @param {object} [mParams] Parameters used to initialize the resource bundle
	 * @param {string} [mParams.url=''] URL pointing to the base .properties file of a bundle (.properties file without any locale information, e.g. "mybundle.properties")
	 * @param {string} [mParams.locale] Optional language (aka 'locale') to load the texts for.
	 *     Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB" or "fr");
	 *     Defaults to the current session locale if <code>sap.ui.getCore</code> is available, otherwise to 'en'
	 * @param {boolean} [mParams.includeInfo=false] Whether to include origin information into the returned property values
	 * @param {boolean} [mParams.async=false] Whether the first bundle should be loaded asynchronously
	 *     Note: Fallback bundles loaded by {@link #getText} are always loaded synchronously.
	 * @returns {sap/ui/Resources/Bundle|Promise} A new resource bundle or a Promise on that bundle (in asynchronous case)
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	var fnResources = function resources(mParams) {
		mParams = extend({url: "", locale: undefined, includeInfo: false}, mParams);
		// Note: Bundle constructor returns a Promise in async mode!
		return new Bundle(mParams.url, mParams.locale, mParams.includeInfo, !!mParams.async);
	};

	/**
	 * Checks if the given object is an instance of {@link sap/ui/Resources/Bundle}
	 *
	 * @function
	 * @param {sap/ui/Resources/Bundle} oBundle object to check
	 * @returns {boolean} true, if the object is a {@link sap/ui/Resources/Bundle}
	 * @private
	 */
	fnResources.isBundle = function(oBundle) {
		return oBundle instanceof Bundle;
	};

	/**
	 * Determine sequence of fallback locales, starting from the given locale and
	 * optionally taking the list of supported locales into account.
	 *
	 * Callers can use the result to limit requests to a set of existing locales.
	 *
	 * @param {string} sLocale Locale to start the fallback sequence with, should be a BCP47 language tag
	 * @param {string[]} [aSupportedLocales] List of supported locales (in JDK legacy syntax, e.g. zh_CN, iw)
	 * @returns {string[]} Sequence of fallback locales in JDK legacy syntax, decreasing priority
	 *
	 * @private
	 * @ui5-restricted sap.fiori, sap.support launchpad
	 */
	fnResources._getFallbackLocales = function(sLocale, aSupportedLocales) {
		var sTempLocale = normalize(sLocale),
			aLocales = [];

		while ( sTempLocale != null ) {
			if ( isSupported(sTempLocale, aSupportedLocales) ) {
				aLocales.push(sTempLocale);
			}
			sTempLocale = nextFallbackLocale(sTempLocale);
		}

		return aLocales;
	};

	return fnResources;
});
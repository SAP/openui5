/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log"
], function(Log) {

	"use strict";

	const rSAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd|saprigi)(?:-|$)/i;

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
	const rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;

	/**
	 * Resource bundles are stored according to the Java Development Kit conventions.
	 * JDK uses old language names for a few ISO639 codes ("iw" for "he", "ji" for "yi" and "no" for "nb").
	 * This mapping determines the appropriate language suffix for SAP translations when resolving a locale in a ResourceBundle.
	 * @private
	 */
	const M_LOCALE_TO_SAP_LANG = {
		"he" : "iw",
		"yi" : "ji",
		"nb" : "no"
	};

	/**
	 * This mapping converts the old ISO639 codes into the corresponding language code used by ABAP systems,
	 * particularly for processing the Accept-Language header
	 * @private
	 */
	const M_ISO639_OLD_TO_NEW = {
		"iw" : "he",
		"ji" : "yi"
	};

	 /**
	 * Helper to normalize the given locale (in BCP-47 syntax) to the java.util.Locale format.
	 *
	 * @param {string} sLocale Locale to normalize
	 * @param {boolean} [bPreserveLanguage=false] Whether to keep the language untouched, otherwise
	 *     the language is mapped from modern to legacy ISO639 codes, e.g. "he" to "iw"
	 * @returns {string|undefined} Normalized locale or <code>undefined</code> if the locale can't be normalized
	 * @private
	 */
	const normalize = function(sLocale, bPreserveLanguage) {

		var m;
		if ( typeof sLocale === 'string' && (m = rLocale.exec(sLocale.replace(/_/g, '-'))) ) {
			var sLanguage = m[1].toLowerCase();
			if (!bPreserveLanguage) {
				sLanguage = M_LOCALE_TO_SAP_LANG[sLanguage] || sLanguage;
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
			if (sLanguage === "sr" && sScript === "latn") {
				if (bPreserveLanguage) {
					sLanguage = "sr_Latn";
				} else {
					sLanguage = "sh";
				}
			}
			return sLanguage + (sRegion ? "_" + sRegion + (sVariants ? "_" + sVariants.replace("-","_") : "") : "");
		}
	};

	/**
	 * Normalizes the given locale, unless it is an empty string (<code>""</code>).
	 *
	 * When locale is an empty string (<code>""</code>), it is returned without normalization.
	 * @see normalize
	 * @param {string} sLocale locale (aka 'language tag') to be normalized.
	 * 	   Can either be a BCP47 language tag or a JDK compatible locale string (e.g. "en-GB", "en_GB" or "fr");
	 * @param {boolean} [bPreserveLanguage=false] whether to keep the language untouched, otherwise
	 *     the language is mapped from modern to legacy ISO639 codes, e.g. "he" to "iw"
	 * @returns {string} normalized locale
	 * @throws {TypeError} Will throw an error if the locale is not a valid BCP47 language tag.
	 * @private
	 */
	const normalizePreserveEmpty = function(sLocale, bPreserveLanguage) {
		// empty string is valid and should not be normalized
		if (sLocale === "") {
			return sLocale;
		}
		var sNormalizedLocale = normalize(sLocale, bPreserveLanguage);
		if (sNormalizedLocale === undefined) {
			throw new TypeError("Locale '" + sLocale + "' is not a valid BCP47 language tag");
		}
		return sNormalizedLocale;
	};

	/**
	 * Helper to normalize the given locale (java.util.Locale format) to the BCP-47 syntax.
	 *
	 * @param {string} sLocale locale to convert
	 * @param {boolean} bConvertToModern whether to convert to modern language
	 * @returns {string|undefined} Normalized locale or <code>undefined</code> if the locale can't be normalized
	 */
	const convertLocaleToBCP47 = function(sLocale, bConvertToModern) {
		var m;
		if ( typeof sLocale === 'string' && (m = rLocale.exec(sLocale.replace(/_/g, '-'))) ) {
			var sLanguage = m[1].toLowerCase();
			var sScript = m[2] ? m[2].toLowerCase() : undefined;
			// special case for "sr_Latn" language: "sh" should then be used
			if (bConvertToModern && sLanguage === "sh" && !sScript) {
				sLanguage = "sr_Latn";
			} else if (!bConvertToModern && sLanguage === "sr" && sScript === "latn") {
				sLanguage = "sh";
			}
			sLanguage = M_ISO639_OLD_TO_NEW[sLanguage] || sLanguage;
			return sLanguage + (m[3] ? "-" + m[3].toUpperCase() + (m[4] ? "-" + m[4].slice(1).replace("_","-") : "") : "");
		}
	};

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
	 * @param {string} sLocale Locale, using legacy ISO639 language code, e.g. iw_IL
	 * @param {string[]} aSupportedLocales List of supported locales, e.g. ["he_IL"]
	 * @returns {string} The match in the supportedLocales (using either modern or legacy ISO639 language codes),
	 *   e.g. "he_IL"; <code>undefined</code> if not matched
	 */
	const findSupportedLocale = function(sLocale, aSupportedLocales) {

		// if supportedLocales array is empty or undefined or if it contains the given locale,
		// return that locale (with a legacy ISO639 language code)
		if (!aSupportedLocales || aSupportedLocales.length === 0 || aSupportedLocales.includes(sLocale)) {
			return sLocale;
		}

		// determine an alternative locale, using a modern ISO639 language code
		// (converts "iw_IL" to "he-IL")
		sLocale = convertLocaleToBCP47(sLocale, true);
		if (sLocale) {
			// normalize it to JDK syntax for easier comparison
			// (converts "he-IL" to "he_IL" - using an underscore ("_") between the segments)
			sLocale = normalize(sLocale, true);
		}
		if (aSupportedLocales.includes(sLocale)) {
			// return the alternative locale (with a modern ISO639 language code)
			return sLocale;
		}
		return undefined;
	};

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
	 * @param {string} [sFallbackLocale="en"] Last fallback locale; is ignored when <code>bSkipFallbackLocaleAndRaw</code> is <code>true</code>
	 * @param {string} [sContextInfo] Describes the context in which this function is called, only used for logging
	 * @param {boolean} [bSkipFallbackLocaleAndRaw=false] Whether to skip fallbackLocale and raw bundle
	 * @returns {string[]} Sequence of fallback locales in JDK legacy syntax, decreasing priority
	 *
	 * @private
	 */
	const calculateFallbackChain = function(sLocale, aSupportedLocales, sFallbackLocale, sContextInfo, bSkipFallbackLocaleAndRaw) {
		// Defines which locales are supported (BCP47 language tags or JDK locale format using underscores).
		// Normalization of the case and of the separator char simplifies later comparison, but the language
		// part is not converted to a legacy ISO639 code, in order to enable the support of modern codes as well.
		aSupportedLocales = aSupportedLocales && aSupportedLocales.map(function (sSupportedLocale) {
			return normalizePreserveEmpty(sSupportedLocale, true);
		});
		if (!bSkipFallbackLocaleAndRaw) {
			// normalize the fallback locale for sanitizing it and converting the language part to legacy ISO639
			// because it is like the locale part of the fallback chain
			var bFallbackLocaleDefined = sFallbackLocale !== undefined;
			sFallbackLocale = bFallbackLocaleDefined ? sFallbackLocale : "en";
			sFallbackLocale = normalizePreserveEmpty(sFallbackLocale);

			// An empty fallback locale ("") is valid and means that a generic fallback should not be loaded.
			// The supportedLocales must contain the fallbackLocale, or else it will be ignored.
			if (sFallbackLocale !== "" && !findSupportedLocale(sFallbackLocale, aSupportedLocales)) {
				var sMessage = "The fallback locale '" + sFallbackLocale + "' is not contained in the list of supported locales ['"
					+ aSupportedLocales.join("', '") + "']" + sContextInfo + " and will be ignored.";
				// configuration error should be thrown if an invalid configuration has been provided
				if (bFallbackLocaleDefined) {
					throw new Error(sMessage);
				}
				Log.error(sMessage);
			}
		}

		// Calculate the list of fallback locales, starting with the given locale.
		//
		// Note: always keep this in sync with the fallback mechanism in Java, ABAP (MIME & BSP)
		// resource handler (Java: Peter M., MIME: Sebastian A., BSP: Silke A.)


		// fallback logic:
		// locale with region -> locale language -> fallback with region -> fallback language -> raw
		// note: if no region is present, it is skipped

		// Sample fallback chains:
		//  "de_CH" -> "de" -> "en_US" -> "en" -> ""  // locale 'de_CH', fallbackLocale 'en_US'
		//  "de_CH" -> "de" -> "de_DE" -> "de" -> ""  // locale 'de_CH', fallbackLocale 'de_DE'
		//  "en_GB" -> "en"                    -> ""  // locale 'en_GB', fallbackLocale 'en'

		// note: the resulting list does neither contain any duplicates nor unsupported locales

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
				// if sLocale contains more than one segment (region, variant), remove the last one
				sLocale = sLocale.slice(0, sLocale.lastIndexOf('_'));
			} else if (bSkipFallbackLocaleAndRaw) {
				// skip fallbackLocale and raw bundle
				sLocale = null;
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
	};


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
	const getFallbackLocales = function(sLocale, aSupportedLocales, sFallbackLocale) {
		return calculateFallbackChain(
			normalize(sLocale),
			aSupportedLocales,
			sFallbackLocale,
			/* no context info */ ""
		);
	};

	/**
	 * Helper module for locale-related functions, including normalization, conversion, and fallback calculations.
	 *
	 * @returns {Object} An object containing the helper functions
	 *
	 * @private
	 * @ui5-restricted sap.ui.core, sap.fiori, sap.support launchpad
	 */
	return {
		convertLocaleToBCP47: convertLocaleToBCP47,
		calculate: calculateFallbackChain,
		getFallbackLocales: getFallbackLocales,
		normalize: normalize
	};
});
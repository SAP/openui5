/*!
 * ${copyright}
 */

//Provides the locale object sap.ui.core.Locale
sap.ui.define(['sap/ui/base/Object', 'sap/base/assert', './CalendarType'],
	function(BaseObject, assert, CalendarType) {
	"use strict";




		/**
		 * A regular expression that describes language tags according to BCP-47.
		 * @see BCP47 "Tags for Identifying Languages" (http://www.ietf.org/rfc/bcp/bcp47.txt)
		 *
		 * The matching groups are
		 *  0=all
		 *  1=language (shortest ISO639 code + ext. language sub tags | 4digits (reserved) | registered language sub tags)
		 *  2=script (4 letters)
		 *  3=region (2 letter language or 3 digits)
		 *  4=variants (separated by '-', Note: capturing group contains leading '-' to shorten the regex!)
		 *  5=extensions (including leading singleton, multiple extensions separated by '-'.Note: capturing group contains leading '-' to shorten the regex!)
		 *  6=private use section (including leading 'x', multiple sections separated by '-')
		 *
		 *              [-------------------- language ----------------------][--- script ---][------- region --------][------------- variants --------------][----------- extensions ------------][------ private use -------]
		 */
		var rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;

		/**
		 * Creates an instance of the Locale.
		 *
		 * @class Locale represents a locale setting, consisting of a language, script, region, variants, extensions and private use section.
		 *
		 * @param {string} sLocaleId the locale identifier, in format en-US or en_US.
		 *
		 * @extends sap.ui.base.Object
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @alias sap.ui.core.Locale
		 */
		var Locale = BaseObject.extend("sap.ui.core.Locale", /** @lends sap.ui.core.Locale.prototype */ {

			constructor : function(sLocaleId) {
				BaseObject.apply(this);
				var aResult = rLocale.exec(sLocaleId.replace(/_/g, "-"));
				// If the given Locale string cannot be parsed by the regular expression above,
				// we should at least tell the developer why the Core fails to load.
				if (aResult === null ) {
					throw new TypeError("The given language '" + sLocaleId + "' does not adhere to BCP-47.");
				}

				this.sLocaleId = sLocaleId;
				this.sLanguage = aResult[1] || null;
				this.sScript = aResult[2] || null;
				this.sRegion = aResult[3] || null;
				this.sVariant = (aResult[4] && aResult[4].slice(1)) || null; // remove leading dash from capturing group
				this.sExtension = (aResult[5] && aResult[5].slice(1)) || null; // remove leading dash from capturing group
				this.sPrivateUse = aResult[6] || null;

				// convert subtags according to the BCP47 recommendations
				// - language: all lower case
				// - script: lower case with the first letter capitalized
				// - region: all upper case
				if ( this.sLanguage ) {
					this.sLanguage = this.sLanguage.toLowerCase();
				}
				if ( this.sScript ) {
					this.sScript = this.sScript.toLowerCase().replace(/^[a-z]/, function($) {
						return $.toUpperCase();
					});
				}
				if ( this.sRegion ) {
					this.sRegion = this.sRegion.toUpperCase();
				}
			},

			/**
			 * Get the locale language.
			 *
			 * Note that the case might differ from the original script tag
			 * (Lower case is enforced as recommended by BCP47/ISO639).
			 *
			 * @return {string} the language code
			 * @public
			 */
			getLanguage : function() {
				return this.sLanguage;
			},

			/**
			 * Get the locale script or <code>null</code> if none was specified.
			 *
			 * Note that the case might differ from the original language tag
			 * (Upper case first letter and lower case reminder enforced as
			 * recommended by BCP47/ISO15924)
			 *
			 * @returns {string|null} the script code or <code>null</code>
			 * @public
			 */
			getScript : function() {
				return this.sScript;
			},

			/**
			 * Get the locale region or <code>null</code> if none was specified.
			 *
			 * Note that the case might differ from the original script tag
			 * (Upper case is enforced as recommended by BCP47/ISO3166-1).
			 *
			 * @return {string} the ISO3166-1 region code (2-letter or 3-digits)
			 * @public
			 */
			getRegion : function() {
				return this.sRegion;
			},

			/**
			 * Get the locale variants as a single string or <code>null</code>.
			 *
			 * Multiple variants are separated by a dash '-'.
			 *
			 * @return {string|null} the variant or <code>null</code>
			 * @public
			 */
			getVariant : function() {
				return this.sVariant;
			},

			/**
			 * Get the locale variants as an array of individual variants.
			 *
			 * The separating dashes are not part of the result.
			 * If there is no variant section in the locale tag, an empty array is returned.
			 *
			 * @return {string[]} the individual variant sections
			 * @public
			 */
			getVariantSubtags : function() {
				return this.sVariant ? this.sVariant.split('-') : [];
			},

			/**
			 * Get the locale extension as a single string or <code>null</code>.
			 *
			 * The extension always consists of a singleton character (not 'x'),
			 * a dash '-' and one or more extension token, each separated
			 * again with a dash.
			 *
			 * Use {@link #getExtensions} to get the individual extension tokens as an array.
			 *
			 * @return {string|null} the extension or <code>null</code>
			 * @public
			 */
			getExtension : function() {
				return this.sExtension;
			},

			/**
			 * Get the locale extensions as an array of tokens.
			 *
			 * The leading singleton and the separating dashes are not part of the result.
			 * If there is no extensions section in the locale tag, an empty array is returned.
			 *
			 * @return {string[]} the individual extension sections
			 * @public
			 */
			getExtensionSubtags : function() {
				return this.sExtension ? this.sExtension.slice(2).split('-') : [];
			},

			/**
			 * Get the locale private use section or <code>null</code>.
			 *
			 * @return {string} the private use section
			 * @public
			 */
			getPrivateUse : function() {
				return this.sPrivateUse;
			},

			/**
			 * Get the locale private use section as an array of tokens.
			 *
			 * The leading singleton and the separating dashes are not part of the result.
			 * If there is no private use section in the locale tag, an empty array is returned.
			 *
			 * @return {string[]} the tokens of the private use section
			 * @public
			 */
			getPrivateUseSubtags : function() {
				return this.sPrivateUse ? this.sPrivateUse.slice(2).split('-') : [];
			},

			hasPrivateUseSubtag : function(sSubtag) {
				assert(sSubtag && sSubtag.match(/^[0-9A-Z]{1,8}$/i), "subtag must be a valid BCP47 private use tag");
				return this.getPrivateUseSubtags().indexOf(sSubtag) >= 0;
			},

			toString : function() {
				return join(
					this.sLanguage,
					this.sScript,
					this.sRegion,
					this.sVariant,
					this.sExtension,
					this.sPrivateUse);
			},

			/**
			 * @returns {string} the modern language tag
			 * @private
			 * @ui5-restricted sap.ui.core.Configuration
			 */
			toLanguageTag : function() {
				var sLanguage = this.getModernLanguage();
				var sScript = this.sScript;
				// special case for "sr_Latn" language: "sh" should then be used
				// This method is used to set the Accept-Language HTTP Header for ODataModel
				// requests and .hdbtextbundle resource bundles.
				// It has to remain backward compatible
				if (sLanguage === "sr" && sScript === "Latn") {
					sLanguage = "sh";
					sScript = null;
				}

				return join(
					sLanguage,
					sScript,
					this.sRegion,
					this.sVariant,
					this.sExtension,
					this.sPrivateUse);
			},

			/**
			 * @returns {string} the modern language
			 * @private
			 * @ui5-restricted sap.ui.core.LocaleData
			 */
			getModernLanguage: function() {
				return M_ISO639_OLD_TO_NEW[this.sLanguage] || this.sLanguage;
			},

			/**
			 * Best guess to get a proper SAP Logon Language for this locale.
			 *
			 * Conversions taken into account:
			 * <ul>
			 * <li>use the language part only</li>
			 * <li>convert old ISO639 codes to newer ones (e.g. 'iw' to 'he')</li>
			 * <li>for Chinese, map 'Traditional Chinese' or region 'TW' to SAP proprietary code 'zf'</li>
			 * <li>map private extensions x-saptrc, x-sappsd and saprigi to SAP pseudo languages '1Q', '2Q' and '3Q'</li>
			 * <li>remove ext. language sub tags</li>
			 * <li>convert to uppercase</li>
			 * </ul>
			 *
			 * Note that the conversion also returns a result for languages that are not
			 * supported by the default set of SAP languages. This method has no knowledge
			 * about the concrete languages of any given backend system.
			 *
			 * @return {string} a language code that should
			 * @public
			 * @since 1.17.0
			 * @deprecated As of 1.44, use {@link sap.ui.core.Configuration#getSAPLogonLanguage} instead
			 *   as that class allows to configure an SAP Logon language.
			 */
			getSAPLogonLanguage : function() {

				var sLanguage = this.sLanguage || "";

				// cut off any ext. language sub tags
				if ( sLanguage.indexOf("-") >= 0 ) {
					sLanguage = sLanguage.slice(0, sLanguage.indexOf("-"));
				}

				// convert to new ISO codes
				sLanguage = M_ISO639_OLD_TO_NEW[sLanguage] || sLanguage;

				// handle special case for Chinese: region TW implies Traditional Chinese (ZF)
				if ( sLanguage === "zh" && !this.sScript && this.sRegion === "TW" ) {
					return "ZF";
				}

				return (
					M_LOCALE_TO_ABAP_LANGUAGE[join(sLanguage, this.sScript)]
					|| M_LOCALE_TO_ABAP_LANGUAGE[join(sLanguage, this.sRegion)]
					|| M_LOCALE_TO_ABAP_LANGUAGE[getPseudoLanguageTag(this.sPrivateUse)]
					|| sLanguage.toUpperCase()
				);
			},

			/**
			 *
			 * @returns {sap.ui.core.CalendarType} The preferred Calendar type.
			 * @private
			 * @ui5-restricted sap.ui.core
			 */
			getPreferredCalendarType: function() {
				return Locale._mPreferredCalendar[this.getLanguage() + "-" + this.getRegion()] ||
					Locale._mPreferredCalendar[this.getLanguage()] ||
					Locale._mPreferredCalendar["default"];
			}
		});

		/*
		 * Maps wellknown private use extensions to pseudo language tags.
		 */
		function getPseudoLanguageTag(sPrivateUse) {
			if ( sPrivateUse ) {
				var m = /-(saptrc|sappsd|saprigi)(?:-|$)/i.exec(sPrivateUse);
				return m && "en-US-x-" + m[1].toLowerCase();
			}
		}

		var M_ISO639_OLD_TO_NEW = {
			"iw" : "he",
			"ji" : "yi"
		};


		// Note: keys must be uppercase
		var M_ABAP_LANGUAGE_TO_LOCALE = {
			"ZH" : "zh-Hans",
			"ZF" : "zh-Hant",
			"SH" : "sr-Latn",
			"6N" : "en-GB",
			"1P" : "pt-PT",
			"1X" : "es-MX",
			"3F" : "fr-CA",
			"1Q" : "en-US-x-saptrc",
			"2Q" : "en-US-x-sappsd",
			"3Q" : "en-US-x-saprigi"
		};

		var M_LOCALE_TO_ABAP_LANGUAGE = inverse(M_ABAP_LANGUAGE_TO_LOCALE);

		/**
		 * Helper to analyze and parse designtime (aka buildtime) variables
		 *
		 * At buildtime, the build can detect a pattern like $some-variable-name:some-value$
		 * and replace 'some-value' with a value determined at buildtime (here: the actual list of locales).
		 *
		 * At runtime, this method removes the surrounding pattern ('$some-variable-name:' and '$') and leaves only the 'some-value'.
		 * Additionally, this value is parsed as a comma-separated list (because this is the only use case here).
		 *
		 * The mimic of the comments is borrowed from the CVS (Concurrent Versions System),
		 * see http://web.mit.edu/gnu/doc/html/cvs_17.html.
		 *
		 * If no valid <code>sValue</code> is given, <code>null</code> is returned
		 *
		 * @param {string} sValue The raw designtime property e.g. $cldr-rtl-locales:ar,fa,he$
		 * @returns {string[]|null} The designtime property e.g. ['ar', 'fa', 'he']
		 * @private
		 */
		function getDesigntimePropertyAsArray(sValue) {
			var m = /\$([-a-z0-9A-Z._]+)(?::([^$]*))?\$/.exec(sValue);
			return (m && m[2]) ? m[2].split(/,/) : null;
		}

		/**
		 * A list of locales for which the CLDR specifies "right-to-left"
		 * as the character orientation.
		 *
		 * The string literal below is substituted during the build.
		 * The value is determined from the CLDR JSON files which are
		 * bundled with the UI5 runtime.
		 */
		var A_RTL_LOCALES = getDesigntimePropertyAsArray("$cldr-rtl-locales:ar,fa,he$") || [];

		/**
		 * A list of locales for which CLDR data is bundled with the UI5 runtime.
		 * @private
		 */
		Locale._cldrLocales = getDesigntimePropertyAsArray("$cldr-locales:ar,ar_EG,ar_SA,bg,ca,cy,cs,da,de,de_AT,de_CH,el,el_CY,en,en_AU,en_GB,en_HK,en_IE,en_IN,en_NZ,en_PG,en_SG,en_ZA,es,es_AR,es_BO,es_CL,es_CO,es_MX,es_PE,es_UY,es_VE,et,fa,fi,fr,fr_BE,fr_CA,fr_CH,fr_LU,he,hi,hr,hu,id,it,it_CH,ja,kk,ko,lt,lv,ms,nb,nl,nl_BE,pl,pt,pt_PT,ro,ru,ru_UA,sk,sl,sr,sr_Latn,sv,th,tr,uk,vi,zh_CN,zh_HK,zh_SG,zh_TW$");

		/**
		 * A map of preferred Calendar types according to the language.
		 * @private
		 */
		Locale._mPreferredCalendar = {
			"ar-SA": CalendarType.Islamic,
			"fa": CalendarType.Persian,
			"th": CalendarType.Buddhist,
			"default": CalendarType.Gregorian
		};

		/**
		 * List of locales for which translated texts have been bundled with the UI5 runtime.
		 * @private
		 */
		Locale._coreI18nLocales = getDesigntimePropertyAsArray("$core-i18n-locales:,ar,bg,ca,cs,da,de,el,en,en_GB,es,es_MX,et,fi,fr,hi,hr,hu,it,iw,ja,kk,ko,lt,lv,ms,nl,no,pl,pt,ro,ru,sh,sk,sl,sv,th,tr,uk,vi,zh_CN,zh_TW$");

		/**
		 * Checks whether the given language tag implies a character orientation
		 * of 'right-to-left' ('RTL').
		 *
		 * The implementation of this method and the configuration above assume
		 * that when a language (e.g. 'ar') is marked as 'RTL', then all language/region
		 * combinations for that language (e.g. 'ar_SA') will be 'RTL' as well,
		 * even if the combination is not mentioned in the above configuration.
		 * There is no means to define RTL=false for a language/region, when RTL=true for
		 * the language alone.
		 *
		 * As of 3/2013 this is true for all locales/regions supported by UI5.
		 *
		 * @param {string|sap.ui.core.Locale} vLanguage Locale or language to check
		 * @returns {boolean} <code>true</code> if <code>vLanguage</code> implies RTL,
		 *  otherwise <code>false</code>
		 * @private
		 */
		Locale._impliesRTL = function(vLanguage) {
			var oLocale = vLanguage instanceof Locale ? vLanguage : new Locale(vLanguage);
			var sLanguage = oLocale.getLanguage() || "";
			sLanguage = (sLanguage && M_ISO639_OLD_TO_NEW[sLanguage]) || sLanguage;
			var sRegion = oLocale.getRegion() || "";

			if ( sRegion && A_RTL_LOCALES.indexOf(sLanguage + "_" + sRegion) >= 0 ) {
				return true;
			}
			return A_RTL_LOCALES.indexOf(sLanguage) >= 0;
		};

		/**
		 * Retrieves a Locale for the given SAP logon language or BCP47 tag.
		 *
		 * @param {string} sSAPLogonLanguage
		 *   A SAP logon language, e.g. "ZF" or a BCP47 language tag
		 * @returns {sap.ui.core.Locale | undefined}
		 *   The Locale or <code>undefined</code>, if the given string is neither a known
		 *   SAP logon language nor a valid BCP47 tag
		 * @private
		 * @ui5-restricted sap.ui.core.Configuration
		 */
		Locale.fromSAPLogonLanguage = function (sSAPLogonLanguage) {
			if (sSAPLogonLanguage && typeof sSAPLogonLanguage === 'string') {
				sSAPLogonLanguage = M_ABAP_LANGUAGE_TO_LOCALE[sSAPLogonLanguage.toUpperCase()] || sSAPLogonLanguage;
				try {
					return new Locale(sSAPLogonLanguage);
				} catch (e) {
					// ignore
				}
			}
		};

		function join() {
			return Array.prototype.filter.call(arguments, Boolean).join("-");
		}

		function inverse(obj) {
			return Object.keys(obj).reduce(function(inv, key) {
				inv[obj[key]] = key;
				return inv;
			}, {});
		}

	return Locale;

});
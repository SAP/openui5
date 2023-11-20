/*!
 * ${copyright}
 */

//Provides the locale object sap.ui.core.Locale
sap.ui.define(['sap/base/assert', 'sap/ui/base/Object', "sap/base/i18n/Localization", "sap/base/i18n/LanguageTag"],
	function(assert, BaseObject, Localization, LanguageTag) {
	"use strict";

	var mCache = Object.create(null);

	/**
	 * Creates an instance of the Locale.
	 *
	 * @class Locale represents a locale setting, consisting of a language, script, region, variants, extensions and private use section.
	 *
	 * @param {string} sLocale the locale identifier, in format en-US or en_US.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.core.Locale
	 */
	 var Locale = BaseObject.extend("sap.ui.core.Locale", /** @lends sap.ui.core.Locale.prototype */ {

		constructor : function(vLocale) {
			BaseObject.apply(this);
			if (vLocale instanceof LanguageTag) {
				this.oLanguageTag = vLocale;
				this.sLocaleId = this.oLanguageTag.toString();
			} else {
				this.oLanguageTag = new LanguageTag(vLocale);
				this.sLocaleId = vLocale;
			}
			Object.assign(this, this.oLanguageTag);
			this.sLanguage = this.language;
		},

		/**
		 * Get the locale language.
		 *
		 * Note that the case might differ from the original script tag
		 * (Lower case is enforced as recommended by BCP47/ISO639).
		 *
		 * @returns {string} the language code
		 * @public
		 */
		getLanguage : function() {
			return this.language;
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
			return this.script;
		},

		/**
		 * Get the locale region or <code>null</code> if none was specified.
		 *
		 * Note that the case might differ from the original script tag
		 * (Upper case is enforced as recommended by BCP47/ISO3166-1).
		 *
		 * @returns {string} the ISO3166-1 region code (2-letter or 3-digits)
		 * @public
		 */
		getRegion : function() {
			return this.region;
		},

		/**
		 * Get the locale variants as a single string or <code>null</code>.
		 *
		 * Multiple variants are separated by a dash '-'.
		 *
		 * @returns {string|null} the variant or <code>null</code>
		 * @public
		 */
		getVariant : function() {
			return this.variant;
		},

		/**
		 * Get the locale variants as an array of individual variants.
		 *
		 * The separating dashes are not part of the result.
		 * If there is no variant section in the locale tag, an empty array is returned.
		 *
		 * @returns {string[]} the individual variant sections
		 * @public
		 */
		getVariantSubtags : function() {
			return this.variantSubtags;
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
		 * @returns {string|null} the extension or <code>null</code>
		 * @public
		 */
		getExtension : function() {
			return this.extension;
		},

		/**
		 * Get the locale extensions as an array of tokens.
		 *
		 * The leading singleton and the separating dashes are not part of the result.
		 * If there is no extensions section in the locale tag, an empty array is returned.
		 *
		 * @returns {string[]} the individual extension sections
		 * @public
		 */
		getExtensionSubtags : function() {
			return this.extensionSubtags;
		},

		/**
		 * Get the locale private use section or <code>null</code>.
		 *
		 * @returns {string} the private use section
		 * @public
		 */
		getPrivateUse : function() {
			return this.privateUse;
		},

		/**
		 * Get the locale private use section as an array of tokens.
		 *
		 * The leading singleton and the separating dashes are not part of the result.
		 * If there is no private use section in the locale tag, an empty array is returned.
		 *
		 * @returns {string[]} the tokens of the private use section
		 * @public
		 */
		getPrivateUseSubtags : function() {
			return this.privateUseSubtags;
		},

		/**
		 * Check if a subtag is provided
		 *
		 * @param {string} sSubtag The subtag to check
		 * @returns {boolean} Wether the subtag is provided or not
		 */
		hasPrivateUseSubtag : function(sSubtag) {
			assert(sSubtag && sSubtag.match(/^[0-9A-Z]{1,8}$/i), "subtag must be a valid BCP47 private use tag");
			return this.privateUseSubtags.indexOf(sSubtag) >= 0;
		},

		toString : function() {
			return this.oLanguageTag.toString();
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
		 * @returns {string} a language code that should
		 * @public
		 * @since 1.17.0
		 * @deprecated As of 1.44, use {@link sap.ui.core.Configuration#getSAPLogonLanguage} instead
		 *   as that class allows to configure an SAP Logon language.
		 */
		getSAPLogonLanguage : function() {
			return Localization._getSAPLogonLanguage(this);
		}
	});

	Locale._getCoreLocale = function(oLocale) {
		if (oLocale instanceof LanguageTag) {
			oLocale = mCache[oLocale.toString()] || new Locale(oLocale);
			mCache[oLocale.toString()] = oLocale;
		}
		return oLocale;
	};

	return Locale;
});
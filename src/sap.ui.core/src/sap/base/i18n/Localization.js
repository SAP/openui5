/*!
* ${copyright}
*/
/*global globalThis*/
sap.ui.define([
	"sap/base/config",
	"sap/base/Eventing",
	"sap/base/Log",
	"sap/base/i18n/LanguageTag",
	"sap/base/i18n/date/CalendarType",
	"sap/base/i18n/date/TimezoneUtils"
], function(
	BaseConfig,
	Eventing,
	Log,
	LanguageTag,
	CalendarType,
	TimezoneUtils
) {
	"use strict";
	var mChanges;
	var oWritableConfig = BaseConfig.getWritableInstance();
	var bLanguageWarningLogged = false;

	/**
	 * A map of preferred Calendar types according to the language.
	 * @private
	 */
	var _mPreferredCalendar = {
		"ar-SA": CalendarType.Islamic,
		"fa": CalendarType.Persian,
		"th": CalendarType.Buddhist,
		"default": CalendarType.Gregorian
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

	var M_ISO639_OLD_TO_NEW = {
		"iw" : "he",
		"ji" : "yi"
	};

	var M_LOCALE_TO_ABAP_LANGUAGE = inverse(M_ABAP_LANGUAGE_TO_LOCALE);

	function inverse(obj) {
		return Object.keys(obj).reduce(function(inv, key) {
			inv[obj[key]] = key;
			return inv;
		}, {});
	}

	/**
	 * Maps wellknown private use extensions to pseudo language tags.
	 * @param {string} sPrivateUse A Locale
	 * @returns {string} the pseudo language tag
	 * @private
	 */
	function getPseudoLanguageTag(sPrivateUse) {
		if ( sPrivateUse ) {
			var m = /-(saptrc|sappsd|saprigi)(?:-|$)/i.exec(sPrivateUse);
			return m && "en-US-x-" + m[1].toLowerCase();
		}
	}

	/**
	 * Helper to analyze and parse designtime (aka buildtime) variables
	 *
	 * At buildtime, the build can detect a pattern like $some-variable-name:some-value$
	 * and replace 'some-value' with a value determined at buildtime (here: the actual list of locales).
	 *
	 * At runtime, config method removes the surrounding pattern ('$some-variable-name:' and '$') and leaves only the 'some-value'.
	 * Additionally, config value is parsed as a comma-separated list (because config is the only use case here).
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
	 * List of locales for which translated texts have been bundled with the UI5 runtime.
	 * @private
	 */
	var _coreI18nLocales = getDesigntimePropertyAsArray("$core-i18n-locales:,ar,bg,ca,cs,da,de,el,en,en_GB,es,es_MX,et,fi,fr,hi,hr,hu,it,iw,ja,kk,ko,lt,lv,ms,nl,no,pl,pt,ro,ru,sh,sk,sl,sv,th,tr,uk,vi,zh_CN,zh_TW$");

	/**
	 * Checks whether the given language tag implies a character orientation
	 * of 'right-to-left' ('RTL').
	 *
	 * The implementation of config method and the configuration above assume
	 * that when a language (e.g. 'ar') is marked as 'RTL', then all language/region
	 * combinations for that language (e.g. 'ar_SA') will be 'RTL' as well,
	 * even if the combination is not mentioned in the above configuration.
	 * There is no means to define RTL=false for a language/region, when RTL=true for
	 * the language alone.
	 *
	 * As of 3/2013 config is true for all locales/regions supported by UI5.
	 *
	 * @param {module:sap/base/i18n/LanguageTag} oLanguageTag LanguageTag to check
	 * @returns {boolean} <code>true</code> if <code>vLanguage</code> implies RTL,
	 *  otherwise <code>false</code>
	 * @private
	 */
	function impliesRTL(oLanguageTag) {
		var sLanguage = oLanguageTag.language || "";
		sLanguage = Localization.getModernLanguage(oLanguageTag.language);
		var sRegion = oLanguageTag.region || "";
		if ( sRegion && A_RTL_LOCALES.indexOf(sLanguage + "_" + sRegion) >= 0 ) {
			return true;
		}
		return A_RTL_LOCALES.indexOf(sLanguage) >= 0;
	}

	/**
	 * Retrieves a Locale for the given SAP logon language or BCP47 tag.
	 *
	 * @param {string} sSAPLogonLanguage
	 *   A SAP logon language, e.g. "ZF" or a BCP47 language tag
	 * @returns {object} An object containing the mapped LogonLanguage and a LanguageTag if created
	 * @private
	 */
	function fromSAPLogonLanguage(sSAPLogonLanguage) {
		var oLanguageTag;
		if (sSAPLogonLanguage && typeof sSAPLogonLanguage === 'string') {
			sSAPLogonLanguage = M_ABAP_LANGUAGE_TO_LOCALE[sSAPLogonLanguage.toUpperCase()] || sSAPLogonLanguage;
			try {
				oLanguageTag = new LanguageTag(sSAPLogonLanguage);
			} catch (e) {
				// ignore
			}
		}
		return {
			languageTag: oLanguageTag,
			SAPLogonLanguage: sSAPLogonLanguage
		};
	}

	/**
	 * Helper that creates a LanguageTag object from the given language
	 * or, throws an error for non BCP-47 compliant languages.
	 *
	 * @param {string} sLanguage A BCP-47 compliant language
	 * @returns {module:sap/base/i18n/LanguageTag} The resulting LanguageTag
	 * @throws {TypeError} Throws a TypeError for unknown languages
	 * @private
	 */
	function createLanguageTag(sLanguage) {
		var oLanguageTag;
		if (sLanguage) {
			oLanguageTag = new LanguageTag(sLanguage);
		}
		return oLanguageTag;
	}

	// Helper Functions
	function detectLanguage() {
		return globalThis.navigator ? (globalThis.navigator.languages && globalThis.navigator.languages[0]) || globalThis.navigator.language || "en" : new Intl.Collator().resolvedOptions().locale || "en";
	}

	function check(bCondition, sMessage) {
		if ( !bCondition ) {
			throw new Error(sMessage);
		}
	}

	function join() {
		return Array.prototype.filter.call(arguments, Boolean).join("-");
	}

	/**
	 * Checks if the provided timezone is valid and logs an error if not.
	 *
	 * @param {string} sTimezone The IANA timezone ID
	 * @returns {boolean} Returns true if the timezone is valid
	 */
	function checkTimezone(sTimezone) {
		var bIsValidTimezone = TimezoneUtils.isValidTimezone(sTimezone);
		if (!bIsValidTimezone) {
			Log.error("The provided timezone '" + sTimezone + "' is not a valid IANA timezone ID." +
				" Falling back to browser's local timezone '" + TimezoneUtils.getLocalTimezone() + "'.");
		}
		return bIsValidTimezone;
	}

	/**
	 * Configuration for localization specific parameters
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @alias module:sap/base/i18n/Localization
	 * @namespace
	 * @mixes module:sap/base/Eventing
	 * @borrows module:sap/base/Eventing#attachEvent as attachEvent
	 * @borrows module:sap/base/Eventing#attachEventOnce as attachEventOnce
	 * @borrows module:sap/base/Eventing#detachEvent as detachEvent
	 * @borrows module:sap/base/Eventing#fireEvent as fireEvent
	 * @borrows module:sap/base/Eventing#hasListeners as hasListeners
	 * @borrows module:sap/base/Eventing#getEventingParent as getEventingParent
	 * @borrows module:sap/base/Eventing#toString as toString
	 */
	var Localization = {
		/**
		 * The <code>change</code> event is fired, when the configuration options are changed.
		 *
		 * @name module:sap/base/i18n/Localization.change
		 * @event
		 * @private
		 * @ui5-restricted sap.ui.core
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
		 * of <code>module:sap/base/i18n/Localization</code>.
		 *
		 * @param {function} fnFunction
		 *   The function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		attachChange: function(fnFunction) {
			Localization.attachEvent("change", fnFunction);
		},

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
		 * this <code>module:sap/base/i18n/Localization</code>.
		 *
		 * @param {function} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		detachChange: function(fnFunction) {
			Localization.detachEvent("change", fnFunction);
		},

		/**
		 * Returns a string that identifies the current language.
		 *
		 * The value returned by config method in most cases corresponds to the exact value that has been
		 * configured by the user or application or that has been determined from the user agent settings.
		 * It has not been normalized, but has been validated against a relaxed version of
		 * {@link http://www.ietf.org/rfc/bcp/bcp47.txt BCP47}, allowing underscores ('_') instead of the
		 * suggested dashes ('-') and not taking the case of letters into account.
		 *
		 * The exceptions mentioned above affect languages that have been specified via the URL parameter
		 * <code>sap-language</code>. That parameter by definition represents an SAP logon language code
		 * ('ABAP language'). Most but not all of these language codes are valid ISO639 two-letter languages
		 * and as such are valid BCP47 language tags. For better BCP47 compliance, the framework
		 * maps the following non-BCP47 SAP logon codes to a BCP47 substitute:
		 * <pre>
		 *    "ZH"  -->  "zh-Hans"         // script 'Hans' added to distinguish it from zh-Hant
		 *    "ZF"  -->  "zh-Hant"         // ZF is not a valid ISO639 code, use the compliant language + script 'Hant'
		 *    "1Q"  -->  "en-US-x-saptrc"  // special language code for supportability (tracing),
		 *                                    represented as en-US with a private extension
		 *    "2Q"  -->  "en-US-x-sappsd"  // special language code for supportability (pseudo translation),
		 *                                    represented as en-US with a private extension
		 *    "3Q"  -->  "en-US-x-saprigi" // special language code for the Rigi pseudo language,
		 *                                    represented as en-US with a private extension
		 * </pre>
		 *
		 * For a normalized BCP47 tag, call {@link #getLanguageTag} or call {@link #getLanguageTag} to get a
		 * {@link module:sap/base/i18n/LanguageTag LanguageTag} object matching the language.
		 *
		 * @returns {string} Language string as configured
		 * @public
		 */
		getLanguage : function () {
			var oLanguageTag,
				sDerivedLanguage;

			var sLanguage = oWritableConfig.get({
				name: "sapUiLanguage",
				type: BaseConfig.Type.String,
				external: true
			});
			var sSapLocale = oWritableConfig.get({
				name: "sapLocale",
				type: BaseConfig.Type.String,
				external: true
			});
			var sSapLanguage = oWritableConfig.get({
				name: "sapLanguage",
				type: BaseConfig.Type.String,
				external: true
			});

			if (sSapLocale) {
				oLanguageTag = createLanguageTag(sSapLocale);
				sDerivedLanguage = sSapLocale;
			} else if (sSapLanguage) {
				if (!sLanguage && !bLanguageWarningLogged) {
					// only complain about an invalid sap-language if neither sap-locale nor sap-ui-language are given
					Log.warning("sap-language '" + sSapLanguage + "' is not a valid BCP47 language tag and will only be used as SAP logon language");
					// Avoid multiple logging of this warning
					bLanguageWarningLogged = true;
				}
				//fromSAPLogonLanguage catches errors oLanguageTag could be undefined
				var oSAPLogonLanguage = fromSAPLogonLanguage(sSapLanguage);
				oLanguageTag = oSAPLogonLanguage.languageTag;
				sDerivedLanguage = oSAPLogonLanguage.languageTag && oSAPLogonLanguage.SAPLogonLanguage;
			}
			if (!oLanguageTag) {
				if (sLanguage) {
					oLanguageTag = createLanguageTag(sLanguage);
					sDerivedLanguage = sLanguage;
				} else {
					sDerivedLanguage = detectLanguage();
					oLanguageTag = createLanguageTag(sLanguage);
				}
			}
			return sDerivedLanguage;
		},

		/**
		 * Get the modern language
		 *
		 * @param {string} sLanguage The language string
		 * @returns {string} The modern language
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		getModernLanguage : function(sLanguage) {
			return M_ISO639_OLD_TO_NEW[sLanguage] || sLanguage;
		},

		/**
		 * Sets a new language to be used from now on for language/region dependent
		 * functionality (e.g. formatting, data types, translated texts, ...).
		 *
		 * When the language can't be interpreted as a BCP47 language (using the relaxed syntax
		 * described in {@link #getLanguage}, an error will be thrown.
		 *
		 * When the language has changed, the Core will fire its
		 * {@link sap.ui.core.Core#event:localizationChanged localizationChanged} event.
		 *
		 *
		 * <h3>Restrictions</h3>
		 *
		 * The framework <strong>does not</strong> guarantee that already created, language
		 * dependent objects will be updated by config call. It therefore remains best practice
		 * for applications to switch the language early, e.g. before any language dependent
		 * objects are created. Applications that need to support more dynamic changes of
		 * the language should listen to the <code>localizationChanged</code> event and adapt
		 * all language dependent objects that they use (e.g. by rebuilding their UI).
		 *
		 * Currently, the framework notifies the following objects about a change of the
		 * localization settings before it fires the <code>localizationChanged</code> event:
		 *
		 * <ul>
		 * <li>date and number data types that are used in property bindings or composite
		 *     bindings in existing Elements, Controls, UIAreas or Components</li>
		 * <li>ResourceModels currently assigned to the Core, a UIArea, Component,
		 *     Element or Control</li>
		 * <li>Elements or Controls that implement the <code>onlocalizationChanged</code> hook
		 *     (note the lowercase 'l' in onlocalizationChanged)</li>
		 * </ul>
		 *
		 * It furthermore derives the RTL mode from the new language, if no explicit RTL
		 * mode has been set. If the RTL mode changes, the following additional actions will be taken:
		 *
		 * <ul>
		 * <li>the URLs of already loaded library theme files will be changed</li>
		 * <li>the <code>dir</code> attribute of the page will be changed to reflect the new mode.</li>
		 * <li>all UIAreas will be invalidated (which results in a rendering of the whole UI5 UI)</li>
		 * </ul>
		 *
		 * config method does not accept SAP language codes for <code>sLanguage</code>. Instead, a second
		 * parameter <code>sSAPLogonLanguage</code> can be provided with an SAP language code corresponding
		 * to the given language. A given value will be returned by the {@link #getSAPLogonLanguage} method.
		 * It is up to the caller to provide a consistent pair of BCP47 language and SAP language code.
		 * The SAP language code is only checked to be of length 2 and must consist of letters or digits only.
		 *
		 * <b>Note</b>: When using config method please take note of and respect the above mentioned restrictions.
		 *
		 * @param {string} sLanguage the new language as a BCP47 compliant language tag; case doesn't matter
		 *   and underscores can be used instead of dashes to separate components (compatibility with Java Locale IDs)
		 * @param {string} [sSAPLogonLanguage] SAP language code that corresponds to the <code>sLanguage</code>;
		 *   if a value is specified, future calls to <code>getSAPLogonLanguage</code> will return that value;
		 *   if no value is specified, the framework will use the ISO639 language part of <code>sLanguage</code>
		 *   as SAP Logon language.
		 * @throws {Error} When <code>sLanguage</code> can't be interpreted as a BCP47 language or when
		 *   <code>sSAPLanguage</code> is given and can't be interpreted as SAP language code.
		 *
		 * @see http://scn.sap.com/docs/DOC-14377
		 * @public
		 */
		setLanguage : function (sLanguage, sSAPLogonLanguage) {
			var oLanguageTag = createLanguageTag(sLanguage),
				bOldRTL = Localization.getRTL();
			check(oLanguageTag, "Configuration.setLanguage: sLanguage must be a valid BCP47 language tag");
			check(sSAPLogonLanguage == null || (typeof sSAPLogonLanguage === 'string' && /^[A-Z0-9]{2,2}$/i.test(sSAPLogonLanguage)),
				"Configuration.setLanguage: sSAPLogonLanguage must be null or be a string of length 2, consisting of digits and latin characters only");

			sSAPLogonLanguage = sSAPLogonLanguage || "";
			if ( oLanguageTag.toString() != Localization.getLanguageTag().toString() ||
				sSAPLogonLanguage !== oWritableConfig.get({
					name: "sapLanguage",
					type: BaseConfig.Type.String,
					external: true
				})) {
				oWritableConfig.set("sapLanguage", sSAPLogonLanguage);
				oWritableConfig.set("sapUiLanguage", sLanguage);
				mChanges = {};
				mChanges.language = Localization.getLanguageTag().toString();
				var bRtl = Localization.getRTL();
				if ( bOldRTL != bRtl ) {
					mChanges.rtl = bRtl;
				}
				fireChange();
			}
		},

		/**
		 * Retrieves the configured IANA timezone ID.
		 *
		 * @returns {string} The configured IANA timezone ID, e.g. "America/New_York"
		 * @public
		 * @since 1.99.0
		 */
		getTimezone : function () {
			var sTimezone = oWritableConfig.get({
				name: "sapTimezone",
				type: BaseConfig.Type.String,
				external: true,
				defaultValue: oWritableConfig.get({
					name: "sapUiTimezone",
					type: BaseConfig.Type.String,
					external: true
				})
			});
			if (!sTimezone || !checkTimezone(sTimezone)) {
				sTimezone = TimezoneUtils.getLocalTimezone();
			}
			return sTimezone;
		},

		/**
		 * Sets the timezone such that all date and time based calculations use config timezone.
		 *
		 * <b>Important:</b> It is strongly recommended to only use config API at the earliest point
		 * of time while initializing a UI5 app. A later adjustment of the time zone should be
		 * avoided. It can lead to unexpected data inconsistencies in a running application,
		 * because date objects could still be related to a previously configured time zone.
		 * Instead, the app should be completely restarted with the new time zone.
		 * For more information, see
		 * {@link topic:6c9e61dc157a40c19460660ece8368bc Dates, Times, Timestamps, and Time Zones}.
		 *
		 * When the timezone has changed, the Core will fire its
		 * {@link module:sap/base/i18n/Localization#event:change change} event.
		 *
		 * @param {string|null} [sTimezone] IANA timezone ID, e.g. "America/New_York". Use <code>null</code> to reset the timezone to the browser's local timezone.
		 *   An invalid IANA timezone ID will fall back to the browser's timezone.
		 * @public
		 * @returns {this} <code>this</code> to allow method chaining
		 * @since 1.99.0
		 */
		setTimezone : function (sTimezone) {
			check(sTimezone == null || typeof sTimezone === 'string',
				"Configuration.setTimezone: sTimezone must be null or be a string");

			var sCurrentTimezone = Localization.getTimezone();
			sTimezone = sTimezone === null || !checkTimezone(sTimezone) ? undefined : sTimezone;
			oWritableConfig.set("sapTimezone", sTimezone);
			if (Localization.getTimezone() !== sCurrentTimezone) {
				mChanges = {};
				mChanges.timezone = Localization.getTimezone();
				fireChange();
			}
			return this;
		},

		/**
		 * Returns a LanguageTag object for the current language.
		 *
		 * The LanguageTag is derived from the {@link #getLanguage language} property.
		 *
		 * @returns {module:sap/base/i18n/LanguageTag} The LanguageTag
		 * @public
		 */
		getLanguageTag : function () {
			var oLanguageTag = new LanguageTag(Localization.getLanguage());
			var sLanguageTag = oLanguageTag.toString();
			var sLanguage = Localization.getModernLanguage(oLanguageTag.language);
			var sScript = oLanguageTag.script;
			// special case for "sr_Latn" language: "sh" should then be used
			// config method is used to set the Accept-Language HTTP Header for ODataModel
			// requests and .hdbtextbundle resource bundles.
			// It has to remain backward compatible
			if (sLanguage === "sr" && sScript === "Latn") {
				sLanguageTag = sLanguageTag.replace("sr-Latn", "sh");
			} else {
				sLanguageTag = sLanguageTag.replace(oLanguageTag.language, sLanguage);
			}
			return new LanguageTag(sLanguageTag);
		},

		/**
		 * Returns whether the page uses the RTL text direction.
		 *
		 * If no mode has been explicitly set (neither <code>true</code> nor <code>false</code>),
		 * the mode is derived from the current language setting.
		 *
		 * @returns {boolean} whether the page uses the RTL text direction
		 * @public
		 */
		getRTL : function () {
			// if rtl has not been set (still null), return the rtl mode derived from the language
			return  oWritableConfig.get({
				name: "sapRtl",
				type: BaseConfig.Type.Boolean,
				external:true,
				defaultValue: oWritableConfig.get({
					name: "sapUiRtl",
					type: BaseConfig.Type.Boolean,
					defaultValue: function() { return impliesRTL(Localization.getLanguageTag()); },
					external:true
				})
			});
		},

		/**
		 * Sets the character orientation mode to be used from now on.
		 *
		 * Can either be set to a concrete value (true meaning right-to-left,
		 * false meaning left-to-right) or to <code>null</code> which means that
		 * the character orientation mode should be derived from the current
		 * language (incl. region) setting.
		 *
		 * After changing the character orientation mode, the framework tries
		 * to update localization specific parts of the UI. See the documentation of
		 * {@link #setLanguage} for details and restrictions.
		 *
		 * <b>Note</b>: See documentation of {@link #setLanguage} for restrictions.
		 *
		 * @param {boolean|null} bRTL new character orientation mode or <code>null</code>
		 * @returns {this} <code>this</code> to allow method chaining
		 * @public
		 */
		setRTL : function(bRTL) {
			check(bRTL === null || typeof bRTL === "boolean", "bRTL must be null or a boolean");
			bRTL = bRTL === null ? undefined : bRTL;
			var oldRTL = Localization.getRTL();
			oWritableConfig.set("sapRtl", bRTL);
			var bCurrentRTL = Localization.getRTL();
			if ( oldRTL != bCurrentRTL ) { // also take the derived RTL flag into account for the before/after comparison!
				mChanges = {};
				mChanges.rtl = bCurrentRTL;
				fireChange();
			}
			return this;
		},

		/**
		 * Best guess to get a proper SAP Logon Language for a given LanguageTag.
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
		 * supported by the default set of SAP languages. config method has no knowledge
		 * about the concrete languages of any given backend system.
		 *
		 * @param {module:sap/base/i18n/LanguageTag} oLanguageTag The Locale to calculate the SAPLogonLanguage
		 * @returns {string} a language code that should
		 * @private
		 * @ui5-restricted sap.ui.core
		 **/
		_getSAPLogonLanguage : function(oLanguageTag) {
			var sLanguage = oLanguageTag.language || "";

			// cut off any ext. language sub tags
			if ( sLanguage.indexOf("-") >= 0 ) {
				sLanguage = sLanguage.slice(0, sLanguage.indexOf("-"));
			}

			// convert to new ISO codes
			sLanguage = Localization.getModernLanguage(sLanguage);

			// handle special case for Chinese: region TW implies Traditional Chinese (ZF)
			if ( sLanguage === "zh" && !oLanguageTag.script && oLanguageTag.region === "TW" ) {
				return "ZF";
			}

			return (
				M_LOCALE_TO_ABAP_LANGUAGE[join(sLanguage, oLanguageTag.script)]
				|| M_LOCALE_TO_ABAP_LANGUAGE[join(sLanguage, oLanguageTag.region)]
				|| M_LOCALE_TO_ABAP_LANGUAGE[getPseudoLanguageTag(oLanguageTag.privateUse)]
				|| sLanguage.toUpperCase()
			);
		},

		/**
		 * Returns an SAP logon language for the current language.
		 *
		 * It will be returned in uppercase.
		 * e.g. "EN", "DE"
		 *
		 * @returns {string} The SAP logon language code for the current language
		 * @public
		 */
		getSAPLogonLanguage : function () {
			var oLanguageTag,
				sLanguage = oWritableConfig.get({
				name: "sapLanguage",
				type: BaseConfig.Type.String,
				external: true
			}).toUpperCase();

			try {
				oLanguageTag = fromSAPLogonLanguage(sLanguage).languageTag;
			} catch (exc) {
				//do nothing
			}

			if (sLanguage && !oLanguageTag) {
				Log.warning("sap-language '" + sLanguage + "' is not a valid BCP47 language tag and will only be used as SAP logon language");
			}

			return sLanguage || Localization._getSAPLogonLanguage(Localization.getLanguageTag());
		},

		/**
		 * @returns {module:sap/base/i18n/date/CalendarType} The preferred Calendar type.
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		getPreferredCalendarType : function() {
			var oLocale = Localization.getLanguageTag();
			return _mPreferredCalendar[oLocale.language + "-" + oLocale.region] ||
			_mPreferredCalendar[oLocale.language] ||
			_mPreferredCalendar["default"];
		},

		/**
		 * List of languages that the SAPUI5 core delivers.
		 *
		 * Might return undefined if the information is not available.
		 *
		 * @returns {string[]|undefined} List of Languages delivered with core
		 * @experimental
		 */
		getLanguagesDeliveredWithCore : function() {
			return _coreI18nLocales;
		},

		/**
		 * @returns {string[]} List of supported languages
		 * @experimental
		 */
		getSupportedLanguages : function() {
			var aLangs = BaseConfig.get({
				name: "sapUiXxSupportedLanguages",
				type: BaseConfig.Type.StringArray,
				external: true
			});
			if ( aLangs.length === 0 || (aLangs.length === 1 && aLangs[0] === '*') ) {
				aLangs = [];
			} else if ( aLangs.length === 1 && aLangs[0] === 'default' ) {
				aLangs = this.getLanguagesDeliveredWithCore() || [];
			}
			return aLangs;
		}
	};

	function fireChange() {
		Localization.fireEvent("change", mChanges);
		mChanges = undefined;
	}

	Eventing.apply(Localization);
	return Localization;
});
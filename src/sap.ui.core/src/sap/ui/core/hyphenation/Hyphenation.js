/*!
* ${copyright}
*/

sap.ui.define([
	"./HyphenationTestingWords",
	"sap/base/i18n/Localization",
	"sap/ui/base/ManagedObject",
	"sap/base/Log",
	"sap/ui/core/Locale"
], function (
	HyphenationTestingWords,
	Localization,
	ManagedObject,
	Log,
	Locale
) {
	"use strict";

	/**
	 * Flat list of languages that are supported by Hyphenopoly.
	 * @type {Object<string,boolean>}
	 * @private
	 */
	var oThirdPartySupportedLanguages = {
		'bg': true,
		'ca': true,
		'hr': true,
		'cs': false, // no valid license
		'da': true,
		'nl': true,
		'en-us': true,
		'et': true,
		'fi': true,
		'fr': true,
		'de': true,
		'el-monoton': true,
		'hi': true,
		'hu': true,
		'it': true,
		'lt': true,
		'nb-no': true,
		'pl': false, // no valid license
		'pt': true,
		'ru': true,
		'sr': false, // no valid license
		'sl': true,
		'es': true,
		'sv': true,
		'th': true,
		'tr': true,
		'uk': true
	};

	/**
	 * Holds a map of names of languages in english. Like <code>{"de" => "German"}</code>
	 * @type {Object<string,string>}
	 * @private
	 */
	var mLanguageNamesInEnglish = {
		"bg": "Bulgarian",
		"ca": "Catalan",
		"hr": "Croatian",
		"cs": "Czech",
		"da": "Danish",
		"nl": "Dutch",
		"en": "English",
		"et": "Estonian",
		"fi": "Finnish",
		"fr": "French",
		"de": "German",
		"el": "Greek",
		"hi": "Hindi",
		"hu": "Hungarian",
		"it": "Italian",
		"lt": "Lithuanian",
		"nb": "Norwegian Bokmål",
		"no": "Norwegian",
		"pl": "Polish",
		"pt": "Portuguese",
		"ru": "Russian",
		"sr": "Serbian",
		"sl": "Slovenian",
		"es": "Spanish",
		"sv": "Swedish",
		"th": "Thai",
		"tr": "Turkish",
		"uk": "Ukrainian"
	  };

	var oBrowserSupportCSS = {};
	var oSupportCheck = {};
	var oThirdPartySupportCheck = {};
	var oHyphenationInstance = null;
	var fakeBody = null;
	var oHyphenateMethods = {};

	/**
	 * Calls Hyphenopoly to initialize a language.
	 * Loads language-specific resources.
	 *
	 * @param {string} sLanguage What language to initialize
	 * @returns {Promise} Promise that resolves with the hyphenator function for that language
	 * @private
	 */
	function initializeLanguage(sLanguage) {
		Log.info(
			"[UI5 Hyphenation] Initializing third-party module for language " + getLanguageDisplayName(sLanguage),
			"sap.ui.core.hyphenation.Hyphenation.initialize()"
		);

		var oHyphenopolyConfig = createHyphenopolyConfig();
		oHyphenopolyConfig.require[sLanguage] = "FORCEHYPHENOPOLY"; // force loading of the engine for this language

		return loadScript(sap.ui.require.toUrl("sap/ui/thirdparty/hyphenopoly/"), "Hyphenopoly_Loader.js")
			.then(function () {
				delete oHyphenopolyConfig.require[sLanguage];
				return window.Hyphenopoly.hyphenators[sLanguage];
			});
	}

	function createHyphenopolyConfig() {
		if (!window.Hyphenopoly) {
			window.Hyphenopoly = {
				require: {},
				setup: {
					selectors: {
						".hyphenate": { // .hyphenate is the default CSS class (hence this is the default configuration for all words and langs)
							hyphen: "\u00AD",
							leftmin: 3,
							rightmin: 3,
							compound: "all" // hyphenate the parts and insert a zero-width space after the hyphen
						}
					},
					hide: "DONT_HIDE" // prevent visiblity: hidden; of html tag while the engine is loading
				},
				handleEvent: {
					error: function (e) {
						// Hyphenopoly will try to find DOM elements and hyphenate them,
						// but since we use only the hyphenators, prevent the warning
						if (e.msg.match(/engine for language .* loaded, but no elements found./)) {
							e.preventDefault(); //don't show error message in console
						}
					}
				}
			};
		}

		return window.Hyphenopoly;
	}

	/**
	 * Loads a <code>javascript</code> file.
	 *
	 * @param {string} sPath The root path
	 * @param {string} sFilename File to be loaded
	 * @returns {Promise} A promise which resolves when the script is loaded
	 * @private
	 */
	function loadScript(sPath, sFilename) {
		return new Promise(function (resolve, reject) {
			var script = document.createElement('script');
			script.async = true;
			script.src = sPath + sFilename;
			script.addEventListener('load', resolve);
			script.addEventListener('error', function () {
				return reject('Error loading script: ' + sFilename);
			});
			script.addEventListener('abort', function () {
				return reject(sFilename + ' Script loading aborted.');
			});
			document.head.appendChild(script);
		});
	}

	/**
	 * Holds CSS for a test div for test of native hyphenation.
	 * @type {string}
	 */
	var css = (function createCss() {
		var props = [
			"visibility:hidden;",
			"-moz-hyphens:auto;",
			"-webkit-hyphens:auto;",
			"hyphens:auto;",
			"width:48px;",
			"font-size:12px;",
			"line-height:12px;",
			"border:none;",
			"padding:0;",
			"word-wrap:normal"
		];
		return props.join("");
	}());

	/**
	 * Creates and appends div with CSS-hyphenated word.
	 *
	 * @param {string} sLanguageOnThePage Language (<code>lang</code> attribute of the HTML page)
	 * @param {string} sTestingWord Long word for that language
	 * @private
	 */
	function createTest(sLanguageOnThePage, sTestingWord) {
		if (!fakeBody) {
			fakeBody = document.createElement("body");
		}

		var testDiv = document.createElement("div");
		testDiv.lang = sLanguageOnThePage;
		testDiv.id = sLanguageOnThePage;
		testDiv.style.cssText = css;
		testDiv.appendChild(document.createTextNode(sTestingWord));
		fakeBody.appendChild(testDiv);
	}

	/**
	 * Appends fakeBody with tests to target.
	 *
	 * @param {Element} oTarget Where to append fakeBody
	 * @returns {Element|null} The body element or null, if no tests
	 * @private
	 */
	function appendTests(oTarget) {
		if (fakeBody) {
			oTarget.appendChild(fakeBody);
			return fakeBody;
		}
		return null;
	}

	/**
	 * Removes fakeBody.
	 *
	 * @private
	 */
	function clearTests() {
		if (fakeBody) {
			fakeBody.parentNode.removeChild(fakeBody);
		}
	}

	/**
	 * Checks if hyphens (ev.prefixed) is set to auto for the element.
	 *
	 * @param {Element} oElement The element with applied <code>hyphens=auto</code> styles
	 * @returns {boolean} The result of the check
	 * @private
	 */
	function checkCSSHyphensSupport(oElement) {
		return (
			oElement.style.hyphens === "auto" ||
			oElement.style.webkitHyphens === "auto" ||
			oElement.style.msHyphens === "auto" ||
			oElement.style["-moz-hyphens"] === "auto"
		);
	}

	/**
	 * Gets global language code or the given language code.
	 *
	 * @param {string} [sLang] The language to get. If left empty - the global application language will be returned
	 * @returns {string} The language code
	 * @private
	 */
	function getLanguage(sLang) {
		var oLocale;
		if (sLang) {
			oLocale = new Locale(sLang);
		} else {
			oLocale = new Locale(Localization.getLanguageTag());
		}

		var sLanguage = oLocale.getLanguage().toLowerCase();

		// adjustment of the language to correspond to Hyphenopoly pattern files (.hpb files)
		switch (sLanguage) {
			case "en":
				sLanguage = "en-us";
				break;
			case "nb":
				sLanguage = "nb-no";
				break;
			case "no":
				sLanguage = "nb-no";
				break;
			case "el":
				sLanguage = "el-monoton";
				break;
			default:
				break;
		}

		return sLanguage;
	}

	/**
	 * The <code>lang</code> attribute of the closest parent determines the behavior of the native hyphenation.
	 * Typically this is the HTML tag and its value can be read with the <code>getLocale</code> function.
	 *
	 * @param {string} [sLang=module:sap/base/i18n/Localization.getLanguageTag().toString()] The language to get. If left empty - the global application language will be returned
	 * @returns {string} The language code
	 * @private
	 */
	function getLanguageAsSetOnThePage(sLang) {
		if (sLang) {
			return new Locale(sLang).toString();
		}

		return new Locale(Localization.getLanguageTag()).toString();
	}

	/**
	 * Gets language code from pattern name (hbp file name).
	 *
	 * @param {string} sPatternName The hpb file name
	 * @return {string} Language code
	 */
	function getLanguageFromPattern(sPatternName) {
		if (typeof sPatternName === "string") {
			const aParts = sPatternName.split(/[-_]/);
			return aParts[0];
		} else {
			return null;
		}
	}

	/**
	 * Gets a human readable english name for the language.
	 * If not found - returns a string with the language code.
	 *
	 * @param {string} sPatternName The pattern name (hpb file name)
	 * @return {string} Returns a human readable english name for the language
	 */
	function getLanguageDisplayName(sPatternName) {
		var sLang = getLanguageFromPattern(sPatternName);

		if (mLanguageNamesInEnglish.hasOwnProperty(sLang)) {
			return "'" + mLanguageNamesInEnglish[sLang] + "' (code:'" + sLang + "')";
		} else {
			return "'" + sLang + "'";
		}
	}

	/**
	 * Logs an error and fires the error event.
	 *
	 * @param {string} sErrorMessage The message of the error which is thrown/logged
	 * @private
	 */
	function fireError(sErrorMessage) {
		oHyphenationInstance.fireError(sErrorMessage);
		Log.error("[UI5 Hyphenation] " + sErrorMessage, "sap.ui.core.hyphenation.Hyphenation");
	}

	/**
	 * @class
	 * This class provides methods for evaluating the possibility of using browser-native hyphenation or initializing and using a third-party hyphenation module.
	 *
	 * <h3>Overview</h3>
	 * By using this API, a developer can check if browser-native hyphenation is supported for a particular language.
	 *
	 * When browser-native hyphenation is not supported or if otherwise required, the API can be used to hyphenate texts. A third-party library "Hyphenopoly" is used in that case.
	 *
	 * It is used internally by controls that support the <code>wrappingType:{@link sap.m.WrappingType WrappingType.Hyphenated}</code> property.
	 *
	 * As the class is singleton, an instance should be acquired from {@link sap.ui.core.hyphenation.Hyphenation.getInstance Hyphenation.getInstance}.
	 *
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * <ul>
	 * <li>To check if browser-native hyphenation is available for particular language.</li>
	 * <li>To hyphenate texts if browser-native hyphenation is not available.</li>
	 * </ul>
	 * <h4>When not to use:</h4>
	 * <ul>
	 * <li>
	 * If the use case is covered by controls that support the property <code>wrappingType:{@link sap.m.WrappingType WrappingType.Hyphenated}</code>.
	 * This functionality is supported by {@link sap.m.Title sap.m.Title}, {@link sap.m.Label sap.m.Label} and {@link sap.m.Text sap.m.Text}.
	 * </li>
	 * <li>If browser-native hyphenation is available</li>
	 * </ul>
	 *
	 * <h3>Example</h3>
	 * <pre>
	 * if (!Hyphenation.getInstance().canUseNativeHyphenation("en")) {
	 * 	Hyphenation.getInstance().initialize("en").then(function() {
	 * 		console.log(Hyphenation.getInstance().hyphenate("An example text to hyphenate.", "en"));
	 * 	});
	 * }
	 * </pre>
	 *
	 * For more information, see {@link topic:6322164936f047de941ec522b95d7b70 Hyphenation for Text Controls}.
	 *
	 * <code>Caution:</code> Note that as the hyphenation feature uses third-party
	 * and browser-native tools, we are not responsible for any grammatical incorrectness
	 * or inconsistencies of the hyphenation. Also, the variety of supported languages is
	 * outside the scope of our control and may be subject to future changes.
	 *
	 * @see {@link topic:6322164936f047de941ec522b95d7b70 Hyphenation for Text Controls}
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @hideconstructor
	 * @public
	 * @since 1.60
	 * @alias sap.ui.core.hyphenation.Hyphenation
	 */
	var Hyphenation = ManagedObject.extend("sap.ui.core.hyphenation.Hyphenation", {
		metadata: {
			library: "sap.ui.core",
			events: {
				/**
				 * Fired if an error with initialization or hyphenation occurs.
				 * @private
				 * @ui5-restricted sap.ui.core.hyphenation.Hyphenation
				 */
				error: {
					parameters: {
						/**
						 * The message of the error.
						 */
						sErrorMessage: {type : "string"}
					}
				}
			}
		}
	});

	/**
	 * Checks if native hyphenation works in the current browser for the given language.
	 * This check is performed against the value of the "lang" HTML attribute of the page.
	 *
	 * @param {string} [sLang=module:sap/base/i18n/Localization.getLanguageTag().toString()] For what language to check. The global application language is the default one
	 * @returns {(boolean|null)} True if native hyphenation works for the given language. False if native hyphenation will not work. Null if the language is not known to the Hyphenation API
	 * @public
	 */
	Hyphenation.prototype.canUseNativeHyphenation = function (sLang) {
		var sLanguageOnThePage = getLanguageAsSetOnThePage(sLang),
			sMappedLanguage = getLanguage(sLang),
			bCanUseNativeHyphenation;

		if (!this.isLanguageSupported(sMappedLanguage)) {
			return null;
		}

		if (!oBrowserSupportCSS.hasOwnProperty(sLanguageOnThePage)) {
			createTest(sLanguageOnThePage, HyphenationTestingWords[sMappedLanguage.toLowerCase()]);
			var testContainer = appendTests(document.documentElement);
			if (testContainer !== null) {
				var el = document.getElementById(sLanguageOnThePage);
				if (checkCSSHyphensSupport(el) && el.offsetHeight > 12) {
					bCanUseNativeHyphenation = true;
				} else {
					bCanUseNativeHyphenation = false;
				}
				clearTests();
			}
			oBrowserSupportCSS[sLanguageOnThePage] = bCanUseNativeHyphenation;

			if (bCanUseNativeHyphenation) {
				Log.info(
					"[UI5 Hyphenation] Browser-native hyphenation can be used for language " + getLanguageDisplayName(sLanguageOnThePage),
					"sap.ui.core.hyphenation.Hyphenation.canUseNativeHyphenation()"
				);
			} else {
				Log.info(
					"[UI5 Hyphenation] Browser-native hyphenation is not supported by current platform for language " + getLanguageDisplayName(sLanguageOnThePage),
					"sap.ui.core.hyphenation.Hyphenation.canUseNativeHyphenation()"
				);
			}
		} else {
			bCanUseNativeHyphenation = oBrowserSupportCSS[sLanguageOnThePage];
		}

		return bCanUseNativeHyphenation;
	};

	/**
	 * Checks if third-party hyphenation works for the given language.
	 *
	 * @param {string} [sLang=module:sap/base/i18n/Localization.getLanguageTag().toString()] For what language to check. The global application language is the default one.
	 * @returns {boolean|null} True if third-party hyphenation works for the given language. False if third-party hyphenation doesn't work. Null if the language is not known to the <code>Hyphenation</code> API.
	 * @public
	 */
	Hyphenation.prototype.canUseThirdPartyHyphenation = function (sLang) {
		var sLanguage = getLanguage(sLang),
			bCanUseThirdPartyHyphenation;

		if (!this.isLanguageSupported(sLang)) {
			return null;
		}

		if (!oThirdPartySupportCheck.hasOwnProperty(sLanguage)) {
			bCanUseThirdPartyHyphenation = oThirdPartySupportedLanguages.hasOwnProperty(sLanguage) && oThirdPartySupportedLanguages[sLanguage];

			if (bCanUseThirdPartyHyphenation) {
				Log.info(
					"[UI5 Hyphenation] Third-party hyphenation can be used for language " + getLanguageDisplayName(sLanguage),
					"sap.ui.core.hyphenation.Hyphenation.canUseThirdPartyHyphenation()"
				);
			} else {
				Log.info(
					"[UI5 Hyphenation] Third-party hyphenation is not supported for language " + getLanguageDisplayName(sLanguage),
					"sap.ui.core.hyphenation.Hyphenation.canUseThirdPartyHyphenation()"
				);
			}

			oThirdPartySupportCheck[sLanguage] = bCanUseThirdPartyHyphenation;
		} else {
			bCanUseThirdPartyHyphenation = oThirdPartySupportCheck[sLanguage];
		}

		return bCanUseThirdPartyHyphenation;
	};

	/**
	 * Checks if <code>Hyphenation</code> API knows about the given language.
	 *
	 * If it is a known language, the API can be used to check browser-native and third-party support.
	 *
	 * @param {string} [sLang=module:sap/base/i18n/Localization.getLanguageTag().toString()] For what language to check. The global application language is the default one.
	 * @returns {boolean} True if the language is known to the <code>Hyphenation</code> API
	 * @public
	 */
	Hyphenation.prototype.isLanguageSupported = function (sLang) {
		var sLanguage = getLanguage(sLang),
			bIsSupported;

		if (!oSupportCheck.hasOwnProperty(sLanguage)) {
			bIsSupported = HyphenationTestingWords.hasOwnProperty(sLanguage);

			if (!bIsSupported) {
				Log.info(
					"[UI5 Hyphenation] Language " + getLanguageDisplayName(sLanguage) + " is not known to the Hyphenation API",
					"sap.ui.core.hyphenation.Hyphenation.isLanguageSupported()"
				);
			}

			oSupportCheck[sLanguage] = bIsSupported;
		} else {
			bIsSupported = oSupportCheck[sLanguage];
		}

		return bIsSupported;
	};

	/**
	 * Hyphenates the given text with the third-party library.
	 *
	 * Adds the soft hyphen symbol at the places where words can break.
	 *
	 * @param {string} sText The text to hyphenate
	 * @param {string} [sLang=module:sap/base/i18n/Localization.getLanguageTag().toString()] The language of the text. The global application language is the default one
	 * @returns {string} The text with the hyphens symbol added
	 * @public
	 */
	Hyphenation.prototype.hyphenate = function (sText, sLang) {
		var sLanguage = getLanguage(sLang);
		if (!oHyphenateMethods.hasOwnProperty(sLanguage)) {
			fireError("Language " + getLanguageDisplayName(sLanguage) + " is not initialized. You have to initialize it first with method 'initialize()'");
			return sText;
		}

		return oHyphenateMethods[sLanguage](sText);
	};

	/**
	 * What languages were initialized with {@link sap.ui.core.hyphenation.Hyphenation#initialize Hyphenation#initialize}
	 *
	 * @returns {Array} List of languages which were initialized
	 * @public
	 */
	Hyphenation.prototype.getInitializedLanguages = function () {
		return Object.keys(oHyphenateMethods).map(function(sLangPattern) {
			return getLanguageFromPattern(sLangPattern);
		});
	};

	/**
	 * Checks if the given language was initialized with {@link sap.ui.core.hyphenation.Hyphenation#initialize Hyphenation#initialize}
	 *
	 * @param {string} [sLang=module:sap/base/i18n/Localization.getLanguageTag().toString()] The language to check for
	 * @returns {boolean} True if the language was initialized
	 * @public
	 */
	Hyphenation.prototype.isLanguageInitialized = function (sLang) {
		var sLanguage = getLanguage(sLang);
		return Object.keys(oHyphenateMethods).indexOf(sLanguage) != -1;
	};

	/**
	 * Initializes the third-party library for the given language.
	 *
	 * Loads required third-party resources and language-specific resources.
	 *
	 * @example
	 * Hyphenation.getInstance().initialize("en").then(function() {
	 * 	console.log(Hyphenation.getInstance().hyphenate("An example text to hyphenate.", "en"));
	 * });
	 *
	 * @param {string} [sLang=module:sap/base/i18n/Localization.getLanguageTag().toString()] The language for which the third-party library should be initialized. The global application language is the default one
	 * @returns {Promise} A promise which resolves when all language resources are loaded. Rejects if the language is not supported
	 * @public
	 */
	Hyphenation.prototype.initialize = function (sLang) {
		var sLanguage = getLanguage(sLang);

		if (!oThirdPartySupportedLanguages[sLanguage]) {
			var sMessage = "Language " + getLanguageDisplayName(sLang) + " can not be initialized. It is either not supported by the third-party module or an error occurred";
			fireError(sMessage);
			return Promise.reject(sMessage);
		}

		if (oHyphenateMethods[sLanguage]) {
			return Promise.resolve();
		}

		var pInitLanguage;

		if (!this._pInitLanguage) {
			pInitLanguage = this._pInitLanguage = initializeLanguage(sLanguage)
				.then(function (fnHyphenator) {
					oHyphenateMethods[sLanguage] = fnHyphenator;
					this._pInitLanguage = null;
				}.bind(this));
		} else {
			// await the loading of the previous language, then initialize the current
			pInitLanguage = this._pInitLanguage.then(function () {
				return this.initialize(sLang);
			}.bind(this));
		}

		return pInitLanguage;
	};

	/**
	 * Returns the singleton instance of the Hyphenation API.
	 *
	 * @see sap.ui.core.hyphenation.Hyphenation
	 * @returns {sap.ui.core.hyphenation.Hyphenation} The singleton instance of the Hyphenation API
	 * @static
	 * @public
	 */
	Hyphenation.getInstance = function () {
		if (!oHyphenationInstance) {
			oHyphenationInstance = new Hyphenation();
		}

		return oHyphenationInstance;
	};

	return Hyphenation;
});

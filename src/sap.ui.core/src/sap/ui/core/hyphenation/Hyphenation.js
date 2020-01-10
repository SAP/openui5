/*!
* ${copyright}
*/

sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log", "sap/base/util/deepEqual", "sap/ui/core/Locale", "sap/ui/core/LocaleData"],
function (ManagedObject, Log, deepEqual, Locale, LocaleData) {
	"use strict";

	/**
	 * Words which are suitable for testing of browser-native hyphenation.
	 * @type {Object<string,string>}
	 * @private
	 */
	var oTestingWords = {
		"bg": "непротивоконституционствувателствувайте",
		"ca": "Psiconeuroimmunoendocrinologia",
		"hr": "prijestolonasljednikovičičinima",
		"cs": "nejnezdevětadevadesáteronásobitelnějšími",
		"da": "Gedebukkebensoverogundergeneralkrigskommandersergenten",
		"nl": "meervoudigepersoonlijkheidsstoornissen",
		"en-us": "pneumonoultramicroscopicsilicovolcanoconiosis",
		"et": "Sünnipäevanädalalõpupeopärastlõunaväsimus",
		"fi": "kolmivaihekilowattituntimittari",
		"fr": "hippopotomonstrosesquippedaliophobie",
		"de": "Kindercarnavalsoptochtvoorbereidingswerkzaamhedenplan",
		"el-monoton": "ηλεκτροεγκεφαλογράφημα", // no native css hyphenation by documentation, but will be tested
		"hi": "किंकर्तव्यविमूढ़", // no native css hyphenation by documentation, but will be tested
		"hu": "Megszentségteleníthetetlenségeskedéseitekért",
		"it": "hippopotomonstrosesquippedaliofobia",
		"lt": "nebeprisikiškiakopūstlapiaujančiuosiuose",
		"nb-no": "supercalifragilisticexpialidocious",
		"pl": "dziewięćdziesięciokilkuletniemu",
		"pt": "pneumoultramicroscopicossilicovulcanoconiose",
		"ru": "превысокомногорассмотрительствующий",
		"sr": "Семпаравиливичинаверсаламилитипиковски",
		"sl": "Dialektičnomaterialističen",
		"es": "Electroencefalografistas",
		"sv": "Realisationsvinstbeskattning",
		"th": "ตัวอย่างข้อความที่จะใช้ในการยืนยันการถ่ายโอน", // no native css hyphenation by documentation, but will be tested
		"tr": "Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine",
		"uk": "Нікотинамідаденіндинуклеотидфосфат"
	};

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
	var oPromisesForLang = {};
	var aLanguagesQueue = [];
	var mLanguageConfigs = {};

	/**
	 * Calls Hyphenopoly to initialize a language.
	 * Loads language-specific resources.
	 *
	 * @param {string} sLanguage What language to initialize
	 * @param {object} oConfig What config to sent to Hyphenopoly
	 * @param {function} resolve Callback to resolve the promise created on initialize
	 * @private
	 */
	function initializeLanguage(sLanguage, oConfig, resolve) {
		Log.info(
			"[UI5 Hyphenation] Initializing third-party module for language " + getLanguageDisplayName(sLanguage),
			"sap.ui.core.hyphenation.Hyphenation.initialize()"
		);

		window.hyphenopoly.initializeLanguage(oConfig)
			.then(onLanguageInitialized.bind(this, sLanguage, resolve));
	}

	/**
	 * Applies new config to a language.
	 *
	 * @param {string} sLanguage What language to re-initialize
	 * @param {object} oConfig What is the new config
	 * @param {function} resolve Callback to resolve the promise created on initialize
	 * @private
	 */
	function reInitializeLanguage(sLanguage, oConfig, resolve) {
		Log.info(
			"[UI5 Hyphenation] Re-initializing third-party module for language " + getLanguageDisplayName(sLanguage),
			"sap.ui.core.hyphenation.Hyphenation.initialize()"
		);

		window.hyphenopoly.reInitializeLanguage(sLanguage, oConfig)
			.then(onLanguageInitialized.bind(this, sLanguage, resolve));
	}

	/**
	 * A callback for when language initialization is ready.
	 *
	 * @param {string} sLanguage What language was initialized
	 * @param {function} resolve Callback to resolve the promise created on initialize
	 * @param {string} hyphenateMethod Is it asm or wasm
	 * @private
	 */
	function onLanguageInitialized(sLanguage, resolve, hyphenateMethod) {
		oHyphenateMethods[sLanguage] = hyphenateMethod;
		oHyphenationInstance.bIsInitialized = true;
		if (aLanguagesQueue.length > 0) {
			aLanguagesQueue.forEach(function (oElement) {
				initializeLanguage(oElement.sLanguage, oElement.oConfig, oElement.resolve);
			});
			aLanguagesQueue = [];
		}
		oHyphenationInstance.bLoading = false;
		resolve(
			getLanguageFromPattern(sLanguage)
		);
	}

	/**
	 * Transforms the given config so it can be sent to Hyphenopoly.
	 *
	 * @param {string} sLanguage The language for which a config is prepared.
	 * @param {object} oConfig Object map with configuration
	 * @returns {Object} {{require: [*], hyphen: string, path: (string|*)}}
	 * @private
	 */
	function prepareConfig(sLanguage, oConfig) {
		//Creating default configuration
		var oConfigurationForLanguage = {
			"require": [sLanguage],
			"hyphen": "\u00AD",
			"leftmin": 3, // The minimum of chars to remain on the old line.
			"rightmin": 3,// The minimum of chars to go on the new line
			"compound": "all", // factory-made -> fac-tory-[ZWSP]made
			"path": sap.ui.require.toUrl("sap/ui/thirdparty/hyphenopoly")
		};

		// we are passing only 3 properties to hyphenopoly: hyphen, exceptions and minWordLength
		if (oConfig) {
			if ("hyphen" in oConfig) {
				oConfigurationForLanguage.hyphen = oConfig.hyphen;
			}

			if ("minWordLength" in oConfig) {
				oConfigurationForLanguage.minWordLength = oConfig.minWordLength;
			}

			if ("exceptions" in oConfig) {
				Log.info(
					"[UI5 Hyphenation] Add hyphenation exceptions '" + JSON.stringify(oConfig.exceptions) + "' for language " + getLanguageDisplayName(sLanguage),
					"sap.ui.core.hyphenation.Hyphenation"
				);

				// transform "exceptions: {word1: "w-o-r-d-1", word2: "w-o-r-d-2"}" to "exceptions: {en-us: 'w-o-r-d-1,w-o-r-d-2'}"
				var aWordsExceptions = [];
				Object.keys(oConfig.exceptions).forEach(function(sWord) {
					aWordsExceptions.push(oConfig.exceptions[sWord]);
				});

				if (aWordsExceptions.length > 0) {
					oConfigurationForLanguage.exceptions = {};
					oConfigurationForLanguage.exceptions[sLanguage] = aWordsExceptions.join(", ");
				}
			}
		}

		return oConfigurationForLanguage;
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
			"-ms-hyphens:auto;",
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
	 * @param {string} sLang Language
	 * @private
	 */
	function createTest(sLang) {

		if (!fakeBody) {
			fakeBody = document.createElement("body");
		}
		var testDiv = document.createElement("div");
		testDiv.lang = sLang;
		testDiv.id = sLang;
		testDiv.style.cssText = css;
		testDiv.appendChild(document.createTextNode(oTestingWords[sLang]));
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
			oLocale = sap.ui.getCore().getConfiguration().getLocale();
		}

		var sLanguage = oLocale.getLanguage().toLowerCase();

		// adjustment of the language to corresponds to Hyphenopoly pattern files (.hpb files)
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
		}

		return sLanguage;
	}

	/**
	 * Gets language code from pattern name (hbp file name).
	 *
	 * @param {string} sPatternName The hpb file name
	 * @return {string} Language code
	 */
	function getLanguageFromPattern(sPatternName) {
		if (typeof sPatternName === "string") {
			return sPatternName.substring(0, 2); // get the main language code only
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Hyphenation = ManagedObject.extend("sap.ui.core.hyphenation.Hyphenation", {
		metadata: {
			library: "sap.ui.core",
			events: {
				/**
				 * Fired if an error with initialization or hyphenation occurs.
				 * @private
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
	 *
	 * @param {string} [sLang] For what language to check. The global application language is the default one
	 * @returns {(boolean|null)} True if native hyphenation works for the given language. False if native hyphenation will not work. Null if the language is not known to the Hyphenation API
	 * @public
	 */
	Hyphenation.prototype.canUseNativeHyphenation = function (sLang) {
		var sLanguage = getLanguage(sLang);
		var bCanUseNativeHyphenation;

		if (!this.isLanguageSupported(sLang)) {
			return null;
		}

		if (!oBrowserSupportCSS.hasOwnProperty(sLanguage)) {
			createTest(sLanguage);
			var testContainer = appendTests(document.documentElement);
			if (testContainer !== null) {
				var el = document.getElementById(sLanguage);
				if (checkCSSHyphensSupport(el) && el.offsetHeight > 12) {
					bCanUseNativeHyphenation = true;
				} else {
					bCanUseNativeHyphenation = false;
				}
				clearTests();
			}
			oBrowserSupportCSS[sLanguage] = bCanUseNativeHyphenation;

			if (bCanUseNativeHyphenation) {
				Log.info(
					"[UI5 Hyphenation] Browser-native hyphenation can be used for language " + getLanguageDisplayName(sLanguage),
					"sap.ui.core.hyphenation.Hyphenation.canUseNativeHyphenation()"
				);
			} else {
				Log.info(
					"[UI5 Hyphenation] Browser-native hyphenation is not supported by current platform for language " + getLanguageDisplayName(sLanguage),
					"sap.ui.core.hyphenation.Hyphenation.canUseNativeHyphenation()"
				);
			}
		} else {
			bCanUseNativeHyphenation = oBrowserSupportCSS[sLanguage];
		}

		return bCanUseNativeHyphenation;
	};

	/**
	 * Checks if third-party hyphenation works for the given language.
	 *
	 * @param {string} [sLang] For what language to check. The global application language is the default one.
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
	 * @param {string} [sLang] For what language to check. The global application language is the default one.
	 * @returns {boolean} True if the language is known to the <code>Hyphenation</code> API
	 * @public
	 */
	Hyphenation.prototype.isLanguageSupported = function (sLang) {
		var sLanguage = getLanguage(sLang),
			bIsSupported;

		if (!oSupportCheck.hasOwnProperty(sLanguage)) {
			bIsSupported = oTestingWords.hasOwnProperty(sLanguage);

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
	 * @param {string} [sLang] The language of the text. The global application language is the default one
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
	 * @param {string} sLang The language to check for
	 * @returns {boolean} True if the language was initialized
	 * @public
	 */
	Hyphenation.prototype.isLanguageInitialized = function (sLang) {
		var sLang = getLanguage(sLang);
		return Object.keys(oHyphenateMethods).indexOf(sLang) != -1;
	};

	/**
	 * Gets a list of word exceptions which was added for the given language.
	 *
	 * A word exception is a custom-defined hyphenation for a specific word. It's useful if the hyphenation algorithm does not hyphenate a given word correctly.
	 *
	 * @see sap.ui.core.hyphenation.Hyphenation#addExceptions
	 * @param {string} sLang The language for which to see the exceptions
	 * @returns {Object<string,string>} An object map with all exceptions for the given language
	 * @private
	 */
	Hyphenation.prototype.getExceptions = function (sLang) {
		var sLang = getLanguage(sLang);
		if (this.isLanguageInitialized(sLang)) {
			return window.hyphenopoly.languages[sLang].exceptions;
		} else {
			fireError("Language " + getLanguageDisplayName(sLang) + " is not initialized. You have to initialize it first with method 'initialize()'");
		}

	};

	/**
	 * Adds a list of exceptions defining how specific words should be hyphenated.
	 *
	 * This way a custom-defined hyphenation for a specific word can be defined. It's useful if the hyphenation algorithm does not hyphenate a given word correctly.
	 *
	 * @example
	 *
	 *   addExceptions("en", {"academy": "a-c-a-d-e-m-y"})
	 *
	 * @param {string} sLang The language for which an exception is added
	 * @param {Object<string,string>} oExceptions An object map of word exceptions. Example <code>{"academy": "a-c-a-d-e-m-y", "word": "w-o-r-d"}</code>
	 * @throws {Error} Logs an error if the language is not initialized
	 * @private
	 */
	Hyphenation.prototype.addExceptions = function (sLang, oExceptions) {
		var sLang = getLanguage(sLang);
		if (this.isLanguageInitialized(sLang)) {
			Log.info(
				"[UI5 Hyphenation] Add hyphenation exceptions '" + JSON.stringify(oExceptions) + "' for language " + getLanguageDisplayName(sLang),
				"sap.ui.core.hyphenation.Hyphenation.addExceptions()"
			);

			Object.keys(oExceptions).forEach(function (key) {
				window.hyphenopoly.languages[sLang].cache[key] = oExceptions[key];
				window.hyphenopoly.languages[sLang].exceptions[key] = oExceptions[key];
			});
		} else {
			fireError("Language " + getLanguageDisplayName(sLang) + " is not initialized. You have to initialize it first with method 'initialize()'");
		}
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
	 * @param {string} [sLang] The language for which the third-party library should be initialized. The global application language is the default one
	 * @returns {Promise} A promise which resolves when all language resources are loaded. Rejects if the language is not supported
	 * @public
	 */
	// Parameter oConfig is not mentioned in jsdoc on purpose. It is only for internal use for now.
	Hyphenation.prototype.initialize = function (sLang, oConfig) {
		var sLanguage = getLanguage(sLang);

		/**
		 * @type map
		 * @private
		 * @example
		 * {
		 *	hyphen: "-",
		 *	minWordLength: 6,
		 *	exceptions: {
		 *		"academy": "a-c-a-d-e-m-y",
		 *		"word": "w-o-r-d"
		 *	}
		 * }
		 */
		var oConfig = prepareConfig(sLanguage, oConfig);

		var bConfigChanged = true;
		if (mLanguageConfigs[sLanguage] && deepEqual(mLanguageConfigs[sLanguage], oConfig)) {
			bConfigChanged = false;
		}

		mLanguageConfigs[sLanguage] = oConfig;

		if (oThirdPartySupportedLanguages[sLanguage]) {
			if (!oHyphenationInstance.bIsInitialized && !oHyphenationInstance.bLoading) {

				oHyphenationInstance.bLoading = true;
				oPromisesForLang[sLanguage] = new Promise(function (resolve, reject) {
					loadScript(oConfig.path, "/hyphenopoly.bundle.js")
						.then(initializeLanguage.bind(this, sLanguage, oConfig, resolve));
				});

				return oPromisesForLang[sLanguage];

			} else if (oHyphenationInstance.bLoading && !oHyphenateMethods[sLanguage] && oPromisesForLang[sLanguage]) {

				return oPromisesForLang[sLanguage];

			} else if (this.isLanguageInitialized(sLanguage)) {
				// Reinitialize only if the config has changed.
				if (bConfigChanged) {
					oPromisesForLang[sLanguage] = new Promise(function (resolve) {
						reInitializeLanguage(sLanguage, oConfig, resolve);
					});
				}
			} else {
					oPromisesForLang[sLanguage] = new Promise(function (resolve, reject) {
						if (!oHyphenationInstance.bIsInitialized) {
							aLanguagesQueue.push({sLanguage:sLanguage, oConfig:oConfig, resolve:resolve });
						} else {
							initializeLanguage(sLanguage, oConfig, resolve);
						}

					});
			}
			oHyphenationInstance.bLoading = true;
			return oPromisesForLang[sLanguage];
		} else {
			var sMessage = "Language " + getLanguageDisplayName(sLang) + " can not be initialized. It is either not supported by the third-party module or an error occurred";
			fireError(sMessage);
			return new Promise(function (resolve, reject) {
				reject(sMessage);
			});
		}
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
			oHyphenationInstance.bIsInitialized = false;
			oHyphenationInstance.bLoading = false;
		}

		return oHyphenationInstance;
	};

	return Hyphenation;
});

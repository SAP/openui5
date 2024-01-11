/*global QUnit, sinon */

sap.ui.define("sap/ui/core/qunit/Hyphenation.qunit", [
	"sap/base/i18n/Localization",
	"sap/ui/core/Locale",
	"sap/ui/core/hyphenation/Hyphenation",
	"sap/ui/core/hyphenation/HyphenationTestingWords",
	"sap/ui/dom/includeScript",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(
	Localization,
	Locale,
	Hyphenation,
	HyphenationTestingWords,
	includeScript,
	Log,
	Device,
	createAndAppendDiv
) {
	"use strict";

var sSingleLangTest = "de",
	aSupportedLanguages = [
		"bg",
		"ca",
		"hr",
		"da",
		"nl",
		"en",
		"et",
		"fi",
		"fr",
		"de",
		"el",
		"hi",
		"hu",
		"it",
		"lt",
		"no",
		"pt",
		"ru",
		"sl",
		"es",
		"sv",
		"th",
		"tr",
		"uk"
	],
	aLanguagesWithNoThirdParty = [
		"cs", "pl", "sr"
	],
	aNotSupportedLanguages = [
		"mn", "vi", "test-lang"
	],
	mWords = {
		// lang: [not hyphenated, hyphenated]
		"bg": ["непротивоконституционствувателствувайте", "неп\u00ADро\u00ADти\u00ADво\u00ADкон\u00ADс\u00ADти\u00ADту\u00ADци\u00ADон\u00ADс\u00ADт\u00ADву\u00ADва\u00ADтел\u00ADс\u00ADт\u00ADву\u00ADвайте"],
		"ca": ["Psiconeuroimmunoendocrinologia", "Psi\u00ADco\u00ADneu\u00ADroim\u00ADmu\u00ADno\u00ADen\u00ADdo\u00ADcri\u00ADno\u00ADlo\u00ADgia"],
		"hr": ["prijestolonasljednikovičičinima", "pri\u00ADjes\u00ADto\u00ADlo\u00ADna\u00ADs\u00ADljed\u00ADni\u00ADko\u00ADvi\u00ADči\u00ADči\u00ADnima"],
		"da": ["Gedebukkebensoverogundergeneralkrigskommander", "Gede\u00ADbuk\u00ADke\u00ADben\u00ADsoverogun\u00ADder\u00ADge\u00ADne\u00ADral\u00ADkrigskom\u00ADman\u00ADder"], // original word was Gedebukkebensoverogundergeneralkrigskommandersergenten
		"nl": ["meervoudigepersoonlijkheidsstoornissen", "meer\u00ADvou\u00ADdi\u00ADge\u00ADper\u00ADsoon\u00ADlijk\u00ADheids\u00ADstoor\u00ADnis\u00ADsen"],
		"en": ["pneumonoultramicroscopicsilicovolcanoconiosis", "pneu\u00ADmo\u00ADnoul\u00ADtra\u00ADmi\u00ADcro\u00ADscop\u00ADic\u00ADsil\u00ADi\u00ADco\u00ADvol\u00ADcanoco\u00ADnio\u00ADsis"],
		"en-gb": ["pneumonoultramicroscopicsilicovolcanoconiosis", "pneu\u00ADmo\u00ADnoul\u00ADtra\u00ADmi\u00ADcro\u00ADscop\u00ADic\u00ADsil\u00ADi\u00ADco\u00ADvol\u00ADcanoco\u00ADnio\u00ADsis"],
		"en-us": ["pneumonoultramicroscopicsilicovolcanoconiosis", "pneu\u00ADmo\u00ADnoul\u00ADtra\u00ADmi\u00ADcro\u00ADscop\u00ADic\u00ADsil\u00ADi\u00ADco\u00ADvol\u00ADcanoco\u00ADnio\u00ADsis"],
		"et": ["Sünnipäevanädalalõpupeopärastlõunaväsimus", "Sün\u00ADni\u00ADpäe\u00ADva\u00ADnä\u00ADda\u00ADla\u00ADlõ\u00ADpu\u00ADpeo\u00ADpä\u00ADrast\u00ADlõu\u00ADna\u00ADvä\u00ADsi\u00ADmus"],
		"fi": ["kolmivaihekilowattituntimittari", "kolmivaihekilowattituntimittari"],
		"fr": ["hippopotomonstrosesquippedaliophobie", "hip\u00ADpo\u00ADpo\u00ADto\u00ADmons\u00ADtro\u00ADses\u00ADquip\u00ADpe\u00ADda\u00ADlio\u00ADpho\u00ADbie"],
		"de": ["Kindercarnavalsoptochtvoorbereidingswerkzaamheden", "Kin\u00ADder\u00ADcar\u00ADna\u00ADvals\u00ADop\u00ADtocht\u00ADvo\u00ADor\u00ADberei\u00ADdings\u00ADwerk\u00ADzaam\u00ADhe\u00ADden"], // original word was Kindercarnavalsoptochtvoorbereidingswerkzaamhedenplan
		"de-at": ["Kindercarnavalsoptochtvoorbereidingswerkzaamheden", "Kin\u00ADder\u00ADcar\u00ADna\u00ADvals\u00ADop\u00ADtocht\u00ADvo\u00ADor\u00ADberei\u00ADdings\u00ADwerk\u00ADzaam\u00ADhe\u00ADden"],
		"el": ["ηλεκτροεγκεφαλογράφημα", "ηλε\u00ADκτρο\u00ADε\u00ADγκε\u00ADφα\u00ADλο\u00ADγρά\u00ADφημα"],
		"hi": ["किंकर्तव्यविमूढ़", "किं\u00ADक\u00ADर्त\u00ADव्य\u00ADवि\u00ADमूढ़"],
		"hu": ["Megszentségteleníthetetlenségeskedéseitekért", "Meg\u00ADszent\u00ADség\u00ADte\u00ADle\u00ADnít\u00ADhe\u00ADtet\u00ADlen\u00ADsé\u00ADges\u00ADke\u00ADdé\u00ADse\u00ADi\u00ADte\u00ADkért"],
		"it": ["hippopotomonstrosesquippedaliofobia", "hip\u00ADpo\u00ADpo\u00ADto\u00ADmon\u00ADstro\u00ADse\u00ADsquip\u00ADpe\u00ADda\u00ADlio\u00ADfo\u00ADbia"],
		"lt": ["nebeprisikiškiakopūstlapiaujančiuosiuose", "nebe\u00ADpri\u00ADsi\u00ADkiš\u00ADkia\u00ADko\u00ADpūst\u00ADla\u00ADpiau\u00ADjan\u00ADčiuo\u00ADsiuose"],
		"no": ["Omtrentlig", "Omtrent\u00ADlig"],
		"pt": ["pneumoultramicroscopicossilicovulcanoconiose", "pneu\u00ADmoul\u00ADtra\u00ADmi\u00ADcros\u00ADco\u00ADpi\u00ADcos\u00ADsi\u00ADli\u00ADco\u00ADvul\u00ADca\u00ADno\u00ADco\u00ADni\u00ADose"],
		"ru": ["превысокомногорассмотрительствующий", "пре\u00ADвы\u00ADсо\u00ADком\u00ADно\u00ADго\u00ADрас\u00ADсмот\u00ADри\u00ADтель\u00ADству\u00ADю\u00ADщий"],
		"sl": ["Dialektičnomaterialističen", "Dia\u00ADlek\u00ADtič\u00ADno\u00ADma\u00ADte\u00ADri\u00ADa\u00ADli\u00ADsti\u00ADčen"],
		"es": ["Electroencefalografistas", "Elec\u00ADtro\u00ADen\u00ADce\u00ADfa\u00ADlo\u00ADgra\u00ADfis\u00ADtas"],
		"sv": ["Realisationsvinstbeskattning", "Rea\u00ADli\u00ADsa\u00ADtions\u00ADvinst\u00ADbe\u00ADskatt\u00ADning"],
		"th": ["ตัวอย่างข้อความที่จะใช้ใน", "ตัว\u00ADอย่าง\u00ADข้อ\u00ADความ\u00ADที่จะ\u00ADใช้ใน"],
		"tr": ["Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine", "Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine"],
		"uk": ["Нікотинамідаденіндинуклеотидфосфат", "Ніко\u00ADти\u00ADна\u00ADмі\u00ADда\u00ADде\u00ADнін\u00ADди\u00ADну\u00ADкле\u00ADо\u00ADтид\u00ADфо\u00ADсфат"]
	},
	mCompoundWords = {
		"en": ["factory-made", "fac\u00ADtory-\u200bmade"],
		"de": ["Geheimzahl-Aufschreiber", "Geheim\u00ADzahl-\u200bAuf\u00ADschrei\u00ADber"]
	},
	mTexts = {
		// lang: [not hyphenated, hyphenated]
		"en": [
			"A hyphenation algorithm is a set of rules that decides at which points a word can be broken over two lines with a hyphen.",
			"A hyphen\u00ADation algo\u00ADrithm is a set of rules that decides at which points a word can be bro\u00ADken over two lines with a hyphen."
		],
		"de": [
			"Die Worttrennung, auch Silbentrennung genannt, bezeichnet in der Orthographie die Art und Weise, wie die Wörter insbesondere am Zeilenende getrennt werden können.",
			"Die Wort\u00ADtren\u00ADnung, auch Sil\u00ADben\u00ADtren\u00ADnung genannt, bezeich\u00ADnet in der Ortho\u00ADgra\u00ADphie die Art und Weise, wie die Wör\u00ADter ins\u00ADbe\u00ADson\u00ADdere am Zei\u00ADlen\u00ADende getrennt wer\u00ADden kön\u00ADnen."
		],
		"ru": [
			"Пример текста, который будет служить для проверки перевода.",
			"При\u00ADмер тек\u00ADста, кото\u00ADрый будет слу\u00ADжить для про\u00ADверки пере\u00ADвода."
		]
	};

	function getDefaultLang() {
		var oLocale = new Locale(Localization.getLanguageTag()),
			sLanguage = oLocale.getLanguage().toLowerCase();

		return sLanguage;
	}

	var oTestDiv = createAndAppendDiv('tst1');
	oTestDiv.style.cssText = [
		"-moz-hyphens:auto;",
		"-webkit-hyphens:auto;",
		"hyphens:auto;",
		"width:48px;",
		"font-size:12px;",
		"line-height:12px;",
		"border:none;",
		"padding:0;",
		"word-wrap:normal"
	].join("");

	function canUseNativeHyphenationRaw() {
		var sLanguageOnThePage = document.documentElement.getAttribute("lang").toLowerCase();
		var sMappedLanguage = new Locale(Localization.getLanguageTag()).getLanguage().toLowerCase();

		// adjustment of the language to correspond to Hyphenopoly pattern files (.hpb files)
		switch (sMappedLanguage) {
			case "en":
				sMappedLanguage = "en-us";
				break;
			case "nb":
				sMappedLanguage = "nb-no";
				break;
			case "no":
				sMappedLanguage = "nb-no";
				break;
			case "el":
				sMappedLanguage = "el-monoton";
				break;
			default:
				break;
		}

		// we don't have a word to test for this language
		if (!HyphenationTestingWords[sMappedLanguage]) {
			return false;
		}

		oTestDiv.lang = sLanguageOnThePage;
		oTestDiv.innerText = HyphenationTestingWords[sMappedLanguage];

		// Chrome on macOS partially supported native hyphenation. It didn't hyphenate one word more than once.
		if (Device.os.macintosh && Device.browser.chrome) {
			return oTestDiv.offsetHeight > 24; // check if word is hyphenated more than once
		}

		return oTestDiv.offsetHeight > 12;
	}

	QUnit.module("Instance");

	QUnit.test("create instance", function(assert) {
		var oHyphenation = Hyphenation.getInstance();

		assert.ok(oHyphenation, "instance is created");
		assert.strictEqual(oHyphenation.isA("sap.ui.core.hyphenation.Hyphenation"), true, "instance is correct");
	});

	QUnit.module("Initialization", {
		before: function () {
			this.oHyphenation = Hyphenation.getInstance();
		}
	});

	QUnit.test("default initialize", function(assert) {
		assert.expect(1);

		var done = assert.async();

		this.oHyphenation.initialize().then(function() {
			var sDefaultLang = getDefaultLang();
			assert.strictEqual(this.oHyphenation.isLanguageInitialized(sDefaultLang), true, "default lang '" + sDefaultLang + "' was initialized");

			done();
		}.bind(this));
	});

	QUnit.test("initialize only single language - " + sSingleLangTest, function(assert) {
		assert.expect(2);

		var done = assert.async();

		this.oHyphenation.initialize(sSingleLangTest).then(function() {
			assert.strictEqual(this.oHyphenation.isLanguageInitialized(sSingleLangTest), true, "hyphenation api is initialized with language - " + sSingleLangTest);

			assert.ok(this.oHyphenation.getInitializedLanguages().indexOf(sSingleLangTest) > -1, "list of initialized languages contains " + sSingleLangTest);

			done();
		}.bind(this)).catch(function(e) {
			assert.ok(false, e);
		});
	});

	// WebAssembly is not supported in all browsers.
	if (window.WebAssembly) {
		QUnit.test("Multiple initialization calls", function(assert) {

			// Arrange
			var done = assert.async();
			var iForcedInitializations = 300;
			var oSpy = this.spy(window.WebAssembly, "instantiate");

			// Initialize the default language and after that try to force multiple initializations.
			this.oHyphenation.initialize().then(function() {

				oSpy.resetHistory();
				var aPromises = [];

				// Act
				for (var i = 0; i < iForcedInitializations; i++) {
					aPromises.push(new Promise(function (resolve) {
						this.oHyphenation.initialize()
							.then(resolve)
							.catch(resolve);
					}.bind(this)));
				}

				Promise.all(aPromises).then(function () {

					// Assert
					assert.ok(oSpy.notCalled, "Should only initialize once to avoid browser out of memory exceptions.");

					// Clean up
					oSpy.restore();
					done();
				});

			}.bind(this));
		});
	}

	QUnit.test("is language supported", function(assert) {
		var that = this;

		aSupportedLanguages.forEach(function(sLang) {
			assert.strictEqual(that.oHyphenation.isLanguageSupported(sLang), true, sLang + " is supported");
		});

		aNotSupportedLanguages.forEach(function(sLang) {
			assert.strictEqual(that.oHyphenation.isLanguageSupported(sLang), false, sLang + " is not supported");
		});
	});

	QUnit.test("initialize all supported languages", function(assert) {
		assert.expect(aSupportedLanguages.length + 1);

		var done = assert.async(),
			that = this,
			counter = 0;

		aSupportedLanguages.forEach(function(sLang) {

			that.oHyphenation.initialize(sLang).then(function() {
				counter++;
				assert.strictEqual(that.oHyphenation.isLanguageInitialized(sLang), true, sLang + " is initialized");

				if (counter >= aSupportedLanguages.length) {
					assert.strictEqual(that.oHyphenation.getInitializedLanguages().length, aSupportedLanguages.length, "all languages are initialized");
					done();
				}
			}).catch(function(e) {
				assert.ok(false, e);
			});
		});
	});

	QUnit.test("fail to initialize not supported languages", function(assert) {
		assert.expect(aNotSupportedLanguages.length * 2);

		var done = assert.async(),
			that = this,
			counter = 0;

		aNotSupportedLanguages.forEach(function(sLang) {
			assert.strictEqual(that.oHyphenation.isLanguageInitialized(sLang), false, sLang + " is by default not initialized");

			that.oHyphenation.initialize(sLang).then(function() {
				assert.ok(false, "not supported language '" + sLang + "' was initialized");
			}).catch(function(e) {
				counter++;
				assert.ok(true, sLang + " is not supported");

				if (counter === aNotSupportedLanguages.length) {
					done();
				}
			});
		});
	});

	QUnit.module("Hyphenation", {
		before : function () {
			this.oHyphenation = Hyphenation.getInstance();
		}
	});

	QUnit.test("can use third party hyphenation", function(assert) {
		var that = this;

		aSupportedLanguages.forEach(function(sLang) {
			assert.strictEqual(that.oHyphenation.canUseThirdPartyHyphenation(sLang), true, sLang + " is supported");
		});

		aLanguagesWithNoThirdParty.forEach(function(sLang) {
			assert.strictEqual(that.oHyphenation.canUseThirdPartyHyphenation(sLang), false, sLang + " is not supported");
		});
	});

	QUnit.test("can use native hyphenation", function(assert) {
		assert.strictEqual(canUseNativeHyphenationRaw(), this.oHyphenation.canUseNativeHyphenation(), "The Hyphenation instance should give the same result as the raw check.");
	});

	QUnit.test("hyphenate example words", function(assert) {
		var done = assert.async(),
			that = this,
			counter = 0,
			aLanguages = Object.keys(mWords);

		assert.expect(aLanguages.length + Object.keys(mCompoundWords).length);

		aLanguages.forEach(function(sLang) {
			that.oHyphenation.initialize(sLang).then(function() {
				counter++;
				assert.strictEqual(
					that.oHyphenation.hyphenate(mWords[sLang][0], sLang),
					mWords[sLang][1],
					"hyphenation of example word for '" + sLang + "' is ok"
				);

				if (mCompoundWords.hasOwnProperty(sLang)) {
					assert.strictEqual(
						that.oHyphenation.hyphenate(mCompoundWords[sLang][0], sLang),
						mCompoundWords[sLang][1],
						"compound word hyphenation for '" + sLang + "' is ok"
					);
				}

				if (counter === aLanguages.length) {
					done();
				}
			});
		});
	});

	QUnit.test("hyphenate example texts", function(assert) {
		var done = assert.async(),
			that = this,
			counter = 0,
			aLanguages = Object.keys(mTexts);

		assert.expect(aLanguages.length);

		aLanguages.forEach(function(sLang) {
			that.oHyphenation.initialize(sLang).then(function() {
				counter++;

				assert.strictEqual(
					that.oHyphenation.hyphenate(mTexts[sLang][0], sLang),
					mTexts[sLang][1],
					"hyphenation of example text for '" + sLang + "' is ok"
				);

				if (counter === aLanguages.length) {
					done();
				}
			});
		});
	});

	QUnit.test("fail to hyphenate with not initialized language", function(assert) {
		var oErrorLogSpy = this.spy(Log, "error"),
			onError = function() {
				assert.ok(true, "error event was thrown");
			};

		this.oHyphenation.attachEvent("error", onError);

		assert.strictEqual(this.oHyphenation.hyphenate("Lorem ipsum", "test-lang"), "Lorem ipsum", "hyphenate of uninitialized lang returns the same text without changes");

		assert.ok(oErrorLogSpy.calledOnce, "an error was logged");

		Log.error.restore();
		this.oHyphenation.detachEvent("error", onError);
	});

	QUnit.module("Hyphenopoly_Loader and Hyphenopoly.js overrides");

	QUnit.test("No credentials are sent when request is made", function (assert) {
		// Arrange
		var done = assert.async();
		var oFetchSpy = sinon.spy(window, "fetch");

		window.Hyphenopoly = {
			require: {
				"en-us": "FORCEHYPHENOPOLY"
			},
			setup: {
				keepAlive: false,
				hide: "DONT_HIDE"
			},
			handleEvent: {
				error: function () {
					// Assert
					assert.notOk(
						oFetchSpy.calledWith(sinon.match.any, { credentials: "include" }),
						"Credentials must NOT be included in the request"
					);

					// Clean up
					oFetchSpy.restore();
				},
				hyphenopolyEnd: function () {
					done();
				}
			}
		};

		// Act
		includeScript({
			url: sap.ui.require.toUrl("sap/ui/thirdparty/hyphenopoly/Hyphenopoly_Loader.js")
		});
	});

	QUnit.test("Auto fallback to asm.js when wasm is not allowed", function (assert) {
		// Arrange
		var done = assert.async();
		var oWasmInstanceStub = sinon.stub(WebAssembly, "Instance").throws("WebAssembly can't be used due to CSP restrictions.");

		window.Hyphenopoly = {
			require: {
				"en-us": "FORCEHYPHENOPOLY"
			},
			setup: {
				keepAlive: false,
				hide: "DONT_HIDE"
			},
			handleEvent: {
				engineReady: function (e) {
					// Assert
					assert.strictEqual(window.Hyphenopoly.cf.wasm, false);

					// Clean up
					oWasmInstanceStub.restore();
				},
				hyphenopolyEnd: function () {
					done();
				}
			}
		};

		// Act
		includeScript({
			url: sap.ui.require.toUrl("sap/ui/thirdparty/hyphenopoly/Hyphenopoly_Loader.js")
		});
	});

	QUnit.module("Language Code Extraction", {
		before: function () {
			this.oHyphenation = Hyphenation.getInstance();
			this.oLogSpy = sinon.spy(Log, "info");
		},
		after: function () {
			this.oLogSpy.restore();
		}
	});

	QUnit.test("Language code extraction from pattern name", function(assert) {
		var aTestLangCodes = ["cnr-ME", "sma-SE", "fa-IR"];
		var aExpectedLangCodes = ["cnr", "sma", "fa"];

		aTestLangCodes.forEach(function(sLangCode, i) {
			this.oHyphenation.isLanguageSupported(sLangCode);
			assert.ok(this.oLogSpy.calledWithMatch("[UI5 Hyphenation] Language '" + aExpectedLangCodes[i] + "'"),
				"Language code '" + aExpectedLangCodes[i] + "' is correctly extracted in the logs for '" + sLangCode + "'");
			this.oLogSpy.resetHistory();
		}, this);
	});

});

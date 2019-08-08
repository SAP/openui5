/*global QUnit */

sap.ui.define("sap/ui/core/qunit/Hyphenation.qunit", [
    "sap/ui/core/hyphenation/Hyphenation",
    "sap/ui/Device",
    "sap/base/Log"
], function(Hyphenation, Device, Log) {
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
        "bg": ["непротивоконституционствувателствувайте", "неп-ро-ти-во-кон-с-ти-ту-ци-он-с-т-ву-ва-тел-с-т-ву-вайте"],
        "ca": ["Psiconeuroimmunoendocrinologia", "Psi-co-neu-roim-mu-no-en-do-cri-no-lo-gia"],
        "hr": ["prijestolonasljednikovičičinima", "pri-jes-to-lo-na-s-ljed-ni-ko-vi-či-či-nima"],
        "da": ["Gedebukkebensoverogundergeneralkrigskommander", "Gede-buk-ke-ben-soverogun-der-ge-ne-ral-krigskom-man-der"], // original word was Gedebukkebensoverogundergeneralkrigskommandersergenten
        "nl": ["meervoudigepersoonlijkheidsstoornissen", "meer-vou-di-ge-per-soon-lijk-heids-stoor-nis-sen"],
        "en": ["pneumonoultramicroscopicsilicovolcanoconiosis", "pneu-mo-noul-tra-mi-cro-scop-ic-sil-i-co-vol-canoco-nio-sis"],
        "en-gb": ["pneumonoultramicroscopicsilicovolcanoconiosis", "pneu-mo-noul-tra-mi-cro-scop-ic-sil-i-co-vol-canoco-nio-sis"],
        "en-us": ["pneumonoultramicroscopicsilicovolcanoconiosis", "pneu-mo-noul-tra-mi-cro-scop-ic-sil-i-co-vol-canoco-nio-sis"],
        "et": ["Sünnipäevanädalalõpupeopärastlõunaväsimus", "Sün-ni-päe-va-nä-da-la-lõ-pu-peo-pä-rast-lõu-na-vä-si-mus"],
        "fi": ["kolmivaihekilowattituntimittari", "kolmivaihekilowattituntimittari"],
        "fr": ["hippopotomonstrosesquippedaliophobie", "hip-po-po-to-mons-tro-ses-quip-pe-da-lio-pho-bie"],
        "de": ["Kindercarnavalsoptochtvoorbereidingswerkzaamheden", "Kin-der-car-na-vals-op-tocht-vo-or-berei-dings-werk-zaam-he-den"], // original word was Kindercarnavalsoptochtvoorbereidingswerkzaamhedenplan
        "de-at": ["Kindercarnavalsoptochtvoorbereidingswerkzaamheden", "Kin-der-car-na-vals-op-tocht-vo-or-berei-dings-werk-zaam-he-den"],
        "el": ["ηλεκτροεγκεφαλογράφημα", "ηλε-κτρο-ε-γκε-φα-λο-γρά-φημα"],
        "hi": ["किंकर्तव्यविमूढ़", "किं-क-र्-त-व्-य-वि-मूढ़"],
        "hu": ["Megszentségteleníthetetlenségeskedéseitekért", "Meg-szent-ség-te-le-nít-he-tet-len-sé-ges-ke-dé-se-i-te-kért"],
        "it": ["hippopotomonstrosesquippedaliofobia", "hip-po-po-to-mon-stro-se-squip-pe-da-lio-fo-bia"],
        "lt": ["nebeprisikiškiakopūstlapiaujančiuosiuose", "nebe-pri-si-kiš-kia-ko-pūst-la-piau-jan-čiuo-siuose"],
        "no": ["Omtrentlig", "Omtrent-lig"],
        "pt": ["pneumoultramicroscopicossilicovulcanoconiose", "pneu-moul-tra-mi-cros-co-pi-cos-si-li-co-vul-ca-no-co-ni-ose"],
        "ru": ["превысокомногорассмотрительствующий", "пре-вы-со-ком-но-го-рас-смот-ри-тель-ству-ю-щий"],
        "sl": ["Dialektičnomaterialističen", "Dia-lek-tič-no-ma-te-ri-a-li-sti-čen"],
        "es": ["Electroencefalografistas", "Elec-tro-en-ce-fa-lo-gra-fis-tas"],
        "sv": ["Realisationsvinstbeskattning", "Rea-li-sa-tions-vinst-be-skatt-ning"],
        "th": ["ตัวอย่างข้อความที่จะใช้ใน", "ตัวอย่างข้อค-วามที่จะใช้ใน"],
        "tr": ["Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine", "Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine"],
        "uk": ["Нікотинамідаденіндинуклеотидфосфат", "Ніко-ти-на-мі-да-де-нін-ди-ну-кле-о-тид-фо-сфат"]
    },
    mCompoundWords = {
        "en": ["factory-made", "fac-tory-​made"],
        "de": ["Geheimzahl-Aufschreiber", "Geheim-zahl-​Auf-schrei-ber"]
    },
    mTexts = {
        // lang: [not hyphenated, hyphenated]
        "en": [
            "A hyphenation algorithm is a set of rules that decides at which points a word can be broken over two lines with a hyphen.",
            "A hyphen-ation algo-rithm is a set of rules that decides at which points a word can be bro-ken over two lines with a hyphen."
        ],
        "de": [
            "Die Worttrennung, auch Silbentrennung genannt, bezeichnet in der Orthographie die Art und Weise, wie die Wörter insbesondere am Zeilenende getrennt werden können.",
            "Die Wort-tren-nung, auch Sil-ben-tren-nung genannt, bezeich-net in der Ortho-gra-phie die Art und Weise, wie die Wör-ter ins-be-son-dere am Zei-len-ende getrennt wer-den kön-nen."
        ],
        "ru": [
            "Пример текста, который будет служить для проверки перевода.",
            "При-мер тек-ста, кото-рый будет слу-жить для про-верки пере-вода."
        ]
    },
    mExceptionsEn = {
        "hyphen": "h-y-p-h-e-n",
        "example": "example"
    };

    function getDefaultLang() {
        var oLocale = sap.ui.getCore().getConfiguration().getLocale(),
            sLanguage = oLocale.getLanguage().toLowerCase();

        return sLanguage;
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
        assert.expect(3);

        var done = assert.async();

        this.oHyphenation.initialize().then(function() {
            assert.strictEqual(this.oHyphenation.bIsInitialized, true, "hyphenation api is initialized with default params");

            var sDefaultLang = getDefaultLang();
            assert.strictEqual(this.oHyphenation.isLanguageInitialized(sDefaultLang), true, "default lang '" + sDefaultLang + "' was initialized");
            assert.deepEqual(this.oHyphenation.getExceptions(), {}, "there are no exceptions defined");

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

				oSpy.reset();
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

    QUnit.test("change hyphen symbol", function(assert) {
        assert.expect(1);

        var done = assert.async(),
            that = this;

        this.oHyphenation.initialize("en", {"hyphen": "-"}).then(function() {
            assert.strictEqual(
                that.oHyphenation.hyphenate("hyphenation", "en"),
                "hyphen-ation",
                "hyphenation symbol is changed to '-'"
            );
            done();
        });
    });

    QUnit.test("hyphenate example words", function(assert) {
        var done = assert.async(),
            that = this,
            counter = 0,
            aLanguages = Object.keys(mWords);

        assert.expect(aLanguages.length + Object.keys(mCompoundWords).length);

        aLanguages.forEach(function(sLang) {
            that.oHyphenation.initialize(sLang, {"hyphen": "-"}).then(function() {
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
            that.oHyphenation.initialize(sLang, {"hyphen": "-"}).then(function() {
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

    QUnit.module("Word exceptions", {
        before : function () {
            this.oHyphenation = Hyphenation.getInstance();
        }
    });

    QUnit.test("reinitialize a language to add exceptions", function(assert) {
        assert.expect(3);

        var done = assert.async(),
            that = this;

        this.oHyphenation.initialize("en", {hyphen: "-", exceptions: mExceptionsEn}).then(function() {
            assert.deepEqual(that.oHyphenation.getExceptions("en"), mExceptionsEn, "get exceptions returns correct exceptions");

            assert.strictEqual(that.oHyphenation.hyphenate("hyphen", "en"), "h-y-p-h-e-n", "exception for word 'hyphen' works");
            assert.strictEqual(that.oHyphenation.hyphenate("example", "en"), "example", "exception for word 'example' works");

            done();
        });
    });

    QUnit.test("reinitialize a language to remove exceptions", function(assert) {
        assert.expect(3);

        var done = assert.async(),
            that = this;

        this.oHyphenation.initialize("en").then(function() {
            assert.notDeepEqual(that.oHyphenation.getExceptions(), mExceptionsEn, "get exceptions returns correct exceptions");

            assert.notEqual(that.oHyphenation.hyphenate("hyphen", "en"), "h-y-p-h-e-n", "there are no exceptions for word 'hyphen'");
            assert.notEqual(that.oHyphenation.hyphenate("example", "en"), "example", "there are no exceptions for word 'example'");

            done();
        });
    });

    QUnit.test("add exceptions and get exceptions", function(assert) {
        assert.expect(3);

        var done = assert.async(),
            that = this;

        this.oHyphenation.initialize("en").then(function() {
            that.oHyphenation.addExceptions("en", mExceptionsEn);

            assert.deepEqual(that.oHyphenation.getExceptions("en"), mExceptionsEn, "get exceptions returns correct exceptions");

            assert.strictEqual(that.oHyphenation.hyphenate("hyphen", "en"), "h-y-p-h-e-n", "exception for word 'hyphen' works");
            assert.strictEqual(that.oHyphenation.hyphenate("example", "en"), "example", "exception for word 'example' works");

            done();
        });
    });
});

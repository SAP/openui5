import Locale from "sap/ui/core/Locale";
var aLocales = [
    ["en", "en", null, null, null, null, null, "EN"],
    ["en-US", "en", null, "US", null, null, null, "EN"],
    ["es-419", "es", null, "419", null, null, null, "ES"],
    ["zh-Hans", "zh", "Hans", null, null, null, null, "ZH"],
    ["zh-yue", "zh-yue", null, null, null, null, null, "ZH"],
    ["az-Latn", "az", "Latn", null, null, null, null, "AZ"],
    ["zh-Hant-HK", "zh", "Hant", "HK", null, null, null, "ZF"],
    ["zh-TW", "zh", null, "TW", null, null, null, "ZF"],
    ["sl-IT-nedis", "sl", null, "IT", "nedis", null, null, "SL"],
    ["de-CH-1901", "de", null, "CH", "1901", null, null, "DE"],
    ["sl-IT-nedis-0815", "sl", null, "IT", "nedis-0815", null, null, "SL"],
    ["sl-IT-var0815", "sl", null, "IT", "var0815", null, null, "SL"],
    ["de-DE-u-co-phonebk", "de", null, "DE", null, "u-co-phonebk", null, "DE"],
    ["de-DE-u-co-i-kl", "de", null, "DE", null, "u-co-i-kl", null, "DE"],
    ["en-US-x-twain", "en", null, "US", null, null, "x-twain", "EN"],
    ["en_US", "en", null, "US", null, null, null, "EN"],
    ["EN-US", "en", null, "US", null, null, null, "EN"],
    ["en-us", "en", null, "US", null, null, null, "EN"],
    ["zh_hant_hk", "zh", "Hant", "HK", null, null, null, "ZF"],
    ["en-x-saptrc", "en", null, null, null, null, "x-saptrc", "1Q"],
    ["EN-X-sAptRc", "en", null, null, null, null, "X-sAptRc", "1Q"],
    ["en-x-sappsd", "en", null, null, null, null, "x-sappsd", "2Q"],
    ["bg-x-saprigi", "bg", null, null, null, null, "x-saprigi", "3Q"],
    ["de-CH-x-sapufmt-sappsd", "de", null, "CH", null, null, "x-sapufmt-sappsd", "2Q"],
    ["sh", "sh", null, null, null, null, null, "SH"],
    ["sr-Latn", "sr", "Latn", null, null, null, null, "SH"],
    ["iw-IL", "iw", null, "IL", null, null, null, "HE"],
    ["ji", "ji", null, null, null, null, null, "YI"],
    ["zz", "zz", null, null, null, null, null, "ZZ"]
];
function localeTest(sLocale, sLanguage, sScript, sRegion, sVariant, sExtension, sPrivateUse) {
    QUnit.test("Locale " + sLocale, function (assert) {
        var oLocale = new Locale(sLocale);
        assert.strictEqual(oLocale.getLanguage(), sLanguage, "Language");
        assert.strictEqual(oLocale.getScript(), sScript, "Script");
        assert.strictEqual(oLocale.getRegion(), sRegion, "Region");
        assert.strictEqual(oLocale.getVariant(), sVariant, "Variant");
        assert.strictEqual(oLocale.getExtension(), sExtension, "Extension");
        assert.strictEqual(oLocale.getPrivateUse(), sPrivateUse, "PrivateUse");
    });
}
aLocales.forEach(function (aLocaleData) {
    localeTest.apply(this, aLocaleData);
});
QUnit.test("hasPrivateUseSubtag", function (assert) {
    var oLocale = new Locale("de_DE-x-sapufmt");
    assert.equal(oLocale.getPrivateUse(), "x-sapufmt", "PrivateUse must be set");
    assert.equal(oLocale.hasPrivateUseSubtag("sapufmt"), true, "PrivateUse subtag must be detected");
    assert.equal(oLocale.hasPrivateUseSubtag("sap"), false, "parts of PrivateUse subtag must not be detected");
    assert.equal(oLocale.hasPrivateUseSubtag("apu"), false, "parts of PrivateUse subtag must not be detected");
    assert.equal(oLocale.hasPrivateUseSubtag("ufmt"), false, "parts of PrivateUse subtag must not be detected");
});
QUnit.test("getSAPLogonLanguage", function (assert) {
    aLocales.forEach(function (aLocaleData) {
        var oLocale = new Locale(aLocaleData[0]);
        assert.equal(oLocale.getSAPLogonLanguage(), aLocaleData[7], "locale '" + aLocaleData[0] + "'" + " should return the SAP logon language '" + aLocaleData[7] + "'");
    });
});
QUnit.test("fromSAPLogonLanguage", function (assert) {
    assert.equal(Locale.fromSAPLogonLanguage("ZH").toString(), "zh-Hans");
    assert.equal(Locale.fromSAPLogonLanguage("ZF").toString(), "zh-Hant");
    assert.equal(Locale.fromSAPLogonLanguage("SH").toString(), "sr-Latn");
    assert.equal(Locale.fromSAPLogonLanguage("6N").toString(), "en-GB");
    assert.equal(Locale.fromSAPLogonLanguage("1P").toString(), "pt-PT");
    assert.equal(Locale.fromSAPLogonLanguage("1X").toString(), "es-MX");
    assert.equal(Locale.fromSAPLogonLanguage("3F").toString(), "fr-CA");
    assert.equal(Locale.fromSAPLogonLanguage("1Q").toString(), "en-US-x-saptrc");
    assert.equal(Locale.fromSAPLogonLanguage("2Q").toString(), "en-US-x-sappsd");
    assert.equal(Locale.fromSAPLogonLanguage("3Q").toString(), "en-US-x-saprigi");
    assert.strictEqual(Locale.fromSAPLogonLanguage(""), undefined, "no language");
    assert.strictEqual(Locale.fromSAPLogonLanguage(false), undefined, "no language");
    assert.strictEqual(Locale.fromSAPLogonLanguage({}), undefined, "no language");
    assert.strictEqual(Locale.fromSAPLogonLanguage("1E"), undefined, "no language");
    assert.equal(Locale.fromSAPLogonLanguage("XX").toString(), "xx");
});
QUnit.test("fromSAPLogonLanguage reverse getSAPLogonLanguage", function (assert) {
    ["ZH", "ZF", "SH", "6N", "1P", "1X", "3F", "1Q", "2Q", "3Q"].forEach(function (sSAPLanguage) {
        assert.equal(Locale.fromSAPLogonLanguage(sSAPLanguage).getSAPLogonLanguage(), sSAPLanguage);
    });
});
QUnit.test("toLanguageTag", function (assert) {
    assert.equal(new Locale("sh").toLanguageTag(), "sh");
    assert.equal(new Locale("sr-Latn").toLanguageTag(), "sh");
    assert.equal(new Locale("sr-RS").toLanguageTag(), "sr-RS");
    assert.equal(new Locale("sh-RS").toLanguageTag(), "sh-RS");
    assert.equal(new Locale("en-GB").toLanguageTag(), "en-GB");
    assert.equal(new Locale("iw").toLanguageTag(), "he");
    assert.equal(new Locale("ji").toLanguageTag(), "yi");
});
import Log from "sap/base/Log";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Properties from "sap/base/util/Properties";
import merge from "sap/base/util/merge";
QUnit.module("sap/base/i18n/ResourceBundle", {
    beforeEach: function () {
        var oConfiguration = sap.ui.getCore().getConfiguration();
        var aSupportedLanguages = oConfiguration.getSupportedLanguages();
        this.oSupportedLanguagesStub = sinon.stub(oConfiguration, "getSupportedLanguages");
        this.oSupportedLanguagesStub.returns(aSupportedLanguages);
        this.oLogErrorStub = sinon.stub(Log, "error");
    },
    afterEach: function () {
        this.oLogErrorStub.restore();
        this.oSupportedLanguagesStub.restore();
    }
});
QUnit.test("create invalid url", function (assert) {
    assert.throws(ResourceBundle.create, new Error("resource URL '' has unknown type (should be one of .properties,.hdbtextbundle)"), "creation fails without valid url");
});
QUnit.test("create", function (assert) {
    var done = assert.async();
    var oEmptyProps = createFakeProperties({ number: "47" });
    var oStub = sinon.stub(Properties, "create").returns(Promise.resolve(oEmptyProps));
    ResourceBundle.create({ url: "my.properties", async: true }).then(function (oResourceBundle) {
        assert.deepEqual(oResourceBundle.aPropertyFiles[0], oEmptyProps, "properties are correctly loaded");
        oStub.restore();
        done();
    });
});
function createFakeProperties(obj, oCallStub) {
    return {
        getProperty: function (sKey) {
            if (oCallStub) {
                oCallStub(obj);
            }
            return obj[sKey];
        }
    };
}
function createFakePropertiesPromise(obj, oCallStub) {
    return Promise.resolve(createFakeProperties(obj, oCallStub));
}
function createResourceBundleWithCustomBundles(sinon) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    var oResourceBundle1;
    var oResourceBundleCustom1;
    var oResourceBundleCustom2;
    return ResourceBundle.create({ url: "my.properties", locale: "en", async: true }).then(function (oResourceBundle) {
        oResourceBundle1 = oResourceBundle;
        oStub.restore();
        oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "45", mec1: "ya" }));
        return ResourceBundle.create({ url: "custom1.properties", locale: "en", async: true });
    }).then(function (oResourceBundle) {
        oResourceBundleCustom1 = oResourceBundle;
        oStub.restore();
        oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "46", mec2: "ye" }));
        return ResourceBundle.create({ url: "custom2.properties", locale: "en", async: true });
    }).then(function (oResourceBundle) {
        oResourceBundleCustom2 = oResourceBundle;
        oResourceBundle1._enhance(oResourceBundleCustom1);
        oResourceBundle1._enhance(oResourceBundleCustom2);
        oStub.restore();
        return oResourceBundle1;
    });
}
QUnit.test("multiple resource bundles using _enhance", function (assert) {
    return createResourceBundleWithCustomBundles(sinon).then(function (oResourceBundle) {
        assert.ok(oResourceBundle, "enhancing a resourceBundle works");
    });
});
QUnit.test("fallback locale: fallbackLocale undefined", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: ["en"], fallbackLocale: undefined }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_en.properties", "en properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: supportedLocales undefined", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: undefined }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: supportedLocales empty, fallback set", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: [], fallbackLocale: "da" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: supportedLocales undefined, fallback set", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: undefined, fallbackLocale: "da" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: supportedLocales not defined, fallback set", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, fallbackLocale: "da" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: supportedLocales does not contain fallbackLocale", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    var mParams = { url: "my.properties", locale: "de", async: true, supportedLocales: ["de", "fr"], fallbackLocale: "da" };
    assert.throws(function () {
        ResourceBundle.create(mParams);
    }, new Error("The fallback locale 'da' is not contained in the list of supported locales ['de', 'fr'] of the bundle 'my.properties' and will be ignored."));
    oStub.restore();
});
QUnit.test("fallback locale: supportedLocales not defined, but configuration has supportedLocales", function (assert) {
    this.oSupportedLanguagesStub.returns(["da", "en"]);
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, fallbackLocale: "da" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_da.properties", "only da properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: matching fallback", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: ["da", "en"], fallbackLocale: "da" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_da.properties", "only da properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: empty fallback", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: ["da", "en", ""], fallbackLocale: "" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my.properties", "only raw properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: default fallback is 'en'", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: ["da", "en"] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_en.properties", "only en properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale: default fallback, 'en' is not supported", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: ["da"] }).then(function () {
        assert.equal(oStub.callCount, 0, "is not called because no locale from the fallback chain is supported");
        oStub.restore();
    });
});
QUnit.test("fallback locale: fallback with region not supported", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    assert.throws(function () {
        ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: ["da"], fallbackLocale: "en_US" });
    }, new Error("The fallback locale 'en_US' is not contained in the list of supported locales ['da'] of the bundle 'my.properties' and will be ignored."));
    assert.equal(oStub.callCount, 0, "is not called because no locale from the fallback chain is supported");
    oStub.restore();
});
QUnit.test("fallback locale: default fallback, empty is supported", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: ["da", ""] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");
        oStub.restore();
    });
});
QUnit.test("fallback locale with supportedLocales (normalization)", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    var aSupportedLocales = ["he", "en"];
    var pResourceBundle = ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: "iw" });
    return pResourceBundle.then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_he.properties", "locale is normalized but 'he' is part of the supportedLocales therefore 'iw' is mapped to 'he'");
        oStub.restore();
    });
});
QUnit.test("fallback locale with supportedLocales empty value (normalization)", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    var aSupportedLocales = ["he", "en", ""];
    var pResourceBundle = ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: "" });
    return pResourceBundle.then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my.properties", "empty language is supported and configured as fallback");
        oStub.restore();
    });
});
QUnit.test("fallback locale with supportedLocales hebrew 'he_IL' is supported via fallback 'he_IL'", function (assert) {
    var sFallbackLocale = "he_IL";
    var aSupportedLocales = ["he_IL"];
    var sExpectedLocale = "he_IL";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: sFallbackLocale }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("locale sr -> sh", function (assert) {
    var sExpectedLocale = "sh";
    var sLocale = "sr";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("locale sr -> (supportedLocales: ['sh'])", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    var sLocale = "sr";
    var aSupportedLocales = ["sh"];
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales }).then(function () {
        assert.equal(oStub.callCount, 1);
        oStub.restore();
    });
});
QUnit.test("locale sh -> sh", function (assert) {
    var sExpectedLocale = "sh";
    var sLocale = "sh";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("locale sh -> sh (supportedLocales: ['sh'])", function (assert) {
    var sExpectedLocale = "sh";
    var sLocale = "sh";
    var aSupportedLocales = ["sh"];
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("locale sh -> sr_Latn (supportedLocales: ['sr_Latn'])", function (assert) {
    var sExpectedLocale = "sr_Latn";
    var sLocale = "sh";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: ["sr_Latn"] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("locale sr-Latn -> sh", function (assert) {
    var sExpectedLocale = "sh";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "sr-Latn", async: true }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("locale sr-Latn -> sr_Latn (supportedLocales: ['sr_Latn'])", function (assert) {
    var sExpectedLocale = "sr_Latn";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "sr-Latn", async: true, supportedLocales: ["sr_Latn"] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("locale sr-Latn -> sh (supportedLocales: ['sh'])", function (assert) {
    var sExpectedLocale = "sh";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "sr-Latn", async: true, supportedLocales: ["sh"] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("supportedLocales hebrew 'he_IL' with input 'he_Latn_IL'", function (assert) {
    var sLocale = "he_Latn_IL";
    var aSupportedLocales = ["he_IL"];
    var sExpectedLocale = "he_IL";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("supportedLocales hebrew 'iw_IL' with input 'he_Latn_IL'", function (assert) {
    var sLocale = "he_Latn_IL";
    var aSupportedLocales = ["iw_IL"];
    var sExpectedLocale = "iw_IL";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("supportedLocales hebrew 'he' with input 'he_IL'", function (assert) {
    var sLocale = "he_IL";
    var aSupportedLocales = ["he"];
    var sExpectedLocale = "he";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("supportedLocales hebrew 'iw' with input 'he_IL'", function (assert) {
    var sLocale = "he_IL";
    var aSupportedLocales = ["iw"];
    var sExpectedLocale = "iw";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("supportedLocales hebrew 'iw' with input 'he_Latn_IL'", function (assert) {
    var aSupportedLocales = ["iw"];
    var sLocale = "he_Latn_IL";
    var sExpectedLocale = "iw";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("supportedLocales hebrew 'he' with input 'he_Latn_IL'", function (assert) {
    var aSupportedLocales = ["he"];
    var sLocale = "he_Latn_IL";
    var sExpectedLocale = "he";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("fallback locale with new supportedLocales hebrew 'he' with input 'iw_Latn_IL'", function (assert) {
    var aSupportedLocales = ["he"];
    var sLocale = "iw_Latn_IL";
    var sExpectedLocale = "he";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("fallback locale with new supportedLocales hebrew 'iw' with input 'iw_Latn_IL'", function (assert) {
    var aSupportedLocales = ["iw"];
    var sLocale = "iw_Latn_IL";
    var sExpectedLocale = "iw";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("fallback locale with sr-Latn", function (assert) {
    var aSupportedLocales = ["sr-Latn"];
    var sLocale = "sh";
    var sExpectedLocale = "sr_Latn";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("fallback locale with new supportedLocales hebrew 'iw-IL' with input 'iw_Latn_IL'", function (assert) {
    var aSupportedLocales = ["iw-IL"];
    var sLocale = "iw_Latn_IL";
    var sExpectedLocale = "iw_IL";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("fallback locale with new supportedLocales hebrew 'he-IL' with input 'iw_Latn_IL'", function (assert) {
    var aSupportedLocales = ["he-IL"];
    var sLocale = "iw_Latn_IL";
    var sExpectedLocale = "he_IL";
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: aSupportedLocales[0] }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_" + sExpectedLocale + ".properties", "correct properties file is loaded");
        oStub.restore();
    });
});
QUnit.test("fallback locale with invalid supportedLocales", function (assert) {
    var aSupportedLocales = ["en", "Italienisch", "Deutsch"];
    assert.throws(function () {
        ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: aSupportedLocales });
    }, new TypeError("Locale 'Italienisch' is not a valid BCP47 language tag"), "error is thrown because of invalid parameter values");
});
QUnit.test("fallback locale with invalid supportedLocales undefined", function (assert) {
    var aSupportedLocales = [undefined];
    assert.throws(function () {
        ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: aSupportedLocales });
    }, new TypeError("Locale 'undefined' is not a valid BCP47 language tag"), "error is thrown because of invalid parameter values");
});
QUnit.test("fallback locale with invalid value", function (assert) {
    var aSupportedLocales = ["it"];
    assert.throws(function () {
        ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: "Italienisch" });
    }, new TypeError("Locale 'Italienisch' is not a valid BCP47 language tag"), "error is thrown because of invalid parameter values");
});
QUnit.test("fallback locale with modification of supportedLocales (side effects)", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    var aSupportedLocales = ["da", "en"];
    var pResourceBundle = ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: aSupportedLocales, fallbackLocale: "da" });
    aSupportedLocales.splice(0, 2);
    assert.equal(aSupportedLocales.length, 0, "supported locales array is empty");
    return pResourceBundle.then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my_da.properties", "although aSupportedLocales is modified ResourceBundle.create is not affected");
        oStub.restore();
    });
});
QUnit.test("_getFallbackLocales", function (assert) {
    var aSupportedLocales = ["en", "es", "fr", "zh_CN", "zh_TW"];
    assert.deepEqual(ResourceBundle._getFallbackLocales("de-CH"), ["de_CH", "de", "en", ""], "fallback chain without knowledge about supported locales");
    assert.deepEqual(ResourceBundle._getFallbackLocales("de-CH", aSupportedLocales), ["en"], "fallback chain with knowledge about supported locales");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh-HK", aSupportedLocales), ["zh_TW", "en"], "fallback for zh-HK");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh_HK", aSupportedLocales), ["zh_TW", "en"], "fallback for zh_HK");
    assert.deepEqual(ResourceBundle._getFallbackLocales("de", aSupportedLocales), ["en"], "default fallbackLocale supported");
    assert.deepEqual(ResourceBundle._getFallbackLocales("es", aSupportedLocales), ["es", "en"], "fallback for es");
    assert.deepEqual(ResourceBundle._getFallbackLocales("de", ["fr"]), [], "nothing supported");
    assert.deepEqual(ResourceBundle._getFallbackLocales("es", ["fr", "es"]), ["es"], "fallback for es");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh-CN", ["zh_CN", "zh"], "zh"), ["zh_CN", "zh"], "fallback for zh_CN");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh-CN", ["zh-CN", "zh"], "zh"), ["zh_CN", "zh"], "fallback for zh_CN");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh", ["zh-CN", "zh", "zh-TW"], "zh_TW"), ["zh", "zh_TW"], "fallback for zh");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh", ["zh-CN", "zh", "zh-TW"], "zh-TW"), ["zh", "zh_TW"], "fallback for zh");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh-CN", ["zh_CN", "zh", "zh_TW"], "zh_TW"), ["zh_CN", "zh", "zh_TW"], "fallback for zh_CN (no duplicates)");
    assert.deepEqual(ResourceBundle._getFallbackLocales("zh-CN", ["zh_CN", "zh", "zh_TW"], "zh"), ["zh_CN", "zh"], "fallback for zh_CN");
});
QUnit.test("_getFallbackLocales fallbackLocale not contained", function (assert) {
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("zh-CN", ["zh_CN", "zh"], "zh_TW");
    }, new Error("The fallback locale 'zh_TW' is not contained in the list of supported locales ['zh_CN', 'zh'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("zh-CN", ["zh-CN", "zh"], "zh_TW");
    }, new Error("The fallback locale 'zh_TW' is not contained in the list of supported locales ['zh_CN', 'zh'] and will be ignored."));
});
QUnit.test("_getFallbackLocales (with modern ISO639 language code)", function (assert) {
    var aSupportedLocales = ["he", "id", "en"];
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw-IL"), ["iw_IL", "iw", "en", ""], "fallback chain without knowledge about supported locales");
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw-IL", aSupportedLocales), ["he", "en"], "fallback chain with knowledge about supported locales");
    assert.deepEqual(ResourceBundle._getFallbackLocales("id"), ["id", "en", ""], "fallback chain without knowledge about supported locales");
    assert.deepEqual(ResourceBundle._getFallbackLocales("id", aSupportedLocales), ["id", "en"], "fallback chain with knowledge about supported locales");
    assert.deepEqual(ResourceBundle._getFallbackLocales("he_IL", ["iw"], "iw"), ["iw"], "fallback for he_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("he_IL", ["he"], "he"), ["he"], "fallback for he_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("he_IL", ["iw_IL"], "iw_IL"), ["iw_IL"], "fallback for he_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("he_IL", ["he_IL"], "he_IL"), ["he_IL"], "fallback for he_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw_IL", ["iw"], "iw"), ["iw"], "fallback for iw_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw_IL", ["he"], "he"), ["he"], "fallback for iw_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw_IL", ["iw_IL"], "iw_IL"), ["iw_IL"], "fallback for iw_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw_IL", ["he_IL"], "he_IL"), ["he_IL"], "fallback for iw_IL");
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw", ["iw"], "iw"), ["iw"], "fallback for iw");
    assert.deepEqual(ResourceBundle._getFallbackLocales("he", ["he"], "iw"), ["he"], "fallback for he");
    assert.deepEqual(ResourceBundle._getFallbackLocales("iw", ["iw_IL"], "he_IL"), ["iw_IL"], "fallback for iw");
    assert.deepEqual(ResourceBundle._getFallbackLocales("he", ["he_IL"], "iw_IL"), ["he_IL"], "fallback for he");
});
QUnit.test("_getFallbackLocales (with modern ISO639 language code) not contained", function (assert) {
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("he_IL", ["iw"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("he_IL", ["he"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("he_IL", ["iw_IL"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw_IL'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("he_IL", ["he_IL"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he_IL'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("iw_IL", ["iw"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("iw_IL", ["he"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("iw_IL", ["iw_IL"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['iw_IL'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("iw_IL", ["he_IL"], "es");
    }, new Error("The fallback locale 'es' is not contained in the list of supported locales ['he_IL'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("iw", ["iw"], "he_IL");
    }, new Error("The fallback locale 'iw_IL' is not contained in the list of supported locales ['iw'] and will be ignored."));
    assert.throws(function () {
        ResourceBundle._getFallbackLocales("he", ["he"], "iw_IL");
    }, new Error("The fallback locale 'iw_IL' is not contained in the list of supported locales ['he'] and will be ignored."));
});
QUnit.test("getText (multiple resource bundles) checking that nextLocale is loaded", function (assert) {
    var done = assert.async();
    createResourceBundleWithCustomBundles(sinon).then(function (oResourceBundle) {
        var oSpy = sinon.spy(Properties, "create");
        assert.equal(oResourceBundle.getText("number"), "46", "Found in last added custom bundle (custom bundle 2)");
        assert.equal(oResourceBundle.getText("mee"), "yo", "Found in bundle");
        assert.equal(oResourceBundle.getText("mec1"), "ya", "Found in custom bundle 1");
        assert.equal(oResourceBundle.getText("mec2"), "ye", "Found in custom bundle 2");
        assert.equal(oSpy.callCount, 0);
        assert.equal(oResourceBundle.getText("unknown"), "unknown", "Not present in any bundle");
        assert.equal(oSpy.callCount, 3, "fallback locale was triggered for every bundle");
        oSpy.restore();
        done();
    });
});
QUnit.test("getText ignore key fallback (last fallback)", function (assert) {
    var done = assert.async();
    createResourceBundleWithCustomBundles(sinon).then(function (oResourceBundle) {
        var oSpy = sinon.spy(Properties, "create");
        assert.equal(oResourceBundle.getText("number", [], true), "46", "Correct behavior for a found text with key fallback activated.");
        assert.equal(oResourceBundle.getText("number", [], false), "46", "Correct behavior for a found text with key fallback deactivated.");
        assert.equal(oResourceBundle.getText("not_there", [], true), undefined, "Correct behavior for a not found text with key fallback activated.");
        assert.equal(oResourceBundle.getText("not_there", [], false), "not_there", "Correct behavior for a not found text with key fallback deactivated.");
        oSpy.restore();
        done();
    });
});
QUnit.test("getText should print meaningful assertion error when key is not found", function (assert) {
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.withArgs({
        url: "my_en_US.properties",
        async: true,
        returnNullIfMissing: true,
        headers: undefined
    }).returns(createFakePropertiesPromise({ "foo": "bar" })).withArgs({
        url: "my_en.properties",
        async: false,
        returnNullIfMissing: true,
        headers: undefined
    }).returns(createFakeProperties({ "foo": "bar" }));
    var oConsoleAssertStub = sinon.stub(console, "assert");
    return ResourceBundle.create({ url: "my.properties", locale: "en_US", async: true, supportedLocales: ["en_US", "en"] }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1);
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_en_US.properties", "en_US properties file is requested");
        assert.equal(oResourceBundle.getText("unknown"), "unknown", "Not present in any bundle");
        assert.equal(oPropertiesCreateStub.callCount, 2);
        assert.equal(oPropertiesCreateStub.getCall(1).args[0].url, "my_en.properties", "en properties file is requested as fallback");
        assert.equal(oConsoleAssertStub.callCount, 1, "console.assert should be called once");
        assert.deepEqual(oConsoleAssertStub.getCall(0).args, [
            false,
            "could not find any translatable text for key 'unknown' in bundle file(s): 'my_en_US.properties', 'my_en.properties'"
        ], "console.assert should be called with expected message");
        oPropertiesCreateStub.restore();
        oConsoleAssertStub.restore();
    });
});
QUnit.test("constructor with fallback chain - locale 'de_CH'", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de_CH", async: true, supportedLocales: [""], fallbackLocale: "" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");
        oStub.restore();
    });
});
QUnit.test("constructor with fallback chain - locale 'de'", function (assert) {
    var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({ number: "47", mee: "yo" }));
    return ResourceBundle.create({ url: "my.properties", locale: "de", async: true, supportedLocales: [""], fallbackLocale: "" }).then(function () {
        assert.equal(oStub.callCount, 1);
        assert.equal(oStub.getCall(0).args[0].url, "my.properties", "raw properties file is requested");
        oStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de_CH' and empty fallbackLocale ('')", function (assert) {
    var sLocale = "de_CH";
    var sFallbackLocale = "";
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, fallbackLocale: sFallbackLocale }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de_CH.properties",
            "my_de.properties",
            "my.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de_CH'", function (assert) {
    var sLocale = "de_CH";
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de_CH.properties",
            "my_de.properties",
            "my_en.properties",
            "my.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'fr_FR'", function (assert) {
    var sLocale = "de_CH";
    var sFallbackLocale = "fr_FR";
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, fallbackLocale: sFallbackLocale }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de_CH.properties",
            "my_de.properties",
            "my_fr_FR.properties",
            "my_fr.properties",
            "my.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'de_DE'", function (assert) {
    var sLocale = "de_CH";
    var sFallbackLocale = "de_DE";
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, fallbackLocale: sFallbackLocale }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de_CH.properties",
            "my_de.properties",
            "my_de_DE.properties",
            "my.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de' and fallbackLocale 'de_DE'", function (assert) {
    var sLocale = "de";
    var sFallbackLocale = "de_DE";
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, fallbackLocale: sFallbackLocale }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de.properties", "de properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de.properties",
            "my_de_DE.properties",
            "my.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'he_IL'", function (assert) {
    var sLocale = "de_CH";
    var sFallbackLocale = "he_IL";
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, fallbackLocale: sFallbackLocale }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de_CH.properties",
            "my_de.properties",
            "my_iw_IL.properties",
            "my_iw.properties",
            "my.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'he_IL' and supportedLocales 'de_CH', 'he_IL', 'sh'", function (assert) {
    var sLocale = "de_CH";
    var sFallbackLocale = "he_IL";
    var aSupportedLocales = ["de_CH", "he_IL", "iw"];
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: sFallbackLocale }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de_CH.properties",
            "my_he_IL.properties",
            "my_iw.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
QUnit.test("getText fallbackChain - locale 'de_CH' and fallbackLocale 'he_IL' and supportedLocales 'de_CH', 'sr', 'iw_IL'", function (assert) {
    var sLocale = "de_CH";
    var sFallbackLocale = "he_IL";
    var aSupportedLocales = ["de_CH", "he", "iw_IL"];
    var oPropertiesCreateStub = sinon.stub(Properties, "create");
    oPropertiesCreateStub.returns(createFakeProperties({ name: "base" }));
    oPropertiesCreateStub.onFirstCall().returns(createFakePropertiesPromise({ name: "base" }));
    return ResourceBundle.create({ url: "my.properties", locale: sLocale, async: true, supportedLocales: aSupportedLocales, fallbackLocale: sFallbackLocale }).then(function (oResourceBundle) {
        assert.equal(oPropertiesCreateStub.callCount, 1, "was exactly called once for de_CH");
        assert.equal(oPropertiesCreateStub.getCall(0).args[0].url, "my_de_CH.properties", "de_CH properties file is loaded");
        oResourceBundle.getText("not_there");
        var aUrls = oPropertiesCreateStub.getCalls().map(function (oCall) {
            return oCall.args[0].url;
        });
        assert.deepEqual(aUrls, [
            "my_de_CH.properties",
            "my_iw_IL.properties",
            "my_he.properties"
        ], "called urls must match");
        oPropertiesCreateStub.restore();
    });
});
var oTerminologies = {
    activeTerminologies: [
        "oil",
        "retail"
    ],
    fallbackLocale: "de",
    supportedLocales: [
        "en",
        "da",
        "de"
    ],
    terminologies: {
        oil: {
            bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.oil.i18n.properties",
            supportedLocales: [
                "da",
                "en",
                "de"
            ]
        },
        retail: {
            bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.retail.i18n.properties",
            supportedLocales: [
                "da",
                "de"
            ]
        }
    },
    enhanceWith: [
        {
            bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n/i18n.properties",
            bundleUrlRelativeTo: "manifest",
            supportedLocales: [
                "en",
                "da",
                "de"
            ],
            fallbackLocale: "de",
            terminologies: {
                oil: {
                    bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.oil.i18n.properties",
                    supportedLocales: [
                        "da",
                        "en",
                        "de"
                    ]
                },
                retail: {
                    bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.retail.i18n.properties",
                    supportedLocales: [
                        "da",
                        "de"
                    ],
                    bundleUrlRelativeTo: "manifest"
                }
            }
        },
        {
            bundleName: "appvar2.i18n.i18n.properties",
            supportedLocales: [
                "en",
                "da",
                "de"
            ],
            fallbackLocale: "de",
            terminologies: {
                oil: {
                    bundleName: "appvar2.i18n.terminologies.oil.i18n",
                    supportedLocales: [
                        "da",
                        "en",
                        "de"
                    ]
                },
                retail: {
                    bundleName: "appvar2.i18n.terminologies.retail.i18n",
                    supportedLocales: [
                        "da",
                        "de"
                    ]
                }
            }
        }
    ]
};
QUnit.module("sap/base/i18n/ResourceBundle: Terminologies", {
    beforeEach: function () {
        this.oCallChainStub = sinon.stub();
        this.oPropertiesCreateStub = sinon.stub(Properties, "create");
        this.oPropertiesCreateStub.rejects("Failed");
        this.oPropertiesCreateStub.withArgs({
            url: "my_de.properties",
            headers: undefined,
            async: true,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "base de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.retail.i18n_de.properties",
            async: true,
            headers: undefined,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "base retail de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.oil.i18n_de.properties",
            async: true,
            headers: undefined,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "base oil de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n/i18n_de.properties",
            headers: undefined,
            async: true,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "appvar1path de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.retail.i18n_de.properties",
            headers: undefined,
            async: true,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "appvar1path retail de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.oil.i18n_de.properties",
            headers: undefined,
            async: true,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "appvar1path oil de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "resources/appvar2/i18n/i18n/properties_de.properties",
            headers: undefined,
            async: true,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "appvar2 de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "resources/appvar2/i18n/terminologies/retail/i18n_de.properties",
            headers: undefined,
            async: true,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "appvar2 retail de" }, this.oCallChainStub));
        this.oPropertiesCreateStub.withArgs({
            url: "resources/appvar2/i18n/terminologies/oil/i18n_de.properties",
            headers: undefined,
            async: true,
            returnNullIfMissing: true
        }).returns(createFakePropertiesPromise({ name: "appvar2 oil de" }, this.oCallChainStub));
    },
    afterEach: function () {
        this.oPropertiesCreateStub.restore();
    }
});
QUnit.test("terminologies with enhance in enhance", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    var oFirstEnhance = merge({}, mParams.enhanceWith[0]);
    mParams.enhanceWith[0].enhanceWith = [oFirstEnhance];
    ResourceBundle.create(mParams).then(function () {
        assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called, additional enhance in enhance is not evaluated");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        done();
    });
});
QUnit.test("terminologies no enhanceWith", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 3, "stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "base oil de",
            "base retail de",
            "base de"
        ];
        assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
        assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
        done();
    });
});
QUnit.test("terminologies called with entry found in first bundle", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("name"), "appvar2 oil de", "Found in last added custom bundle (custom bundle 2)");
        assert.equal(that.oCallChainStub.callCount, 1, "call chain only called once because first bundle already has the text");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "appvar2 oil de"
        ];
        assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
        done();
    });
});
QUnit.test("getText for terminologies call order", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "appvar2 oil de",
            "appvar2 retail de",
            "appvar2 de",
            "appvar1path oil de",
            "appvar1path retail de",
            "appvar1path de",
            "base oil de",
            "base retail de",
            "base de"
        ];
        assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
        assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
        done();
    });
});
QUnit.test("terminologies call order empty/no activeTerminologies", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 3, "stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "appvar2 de",
            "appvar1path de",
            "base de"
        ];
        assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
        assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls");
        done();
    });
});
QUnit.test("terminologies call order reverse activeTerminologies", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    mParams.activeTerminologies.reverse();
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "appvar2 retail de",
            "appvar2 oil de",
            "appvar2 de",
            "appvar1path retail de",
            "appvar1path oil de",
            "appvar1path de",
            "base retail de",
            "base oil de",
            "base de"
        ];
        assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
        assert.deepEqual(aExpectedCallOrder, aCallOrder, "Correct order of calls, retail comes before oil");
        done();
    });
});
QUnit.test("terminologies call order not all locales supported", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    mParams.terminologies.retail.supportedLocales = ["da"];
    mParams.enhanceWith[0].terminologies.oil.supportedLocales = ["da"];
    mParams.enhanceWith[1].terminologies.retail.supportedLocales = ["de"];
    mParams.enhanceWith[1].supportedLocales = ["da"];
    mParams.enhanceWith[1].fallbackLocale = "da";
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 7, "stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "appvar2 oil de",
            "appvar2 retail de",
            "appvar1path retail de",
            "appvar1path de",
            "base oil de",
            "base de"
        ];
        assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
        assert.deepEqual(aCallOrder, aExpectedCallOrder, "Correct order of calls");
        done();
    });
});
QUnit.test("terminologies call order not all terminologies available", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    delete mParams.terminologies.retail;
    delete mParams.enhanceWith[0].terminologies.oil;
    delete mParams.enhanceWith[1].terminologies.retail;
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 6, "stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "appvar2 oil de",
            "appvar2 de",
            "appvar1path retail de",
            "appvar1path de",
            "base oil de",
            "base de"
        ];
        assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
        assert.deepEqual(aCallOrder, aExpectedCallOrder, "Correct order of calls");
        done();
    });
});
QUnit.test("enhanceWith inherit parameters supportedLocales and fallbackLocale", function (assert) {
    var done = assert.async();
    var that = this;
    var oClonedTerminologies = merge({}, oTerminologies);
    var mParams = {
        url: "my.properties",
        locale: "de_CH",
        async: true,
        activeTerminologies: oClonedTerminologies.activeTerminologies,
        terminologies: oClonedTerminologies.terminologies,
        supportedLocales: oClonedTerminologies.supportedLocales,
        enhanceWith: oClonedTerminologies.enhanceWith,
        fallbackLocale: oClonedTerminologies.fallbackLocale
    };
    delete mParams.enhanceWith[0].supportedLocales;
    delete mParams.enhanceWith[1].fallbackLocale;
    ResourceBundle.create(mParams).then(function (oResourceBundle) {
        assert.equal(that.oPropertiesCreateStub.callCount, 9, "all stubs were called");
        assert.ok(!that.oPropertiesCreateStub.exceptions.some(Boolean), "calls to Properties.create were successful");
        assert.equal(oResourceBundle.getText("invalid"), "invalid", "not found");
        var aCallOrder = that.oCallChainStub.args.map(function (aArgs) {
            return aArgs[0].name;
        });
        var aExpectedCallOrder = [
            "appvar2 oil de",
            "appvar2 retail de",
            "appvar2 de",
            "appvar1path oil de",
            "appvar1path retail de",
            "appvar1path de",
            "base oil de",
            "base retail de",
            "base de"
        ];
        assert.equal(that.oCallChainStub.callCount, aExpectedCallOrder.length);
        assert.deepEqual(aCallOrder, aExpectedCallOrder, "Correct order of calls");
        done();
    });
});
QUnit.module("sap/base/i18n/ResourceBundle: Terminologies integration");
QUnit.test("2 enhancements with 2 terminologies", function (assert) {
    var oOriginalGetTextFromProperties = ResourceBundle.prototype._getTextFromProperties;
    var aBundleUrlsInCallOrder = [];
    var oResourceBundleSpy = sinon.stub(ResourceBundle.prototype, "_getTextFromProperties").callsFake(function () {
        var oResult = oOriginalGetTextFromProperties.apply(this, arguments);
        aBundleUrlsInCallOrder.push(this.oUrlInfo.url);
        return oResult;
    });
    return ResourceBundle.create({
        url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
        async: true,
        locale: "de_CH",
        supportedLocales: ["de"],
        fallbackLocale: "de",
        terminologies: {
            oil: {
                bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages.properties",
                supportedLocales: [
                    "de"
                ]
            },
            retail: {
                bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages.properties",
                supportedLocales: [
                    "de"
                ]
            }
        },
        activeTerminologies: ["retail", "oil"],
        enhanceWith: [
            {
                bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties",
                terminologies: {
                    oil: {
                        bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_custom.properties",
                        supportedLocales: [
                            "de"
                        ]
                    },
                    retail: {
                        bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_custom.properties",
                        supportedLocales: [
                            "de"
                        ]
                    }
                }
            },
            {
                bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_other.properties",
                terminologies: {
                    oil: {
                        bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_other.properties",
                        supportedLocales: [
                            "de"
                        ]
                    },
                    retail: {
                        bundleUrl: "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_other.properties",
                        supportedLocales: [
                            "de"
                        ]
                    }
                }
            }
        ]
    }).then(function (oResourceBundle) {
        oResourceBundle.getText("invalid");
        assert.deepEqual(aBundleUrlsInCallOrder, [
            "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_other.properties",
            "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_other.properties",
            "test-resources/sap/ui/core/qunit/testdata/messages_other.properties",
            "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages_custom.properties",
            "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages_custom.properties",
            "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties",
            "test-resources/sap/ui/core/qunit/testdata/terminologies/retail/messages.properties",
            "test-resources/sap/ui/core/qunit/testdata/terminologies/oil/messages.properties",
            "test-resources/sap/ui/core/qunit/testdata/messages.properties"
        ], "the value retrieval should be in correct order");
        oResourceBundleSpy.restore();
    });
});
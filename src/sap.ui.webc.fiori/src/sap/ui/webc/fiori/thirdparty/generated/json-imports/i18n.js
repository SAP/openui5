sap.ui.define(['require', "sap/ui/webc/common/thirdparty/base/asset-registries/i18n"], function (require, _i18n) {
  "use strict";

  const importMessageBundle = async localeId => {
    switch (localeId) {
      case "ar":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_ar.json"], resolve)))).default;
      case "bg":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_bg.json"], resolve)))).default;
      case "ca":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_ca.json"], resolve)))).default;
      case "cs":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_cs.json"], resolve)))).default;
      case "cy":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_cy.json"], resolve)))).default;
      case "da":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_da.json"], resolve)))).default;
      case "de":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_de.json"], resolve)))).default;
      case "el":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_el.json"], resolve)))).default;
      case "en":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_en.json"], resolve)))).default;
      case "en_GB":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_en_GB.json"], resolve)))).default;
      case "en_US_sappsd":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_en_US_sappsd.json"], resolve)))).default;
      case "en_US_saprigi":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_en_US_saprigi.json"], resolve)))).default;
      case "en_US_saptrc":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_en_US_saptrc.json"], resolve)))).default;
      case "es":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_es.json"], resolve)))).default;
      case "es_MX":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_es_MX.json"], resolve)))).default;
      case "et":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_et.json"], resolve)))).default;
      case "fi":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_fi.json"], resolve)))).default;
      case "fr":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_fr.json"], resolve)))).default;
      case "fr_CA":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_fr_CA.json"], resolve)))).default;
      case "hi":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_hi.json"], resolve)))).default;
      case "hr":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_hr.json"], resolve)))).default;
      case "hu":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_hu.json"], resolve)))).default;
      case "in":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_in.json"], resolve)))).default;
      case "it":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_it.json"], resolve)))).default;
      case "iw":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_iw.json"], resolve)))).default;
      case "ja":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_ja.json"], resolve)))).default;
      case "kk":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_kk.json"], resolve)))).default;
      case "ko":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_ko.json"], resolve)))).default;
      case "lt":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_lt.json"], resolve)))).default;
      case "lv":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_lv.json"], resolve)))).default;
      case "ms":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_ms.json"], resolve)))).default;
      case "nl":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_nl.json"], resolve)))).default;
      case "no":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_no.json"], resolve)))).default;
      case "pl":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_pl.json"], resolve)))).default;
      case "pt":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_pt.json"], resolve)))).default;
      case "pt_PT":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_pt_PT.json"], resolve)))).default;
      case "ro":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_ro.json"], resolve)))).default;
      case "ru":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_ru.json"], resolve)))).default;
      case "sh":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_sh.json"], resolve)))).default;
      case "sk":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_sk.json"], resolve)))).default;
      case "sl":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_sl.json"], resolve)))).default;
      case "sv":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_sv.json"], resolve)))).default;
      case "th":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_th.json"], resolve)))).default;
      case "tr":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_tr.json"], resolve)))).default;
      case "uk":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_uk.json"], resolve)))).default;
      case "vi":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_vi.json"], resolve)))).default;
      case "zh_CN":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_zh_CN.json"], resolve)))).default;
      case "zh_TW":
        return (await Promise.resolve().then(() => new Promise(resolve => require(["../assets/i18n/messagebundle_zh_TW.json"], resolve)))).default;
      default:
        throw "unknown locale";
    }
  };
  const importAndCheck = async localeId => {
    const data = await importMessageBundle(localeId);
    if (typeof data === "string" && data.endsWith(".json")) {
      throw new Error(`[i18n] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use 'import ".../Assets-static.js"'. Check the "Assets" documentation for more information.`);
    }
    return data;
  };
  const localeIds = ["ar", "bg", "ca", "cs", "cy", "da", "de", "el", "en", "en_GB", "en_US_sappsd", "en_US_saprigi", "en_US_saptrc", "es", "es_MX", "et", "fi", "fr", "fr_CA", "hi", "hr", "hu", "in", "it", "iw", "ja", "kk", "ko", "lt", "lv", "ms", "nl", "no", "pl", "pt", "pt_PT", "ro", "ru", "sh", "sk", "sl", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_TW"];
  localeIds.forEach(localeId => {
    (0, _i18n.registerI18nLoader)("@ui5/webcomponents-fiori", localeId, importAndCheck);
  });
});
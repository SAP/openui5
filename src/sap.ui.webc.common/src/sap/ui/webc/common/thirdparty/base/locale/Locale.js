sap.ui.define(["exports", "../generated/AssetParameters"], function (_exports, _AssetParameters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
  class Locale {
    constructor(sLocaleId) {
      const aResult = rLocale.exec(sLocaleId.replace(/_/g, "-"));
      if (aResult === null) {
        throw new Error(`The given language ${sLocaleId} does not adhere to BCP-47.`);
      }
      this.sLocaleId = sLocaleId;
      this.sLanguage = aResult[1] || _AssetParameters.DEFAULT_LANGUAGE;
      this.sScript = aResult[2] || "";
      this.sRegion = aResult[3] || "";
      this.sVariant = aResult[4] && aResult[4].slice(1) || null;
      this.sExtension = aResult[5] && aResult[5].slice(1) || null;
      this.sPrivateUse = aResult[6] || null;
      if (this.sLanguage) {
        this.sLanguage = this.sLanguage.toLowerCase();
      }
      if (this.sScript) {
        this.sScript = this.sScript.toLowerCase().replace(/^[a-z]/, s => {
          return s.toUpperCase();
        });
      }
      if (this.sRegion) {
        this.sRegion = this.sRegion.toUpperCase();
      }
    }
    getLanguage() {
      return this.sLanguage;
    }
    getScript() {
      return this.sScript;
    }
    getRegion() {
      return this.sRegion;
    }
    getVariant() {
      return this.sVariant;
    }
    getVariantSubtags() {
      return this.sVariant ? this.sVariant.split("-") : [];
    }
    getExtension() {
      return this.sExtension;
    }
    getExtensionSubtags() {
      return this.sExtension ? this.sExtension.slice(2).split("-") : [];
    }
    getPrivateUse() {
      return this.sPrivateUse;
    }
    getPrivateUseSubtags() {
      return this.sPrivateUse ? this.sPrivateUse.slice(2).split("-") : [];
    }
    hasPrivateUseSubtag(sSubtag) {
      return this.getPrivateUseSubtags().indexOf(sSubtag) >= 0;
    }
    toString() {
      const r = [this.sLanguage];
      if (this.sScript) {
        r.push(this.sScript);
      }
      if (this.sRegion) {
        r.push(this.sRegion);
      }
      if (this.sVariant) {
        r.push(this.sVariant);
      }
      if (this.sExtension) {
        r.push(this.sExtension);
      }
      if (this.sPrivateUse) {
        r.push(this.sPrivateUse);
      }
      return r.join("-");
    }
  }
  var _default = Locale;
  _exports.default = _default;
});
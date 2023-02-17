sap.ui.define(["exports", "../CSP", "../FeaturesRegistry"], function (_exports, _CSP, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const flatten = arr => {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
  };
  const getEffectiveLinksHrefs = (ElementClass, forStaticArea = false) => {
    let stylesData = ElementClass[forStaticArea ? "staticAreaStyles" : "styles"];
    const OpenUI5Enablement = (0, _FeaturesRegistry.getFeature)("OpenUI5Enablement");
    if (!stylesData) {
      return;
    }
    if (!Array.isArray(stylesData)) {
      stylesData = [stylesData];
    }
    if (OpenUI5Enablement) {
      stylesData.push(OpenUI5Enablement.getBusyIndicatorStyles());
    }
    return flatten(stylesData).filter(data => !!data).map(data => (0, _CSP.getUrl)(data.packageName, data.fileName));
  };
  var _default = getEffectiveLinksHrefs;
  _exports.default = _default;
});
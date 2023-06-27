sap.ui.define(["exports", "../CSP", "../FeaturesRegistry"], function (_exports, _CSP, _FeaturesRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const MAX_DEPTH_INHERITED_CLASSES = 10; // TypeScript complains about Infinity and big numbers
  const getEffectiveLinksHrefs = (ElementClass, forStaticArea = false) => {
    const stylesData = ElementClass[forStaticArea ? "staticAreaStyles" : "styles"];
    if (!stylesData) {
      return;
    }
    const stylesDataArray = Array.isArray(stylesData) ? stylesData : [stylesData];
    const openUI5Enablement = (0, _FeaturesRegistry.getFeature)("OpenUI5Enablement");
    if (openUI5Enablement) {
      stylesDataArray.push(openUI5Enablement.getBusyIndicatorStyles());
    }
    return stylesDataArray.flat(MAX_DEPTH_INHERITED_CLASSES).filter(data => !!data).map(data => (0, _CSP.getUrl)(data.packageName, data.fileName));
  };
  var _default = getEffectiveLinksHrefs;
  _exports.default = _default;
});
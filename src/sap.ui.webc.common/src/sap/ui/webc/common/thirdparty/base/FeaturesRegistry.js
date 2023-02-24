sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerFeature = _exports.getFeature = void 0;
  const features = new Map();
  const registerFeature = (name, feature) => {
    features.set(name, feature);
  };
  _exports.registerFeature = registerFeature;
  const getFeature = name => {
    return features.get(name);
  };
  _exports.getFeature = getFeature;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "donut-chart";
  const pathData = "M256 0q53 0 100 20t81.5 54.5T492 156t20 100-20 100-54.5 81.5T356 492t-100 20-100-20-81.5-54.5T20 356 0 256t20-100 54.5-81.5T156 20 256 0zm202 224q-5-35-21-65t-40.5-52.5-55.5-37T275 52v77q38 6 66.5 32t38.5 63h78zM51 256q0 38 13 72t36 61 55 45 69 24v-78q-42-11-69-45t-27-79 27-79 69-45V54q-37 6-69 24t-55 45-36 61-13 72zm205 77q32 0 54.5-22.5T333 256t-22.5-54.5T256 179t-54.5 22.5T179 256t22.5 54.5T256 333zm19 127q37-3 69.5-18.5t57-40 40-57T460 275h-77q-7 42-36.5 71.5T275 383v77z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/donut-chart";
  _exports.default = _default;
});
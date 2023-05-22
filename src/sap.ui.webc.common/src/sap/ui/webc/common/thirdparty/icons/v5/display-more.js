sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "display-more";
  const pathData = "M400 32q34 0 57 23t23 57v288q0 34-23 57t-57 23H165q-28 0-52-10t-42-28-28.5-42.5T32 347t10.5-52.5T71 252t42-28.5 52-10.5h122l-34-34q-8-8-8-19t8-19 18-8q11 0 19 8l80 80q8 10 8 19t-8 19l-80 80q-8 8-19 8-10 0-18-8t-8-19 8-19l34-34H165q-34 0-57 23t-23 57 23 57 57 23h235q12 0 19.5-7.5T427 400V112q0-12-7.5-19T400 86H112q-12 0-19.5 7T85 112v54q0 26-26 26-12 0-19.5-7T32 166v-54q0-34 23-57t57-23h288z";
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
  var _default = "SAP-icons-v5/display-more";
  _exports.default = _default;
});
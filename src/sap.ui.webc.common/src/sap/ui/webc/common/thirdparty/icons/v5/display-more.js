sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "display-more";
  const pathData = "M416 0q34 0 57 23t23 57v320q0 34-23 57t-57 23H149q-28 0-52-10t-42-28-28.5-42.5T16 347t10.5-52.5T55 252t42-28.5 52-10.5h122l-34-34q-8-8-8-19t8-19 18-8q11 0 19 8l80 80q8 10 8 19t-8 19l-80 80q-8 8-19 8-10 0-18-8t-8-19 8-19l34-34H149q-34 0-57 23t-23 57 23 57 57 23h267q12 0 19.5-7.5T443 400V80q0-12-7.5-19T416 54H96q-12 0-19.5 7T69 80v54q0 26-26 26-12 0-19.5-7T16 134V80q0-34 23-57T96 0h320z";
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
  var _default = "display-more";
  _exports.default = _default;
});
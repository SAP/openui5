sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bullet-chart";
  const pathData = "M391 206h96c14 0 26 12 26 26v45c0 14-12 26-26 26h-96v29c0 14-11 25-25 25s-25-11-25-25v-29H27c-14 0-25-12-25-26v-45c0-14 11-26 25-26h314v-28c0-14 11-26 25-26s25 12 25 26v28z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v2";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v2/bullet-chart";
  _exports.default = _default;
});
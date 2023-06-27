sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bullet-chart";
  const pathData = "M32 257c0-19 15-32 32-32h259v-35h50v35h75c19 0 32 13 32 32 0 17-13 32-32 32h-75v27h-50v-27H64c-17 0-32-15-32-32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/bullet-chart";
  _exports.default = _default;
});
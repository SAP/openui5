sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bullet-chart";
  const pathData = "M32 257q0-14 9.5-23t22.5-9h259v-35h50v35h75q14 0 23 9t9 23q0 13-9 22.5t-23 9.5h-75v27h-50v-27H64q-13 0-22.5-9.5T32 257z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "bullet-chart";
  _exports.default = _default;
});
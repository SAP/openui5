sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "movement-warning";
  const pathData = "M1 136V82h90L64 55V0l109 109L64 218v-55l27-27H1zm293 376L77 295 294 79l217 216zM124 295l170 170 169-170-169-169zm156 13l-12-93c0-19 13-26 26-26s26 7 26 26l-12 93c-3 12-6 14-14 14-7 0-11-1-14-14zm-12 64c0-17 13-25 26-25s26 8 26 25c0 19-13 27-26 27s-26-8-26-27z";
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
  var _default = "business-suite-v1/movement-warning";
  _exports.default = _default;
});
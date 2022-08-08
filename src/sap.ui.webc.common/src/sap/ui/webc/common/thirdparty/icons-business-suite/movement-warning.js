sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "movement-warning";
  const pathData = "M1 82h90L64 55V0l109 109L64 218v-55l27-27H1V82zm76 213L294 79l217 216-217 217zm217 170l169-170-169-169-170 169zm-26-250q0-14 8-20t18-6 18 6 8 20l-12 93q-2 9-5 11.5t-9 2.5q-5 0-8.5-2t-5.5-12zm0 157q0-13 8-19t18-6 18 6 8 19q0 14-8 20.5t-18 6.5-18-6.5-8-20.5z";
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
  var _default = "movement-warning";
  _exports.default = _default;
});
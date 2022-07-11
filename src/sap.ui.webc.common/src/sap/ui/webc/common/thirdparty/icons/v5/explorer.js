sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "explorer";
  const pathData = "M256.5 0q53 0 99 20t81 55 55 81 20 99-20 99.5-55 81.5-81 55-99 20-99.5-20-81.5-55-55-81.5T.5 255t20-99 55-81T157 20t99.5-20zm0 460q42 0 79-16t65-44 44-65.5 16-79.5-16-79-44-65-65-44-79-16T177 67t-65.5 44-44 65-16 79 16 79.5 44 65.5 65.5 44 79.5 16zm0-383q11 0 18 7t7 18-7 18.5-18 7.5-18.5-7.5-7.5-18.5 7.5-18 18.5-7zm89 53q8-4 16.5-2t14.5 7q5 6 7 14.5t-2 16.5l-77 128q-2 5-7 7l-128 77q-8 4-16.5 3.5t-14.5-8.5q-13-13-5-31l77-127q2-6 7-8z";
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
  var _default = "explorer";
  _exports.default = _default;
});
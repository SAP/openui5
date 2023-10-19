sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-bottom";
  const pathData = "M103 331q-7-7-7-17 0-11 7.5-18.5T122 288q10 0 18 8l90 94V58q0-11 7.5-18.5T256 32t18.5 7.5T282 58v332l90-94q8-8 18-8 11 0 18.5 7.5T416 314q0 10-7 17L275 472q-8 8-19 8-12 0-18-8z";
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
  var _default = "SAP-icons-v5/arrow-bottom";
  _exports.default = _default;
});
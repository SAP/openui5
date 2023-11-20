sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "underline-text";
  const pathData = "M256 384q-33 0-62-12.5T143 337t-34.5-51T96 224V58q0-11 7.5-18.5T122 32t18 7.5 7 18.5v166q0 22 8.5 42t23.5 35 35 23.5 42 8.5q23 0 42.5-8.5T333 301t23.5-35 8.5-42V58q0-11 7-18.5t18-7.5 18.5 7.5T416 58v166q0 33-12.5 62T369 337t-51 34.5-62 12.5zm198 96H58q-11 0-18.5-7.5T32 454t7.5-18 18.5-7h396q11 0 18.5 7t7.5 18-7.5 18.5T454 480z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v5/underline-text";
  _exports.default = _default;
});
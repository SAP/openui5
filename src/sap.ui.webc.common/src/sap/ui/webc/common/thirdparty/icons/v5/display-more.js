sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "display-more";
  const pathData = "M422 0q38 0 64 26t26 64v332q0 38-26 64t-64 26H138q-28 0-53.5-11t-44-29.5-29.5-44T0 374q0-29 11-53.5T40.5 277t44-29.5T138 237h127l-33-33q-8-8-8-18 0-11 7.5-18.5T250 160t18 7l77 77q7 9 7 18 0 11-7 18l-77 77q-8 8-18 8-11 0-18.5-7.5T224 339q0-10 8-18l33-33H138q-18 0-34 7t-27.5 18.5-18.5 27-7 33.5q0 36 25.5 61.5T138 461h284q17 0 28-11t11-28V90q0-17-11-28t-28-11H90q-17 0-28 11T51 90v76q0 11-7 18.5T26 192t-18.5-7.5T0 166V90q0-38 26-64T90 0h332z";
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
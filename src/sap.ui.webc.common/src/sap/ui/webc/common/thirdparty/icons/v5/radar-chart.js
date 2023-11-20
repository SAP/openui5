sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "radar-chart";
  const pathData = "M468 132q12 7 12 22v204q0 14-12 22L270 508q-5 4-14 4t-14-4L44 380q-12-8-12-22V154q0-15 12-22L242 4q5-4 14-4t14 4zm-39 35L256 56 83 167v177l173 112 173-112V167zm-139-3q4-16 16.5-26t29.5-10q20 0 34 14t14 34q0 17-10.5 30T346 223l-38 113q12 13 12 32 0 20-14 34t-34 14-34-14-14-34q0-7 1-10l-71-71q-3 1-10 1-20 0-34-14t-14-34 14-34 34-14q17 0 30 11zm-30 157l34-105-103 35z";
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
  var _default = "SAP-icons-v5/radar-chart";
  _exports.default = _default;
});
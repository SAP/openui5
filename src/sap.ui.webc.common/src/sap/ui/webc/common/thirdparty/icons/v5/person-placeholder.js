sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "person-placeholder";
  const pathData = "M358 242q56 21 90.5 70.5T483 426v57q0 13-7.5 21t-20.5 8H57q-13 0-20.5-8T29 483v-57q0-64 34.5-113.5T154 242q-40-40-40-99 0-30 11-56t30.5-45 45-30T256 1t56 11 45 30 30 45 11 56q0 59-40 99zM256 57q-36 0-60.5 24.5T171 143q0 36 24.5 60.5T256 228t60.5-24.5T341 143q0-37-24.5-61.5T256 57zm170 369q0-30-11-55.5t-30-45-44.5-30.5-55.5-11h-57q-30 0-56 11t-45 30.5-30 45T86 426v29h340v-29z";
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
  var _default = "person-placeholder";
  _exports.default = _default;
});
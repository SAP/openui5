sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "away";
  const pathData = "M256 0q53 0 100 20t81.5 55 54.5 81.5 20 99.5-20 99.5-54.5 81.5-81.5 55-100 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm128 288q18 0 30.5-7t12.5-25q0-17-12.5-24.5T384 224h-96v-96q0-18-7-30.5T256 85q-17 0-24.5 12.5T224 128v128q0 18 7.5 25t24.5 7h128z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/away";
  _exports.default = _default;
});
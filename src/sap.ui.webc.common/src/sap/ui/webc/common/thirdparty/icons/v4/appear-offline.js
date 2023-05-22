sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "appear-offline";
  const pathData = "M256 0q52 0 99 20t82 54.5 55 81.5 20 100-20 99.5-55 81.5-82 55-99 20q-53 0-99.5-20T75 437t-55-81.5T0 256t20-100 55-81.5T156.5 20 256 0zm0 426q35 0 66-13.5t54-36.5 36.5-54 13.5-66q0-36-13.5-67T376 135t-54-36.5T256 85t-66 13.5-54 36.5-36.5 54T86 256q0 35 13.5 66t36.5 54 54 36.5 66 13.5z";
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
  var _default = "SAP-icons-v4/appear-offline";
  _exports.default = _default;
});
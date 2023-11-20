sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "heart";
  const pathData = "M354 32q33 0 61.5 12.5t50 34 34 50T512 190q0 32-12 61t-35 50L290 466q-14 14-34 14t-34-14L46 301q-23-22-34.5-50.5T0 191q0-33 12.5-62t34-50.5 50-34T158 32q57 0 98 38 41-38 98-38z";
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
  var _default = "SAP-icons-v5/heart";
  _exports.default = _default;
});
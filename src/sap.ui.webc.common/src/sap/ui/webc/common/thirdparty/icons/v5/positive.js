sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "positive";
  const pathData = "M405 32q32 0 53.5 21.5T480 107v298q0 32-21.5 53.5T405 480H107q-32 0-53.5-21.5T32 405V107q0-32 21.5-53.5T107 32h298zm25 75q0-25-25-25H107q-25 0-25 25v298q0 25 25 25h298q25 0 25-25V107zm-99 124q25 0 25 25t-25 25h-50v50q0 25-25 25t-25-25v-50h-50q-11 0-17.5-7t-6.5-18 6.5-18 17.5-7h50v-50q0-25 25-25t25 25v50h50z";
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
  var _default = "SAP-icons-v5/positive";
  _exports.default = _default;
});
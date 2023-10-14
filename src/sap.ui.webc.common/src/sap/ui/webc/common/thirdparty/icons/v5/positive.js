sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "positive";
  const pathData = "M406 32q31 0 52.5 21.5T480 106v299q0 31-22 53t-53 22H106q-31 0-52.5-21.5T32 406V106q0-31 21.5-52.5T106 32h300zm23 74q0-10-6.5-16.5T406 83H106q-10 0-16.5 6.5T83 106v300q0 10 6.5 16.5T106 429h299q10 0 17-7t7-17V106zm-71 124q11 0 18.5 7.5T384 256t-7.5 18.5T358 282h-76v76q0 11-7.5 18.5T256 384t-18.5-7.5T230 358v-76h-76q-11 0-18.5-7.5T128 256t7.5-18.5T154 230h76v-76q0-11 7.5-18.5T256 128t18.5 7.5T282 154v76h76z";
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
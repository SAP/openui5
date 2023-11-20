sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "shipping-status";
  const pathData = "M0 288q0-8 5-16-5-8-5-16V96q0-14 9-23t23-9h256q13 0 22.5 9t9.5 23h19q24 0 45 8t38 22.5 28.5 34T466 203l8 53h6q13 0 22.5 9t9.5 23v96q0 14-9.5 23t-22.5 9h-34q-5 28-27 46t-51 18-51-18-28-46h-67q-5 28-27 46t-51 18-51-18-28-46H32q-14 0-23-9t-9-23v-96zm32-32h256V96H32v160zm0 32v96h33q6-27 28-45.5t51-18.5 51 18.5 27 45.5h67q6-27 28-45.5t51-18.5 51 18.5 27 45.5h34v-96H32zm288-32h122l-8-48q-6-35-33-57.5T339 128h-19v128zm0 144q0 20 14 34t34 14 34-14 14-34-14-34-34-14-34 14-14 34zm-224 0q0 20 14 34t34 14 34-14 14-34-14-34-34-14-34 14-14 34z";
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
  var _default = "SAP-icons-v4/shipping-status";
  _exports.default = _default;
});
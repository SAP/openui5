sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "address-book";
  const pathData = "M403 64q32 0 54.5 22.5T480 141v294q0 32-22.5 54.5T403 512H109q-32 0-54.5-22.5T32 435V141q0-32 22.5-54.5T109 64h19V26q0-11 7.5-18.5T154 0t18 7.5 7 18.5v38h154V26q0-11 7-18.5T358 0t18.5 7.5T384 26v38h19zm26 77q0-11-7.5-18.5T403 115h-19v19q0 11-7.5 18.5T358 160t-18-7.5-7-18.5v-19H179v19q0 11-7 18.5t-18 7.5-18.5-7.5T128 134v-19h-19q-11 0-18.5 7.5T83 141v294q0 11 7.5 18.5T109 461h294q11 0 18.5-7.5T429 435V141zM256 272q-20 0-34-14t-14-34 14-34 34-14 34 14 14 34-14 34-34 14zm58 48q29 0 49.5 20t20.5 45q0 14-7.5 22.5T358 416H154q-11 0-18.5-8.5T128 385q0-25 20.5-45t49.5-20h116z";
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
  var _default = "SAP-icons-v5/address-book";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "activity-individual";
  const pathData = "M184 460q11 0 18.5 7.5T210 486t-7.5 18.5T184 512h-81q-32 0-54-22.5T27 435V128q0-32 22-54t54-22h26q0-21 15-36t36-15h102q21 0 36 15t15 36h26q32 0 54 22t22 54v54q0 11-7 18t-18 7-18.5-7-7.5-18v-54q0-11-7-18t-18-7h-26q0 21-15 36t-36 15H180q-21 0-36-15t-15-36h-26q-11 0-18 7t-7 18v307q0 11 7 18t18 7h81zm-4-357h102V52H180v51zm204 153q21 0 36 15t15 36-15 36-36 15-36-15-15-36 15-36 36-15zm30 128q31 0 51.5 21t20.5 50v5q0 26-26 26H307q-25 0-25-26v-5q0-29 20-50t51-21h61z";
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
  var _default = "activity-individual";
  _exports.default = _default;
});
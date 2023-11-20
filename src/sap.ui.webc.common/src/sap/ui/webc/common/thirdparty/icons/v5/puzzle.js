sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "puzzle";
  const pathData = "M454 96q24 0 41 17t17 41v204q0 24-17 41t-41 17h-70v-49q0-6-4.5-10.5T368 352q-6 0-11 4.5t-5 10.5v49H192v16q0 20-14 34t-34 14-34-14-14-34v-16H58q-24 0-41-17T0 358v-70h33q14 0 23.5-9.5T66 255q0-13-9.5-22.5T33 223H0v-69q0-24 17-41t41-17h55v32q0 14 9 23t23 9q13 0 22.5-9t9.5-23V96h143V80q0-20 14-34t34-14 34 14 14 34v16h38zm7 58q0-7-7-7H282v45h22q20 0 34 14t14 34-14 34-34 14h-22v77h21q1-27 20.5-45.5T370 301t46 18.5 20 45.5h18q7 0 7-7V154z";
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
  var _default = "SAP-icons-v5/puzzle";
  _exports.default = _default;
});
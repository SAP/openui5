sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "locked";
  const pathData = "M276 382l44 66H192l43-66q-14-6-21.5-18.5T206 337q0-20 15-35 13-14 35-14 21 0 35 14 14 16 14 35 0 14-7.5 26.5T276 382zm156-94v160q0 26-19 45t-45 19H144q-26 0-45-19t-19-45V288q0-17 9-33.5t26-23.5v-99q0-27 10.5-51t28-41.5 41.5-28T246 1h20q27 0 51 10.5t41.5 28 28 41.5 10.5 51v99q16 8 25.5 23.5T432 288zm-259-64h166v-92q0-30-21.5-51.5T266 59h-20q-30 0-51.5 21.5T173 132v92zm227 64q0-14-9-23-10-9-23-9H144q-14 0-23 9t-9 23v160q0 13 9.5 22.5T144 480h224q11 0 23-10 9-9 9-22V288z";
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
  var _default = "SAP-icons-v4/locked";
  _exports.default = _default;
});
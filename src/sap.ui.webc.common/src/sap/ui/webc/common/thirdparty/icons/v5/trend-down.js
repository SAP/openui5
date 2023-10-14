sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "trend-down";
  const pathData = "M486 256q11 0 18.5 7.5T512 282v108q0 11-7.5 18.5T486 416H378q-11 0-18.5-7.5T352 390t7.5-18 18.5-7h52L281 192l-83 88q-8 8-19 8-10 0-17-7L8 140q-8-8-8-18 0-11 7.5-18.5T26 96q10 0 17 7l135 123 85-90q8-8 19-8 12 0 19 9l160 185v-40q0-11 7-18.5t18-7.5z";
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
  var _default = "SAP-icons-v5/trend-down";
  _exports.default = _default;
});
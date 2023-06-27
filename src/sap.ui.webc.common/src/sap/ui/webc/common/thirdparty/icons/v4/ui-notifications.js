sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "ui-notifications";
  const pathData = "M0 128q0-26 19-45t45-19h448v32H64q-14 0-23 9t-9 23v256q0 14 9 23t23 9h384v32H64q-26 0-45-19T0 384V128zm160 176q0-16 16-16h336v32H176q-16 0-16-16zm-48-112h256q16 0 16 16t-16 16H112q-16 0-16-16t16-16z";
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
  var _default = "SAP-icons-v4/ui-notifications";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "ui-notifications";
  const pathData = "M436 64q32 0 54 22t22 54v232q0 32-22 54t-54 22H76q-32 0-54-22T0 372V140q0-32 22-54t54-22h360zm25 76q0-25-25-25H76q-25 0-25 25v232q0 25 25 25h360q25 0 25-25V140zM295 289q25 0 25 25t-25 25H153q-25 0-25-25t25-25h142zm64-97q25 0 25 25t-25 25H153q-25 0-25-25t25-25h206z";
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
  var _default = "SAP-icons-v5/ui-notifications";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "border";
  const pathData = "M415.5-1q35 0 58 23t23 58v320q0 34-23 57t-58 23h-320q-34 0-57-23t-23-57V80q0-35 23-58t57-23h320zm27 81q0-12-7.5-19.5T415.5 53h-320q-12 0-19.5 7.5T68.5 80v320q0 12 7.5 19.5t19.5 7.5h320q12 0 19.5-7.5t7.5-19.5V80z";
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
  var _default = "border";
  _exports.default = _default;
});
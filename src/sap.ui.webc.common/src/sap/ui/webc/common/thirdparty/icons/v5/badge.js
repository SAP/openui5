sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "badge";
  const pathData = "M256 512q-8 0-24-8t-32.5-19-31-21.5T148 448q-49-42-74.5-90T48 256V97q0-18 19-25L249 1q2-1 7-1t7 1l182 71q19 7 19 25v159q0 43-16.5 82T404 409.5 343 467t-69 40q-14 5-18 5zM99 116v140q0 35 13.5 65.5t36 56 50.5 46 57 34.5q29-14 57-34.5t50.5-46 36-56T413 256V116L256 52zm191 64l48 7q14 2 14 16 0 7-4 11l-35 37 8 53q0 16-16 16-2 0-8-2l-41-24-41 24q-6 2-8 2-16 0-16-16l8-53-34-37q-5-4-5-11 0-14 14-16l48-7 19-43q5-9 15-9 11 0 15 9z";
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
  var _default = "SAP-icons-v5/badge";
  _exports.default = _default;
});
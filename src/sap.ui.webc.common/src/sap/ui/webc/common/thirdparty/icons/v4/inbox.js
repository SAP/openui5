sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "inbox";
  const pathData = "M0 480V352q0-13 9-22.5t23-9.5h96q0 32 32 32h193q31 0 31-32h96q13 0 22.5 9.5T512 352v128q0 14-9.5 23t-22.5 9H32q-14 0-23-9t-9-23zm103-128H32v128h448V352h-71q-17 32-56 32H160q-40 0-57-32zm30-198q5-5 11-5t11 5l85 85V16q0-16 16-16t16 16v225l87-87q5-5 11-5 7 0 12 5 12 11 0 23L280 278q-10 10-23 10-12 0-22-10L133 177q-12-12 0-23zm43 262h160q6 0 11 5t5 11q0 7-5 11.5t-11 4.5H176q-16 0-16-16 0-6 4.5-11t11.5-5z";
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
  var _default = "SAP-icons-v4/inbox";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "email";
  const pathData = "M435 64q33 0 55 22.5t22 54.5v230q0 33-22 55t-55 22H77q-33 0-55-22T0 371V141q0-32 22-54.5T77 64h358zM79 116q-10 0-12 2l176 110q7 4 15 4t13-4l177-110q-2-2-6-2H79zm356 281q26 0 26-26V172L297 274q-19 12-41 12-21 0-41-12L51 172v199q0 26 26 26h358z";
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
  var _default = "SAP-icons-v5/email";
  _exports.default = _default;
});
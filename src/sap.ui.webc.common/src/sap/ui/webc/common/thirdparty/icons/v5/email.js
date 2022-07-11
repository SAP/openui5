sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "email";
  const pathData = "M436 64q33 0 55 22.5t22 54.5v263q0 33-22 55t-55 22H78q-33 0-55-22T1 404V141q0-32 22-54.5T78 64h358zM80 116q-10 0-12 2l176 110q7 4 15 4t13-4l177-110q-5 0-6-1-2-1-7-1H80zm356 314q26 0 26-26V172L298 274q-19 12-41 12-21 0-41-12L52 172v232q0 26 26 26h358z";
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
  var _default = "email";
  _exports.default = _default;
});
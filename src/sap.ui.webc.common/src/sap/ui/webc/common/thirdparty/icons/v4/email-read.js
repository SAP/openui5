sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "email-read";
  const pathData = "M512 143v337q0 13-9.5 22.5T480 512H32q-14 0-23-9.5T0 480V143L254 0zm-48 337L256 326 48 480h416zM328 294l152-135L255 37 32 159l151 135-17 18L32 191v273l223-170 225 168V192L347 312z";
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
  var _default = "SAP-icons-v4/email-read";
  _exports.default = _default;
});
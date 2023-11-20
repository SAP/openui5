sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-right";
  const pathData = "M503 234q9 9 9 22.5t-9 22.5L344 439q-10 10-23 10t-23-10q-9-9-9-22.5t9-22.5l106-106H32q-13 0-22.5-9T0 256q0-13 9.5-22.5T32 224h372L299 119q-10-10-10-23t10-22q9-10 22-10t22 10z";
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
  var _default = "SAP-icons-v4/arrow-right";
  _exports.default = _default;
});
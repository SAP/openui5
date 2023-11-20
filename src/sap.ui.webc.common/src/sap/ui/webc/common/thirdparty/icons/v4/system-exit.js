sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "system-exit";
  const pathData = "M256 0q53 0 100 20t81.5 55 54.5 81.5 20 99.5-20 100-54.5 81.5T356 492t-100 20-99.5-20T75 437.5 20 356 0 256t20-99.5T75 75t81.5-55T256 0zm0 480q46 0 87-17.5t71.5-48 48-71T480 256q0-46-17.5-87t-48-71.5-71.5-48T256 32t-87 17.5-71.5 48-48 71.5T32 256q0 47 17.5 87.5t48 71 71.5 48 87 17.5zm123-252q11 11 0 22-12 12-23 0l-93-96q-6-6-11 0l-95 97q-12 12-23 0-12-11 0-23l101-102q9-9 22-9t23 9zm0 107q11 11 0 22-12 12-23 0l-93-96q-6-6-11 0l-95 97q-12 12-23 0-12-11 0-23l101-102q9-9 22-9t23 9z";
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
  var _default = "SAP-icons-v4/system-exit";
  _exports.default = _default;
});
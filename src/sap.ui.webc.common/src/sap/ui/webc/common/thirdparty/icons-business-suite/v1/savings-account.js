sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "savings-account";
  const pathData = "M18 432V0h488v432H18zm202-301c12 12 26 18 41 18 17 0 30-6 40-18 24-23 24-59 1-82-11-11-24-17-41-17-16 0-30 6-41 17-24 23-24 59 0 82zM50 40v32h32V40H50zm181 50c0-20 15-30 31-30 15 0 30 10 30 31 0 20-15 30-30 30-16 0-31-10-31-31zm-63 68l-23 22 93 94-93 93 23 24 94-94 93 93 23-22-94-94 94-93-22-23-94 93zM82 362H50v32h32v-32zm54 150H64v-48h72v48zm252 0v-48h72v48h-72z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/savings-account";
  _exports.default = _default;
});
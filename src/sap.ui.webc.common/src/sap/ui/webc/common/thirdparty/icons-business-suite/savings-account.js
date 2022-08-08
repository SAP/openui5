sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "savings-account";
  const pathData = "M18 0h488v432H18V0zm202 131q18 18 41 18 25 0 40-18 18-17 18-41t-17-41q-16-17-41-17-24 0-41 17-18 17-18 41t18 41zM50 72h32V40H50v32zm181 18q0-15 9.5-22.5T262 60q11 0 20.5 7.5T292 91q0 15-9.5 22.5T262 121q-12 0-21.5-7.5T231 90zm-86 90l93 94-93 93 23 24 94-94 93 93 23-22-94-94 94-93-22-23-94 93-94-93zM50 362v32h32v-32H50zm14 150v-48h72v48H64zm324-48h72v48h-72v-48z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "savings-account";
  _exports.default = _default;
});
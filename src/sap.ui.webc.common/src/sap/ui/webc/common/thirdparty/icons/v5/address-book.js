sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "address-book";
  const pathData = "M409 51q33 0 55 22t22 54v307q0 32-22 54.5T409 511H103q-33 0-55-22.5T26 434V127q0-32 22-54t55-22h25V25q0-11 7.5-18T154 0t18.5 7 7.5 18v26h153V25q0-25 25-25 26 0 26 25v26h25zm26 76q0-25-26-25h-25v25q0 26-26 26-25 0-25-26v-25H180v25q0 12-7.5 19t-18.5 7-18.5-7-7.5-19v-25h-25q-11 0-18.5 7T77 127v307q0 11 7.5 18t18.5 7h306q26 0 26-25V127zM312 306q31 0 51.5 21.5T384 378v5q0 25-26 25H154q-11 0-18.5-7t-7.5-18v-5q0-29 20.5-50.5T200 306h112zm-56-153q21 0 36 15t15 36-15 36-36 15-36-15-15-36 15-36 36-15z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "address-book";
  _exports.default = _default;
});
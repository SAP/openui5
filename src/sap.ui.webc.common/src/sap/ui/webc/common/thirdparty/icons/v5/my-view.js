sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "my-view";
  const pathData = "M435 0q33 0 55 22t22 54v256q0 32-22 54t-55 22h-94l12 51h31q11 0 18.5 7.5T410 485t-7.5 18.5T384 511H129q-12 0-19-7.5t-7-18.5 7-18.5 19-7.5h30l13-51H77q-32 0-54-22T1 332V76q0-32 22-54T77 0h358zM290 408h-67l-13 51h92zM461 76q0-11-7.5-18T435 51H77q-25 0-25 25v256q0 25 25 25h358q26 0 26-25V76zM343 258q8 4 11.5 12t1.5 16q-5 20-26 20H177q-22 0-25-20-5-19 12-28l44-21q8-4 16.5-5.5T241 230h28q19 0 33 7zm-87-156q22 0 36.5 15t14.5 36-14.5 36-36.5 15q-21 0-36-15t-15-36 15-36 36-15z";
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
  var _default = "my-view";
  _exports.default = _default;
});
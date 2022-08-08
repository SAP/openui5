sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "refresh";
  const pathData = "M309.5 179q0-11 7-18t16-7h100q-27-47-72.5-75T257.5 51q-43 0-80.5 16t-65.5 44-44 65.5-16 79.5 16 79 44 65 65.5 44 79.5 16q36 0 69-12t59.5-33 45-50 25.5-63q2-11 10-16t16-5h5q10 2 15 9.5t6 15.5q0 2-1 3v3q-10 43-33.5 79.5t-56 63-73.5 41.5-86 15q-53 0-100-20t-82-55-55-81.5T.5 256q0-53 20-99.5t55-81.5T157 20t99.5-20q63 0 116 28t88 74V26q0-26 26-26 25 0 25 26v153q0 11-7 18.5t-18 7.5h-151q-11 0-18.5-7.5t-7.5-18.5z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_REFRESH;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "refresh";
  _exports.default = _default;
});
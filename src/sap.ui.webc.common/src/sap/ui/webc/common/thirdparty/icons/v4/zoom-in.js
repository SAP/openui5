sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "zoom-in";
  const pathData = "M32 208q0-36 14-68t38-56 56-38 68-14 68 14 56 38 38 56 14 68q0 28-8.5 53T353 308l117 118q10 9 10 22.5T470 471q-9 9-22 9-12 0-23-9L308 353q-43 31-100 31-36 0-68-13.5T84 333t-38-56-14-69zm32 0q0 30 11 56.5t30.5 46 46 30.5 56.5 11 56-11 45.5-30.5 31-46T352 208t-11.5-56-31-45.5-45.5-31T208 64t-56.5 11.5-46 31T75 152t-11 56zm128-16v-80h33v80h80v32h-80v81h-33v-81h-80v-32h80z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ZOOM_IN;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/zoom-in";
  _exports.default = _default;
});
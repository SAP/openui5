sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "exit-full-screen";
  const pathData = "M486 0q11 0 18.5 7.5T512 26t-7 18l-98 97h47q11 0 18.5 7t7.5 18-7.5 18.5T454 192H346q-11 0-18.5-7.5T320 166V58q0-11 7.5-18.5T346 32t18 7.5 7 18.5v47l97-98q7-7 18-7zM230 32q11 0 18.5 7.5T256 58t-7.5 18-18.5 7H90q-7 0-7 7v140q0 11-7 18.5T58 256t-18.5-7.5T32 230V90q0-24 17-41t41-17h140zm224 224q11 0 18.5 7.5T480 282v140q0 24-17 41t-41 17H282q-11 0-18.5-7.5T256 454t7.5-18 18.5-7h140q7 0 7-7V282q0-11 7-18.5t18-7.5zm-288 64q11 0 18.5 7.5T192 346v108q0 11-7.5 18.5T166 480t-18-7.5-7-18.5v-47l-97 98q-7 7-18 7t-18.5-7.5T0 486q0-10 8-18l97-97H58q-11 0-18.5-7T32 346t7.5-18.5T58 320h108z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_EXIT_FULL_SCREEN;
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
  var _default = "SAP-icons-v5/exit-full-screen";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add-contact";
  const pathData = "M414 244q25 0 25 25v170q0 32-21 52.5T366 512H74q-32 0-52.5-20.5T1 439V147q0-31 20.5-52T74 74h170q11 0 17.5 6.5T268 98q0 25-24 25H74q-11 0-18 6.5T49 147v292q0 24 25 24h292q11 0 17.5-6.5T390 439V269q0-11 6.5-18t17.5-7zm73-170q11 0 18 6.5t7 17.5q0 25-25 25h-48v48q0 25-25 25-11 0-17.5-7t-6.5-18v-48h-49q-11 0-17.5-7T317 98t6.5-17.5T341 74h49V25q0-11 6.5-17.5T414 1t18 6.5 7 17.5v49h48zM122 415q-11 0-17.5-7T98 390v-4q0-28 19.5-48.5T166 317h107q29 0 48.5 20.5T341 386v4q0 25-24 25H122zm98-244q20 0 34 14.5t14 34.5-14 34.5-34 14.5-34.5-14.5T171 220t14.5-34.5T220 171z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_ADD_CONTACT;
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
  var _default = "add-contact";
  _exports.default = _default;
});
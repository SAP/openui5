sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "back-to-top";
  const pathData = "M389.5 236q9 8 9 19.5t-9 20.5q-8 8-19.5 8t-20.5-8l-65-66v273q0 28-28 28-13 0-21-7.5t-8-20.5V210l-65 66q-8 8-19.5 8t-20.5-8q-8-9-8-20.5t8-19.5l111-111q5-5 9.5-8t13.5-3q8 0 13 3t10 8zm94-236q13 0 20.5 8t7.5 21q0 28-28 28h-454q-13 0-21-7.5T.5 29t8-21 21-8h454z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_BACK_TO_TOP;
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
  var _default = "back-to-top";
  _exports.default = _default;
});
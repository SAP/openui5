sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "move";
  const pathData = "M505 238q7 7 7 18t-7 18l-77 77q-7 7-18 7t-18.5-7-7.5-18q0-10 8-18l33-33H282v143l33-34q7-7 18-7t18 7.5 7 18.5-7 18l-77 77q-7 7-18 7t-18-7l-77-77q-7-7-7-18t7-18.5 18-7.5 18 7l33 34V282H87l34 33q7 7 7 18t-7.5 18-18.5 7-18-7L8 274q-8-8-8-18t8-18l76-77q7-7 18-7t18.5 7 7.5 18-7 18l-34 33h143V87l-33 33q-8 8-18 8-11 0-18-7.5t-7-18.5 7-18l77-77q7-7 18-7t18 7l77 77q7 7 7 18t-7 18.5-18 7.5q-10 0-18-8l-33-33v143h143l-33-33q-8-8-8-18 0-11 7.5-18t18.5-7 18 7z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_MOVE;
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
  var _default = "SAP-icons-v5/move";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "move";
  const pathData = "M504 238q8 8 8 18 0 8-8 18l-77 76q-8 8-18 8-8 0-18-8-7-7-7-18 0-10 7-18l34-33H282v143l33-33q8-8 18-8t18 8q7 7 7 18t-7 18l-77 77q-7 7-18 7t-18-7l-76-77q-8-7-8-18t8-18q8-8 17-8 10 0 18 8l34 33V281H87l34 33q7 8 7 18 0 11-7 18-8 8-18 8t-18-8L8 274q-7-8-7-18 0-11 7-18l77-77q7-7 18-7t18 7 7 18-7 18l-34 33h144V87l-34 33q-8 8-18 8-9 0-17-8-8-7-8-18 0-10 8-17l76-77q8-8 18-8t18 8l77 77q7 7 7 17 0 11-7 18-8 8-18 8t-18-8l-33-33v143h143l-34-33q-7-7-7-18t7-18q8-7 18-7 11 0 18 7z";
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
  var _default = "move";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "undo";
  const pathData = "M479 304q1 9 1 18 0 26-10 54t-31.5 52-52.5 38-66 14H64q-13 0-22.5-9T32 448q0-13 9.5-22.5T64 416h253q35 0 63-21t34-56q2-10 2-19 0-13-4.5-29.5t-18-32-32.5-25-41-9.5H140l75 74q9 9 9 22.5t-9 22.5q-10 10-23 10t-23-10L41 215q-9-9-9-22.5t9-22.5L170 42q10-10 23-10t22 10q10 9 10 22t-10 23l-74 73h172q31 0 60 11t51.5 30 37 45.5T479 304z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_UNDO;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    accData,
    collection,
    packageName
  });
  var _default = "undo";
  _exports.default = _default;
});
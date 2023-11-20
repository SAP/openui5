sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "message-information";
  const pathData = "M0 256q0-53 20.5-100t55-81.5T157 20t99-20q54 0 100.5 20t81 55 54.5 81.5 20 99.5q0 54-20 100.5t-54.5 81T356 492t-100 20q-54 0-100.5-20t-81-55T20 355.5 0 256zm256 224q47 0 88-17.5t71-48 47.5-71.5 17.5-87q0-47-17.5-87.5t-48-71-71-48T256 32q-46 0-87 18T97.5 98.5t-48 71T32 256q0 47 17.5 88t48 71 71.5 47.5 87 17.5zm-64-112h33V240h-32v-31h95v159h32v33H192v-33zm64-256q13 0 22 9 10 9 10 24 0 13-10 22-9 9-22 9-14 0-23-8.5t-9-22.5 8.5-23.5T256 112z";
  _exports.pathData = pathData;
  const ltr = true;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_MESSAGE_INFORMATION;
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
  var _default = "SAP-icons-v4/message-information";
  _exports.default = _default;
});
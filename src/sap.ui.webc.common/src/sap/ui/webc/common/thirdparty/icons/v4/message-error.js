sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "message-error";
  const pathData = "M256 0q53 0 100 20t81.5 55 54.5 81.5 20 99.5-20 100-54.5 81.5T356 492t-100 20-99.5-20T75 437.5 20 356 0 256t20-99.5T75 75t81.5-55T256 0zm0 480q46 0 87-17.5t71.5-48 48-71T480 256q0-46-17.5-87t-48-71.5-71.5-48T256 32t-87 17.5-71.5 48-48 71.5T32 256q0 47 17.5 87.5t48 71 71.5 48 87 17.5zm126-320q9-9 0-17l-16-17q-4-4-9-4t-9 4l-89 89q-2 2-4 2-3 0-5-2l-88-89q-4-4-9-4t-9 4l-16 17q-8 8 0 17l88 89q5 4 0 9l-88 89q-8 8 0 17l16 17q8 4 9 4 3 0 9-4l88-89q1-2 5-2 3 0 4 2l89 89q8 4 9 4t9-4l16-17q9-9 0-17l-89-89q-4-6 1-9z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_MESSAGE_ERROR;
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
  var _default = "SAP-icons-v4/message-error";
  _exports.default = _default;
});
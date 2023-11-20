sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "iphone-2";
  const pathData = "M0 346V166q0-29 22.5-49.5T77 96h358q32 0 54.5 20.5T512 166v180q0 29-22.5 49.5T435 416H77q-32 0-54.5-20.5T0 346zm461-180q0-8-7.5-13.5T435 147H77q-11 0-18.5 5.5T51 166v180q0 8 7.5 13.5T77 365h358q11 0 18.5-5.5T461 346V166z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_IPHONE;
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
  var _default = "SAP-icons-v5/iphone-2";
  _exports.default = _default;
});
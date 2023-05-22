sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons", "../generated/i18n/i18n-defaults"], function (_exports, _Icons, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "delete";
  const pathData = "M480 96v33h-32l-32 351q0 32-32 32H128q-32 0-32-32L64 129H32V96h448zM128 480h256l32-351H96zM32 64V32h145l1-5 6-11 14.5-11L224 0h65q15 0 29.5 7.5T336 32h144v32H32zm206 352V191h34v225h-34zm71-2l20-224 33 3-20 224zM150 193l31-3 20 224-31 3z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = _i18nDefaults.ICON_DELETE;
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
  var _default = "SAP-icons-v4/delete";
  _exports.default = _default;
});
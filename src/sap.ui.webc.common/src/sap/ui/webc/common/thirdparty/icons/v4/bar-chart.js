sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "bar-chart";
  const pathData = "M424 32h48q8 0 8 8v432q0 8-8 8h-48q-8 0-8-8V40q0-8 8-8zM168 160h48q8 0 8 8v304q0 8-8 8h-48q-8 0-8-8V168q0-8 8-8zm120 72q0-8 8-8h48q8 0 8 8v240q0 8-8 8h-48q-8 0-8-8V232zM32 472V360q0-8 8-8h48q8 0 8 8v112q0 8-8 8H40q-8 0-8-8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/bar-chart";
  _exports.default = _default;
});
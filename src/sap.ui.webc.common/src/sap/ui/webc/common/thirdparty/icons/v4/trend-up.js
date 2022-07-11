sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "trend-up";
  const pathData = "M447 289v3q0 12-8 20t-20 8h-6q-12 0-20.5-9t-8.5-23l1-147-263 263q-9 9-22.5 9T77 404q-10-10-10-22l.5-7 9.5-16L340 96l-148 1q-13 0-22.5-9.5T160 65q0-14 9.5-23.5T193 32h223q13 0 22.5 9.5T448 64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "trend-up";
  _exports.default = _default;
});
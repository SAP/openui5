sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow";
  const pathData = "M447 289q1 14-8 23t-23 8q-14 1-23-8.5t-9-23.5l1-147-263 263q-9 9-22 9-14 0-23-9-10-10-9.5-23t9.5-22L340 96l-148 1q-13 0-22.5-9.5T160 65q0-14 9.5-23.5T193 32h223q13 0 22.5 9.5T448 64z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v2";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v2/arrow";
  _exports.default = _default;
});
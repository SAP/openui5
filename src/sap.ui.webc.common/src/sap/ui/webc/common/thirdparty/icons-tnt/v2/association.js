sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "association";
  const pathData = "M424 64H303q-16 0-16-16t16-16h160q7 0 12 4.5t5 11.5v160q0 7-5 11.5t-12 4.5q-6 0-10.5-4.5T448 208V86L59 475q-5 5-12 5-6 0-11-5t-5-11 5-11z";
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
  var _default = "tnt-v2/association";
  _exports.default = _default;
});
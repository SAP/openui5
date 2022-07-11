sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "circuit-breaker";
  const pathData = "M383.5 85q0-15-10.5-25t-25.5-10h-71v88l58 101q4 7 2.5 15.5t-9.5 12.5q-2 1-4.5 2t-5.5 1q-12 0-18-10l-61-106q-2-4-2-12V50h-72q-15 0-25 10t-10 25v324q0 15 10 25t25 10h72V341q0-8 6-14t14-6 14 6 6 14v103h71q15 0 25.5-10t10.5-25V85zm-36-76q32 0 54 22t22 54v324q0 32-22 54t-54 22h-183q-32 0-54-22t-22-54V85q0-32 22-54t54-22h183z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "circuit-breaker";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "letter";
  const pathData = "M460.5 64q21 0 36 15t15 36v256q0 21-15 36t-36 15h-408q-22 0-37-15t-15-36V115q0-21 15-36t37-15h408zm0 51h-408v256h408V115zm-332 128q-25 0-25-26 0-25 25-25h128q11 0 18.5 7t7.5 18q0 12-7.5 19t-18.5 7h-128zm256-26q-26 0-26-25v-26q0-25 26-25h25q26 0 26 25v26q0 25-26 25h-25zm-256 103q-11 0-18-7.5t-7-18.5q0-25 25-25h77q25 0 25 25 0 11-7 18.5t-18 7.5h-77z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "letter";
  _exports.default = _default;
});
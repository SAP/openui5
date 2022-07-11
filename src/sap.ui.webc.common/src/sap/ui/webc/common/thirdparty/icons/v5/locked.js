sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "locked";
  const pathData = "M384 204q33 0 55 22.5t22 54.5v153q0 33-22 55t-55 22H129q-33 0-55-22t-22-55V281q0-32 22-54.5t55-22.5v-76q0-27 10-50.5T166 37t40-27 50-10 50.5 10T347 37t27 40.5 10 50.5v76zm-204 0h153v-76q0-33-22-55t-55-22q-32 0-54 22t-22 55v76zm230 77q0-11-7.5-18t-18.5-7H129q-26 0-26 25v153q0 26 26 26h255q11 0 18.5-7t7.5-19V281zm-154 26q22 0 36.5 14.5T307 358q0 21-14.5 36T256 409q-21 0-36-15t-15-36q0-22 15-36.5t36-14.5z";
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
  var _default = "locked";
  _exports.default = _default;
});
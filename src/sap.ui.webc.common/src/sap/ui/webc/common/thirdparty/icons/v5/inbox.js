sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "inbox";
  const pathData = "M410 52q32 0 54 22t22 55v306q0 33-22 55t-54 22H103q-32 0-54.5-22T26 435V129q0-33 22.5-55T103 52q11 0 18.5 7t7.5 18q0 12-7.5 19t-18.5 7q-25 0-25 26v153h102q25 0 25 25 0 22 15 37t36 15q22 0 37-15t15-37q0-25 25-25h102V129q0-26-25-26-26 0-26-26 0-25 26-25zm0 409q25 0 25-26V333h-79q-10 32-36.5 54.5T256 410q-36 0-63.5-22.5T157 333H78v102q0 26 25 26h307zM231 169l-1-143q0-11 7.5-18T256 1t18.5 7 7.5 18v143l33-33q8-8 18-8t18 8 8 18-8 18l-77 77q-8 8-17.5 8t-17.5-8l-77-77q-8-8-8-18t8-18 18-8 18 8z";
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
  var _default = "inbox";
  _exports.default = _default;
});
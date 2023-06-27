sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "answered";
  const pathData = "M137 254h192c13 0 22-10 22-23V88c0-14-9-24-22-24H89c-13 0-23 10-23 24v229l55-55c5-6 9-8 16-8zM400 88v143c0 40-31 71-71 71H147l-89 88c-7 7-16 10-25 4-10-5-15-12-15-21V88c0-41 31-73 71-73h240c40 0 71 32 71 73zm71 71c14 0 24 9 24 24v286c0 10-4 16-14 22-9 5-20 1-26-6l-89-88H185c-14 0-24-9-24-24s10-23 24-23h191c6 0 12 1 17 7l55 55V183c0-15 8-24 23-24z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v2";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v2/answered";
  _exports.default = _default;
});
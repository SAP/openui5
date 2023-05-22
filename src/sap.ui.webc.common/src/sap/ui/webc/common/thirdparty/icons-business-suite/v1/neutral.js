sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "neutral";
  const pathData = "M74.5 44h363c40 0 73 33 73 72v291c0 41-33 73-73 73h-363c-40 0-73-32-73-73V116c0-39 33-72 73-72zm400 363V116c0-19-16-35-37-35h-363c-23 0-36 19-36 35v291c0 20 16 37 36 37h363c19 0 37-16 37-37z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/neutral";
  _exports.default = _default;
});
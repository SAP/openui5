sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "side-panel-left-layout";
  const pathData = "M16.5 405V75c0-41 32-74 72-74h335c40 0 72 33 72 74v330c0 41-32 75-72 75h-335c-40 0-72-34-72-75zm431 0V75c0-15-11-26-24-26h-239v383h239c13 0 24-12 24-27zm-383 0c0 15 11 27 24 27h48V49h-48c-13 0-24 11-24 26v330z";
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
  var _default = "business-suite-v2/side-panel-left-layout";
  _exports.default = _default;
});
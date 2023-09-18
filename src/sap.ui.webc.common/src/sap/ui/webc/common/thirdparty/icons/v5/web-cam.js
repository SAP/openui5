sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "web-cam";
  const pathData = "M383 478q1 3 1 8 0 11-7.5 18.5T358 512H154q-11 0-18.5-7.5T128 486q0-5 1-8l49-145q-44-21-71-63t-27-94q0-36 14-68t38-56 56-38 68-14 68 14 56 38 38 56 14 68q0 52-27 94t-71 63zM131 176q0 25 10 48t27 40 40 27 48 10q26 0 48.5-10t39.5-27 27-40 10-48q0-26-10-48.5T344 88t-39.5-27T256 51q-25 0-48 10t-40 27-27 39.5-10 48.5zm205 0q0 34-23 57t-57 23h-4q-33 0-54.5-24T176 176t21.5-56T252 96h4q34 0 57 23t23 57zm-13 285l-37-112q-15 3-30 3t-30-3l-37 112h134z";
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
  var _default = "SAP-icons-v5/web-cam";
  _exports.default = _default;
});
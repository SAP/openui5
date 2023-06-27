sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "unsaved-changes";
  const pathData = "M17 241C17 110 125 2 256 2s239 108 239 239-108 239-239 239S17 372 17 241zm48 0c0 105 86 191 191 191s191-86 191-191S361 50 256 50 65 136 65 241zm99-97c0-27 20-48 47-48 26 0 48 21 48 48 0 26-22 48-48 48-27 0-47-22-47-48zm252 106l-12 12c-9 10-24 10-33 0l-19-18c-9-10-9-24 0-34l12-12c9-9 24-9 33 0l19 19c10 9 10 24 0 33zm-156-33l3 15c0 4 1 12-3 21-8 17-24 21-27 21h-96c-12 0-21-6-24-18-3-10 3-22 12-27l40-19c10-5 23-6 32-6h26c13 0 28 1 37 13zm-25 174c-10 0-12-4-12-12l1-31c0-7 1-11 7-16l80-80c5-6 10-7 17-7s11 1 16 7l19 18c9 10 9 24 0 34l-80 80c-6 5-10 7-16 7h-32z";
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
  var _default = "business-suite-v2/unsaved-changes";
  _exports.default = _default;
});
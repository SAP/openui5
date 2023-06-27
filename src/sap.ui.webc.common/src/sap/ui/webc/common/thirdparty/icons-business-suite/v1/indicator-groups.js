sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "indicator-groups";
  const pathData = "M7.5 96l96-96h288v118h-32V32h-224v96h-96v352h352v32H7.5V96zm174 253c0-107 74-172 162-172 25 0 86 13 101 34l-30 23c-19-13-50-20-71-20-76 0-125 51-125 131 0 12 3 27 3 42 0 9-8 17-19 17-20 0-21-34-21-55zm137-22l145-99-94 149c-7 7-15 10-24 10-20 0-38-18-38-37 0-8 4-16 11-23zm139-41l23-32c18 18 24 64 24 89v4c0 16-1 57-22 57-9 0-18-6-18-17 0-15 3-30 3-42 0-27-3-46-10-59zm-114 82c11 0 17-10 17-17 0-11-6-17-17-17s-17 6-17 17c0 7 6 17 17 17z";
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
  var _default = "business-suite-v1/indicator-groups";
  _exports.default = _default;
});
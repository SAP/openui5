sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "underline";
  const pathData = "M448 448c19 0 32 13 32 32s-13 32-32 32H65c-19 0-32-13-32-32s13-32 32-32h383zm-192-64c-89 0-159-70-159-159V64c0-19 12-32 32-32 19 0 32 13 32 32v161c0 54 41 96 95 96 55 0 96-42 96-96V64c0-19 13-32 32-32s32 13 32 32v161c0 89-70 159-160 159z";
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
  var _default = "business-suite-v1/underline";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "addresses";
  const pathData = "M32 256l96-96 96 96v192H32V256zm256 192V256l96-96 96 96v192H288zM0 240v-42L128 64l128 128L384 64l64 61V64h32v91l32 30v55L384 121 256 240 128 121zm320 29v147h32v-96h64v96h32V269l-64-64zM96 416v-96h64v96h32V269l-64-64-64 64v147h32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/addresses";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "add-document";
  const pathData = "M16 128L144 0h224q14 0 23 9t9 23v192h-32V32H176v96q0 13-9.5 22.5T144 160H48v320h192v32H49q-14 0-23.5-9.5T16 480V128zm352 256v-96h32v96h96v32h-96v96h-32v-96h-96v-32h96z";
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
  var _default = "SAP-icons-v4/add-document";
  _exports.default = _default;
});
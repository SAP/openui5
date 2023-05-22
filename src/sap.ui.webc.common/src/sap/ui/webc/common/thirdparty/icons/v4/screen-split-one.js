sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "screen-split-one";
  const pathData = "M32 64q0-14 9-23t23-9h384q14 0 23 9t9 23v384q0 13-9 22.5t-23 9.5H64q-14 0-23-9.5T32 448V64zm416 384V64H192v384h256zm-288 0V64H64v384h96z";
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
  var _default = "SAP-icons-v4/screen-split-one";
  _exports.default = _default;
});
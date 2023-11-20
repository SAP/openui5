sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "screen-split-three";
  const pathData = "M64 32h384q13 0 22.5 9t9.5 23v384q0 13-9.5 22.5T448 480H64q-14 0-23-9.5T32 448V64q0-14 9-23t23-9zm128 416h128V64H192v384zm160 0h96V64h-96v384zm-192 0V64H64v384h96z";
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
  var _default = "SAP-icons-v4/screen-split-three";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "accidental-leave";
  const pathData = "M32 63q0-14 9.5-22.5T64 32h384q14 0 23 8.5t9 22.5v385q0 13-9 23t-23 10H64q-13 0-22.5-10T32 448V63zm32 385h383V64H64v384zm127-256V96h129v96h96v128h-96v96H191v-96H96V192h95zm33 32h-96v64h96v96h64v-96h95v-64h-95v-96h-64v96z";
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
  var _default = "SAP-icons-v4/accidental-leave";
  _exports.default = _default;
});
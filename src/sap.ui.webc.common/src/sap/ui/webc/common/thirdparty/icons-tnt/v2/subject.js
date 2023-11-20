sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "subject";
  const pathData = "M64 32h384q12 0 22 9t10 23v384q0 14-9 23t-23 9H64q-14 0-23-9.5T32 448V64q0-13 9.5-22.5T64 32zm0 128v288h384V160H64zm168-88v48h48V72h-48zm152 48V72h-48v48h48zM128 72v48h48V72h-48z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "tnt-v2";
  const packageName = "@ui5/webcomponents-icons-tnt";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "tnt-v2/subject";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "tri-state";
  const pathData = "M144 352h224V128H144v224zM416 0q35 0 57.5 22.5T496 80v320q0 34-22.5 57T416 480H96q-34 0-57-23t-23-57V80q0-35 23-57.5T96 0h320zm27 80q0-12-7.5-19.5T416 53H96q-12 0-19.5 7.5T69 80v320q0 12 7.5 19.5T96 427h320q12 0 19.5-7.5T443 400V80z";
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
  var _default = "tri-state";
  _exports.default = _default;
});
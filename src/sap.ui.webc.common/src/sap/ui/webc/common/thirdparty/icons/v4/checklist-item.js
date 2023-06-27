sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "checklist-item";
  const pathData = "M439 0q31 0 52 21.5T512 73v150q0 33-25 55L280 503q-9 9-24 9-14 0-23-9L26 278Q0 255 0 223V73q0-30 21.5-51.5T73 0h366zm36 73q0-15-10-25.5T439 37H73q-15 0-25.5 10.5T37 73v150q0 16 13 27l206 225 207-225q12-10 12-27V73z";
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
  var _default = "SAP-icons-v4/checklist-item";
  _exports.default = _default;
});
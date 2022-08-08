sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "Chart-Tree-Map";
  const pathData = "M435 20q32 0 54.5 22T512 96v307q0 32-22.5 54T435 479H77q-32 0-54-22T1 403V96q0-32 22-54t54-22h358zM205 428h102V275H205v153zm153-102h103v-51H358v51zM461 96q0-11-7.5-18T435 71H205v153h256V96zM52 403q0 25 25 25h77V71H77q-25 0-25 25v307zm383 25q11 0 18.5-7t7.5-18v-26H358v51h77z";
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
  var _default = "Chart-Tree-Map";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "table-row";
  const pathData = "M419 1q32 0 54.5 22.5T496 78v327q0 32-22.5 54T419 481H93q-32 0-54-22t-22-54V78q0-32 22-54.5T93 1h326zm25 77q0-11-7-18.5T419 52h-66v103h91V78zm-142 77V52h-92v103h92zm-92 173v102h92V328h-92zM93 52q-11 0-18 7.5T68 78v77h91V52H93zM68 405q0 25 25 25h66V328H68v77zm351 25q25 0 25-25v-77h-91v102h66z";
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
  var _default = "table-row";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "table-column";
  const pathData = "M420 0q32 0 54 22.5T496 77v326q0 32-22 54.5T420 480H93q-32 0-54.5-22.5T16 403V77q0-32 22.5-54.5T93 0h327zM68 286h102v-91H68v91zm275 0h102v-91H343v91zM445 77q0-11-7-18.5T420 51h-77v92h102V77zM93 51q-11 0-18 7.5T68 77v66h102V51H93zM68 403q0 11 7 18.5t18 7.5h77v-92H68v66zm352 26q11 0 18-7.5t7-18.5v-66H343v92h77z";
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
  var _default = "table-column";
  _exports.default = _default;
});
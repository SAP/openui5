sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "shelf";
  const pathData = "M467 0q14 0 22 8t8 22v451q0 14-8 22t-22 8-22-8-8-22v-60H76v60q0 14-8 22t-22 8-22-8-8-22V30q0-12 9-21t21-9h421zM76 60v120h361V60H76zm361 300V240H76v120h361zM196 150q-14 0-22-8t-8-22 8-22 22-8h120q14 0 22 8t8 22-8 22-22 8H196zm120 120q14 0 22 8t8 22-8 22-22 8H196q-14 0-22-8t-8-22 8-22 22-8h120z";
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
  var _default = "shelf";
  _exports.default = _default;
});
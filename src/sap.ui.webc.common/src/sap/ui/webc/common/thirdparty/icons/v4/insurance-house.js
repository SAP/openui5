sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "insurance-house";
  const pathData = "M0 128L128 0h224q14 0 23 9.5t9 22.5v145h-32V32H160v96q0 14-9.5 23t-22.5 9H32v320h192v32H33q-14 0-23.5-9T0 480V128zm352 128l160 160h-64v96H256v-96h-64zm-64 128v96h32v-64h64v64h32v-96q-8-9-16-17l-16-16-21.5-21.5-8.5-9.5h-4l-10 10q-14 14-26.5 27T288 384z";
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
  var _default = "SAP-icons-v4/insurance-house";
  _exports.default = _default;
});
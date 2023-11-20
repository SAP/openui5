sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "application";
  const pathData = "M32 73q0-17 11.5-29T72 32h367q17 0 29 12t12 29v366q0 17-12 29t-29 12H72q-17 0-28.5-12T32 439V73zm32 87v279q0 9 8 9h367q9 0 9-9V160H64zm256 32v160H96V192h224zm128-64V73q0-9-9-9H72q-8 0-8 9v55h384zM128 320h160v-96H128v96zM368 80h32q16 0 16 16t-16 16h-32q-16 0-16-16t16-16z";
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
  var _default = "tnt-v2/application";
  _exports.default = _default;
});
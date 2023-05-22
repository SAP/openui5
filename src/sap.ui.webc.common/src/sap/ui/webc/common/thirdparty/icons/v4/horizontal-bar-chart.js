sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "horizontal-bar-chart";
  const pathData = "M96 360q0-8 8-8h368q8 0 8 8v48q0 8-8 8H104q-8 0-8-8v-48zm0-128q0-8 8-8h240q8 0 8 8v48q0 8-8 8H104q-8 0-8-8v-48zM64 32v448H32V32h32zm32 72q0-8 8-8h176q8 0 8 8v48q0 8-8 8H104q-8 0-8-8v-48z";
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
  var _default = "SAP-icons-v4/horizontal-bar-chart";
  _exports.default = _default;
});
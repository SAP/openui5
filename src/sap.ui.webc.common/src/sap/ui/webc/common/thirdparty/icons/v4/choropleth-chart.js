sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "choropleth-chart";
  const pathData = "M32.5 252V32h191v56l-64 104v37l-37-37h-53v49l154 47v55l-63 137-34-31-15-95-46-87zm264-28h183v63l-32 65-64 96-50 32V361l-74-74zm1-28v-55l36-32h37l73-77h36v146l-36-37v37h-19l-18-37h-36l-37 55h-36zm54-164v53h-37z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v4/choropleth-chart";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "content-enricher";
  const pathData = "M256 352v96h224V128H256v64h-32v-64q0-14 9-23t23-9h224q14 0 23 9t9 23v320q0 14-9 23t-23 9H256q-14 0-23-9t-9-23v-96h32zM0 224q0-14 9-23t23-9h96q14 0 23 9t9 23v96q0 14-9 23t-23 9H32q-14 0-23-9t-9-23v-96zm192 48q0-16 16-16h124l-40-40q-5-5-5-11 0-16 16-16 7 0 12 4l67 68q4 6 4 11 0 7-4 11l-67 68q-5 4-12 4-16 0-16-15 0-7 5-12l40-40H208q-16 0-16-16z";
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
  var _default = "tnt-v2/content-enricher";
  _exports.default = _default;
});
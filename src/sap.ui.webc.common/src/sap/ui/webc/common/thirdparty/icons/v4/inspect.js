sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "inspect";
  const pathData = "M480 0q14 0 23 9 9 10 9 23v320q0 14-9 23t-23 9H160q-14 0-23-9t-9-23V32q0-13 9-23 9-9 23-9h320zm0 32H160v320h320V32zm-96 64q14 0 23 9t9 23v143q0 17-16 18-5-2-10-6.5t-5-10.5V152L254 284q-5 5-12 5t-12-4q-5-7-5-13t5-11l133-132H240q-5 0-9.5-5t-6.5-10q0-17 16-18h144zm-32 352h32v32q0 14-9 23t-23 9H32q-14 0-23-9t-9-23V160q0-13 9-23 9-9 23-9h32v32H32v320h320v-32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "inspect";
  _exports.default = _default;
});
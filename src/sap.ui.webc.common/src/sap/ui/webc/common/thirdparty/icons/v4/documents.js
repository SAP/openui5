sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "documents";
  const pathData = "M448 128H256v64q0 14-9 23-10 9-24 9h-63v256h288V128zM64 416H32V32q0-14 10-23 9-9 22-9h288v32H64v384zM448 96q13 0 23 9 9 9 9 23v352q0 14-9 23t-23 9H160q-14 0-23-9t-9-23V192l96-96h224zm-64 256H224v-32h160v32zm0 64H224v-32h160v32z";
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
  var _default = "SAP-icons-v4/documents";
  _exports.default = _default;
});
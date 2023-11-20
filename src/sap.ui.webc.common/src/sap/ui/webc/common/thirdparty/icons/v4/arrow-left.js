sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-left";
  const pathData = "M169 74q9-10 22-10t22 10q10 9 10 22t-10 23L108 224h372q13 0 22.5 9.5T512 256q0 14-9.5 23t-22.5 9H108l106 106q9 9 9 22.5t-9 22.5q-10 10-23 10t-23-10L9 279q-9-9-9-22.5T9 234z";
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
  var _default = "SAP-icons-v4/arrow-left";
  _exports.default = _default;
});
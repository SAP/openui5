sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-bottom";
  const pathData = "M73 343q-10-10-10-22.5T73 299q9-10 22-10t23 10l105 105V32q0-13 9.5-22.5T255 0q14 0 23 9.5t9 22.5v372l106-106q9-9 22.5-9t22.5 9q10 10 10 23t-10 23L278 503q-9 9-22.5 9t-22.5-9z";
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
  var _default = "SAP-icons-v4/arrow-bottom";
  _exports.default = _default;
});
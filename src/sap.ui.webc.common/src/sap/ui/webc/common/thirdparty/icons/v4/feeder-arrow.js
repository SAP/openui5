sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "feeder-arrow";
  const pathData = "M296 268q6-6 6-12t-6-11L139 86q-10-10-10-23t10-22q9-10 22-10t23 10l191 193q9 9 9 22.5t-9 22.5L183 471q-10 10-23 10t-23-10q-9-9-9-22.5t9-22.5z";
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
  var _default = "feeder-arrow";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-top";
  const pathData = "M438 169q10 9 10 22t-10 22q-9 10-22 10t-23-10L288 108v372q0 13-9.5 22.5T256 512q-14 0-23-9.5t-9-22.5V108L118 214q-9 9-22.5 9T73 214q-10-10-10-23t10-23L233 9q9-9 22.5-9T278 9z";
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
  var _default = "SAP-icons-v4/arrow-top";
  _exports.default = _default;
});
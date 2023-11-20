sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "arrow-top";
  const pathData = "M409 181q7 7 7 17 0 11-7.5 18.5T390 224q-10 0-18-8l-90-95v333q0 11-7.5 18.5T256 480t-18.5-7.5T230 454V121l-90 95q-8 8-18 8-11 0-18.5-7.5T96 198q0-10 7-17L238 40q6-8 18-8 11 0 19 8z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v5/arrow-top";
  _exports.default = _default;
});
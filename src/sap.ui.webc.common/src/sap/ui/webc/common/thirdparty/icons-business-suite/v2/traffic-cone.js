sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "traffic-cone";
  const pathData = "M275 17l51 126H180l49-125c8-22 36-23 46-1zm76 187l43 104H118l39-104h194zm145 252c0 13-10 24-23 24H40c-13 0-24-11-24-24 0-14 11-23 24-23h29l24-65h325l26 63v2h29c13 0 23 9 23 23z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v2";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v2/traffic-cone";
  _exports.default = _default;
});
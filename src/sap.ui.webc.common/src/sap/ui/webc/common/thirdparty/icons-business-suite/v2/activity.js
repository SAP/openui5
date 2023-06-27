sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "activity";
  const pathData = "M55.5 175v151h401V175h-401zm0-50h401c28 0 51 22 51 50v151c0 27-23 50-51 50h-401c-28 0-51-23-51-50V175c0-28 23-50 51-50zm377 175h-353V200h353v100z";
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
  var _default = "business-suite-v2/activity";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "descending-stacked-bars";
  const pathData = "M185.5 0v146h-109V0h109zm37 245V99h109v146h-109zm255 47h-109V146h109v146zm-292-109v146h-109V183h109zm37 255V292h109v146h-109zm146 0V329h109v109h-109zm-183-72v72h-109v-72h109zM2.5 480h508v32H2.5v-32z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "descending-stacked-bars";
  _exports.default = _default;
});
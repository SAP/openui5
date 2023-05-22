sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "descending-stacked-bars";
  const pathData = "M76.5 0h109v146h-109V0zm255 245h-109V99h109v146zm146-99v146h-109V146h109zm-401 37h109v146h-109V183zm255 255h-109V292h109v146zm146 0h-109V329h109v109zm-401-72h109v72h-109v-72zm-74 146v-32h508v32H2.5z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "business-suite-v1";
  const packageName = "@ui5/webcomponents-icons-business-suite";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "business-suite-v1/descending-stacked-bars";
  _exports.default = _default;
});
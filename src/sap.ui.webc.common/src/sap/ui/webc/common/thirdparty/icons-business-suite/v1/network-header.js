sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "network-header";
  const pathData = "M273 219h-35v34h35v-34zM86 29v159h339V29H86zm307 32v32H116V61h277zm0 63v32H116v-32h277zM66 285v164h379V285H66zm347 31v101H98V316h315zM35 480V253h172v-34H55V-3h402v222H305v34h172v227H35z";
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
  var _default = "business-suite-v1/network-header";
  _exports.default = _default;
});
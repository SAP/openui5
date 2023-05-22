sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "stripes-pattern";
  const pathData = "M466 1L1 466V364L365 1h101zM1 173L174 1h101L1 275V173zm428 338l82-83v51c0 17-14 32-31 32h-51zm82-173L339 511H237l274-274v101zm0-191L148 511H46L511 46v101zM84 1L1 83V33C1 15 16 1 33 1h51z";
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
  var _default = "business-suite-v1/stripes-pattern";
  _exports.default = _default;
});
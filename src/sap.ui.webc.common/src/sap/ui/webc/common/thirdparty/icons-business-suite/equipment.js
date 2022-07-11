sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "equipment";
  const pathData = "M51 326h57v26h69l32-28h22v-47h-22v-69h-31V36q0-8 8-15t21-12 30.5-8T274-2t36.5 3T341 9t21 12 8 15v172h-31v69h-22v47h22l32 28h68v-26h57v182h-57v-26h-68l-32 28H209l-32-28h-69v26H51V326zm238-161V73h-30v92h30zm24 0h29V73h-29v92zm-80 0V73h-29v92h29zm206 317h34V352h-34v130zm-364 0h33V352H75v130z";
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
  var _default = "equipment";
  _exports.default = _default;
});
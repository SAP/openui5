sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "minimize";
  const pathData = "M406 32q32 0 53 21.5t21 53.5v298q0 32-21 53.5T406 480H107q-32 0-53.5-21.5T32 405V107q0-32 21.5-53.5T107 32h299zm24 75q0-11-6.5-18T406 82H107q-25 0-25 25v298q0 25 25 25h299q11 0 17.5-7t6.5-18V107zm-99 213q25 0 25 25t-25 25H182q-25 0-25-25t25-25h149z";
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
  var _default = "SAP-icons-v5/minimize";
  _exports.default = _default;
});
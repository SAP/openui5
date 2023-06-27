sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "screen-split-two";
  const pathData = "M435 32q32 0 54.5 22t22.5 54v295q0 32-22.5 54.5T435 480H77q-32 0-54-22.5T1 403V108q0-32 22-54t54-22h358zM52 403q0 11 7 18.5t18 7.5h154V83H77q-25 0-25 25v295zm409-295q0-11-7.5-18T435 83H282v346h153q11 0 18.5-7.5T461 403V108z";
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
  var _default = "SAP-icons-v5/screen-split-two";
  _exports.default = _default;
});
sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "video";
  const pathData = "M0 352V160q0-26 19-45t45-19h224q26 0 45 19t19 45v29L464 69q8-5 16-5 13 0 22.5 9t9.5 23v320q0 14-9.5 23t-22.5 9q-9 0-16-4L352 324v28q0 27-19 45.5T288 416H64q-26 0-45-18.5T0 352zm64 32h224q14 0 23-9t9-23V160q0-13-9-22.5t-23-9.5H64q-14 0-23 9.5T32 160v192q0 14 9 23t23 9zm288-154v53l128 133V96z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons-v4";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "SAP-icons-v4/video";
  _exports.default = _default;
});
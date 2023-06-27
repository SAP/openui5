sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "media-pause";
  const pathData = "M160 64q0-14 9.5-23t22.5-9q14 0 23 9t9 23v385q0 13-9 22.5t-23 9.5q-13 0-22.5-9.5T160 449V64zm128 0q0-14 9.5-23t22.5-9q14 0 23 9t9 23v385q0 13-9 22.5t-23 9.5q-13 0-22.5-9.5T288 449V64z";
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
  var _default = "SAP-icons-v4/media-pause";
  _exports.default = _default;
});
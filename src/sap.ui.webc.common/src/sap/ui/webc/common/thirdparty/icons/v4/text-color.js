sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "text-color";
  const pathData = "M108 352L224 32h64l115 320h-49l-34-96H192l-33 96h-51zm-28 64h352q7 0 11.5 5t4.5 11v32q0 16-16 16H80q-6 0-11-4.5T64 464v-32q0-6 5-11t11-5zm230-192L256 64l-55 160h109z";
  _exports.pathData = pathData;
  const ltr = true;
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
  var _default = "SAP-icons-v4/text-color";
  _exports.default = _default;
});